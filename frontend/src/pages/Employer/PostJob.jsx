import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import { JOB_TYPES } from '../../utils/constants';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    salary_min: '',
    salary_max: '',
    required_skills: [],
    required_education: '',
    experience_required: '',
  });
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !formData.required_skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : 0,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : 0,
      };

      await api.post('/employers/jobs', payload);
      toast.success('Job posted successfully!');
      navigate('/employer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="post-job-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="page-title">Post a Job</h1>
          <p className="text-muted-foreground">Create a new job posting to find great candidates</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="post-job-form">
          {/* Basic Information */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Frontend Developer"
                  required
                  data-testid="job-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={8}
                  required
                  data-testid="job-description-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mumbai, India"
                    required
                    data-testid="location-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger data-testid="job-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Salary Range (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Minimum Salary (₹)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="e.g. 500000"
                    data-testid="salary-min-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Maximum Salary (₹)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="e.g. 800000"
                    data-testid="salary-max-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    data-testid="skill-input"
                  />
                  <Button type="button" onClick={addSkill} data-testid="add-skill-button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2" data-testid="skills-list">
                  {formData.required_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(index)} data-testid={`remove-skill-${index}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_education">Required Education</Label>
                <Input
                  id="required_education"
                  value={formData.required_education}
                  onChange={(e) => setFormData({ ...formData, required_education: e.target.value })}
                  placeholder="e.g. Bachelor's Degree in Computer Science"
                  data-testid="education-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_required">Experience Required</Label>
                <Input
                  id="experience_required"
                  value={formData.experience_required}
                  onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                  placeholder="e.g. 2-3 years"
                  data-testid="experience-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/employer/dashboard')}
              className="rounded-full px-8"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full px-8"
              data-testid="submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Job'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
