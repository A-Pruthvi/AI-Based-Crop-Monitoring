"""
Smart Agriculture – Universal Crop Disease Detection System
Image Preprocessing Module

Responsibilities
----------------
1. validate_image()     — check format, size, readability
2. preprocess_image()   — load → RGB → resize 224×224 → normalise → batch tensor
3. generate_gradcam()   — Grad-CAM heatmap overlay (disease localisation)

All public functions return clean errors via ValueError so app.py can
convert them into HTTP 400 responses without leaking tracebacks.
"""

import io
import os
import base64

import numpy as np
from PIL import Image

# OpenCV is optional — used only for Grad-CAM overlay
try:
    import cv2
    _CV2 = True
except ImportError:
    _CV2 = False

# ── Constants ──────────────────────────────────────────────────────────────
IMAGE_SIZE          = (224, 224)        # VGG16 / MobileNet standard input
ALLOWED_FORMATS     = {'JPEG', 'PNG', 'JPG', 'WEBP', 'BMP'}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB hard cap


# ══════════════════════════════════════════════════════════════════════════════
# 1. VALIDATION
# ══════════════════════════════════════════════════════════════════════════════
def validate_image(image_file) -> tuple:
    """
    Validate an uploaded image file object.

    Parameters
    ----------
    image_file : werkzeug FileStorage or any file-like object with .seek/.tell

    Returns
    -------
    (True, None)              on success
    (False, error_message)    on failure
    """
    # ── Size check ────────────────────────────────────────────────────────
    image_file.seek(0, 2)
    size_bytes = image_file.tell()
    image_file.seek(0)

    if size_bytes == 0:
        return False, "Uploaded file is empty."
    if size_bytes > MAX_FILE_SIZE_BYTES:
        return False, f"File size {size_bytes // (1024*1024):.1f} MB exceeds 10 MB limit."

    # ── Format / readability check ────────────────────────────────────────
    try:
        img = Image.open(image_file)
        img.verify()            # detects truncated/corrupt files
        image_file.seek(0)

        fmt = (img.format or '').upper()
        if fmt not in ALLOWED_FORMATS:
            return False, f"Unsupported format '{fmt}'. Allowed: {', '.join(ALLOWED_FORMATS)}"

        return True, None

    except Exception as exc:
        return False, f"Cannot read image: {exc}"


# ══════════════════════════════════════════════════════════════════════════════
# 2. PREPROCESSING
# ══════════════════════════════════════════════════════════════════════════════
def preprocess_image(image_file) -> np.ndarray:
    """
    Convert an uploaded leaf image into a model-ready NumPy tensor.

    Pipeline
    --------
    raw bytes
      → PIL.Image.open()
      → convert to RGB          (handles RGBA, grayscale, palette modes)
      → resize to 224 × 224     (LANCZOS for quality)
      → pixel / 255.0            (normalise to [0, 1])
      → np.expand_dims axis=0    (add batch dimension)
      → shape (1, 224, 224, 3)   ← ready for model.predict()

    Parameters
    ----------
    image_file : file-like object (werkzeug FileStorage or BytesIO)

    Returns
    -------
    np.ndarray  shape (1, 224, 224, 3)  dtype float32
    """
    try:
        # Read bytes
        raw = image_file.read() if hasattr(image_file, 'read') else image_file
        if hasattr(image_file, 'seek'):
            image_file.seek(0)

        # Open with PIL
        img = Image.open(io.BytesIO(raw))

        # Ensure 3-channel RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize to model input size
        img = img.resize(IMAGE_SIZE, Image.Resampling.LANCZOS)

        # Convert to float32 NumPy array and normalise
        arr = np.array(img, dtype=np.float32) / 255.0   # shape (224, 224, 3)

        # Add batch dimension → (1, 224, 224, 3)
        arr = np.expand_dims(arr, axis=0)

        return arr

    except Exception as exc:
        raise ValueError(f"Image preprocessing failed: {exc}") from exc


