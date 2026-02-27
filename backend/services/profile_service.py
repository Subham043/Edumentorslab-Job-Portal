from typing import Dict

def calculate_profile_completion(profile: Dict) -> int:
    """Calculate profile completion percentage."""
    
    total_fields = 12
    filled_fields = 0
    
    if profile.get('full_name'):
        filled_fields += 1
    if profile.get('phone'):
        filled_fields += 1
    if profile.get('location'):
        filled_fields += 1
    if profile.get('bio'):
        filled_fields += 1
    
    if profile.get('resume_url'):
        filled_fields += 1
    
    if profile.get('skills') and len(profile.get('skills', [])) >= 3:
        filled_fields += 1
    
    education = profile.get('education', [])
    if education and len(education) > 0:
        edu = education[0]
        if edu.get('degree'):
            filled_fields += 1
        if edu.get('institution'):
            filled_fields += 1
        if edu.get('year'):
            filled_fields += 1
    
    experience = profile.get('experience', [])
    if experience and len(experience) > 0:
        exp = experience[0]
        if exp.get('company'):
            filled_fields += 1
        if exp.get('role'):
            filled_fields += 1
        if exp.get('duration'):
            filled_fields += 1
    
    percentage = int((filled_fields / total_fields) * 100)
    return percentage
