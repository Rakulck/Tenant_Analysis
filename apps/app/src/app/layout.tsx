import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenant Analysis Platform",
  description: "AI-powered tenant default risk analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 