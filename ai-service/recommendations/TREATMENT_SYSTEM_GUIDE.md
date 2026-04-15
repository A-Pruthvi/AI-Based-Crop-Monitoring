# Scalable Treatment Recommendation System

## Overview

The scalable treatment recommendation system provides a structured, extensible approach to managing plant disease treatments across all 19 crop-disease combinations. Built on a **modular JSON database**, it supports easy addition, modification, and search of treatment recommendations.

## System Architecture

### Components

```
recommendations/
├── treatments.json              # Comprehensive treatment database
├── treatment_recommender.py     # Python module for treatment lookup
├── manage_treatments.py         # CLI management utility
└── README.md                    # This documentation
```

### Data Structure

Each treatment entry follows this comprehensive format:

```json
{
  "Crop/Disease": {
    "disease_name": "Common disease name",
    "crop": "Crop name",
    "severity": "Low/Moderate/Severe",
    "primary_treatment": {
      "pesticide": "Chemical name",
      "brand_name": "Commercial brand",
      "dosage": {
        "value": 2.5,
        "unit": "ml per liter",
        "frequency": "Every 10 days"
      },
      "application_method": "How to apply",
      "duration": "Treatment duration"
    },
    "alternative_treatments": [
      {
        "pesticide": "Alternative chemical",
        "dosage": {...}
      }
    ],
    "precautions": ["Safety precaution 1", "Safety precaution 2"],
    "best_practices": ["Practice 1", "Practice 2"],
    "effectiveness": "85-90%",
    "cost_estimate": "₹150-300 per liter"
  }
}
```

## Usage

### 1. Using the Treatment Recommender Module (Python)

```python
from treatment_recommender import TreatmentRecommender

# Initialize
recommender = TreatmentRecommender("recommendations/treatments.json")

# Get single treatment
treatment = recommender.get_treatment("Apple/Apple scab")

# Get simple summary
summary = recommender.get_simple_treatment("Apple/Apple scab")
# Output: "Use Mancozeb + Carbendazim at 2.5 ml per liter, Every 10-14 days"

# Get full detailed treatment
full_text = recommender.get_full_treatment_text("Apple/Apple scab")
# Outputs formatted multi-line treatment guide

# Get precautions list
precautions = recommender.get_precautions_list("Apple/Apple scab")
# Returns: ["Avoid spraying during direct sunlight", ...]

# Get best practices
practices = recommender.get_best_practices("Apple/Apple scab")
# Returns: ["Remove and destroy infected fruit", ...]

# Search for treatments
results = recommender.search_treatments("mancozeb")
# Searches by disease, crop, or pesticide name

# Get all diseases
all_diseases = recommender.get_all_diseases()

# Filter by crop
apple_diseases = recommender.get_diseases_by_crop("Apple")

# Filter by severity
severe_diseases = recommender.get_diseases_by_severity("Severe")

# Get database statistics
stats = recommender.get_summary_stats()
```

### 2. Using the Management CLI

#### Interactive Mode
```bash
python recommendations/manage_treatments.py --interactive
```

Interactive menu options:
- View all treatments
- Search treatments
- View treatment details
- List by crop
- List by severity
- Add new treatment
- View summary statistics
- Export to CSV

#### Command Line Options

**List all treatments:**
```bash
python recommendations/manage_treatments.py --list
```

**Search treatments:**
```bash
python recommendations/manage_treatments.py --search "powdery mildew"
```

**View specific treatment:**
```bash
python recommendations/manage_treatments.py --view "Apple/Apple scab"
```

**List diseases by crop:**
```bash
python recommendations/manage_treatments.py --crop "Rice"
```

**List diseases by severity:**
```bash
python recommendations/manage_treatments.py --severity "Severe"
```

**Add new treatment interactively:**
```bash
python recommendations/manage_treatments.py --add
```

**View database summary:**
```bash
python recommendations/manage_treatments.py --summary
```

**Export to CSV:**
```bash
python recommendations/manage_treatments.py --export "output.csv"
```

### 3. Integration with Inference API

The inference API automatically uses the scalable treatment system:

