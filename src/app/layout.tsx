import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" });

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "Build, edit, import and download your resume as an A4 PDF.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5b3a9a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lato.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
