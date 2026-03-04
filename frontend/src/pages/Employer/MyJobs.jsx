import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Loader2, TrendingUp, Users, Eye, Rocket } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boostingJob, setBoostingJob] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/employers/jobs');
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleBoostClick = (job) => {
    setSelectedJob(job);
    setShowBoostModal(true);
  };

  const handleBoost = async () => {
    if (!selectedJob) return;

    setBoostingJob(selectedJob.id);
    try {
      const orderResponse = await api.post(`/employers/boost-job/${selectedJob.id}`);
      const { order_id, amount, currency, key_id, job_id } = orderResponse.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'E1 Job Portal',
        description: `Boost "${selectedJob.title}" for 7 days`,
        order_id: order_id,
        handler: async function (response) {
          try {
            await api.post('/employers/verify-boost', null, {
              params: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                job_id: job_id,
              },
            });

            toast.success('Job boosted successfully for 7 days!');
            setShowBoostModal(false);
            fetchJobs();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        theme: {
          color: '#0ea5e9',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate boost');
    } finally {
      setBoostingJob(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--employer-primary))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="my-jobs-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="page-title">My Job Postings</h1>
            <p className="text-muted-foreground">Manage your job listings</p>
          </div>
          <Link to="/employer/post-job">
            <Button className="rounded-full" data-testid="post-job-button">
              Post New Job
            </Button>
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-4" data-testid="jobs-list">
            {jobs.map((job) => (
              <Card key={job.id} className="rounded-2xl transition-all hover:shadow-lg" data-testid={`job-${job.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold" data-testid="job-title">{job.title}</h3>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'} data-testid="job-status">
                          {job.status}
                        </Badge>
                        {job.is_boosted && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white" data-testid="boosted-badge">
                            <Rocket className="w-3 h-3 mr-1" />
                            Boosted
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Posted {formatDate(job.created_at)}
                      </p>
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2" data-testid="applicants-count">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span><strong>{job.applicants_count}</strong> applicants</span>
                        </div>
                        <div className="flex items-center gap-2" data-testid="views-count">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span><strong>{job.views_count}</strong> views</span>
                        </div>
                        <div className="flex items-center gap-2" data-testid="conversion-rate">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <strong>{job.views_count > 0 ? ((job.applicants_count / job.views_count) * 100).toFixed(1) : 0}%</strong> conversion
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/employer/jobs/${job.id}/applicants`}>
                        <Button variant="outline" size="sm" className="rounded-full w-full" data-testid="view-applicants-button">
                          View Applicants
                        </Button>
                      </Link>
                      {!job.is_boosted && job.status === 'active' && (
                        <Button
                          size="sm"
                          className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90"
                          onClick={() => handleBoostClick(job)}
                          data-testid="boost-button"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Boost Job
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl" data-testid="no-jobs-card">
            <CardContent className="py-20 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                You haven't posted any jobs yet
              </p>
              <Link to="/employer/post-job">
                <Button className="rounded-full" data-testid="post-first-job-button">
                  Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Boost Modal */}
      <Dialog open={showBoostModal} onOpenChange={setShowBoostModal}>
        <DialogContent className="sm:max-w-[500px]" data-testid="boost-modal">
          <DialogHeader>
            <DialogTitle data-testid="modal-title">Boost Your Job</DialogTitle>
            <DialogDescription>
              Make your job listing stand out and get 10x more visibility!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3 mb-4">
                <Rocket className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Job Boost Benefits</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">✓</span>
                      <span>Appear at the top of search results for 7 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">✓</span>
                      <span>Get 10x more visibility from job seekers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">✓</span>
                      <span>Stand out with special badge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">✓</span>
                      <span>Increase applications by up to 300%</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="text-center pt-4 border-t border-orange-200">
                <p className="text-2xl font-bold text-orange-600">₹49</p>
                <p className="text-sm text-muted-foreground">for 7 days</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBoostModal(false)}
              disabled={boostingJob}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBoost}
              disabled={boostingJob}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90"
              data-testid="confirm-boost-button"
            >
              {boostingJob ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Boost Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
