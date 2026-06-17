import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Agentis", template: "%s · Agentis" },
  description: "Discover AI agents. Read about them. Chat with them.",
  metadataBase: new URL("https://agentis.dev"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <head><meta name="google" content="notranslate" /></head>
      <body><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
