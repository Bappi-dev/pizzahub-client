import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/sheard/Navbar";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/sheard/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PizzaHub | Local Pizza, Made Easy",
  description:
    "Discover neighborhood pizzerias, explore fresh local favorites, and make pizza night easy with PizzaHub.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background flex flex-col">
        <ThemeProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
