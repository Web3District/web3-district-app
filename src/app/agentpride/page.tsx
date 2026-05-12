"use client";

import { useEffect } from "react";

export default function AgentPrideRedirect() {
  useEffect(() => {
    // Redirect to emergent agent preview
    window.location.href = "https://pride-dimensional.preview.emergentagent.com/";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a24] font-pixel text-white">
      {/* Logo */}
      <div className="mb-8 text-8xl">🏳️‍🌈</div>

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold text-[#FF007F]">
        Agente Pride
      </h1>

      {/* Loading Message */}
      <p className="mb-8 text-lg text-[#8c8c9c]">
        A redirecionar para o Agente do Observatório do Pinkwashing...
      </p>

      {/* Manual Link */}
      <p className="mb-4 text-sm text-[#8c8c9c]">
        Se não fores redirecionado automaticamente, clica abaixo:
      </p>

      <a
        href="https://pride-dimensional.preview.emergentagent.com/"
        className="rounded-xl border-2 border-[#FF007F] bg-[#FF007F]/20 px-8 py-4 font-bold text-[#FF007F] transition-all hover:bg-[#FF007F]/30"
      >
        🤖 Abrir Agente Pride
      </a>

      {/* Back Link */}
      <a
        href="/observatorio"
        className="mt-6 text-sm text-[#8c8c9c] hover:text-[#FF007F]"
      >
        ← Voltar ao Observatório
      </a>
    </div>
  );
}
