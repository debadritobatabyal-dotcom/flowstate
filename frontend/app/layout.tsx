import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { WhyModal } from "@/components/WhyModal";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FLOWSTATE — AICTE Administrative Intelligence Platform",
  description: "Regulation-aware administrative intelligence and workflow orchestration platform for AICTE institutional approval lifecycle under APH 2024–2027.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-surface flex flex-col text-ink antialiased font-sans selection:bg-flow-rim selection:text-ink">
        <Navbar />
        <div className="flex-1 flex w-full">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </div>
        <WhyModal />
      </body>
    </html>
  );
}