```python
# When a disease is predicted
POST /api/predict
{
  "confidence": 0.92,
  "disease": "Apple scab",
  "crop": "Apple",
  "recommendations": {
    "disease_name": "Apple scab",
    "severity": "Moderate to Severe",
    "treatment": "Mancozeb + Carbendazim",
    "brand_name": "Fungimax / Bavistin",
    "dosage": {
      "value": 2.5,
      "unit": "ml per liter",
      "frequency": "Every 10-14 days"
    },
    "precautions": [...],
    "best_practices": [...],
    "effectiveness": "85-90%",
    "source": "scalable_new"
  }
}
```

## Adding New Treatments

### Method 1: Interactive CLI

```bash
python recommendations/manage_treatments.py --add
```

Follow the prompts:
1. Enter Disease ID (e.g., "Crop/DiseaseName")
2. Enter Disease Name
3. Enter Crop Name
4. Enter Severity Level
5. Enter pesticide details
6. Enter dosage information
7. Enter precautions
8. Enter best practices

### Method 2: Direct JSON Addition

Edit `recommendations/treatments.json` and add:

```json
{
  "Example/New Disease": {
    "disease_name": "New Disease Name",
    "crop": "Example Crop",
    "severity": "Moderate",
    "primary_treatment": {
      "pesticide": "Chemical Name",
      "brand_name": "Brand Name",
      "dosage": {
        "value": 2.0,
        "unit": "ml per liter",
        "frequency": "Every 7 days"
      },
      "application_method": "Spray application",
      "duration": "14 days"
    },
    "alternative_treatments": [],
    "precautions": [
      "Safety precaution 1",
      "Safety precaution 2"
    ],
    "best_practices": [
      "Practice 1",
      "Practice 2"
    ],
    "effectiveness": "80-85%",
    "cost_estimate": "₹100-200 per liter"
  }
}
```

### Method 3: Python API

```python
from treatment_recommender import TreatmentRecommender

recommender = TreatmentRecommender()

treatment_data = {
    "disease_name": "New Disease",
    "crop": "New Crop",
    "severity": "Moderate",
    "primary_treatment": {
        "pesticide": "Chemical",
        "brand_name": "Brand",
        "dosage": {
            "value": 2.0,
            "unit": "ml per liter",
            "frequency": "Every 7 days"
        },
        "application_method": "Spray",
        "duration": "14 days"
    },
    "alternative_treatments": [],
    "precautions": ["Precaution 1"],
    "best_practices": ["Practice 1"],
    "effectiveness": "80%",
    "cost_estimate": "₹100-200 per liter"
}

# Validate before adding
is_valid, errors = recommender.validate_treatment(treatment_data)
if is_valid:
    recommender.add_treatment("Crop/Disease", treatment_data)
else:
    print("Validation errors:", errors)
```

## Disease Coverage

### Crops (10 total)
- Apple
- Banana
- Corn
- Grape
- Mango
- Pepper
- Potato
- Rice
- Tomato
- Wheat

### Total Diseases: 19

| Crop | Diseases | Count |
|------|----------|-------|
| Apple | Apple scab, Cedar apple rust | 2 |
| Banana | Black Sigatoka | 1 |
| Corn | Gray leaf spot, Northern leaf blight | 2 |
| Grape | Downy mildew, Powdery mildew | 2 |
| Mango | Anthracnose | 1 |
| Pepper | Anthracnose | 1 |
| Potato | Early blight, Late blight | 2 |
| Rice | Bacterial leaf blight, Brown spot, Leaf smut | 3 |
| Tomato | Early blight, Tomato mosaic virus, Yellow leaf curl | 3 |
| Wheat | Powdery mildew, Septoria leaf blotch | 2 |

## Treatment Information Provided

Each treatment entry includes:

### Primary Information
- **Disease Name**: Common name of the disease
- **Crop**: Affected crop
- **Severity**: Disease severity level
- **Effectiveness**: Expected treatment effectiveness (%)

### Treatment Details
- **Pesticide**: Main chemical compound
- **Brand Name**: Commercial brand names
- **Dosage**: Precise amount and frequency
- **Application Method**: How to apply treatment
- **Duration**: How long to continue treatment

### Safety & Best Practices
- **Precautions**: Safety warnings and precautions
- **Best Practices**: Prevention and management strategies
- **Alternative Treatments**: Other available options

### Economic Information
- **Cost Estimate**: Approximate treatment cost
- **Alternative Options**: Multiple treatment strategies

## Searching and Filtering

