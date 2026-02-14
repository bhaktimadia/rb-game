import type { Metadata } from "next";
import { Poppins, Geist_Mono, Cinzel, Playfair_Display, Playwrite_CU } from "next/font/google";
import "./globals.css";
import ChakraParticles from "@/components/ChakraParticles";
import GameHUD from "@/components/GameHUD";
import SoundToggle from "@/components/SoundToggle";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cinematic font for dramatic headers
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Elegant serif font for emotional text
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Handwritten font for personal/intimate text
const playwrite = Playwrite_CU({
  variable: "--font-playwrite",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Love No Jutsu | Silent Shinobi × Drama Storm",
  description: "An anime-themed treasure hunt adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable} ${cinzel.variable} ${playfair.variable} ${playwrite.variable} antialiased font-sans`}
      >
        <ChakraParticles />
        <GameHUD />
        <SoundToggle />
        {children}
      </body>
    </html>
  );
}
