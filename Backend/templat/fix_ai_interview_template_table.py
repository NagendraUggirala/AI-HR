"""
Fix AIInterviewTemplate table to support structured questions

This script updates the database table to properly handle JSON questions.
Run this once after the model changes.

Usage:
    python fix_ai_interview_template_table.py
"""

from sqlalchemy import text
from core.database import engine, SessionLocal

def fix_table():
    """Fix the aiinterviewtemplate table structure"""
    
    print("🔧 Fixing AIInterviewTemplate table...")
    
    with engine.connect() as conn:
        try:
            # Check if table exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'aiinterviewtemplate'
                );
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("✅ Table doesn't exist yet, will be created with correct structure")
                return
            
            print("📊 Table exists, checking structure...")
            
            # Get current column type
            result = conn.execute(text("""
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'aiinterviewtemplate' 
                AND column_name = 'questions';
            """))
            current_type = result.scalar()
            
            print(f"   Current 'questions' column type: {current_type}")
            
            # Drop and recreate table (safest approach)
            response = input("\n⚠️  Do you want to drop and recreate the table? This will delete all AI interview templates. (yes/no): ")
            
            if response.lower() == 'yes':
                print("\n🗑️  Dropping old table...")
                conn.execute(text("DROP TABLE IF EXISTS aiinterviewtemplate CASCADE;"))
                conn.commit()
                print("✅ Table dropped")
                
                print("\n🔨 Creating new table with correct structure...")
                conn.execute(text("""
                    CREATE TABLE aiinterviewtemplate (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR NOT NULL,
                        interview_type VARCHAR NOT NULL,
                        questions JSON DEFAULT '[]',
                        time_limit INTEGER,
                        difficulty VARCHAR,
                        created_by INTEGER REFERENCES "user"(id)
                    );
                """))
                conn.commit()
                print("✅ Table created with correct structure")
                
                print("\n✨ Done! The table is now ready for structured questions.")
                print("   Questions format: [{'q': '...', 'a': '...'}, ...]")
            else:
                print("\n❌ Cancelled. No changes made.")
                print("\n💡 Alternative: You can manually alter the column:")
                print("   ALTER TABLE aiinterviewtemplate ALTER COLUMN questions TYPE JSON USING questions::json;")
                
        except Exception as e:
            print(f"\n❌ Error: {e}")
            conn.rollback()

def test_insert():
    """Test inserting a sample template"""
    
    print("\n🧪 Testing insert...")
    
    db = SessionLocal()
    try:
        from models import AIInterviewTemplate
        
        # Create test template
        test_template = AIInterviewTemplate(
            name="Test Interview",
            interview_type="technical",
            questions=[
                {"q": "What is Python?", "a": "Python is a programming language"},
                {"q": "Explain OOP", "a": None}
            ],
            time_limit=30,
            difficulty="medium",
            created_by=1
        )
        
        db.add(test_template)
        db.commit()
        db.refresh(test_template)
        
        print(f"✅ Test insert successful! Template ID: {test_template.id}")
        print(f"   Questions: {test_template.questions}")
        
        # Clean up test data
        response = input("\nDelete test template? (y/n): ")
        if response.lower() == 'y':
            db.delete(test_template)
            db.commit()
            print("✅ Test template deleted")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        db.rollback()
    finally:
        db.close()

def menu():
    """Interactive menu"""
    print("\n" + "="*60)
    print("🔧 AIInterviewTemplate Table Fix Utility")
    print("="*60)
    print("\n1. Fix table structure (drop & recreate)")
    print("2. Test insert")
    print("3. Exit")
    print("\n" + "="*60)
    
    choice = input("\nSelect option (1-3): ")
    
    if choice == "1":
        fix_table()
    elif choice == "2":
        test_insert()
    elif choice == "3":
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
        print(f"\n❌ Error: {e}")



