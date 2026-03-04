import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader2, MapPin, Briefcase, Calendar } from 'lucide-react';
import { APPLICATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      
      const response = await api.get('/learners/applications', { params });
      setApplications(response.data.applications);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="my-applications-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="page-title">My Applications</h1>
            <p className="text-muted-foreground">Track your job applications</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] rounded-full" data-testid="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {Object.entries(APPLICATION_STATUS).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20" data-testid="loading-spinner">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--student-primary))]" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4" data-testid="applications-list">
            {applications.map((app) => (
              <Card key={app.id} className="rounded-2xl transition-all hover:shadow-lg" data-testid={`application-${app.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          to={`/jobs/${app.job?.id}`}
                          className="text-xl font-semibold hover:text-[hsl(var(--student-primary))] transition-colors"
                          data-testid="job-title-link"
                        >
                          {app.job?.title || 'N/A'}
                        </Link>
                        <Badge
                          className={APPLICATION_STATUS[app.status]?.color || 'bg-gray-100 text-gray-800'}
                          data-testid="application-status"
                        >
                          {APPLICATION_STATUS[app.status]?.label || app.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3" data-testid="employer-name">
                        <Briefcase className="w-4 h-4" />
                        {app.job?.employer_name || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="applied-date">
                        <Calendar className="w-4 h-4" />
                        Applied on {formatDate(app.applied_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl" data-testid="no-applications-card">
            <CardContent className="py-20 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {filter === 'all' ? "You haven't applied to any jobs yet" : `No ${filter} applications found`}
              </p>
              <Link to="/jobs">
                <button className="rounded-full px-6 py-3 bg-gradient-to-r from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] text-white font-medium hover:opacity-90 transition-opacity" data-testid="browse-jobs-button">
                  Browse Jobs
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
