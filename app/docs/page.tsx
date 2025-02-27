import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function DocsPage() {
    return (
        <ScrollArea className="h-[calc(100vh-100px)] w-full">
            <div className="flex flex-col items-center justify-center min-h-full w-full py-12 px-4">
                <h1 className="text-4xl font-bold mb-8">Documentation</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl w-full">
                    <DocCard
                        title="OpenRouter Integration"
                        description="How to set up and use OpenRouter with Compute Community"
                        href="/docs/openrouter"
                    />
                    <DocCard
                        title="Self-Hosting"
                        description="Run your own Compute Community server"
                        href="/docs/self-hosting"
                    />
                    {/* <DocCard
                        title="FAQ"
                        description="Frequently asked questions"
                        href="/docs/faq"
                    />
                    <DocCard
                        title="Troubleshooting"
                        description="Common issues and solutions"
                        href="/docs/troubleshooting"
                    /> */}
                </div>
            </div>
        </ScrollArea>
    );
}

function DocCard({ title, description, href }: { title: string; description: string; href: string }) {
    return (
        <Link href={href} className="block">
            <div className="border rounded-lg p-6 hover:border-primary hover:bg-accent transition-colors duration-200 h-full">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </Link>
    );
} 