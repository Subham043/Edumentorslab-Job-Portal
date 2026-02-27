import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL')

def send_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
    """Send email using Gmail SMTP."""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        text_part = MIMEText(body, 'plain')
        msg.attach(text_part)
        
        if html_body:
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_welcome_email(email: str, name: str, role: str):
    """Send welcome email to new user."""
    subject = "Welcome to E1 Job Portal!"
    body = f"""
Hi {name},

Welcome to E1 Job Portal!

Your {role} account has been successfully created.

{'Start browsing and applying to amazing opportunities!' if role == 'learner' else 'Start posting jobs and finding great candidates!'}

Best regards,
E1 Job Portal Team
    """
    return send_email(email, subject, body)

def send_application_confirmation(email: str, name: str, job_title: str):
    """Send application confirmation email to learner."""
    subject = "Application Submitted Successfully"
    body = f"""
Hi {name},

Your application for "{job_title}" has been submitted successfully!

We'll notify you when the employer reviews your application.

Best regards,
E1 Job Portal Team
    """
    return send_email(email, subject, body)

def send_status_update_email(email: str, name: str, job_title: str, status: str):
    """Send application status update email to learner."""
    status_messages = {
        'viewed': 'has been viewed by the employer',
        'shortlisted': 'has been shortlisted! Congratulations!',
        'rejected': 'was not successful this time',
        'selected': 'has been selected! Congratulations!'
    }
    
    subject = f"Application Status Update - {job_title}"
    body = f"""
Hi {name},

Your application for "{job_title}" {status_messages.get(status, 'has been updated')}.

{'Keep applying to more opportunities!' if status == 'rejected' else 'Good luck with your interview!'}

Best regards,
E1 Job Portal Team
    """
    return send_email(email, subject, body)

def send_subscription_confirmation(email: str, name: str, plan: str, end_date: str):
    """Send subscription confirmation email to employer."""
    subject = f"{plan.title()} Subscription Activated"
    body = f"""
Hi {name},

Your {plan.title()} subscription has been activated successfully!

You now have full access to view applicant profiles and manage your job postings.

Subscription valid until: {end_date}

Best regards,
E1 Job Portal Team
    """
    return send_email(email, subject, body)
