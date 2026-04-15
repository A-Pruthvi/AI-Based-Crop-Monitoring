"""
Treatment Recommendation System
Provides scalable disease treatment recommendations with pesticide details, dosage, and precautions
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class TreatmentRecommender:
    """Scalable treatment recommendation system for plant diseases"""
    
    def __init__(self, treatments_file: str = None):
        """
        Initialize the treatment recommender with JSON database
        
        Args:
            treatments_file: Path to treatments.json. If None, uses default.
        """
        if treatments_file is None:
            # Try to find treatments.json in recommendations folder
            current_dir = Path(__file__).parent
            treatments_file = current_dir / "treatments.json"
        
        self.treatments_file = treatments_file
        self.treatments_db = self._load_treatments()
    
    def _load_treatments(self) -> Dict:
        """Load treatments from JSON file"""
        try:
            with open(self.treatments_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('treatment_index', {})
        except FileNotFoundError:
            print(f"Warning: Treatments file not found at {self.treatments_file}")
            return {}
        except json.JSONDecodeError:
            print(f"Warning: Invalid JSON in treatments file")
            return {}
    
    def get_treatment(self, disease_name: str) -> Optional[Dict]:
        """
        Get complete treatment for a specific disease
        
        Args:
            disease_name: Disease identifier (e.g., "Apple/Apple scab")
        
        Returns:
            Treatment dictionary or None if not found
        """
        return self.treatments_db.get(disease_name)
    
    def get_simple_treatment(self, disease_name: str) -> str:
        """
        Get simple text treatment summary for easy display
        
        Args:
            disease_name: Disease identifier
        
        Returns:
            Formatted treatment summary string
        """
        treatment = self.get_treatment(disease_name)
        if not treatment:
            return f"No treatment found for {disease_name}"
        
        primary = treatment.get('primary_treatment', {})
        pesticide = primary.get('pesticide', 'Unknown')
        dosage = primary.get('dosage', {})
        
        dosage_str = f"{dosage.get('value', '?')} {dosage.get('unit', 'ml/L')}"
        frequency = dosage.get('frequency', 'As needed')
        
        return f"Use {pesticide} at {dosage_str}, {frequency}"
    
    def get_full_treatment_text(self, disease_name: str) -> str:
        """
        Get comprehensive treatment recommendation as formatted text
        
        Args:
            disease_name: Disease identifier
        
        Returns:
            Formatted multi-line treatment text
        """
        treatment = self.get_treatment(disease_name)
        if not treatment:
            return f"No treatment information available for {disease_name}"
        
        lines = []
        lines.append(f"=== TREATMENT: {treatment.get('disease_name', disease_name)} ===\n")
        lines.append(f"Crop: {treatment.get('crop', 'Unknown')}")
        lines.append(f"Severity: {treatment.get('severity', 'Unknown')}\n")
        
        # Primary treatment
        primary = treatment.get('primary_treatment', {})
        lines.append("PRIMARY TREATMENT:")
        lines.append(f"  Pesticide: {primary.get('pesticide', 'Unknown')}")
        lines.append(f"  Brand Name: {primary.get('brand_name', 'Various brands')}")
        
        dosage = primary.get('dosage', {})
        lines.append(f"  Dosage: {dosage.get('value', '?')} {dosage.get('unit', 'ml/L')}")
        lines.append(f"  Frequency: {dosage.get('frequency', 'As needed')}")
        lines.append(f"  Duration: {primary.get('duration', 'As needed')}")
        lines.append(f"  Method: {primary.get('application_method', 'Spray application')}\n")
        
        # Precautions
        precautions = treatment.get('precautions', [])
        if precautions:
            lines.append("PRECAUTIONS:")
            for precaution in precautions:
                lines.append(f"  • {precaution}")
            lines.append("")
        
        # Best practices
        practices = treatment.get('best_practices', [])
        if practices:
            lines.append("BEST PRACTICES:")
            for practice in practices:
                lines.append(f"  • {practice}")
            lines.append("")
        
        # Effectiveness and cost
        lines.append(f"Effectiveness: {treatment.get('effectiveness', 'Unknown')}")
        lines.append(f"Cost Estimate: {treatment.get('cost_estimate', 'Unknown')}")
        
        return "\n".join(lines)
    
    def get_pesticide_details(self, disease_name: str) -> Optional[Dict]:
        """
        Get detailed pesticide information for primary treatment
        
        Args:
            disease_name: Disease identifier
        
        Returns:
            Pesticide details dictionary
        """
        treatment = self.get_treatment(disease_name)
        if not treatment:
            return None
        
        primary = treatment.get('primary_treatment', {})
        return {
            'name': primary.get('pesticide'),
            'brand': primary.get('brand_name'),
            'dosage': primary.get('dosage'),
            'application_method': primary.get('application_method'),
            'duration': primary.get('duration')
        }
    
    def get_precautions_list(self, disease_name: str) -> List[str]:
        """
        Get list of precautions for a disease
        
        Args:
            disease_name: Disease identifier
        
        Returns:
            List of precaution strings
        """
        treatment = self.get_treatment(disease_name)
        if not treatment:
            return []
        return treatment.get('precautions', [])
    
    def get_best_practices(self, disease_name: str) -> List[str]:
        """
        Get list of best practices for a disease
        
        Args:
            disease_name: Disease identifier
        
        Returns:
            List of best practice strings
        """
        treatment = self.get_treatment(disease_name)
        if not treatment:
            return []
        return treatment.get('best_practices', [])
    
    def get_alternative_treatments(self, disease_name: str) -> List[Dict]:
        """
        Get alternative treatment options for a disease
        
        Args:
            disease_name: Disease identifier
        
        Returns:
            List of alternative treatment dictionaries
        """
        treatment = self.get_treatment(disease_name)
        if not treatment:
            return []
        return treatment.get('alternative_treatments', [])
    
    def get_all_diseases(self) -> List[str]:
        """
        Get list of all available diseases in the database
        
        Returns:
            List of disease identifiers
        """
        return list(self.treatments_db.keys())
    
    def get_diseases_by_crop(self, crop_name: str) -> List[Tuple[str, Dict]]:
        """
        Get all diseases for a specific crop
        
        Args:
            crop_name: Crop name (e.g., 'Apple', 'Rice')
        
        Returns:
            List of (disease_id, treatment_dict) tuples
        """
        matches = []
        for disease_id, treatment in self.treatments_db.items():
            if treatment.get('crop', '').lower() == crop_name.lower():
                matches.append((disease_id, treatment))
        return matches
    
    def get_diseases_by_severity(self, severity_level: str) -> List[Tuple[str, Dict]]:
        """
        Get diseases by severity level
        
        Args:
            severity_level: 'Low', 'Moderate', 'Severe', etc.
        
        Returns:
            List of (disease_id, treatment_dict) tuples
        """
        matches = []
        for disease_id, treatment in self.treatments_db.items():
            if severity_level.lower() in treatment.get('severity', '').lower():
                matches.append((disease_id, treatment))
        return matches
    
    def add_treatment(self, disease_id: str, treatment_data: Dict) -> bool:
        """
        Add or update a treatment in the database
        
        Args:
            disease_id: Disease identifier (e.g., "Crop/Disease")
            treatment_data: Treatment dictionary with all required fields
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.treatments_db[disease_id] = treatment_data
            self._save_treatments()
            return True
        except Exception as e:
            print(f"Error adding treatment: {e}")
            return False
    
    def delete_treatment(self, disease_id: str) -> bool:
        """
        Remove a treatment from the database
        
        Args:
            disease_id: Disease identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if disease_id in self.treatments_db:
                del self.treatments_db[disease_id]
                self._save_treatments()
                return True
            return False
        except Exception as e:
            print(f"Error deleting treatment: {e}")
            return False
    
    def _save_treatments(self) -> bool:
        """Save current treatments to JSON file"""
        try:
            # Load full data with metadata
            with open(self.treatments_file, 'r', encoding='utf-8') as f:
                full_data = json.load(f)
            
            # Update treatment_index
            full_data['treatment_index'] = self.treatments_db
            
            # Save back
            with open(self.treatments_file, 'w', encoding='utf-8') as f:
                json.dump(full_data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving treatments: {e}")
            return False
    
    def validate_treatment(self, treatment_data: Dict) -> Tuple[bool, List[str]]:
        """
        Validate treatment data structure
        
        Args:
            treatment_data: Treatment dictionary to validate
        
        Returns:
            Tuple of (is_valid, list of errors)
        """
        errors = []
        required_fields = [
            'disease_name', 'crop', 'severity', 'primary_treatment',
            'precautions', 'best_practices', 'effectiveness'
        ]
        
        for field in required_fields:
            if field not in treatment_data:
                errors.append(f"Missing required field: {field}")
        
        # Validate primary_treatment structure
        if 'primary_treatment' in treatment_data:
            primary = treatment_data['primary_treatment']
            required_primary = ['pesticide', 'dosage', 'application_method']
            for field in required_primary:
                if field not in primary:
                    errors.append(f"Missing primary_treatment field: {field}")
        
        return len(errors) == 0, errors
    
    def search_treatments(self, query: str) -> List[Tuple[str, Dict]]:
        """
        Search treatments by disease name, pesticide, or crop
        
        Args:
            query: Search query (case-insensitive)
        
        Returns:
            List of matching (disease_id, treatment_dict) tuples
        """
        query_lower = query.lower()
        matches = []
        
        for disease_id, treatment in self.treatments_db.items():
            # Check disease name
            if query_lower in treatment.get('disease_name', '').lower():
                matches.append((disease_id, treatment))
            # Check crop
            elif query_lower in treatment.get('crop', '').lower():
                matches.append((disease_id, treatment))
            # Check pesticide
            elif query_lower in treatment.get('primary_treatment', {}).get('pesticide', '').lower():
                matches.append((disease_id, treatment))
        
        return matches
    
    def get_summary_stats(self) -> Dict:
        """
        Get database summary statistics
        
        Returns:
            Dictionary with summary information
        """
        diseases = list(self.treatments_db.values())
        crops = set(d.get('crop', '') for d in diseases)
        severities = set(d.get('severity', '') for d in diseases)
        
        return {
            'total_diseases': len(self.treatments_db),
            'total_crops': len(crops),
            'crops': sorted(crops),
            'severity_levels': sorted(severities),
            'last_updated': self.treatments_db.get('_metadata', {}).get('last_updated', 'Unknown')
        }


# Example usage
if __name__ == "__main__":
    # Initialize recommender
    recommender = TreatmentRecommender()
    
    # Print available diseases
    print("Available Diseases:")
    print("=" * 50)
    diseases = recommender.get_all_diseases()
    for disease in diseases[:5]:  # Show first 5
        print(f"  • {disease}")
    print(f"  ... and {len(diseases) - 5} more\n")
    
    # Get treatment for a specific disease
    disease_id = "Apple/Apple scab"
    print(f"Treatment for {disease_id}:")
    print("=" * 50)
    print(recommender.get_full_treatment_text(disease_id))
    print("\n")
    
    # Get summary statistics
    stats = recommender.get_summary_stats()
    print("Database Summary:")
    print("=" * 50)
    for key, value in stats.items():
        print(f"  {key}: {value}")
