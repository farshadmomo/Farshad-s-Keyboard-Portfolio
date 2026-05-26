import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alex Parker — UI Engineer & Product Designer",
  description:
    "Portfolio of Alex Parker — UI engineer, product designer, and creative developer designing thoughtful digital systems.",
  openGraph: {
    title: "Alex Parker — UI Engineer & Product Designer",
    description:
      "Designing thoughtful digital systems. UI engineer / product designer / creative developer.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="bg-bg text-fg font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
