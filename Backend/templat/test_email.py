"""
Test Email Configuration
Run this script to verify your email settings are working
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def test_email_config():
    """Test if email configuration is working"""
    
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASS = os.getenv("EMAIL_PASS")
    
    print("=" * 60)
    print("🧪 EMAIL CONFIGURATION TEST")
    print("=" * 60)
    
    # Check if credentials are set
    if not EMAIL_USER or EMAIL_USER == "your-email@gmail.com":
        print("❌ EMAIL_USER not configured in .env file")
        print("   Please set EMAIL_USER=your-email@gmail.com")
        return False
    
    if not EMAIL_PASS or EMAIL_PASS == "your-app-password":
        print("❌ EMAIL_PASS not configured in .env file")
        print("   Please set EMAIL_PASS=your-16-char-app-password")
        return False
    
    print(f"✅ EMAIL_USER found: {EMAIL_USER}")
    print(f"✅ EMAIL_PASS found: {'*' * len(EMAIL_PASS)}")
    print()
    
    # Test SMTP connection
    print("📧 Testing SMTP connection...")
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=10) as server:
            print("✅ Connected to Gmail SMTP server")
            
            # Test login
            print("🔐 Testing authentication...")
            server.login(EMAIL_USER, EMAIL_PASS)
            print("✅ Authentication successful!")
            
            # Send test email
            print("📤 Sending test email...")
            
            msg = MIMEMultipart()
            msg['Subject'] = "✅ AI Recruitment Platform - Email Test"
            msg['From'] = EMAIL_USER
            msg['To'] = EMAIL_USER  # Send to yourself
            
            body = """
Hello!

This is a test email from your AI Recruitment Platform.

If you're seeing this, your email configuration is working correctly! 🎉

You can now send AI Interview invitations to candidates.

Test Details:
✅ SMTP Connection: Success
✅ Authentication: Success
✅ Email Delivery: Success

Best regards,
AI Recruitment System
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server.send_message(msg)
            print("✅ Test email sent successfully!")
            print(f"📬 Check your inbox: {EMAIL_USER}")
            
    except smtplib.SMTPAuthenticationError:
        print("❌ AUTHENTICATION FAILED")
        print("   Possible issues:")
        print("   1. Wrong password (use App Password, not regular password)")
        print("   2. 2-Step Verification not enabled on Google account")
        print("   3. App Password not generated")
        print()
        print("   How to fix:")
        print("   1. Go to https://myaccount.google.com/security")
        print("   2. Enable 2-Step Verification")
        print("   3. Generate App Password for 'Mail'")
        print("   4. Update EMAIL_PASS in .env with the 16-char password")
        return False
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP ERROR: {str(e)}")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return False
    
    print()
    print("=" * 60)
    print("🎉 EMAIL CONFIGURATION TEST PASSED!")
    print("=" * 60)
    print()
    print("You can now:")
    print("✅ Send AI Interview links via email")
    print("✅ Send assessment invitations")
    print("✅ Send automated notifications")
    print()
    
    return True

if __name__ == "__main__":
    success = test_email_config()
    
    if not success:
        print()
        print("=" * 60)
        print("📚 QUICK FIX GUIDE")
        print("=" * 60)
        print()
        print("1. Create/Update .env file in project root:")
        print("   EMAIL_USER=your-email@gmail.com")
        print("   EMAIL_PASS=your-16-char-app-password")
        print()
        print("2. Generate Gmail App Password:")
        print("   https://myaccount.google.com/apppasswords")
        print()
        print("3. Restart your backend server:")
        print("   uvicorn main:app --reload")
        print()
        print("4. Run this test again:")
        print("   python test_email.py")
        print()



