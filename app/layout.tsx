import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./providers";
import { PlayerSessionProvider } from "@/lib/contexts/PlayerSessionContext";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CyberKey — Game Store",
  description: "Buy digital game keys instantly. Steam, Epic, PSN, Xbox — all platforms covered.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${interFont.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--gk-void)" }}>
        <ClientProviders>
          <PlayerSessionProvider>{children}</PlayerSessionProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
