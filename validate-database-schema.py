"""
Phase 2: Database Schema Validation
Validate that the Prisma schema has all required fields for FPM tracking
"""

import json
from typing import Dict, List, Set

# Required fields for complete FPM tracking
REQUIRED_FIELDS = {
    'User': {
        'session_tracking': ['user_session_id', 'last_active_at', 'created_at', 'updated_at'],
        'fpm_context': ['current_fpm_method', 'current_concern_type', 'user_intention', 'current_step'],
        'demographics': ['selected_gender', 'selected_state', 'selected_lga', 'selected_age_group', 'selected_marital_status']
    },
    'ChatSession': {
        'session_info': ['session_id', 'user_session_id', 'session_start_time', 'session_end_time'],
        'tracking': ['total_messages_count', 'session_completed', 'session_outcome']
    },
    'ChatStateSession': {
        'state_management': ['session_id', 'user_session_id', 'chat_state', 'last_activity']
    },
    'Conversation': {
        'message_info': ['conversation_id', 'session_id', 'user_id', 'message_text', 'message_type'],
        'flow_tracking': ['chat_step', 'widget_name', 'message_sequence_number'],
        'timing': ['message_delay_ms', 'created_at']
    },
    'FpmInteraction': {
        'core': ['interaction_id', 'user_id', 'session_id', 'created_at'],
        'flow_type': ['fpm_flow_type'],
        'method_tracking': ['current_fpm_method', 'interested_fpm_method', 'selected_method'],
        'satisfaction': ['satisfaction_level', 'switch_reason', 'stop_reason'],
        'preferences': ['kids_in_future', 'timing_preference', 'menstrual_flow_preference'],
        'side_effects': ['side_effects'],
        'actions': ['next_action', 'clinic_referral_needed', 'human_agent_requested']
    },
    'UserResponse': {
        'core': ['response_id', 'user_id', 'session_id', 'conversation_id'],
        'content': ['response_category', 'response_type', 'user_response', 'question_asked'],
        'flow': ['step_in_flow', 'widget_used', 'available_options']
    }
}

# Optional but recommended fields
RECOMMENDED_FIELDS = {
    'User': ['phone_number', 'email'],
    'FpmInteraction': [
        'fertility_timeline_shown',  # NEW - track if fertility info was shown
        'discontinuation_date',      # NEW - when they stopped their method
        'wants_pregnancy',           # NEW - explicit pregnancy intention
        'pregnancy_timeline'         # NEW - when they want to get pregnant
    ],
    'ChatSession': ['device_type', 'user_agent']
}

def check_schema_file():
    """Read and analyze the Prisma schema file"""
    schema_path = 'server/prisma/schema.prisma'
    
    print("=" * 70)
    print("PHASE 2: DATABASE SCHEMA VALIDATION")
    print("=" * 70)
    print(f"\nReading schema from: {schema_path}")
    
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_content = f.read()
        
        print("✅ Schema file loaded successfully\n")
        return schema_content
    except Exception as e:
        print(f"❌ Error reading schema: {e}")
        return None

def parse_model_fields(schema_content: str, model_name: str) -> Set[str]:
    """Extract all fields from a specific model"""
    fields = set()
    in_model = False
    
    for line in schema_content.split('\n'):
        # Start of model
        if f'model {model_name}' in line and '{' in line:
            in_model = True
            continue
        
        # End of model
        if in_model and line.strip().startswith('}'):
            break
        
        # Extract field name
        if in_model and line.strip():
            # Skip comments and relations
            if line.strip().startswith('//') or line.strip().startswith('@@'):
                continue
            
            # Parse field: fieldName Type
            parts = line.strip().split()
            if len(parts) >= 2:
                field_name = parts[0]
                fields.add(field_name)
    
    return fields

