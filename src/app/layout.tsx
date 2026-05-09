import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getPublicSettings } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Visily Studio | Premium Digital Experiences",
  description: "Crafting exceptional digital products and experiences. Explore our work, services, and connect with us.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Visily Studio | Premium Digital Experiences",
    description: "We design and build beautiful, high-performance digital products.",
    images: [{ url: "/og-image.jpg" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnalyticsTracker />
        <WhatsAppButton phoneNumber={settings.whatsapp_number} />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
