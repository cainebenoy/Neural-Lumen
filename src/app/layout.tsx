import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "NHAI Neural-Lumen: Digital Twin",
  description: "Smart Highway Lighting Simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#141517] text-slate-100 overflow-hidden bg-[radial-gradient(#2c2e33_1px,transparent_1px)] [background-size:18px_18px]`}
      >
        {children}
      </body>
    </html>
  );
}