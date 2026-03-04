import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { formatSalary, formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export const JobCard = ({ job }) => {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1" data-testid={`job-card-${job.id}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 group-hover:text-[hsl(var(--student-primary))] transition-colors" data-testid="job-title">
              {job.title}
            </h3>
            <p className="text-muted-foreground font-medium" data-testid="employer-name">{job.employer_name}</p>
          </div>
          <Badge variant="secondary" className="rounded-full" data-testid="job-type">
            {job.job_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" data-testid="job-location">
            <MapPin className="w-4 h-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-1" data-testid="job-salary">
            <DollarSign className="w-4 h-4" />
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <div className="flex items-center gap-1" data-testid="job-date">
            <Calendar className="w-4 h-4" />
            {formatDate(job.created_at)}
          </div>
        </div>
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-2" data-testid="job-skills">
            {job.required_skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="outline" className="rounded-full text-xs">
                {skill}
              </Badge>
            ))}
            {job.required_skills.length > 5 && (
              <Badge variant="outline" className="rounded-full text-xs">
                +{job.required_skills.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to={`/jobs/${job.id}`} className="w-full" data-testid="view-details-btn">
          <Button className="w-full rounded-full" variant="outline">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
