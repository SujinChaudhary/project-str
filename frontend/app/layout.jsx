import {
  Geist,
  Geist_Mono,
  EB_Garamond,
  Hanken_Grotesk,
} from "next/font/google";
import ReduxProvider from "@/app/providers/ReduxProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-family-serif",
  weight: ["400", "500", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-family-nav",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "ShopZone",
  description: "Multi Vendor ecommerce platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
