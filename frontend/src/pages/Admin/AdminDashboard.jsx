import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Briefcase, DollarSign, FileText } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="dashboard-title">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl" data-testid="total-users-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-users">{analytics?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {analytics?.total_learners || 0} Learners • {analytics?.total_employers || 0} Employers
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="total-jobs-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-jobs">{analytics?.total_jobs || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="total-applications-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-applications">{analytics?.total_applications || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl" data-testid="total-revenue-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-revenue">
                ₹{((analytics?.total_revenue || 0) / 100).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {analytics?.active_subscriptions || 0} Active Subscriptions
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl" data-testid="quick-actions-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              User management, job moderation, and detailed analytics features coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
