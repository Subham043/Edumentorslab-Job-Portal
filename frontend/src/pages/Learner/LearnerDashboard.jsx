import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, TrendingUp, User } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, appsRes] = await Promise.all([
        api.get('/learners/profile'),
        api.get('/learners/applications', { params: { limit: 5 } }),
      ]);
      setProfile(profileRes.data);
      setApplications(appsRes.data.applications);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = profile?.learner_profile?.profile_completion || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="learner-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="dashboard-title">
            Welcome back, {profile?.learner_profile?.full_name || user?.email}!
          </h1>
          <p className="text-muted-foreground">Track your applications and manage your profile</p>
        </div>

        {/* Profile Completion */}
        <Card className="mb-8 rounded-2xl" data-testid="profile-completion-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Complete your profile to get better job matches</span>
                <span className="font-semibold" data-testid="profile-completion-percentage">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-3" />
            </div>
            {profileCompletion < 100 && (
              <Link to="/learner/profile">
                <Button className="rounded-full" data-testid="complete-profile-btn">
                  Complete Profile
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl" data-testid="applications-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-applications">{applications.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="profile-views-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="shortlisted-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications.filter(app => app.status === 'shortlisted').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl" data-testid="browse-jobs-card">
            <CardHeader>
              <CardTitle>Find Your Next Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Browse through thousands of job listings</p>
              <Link to="/jobs">
                <Button className="rounded-full" data-testid="browse-jobs-btn">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl" data-testid="applications-card">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Track your application status</p>
              <Link to="/learner/applications">
                <Button variant="outline" className="rounded-full" data-testid="view-applications-btn">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Applications
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
