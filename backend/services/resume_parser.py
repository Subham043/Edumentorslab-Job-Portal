import os
import re
from typing import Dict, Optional
from PyPDF2 import PdfReader
from docx import Document

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = Document(file_path)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return ""

def extract_email(text: str) -> Optional[str]:
    """Extract email address from text."""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text."""
    phone_patterns = [
        r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
        r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    ]
    for pattern in phone_patterns:
        matches = re.findall(pattern, text)
        if matches:
            return matches[0]
    return None

def extract_skills(text: str) -> list:
    """Extract skills from text based on common keywords."""
    common_skills = [
        'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node',
        'mongodb', 'sql', 'postgresql', 'mysql', 'aws', 'docker', 'kubernetes',
        'html', 'css', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go',
        'machine learning', 'data science', 'ai', 'artificial intelligence',
        'project management', 'leadership', 'communication', 'teamwork'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill.title())
    
    return list(set(found_skills))[:10]

def parse_resume(file_path: str, filename: str) -> Dict:
    """Parse resume and extract key information."""
    
    if filename.lower().endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif filename.lower().endswith(('.docx', '.doc')):
        text = extract_text_from_docx(file_path)
    else:
        return {"error": "Unsupported file format"}
    
    if not text:
        return {"error": "Could not extract text from file"}
    
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    name = lines[0] if lines else ""
    
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    
    parsed_data = {
        "name": name,
        "email": email or "",
        "phone": phone or "",
        "skills": skills,
        "education": [],
        "experience": []
    }
    
    return parsed_data
