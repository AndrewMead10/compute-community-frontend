'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User, CreditCard, Check, AlertTriangle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { fetchWithAuth } from '@/lib/auth';

// Subscription tier types
type SubscriptionTier = 'free' | 'basic' | 'premium';

interface SubscriptionPlan {
    tier: SubscriptionTier;
    name: string;
    description: string;
    price: number;
    features: string[];
}

// Define subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
    {
        tier: 'free',
        name: 'Free',
        description: 'Basic access to the platform',
        price: 0,
        features: [
            'Access to basic features',
            'Limited usage',
            'Community support'
        ]
    },
    {
        tier: 'basic',
        name: 'Basic',
        description: 'Enhanced access with more features',
        price: 5,
        features: [
            'All Free features',
            'Increased usage limits',
            'Priority support',
            'Additional features'
        ]
    },
    {
        tier: 'premium',
        name: 'Premium',
        description: 'Full access to all features',
        price: 20,
        features: [
            'All Basic features',
            'Unlimited usage',
            'Premium support',
            'Early access to new features',
            'Advanced analytics'
        ]
    }
];

export default function ProfilePage() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Subscription state
    const [currentSubscription, setCurrentSubscription] = useState<{
        tier: SubscriptionTier;
        status: string;
        startDate?: Date;
        endDate?: Date;
    }>({ tier: 'free', status: 'active' });

    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('free');
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

    // Check for subscription success/cancel from URL params
    useEffect(() => {
        const subscriptionSuccess = searchParams.get('subscription_success');
        const subscriptionCanceled = searchParams.get('subscription_canceled');

        if (subscriptionSuccess === 'true') {
            toast.success("Subscription Updated", {
                description: "Your subscription has been successfully updated."
            });
        } else if (subscriptionCanceled === 'true') {
            toast.error("Subscription Canceled", {
                description: "Your subscription change was canceled."
            });
        }
    }, [searchParams]);

    // Fetch current subscription when user is loaded
    useEffect(() => {
        if (user && isAuthenticated) {
            fetchCurrentSubscription();
        }
    }, [user, isAuthenticated]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]);

    // Fetch current subscription from API
    const fetchCurrentSubscription = async () => {
        try {
            const data = await fetchWithAuth('/subscriptions/current');
            setCurrentSubscription({
                tier: data.tier,
                status: data.status,
                startDate: data.start_date ? new Date(data.start_date) : undefined,
                endDate: data.end_date ? new Date(data.end_date) : undefined
            });
            setSelectedTier(data.tier);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        }
    };

    // Handle subscription upgrade/change
    const handleSubscriptionChange = async () => {
        if (selectedTier === currentSubscription.tier) {
            return; // No change needed
        }

        setIsUpgrading(true);

        try {
            const data = await fetchWithAuth('/subscriptions/checkout', {
                method: 'POST',
                body: JSON.stringify({ tier: selectedTier })
            });

            // If free tier, refresh the subscription
            if (selectedTier === 'free') {
                await fetchCurrentSubscription();
                toast.success("Subscription Updated", {
                    description: "Your subscription has been downgraded to the Free tier."
                });
            }
            // If paid tier, redirect to checkout
            else if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to update subscription"
            });
        } finally {
            setIsUpgrading(false);
            setShowUpgradeDialog(false);
        }
    };

    // Handle subscription cancellation
    const handleCancelSubscription = async () => {
        setIsCanceling(true);

        try {
            await fetchWithAuth('/subscriptions/cancel', {
                method: 'POST',
                body: JSON.stringify({ cancel_at_period_end: true })
            });

            await fetchCurrentSubscription();
            setShowCancelDialog(false);
            toast.success("Subscription Canceled", {
                description: "Your subscription will be canceled at the end of the billing period."
            });
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to cancel subscription"
            });
        } finally {
            setIsCanceling(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="flex flex-col items-center justify-start w-full h-full overflow-y-auto">
            <div className="container max-w-2xl py-10 px-4">
                <h1 className="text-2xl font-bold mb-8 text-center">Profile</h1>

                {/* Subscription status alert */}
                {currentSubscription.tier !== 'free' && currentSubscription.status === 'canceled' && (
                    <Alert className="mb-6" variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Subscription Ending</AlertTitle>
                        <AlertDescription>
                            Your subscription will end on {currentSubscription.endDate?.toLocaleDateString()}.
                            You will be downgraded to the Free tier after this date.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-8">
                    {/* Profile Section */}
                    <div className="flex items-center justify-between pb-4 border-b">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                                {user.picture ? (
                                    <AvatarImage src={user.picture} alt={user.name} />
                                ) : (
                                    <AvatarFallback>
                                        <User className="h-6 w-6" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-medium">{user.name}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="customSecondary"
                            size="sm"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    {/* Subscription Section */}
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium">Subscription</h2>
                                <div className="flex items-center mt-1">
                                    <p className="capitalize font-medium">{currentSubscription.tier} Plan</p>
                                    {currentSubscription.status === 'canceled' && (
                                        <span className="text-sm text-muted-foreground ml-2">
                                            (Ends {currentSubscription.endDate?.toLocaleDateString()})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setShowUpgradeDialog(true)}
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Upgrade
                                </Button>
                                {currentSubscription.tier !== 'free' && currentSubscription.status !== 'canceled' && (
                                    <Button
                                        variant="customSecondary"
                                        size="sm"
                                        onClick={() => setShowCancelDialog(true)}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upgrade Plan Dialog */}
                <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>Choose a Plan</DialogTitle>
                            <DialogDescription>
                                Select the subscription plan that works best for you
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                            {subscriptionPlans.map((plan) => (
                                <div
                                    key={plan.tier}
                                    className={`p-4 rounded-lg border ${selectedTier === plan.tier ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
                                    onClick={() => setSelectedTier(plan.tier)}
                                >
                                    <div className="mb-4">
                                        <h3 className="font-medium">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                        <p className="text-xl font-bold mt-2">
                                            {plan.price === 0 ? 'Free' : `$${plan.price}/month`}
                                        </p>
                                    </div>
                                    <ul className="space-y-2 text-sm mb-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <Check className="h-3.5 w-3.5 mr-2 text-primary mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id={plan.tier}
                                                name="plan"
                                                checked={selectedTier === plan.tier}
                                                onChange={() => setSelectedTier(plan.tier)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={plan.tier} className="text-sm font-medium">
                                                {currentSubscription.tier === plan.tier
                                                    ? 'Current Plan'
                                                    : 'Select Plan'}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button variant="customSecondary" onClick={() => setShowUpgradeDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubscriptionChange}
                                disabled={selectedTier === currentSubscription.tier || isUpgrading}
                            >
                                {isUpgrading ? (
                                    <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {selectedTier === 'free' ? 'Downgrade' : currentSubscription.tier === 'free' ? 'Upgrade' : 'Change'} Plan
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Cancel Subscription Dialog */}
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cancel Subscription</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button variant="customSecondary" onClick={() => setShowCancelDialog(false)}>
                                Keep Subscription
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancelSubscription}
                                disabled={isCanceling}
                            >
                                {isCanceling ? (
                                    <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Cancel Subscription'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
} 