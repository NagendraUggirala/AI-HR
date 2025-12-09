"""
Quick test for AIInterviewTemplate fix

This script tests if the AI interview template creation is now working.
"""

from core.database import SessionLocal
from models import AIInterviewTemplate, User, Base
from sqlalchemy import text

def test_create_template():
    """Test creating an AI interview template"""
    
    db = SessionLocal()
    
    try:
        print("🧪 Testing AI Interview Template Creation...")
        print("="*60)
        
        # Check if user exists (need created_by reference)
        user = db.query(User).first()
        if not user:
            print("❌ No users found in database")
            print("💡 Create a user first or use created_by=None for testing")
            
            # Try without foreign key check
            response = input("\nTry creating template without user? (y/n): ")
            if response.lower() != 'y':
                return
            user_id = None
        else:
            user_id = user.id
            print(f"✅ Found user: {user.email} (ID: {user.id})")
        
        # Test data
        test_templates = [
            {
                "name": "Java Developer Interview",
                "interview_type": "technical",
                "questions": [
                    {"q": "What is Java?", "a": "Java is an object-oriented programming language"},
                    {"q": "Explain inheritance in Java", "a": "Inheritance is a mechanism where one class acquires properties of another"},
                    {"q": "What is polymorphism?", "a": None}
                ],
                "time_limit": 30,
                "difficulty": "medium",
                "created_by": user_id
            },
            {
                "name": "Python Backend Interview",
                "interview_type": "technical",
                "questions": [
                    {"q": "What is Python?", "a": "Python is a high-level programming language"},
                    {"q": "Explain decorators", "a": None},
                    {"q": "What are generators?", "a": None}
                ],
                "time_limit": 45,
                "difficulty": "hard",
                "created_by": user_id
            },
            {
                "name": "General Interview Questions",
                "interview_type": "behavioral",
                "questions": [
                    {"q": "Tell me about yourself", "a": None},
                    {"q": "Why do you want to work here?", "a": None},
                    {"q": "What are your strengths?", "a": None}
                ],
                "time_limit": 20,
                "difficulty": "easy",
                "created_by": user_id
            }
        ]
        
        created_count = 0
        for template_data in test_templates:
            try:
                print(f"\n📝 Creating: {template_data['name']}")
                print(f"   Type: {template_data['interview_type']}")
                print(f"   Questions: {len(template_data['questions'])}")
                print(f"   Duration: {template_data['time_limit']} min")
                
                template = AIInterviewTemplate(**template_data)
                db.add(template)
                db.flush()  # Flush to get ID without committing
                
                print(f"✅ Created successfully! ID: {template.id}")
                created_count += 1
                
            except Exception as e:
                print(f"❌ Failed: {e}")
                db.rollback()
                continue
        
        if created_count > 0:
            response = input(f"\n✅ Successfully created {created_count} templates. Commit to database? (y/n): ")
            if response.lower() == 'y':
                db.commit()
                print("✅ Templates saved to database!")
                
                # List all templates
                print("\n📋 All Templates:")
                all_templates = db.query(AIInterviewTemplate).all()
                for i, t in enumerate(all_templates, 1):
                    print(f"{i}. {t.name} ({t.interview_type}) - {len(t.questions)} questions")
            else:
                db.rollback()
                print("❌ Rolled back. No changes saved.")
        else:
            print("\n❌ No templates were created successfully")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def list_templates():
    """List all existing templates"""
    
    db = SessionLocal()
    
    try:
        templates = db.query(AIInterviewTemplate).all()
        
        if not templates:
            print("❌ No templates found")
            print("💡 Run test_create_template() to create some")
            return
        
        print(f"\n📊 Total Templates: {len(templates)}\n")
        
        for i, t in enumerate(templates, 1):
            print(f"\n{i}. {t.name}")
            print(f"   Type: {t.interview_type}")
            print(f"   Difficulty: {t.difficulty}")
            print(f"   Time Limit: {t.time_limit} minutes")
            print(f"   Questions ({len(t.questions)}):")
            for j, q in enumerate(t.questions, 1):
                print(f"      {j}. {q.get('q', 'N/A')}")
                if q.get('a'):
                    print(f"         → {q['a'][:60]}...")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def clear_templates():
    """Clear all templates"""
    
    db = SessionLocal()
    
    try:
        count = db.query(AIInterviewTemplate).count()
        if count == 0:
            print("❌ No templates to delete")
            return
        
        response = input(f"⚠️  Delete all {count} templates? (yes/no): ")
        if response.lower() == 'yes':
            db.query(AIInterviewTemplate).delete()
            db.commit()
            print(f"✅ Deleted {count} templates")
        else:
            print("❌ Cancelled")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

def menu():
    """Interactive menu"""
    print("\n" + "="*60)
    print("🧪 AI Interview Template - Test Suite")
    print("="*60)
    print("\n1. Test Create Templates")
    print("2. List All Templates")
    print("3. Clear All Templates")
    print("4. Exit")
    print("\n" + "="*60)
    
    choice = input("\nSelect option (1-4): ")
    
    if choice == "1":
        test_create_template()
    elif choice == "2":
        list_templates()
    elif choice == "3":
        clear_templates()
    elif choice == "4":
        print("👋 Goodbye!")
        exit()
    else:
        print("❌ Invalid option")
    
    input("\nPress Enter to continue...")
    menu()

if __name__ == "__main__":
    try:
        menu()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {e}")



