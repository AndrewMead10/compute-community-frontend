import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OpenRouterDocsPage() {
    return (
        <ScrollArea className="h-[calc(100vh-100px)] w-full">
            <div className="flex flex-col items-start justify-start w-full max-w-4xl mx-auto py-12 px-4 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-4">OpenRouter Integration</h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Access a wide range of AI models through a single, unified API
                    </p>
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
                        <p className="mb-4">
                            OpenRouter provides a unified API to access nearly all major language models available today.
                            Through Compute Community, you can easily connect to OpenRouter and use their service to access
                            a variety of models, including several high-quality options that are free to use.
                        </p>
                        <p>
                            Free models include high-quality options like Llama 3.3 70B and Gemini Flash,
                            allowing you to experiment with powerful AI without any cost.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Setting Up OpenRouter</h2>
                        <p className="mb-4">Follow these steps to access free and paid models through OpenRouter:</p>

                        <ol className="list-decimal ml-6 space-y-4">
                            <li>
                                <p className="font-medium">Create an OpenRouter account</p>
                                <p className="text-muted-foreground">
                                    Sign up for an account on the OpenRouter website if you don't already have one.
                                </p>
                                <div className="mt-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="https://openrouter.ai/signup" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                            Sign up on OpenRouter <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </li>

                            <li>
                                <p className="font-medium">Navigate to API Keys section</p>
                                <p className="text-muted-foreground">
                                    Once logged in, go to the API Keys section in your OpenRouter dashboard.
                                </p>
                            </li>

                            <li>
                                <p className="font-medium">Generate a new API key</p>
                                <p className="text-muted-foreground">
                                    Create a new API key. Note that you may need to have a payment method associated with your account
                                    or have credits on it, even if you plan to only use free models.
                                </p>
                            </li>

                            <li>
                                <p className="font-medium">Copy your API key</p>
                                <p className="text-muted-foreground">
                                    Save your newly generated API key in a secure location.
                                </p>
                            </li>

                            <li>
                                <p className="font-medium">Configure a new host in Compute Community</p>
                                <p className="text-muted-foreground">
                                    In Compute Community, add a new host with the following details:
                                </p>
                                <ul className="list-disc ml-6 mt-2">
                                    <li>URL: <code className="bg-muted px-1 py-0.5 rounded text-sm">https://openrouter.ai/api</code></li>
                                    <li>API Key: Your OpenRouter API key</li>
                                </ul>
                            </li>

                            <li>
                                <p className="font-medium">Access models from the sidebar</p>
                                <p className="text-muted-foreground">
                                    After configuring the host, you'll be able to see all available OpenRouter models in the model selector
                                    on the sidebar.
                                </p>
                            </li>

                            <li>
                                <p className="font-medium">Filter for free models</p>
                                <p className="text-muted-foreground">
                                    Use the toggle in the model selector to display only the free models available through OpenRouter.
                                </p>
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Available Free Models</h2>
                        <p className="mb-4">
                            OpenRouter frequently updates their offering of free models. Some notable free models that may be available include:
                        </p>
                        <ul className="list-disc ml-6">
                            <li>Llama 3.3 70B</li>
                            <li>Gemini Flash</li>
                            <li>Various other models (selection may change over time)</li>
                        </ul>
                        <p className="mt-4 text-muted-foreground">
                            The selection of free models may change based on OpenRouter's current promotions and partnerships.
                        </p>
                    </section>

                    <div className="flex items-center justify-start mt-8 pt-4 border-t">
                        <Button asChild variant="outline">
                            <Link href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                Visit OpenRouter <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}
