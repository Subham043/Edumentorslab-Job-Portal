import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { MapPin, Briefcase, DollarSign, Calendar, Building2, GraduationCap, Clock, Loader2 } from 'lucide-react';
import { formatSalary, formatDate } from '../utils/helpers';
import api from '../utils/api';
import { toast } from 'sonner';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    if (user.role !== 'learner') {
      toast.error('Only learners can apply to jobs');
      return;
    }

    setApplying(true);
    try {
      await api.post(`/jobs/${jobId}/apply`, { cover_letter: coverLetter });
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      navigate('/learner/applications');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--student-primary))]" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="job-details-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <Card className="mb-8 rounded-2xl" data-testid="job-header-card">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold" data-testid="job-title">{job.title}</h1>
                  <Badge variant="secondary" className="rounded-full" data-testid="job-type">{job.job_type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4" data-testid="employer-name">
                  <Building2 className="w-5 h-5" />
                  {job.employer_name}
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2" data-testid="job-location">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2" data-testid="job-salary">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                  <div className="flex items-center gap-2" data-testid="job-posted-date">
                    <Calendar className="w-4 h-4" />
                    Posted {formatDate(job.created_at)}
                  </div>
                  {job.applicants_count > 0 && (
                    <div className="flex items-center gap-2" data-testid="applicants-count">
                      <Briefcase className="w-4 h-4" />
                      {job.applicants_count} applicants
                    </div>
                  )}
                </div>
              </div>
              {user?.role === 'learner' && (
                <Button
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => setShowApplyModal(true)}
                  data-testid="apply-button"
                >
                  Apply Now
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Job Description */}
        <Card className="mb-8 rounded-2xl" data-testid="job-description-card">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none" data-testid="job-description">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>

        {/* Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {job.required_skills && job.required_skills.length > 0 && (
            <Card className="rounded-2xl" data-testid="required-skills-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" data-testid="skills-list">
                  {job.required_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="rounded-full">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl" data-testid="job-requirements-card">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.required_education && (
                <div className="flex items-start gap-2" data-testid="education-requirement">
                  <GraduationCap className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Education</div>
                    <div className="text-sm text-muted-foreground">{job.required_education}</div>
                  </div>
                </div>
              )}
              {job.experience_required && (
                <div className="flex items-start gap-2" data-testid="experience-requirement">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Experience</div>
                    <div className="text-sm text-muted-foreground">{job.experience_required}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <Link to="/jobs">
          <Button variant="outline" className="rounded-full" data-testid="back-to-jobs-button">
            Back to Jobs
          </Button>
        </Link>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-[500px]" data-testid="apply-modal">
          <DialogHeader>
            <DialogTitle data-testid="modal-title">Apply for {job.title}</DialogTitle>
            <DialogDescription>Submit your application with a cover letter</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
              <Textarea
                id="cover-letter"
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="resize-none"
                data-testid="cover-letter-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApplyModal(false)}
              disabled={applying}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={applying}
              data-testid="submit-application-button"
            >
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
