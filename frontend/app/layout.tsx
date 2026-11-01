import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { WhyModal } from "@/components/WhyModal";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
