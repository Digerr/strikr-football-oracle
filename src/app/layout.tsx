import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/strikr/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STRIKR — AI Football Oracle",
  description:
    "STRIKR — premium Telegram Mini App for AI-powered football predictions. Live matches, deep analytics, confidence meters and real-time insights.",
  keywords: [
    "STRIKR",
    "football",
    "soccer",
    "predictions",
    "AI",
    "Telegram Mini App",
    "sports betting insights",
  ],
  authors: [{ name: "STRIKR Labs" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "STRIKR — AI Football Oracle",
    description: "Premium AI football predictions in your Telegram",
    siteName: "STRIKR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STRIKR — AI Football Oracle",
    description: "Premium AI football predictions in your Telegram",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash: apply theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('strikr-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
