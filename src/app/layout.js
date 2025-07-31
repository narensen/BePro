import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BePro : AI Career-pathing engine",
  description: "BePro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}

import ResponsiveHeader from "@/components/ResponsiveHeader";
import ResponsiveFooter from "@/components/ResponsiveFooter";

export default function Layout({ children }) {
  return (
    <>
      <ResponsiveHeader />
      <main className="flex-grow pt-20">{children}</main>
      <ResponsiveFooter />
    </>
  );
}


