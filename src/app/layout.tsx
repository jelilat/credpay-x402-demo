import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Credpay x402 Demo",
  description: "Get instant credit to pay for paywalled APIs.",
  icons: {
    icon: "/credpay.png",
  },
  openGraph: {
    title: "Credpay x402 Demo",
    description: "Get instant credit to pay for paywalled APIs.",
    images: "/og-image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Credpay x402 Demo",
    description: "Get instant credit to pay for paywalled APIs.",
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
