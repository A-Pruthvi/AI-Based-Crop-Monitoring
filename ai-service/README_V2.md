# AI Service V2 - README

This document provides an overview of the version 2 of the AI service for crop and disease detection.

## System Architecture

The system is a two-stage pipeline:

1.  **Crop Classification:** Identifies the crop from an uploaded image.
2.  **Disease Classification:** Identifies the disease affecting the crop.

The system also provides severity estimation and treatment recommendations.

## Key Features

-   **Transfer Learning:** Uses VGG16 for both crop and disease classification.
-   **Data Augmentation:** Reduces overfitting and improves model generalization.
-   **Modular Code:** The code is organized into modules for better maintainability.
-   **Configuration File:** A single configuration file (`config.py`) to manage all parameters.

## Project Structure

-   `app_v2.py`: The main application file.
-   `prepare_dataset.py`: Script to prepare the dataset for training.
-   `image_preprocessing_v2.py`: Module for image preprocessing and data augmentation.
-   `crop_classifier_v2.py`: The crop classification model.
-   `disease_classifier_v2.py`: The disease classification model.
-   `train_model.py`: Script to train the models.
-   `severity_estimator.py`: Module for estimating disease severity.
-   `treatment_recommender.py`: Module for providing treatment recommendations.
-   `config.py`: Configuration file.
-   `requirements.txt`: Python dependencies.
-   `model/`: Directory to store the trained models.
-   `dataset/`: Directory for the training and validation data.
-   `raw_data/`: Directory for the raw image data.
-   `recommendations/`: Directory for treatment and advisory JSON files.
