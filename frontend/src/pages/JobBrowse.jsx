import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { JobCard } from '../components/Jobs/JobCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { JOB_TYPES } from '../utils/constants';
import { toast } from 'sonner';

export default function JobBrowse() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (location) params.location = location;
      if (jobType) params.job_type = jobType;

      const response = await api.get('/jobs', { params });
      setJobs(response.data.jobs);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, jobType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="job-browse-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold" data-testid="page-title">Browse Jobs</h1>
          <p className="text-lg text-muted-foreground">Find your next opportunity from {jobs.length > 0 && `${jobs.length}+`} available positions</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-8 space-y-4" data-testid="job-filters">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search jobs, skills, companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 rounded-full"
                  data-testid="search-input"
                />
              </div>
            </div>
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-12 rounded-full"
              data-testid="location-input"
            />
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="h-12 rounded-full" data-testid="job-type-select">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="rounded-full px-8" data-testid="search-button">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20" data-testid="loading-spinner">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--student-primary))]" />
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="jobs-grid">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2" data-testid="pagination">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-full"
                  data-testid="prev-page-btn"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-full"
                  data-testid="next-page-btn"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20" data-testid="no-jobs-message">
            <p className="text-lg text-muted-foreground">No jobs found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
