"""
Image Preprocessing Utilities for Crop Disease Detection
"""

import numpy as np
from PIL import Image
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
import io
import base64


# Constants for image preprocessing
IMAGE_SIZE = (224, 224)  # Standard input size for CNN models
NORMALIZATION_FACTOR = 255.0


def preprocess_image(image_file):
    """
    Preprocess an uploaded image file for model prediction.
    
    Args:
        image_file: File object or bytes of the image
        
    Returns:
        numpy array: Preprocessed image ready for model input
    """
    try:
        # Read image from file
        if hasattr(image_file, 'read'):
            image_bytes = image_file.read()
            image_file.seek(0)  # Reset file pointer
        else:
            image_bytes = image_file
            
        # Open image with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize(IMAGE_SIZE, Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        image_array = np.array(image, dtype=np.float32)
        
        # Normalize pixel values to [0, 1]
        image_array = image_array / NORMALIZATION_FACTOR
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")


def preprocess_image_cv2(image_file):
    """
    Alternative preprocessing using OpenCV.
    
    Args:
        image_file: File object or bytes of the image
        
    Returns:
        numpy array: Preprocessed image ready for model input
    """
    try:
        # Read image bytes
        if hasattr(image_file, 'read'):
            image_bytes = image_file.read()
            image_file.seek(0)
        else:
            image_bytes = image_file
            
        # Decode image using OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        # Convert BGR to RGB (OpenCV uses BGR by default)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize to model input size
        image = cv2.resize(image, IMAGE_SIZE, interpolation=cv2.INTER_LANCZOS4)
        
        # Normalize
        image = image.astype(np.float32) / NORMALIZATION_FACTOR
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
        
    except Exception as e:
        raise ValueError(f"Error preprocessing image with CV2: {str(e)}")


def apply_augmentation(image_array):
    """
    Apply data augmentation for better prediction robustness.
    Returns multiple augmented versions of the image.
    
    Args:
        image_array: Preprocessed image array (without batch dimension)
        
    Returns:
        list: List of augmented image arrays
    """
    augmented_images = [image_array]  # Original image
    
    # Horizontal flip
    augmented_images.append(np.fliplr(image_array))
    
    # Slight rotation (simulate different camera angles)
    for angle in [-5, 5]:
        rotated = rotate_image(image_array, angle)
        augmented_images.append(rotated)
    
    return augmented_images


def rotate_image(image, angle):
    """
    Rotate image by given angle.
    
    Args:
        image: Input image array
        angle: Rotation angle in degrees
        
    Returns:
        Rotated image array
    """
    # Get image center
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    
    # Create rotation matrix
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    
    # Apply rotation
    rotated = cv2.warpAffine(image, rotation_matrix, (w, h))
    
    return rotated


def validate_image(image_file, max_size_mb=10):
    """
    Validate uploaded image file.
    
    Args:
        image_file: File object
        max_size_mb: Maximum allowed file size in MB
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check file size
    image_file.seek(0, 2)  # Seek to end
    size_bytes = image_file.tell()
    image_file.seek(0)  # Reset pointer
    
    max_size_bytes = max_size_mb * 1024 * 1024
    if size_bytes > max_size_bytes:
        return False, f"File size exceeds {max_size_mb}MB limit"
    
    # Check if it's a valid image
    try:
        image = Image.open(image_file)
        image.verify()
        image_file.seek(0)
        
        # Check image format
        allowed_formats = ['JPEG', 'PNG', 'JPG', 'WEBP']
        if image.format.upper() not in allowed_formats:
            return False, f"Invalid image format. Allowed: {', '.join(allowed_formats)}"
            
        return True, None
        
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"


def image_to_base64(image_file):
    """
    Convert image file to base64 string.
    
    Args:
        image_file: File object
        
    Returns:
        str: Base64 encoded image string
    """
    if hasattr(image_file, 'read'):
        image_bytes = image_file.read()
        image_file.seek(0)
    else:
        image_bytes = image_file
        
    return base64.b64encode(image_bytes).decode('utf-8')


def base64_to_image(base64_string):
    """
    Convert base64 string back to image.
    
    Args:
        base64_string: Base64 encoded image string
        
    Returns:
        PIL Image object
    """
    image_bytes = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(image_bytes))
