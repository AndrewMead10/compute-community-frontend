'use client';

import { Button } from '@/components/ui/button';

export default function ButtonExamplePage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-8">Button Examples</h1>
            <p className="mb-6 text-muted-foreground">
                Buttons now feature a non-rounded design with a subtle pop-out effect on hover.
            </p>

            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-medium mb-4">Default Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="default">Default Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                        <Button variant="destructive">Destructive Button</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="link">Link Button</Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-medium mb-4">Custom Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="customSecondary">Custom Secondary Button</Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-medium mb-4">Button Sizes</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary" size="sm">Small Button</Button>
                        <Button variant="primary" size="default">Default Size</Button>
                        <Button variant="primary" size="lg">Large Button</Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-medium mb-4">With Icons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                            Add Item
                        </Button>
                        <Button variant="customSecondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Save
                        </Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-medium mb-4">Hover Effect Demonstration</h2>
                    <p className="mb-4 text-muted-foreground">
                        Hover over these buttons to see the pop-out effect with the border appearing behind.
                    </p>
                    <div className="flex flex-wrap gap-8 items-center">
                        <Button variant="primary" size="lg">Hover Me</Button>
                        <Button variant="customSecondary" size="lg">Hover Me Too</Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 