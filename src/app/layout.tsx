import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DeenSteps — Small Good Habits. Meaningful Growth.",
  description:
    "A joyful family habit-building platform that helps parents nurture Islamic practices, good character, daily responsibility, and consistency through personalized tasks and meaningful rewards.",
  keywords: [
    "DeenSteps",
    "family habits",
    "Islamic habits",
    "children rewards",
    "parenting",
    "habit tracker",
    "family dashboard",
  ],
  authors: [{ name: "DeenSteps" }],
  openGraph: {
    title: "DeenSteps — Raise Good Habits. Celebrate Every Step.",
    description:
      "A joyful family habit-building platform for Islamic practices, good character, and daily responsibility.",
    siteName: "DeenSteps",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeenSteps",
    description: "Raise Good Habits. Celebrate Every Step.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster />
              <SonnerToaster position="top-right" richColors closeButton />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
