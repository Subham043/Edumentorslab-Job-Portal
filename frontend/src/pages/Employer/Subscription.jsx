import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import api from '../../utils/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = async (plan) => {
    if (plan.price === 0) {
      toast.info('You are already on the free plan');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.name.toLowerCase());

    try {
      const orderResponse = await api.post('/payments/create-order', {
        plan: plan.name.toLowerCase(),
        amount: plan.price * 100,
        currency: 'INR',
      });

      const { order_id, amount, currency, key_id } = orderResponse.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'E1 Job Portal',
        description: `${plan.name} Subscription`,
        order_id: order_id,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.name.toLowerCase(),
            });

            toast.success('Subscription activated successfully!');
            navigate('/employer/dashboard');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(210,40%,96%)] to-[hsl(var(--background))]" data-testid="subscription-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="page-title">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            Unlock full access to applicant profiles and advanced features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <Card
              key={plan.name}
              className={`rounded-2xl transition-all hover:shadow-xl ${index === 1 ? 'border-[hsl(var(--employer-primary))] shadow-lg scale-105' : ''}`}
              data-testid={`plan-${plan.name.toLowerCase()}`}
            >
              <CardHeader>
                {index === 1 && (
                  <Badge className="w-fit mb-2" data-testid="popular-badge">Most Popular</Badge>
                )}
                <CardTitle className="text-2xl" data-testid="plan-name">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="text-4xl font-bold mt-4" data-testid="plan-price">
                    ₹{plan.price}
                    {plan.price > 0 && <span className="text-lg font-normal text-muted-foreground">/month</span>}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3" data-testid="features-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[hsl(var(--employer-primary))] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full rounded-full"
                  variant={index === 1 ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading}
                  data-testid="subscribe-button"
                >
                  {loading && selectedPlan === plan.name.toLowerCase() ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : plan.price === 0 ? (
                    'Current Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include 30-day money-back guarantee</p>
          <p className="mt-2">Test mode: Use card 4111 1111 1111 1111 with any future date and CVV</p>
        </div>
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
