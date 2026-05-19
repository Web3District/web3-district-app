import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "COWORK - Web3 District",
  description: "THE CITY'S BUILDERS SPACE. Five buildings in central Web4City: meet, build, and chat with vibe coders from all districts—Web3, AI, Quantum, Growth, and VC.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function ArcadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
