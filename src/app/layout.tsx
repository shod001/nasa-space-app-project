import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Outpost Director: Moon & Mars — A NASA-Data Mission Game for Kids",
  description:
    "Become an Outpost Commander! Balance power, oxygen, food and radiation shielding over a 14-day space mission, guided by your AI co-pilot A.S.T.R.O. Inspired by real NASA systems: DONKI, OSDR, REMS, LRO and SCaN.",
  keywords: ["kids game", "space game", "NASA", "DONKI", "OSDR", "STEM", "Moon", "Mars", "educational game"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Outpost Director: Moon & Mars",
    description: "Keep your crew safe, run real science, and master genuine engineering trade-offs!",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0918",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fredoka.variable} ${nunito.variable} antialiased bg-space-950`}>
        {children}
      </body>
    </html>
  );
}
