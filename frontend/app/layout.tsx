import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteHeader from "../components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FINDIT | Find it nearby",
    template: "%s | FINDIT",
  },
  description:
    "Discover products in nearby shops, check current availability, and reserve for pickup.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span className="font-semibold text-[var(--ink)]">FINDIT</span>
            <span>Find nearby. Pick up locally.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
