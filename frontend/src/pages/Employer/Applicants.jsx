import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Loader2, User, Mail, Phone, MapPin, FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import { APPLICATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, jobRes] = await Promise.all([
        api.get('/employers/profile'),
        api.get(`/jobs/${jobId}`)
      ]);
      
      setJob(jobRes.data);
      const profile = profileRes.data;
      const subStatus = profile.employer_profile?.subscription_status === 'active';
      setHasSubscription(subStatus);

      if (subStatus) {
        const applicantsRes = await api.get(`/employers/jobs/${jobId}/applicants`);
        setApplicants(applicantsRes.data.applicants);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Active subscription required to view applicants');
      } else {
        toast.error('Failed to load applicants');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (applicant) => {
    setSelectedApplicant(applicant);
    setNewStatus(applicant.status);
    setNotes(applicant.notes || '');
    setShowStatusModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedApplicant) return;

    setUpdating(true);
    try {
      await api.put(`/employers/applications/${selectedApplicant.id}/status`, {
        status: newStatus,
        notes: notes
      });

      toast.success('Application status updated successfully');
      setShowStatusModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--employer-primary))]" />
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="subscription-required">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="rounded-2xl text-center" data-testid="subscription-card">
            <CardContent className="py-20">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--employer-primary))]/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-[hsl(var(--employer-primary))]" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Subscription Required</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Upgrade to a paid plan to view applicant profiles and contact information
              </p>
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={() => navigate('/employer/subscription')}
                data-testid="upgrade-button"
              >
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="applicants-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/employer/my-jobs')}
            className="mb-4"
            data-testid="back-button"
          >
            ← Back to My Jobs
          </Button>
          <h1 className="text-4xl font-bold mb-2" data-testid="page-title">
            Applicants for {job?.title}
          </h1>
          <p className="text-muted-foreground">
            {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'}
          </p>
        </div>

        {/* Applicants List */}
        {applicants.length > 0 ? (
          <div className="space-y-4" data-testid="applicants-list">
            {applicants.map((applicant) => (
              <Card key={applicant.id} className="rounded-2xl transition-all hover:shadow-lg" data-testid={`applicant-${applicant.id}`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Applicant Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] flex items-center justify-center text-white font-semibold">
                            {applicant.learner_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-1" data-testid="applicant-name">
                              {applicant.learner_name}
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2" data-testid="applicant-email">
                                <Mail className="w-4 h-4" />
                                {applicant.learner_email}
                              </div>
                              {applicant.learner_phone && (
                                <div className="flex items-center gap-2" data-testid="applicant-phone">
                                  <Phone className="w-4 h-4" />
                                  {applicant.learner_phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={APPLICATION_STATUS[applicant.status]?.color || 'bg-gray-100 text-gray-800'}
                          data-testid="applicant-status"
                        >
                          {APPLICATION_STATUS[applicant.status]?.label || applicant.status}
                        </Badge>
                      </div>

                      {applicant.cover_letter && (
                        <div className="bg-secondary/50 p-4 rounded-lg" data-testid="cover-letter">
                          <p className="text-sm font-medium mb-2">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground">{applicant.cover_letter}</p>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        Applied on {formatDate(applicant.applied_at)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      {applicant.resume_url && (
                        <Button
                          variant="outline"
                          className="rounded-full w-full"
                          onClick={() => window.open(applicant.resume_url, '_blank')}
                          data-testid="download-resume-button"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="rounded-full w-full"
                        onClick={() => handleStatusUpdate(applicant)}
                        data-testid="update-status-button"
                      >
                        Update Status
                      </Button>
                      {applicant.status === 'applied' && (
                        <Button
                          className="rounded-full w-full bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedApplicant(applicant);
                            setNewStatus('shortlisted');
                            setNotes('');
                            submitStatusUpdate();
                          }}
                          data-testid="shortlist-button"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Shortlist
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl" data-testid="no-applicants-card">
            <CardContent className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No applicants yet. Try boosting your job to get more visibility!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-[500px]" data-testid="status-modal">
          <DialogHeader>
            <DialogTitle data-testid="modal-title">Update Application Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedApplicant?.learner_name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger data-testid="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPLICATION_STATUS).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this applicant..."
                rows={4}
                data-testid="notes-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
              disabled={updating}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={submitStatusUpdate}
              disabled={updating}
              data-testid="submit-button"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
