import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimplyUI — AI-Powered UI Studio",
  description:
    "Generate, save, and remix production-ready UIs with AI. Chat-powered component studio with version control, community gallery, and one-click export.",
  keywords: ["UI Generator", "AI", "Component Library", "React", "Next.js", "SimplyUI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
