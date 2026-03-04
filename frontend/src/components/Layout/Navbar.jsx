import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Briefcase, LogOut, User, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'learner':
        return '/learner/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] flex items-center justify-center transition-transform group-hover:scale-110">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] bg-clip-text text-transparent">
              E1 Jobs
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/jobs" data-testid="browse-jobs-link">
                  <Button variant="ghost" className="rounded-full">
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/login" data-testid="login-link">
                  <Button variant="ghost" className="rounded-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button className="rounded-full bg-gradient-to-r from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] hover:opacity-90 transition-opacity">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {user.role !== 'admin' && (
                  <Link to="/jobs" data-testid="browse-jobs-auth-link">
                    <Button variant="ghost" className="rounded-full">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Jobs
                    </Button>
                  </Link>
                )}
                <Link to={getDashboardLink()} data-testid="dashboard-link">
                  <Button variant="ghost" className="rounded-full">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {user.role === 'learner' && (
                  <Link to="/learner/profile" data-testid="profile-link">
                    <Button variant="ghost" className="rounded-full">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={logout}
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
