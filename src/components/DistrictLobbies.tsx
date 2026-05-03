"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DISTRICT_LOBBIES = [
  { slug: "ai-lobby", name: "AI District", color: "#ec4899", emoji: "🌸", desc: "AI & ML devs connect" },
  { slug: "web3-lobby", name: "Web3 District", color: "#8b5cf6", emoji: "🟣", desc: "Blockchain builders" },
  { slug: "quantum-lobby", name: "Quantum District", color: "#06b6d4", emoji: "🔵", desc: "Quantum computing" },
  { slug: "vc-lobby", name: "VC District", color: "#f97316", emoji: "🟠", desc: "Investors & founders" },
  { slug: "growth-lobby", name: "Growth District", color: "#10b981", emoji: "🟢", desc: "Growth hackers" },
];

interface DistrictLobbiesProps {
  onClose: () => void;
  initialSlug?: string | null;
}

export default function DistrictLobbies({ onClose, initialSlug }: DistrictLobbiesProps) {
  const router = useRouter();
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // If a specific lobby was requested, enter it immediately
  useEffect(() => {
    if (initialSlug) {
      router.push(`/arcade/${initialSlug}`);
      onClose();
    }
  }, [initialSlug, router, onClose]);

  useEffect(() => {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
    if (!host) { setLoading(false); return; }
    
    fetch(`${host}/parties/lobby/main/rooms`)
      .then(r => r.json())
      .then(data => {
        const counts: Record<string, number> = {};
        for (const room of data.rooms || []) {
          counts[room.slug] = room.playerCount;
        }
        setLiveCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const enterLobby = (slug: string) => {
    router.push(`/arcade/${slug}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-2xl mx-4 border-2 border-[#ed0584] bg-[#0d0d0f] shadow-[0_0_40px_rgba(224,64,192,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ed0584]/30">
          <h2 className="font-pixel text-lg text-[#e8dcc8]">
            🏙️ <span style={{ color: "#ed0584" }}>District</span> Lobbies
          </h2>
          <button
            onClick={onClose}
            className="font-pixel text-[#ed0584] hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
        
        {/* Lobby Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DISTRICT_LOBBIES.map((lobby) => {
            const online = liveCounts[lobby.slug] ?? 0;
            return (
              <button
                key={lobby.slug}
                onClick={() => enterLobby(lobby.slug)}
                className="group relative border-2 p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{
                  borderColor: `${lobby.color}40`,
                  background: `${lobby.color}08`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = lobby.color;
                  e.currentTarget.style.background = `${lobby.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${lobby.color}40`;
                  e.currentTarget.style.background = `${lobby.color}08`;
                }}
              >
                <div className="text-3xl mb-2">{lobby.emoji}</div>
                <div className="font-pixel text-sm text-[#e8dcc8] mb-1">{lobby.name}</div>
                <div className="text-xs text-[#8c8c9c] mb-3">{lobby.desc}</div>
                
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                  <span className="text-[10px] text-[#e8dcc8]">
                    {loading ? "..." : online > 0 ? `${online} online` : "Empty"}
                  </span>
                </div>
                
                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ boxShadow: `inset 0 0 20px ${lobby.color}20` }}
                />
              </button>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#ed0584]/20 text-center">
          <p className="font-pixel text-[9px] text-[#8c8c9c]">
            Enter a district lobby to meet other devs in real-time!
          </p>
        </div>
      </div>
    </div>
  );
}
