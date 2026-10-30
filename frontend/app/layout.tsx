import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { WhyModal } from "@/components/WhyModal";

const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FLOWSTATE — AICTE Administrative Intelligence Platform",
  description: "Regulation-aware administrative intelligence and workflow orchestration platform for AICTE approval processes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSans.variable}>
      <body className={`${notoSans.className} min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased`}>
        <Navbar />
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
        <WhyModal />
      </body>
    </html>
  );
}