def load_image_as_array(image_file) -> np.ndarray:
    """
    Same as preprocess_image() but also returns the original PIL Image
    for use by the Grad-CAM visualiser (needs the un-normalised image).

    Returns
    -------
    (preprocessed_tensor, original_pil_image)
    """
    raw = image_file.read() if hasattr(image_file, 'read') else image_file
    if hasattr(image_file, 'seek'):
        image_file.seek(0)

    img = Image.open(io.BytesIO(raw))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img = img.resize(IMAGE_SIZE, Image.Resampling.LANCZOS)

    arr = np.array(img, dtype=np.float32) / 255.0
    tensor = np.expand_dims(arr, axis=0)

    return tensor, img


# ══════════════════════════════════════════════════════════════════════════════
# 3. GRAD-CAM HEATMAP
# ══════════════════════════════════════════════════════════════════════════════
def generate_gradcam(model, img_tensor: np.ndarray,
                     class_index: int,
                     last_conv_layer_name: str = 'block5_conv3') -> str:
    """
    Produce a Grad-CAM heatmap and return its path (saved under uploads/).

    Grad-CAM algorithm (Selvaraju et al. 2017)
    -------------------------------------------
    1. Run a forward pass through the model.
    2. Record the output of the last convolutional layer (activation maps).
    3. Compute gradients of the predicted class score with respect to those maps.
    4. Average-pool the gradients → one scalar weight per feature map channel.
    5. Weighted sum of activation maps → raw heatmap.
    6. ReLU → retain only positive influence regions.
    7. Normalise, resize to 224×224, apply a colour map, blend with original.

    Parameters
    ----------
    model              : loaded tf.keras Model
    img_tensor         : preprocessed image  shape (1, 224, 224, 3)
    class_index        : integer index of the predicted disease class
    last_conv_layer_name : name of the last conv layer in VGG16
                          (default 'block5_conv3' for VGG16)

    Returns
    -------
    str  — absolute path of the saved heatmap PNG,
           or empty string '' if generation fails (non-fatal).
    """
    if not _CV2:
        return ''   # OpenCV not available; skip silently

    try:
        import tensorflow as tf

        # ── a. Build a sub-model that outputs (conv_feature_maps, final_pred) ──
        conv_layer   = model.get_layer(last_conv_layer_name)
        grad_model   = tf.keras.Model(
            inputs  = model.inputs,
            outputs = [conv_layer.output, model.output]
        )

        # ── b. Forward pass inside GradientTape ───────────────────────────────
        with tf.GradientTape() as tape:
            inputs        = tf.cast(img_tensor, tf.float32)
            conv_outputs, predictions = grad_model(inputs)
            loss          = predictions[:, class_index]

        # ── c. Gradients of class score w.r.t. conv feature maps ──────────────
        grads           = tape.gradient(loss, conv_outputs)          # (1,H,W,C)
        # Global average pool → one scalar weight per channel
        pooled_grads    = tf.reduce_mean(grads, axis=(0, 1, 2))     # (C,)

        # ── d. Weighted combination of activation maps ─────────────────────────
        conv_outputs    = conv_outputs[0]                            # (H, W, C)
        heatmap         = conv_outputs @ pooled_grads[..., tf.newaxis]  # (H,W,1)
        heatmap         = tf.squeeze(heatmap)                        # (H, W)

        # ── e. ReLU + normalise to [0, 1] ─────────────────────────────────────
        heatmap         = tf.maximum(heatmap, 0)
        heatmap         = heatmap / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap         = heatmap.numpy()

        # ── f. Resize heatmap to original image dimensions ────────────────────
        heatmap_resized = cv2.resize(heatmap, IMAGE_SIZE)            # (224, 224)

        # ── g. Apply colour map ───────────────────────────────────────────────
        heatmap_uint8   = np.uint8(255 * heatmap_resized)
        coloured        = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

        # ── h. Overlay on original image ──────────────────────────────────────
        original_bgr    = cv2.cvtColor(
            np.uint8(img_tensor[0] * 255), cv2.COLOR_RGB2BGR
        )
        superimposed    = cv2.addWeighted(original_bgr, 0.6, coloured, 0.4, 0)

        # ── i. Save ───────────────────────────────────────────────────────────
        os.makedirs('uploads', exist_ok=True)
        import time
        heatmap_path = os.path.join('uploads', f'gradcam_{int(time.time()*1000)}.png')
        cv2.imwrite(heatmap_path, superimposed)

        return heatmap_path

    except Exception:
        return ''   # Grad-CAM failure is non-fatal — return empty path

