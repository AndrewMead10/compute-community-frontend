import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatStateProvider } from "@/components/ChatStateProvider";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TopNav } from "@/components/ui/top-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compute Community",
  description: "Use AI models on your friends computers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, minimum-scale=1" />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('focusout', function() {
              const meta = document.querySelector('meta[name="viewport"]');
              meta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
              setTimeout(function() {
                meta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, minimum-scale=1');
              }, 100);
            });
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] max-w-[100vw] overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChatStateProvider>
            <SidebarProvider>
              <div className="flex h-[100dvh] flex-col w-full max-w-[100vw]">
                <TopNav />
                <div className="flex flex-1 overflow-hidden">
                  {children}
                </div>
              </div>
            </SidebarProvider>
          </ChatStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