### By Disease
```python
treatment = recommender.get_treatment("Apple/Apple scab")
```

### By Crop
```python
rice_diseases = recommender.get_diseases_by_crop("Rice")
```

### By Severity
```python
severe_diseases = recommender.get_diseases_by_severity("Severe")
```

### Text Search
```python
results = recommender.search_treatments("mancozeb")  # By pesticide
results = recommender.search_treatments("spray")      # By method
```

## Database Statistics

```python
stats = recommender.get_summary_stats()
# Returns:
# {
#   'total_diseases': 19,
#   'total_crops': 10,
#   'crops': ['Apple', 'Banana', ...],
#   'severity_levels': ['Low', 'Moderate', 'Severe'],
#   'last_updated': '2026-03-27'
# }
```

## Export Functionality

### Export to CSV
```bash
python recommendations/manage_treatments.py --export "treatments.csv"
```

CSV includes columns:
- Disease ID
- Disease Name
- Crop
- Severity
- Pesticide
- Brand
- Dosage
- Effectiveness
- Cost

### Export Format for Integration
```python
recommender.get_simple_treatment("Apple/Apple scab")
# For quick display in UIs
```

## Extending the System

### Adding a New Crop

1. Add diseases with proper "Crop/Disease" format
2. Ensure all required fields are present
3. Use consistent naming conventions

### Adding Alternative Treatments

```python
treatment = recommender.get_treatment("Apple/Apple scab")
treatment['alternative_treatments'].append({
    "pesticide": "New Alternative",
    "dosage": {
        "value": 1.5,
        "unit": "ml per liter"
    }
})
```

### Creating Custom Filters

```python
# Find all fungicide-based treatments
fungicide_treatments = recommender.search_treatments("fungicide")

# Find treatments for high-severity diseases
high_severity = recommender.get_diseases_by_severity("Severe")
```

## Validation Rules

The system validates:
1. Required fields presence
2. Proper structure for nested objects
3. Valid dosage information
4. Precautions and best practices lists

```python
is_valid, errors = recommender.validate_treatment(data)
if not is_valid:
    for error in errors:
        print(f"Error: {error}")
```

## API Response Format

When integrated with the inference API:

```json
{
  "prediction": {
    "disease": "Apple scab",
    "crop": "Apple",
    "confidence": 0.92,
    "severity": {
      "score": 65,
      "level": "Moderate"
    },
    "recommendations": {
      "disease_name": "Apple scab",
      "severity": "Moderate to Severe",
      "treatment": "Mancozeb + Carbendazim",
      "brand_name": "Fungimax / Bavistin",
      "dosage": {
        "value": 2.5,
        "unit": "ml per liter",
        "frequency": "Every 10-14 days"
      },
      "precautions": [
        "Avoid spraying during direct sunlight",
        "Wear protective gear",
        "Do not spray during flowering",
        "Wait 7 days before harvesting"
      ],
      "best_practices": [
        "Remove and destroy infected fruit",
        "Improve air circulation by pruning",
        "Maintain proper spacing between trees",
        "Avoid overhead watering",
        "Clean pruning tools between cuts"
      ],
      "effectiveness": "85-90%",
      "cost_estimate": "₹150-300 per liter",
      "source": "scalable_new"
    }
  }
}
```

## Troubleshooting

### Treatment Not Found
- Check Disease ID format: should be "Crop/Disease"
- Verify disease is in treatments.json
- Search for similar diseases

### Module Import Error
- Ensure treatment_recommender.py is in same directory as management tool
- Check Python path includes recommendations directory

### JSON Parsing Error
- Validate JSON syntax using a JSON validator
- Check for proper quotes and comma placement
- Ensure all required fields are present

## Performance Notes

- Database loads entirely into memory on initialization
- Searches are O(n) where n is number of diseases
- Caching available for frequently accessed treatments
- Suitable for datasets up to 1000+ diseases

## Future Enhancements

Potential improvements:
1. Database indexing for faster searches
2. Treatment efficacy ratings from user feedback
3. Regional cost variations
4. Weather-based application recommendations
5. Integration with weather APIs
6. Treatment efficacy tracking
7. User preference profiles
8. Multi-language support

## Support

For issues or enhancement requests:
1. Check existing treatments in database
2. Review validation rules
3. Consult treatment_recommender.py documentation
4. Test with command-line tools first
