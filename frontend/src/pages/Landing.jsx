import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Briefcase, Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))] py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8" data-testid="hero-content">
              <div className="inline-block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--student-primary))] bg-[hsl(var(--student-primary))]/10 px-4 py-2 rounded-full">
                  Your Career Journey Starts Here
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">
                Find Your
                <span className="block bg-gradient-to-r from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] bg-clip-text text-transparent">
                  Dream Job
                </span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                Connect with top employers and discover opportunities that match your skills and ambitions. Your future starts today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" data-testid="get-started-btn">
                  <Button className="rounded-full px-8 py-6 text-lg font-medium bg-gradient-to-r from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] hover:opacity-90 transition-all hover:scale-105">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/jobs" data-testid="browse-jobs-btn">
                  <Button variant="outline" className="rounded-full px-8 py-6 text-lg font-medium hover:bg-accent transition-all hover:scale-105">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold">5K+</div>
                  <div className="text-sm text-muted-foreground">Active Jobs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-muted-foreground">Job Seekers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">Companies</div>
                </div>
              </div>
            </div>
            <div className="relative" data-testid="hero-image">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1758876017801-f5a892ee460a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvcmtpbmclMjBjcmVhdGl2ZSUyMG9mZmljZXxlbnwwfHx8fDE3NzIxNzEwNzJ8MA&ixlib=rb-4.1.0&q=85"
                  alt="Professional working"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] rounded-2xl opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Why Choose E1 Jobs?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make job hunting and hiring seamless, efficient, and effective.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1" data-testid="feature-card-1">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--student-primary))]/20 to-[hsl(var(--student-primary))]/10 flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-[hsl(var(--student-primary))]" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Smart Job Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our algorithm matches your skills and preferences with the perfect opportunities.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1" data-testid="feature-card-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--employer-primary))]/20 to-[hsl(var(--employer-primary))]/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[hsl(var(--employer-primary))]" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Top Companies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with leading universities and organizations looking for talented individuals.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:-translate-y-1" data-testid="feature-card-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--chart-3))]/20 to-[hsl(var(--chart-3))]/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-[hsl(var(--chart-3))]" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Career Growth</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your applications, get feedback, and grow your career with every opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-white/90">
            Join thousands of job seekers and employers already using E1 Jobs.
          </p>
          <Link to="/register" data-testid="cta-register-btn">
            <Button className="rounded-full px-8 py-6 text-lg font-medium bg-white text-[hsl(var(--student-primary))] hover:bg-white/90 transition-all hover:scale-105">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
