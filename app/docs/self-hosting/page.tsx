import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SelfHostingDocsPage() {
    return (
        <ScrollArea className="h-[calc(100vh-100px)] w-full">
            <div className="flex flex-col items-start justify-start w-full max-w-4xl mx-auto py-12 px-4 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-4">Self-Hosting Compute Community</h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Run your own Compute Community server to provide compute resources
                    </p>
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
                        <p className="mb-4">
                            Compute Community allows you to run your own server to provide AI compute resources to your network.
                            After setting up your server, you'll have an API key and gateway URL that you can share with friends
                            to let them access your GPU resources.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Prerequisites</h2>
                        <p className="mb-4">To run the Compute Community server, you'll need:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Docker Desktop</li>
                            <li>WSL (Windows Subsystem for Linux) if running on Windows</li>
                            <li>NVIDIA GPU with compatible drivers</li>
                            <li>NVIDIA Container Toolkit</li>
                            <li>ngrok (for exposing local server)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Docker Configuration</h2>
                        <p className="mb-4">
                            Ensure Docker is installed and properly configured with NVIDIA support. The server uses vLLM for LLM inference.
                            Make sure your model fits on your GPU's available memory.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Running the Server</h2>
                        <p className="mb-4">Use Docker to run the vLLM server with your chosen model:</p>

                        <Tabs defaultValue="windows" className="w-full">
                            <TabsList>
                                <TabsTrigger value="windows">Windows</TabsTrigger>
                                <TabsTrigger value="linux">Linux</TabsTrigger>
                            </TabsList>
                            <TabsContent value="windows" className="mt-4">
                                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                    <code>{`docker run --runtime nvidia --gpus all ^
    -p 8000:8000 ^
    --ipc=host ^
    vllm/vllm-openai:latest ^
    --model Qwen/Qwen2.5-14B-Instruct-AWQ ^
    --gpu-memory-utilization 0.90 ^
    --max_model_len 16384 ^
    --api-key YOUR_API_KEY`}</code>
                                </pre>
                            </TabsContent>
                            <TabsContent value="linux" className="mt-4">
                                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                    <code>{`docker run --runtime nvidia --gpus all \\
    -p 8000:8000 \\
    --ipc=host \\
    vllm/vllm-openai:latest \\
    --model Qwen/Qwen2.5-14B-Instruct-AWQ \\
    --max_model_len 16384 \\
    --api-key YOUR_API_KEY`}</code>
                                </pre>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-4">
                            <p className="mb-2 text-sm text-muted-foreground">
                                <strong>Note:</strong> Replace <code className="bg-muted px-1 py-0.5 rounded text-sm">YOUR_API_KEY</code> with a secure API key of your choice.
                                Also, you can replace the model with any model supported by vLLM.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-2">ngrok Setup</h2>
                        <p className="mb-4">
                            To expose your local server to the internet, you'll need to set up ngrok:
                        </p>

                        <ol className="list-decimal ml-6 space-y-4">
                            <li>
                                <p className="font-medium">Create an ngrok account</p>
                                <div className="mt-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="https://ngrok.com" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                            Sign up on ngrok <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </li>

                            <li>
                                <p className="font-medium">Authenticate with your ngrok authtoken</p>
                                <p className="text-muted-foreground">
                                    Find your authtoken in your ngrok dashboard and set it up:
                                </p>
                                <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm mt-2">
                                    <code>ngrok authtoken YOUR_AUTH_TOKEN</code>
                                </pre>
                            </li>

                            <li>
                                <p className="font-medium">Create a static domain (recommended)</p>
                                <p className="text-muted-foreground">
                                    Create a static domain in your ngrok dashboard, such as <code className="bg-muted px-1 py-0.5 rounded text-sm">your-domain.ngrok-free.app</code>
                                </p>
                            </li>

                            <li>
                                <p className="font-medium">Start the ngrok tunnel</p>
                                <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm mt-2">
                                    <code>ngrok http --url=YOUR_STATIC_DOMAIN 8000</code>
                                </pre>
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Sharing Your Server</h2>
                        <p className="mb-4">
                            After setting up your server, you can share the following details with your friends:
                        </p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>Gateway URL:</strong> Your ngrok URL (e.g., <code className="bg-muted px-1 py-0.5 rounded text-sm">https://your-domain.ngrok-free.app</code>)</li>
                            <li><strong>API Key:</strong> The API key you specified when running the Docker container</li>
                            <li><strong>Model Name:</strong> The model you're serving (e.g., <code className="bg-muted px-1 py-0.5 rounded text-sm">Qwen/Qwen2.5-14B-Instruct-AWQ</code>)</li>
                        </ul>
                        <p className="mt-4">
                            They can add these details in the Compute Community settings page to connect to your server.
                        </p>
                    </section>

                    <div className="flex items-center justify-start mt-8 pt-4 border-t">
                        <Button asChild variant="outline">
                            <Link href="https://github.com/AndrewMead10/compute-community" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                GitHub Repository <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
} 