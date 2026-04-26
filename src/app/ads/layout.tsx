import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Web3 District Ads",
    template: "%s | Web3 District Ads",
  },
  robots: { index: false, follow: false },
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
