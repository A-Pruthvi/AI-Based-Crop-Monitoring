"""
Treatment Management Utility
CLI tool for adding, updating, searching, and managing treatments
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from treatment_recommender import TreatmentRecommender


class TreatmentManager:
    """Interactive treatment management system"""
    
    def __init__(self, treatments_file: str = None):
        """Initialize treatment manager"""
        if treatments_file is None:
            treatments_file = Path(__file__).parent / "treatments.json"
        self.recommender = TreatmentRecommender(str(treatments_file))
    
    def add_treatment_interactive(self):
        """Interactively add a new treatment"""
        print("\n" + "=" * 60)
        print("ADD NEW TREATMENT")
        print("=" * 60)
        
        disease_id = input("Enter Disease ID (e.g., 'Crop/Disease'): ").strip()
        if not disease_id or "/" not in disease_id:
            print("❌ Invalid Disease ID. Must contain '/'")
            return False
        
        disease_name = input("Enter Disease Name: ").strip()
        crop = input("Enter Crop Name: ").strip()
        severity = input("Enter Severity (Low/Moderate/Severe): ").strip()
        
        pesticide = input("Enter Primary Pesticide: ").strip()
        brand_name = input("Enter Brand Name: ").strip()
        dosage_value = input("Enter Dosage Value: ").strip()
        dosage_unit = input("Enter Dosage Unit (e.g., 'ml per liter'): ").strip()
        frequency = input("Enter Frequency (e.g., 'Every 10 days'): ").strip()
        application_method = input("Enter Application Method: ").strip()
        duration = input("Enter Treatment Duration: ").strip()
        effectiveness = input("Enter Effectiveness (e.g., '85-90%'): ").strip()
        cost_estimate = input("Enter Cost Estimate (e.g., '₹150-300 per liter'): ").strip()
        
        print("\nEnter Precautions (one per line, empty line to finish):")
        precautions = []
        while True:
            precaution = input(f"  {len(precautions) + 1}. ").strip()
            if not precaution:
                break
            precautions.append(precaution)
        
        print("\nEnter Best Practices (one per line, empty line to finish):")
        best_practices = []
        while True:
            practice = input(f"  {len(best_practices) + 1}. ").strip()
            if not practice:
                break
            best_practices.append(practice)
        
        # Create treatment dictionary
        treatment_data = {
            "disease_name": disease_name,
            "crop": crop,
            "severity": severity,
            "primary_treatment": {
                "pesticide": pesticide,
                "brand_name": brand_name,
                "dosage": {
                    "value": dosage_value,
                    "unit": dosage_unit,
                    "frequency": frequency
                },
                "application_method": application_method,
                "duration": duration
            },
            "alternative_treatments": [],
            "precautions": precautions,
            "best_practices": best_practices,
            "effectiveness": effectiveness,
            "cost_estimate": cost_estimate
        }
        
        # Validate
        is_valid, errors = self.recommender.validate_treatment(treatment_data)
        if not is_valid:
            print("\n❌ Validation errors:")
            for error in errors:
                print(f"  • {error}")
            return False
        
        # Add treatment
        if self.recommender.add_treatment(disease_id, treatment_data):
            print(f"\n✅ Treatment '{disease_id}' added successfully!")
            return True
        else:
            print(f"\n❌ Failed to add treatment")
            return False
    
    def list_all_treatments(self):
        """List all available treatments"""
        diseases = self.recommender.get_all_diseases()
        
        print("\n" + "=" * 60)
        print(f"ALL TREATMENTS ({len(diseases)} total)")
        print("=" * 60)
        
        for idx, disease_id in enumerate(diseases, 1):
            treatment = self.recommender.get_treatment(disease_id)
            crop = treatment.get('crop', 'Unknown')
            severity = treatment.get('severity', 'Unknown')
            print(f"{idx:2}. {disease_id:30} | Crop: {crop:12} | {severity}")
    
    def search_treatments(self, query: str):
        """Search for treatments"""
        results = self.recommender.search_treatments(query)
        
        print("\n" + "=" * 60)
        print(f"SEARCH RESULTS: '{query}' ({len(results)} matches)")
        print("=" * 60)
        
        if not results:
            print("No matches found")
            return
        
        for disease_id, treatment in results:
            print(f"\n📌 {disease_id}")
            print(f"   Disease: {treatment.get('disease_name')}")
            print(f"   Crop: {treatment.get('crop')}")
            print(f"   Severity: {treatment.get('severity')}")
            print(f"   Pesticide: {treatment.get('primary_treatment', {}).get('pesticide')}")
    
    def view_treatment_details(self, disease_id: str):
        """View complete treatment details"""
        print(self.recommender.get_full_treatment_text(disease_id))
    
    def list_by_crop(self, crop_name: str):
        """List all diseases for a crop"""
        diseases = self.recommender.get_diseases_by_crop(crop_name)
        
        print("\n" + "=" * 60)
        print(f"DISEASES FOR CROP: {crop_name} ({len(diseases)} found)")
        print("=" * 60)
        
        for idx, (disease_id, treatment) in enumerate(diseases, 1):
            severity = treatment.get('severity', 'Unknown')
            print(f"{idx}. {disease_id:30} | {severity}")
    
    def list_by_severity(self, severity: str):
        """List diseases by severity"""
        diseases = self.recommender.get_diseases_by_severity(severity)
        
        print("\n" + "=" * 60)
        print(f"DISEASES WITH SEVERITY: {severity} ({len(diseases)} found)")
        print("=" * 60)
        
        for idx, (disease_id, treatment) in enumerate(diseases, 1):
            crop = treatment.get('crop', 'Unknown')
            disease = treatment.get('disease_name', 'Unknown')
            print(f"{idx}. {disease_id:30} | {crop:15} | {disease}")
    
    def get_summary(self):
        """Get database summary statistics"""
        stats = self.recommender.get_summary_stats()
        
        print("\n" + "=" * 60)
        print("TREATMENT DATABASE SUMMARY")
        print("=" * 60)
        print(f"Total Diseases: {stats['total_diseases']}")
        print(f"Total Crops: {stats['total_crops']}")
        print(f"\nCrops covered:")
        for crop in stats['crops']:
            print(f"  • {crop}")
        print(f"\nSeverity levels:")
        for level in stats['severity_levels']:
            print(f"  • {level}")
        print(f"\nLast Updated: {stats['last_updated']}")
    
    def export_csv(self, output_file: str = "treatments_export.csv"):
        """Export treatments to CSV format"""
        import csv
        
        diseases = self.recommender.get_all_diseases()
        
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'Disease ID', 'Disease Name', 'Crop', 'Severity',
                'Pesticide', 'Brand', 'Dosage', 'Effectiveness', 'Cost'
            ])
            
            for disease_id in diseases:
                treatment = self.recommender.get_treatment(disease_id)
                primary = treatment.get('primary_treatment', {})
                dosage = primary.get('dosage', {})
                
                dosage_str = f"{dosage.get('value', '?')} {dosage.get('unit', 'ml/L')}"
                
                writer.writerow([
                    disease_id,
                    treatment.get('disease_name'),
                    treatment.get('crop'),
                    treatment.get('severity'),
                    primary.get('pesticide'),
                    primary.get('brand_name'),
                    dosage_str,
                    treatment.get('effectiveness'),
                    treatment.get('cost_estimate')
                ])
        
        print(f"\n✅ Treatments exported to {output_file}")
    
    def interactive_menu(self):
        """Interactive command menu"""
        while True:
            print("\n" + "=" * 60)
            print("TREATMENT MANAGEMENT SYSTEM")
            print("=" * 60)
            print("1. View all treatments")
            print("2. Search treatments")
            print("3. View treatment details")
            print("4. List by crop")
            print("5. List by severity")
            print("6. Add new treatment")
            print("7. View summary statistics")
            print("8. Export to CSV")
            print("9. Exit")
            print("=" * 60)
            
            choice = input("Select option (1-9): ").strip()
            
            if choice == '1':
                self.list_all_treatments()
            elif choice == '2':
                query = input("Enter search query: ").strip()
                self.search_treatments(query)
            elif choice == '3':
                disease_id = input("Enter Disease ID (e.g., 'Apple/Apple scab'): ").strip()
                self.view_treatment_details(disease_id)
            elif choice == '4':
                crop = input("Enter crop name: ").strip()
                self.list_by_crop(crop)
            elif choice == '5':
                severity = input("Enter severity (Low/Moderate/Severe): ").strip()
                self.list_by_severity(severity)
            elif choice == '6':
                self.add_treatment_interactive()
            elif choice == '7':
                self.get_summary()
            elif choice == '8':
                filename = input("Enter output filename (default: treatments_export.csv): ").strip()
                if not filename:
                    filename = "treatments_export.csv"
                self.export_csv(filename)
            elif choice == '9':
                print("\nGoodbye!")
                break
            else:
                print("❌ Invalid option. Please try again.")


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Treatment Management Utility for Plant Disease Recommendations"
    )
    parser.add_argument('--treatments-file', help='Path to treatments.json file')
    parser.add_argument('--list', action='store_true', help='List all treatments')
    parser.add_argument('--search', help='Search for treatments')
    parser.add_argument('--crop', help='List diseases for a crop')
    parser.add_argument('--severity', help='List diseases by severity')
    parser.add_argument('--view', help='View complete details for a disease')
    parser.add_argument('--summary', action='store_true', help='Show database summary')
    parser.add_argument('--export', help='Export to CSV file')
    parser.add_argument('--add', action='store_true', help='Add new treatment interactively')
    parser.add_argument('--interactive', action='store_true', help='Start interactive menu')
    
    args = parser.parse_args()
    
    manager = TreatmentManager(args.treatments_file)
    
    # Execute requested operations
    if args.list:
        manager.list_all_treatments()
    elif args.search:
        manager.search_treatments(args.search)
    elif args.crop:
        manager.list_by_crop(args.crop)
    elif args.severity:
        manager.list_by_severity(args.severity)
    elif args.view:
        manager.view_treatment_details(args.view)
    elif args.summary:
        manager.get_summary()
    elif args.export:
        manager.export_csv(args.export)
    elif args.add:
        manager.add_treatment_interactive()
    elif args.interactive:
        manager.interactive_menu()
    else:
        # Default: interactive menu
        manager.interactive_menu()


if __name__ == "__main__":
    main()
