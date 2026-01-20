import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DinnDone",
  description: "AI-powered meal planning companion",
  manifest: "/manifest.json",
  themeColor: "#4F6E44",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DinnDone",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lora.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <ThemeProvider>
          <ConvexClientProvider>
            <ServiceWorkerRegistration />
            <Header />
            <main className="pb-20">
              <div className="mx-auto w-full max-w-[1440px]">{children}</div>
            </main>
            <BottomNav />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
