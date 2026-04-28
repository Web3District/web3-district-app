"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DISTRICT_CONFIGS: Record<string, {
  name: string;
  emoji: string;
  color: string;
  desc: string;
  slug: string;
  enterLabel: string;
}> = {
  "ai-lobby": {
    name: "AI District",
    emoji: "🌸",
    color: "#f43f5e",
    desc: "AI & ML devs connect — share models, datasets, and breakthroughs",
    slug: "ai-lobby",
    enterLabel: "Enter AI Lobby",
  },
  "web3-lobby": {
    name: "Web3 District",
    emoji: "🟣",
    color: "#a855f7",
    desc: "Blockchain builders — smart contracts, DeFi, and DAOs",
    slug: "web3-lobby",
    enterLabel: "Enter Web3 Lobby",
  },
  "quantum-lobby": {
    name: "Quantum District",
    emoji: "🔵",
    color: "#06b6d4",
    desc: "Quantum computing — qubits, algorithms, and simulations",
    slug: "quantum-lobby",
    enterLabel: "Enter Quantum Lobby",
  },
  "vc-lobby": {
    name: "VC District",
    emoji: "🟠",
    color: "#f97316",
    desc: "Investors & founders — pitch, fund, and scale",
    slug: "vc-lobby",
    enterLabel: "Enter VC Lobby",
  },
  "growth-lobby": {
    name: "Growth District",
    emoji: "🟢",
    color: "#22c55e",
    desc: "Growth hackers — metrics, funnels, and scale-up strategies",
    slug: "growth-lobby",
    enterLabel: "Enter Growth Lobby",
  },
};

interface DistrictLobbyCardProps {
  slug: string;
  onClose: () => void;
  session: unknown;
  onSignIn?: () => void;
}

export default function DistrictLobbyCard({ slug, onClose, session, onSignIn }: DistrictLobbyCardProps) {
  const router = useRouter();
  const config = DISTRICT_CONFIGS[slug];
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const accent = config?.color ?? "#e040c0";

  useEffect(() => {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
    if (!host) { setLoading(false); return; }
    fetch(`${host}/parties/lobby/${slug}`)
      .then((r) => r.json())
      .then((d: { count?: number }) => {
        setOnlineCount(d.count ?? 0);
        setLoading(false);
      })
      .catch(() => {
        setOnlineCount(0);
        setLoading(false);
      });
  }, [slug]);

  const handleEnter = () => {
    router.push(`/arcade/${slug}`);
    onClose();
  };

  if (!config) return null;

  return (
    <>
      {/* Nav hints */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-30 hidden text-right text-[9px] leading-loose text-muted sm:block">
        <div><span style={{ color: accent }}>ESC</span> close</div>
      </div>

      {/* Card */}
      <div
        className="pointer-events-auto fixed z-40
          bottom-0 left-0 right-0
          sm:bottom-auto sm:left-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2"
      >
        <div
          className="relative border-t-[3px] border-border bg-bg-raised/95 backdrop-blur-sm
            w-full max-h-[50vh] overflow-y-auto sm:w-[320px] sm:border-[3px] sm:max-h-[85vh]
            animate-[slide-up_0.2s_ease-out] sm:animate-none"
          style={{ borderTopColor: accent }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-[10px] text-muted transition-colors hover:text-cream z-10"
          >
            ESC
          </button>

          {/* Drag handle */}
          <div className="flex justify-center py-2 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 sm:pt-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center border-2 text-lg"
                style={{ borderColor: accent, backgroundColor: accent + "11", color: accent }}
              >
                {config.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: accent }}>
                  {config.name}
                </p>
                <p className="text-[10px] text-muted">{config.desc}</p>
              </div>
            </div>
          </div>

          <div className="mx-4 h-px bg-border" />

          {/* Content */}
          <div className="px-4 py-3 space-y-3">
            {!loading && (
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
                <span className="text-[9px] text-muted">
                  {onlineCount !== null && onlineCount > 0
                    ? `${onlineCount} online now`
                    : "Empty lobby — be the first!"}
                </span>
              </div>
            )}
            {loading && (
              <span className="text-[9px] text-muted">Loading...</span>
            )}

            <div className="mx-0 h-px bg-border" />

            {session ? (
              <button
                onClick={handleEnter}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-wider border-2 transition-all hover:brightness-125"
                style={{ borderColor: accent, color: accent }}
              >
                {config.enterLabel}
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-wider border-2 transition-all hover:brightness-125"
                style={{ borderColor: accent, color: accent }}
              >
                Sign in to enter
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