def validate_required_fields(schema_content: str) -> Dict:
    """Validate all required fields exist in schema"""
    print("🔍 VALIDATING REQUIRED FIELDS\n")
    
    validation_results = {
        'all_present': True,
        'models': {},
        'missing_fields': [],
        'summary': {}
    }
    
    for model_name, categories in REQUIRED_FIELDS.items():
        print(f"📋 Checking model: {model_name}")
        
        # Get all fields in this model
        actual_fields = parse_model_fields(schema_content, model_name)
        
        model_results = {
            'total_fields': len(actual_fields),
            'required_by_category': {},
            'missing': [],
            'present': []
        }
        
        # Check each category
        for category, required_fields in categories.items():
            missing = []
            present = []
            
            for field in required_fields:
                if field in actual_fields:
                    present.append(field)
                    print(f"  ✅ {field}")
                else:
                    missing.append(field)
                    print(f"  ❌ {field} - MISSING")
                    validation_results['all_present'] = False
            
            model_results['required_by_category'][category] = {
                'required': required_fields,
                'missing': missing,
                'present': present
            }
            
            if missing:
                model_results['missing'].extend(missing)
                validation_results['missing_fields'].extend([f"{model_name}.{f}" for f in missing])
        
        validation_results['models'][model_name] = model_results
        print()
    
    return validation_results

def check_recommended_fields(schema_content: str) -> Dict:
    """Check for optional but recommended fields"""
    print("\n💡 CHECKING RECOMMENDED FIELDS\n")
    
    recommendations = {
        'models': {},
        'total_missing': 0
    }
    
    for model_name, recommended_fields in RECOMMENDED_FIELDS.items():
        print(f"📋 Checking model: {model_name}")
        
        actual_fields = parse_model_fields(schema_content, model_name)
        
        missing = []
        present = []
        
        for field in recommended_fields:
            if field in actual_fields:
                present.append(field)
                print(f"  ✅ {field}")
            else:
                missing.append(field)
                print(f"  ⚠️  {field} - NOT FOUND (recommended)")
                recommendations['total_missing'] += 1
        
        recommendations['models'][model_name] = {
            'missing': missing,
            'present': present
        }
        print()
    
    return recommendations

def generate_migration_script(validation_results: Dict, recommendations: Dict) -> str:
    """Generate SQL migration script for missing fields"""
    print("\n📝 GENERATING MIGRATION SCRIPT\n")
    
    migration_sql = []
    migration_sql.append("-- Migration: Add missing FPM tracking fields")
    migration_sql.append("-- Generated: 2025-11-03")
    migration_sql.append("-- Purpose: Complete FPM interaction and fertility timeline tracking\n")
    
    # Add missing required fields
    if validation_results['missing_fields']:
        migration_sql.append("-- REQUIRED FIELDS (Missing)")
        migration_sql.append("-- These fields are essential for proper FPM tracking\n")
        
        for field_path in validation_results['missing_fields']:
            model, field = field_path.split('.')
            migration_sql.append(f"-- TODO: Add {field} to {model} model in schema.prisma")
    
    # Add recommended fields
    migration_sql.append("\n-- RECOMMENDED FIELDS")
    migration_sql.append("-- These fields enhance FPM tracking capabilities\n")
    
    for model_name, data in recommendations['models'].items():
        if data['missing']:
            migration_sql.append(f"\n-- {model_name} model")
            for field in data['missing']:
                if field == 'fertility_timeline_shown':
                    migration_sql.append(f"ALTER TABLE {model_name.lower()}s ADD COLUMN {field} BOOLEAN DEFAULT false;")
                elif field == 'discontinuation_date':
                    migration_sql.append(f"ALTER TABLE {model_name.lower()}s ADD COLUMN {field} TIMESTAMPTZ;")
                elif field == 'wants_pregnancy':
                    migration_sql.append(f"ALTER TABLE {model_name.lower()}s ADD COLUMN {field} BOOLEAN;")
                elif field == 'pregnancy_timeline':
                    migration_sql.append(f"ALTER TABLE {model_name.lower()}s ADD COLUMN {field} VARCHAR(50);")
                else:
                    migration_sql.append(f"-- ALTER TABLE {model_name.lower()}s ADD COLUMN {field} TYPE;")
    
    migration_content = '\n'.join(migration_sql)
    
    # Save migration script
    with open('database-schema-updates.sql', 'w', encoding='utf-8') as f:
        f.write(migration_content)
    
    print("✅ Migration script saved to: database-schema-updates.sql")
    
    return migration_content

