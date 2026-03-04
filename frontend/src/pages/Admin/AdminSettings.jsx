import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="admin-settings-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="page-title">System Settings</h1>
          <p className="text-muted-foreground">Manage platform configuration and pricing</p>
        </div>

        {/* Pricing Settings */}
        <Card className="mb-6 rounded-2xl" data-testid="pricing-card">
          <CardHeader>
            <CardTitle>Subscription Pricing</CardTitle>
            <CardDescription>Set monthly subscription prices (in paise, 1 INR = 100 paise)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basic_plan_price">Basic Plan Price (₹)</Label>
                <Input
                  id="basic_plan_price"
                  type="number"
                  value={settings?.basic_plan_price / 100 || 0}
                  onChange={(e) => setSettings({ ...settings, basic_plan_price: parseInt(e.target.value) * 100 })}
                  data-testid="basic-price-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium_plan_price">Premium Plan Price (₹)</Label>
                <Input
                  id="premium_plan_price"
                  type="number"
                  value={settings?.premium_plan_price / 100 || 0}
                  onChange={(e) => setSettings({ ...settings, premium_plan_price: parseInt(e.target.value) * 100 })}
                  data-testid="premium-price-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boost_price">Job Boost Price (₹)</Label>
                <Input
                  id="boost_price"
                  type="number"
                  value={settings?.boost_price / 100 || 0}
                  onChange={(e) => setSettings({ ...settings, boost_price: parseInt(e.target.value) * 100 })}
                  data-testid="boost-price-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="mb-6 rounded-2xl" data-testid="platform-card">
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>Configure platform behavior and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_free_jobs">Max Free Jobs</Label>
                <Input
                  id="max_free_jobs"
                  type="number"
                  value={settings?.max_free_jobs || 0}
                  onChange={(e) => setSettings({ ...settings, max_free_jobs: parseInt(e.target.value) })}
                  data-testid="max-free-jobs-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_expiry_days">Job Expiry (Days)</Label>
                <Input
                  id="job_expiry_days"
                  type="number"
                  value={settings?.job_expiry_days || 0}
                  onChange={(e) => setSettings({ ...settings, job_expiry_days: parseInt(e.target.value) })}
                  data-testid="job-expiry-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boost_duration_days">Boost Duration (Days)</Label>
                <Input
                  id="boost_duration_days"
                  type="number"
                  value={settings?.boost_duration_days || 0}
                  onChange={(e) => setSettings({ ...settings, boost_duration_days: parseInt(e.target.value) })}
                  data-testid="boost-duration-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="mb-6 rounded-2xl" data-testid="features-card">
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_boost">Job Boost Feature</Label>
                <p className="text-sm text-muted-foreground">Allow employers to boost their jobs</p>
              </div>
              <Switch
                id="enable_boost"
                checked={settings?.enable_boost}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_boost: checked })}
                data-testid="boost-toggle"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable_subscriptions">Subscriptions</Label>
                <p className="text-sm text-muted-foreground">Enable subscription plans for employers</p>
              </div>
              <Switch
                id="enable_subscriptions"
                checked={settings?.enable_subscriptions}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_subscriptions: checked })}
                data-testid="subscriptions-toggle"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Put platform in maintenance mode</p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings?.maintenance_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                data-testid="maintenance-toggle"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full px-8"
            data-testid="save-button"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
