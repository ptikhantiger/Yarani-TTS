import type { Metadata, Viewport } from "next";
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
  title: {
    default: "Yarani TTS - Free neural text to speech, up to 40 minutes",
    template: "%s · Yarani TTS",
  },
  description:
    "Turn up to 40,000 characters into natural-sounding speech with 150+ free neural voices in 40+ languages. No account, no watermark, MP3 download.",
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
        Browser extensions (e.g. ColorZilla adds `cz-shortcut-listen`) mutate
        <body> before React hydrates. Suppress the attribute-mismatch warning
        for this element only; children are still fully checked.
      */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
