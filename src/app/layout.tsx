import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Hind_Siliguri } from "next/font/google";
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

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bn",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "দীনস্টেপস — ছোট ভালো অভ্যাস, বড় পরিবর্তন",
  description:
    "একটি আনন্দময় পরিবার-কেন্দ্রিক অভ্যাস গড়ার প্ল্যাটফর্ম। বাবা-মা তাদের সন্তানদের শেখায় ইসলামি অভ্যাস, সুন্দর চরিত্র, দৈনন্দিন দায়িত্ব আর ধারাবাহিকতা — ছোট ছোট কাজ আর অর্থপূর্ণ পুরস্কারের মাধ্যমে।",
  keywords: [
    "DeenSteps",
    "দীনস্টেপস",
    "পরিবার",
    "ইসলামি অভ্যাস",
    "শিশু",
    "প্যারেন্টিং",
    "আখিরাত",
    "দুনিয়া",
  ],
  authors: [{ name: "DeenSteps" }],
  openGraph: {
    title: "দীনস্টেপস — ভালো অভ্যাস গড়ুন, প্রতিটি পদক্ষেপ উদযাপন করুন",
    description:
      "ইসলামি অভ্যাস, সুন্দর চরিত্র আর দৈনন্দিন দায়িত্ব শেখাও এমন একটি আনন্দময় পরিবার-কেন্দ্রিক প্ল্যাটফর্ম।",
    siteName: "DeenSteps",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeenSteps",
    description: "ভালো অভ্যাস গড়ুন, প্রতিটি পদক্ষেপ উদযাপন করুন।",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${hindSiliguri.variable} antialiased bg-background text-foreground`}
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
