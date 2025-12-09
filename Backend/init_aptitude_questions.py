"""
Initialize Aptitude Questions in Database

This script loads aptitude questions from the JSON file into the aptitude_questions table.
Run this once to set up aptitude questions.

Usage:
    python init_aptitude_questions.py
"""

import json
from pathlib import Path
from sqlalchemy.orm import Session
from core.database import SessionLocal, engine, Base
from models import LegacyQuestion

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def load_questions_from_json():
    """Load questions from the JSON file"""
    json_file_path = Path(__file__).parent / "routers" / "Candidate_assessments" / "Assessment" / "aptitude" / "data" / "questions.json"
    
    if not json_file_path.exists():
        print(f"❌ Error: Questions file not found at {json_file_path}")
        return []
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        print(f"✅ Loaded {len(questions_data)} questions from JSON file")
        return questions_data
    except Exception as e:
        print(f"❌ Error loading JSON file: {e}")
        return []

def init_aptitude_questions():
    """Initialize aptitude questions from JSON file"""
    
    db: Session = SessionLocal()
    
    try:
        # Check if questions already exist
        existing_count = db.query(LegacyQuestion).count()
        if existing_count > 0:
            print(f"⚠️ Questions already exist ({existing_count} questions)")
            response = input("Do you want to replace all questions? (yes/no): ")
            if response.lower() == 'yes':
                db.query(LegacyQuestion).delete()
                db.commit()
                print("✅ Cleared existing questions")
            else:
                print("❌ Cancelled")
                return
        
        # Load questions from JSON
        questions_data = load_questions_from_json()
        
        if not questions_data:
            print("❌ No questions to load")
            return
        
        # Add questions to database
        added_count = 0
        skipped_count = 0
        
        print("\n📝 Adding questions to database...")
        
        for q_data in questions_data:
            try:
                # Validate required fields
                if not all(key in q_data for key in ['id', 'question', 'options', 'answer']):
                    print(f"⚠️ Skipping invalid question (ID: {q_data.get('id', 'unknown')})")
                    skipped_count += 1
                    continue
                
                question = LegacyQuestion(
                    id=q_data['id'],
                    set_no=None,  # Will be assigned later by generate_sets_db()
                    question=q_data['question'],
                    options=q_data['options'],
                    answer=q_data['answer']
                )
                db.add(question)
                added_count += 1
                
                # Show progress every 100 questions
                if added_count % 100 == 0:
                    print(f"  Added {added_count} questions...")
                    
            except Exception as e:
                print(f"⚠️ Error adding question ID {q_data.get('id', 'unknown')}: {e}")
                skipped_count += 1
                continue
        
        db.commit()
        
        print(f"\n✅ Successfully added {added_count} questions!")
        if skipped_count > 0:
            print(f"⚠️ Skipped {skipped_count} invalid questions")
        print(f"📊 Total questions in database: {db.query(LegacyQuestion).count()}")
        
        # Show sample questions
        print("\n📝 Sample Questions (first 5):")
        sample_questions = db.query(LegacyQuestion).limit(5).all()
        for i, q in enumerate(sample_questions, 1):
            print(f"\n{i}. {q.question}")
            for key, value in q.options.items():
                print(f"   {key}: {value}")
            print(f"   ✅ Answer: {q.answer}")
        
        # Prompt to generate sets
        print("\n" + "="*70)
        print("⚠️ IMPORTANT: You need to assign questions to sets!")
        print("Run this command after loading questions:")
        print("  python -c \"from routers.Candidate_assessments.Assessment.aptitude.utils import generate_sets_db; generate_sets_db()\"")
        print("="*70)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def list_questions():
    """List all aptitude questions in database"""
    db: Session = SessionLocal()
    
    try:
        questions = db.query(LegacyQuestion).all()
        
        if not questions:
            print("❌ No questions found in database")
            print("💡 Run option 1 to initialize questions")
            return
        
        print(f"\n📊 Total Questions: {len(questions)}\n")
        
        # Count questions by set
        set_counts = {}
        for q in questions:
            set_no = q.set_no if q.set_no else "Unassigned"
            set_counts[set_no] = set_counts.get(set_no, 0) + 1
        
        print("📊 Questions by Set:")
        for set_no in sorted(set_counts.keys()):
            print(f"  Set {set_no}: {set_counts[set_no]} questions")
        
        # Show first 10 questions
        print("\n📝 First 10 Questions:")
        for i, q in enumerate(questions[:10], 1):
            print(f"\n{i}. [Set {q.set_no if q.set_no else 'N/A'}] {q.question[:80]}...")
            print(f"   Options: {', '.join(q.options.keys())}")
            print(f"   Answer: {q.answer}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

def clear_questions():
    """Clear all aptitude questions from database (use with caution!)"""
    db: Session = SessionLocal()
    
    try:
        count = db.query(LegacyQuestion).count()
        if count == 0:
            print("❌ No questions to delete")
            return
            
        response = input(f"⚠️ Are you sure you want to delete all {count} questions? (yes/no): ")
        if response.lower() == 'yes':
            db.query(LegacyQuestion).delete()
            db.commit()
            print(f"✅ Deleted {count} questions")
        else:
            print("❌ Cancelled")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

def generate_sets():
    """Assign questions to sets (1-10)"""
    try:
        from routers.Candidate_assessments.Assessment.aptitude.utils import generate_sets_db
        print("\n🎲 Generating question sets...")
        generate_sets_db()
    except Exception as e:
        print(f"❌ Error generating sets: {e}")
        import traceback
        traceback.print_exc()

def check_json_file():
    """Check the JSON file structure"""
    json_file_path = Path(__file__).parent / "routers" / "Candidate_assessments" / "Assessment" / "aptitude" / "data" / "questions.json"
    
    print(f"\n📁 JSON File Location:")
    print(f"   {json_file_path}")
    print(f"   Exists: {'✅ Yes' if json_file_path.exists() else '❌ No'}")
    
    if json_file_path.exists():
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                questions_data = json.load(f)
            
            print(f"\n📊 JSON File Statistics:")
            print(f"   Total Questions: {len(questions_data)}")
            
            # Sample question
            if questions_data:
                print(f"\n📝 Sample Question:")
                sample = questions_data[0]
                print(f"   ID: {sample.get('id')}")
                print(f"   Question: {sample.get('question', '')[:100]}...")
                print(f"   Options: {sample.get('options', {})}")
                print(f"   Answer: {sample.get('answer')}")
        except Exception as e:
            print(f"❌ Error reading JSON: {e}")

def menu():
    """Interactive menu"""
    print("\n" + "="*70)
    print("🎯 Aptitude Questions - Database Manager")
    print("="*70)
    print("\n1. Initialize/Load Questions from JSON")
    print("2. Generate Question Sets (1-10)")
    print("3. List Questions in Database")
    print("4. Check JSON File")
    print("5. Clear All Questions (⚠️ Dangerous)")
    print("6. Exit")
    print("\n" + "="*70)
    
    choice = input("\nSelect option (1-6): ")
    
    if choice == "1":
        init_aptitude_questions()
    elif choice == "2":
        generate_sets()
    elif choice == "3":
        list_questions()
    elif choice == "4":
        check_json_file()
    elif choice == "5":
        clear_questions()
    elif choice == "6":
        print("👋 Goodbye!")
        exit()
    else:
        print("❌ Invalid option")
    
    # Show menu again
    input("\nPress Enter to continue...")
    menu()

if __name__ == "__main__":
    try:
        menu()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Fatal Error: {e}")
        import traceback
        traceback.print_exc()

