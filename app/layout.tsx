import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProgressProvider } from "@/lib/progress";
import { SiteHeader } from "@/components/SiteHeader";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--f-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--f-mono" });

export const metadata: Metadata = {
  title: "architect.go: a software architecture roadmap, taught in Go",
  description:
    "Seven levels and seven specialist tracks from your first Go program to software architect, with a hands-on Go and data structures course.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ProgressProvider>
          <SiteHeader />
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