def create_validation_report(validation_results: Dict, recommendations: Dict):
    """Create comprehensive validation report"""
    print("\n" + "=" * 70)
    print("VALIDATION REPORT")
    print("=" * 70)
    
    report = {
        'validation_date': '2025-11-03',
        'schema_status': 'PASS' if validation_results['all_present'] else 'FAIL',
        'required_fields': {
            'total_checked': sum(
                len(cat_fields) 
                for model in REQUIRED_FIELDS.values() 
                for cat_fields in model.values()
            ),
            'missing': len(validation_results['missing_fields']),
            'present': sum(
                len(cat_fields) 
                for model in REQUIRED_FIELDS.values() 
                for cat_fields in model.values()
            ) - len(validation_results['missing_fields'])
        },
        'recommended_fields': {
            'total_checked': sum(len(fields) for fields in RECOMMENDED_FIELDS.values()),
            'missing': recommendations['total_missing'],
            'present': sum(len(fields) for fields in RECOMMENDED_FIELDS.values()) - recommendations['total_missing']
        },
        'validation_results': validation_results,
        'recommendations': recommendations
    }
    
    # Print summary
    print(f"\n📊 SUMMARY:")
    print(f"   Schema Status: {'✅ PASS' if validation_results['all_present'] else '❌ FAIL'}")
    print(f"\n   Required Fields:")
    print(f"      Total checked: {report['required_fields']['total_checked']}")
    print(f"      Present: {report['required_fields']['present']}")
    print(f"      Missing: {report['required_fields']['missing']}")
    
    if validation_results['missing_fields']:
        print(f"\n   ❌ Missing required fields:")
        for field in validation_results['missing_fields']:
            print(f"      - {field}")
    
    print(f"\n   Recommended Fields:")
    print(f"      Total checked: {report['recommended_fields']['total_checked']}")
    print(f"      Present: {report['recommended_fields']['present']}")
    print(f"      Missing: {report['recommended_fields']['missing']}")
    
    if recommendations['total_missing'] > 0:
        print(f"\n   💡 Missing recommended fields:")
        for model, data in recommendations['models'].items():
            if data['missing']:
                print(f"      {model}:")
                for field in data['missing']:
                    print(f"         - {field}")
    
    # Save report
    with open('database-validation-report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Full report saved to: database-validation-report.json")
    
    return report

def main():
    """Main execution"""
    # Read schema
    schema_content = check_schema_file()
    if not schema_content:
        return
    
    # Validate required fields
    validation_results = validate_required_fields(schema_content)
    
    # Check recommended fields
    recommendations = check_recommended_fields(schema_content)
    
    # Generate migration if needed
    if not validation_results['all_present'] or recommendations['total_missing'] > 0:
        generate_migration_script(validation_results, recommendations)
    
    # Create report
    create_validation_report(validation_results, recommendations)
    
    # Final recommendations
    print("\n" + "=" * 70)
    print("RECOMMENDATIONS")
    print("=" * 70)
    
    if validation_results['all_present']:
        print("\n✅ All required fields are present in the schema!")
        print("   Your database schema supports complete FPM tracking.")
    else:
        print("\n⚠️  Some required fields are missing!")
        print("   Review database-schema-updates.sql for migration script.")
    
    if recommendations['total_missing'] > 0:
        print(f"\n💡 {recommendations['total_missing']} recommended fields missing")
        print("   Consider adding these fields for enhanced tracking:")
        print("   - fertility_timeline_shown: Track if fertility info was delivered")
        print("   - discontinuation_date: When user stopped their method")
        print("   - wants_pregnancy: Explicit pregnancy intention")
        print("   - pregnancy_timeline: When they want to conceive")
    
    print("\n" + "=" * 70)
    print("NEXT STEPS:")
    print("1. Review database-validation-report.json")
    print("2. If migrations needed, review database-schema-updates.sql")
    print("3. Apply migrations to schema.prisma")
    print("4. Run: npx prisma migrate dev --name add_fpm_tracking_fields")
    print("=" * 70)

if __name__ == '__main__':
    main()
