import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Briefcase, Loader2, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'learner',
    full_name: '',
    organization_name: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await register(formData);
      toast.success('Registration successful!');
      
      if (user.role === 'learner') {
        navigate('/learner/dashboard');
      } else if (user.role === 'employer') {
        navigate('/employer/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))] px-4 py-12" data-testid="register-page">
      <Card className="w-full max-w-md rounded-2xl shadow-xl" data-testid="register-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Get Started</CardTitle>
          <CardDescription className="text-base">
            Create your account to begin your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            <div className="space-y-3">
              <Label>I am a</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                className="grid grid-cols-2 gap-4"
                data-testid="role-selector"
              >
                <div>
                  <RadioGroupItem value="learner" id="learner" className="peer sr-only" />
                  <Label
                    htmlFor="learner"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[hsl(var(--student-primary))] peer-data-[state=checked]:bg-[hsl(var(--student-primary))]/5 cursor-pointer transition-all"
                    data-testid="learner-role-option"
                  >
                    <User className="mb-3 h-6 w-6" />
                    <span className="font-medium">Job Seeker</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="employer" id="employer" className="peer sr-only" />
                  <Label
                    htmlFor="employer"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[hsl(var(--employer-primary))] peer-data-[state=checked]:bg-[hsl(var(--employer-primary))]/5 cursor-pointer transition-all"
                    data-testid="employer-role-option"
                  >
                    <Building2 className="mb-3 h-6 w-6" />
                    <span className="font-medium">Employer</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 rounded-lg"
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12 rounded-lg"
                data-testid="password-input"
              />
            </div>

            {formData.role === 'learner' ? (
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="h-12 rounded-lg"
                  data-testid="full-name-input"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name</Label>
                <Input
                  id="organization_name"
                  type="text"
                  placeholder="ABC University"
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  className="h-12 rounded-lg"
                  data-testid="organization-name-input"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-gradient-to-r from-[hsl(var(--student-primary))] to-[hsl(var(--employer-primary))] hover:opacity-90 text-base font-medium"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-medium text-[hsl(var(--student-primary))] hover:underline" data-testid="login-link">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
