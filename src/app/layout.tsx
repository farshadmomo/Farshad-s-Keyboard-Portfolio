import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farshad Momtaz — Automation Developer & Front-End Engineer",
  description:
    "Portfolio of Farshad Momtaz — automation developer and front-end engineer designing scalable n8n workflows and thoughtful React interfaces.",
  openGraph: {
    title: "Farshad Momtaz — Automation Developer & Front-End Engineer",
    description:
      "Designing thoughtful digital systems. Automation developer / front-end engineer.",
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
