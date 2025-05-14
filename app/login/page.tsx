'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithGoogle, getTokenFromUrl } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { user, isAuthenticated, login } = useAuth();

    useEffect(() => {
        // Check if there's a token in the URL
        const token = getTokenFromUrl();
        if (token) {
            login(token);
            router.push('/');
        }
    }, [login, router]);

    // If user is already authenticated, redirect to home
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4 bg-background w-full">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg border shadow-lg bg-card">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome to Compute Community</h1>
                    <p className="mt-2 text-muted-foreground">Sign in to access your account</p>
                </div>

                <div className="space-y-4">
                    <Button
                        className="w-full flex items-center justify-center gap-2"
                        onClick={loginWithGoogle}
                        variant="primary"
                    >
                        <FaGoogle className="h-4 w-4" />
                        Sign in with Google
                    </Button>

                    <div className="text-center text-sm text-muted-foreground mt-6">
                        <p>
                            By signing in, you agree to our{' '}
                            <Link href="/terms" className="underline hover:text-primary">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="underline hover:text-primary">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 