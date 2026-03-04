from typing import Dict

def calculate_profile_completion(profile: Dict) -> int:
    """Calculate profile completion percentage."""
    
    total_fields = 20  # Increased from 12
    filled_fields = 0
    
    # Basic info (4 fields)
    if profile.get('full_name'):
        filled_fields += 1
    if profile.get('phone'):
        filled_fields += 1
    if profile.get('location'):
        filled_fields += 1
    if profile.get('bio'):
        filled_fields += 1
    
    # Resume (1 field)
    if profile.get('resume_url'):
        filled_fields += 1
    
    # Professional links (3 fields)
    if profile.get('portfolio_url'):
        filled_fields += 1
    if profile.get('linkedin_url'):
        filled_fields += 1
    if profile.get('github_url'):
        filled_fields += 1
    
    # Skills and qualifications (3 fields)
    if profile.get('skills') and len(profile.get('skills', [])) >= 3:
        filled_fields += 1
    if profile.get('languages') and len(profile.get('languages', [])) >= 1:
        filled_fields += 1
    if profile.get('certifications') and len(profile.get('certifications', [])) >= 1:
        filled_fields += 1
    
    # Education (3 fields)
    education = profile.get('education', [])
    if education and len(education) > 0:
        edu = education[0]
        if edu.get('degree'):
            filled_fields += 1
        if edu.get('institution'):
            filled_fields += 1
        if edu.get('year'):
            filled_fields += 1
    
    # Experience (3 fields)
    experience = profile.get('experience', [])
    if experience and len(experience) > 0:
        exp = experience[0]
        if exp.get('company'):
            filled_fields += 1
        if exp.get('role'):
            filled_fields += 1
        if exp.get('duration'):
            filled_fields += 1
    
    # Job preferences (2 fields)
    if profile.get('expected_salary_min') or profile.get('expected_salary_max'):
        filled_fields += 1
    if profile.get('notice_period'):
        filled_fields += 1
    
    percentage = int((filled_fields / total_fields) * 100)
    return percentage
