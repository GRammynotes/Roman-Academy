import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roman Academy Dashboard",
  description: "Academic dashboard and student portal for Roman Academy."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
