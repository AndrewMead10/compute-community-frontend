'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Book, MessageSquare, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/useAuth';

export function TopNav() {
    const { isAuthenticated, user } = useAuth();

    return (
        <nav className="border-b h-14 flex items-center px-4 bg-background relative">
            {/* Left side - mobile sidebar trigger */}
            <div className="absolute left-4">
                <SidebarTrigger className="md:hidden" />
            </div>

            {/* Center - title */}
            <div className="flex-1 flex justify-center">
                <Link href="/">
                    <h1 className="text-lg font-semibold">Compute Community</h1>
                </Link>
            </div>

            {/* Right side - navigation buttons */}
            <div className="absolute right-4 flex items-center gap-2">
                <Link href="/">
                    <Button variant="customSecondary" size="sm" className="hidden sm:flex items-center gap-2 bg-transparent hover:text-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat</span>
                    </Button>
                </Link>
                <Link href="/docs">
                    <Button variant="customSecondary" size="sm" className="hidden sm:flex items-center gap-2 bg-transparent hover:text-foreground">
                        <Book className="h-4 w-4" />
                        <span>Docs</span>
                    </Button>
                </Link>
                <ThemeToggle />

                {!isAuthenticated && (
                    <Link href="/login">
                        <Button variant="customSecondary" size="sm" className="hidden sm:flex items-center gap-2 bg-transparent hover:text-foreground">
                            <LogIn className="h-4 w-4" />
                            <span>Login</span>
                        </Button>
                    </Link>
                )}

                {isAuthenticated && (
                    <Link href="/profile">
                        <Button variant="customSecondary" size="sm" className="hidden sm:flex items-center gap-2 bg-transparent hover:text-foreground">
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                        </Button>
                    </Link>
                )}

                {/* Mobile buttons - icons only */}
                <Link href="/">
                    <Button variant="customSecondary" size="icon" className="sm:hidden bg-transparent hover:text-foreground">
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </Link>
                <Link href="/docs">
                    <Button variant="customSecondary" size="icon" className="sm:hidden bg-transparent hover:text-foreground">
                        <Book className="h-4 w-4" />
                    </Button>
                </Link>

                {!isAuthenticated && (
                    <Link href="/login">
                        <Button variant="customSecondary" size="icon" className="sm:hidden bg-transparent hover:text-foreground">
                            <LogIn className="h-4 w-4" />
                        </Button>
                    </Link>
                )}

                {isAuthenticated && (
                    <Link href="/profile">
                        <Button variant="customSecondary" size="icon" className="sm:hidden bg-transparent hover:text-foreground">
                            <User className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    );
} 