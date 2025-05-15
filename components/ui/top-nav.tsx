'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Book, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useHost } from './HostContext';

export function TopNav() {
    const { hostName } = useHost();
    
    return (
        <nav className="border-b h-14 flex items-center px-4 bg-background relative md:pl-80">
            {/* Left side - mobile sidebar trigger */}
            <div className="absolute left-4">
                <SidebarTrigger className="md:hidden" />
            </div>

            {/* Center - title */}
            <div className="flex-1 flex pl-20 md:pl-0">
                <h1 className="text-lg font-semibold">
                    Compute Community
                    {hostName && <span className="text-muted-foreground"> - {hostName}</span>}
                </h1>
            </div>

            {/* Right side - navigation buttons */}
            <div className="absolute right-4 flex items-center gap-2">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat</span>
                    </Button>
                </Link>
                <Link href="/docs">
                    <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        <span>Docs</span>
                    </Button>
                </Link>
                <ThemeToggle />
                {/* <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                </Button> */}
                {/* Mobile buttons - icons only */}

                <Link href="/">
                    <Button variant="ghost" size="icon" className="sm:hidden">
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </Link>
                <Link href="/docs">
                    <Button variant="ghost" size="icon" className="sm:hidden">
                        <Book className="h-4 w-4" />
                    </Button>
                </Link>
                {/* <Button variant="ghost" size="icon" className="sm:hidden">
                    <LogIn className="h-4 w-4" />
                </Button> */}
            </div>
        </nav>
    );
} 