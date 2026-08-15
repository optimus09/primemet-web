import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { CartProvider } from "@/lib/cart";
import { getSiteSettings } from "@/lib/settings";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Primemet — Industrial Scrap Buying & Spare Parts Supply, India",
  description:
    "We buy metal wastage from manufacturing plants, supply graded scrap to renewal mills and foundries, and keep your shop floor stocked with welding rods, hardware and machine spares.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          <Header enableBulkPricing={settings.enable_bulk_pricing} enableAiFeatures={settings.enable_ai_features} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Chatbot enabled={settings.enable_ai_features} />
        </CartProvider>
      </body>
    </html>
  );
}
