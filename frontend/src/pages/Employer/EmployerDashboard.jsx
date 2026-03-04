import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Plus, CreditCard } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, jobsRes, analyticsRes] = await Promise.all([
        api.get('/employers/profile'),
        api.get('/employers/jobs'),
        api.get('/employers/analytics'),
      ]);
      setProfile(profileRes.data);
      setJobs(jobsRes.data.jobs);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const subscriptionStatus = profile?.employer_profile?.subscription_status || 'none';
  const subscriptionPlan = profile?.employer_profile?.subscription_plan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="employer-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="dashboard-title">
              {profile?.employer_profile?.organization_name || 'Employer Dashboard'}
            </h1>
            <p className="text-muted-foreground">Manage your job postings and applicants</p>
          </div>
          <Link to="/employer/post-job">
            <Button className="rounded-full" data-testid="post-job-btn">
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          </Link>
        </div>

        {/* Subscription Alert */}
        {subscriptionStatus !== 'active' && (
          <Card className="mb-8 rounded-2xl border-[hsl(var(--employer-primary))] bg-[hsl(var(--employer-primary))]/5" data-testid="subscription-alert">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Upgrade Your Plan
              </CardTitle>
              <CardDescription>
                Subscribe to view applicant profiles and access advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/employer/subscription">
                <Button className="rounded-full" data-testid="view-plans-btn">
                  View Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl" data-testid="total-jobs-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-jobs">{analytics?.total_jobs || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="total-applicants-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-applicants">{analytics?.total_applicants || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="total-views-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-views">{analytics?.total_views || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="conversion-rate-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="conversion-rate">{analytics?.conversion_rate || 0}%</div>
            </CardContent>
          </Card>
        </div>


        {/* Boost Analytics */}
        {analytics?.boost_analytics && analytics.boost_analytics.boosted_jobs > 0 && (
          <Card className="mb-8 rounded-2xl border-orange-300 bg-gradient-to-br from-orange-50/50 to-pink-50/50" data-testid="boost-analytics-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Boost Impact Analytics
              </CardTitle>
              <CardDescription>See how job boosting improves your results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600" data-testid="boosted-jobs-count">
                    {analytics.boost_analytics.boosted_jobs}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Boosted Jobs</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600" data-testid="boost-conversion">
                    {analytics.boost_analytics.boost_conversion_rate}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Boosted Conversion</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    vs {analytics.boost_analytics.regular_conversion_rate}% regular
                  </div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600" data-testid="boost-improvement">
                    +{analytics.boost_analytics.boost_improvement}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Jobs */}
        <Card className="rounded-2xl" data-testid="recent-jobs-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Job Postings</CardTitle>
              {subscriptionStatus === 'active' && (
                <Badge className="rounded-full" data-testid="subscription-badge">
                  {subscriptionPlan} Plan
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length > 0 ? (
              <div className="space-y-4" data-testid="jobs-list">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex justify-between items-center p-4 border rounded-lg" data-testid={`job-item-${job.id}`}>
                    <div>
                      <h3 className="font-semibold" data-testid="job-title">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.applicants_count} applicants • {job.views_count} views
                      </p>
                    </div>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'} data-testid="job-status">
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" data-testid="no-jobs-message">
                <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
                <Link to="/employer/post-job">
                  <Button className="rounded-full" data-testid="create-first-job-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Job
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
