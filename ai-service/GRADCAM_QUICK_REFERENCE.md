# Grad-CAM Quick Reference

## One-Minute Setup

```python
from gradcam_visualizer import GradCAMVisualizer

# 1. Initialize
viz = GradCAMVisualizer("models_unified/best_model.h5")

# 2. Visualize single image
paths = viz.visualize("path/to/image.jpg", save_all=True)

# 3. Access results
print(f"Overlay: {paths['overlay']}")
print(f"Combined: {paths['combined']}")
```

## Command Line

```bash
# Run all tests
python test_gradcam.py --test all

# Test specific functionality
python test_gradcam.py --test basic
python test_gradcam.py --test batch
python test_gradcam.py --test stats
```

## API Endpoints

```bash
# Visualize single image
curl -X POST http://localhost:5000/api/gradcam/visualize \
  -H "Content-Type: application/json" \
  -d '{"image_path": "image.jpg", "save_all": true}'

# Batch process directory
curl -X POST http://localhost:5000/api/gradcam/batch-visualize \
  -H "Content-Type: application/json" \
  -d '{"image_dir": "uploads/", "save_all": true}'

# List all visualizations
curl -X GET http://localhost:5000/api/gradcam/list-visualizations

# Get visualizer info
curl -X GET http://localhost:5000/api/gradcam/info
```

## Python API Reference

### Initialize Visualizer
```python
viz = GradCAMVisualizer(
    model_path="models_unified/best_model.h5",
    heatmap_dir="heatmaps",
    image_size=512
)
```

### Single Image Visualization
```python
# Simple usage
paths = viz.visualize("image.jpg", save_all=True)

# With specific class and custom name
paths = viz.visualize(
    "image.jpg",
    output_name="my_test",
    pred_index=5,
    save_all=True
)
```

### Compute Grad-CAM
```python
heatmap, original_image, class_name = viz.compute_gradcam(
    "image.jpg",
    pred_index=None  # None = use top prediction
)
```

### Create Overlay
```python
import cv2

overlaid = viz.overlay_heatmap_on_image(
    heatmap=heatmap,
    original_image=original_image,
    alpha=0.5,
    colormap=cv2.COLORMAP_TURBO
)
```

### Batch Processing
```python
results = viz.batch_visualize(
    image_dir="uploads/",
    save_all=True
)

# results = {
#   "image1.jpg": {"heatmap_raw": "...", "overlay": "...", "combined": "..."},
#   "image2.jpg": {...}
# }
```

### Get Statistics
```python
stats = viz.get_heatmap_stats(heatmap)

print(f"Mean: {stats['mean']}")
print(f"Std: {stats['std']}")
print(f"Activated area: {stats['activated_area_ratio']:.2%}")
```

## Output Directory Structure

```
heatmaps/
├── raw_heatmaps/        # Intensity maps (1-3 MB each)
├── overlays/            # Overlaid visualizations
└── combined/            # 3-panel views (original + heatmap + overlay)
```

## Key Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `visualize()` | Generate all visualizations | Dict with paths |
| `compute_gradcam()` | Compute heatmap | (heatmap, image, class) |
| `overlay_heatmap_on_image()` | Create overlay | RGB image |
| `batch_visualize()` | Process multiple images | Dict of results |
| `get_heatmap_stats()` | Statistical analysis | Stats dict |
| `load_and_preprocess_image()` | Prepare image | (batch, original) |

## Common Parameters

| Parameter | Default | Options |
|-----------|---------|---------|
| `image_size` | 512 | 256, 384, 512, 768 |
| `alpha` | 0.5 | 0.0-1.0 (transparency) |
| `colormap` | TURBO | JET, HOT, COOL, SPRING, VIRIDIS |
| `save_all` | True | True/False |
| `pred_index` | None | 0-18 (for 19 classes) |

## Typical Workflow

```python
# 1. Setup
from gradcam_visualizer import GradCAMVisualizer
viz = GradCAMVisualizer("models_unified/best_model.h5")

# 2. Process single image
image_path = "test_disease_image.jpg"
paths = viz.visualize(image_path, save_all=True)

# 3. Get statistics
heatmap, orig, class_name = viz.compute_gradcam(image_path)
stats = viz.get_heatmap_stats(heatmap)

# 4. Display results
print(f"Overlay: {paths['overlay']}")
print(f"Activation: {stats['activated_area_ratio']:.2%}")

# 5. For batch
results = viz.batch_visualize("uploads/", save_all=True)
```

## Integration with Flask API

```python
from flask import Flask
from gradcam_api_integration import register_gradcam_routes

app = Flask(__name__)
register_gradcam_routes(app)

# Now all /api/gradcam/* endpoints available
```

## File Management

```bash
# List all visualizations
ls heatmaps/combined/

# Count visualizations
find heatmaps -name "*.png" | wc -l

# Clean old visualizations
find heatmaps -name "*.png" -mtime +7 -delete  # Older than 7 days
```

## Performance Tips

- **Faster processing**: Use GPU (auto-detected)
- **Batch efficiently**: Process 10-20 images at once
- **Lower memory**: Reduce alpha transparency or batch size
- **Better overlays**: Use alpha=0.4-0.6 for balance

## Troubleshooting Checklist

- [ ] Model file exists: `ls models_unified/best_model.h5`
- [ ] Model trained: Check file size (>50MB for EfficientNetB4)
- [ ] Input image valid: `file uploads/image.jpg`
- [ ] Heatmap directory writable: `touch heatmaps/test.txt`
- [ ] TensorFlow/OpenCV installed: `pip list | grep -E "tensorflow|opencv"`
- [ ] GPU available (optional): `python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"`

## Support Files

- **Main module**: `gradcam_visualizer.py`
- **API integration**: `gradcam_api_integration.py`
- **Test suite**: `test_gradcam.py`
- **Full documentation**: `GRADCAM_DOCUMENTATION.md`
- **This file**: `GRADCAM_QUICK_REFERENCE.md`

## Example Output

```
✅ Model loaded: models_unified/best_model.h5
✅ Last conv layer: top_conv
🎯 Prediction: Class 5 (confidence: 89.23%)
📊 Generating Grad-CAM visualization for: image.jpg
✅ Raw heatmap saved: heatmaps/raw_heatmaps/image_heatmap_raw.png
✅ Overlay saved: heatmaps/overlays/image_overlay.png
✅ Combined visualization saved: heatmaps/combined/image_combined.png

Generated files:
  • heatmap_raw: heatmaps/raw_heatmaps/image_heatmap_raw.png
  • overlay: heatmaps/overlays/image_overlay.png
  • combined: heatmaps/combined/image_combined.png
```

---

**Need help?** See full documentation in `GRADCAM_DOCUMENTATION.md`
