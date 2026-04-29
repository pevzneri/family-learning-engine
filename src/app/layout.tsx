import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Family Learning Engine", description: "Adaptive learning powered by AI" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#fafaf9" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen bg-stone-50">{children}</body></html>);
}
