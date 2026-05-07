"use client";

import React, { useState, useEffect } from "react";

// ── Exact theme from globals.css ──
const BG = "#0d0d0f";
const BG_RAISED = "#161618";
const BG_CARD = "#1c1c20";
const CREAM = "#e8dcc8";
const CREAM_DARK = "#c8b89c";
const BORDER = "#2a2a30";
const DIM = "#5c5c6c";
const MUTED = "#8c8c9c";
const WARM = "#d4cfc4";
const LIME = "#ed0584";
const LIME_DARK = "#a02080";
const LIME_SHADOW = "#a02080";

const PX: React.CSSProperties = { fontFamily: '"Silkscreen", monospace' };
const SEC = { marginBottom: 48, maxWidth: 640, margin: "0 auto 48px", padding: "0 16px" };
const H2: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: LIME, marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${BORDER}`, letterSpacing: 2, ...PX };
const CARD: React.CSSProperties = { background: BG_RAISED, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 16 };
const LB: React.CSSProperties = { fontSize: 10, color: DIM, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, ...PX };
const BTN: React.CSSProperties = { border: "none", cursor: "pointer", ...PX };
const PS: React.CSSProperties = { boxShadow: `4px 4px 0 0 ${LIME_SHADOW}` };

const SKYLINE: [number, number, number][] = [[28,40,2],[20,65,8],[32,85,14],[18,50,22],[24,70,28],[36,110,35],[22,55,44],[26,75,50],[30,95,58],[20,45,66],[34,80,72],[24,60,80],[28,90,87]];
const TIPS = ["Click any building to see that dev's profile","Use Fly Mode to cruise above the skyline","Taller buildings = more contributions","Try searching for your GitHub username","Buildings glow brighter with more recent activity","You can customize your building in the shop"];

function tier(lvl: number) {
  if (lvl >= 25) return { l: "FDR", c: "#ec4899" };
  if (lvl >= 20) return { l: "UNI", c: "#eab308" };
  if (lvl >= 15) return { l: "OS", c: "#22c55e" };
  if (lvl >= 10) return { l: "PROD", c: "#a855f7" };
  if (lvl >= 5) return { l: "STG", c: LIME };
  return { l: "LOCAL", c: DIM };
}

export default function UIShowcasePage() {
  const [toast, setToast] = useState(false);
  const [toastLvl, setToastLvl] = useState(5);
  const [pill, setPill] = useState(false);
  const [rabbit, setRabbit] = useState(false);
  const [arcade, setArcade] = useState(false);
  const [district, setDistrict] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [tLeft, setTLeft] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => { const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 4000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const u = () => { const n = new Date(); const t = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1)); const d = t.getTime() - n.getTime(); setTLeft(`${Math.floor(d/3600000)}h ${Math.floor((d%3600000)/60000)}m`); };
    u(); const t = setInterval(u, 60000); return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: WARM, ...PX }}>
      <div style={{ background: BG_RAISED, borderBottom: `1px solid ${BORDER}`, padding: "20px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: 4, margin: 0, color: LIME, ...PX }}>WEB4CITY</h1>
        <p style={{ fontSize: 10, color: DIM, letterSpacing: 2, margin: "8px 0 0", textTransform: "uppercase", ...PX }}>UI Showcase — Exact Visual Match</p>
        <div style={{ fontSize: 9, color: "#3a3a44", marginTop: 8, ...PX }}>{new Date().toLocaleDateString("en-GB")} • 14 Components</div>
      </div>

      <div style={{ padding: "24px 0" }}>

        {/* ═══ LOADING SCREEN ═══ */}
        <div style={SEC}>
          <h2 style={H2}>📦 LOADING SCREEN</h2>
          {[{ msg: "Checking your browser...", pct: 0, tip: true }, { msg: "Building the skyline...", pct: 65, tip: false }].map((s, i) => (
            <div key={i} style={{ ...CARD, position: "relative", minHeight: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, opacity: 0.2 }}>
                {SKYLINE.map(([w, h, left], j) => <div key={j} style={{ position: "absolute", bottom: 0, left: `${left}%`, width: w, height: h, backgroundColor: LIME }} />)}
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: LIME, zIndex: 1, ...PX }}>WEB4CITY</h1>
              <p style={{ fontSize: 10, color: MUTED, letterSpacing: 2, marginTop: 12, zIndex: 1, ...PX }}>{s.msg}</p>
              <div style={{ width: 200, height: 14, border: `2px solid ${LIME}`, marginTop: 20, zIndex: 1 }}><div style={{ width: `${s.pct}%`, height: "100%", backgroundColor: LIME }} /></div>
              {s.tip && <p style={{ fontSize: 9, color: DIM, marginTop: 24, zIndex: 1, maxWidth: 240, textAlign: "center", ...PX }}>{TIPS[tipIdx]}</p>}
            </div>
          ))}
          <div style={{ ...CARD, minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: LIME, ...PX }}>WEB4CITY</h1>
            <p style={{ fontSize: 12, color: "#ef4444", marginTop: 12, ...PX }}>Connection timeout</p>
            <button style={{ ...BTN, marginTop: 20, background: LIME, padding: "8px 24px", color: BG, fontWeight: 700, fontSize: 11, ...PS }}>Retry</button>
          </div>
        </div>

        {/* ═══ XP BAR ═══ */}
        <div style={SEC}>
          <h2 style={H2}>⭐ XP PROGRESS BAR</h2>
          {[{ l: 5, xp: 450, mx: 750 }, { l: 12, xp: 2800, mx: 3400 }].map(s => {
            const b = tier(s.l);
            return <div key={s.l} style={CARD}><div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: LIME, ...PX }}>{s.l}</span>
              <span style={{ fontSize: 8, background: b.c, color: BG, padding: "1px 6px", fontWeight: 700, ...PX }}>{b.l}</span>
              <div style={{ flex: 1, height: 8, background: BORDER, overflow: "hidden" }}><div style={{ width: `${(s.xp/s.mx)*100}%`, height: "100%", background: b.c }} /></div>
              <span style={{ fontSize: 9, color: DIM, ...PX }}>{s.xp}/{s.mx}</span>
            </div></div>;
          })}
        </div>

        {/* ═══ LEVEL UP TOAST ═══ */}
        <div style={SEC}>
          <h2 style={H2}>🎉 LEVEL UP TOAST</h2>
          <div style={CARD}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[5,10,15,20,25].map(l => <button key={l} onClick={() => { setToastLvl(l); setToast(true); }} style={{ ...BTN, background: LIME, padding: "6px 12px", color: BG, fontWeight: 700, fontSize: 10, ...PS }}>Level {l}</button>)}
          </div></div>
          {toast && (() => { const b = tier(toastLvl); return (
            <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: BG_RAISED, border: `2px solid ${LIME}`, borderRadius: 12, padding: "20px 32px", textAlign: "center", boxShadow: `0 0 30px ${LIME}44`, ...PX }}>
              <div style={{ fontSize: 9, color: LIME, letterSpacing: 3, marginBottom: 4 }}>LEVEL UP!</div>
              <div style={{ fontSize: 40, fontWeight: 700, color: WARM }}>{toastLvl}</div>
              <div style={{ fontSize: 12, color: CREAM, marginTop: 4 }}>{b.l} Tier</div>
              <button onClick={() => setToast(false)} style={{ ...BTN, marginTop: 10, background: LIME, padding: "4px 14px", color: BG, fontWeight: 700, fontSize: 9, ...PS }}>Dismiss</button>
            </div>
          ); })()}
        </div>

        {/* ═══ ACTIVITY TICKER ═══ */}
        <div style={SEC}>
          <h2 style={H2}>📡 ACTIVITY FEED TICKER</h2>
          <div style={CARD}>
            <div style={LB}>Live events</div>
            {[{ a: "T", lg: "torvalds", act: "claimed", tgt: "react", col: "#22c55e", tm: "1m" }, { a: "S", lg: "sindresorhus", act: "reached level", tgt: "15", col: "#a855f7", tm: "2m" }, { a: "K", lg: "karpathy", act: "kudos to", tgt: "yyx990803", col: LIME, tm: "5m" }].map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${e.col}22`, border: `1px solid ${e.col}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: e.col, ...PX }}>{e.a}</div>
                <div style={{ flex: 1, fontSize: 11 }}><span style={{ color: CREAM, fontWeight: 700, ...PX }}>@{e.lg}</span><span style={{ color: DIM, ...PX }}> {e.act} </span><span style={{ color: e.col, fontWeight: 700, ...PX }}>{e.tgt}</span></div>
                <span style={{ fontSize: 9, color: DIM, ...PX }}>{e.tm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ INVITE CARD ═══ */}
        <div style={SEC}>
          <h2 style={H2}>📩 INVITE CARD</h2>
          <div style={CARD}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: BG, ...PX }}>AK</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: CREAM, ...PX }}>Andrej Karpathy</div>
                <div style={{ fontSize: 9, color: DIM, ...PX }}>@karpathy · Python</div>
                <div style={{ fontSize: 9, color: LIME, marginTop: 2, ...PX }}><span style={{ color: LIME }}>2,500</span> contributions · <span style={{ color: LIME }}>45,000</span> stars · <span style={{ color: LIME }}>120</span> repos</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button style={{ ...BTN, background: LIME, padding: "6px 14px", color: BG, fontWeight: 700, fontSize: 10, ...PS }}>📩 Invite</button>
              <button style={{ ...BTN, background: BORDER, padding: "6px 14px", color: WARM, fontSize: 10 }}>✕ Close</button>
            </div>
          </div>
        </div>

        {/* ═══ SHARE BUTTONS ═══ */}
        <div style={SEC}>
          <h2 style={H2}>🔗 SHARE BUTTONS</h2>
          <div style={CARD}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[{ i: "🐦", l: "Twitter", bg: "#1da1f2" }, { i: "💬", l: "Telegram", bg: "#0088cc" }, { i: "📋", l: "Copy Link", bg: BORDER }, { i: "🃏", l: "Card", bg: "#7c1d6f" }].map(b => (
              <button key={b.l} onClick={() => { if (b.l === "Copy Link") { setCopied(true); setTimeout(() => setCopied(false), 2000); }}} style={{ ...BTN, background: b.bg, padding: "6px 12px", color: "#fff", fontWeight: 700, fontSize: 9 }}>{b.i} {copied && b.l === "Copy Link" ? "Copied!" : b.l}</button>
            ))}
          </div></div>
        </div>

        {/* ═══ CLAIM BUTTON ═══ */}
        <div style={SEC}>
          <h2 style={H2}>🏗️ CLAIM BUTTON</h2>
          <div style={{ ...CARD, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div><div style={LB}>Unclaimed</div><button style={{ ...BTN, background: LIME, padding: "6px 14px", color: BG, fontWeight: 700, fontSize: 9, ...PS }}>Claim My Building</button></div>
            <div><div style={LB}>Claimed</div><div style={{ display: "inline-block", border: `2px solid ${LIME}`, color: LIME, padding: "4px 10px", fontSize: 9, ...PX }}>CLAIMED</div></div>
          </div>
        </div>

        {/* ═══ REFERRAL CTA ═══ */}
        <div style={SEC}>
          <h2 style={H2}>🎁 REFERRAL CTA</h2>
          <div style={CARD}><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: CREAM, ...PX }}>Invite friends, earn XP!</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <input readOnly value="https://web4city.dev/?ref=karpathy" style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, padding: "5px 8px", color: WARM, fontSize: 9, ...PX }} />
                <button onClick={() => { setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000); }} style={{ ...BTN, background: copiedRef ? "#22c55e" : LIME, padding: "5px 12px", color: BG, fontWeight: 700, fontSize: 9 }}>{copiedRef ? "Copied!" : "Copy"}</button>
              </div>
            </div>
          </div></div>
        </div>

        {/* ═══ DAILIES WIDGET ═══ */}
        <div style={SEC}>
          <h2 style={H2}>📋 DAILIES WIDGET</h2>
          <div style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: CREAM, ...PX }}>📋 Daily Missions</span>
              <span style={{ fontSize: 9, color: DIM, ...PX }}>🔥 7 · ⏱️ {tLeft || "14h 32m"}</span>
            </div>
            {[{ t: "Visit the city", d: true, xp: 10 }, { t: "Claim a building", d: false, xp: 25 }, { t: "Share your card", d: false, xp: 15 }].map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${m.d ? "#22c55e" : BORDER}`, background: m.d ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: m.d ? "#fff" : "transparent" }}>✓</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: m.d ? DIM : CREAM, textDecoration: m.d ? "line-through" : "none", ...PX }}>{m.t}</div></div>
                <span style={{ fontSize: 9, fontWeight: 700, color: LIME, ...PX }}>+{m.xp}</span>
              </div>
            ))}
            <button style={{ width: "100%", marginTop: 10, background: "#22c55e", border: "none", padding: "6px", color: BG, fontWeight: 700, cursor: "pointer", fontSize: 10, ...PX }}>🎁 Claim Reward (1/3)</button>
          </div>
        </div>

        {/* ═══ MODALS ═══ */}
        <div style={SEC}>
          <h2 style={H2}>🪟 INTERACTIVE MODALS</h2>
          <div style={CARD}>
            <div style={LB}>Click to open</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setArcade(true)} style={{ ...BTN, background: LIME, padding: "6px 14px", color: BG, fontWeight: 700, fontSize: 9, ...PS }}>🎮 E.Arcade</button>
              <button onClick={() => setDistrict(true)} style={{ ...BTN, background: LIME, padding: "6px 14px", color: BG, fontWeight: 700, fontSize: 9, ...PS }}>🏘️ District</button>
              <button onClick={() => setPill(true)} style={{ ...BTN, background: "#00ff41", padding: "6px 14px", color: "#000", fontWeight: 700, fontSize: 9 }}>💊 Pill</button>
              <button onClick={() => setRabbit(true)} style={{ ...BTN, background: CREAM_DARK, padding: "6px 14px", color: BG, fontWeight: 700, fontSize: 9 }}>🐰 Rabbit</button>
            </div>
          </div>
        </div>

        {/* ═══ COMPONENT INVENTORY ═══ */}
        <div style={SEC}>
          <h2 style={H2}>📂 ALL 60+ COMPONENT FILES</h2>
          <div style={CARD}><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: 3 }}>
            {["ActivityPanel","ActivityTicker","Building3D","BuildingAds","BuildingEffects","CelebrationEffect","CityCanvas","CityScene","ClaimButton","CompareChallenge","ComparePath","DailiesLeaderboard","DailiesWidget","DeleteAccountButton","DistrictChooser","DistrictTowers","DropBeacon","DropsLeaderboard","EArcadeCard","EffectsLayer","FlyLeaderboard","FounderMessage","FounderSpire","GlobalRadio","InstancedBuildings","InstancedLabels","InviteCard","LeaderboardTracker","LeaderboardUserPosition","LeaderboardYouBadge","LeaderboardYouVsNext","LevelUpToast","LiveDots","LoadingScreen","LofiRadio","MiniMap","PillModal","PlazaAvatar","ProfileDistrict","ProfileTracker","QuantumCore","RabbitCompletion","RadioSlot","RaidOverlay","RaidPreviewModal","RaidSequence3D","RaidTag3D","RaidVehiclePreview","ReferralCTA","ReturnModal","ShareButtons","ShopClient","ShopPreview","SkyAds","ThemeSkyFX","WalkingAvatar","WallpaperParallax","WhiteRabbit","XpBar"].map(c => (
              <div key={c} style={{ fontSize: 8, color: WARM, background: BG, border: `1px solid ${BORDER}`, padding: "4px 6px", ...PX }}>{c}.tsx</div>
            ))}
          </div></div>
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 0", textAlign: "center", fontSize: 9, color: DIM, letterSpacing: 1, ...PX }}>
          WEB4CITY UI SHOWCASE • {new Date().toLocaleDateString("en-GB")} • 14 Components • 60+ Total
        </div>
      </div>

      {/* ═══ MODAL OVERLAYS ═══ */}
      {arcade && <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)" }} onClick={() => setArcade(false)}>
        <div style={{ background: "#0a0a0a", border: `2px solid ${LIME}`, borderRadius: 12, padding: 28, maxWidth: 380, textAlign: "center", ...PX }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎮</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: LIME, margin: "0 0 8px" }}>E.Arcade</h3>
          <p style={{ fontSize: 11, color: MUTED, margin: "0 0 16px" }}>Answer surveys, earn XP, unlock exclusive buildings</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <div style={{ background: BG_RAISED, borderRadius: 8, padding: 10 }}><div style={{ fontSize: 16, fontWeight: 700, color: LIME }}>5</div><div style={{ fontSize: 8, color: MUTED }}>Surveys</div></div>
            <div style={{ background: BG_RAISED, borderRadius: 8, padding: 10 }}><div style={{ fontSize: 16, fontWeight: 700, color: LIME }}>100</div><div style={{ fontSize: 8, color: MUTED }}>Max XP</div></div>
          </div>
          <button style={{ ...BTN, background: LIME, padding: "8px 24px", color: BG, fontWeight: 700, fontSize: 12, ...PS }}>Enter Arcade</button>
          <button onClick={() => setArcade(false)} style={{ display: "block", marginTop: 10, background: "transparent", border: "none", color: DIM, cursor: "pointer", fontSize: 10, ...PX }}>Close</button>
        </div>
      </div>}

      {district && <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)" }} onClick={() => setDistrict(false)}>
        <div style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, maxWidth: 480, ...PX }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: LIME, letterSpacing: 2, marginBottom: 14 }}>CHOOSE DISTRICT</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {[{n:"Web3",c:"#8b5cf6"},{n:"AI",c:"#ec4899"},{n:"Quantum",c:"#06b6d4"},{n:"VC",c:"#f97316"},{n:"Growth",c:"#10b981"}].map(d => (
              <div key={d.n} style={{ background: `${d.c}11`, border: `1px solid ${d.c}44`, padding: "6px 4px", textAlign: "center" }}><div style={{ fontSize: 9, fontWeight: 700, color: d.c }}>{d.n}</div></div>
            ))}
          </div>
          <button onClick={() => setDistrict(false)} style={{ ...BTN, width: "100%", marginTop: 14, background: LIME, padding: "6px", color: BG, fontWeight: 700, fontSize: 10, ...PS }}>Confirm</button>
        </div>
      </div>}

      {pill && <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.9)" }} onClick={() => setPill(false)}>
        <div style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: 14, color: "#00ff41", letterSpacing: 3, marginBottom: 28, ...PX }}>MAKE YOUR CHOICE</h3>
          <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
            <div onClick={() => setPill(false)} style={{ cursor: "pointer", textAlign: "center" }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #dc2626)", margin: "0 auto 10px", boxShadow: "0 0 16px #ef444466" }} /><div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, ...PX }}>Red Pill</div></div>
            <div onClick={() => setPill(false)} style={{ cursor: "pointer", textAlign: "center" }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", margin: "0 auto 10px", boxShadow: "0 0 16px #3b82f666" }} /><div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, ...PX }}>Blue Pill</div></div>
          </div>
        </div>
      </div>}

      {rabbit && <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }} onClick={() => setRabbit(false)}>
        <div style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🐰</div>
          <div style={{ fontSize: 12, color: "#00ff41", letterSpacing: 2, ...PX }}>You found the white rabbit.</div>
          <div style={{ fontSize: 10, color: "#00ff41", letterSpacing: 2, marginTop: 6, ...PX }}>Welcome to the other side.</div>
        </div>
      </div>}
    </div>
  );
}
