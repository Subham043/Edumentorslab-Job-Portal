import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Upload, Loader2, X, Plus } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function LearnerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    education: [],
    experience: [],
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/learners/profile');
      setProfile(response.data);
      const learnerProfile = response.data.learner_profile || {};
      setFormData({
        full_name: learnerProfile.full_name || '',
        phone: learnerProfile.phone || '',
        location: learnerProfile.location || '',
        bio: learnerProfile.bio || '',
        skills: learnerProfile.skills || [],
        education: learnerProfile.education || [],
        experience: learnerProfile.experience || [],
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/learners/profile', formData);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/)) {
      toast.error('Only PDF and DOCX files are supported');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/learners/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Resume uploaded successfully!');
      
      if (response.data.parsed_data) {
        const parsed = response.data.parsed_data;
        setFormData(prev => ({
          ...prev,
          full_name: parsed.name || prev.full_name,
          phone: parsed.phone || prev.phone,
          skills: parsed.skills && parsed.skills.length > 0 ? parsed.skills : prev.skills,
        }));
        toast.info('Profile auto-filled from resume!');
      }

      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const profileCompletion = profile?.learner_profile?.profile_completion || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--student-primary))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="learner-profile-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="page-title">My Profile</h1>
          <p className="text-muted-foreground">Complete your profile to get better job matches</p>
        </div>

        {/* Profile Completion */}
        <Card className="mb-8 rounded-2xl" data-testid="profile-completion-card">
          <CardHeader>


        {/* Professional Links */}
        <Card className="mb-8 rounded-2xl" data-testid="professional-links-card">
          <CardHeader>
            <CardTitle>Professional Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio/Website</Label>
              <Input
                id="portfolio_url"
                value={formData.portfolio_url || ''}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
                data-testid="portfolio-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url || ''}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                data-testid="linkedin-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub Profile</Label>
              <Input
                id="github_url"
                value={formData.github_url || ''}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/yourusername"
                data-testid="github-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Qualifications */}
        <Card className="mb-8 rounded-2xl" data-testid="qualifications-card">
          <CardHeader>
            <CardTitle>Languages & Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Languages Known</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a language"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !formData.languages?.includes(value)) {
                        setFormData({ ...formData, languages: [...(formData.languages || []), value] });
                        e.target.value = '';
                      }
                    }
                  }}
                  data-testid="language-input"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.languages || []).map((lang, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {lang}
                    <button onClick={() => setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== index) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a certification"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !formData.certifications?.includes(value)) {
                        setFormData({ ...formData, certifications: [...(formData.certifications || []), value] });
                        e.target.value = '';
                      }
                    }
                  }}
                  data-testid="certification-input"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.certifications || []).map((cert, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {cert}
                    <button onClick={() => setFormData({ ...formData, certifications: formData.certifications.filter((_, i) => i !== index) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Preferences */}
        <Card className="mb-8 rounded-2xl" data-testid="job-preferences-card">
          <CardHeader>
            <CardTitle>Job Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected_salary_min">Expected Salary Min (\u20b9)</Label>
                <Input
                  id="expected_salary_min"
                  type="number"
                  value={formData.expected_salary_min || ''}
                  onChange={(e) => setFormData({ ...formData, expected_salary_min: parseInt(e.target.value) || 0 })}
                  placeholder="500000"
                  data-testid="salary-min-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_salary_max">Expected Salary Max (\u20b9)</Label>
                <Input
                  id="expected_salary_max"
                  type="number"
                  value={formData.expected_salary_max || ''}
                  onChange={(e) => setFormData({ ...formData, expected_salary_max: parseInt(e.target.value) || 0 })}
                  placeholder="800000"
                  data-testid="salary-max-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notice_period">Notice Period</Label>
                <Input
                  id="notice_period"
                  value={formData.notice_period || ''}
                  onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                  placeholder="e.g., 30 days, Immediate"
                  data-testid="notice-period-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work_authorization">Work Authorization</Label>
                <Input
                  id="work_authorization"
                  value={formData.work_authorization || ''}
                  onChange={(e) => setFormData({ ...formData, work_authorization: e.target.value })}
                  placeholder="e.g., Indian Citizen, Work Permit"
                  data-testid="work-auth-input"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="willing_to_relocate"
                checked={formData.willing_to_relocate || false}
                onChange={(e) => setFormData({ ...formData, willing_to_relocate: e.target.checked })}
                className="w-4 h-4"
                data-testid="relocate-checkbox"
              />
              <Label htmlFor="willing_to_relocate">Willing to relocate</Label>
            </div>
          </CardContent>
        </Card>

            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your profile is {profileCompletion}% complete</span>
              <span className="font-semibold" data-testid="completion-percentage">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-3" />
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card className="mb-8 rounded-2xl" data-testid="resume-upload-card">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile?.learner_profile?.resume_url && (
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg" data-testid="current-resume">
                  <span className="text-sm flex-1">Resume uploaded</span>
                  <Badge variant="outline">Uploaded</Badge>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                  data-testid="resume-upload-input"
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading and parsing resume...
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Upload PDF or DOCX. We'll auto-fill your profile from the resume.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="mb-8 rounded-2xl" data-testid="basic-info-card">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  data-testid="full-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-9876543210"
                  data-testid="phone-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Mumbai, India"
                data-testid="location-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell employers about yourself..."
                rows={4}
                data-testid="bio-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-8 rounded-2xl" data-testid="skills-card">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                data-testid="skill-input"
              />
              <Button onClick={addSkill} data-testid="add-skill-button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2" data-testid="skills-list">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {skill}
                  <button onClick={() => removeSkill(index)} className="ml-1" data-testid={`remove-skill-${index}`}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full px-8"
            data-testid="save-profile-button"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
