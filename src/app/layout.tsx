import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProviderWrapper } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flowlary",
  description: "Salary-first personal finance with AI guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body suppressHydrationWarning className="min-h-full bg-slate-50 text-slate-950 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <ThemeProviderWrapper>
          <SessionProvider>
            <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
              <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/15" />
              <div className="pointer-events-none absolute right-0 top-24 h-[360px] w-[360px] rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/10" />
              <div className="pointer-events-none absolute left-10 bottom-10 h-[280px] w-[280px] rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-500/10" />
              <div className="pointer-events-none absolute left-16 top-36 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-400/10" />
              <div className="pointer-events-none absolute right-20 bottom-28 h-52 w-52 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-400/10" />
              <div className="pointer-events-none absolute left-[35%] top-[55%] h-44 w-44 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-400/10" />
              <div className="pointer-events-none absolute right-[40%] bottom-14 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/12" />

              <Navbar />
              <main className="relative flex-1">{children}</main>
              <Footer />
              <ScrollToTop />
            </div>
            <Toaster position="top-right" richColors />
          </SessionProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
