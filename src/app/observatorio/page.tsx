"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ObservatorioPage() {
  const router = useRouter();
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  useEffect(() => {
    // Load Retell Web Widget
    const script = document.createElement("script");
    script.src = "https://cdn.retell.ai/web-widget.js";
    script.async = true;
    script.onload = () => {
      setWidgetLoaded(true);
      // Initialize widget
      (window as any).RetellWebWidget?.init({
        agentId: "agent_5f1993fdcf4de3734c8346f64c",
        theme: {
          primaryColor: "#FF007F", // Portugal Pride pink
          secondaryColor: "#009933", // Portugal green
          backgroundColor: "#1a1a24",
          textColor: "#ffffff",
          fontFamily: "Inter, sans-serif",
          borderRadius: "12px",
        },
        position: "bottom-right",
        language: "pt-PT",
        welcomeMessage: "Olá! 🏳️‍🌈 Sou o assistente do Observatório do Pinkwashing. Posso ajudar?",
        chatBubble: {
          icon: "🏳️‍🌈",
          text: "Reportar Pinkwashing",
        },
        metadata: {
          source: "portugal-pride-observatory",
          campaign: "pinkwashing-report",
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  function openReporter() {
    if (widgetLoaded) {
      (window as any).RetellWebWidget?.open();
    } else {
      alert("A carregar assistente... por favor espera um momento.");
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a24] font-pixel text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF007F] via-[#9333EA] to-[#009933] py-24 text-center">
        {/* Rainbow flag overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-1/6 bg-red-500"></div>
          <div className="h-1/6 bg-orange-500"></div>
          <div className="h-1/6 bg-yellow-500"></div>
          <div className="h-1/6 bg-green-500"></div>
          <div className="h-1/6 bg-blue-500"></div>
          <div className="h-1/6 bg-purple-500"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <div className="mb-4 text-6xl">🏳️‍🌈</div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            Observatório do Pinkwashing
            <br />
            <span className="text-[#FFD700]">Portugal Pride</span>
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-white/90">
            Tecnologia e inteligência artificial para distinguir compromisso real
            <br />
            de apropriação simbólica da causa LGBTI+.
          </p>
          <button
            onClick={openReporter}
            className="group relative overflow-hidden rounded-xl bg-white px-10 py-5 text-lg font-bold text-[#FF007F] shadow-2xl transition-all hover:scale-105 hover:shadow-[#FF007F]/50"
          >
            <span className="relative z-10 flex items-center gap-3">
              🏳️‍🌈 Reportar uma Situação
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF007F] to-[#009933] opacity-0 transition-opacity group-hover:opacity-10"></div>
          </button>
          <p className="mt-4 text-sm text-white/70">
            ⏱️ Leva 3-5 minutos • 🔒 100% Confidencial
          </p>
        </div>
      </section>

      {/* What is Pinkwashing */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#FF007F]">
          O que é Pinkwashing?
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border-4 border-[#2a2a30] bg-[#101018] p-8">
            <div className="mb-4 text-4xl">❌</div>
            <h3 className="mb-4 text-xl font-bold text-red-400">Pinkwashing</h3>
            <ul className="space-y-3 text-[#8c8c9c]">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                Usar símbolos LGBTI+ apenas para vender
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                Campanhas Pride sem investimento comunitário
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                Comunicação inclusiva com práticas discriminatórias
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                Apenas no mês do Orgulho, sem continuidade
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border-4 border-[#2a2a30] bg-[#101018] p-8">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="mb-4 text-xl font-bold text-green-400">Compromisso Real</h3>
            <ul className="space-y-3 text-[#8c8c9c]">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Políticas internas de não discriminação
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Investimento em organizações LGBTI+
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Envolvimento da comunidade nas campanhas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Ação contínua, não apenas em Junho
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#0d0d0f] py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#FF007F]">
            Como Funciona?
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                icon: "📝",
                title: "Reportas",
                desc: "Preenches o formulário com o nosso assistente IA",
              },
              {
                icon: "🤖",
                title: "Analisamos",
                desc: "IA + equipa humana avaliam o reporte com rigor",
              },
              {
                icon: "💬",
                title: "Contactamos",
                desc: "Pedimos esclarecimentos à organização (se necessário)",
              },
              {
                icon: "✨",
                title: "Transformamos",
                desc: "Propomos melhorias e acompanhamos mudanças",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mb-4 text-5xl">{step.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-[#8c8c9c]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Privacy */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#FF007F]">
          É Seguro?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: "🔒",
              title: "Confidencial",
              desc: "Os teus dados são protegidos e nunca partilhados publicamente",
            },
            {
              icon: "🎭",
              title: "Anónimo",
              desc: "Podes manter anonimato total perante a organização",
            },
            {
              icon: "👥",
              title: "Validação Humana",
              desc: "Nenhuma ação pública sem revisão da equipa Portugal Pride",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-[#2a2a30] bg-[#101018] p-6 text-center"
            >
              <div className="mb-4 text-4xl">{item.icon}</div>
              <h3 className="mb-2 font-bold text-white">{item.title}</h3>
              <p className="text-sm text-[#8c8c9c]">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 rounded-xl border-2 border-[#2a2a30] bg-[#101018]/50 p-6">
          <p className="text-center text-sm text-[#8c8c9c]">
            ⚠️ Este formulário <strong className="text-[#FF007F]">NÃO</strong> gera uma acusação pública automática.
            <br />
            Todas as situações são analisadas com cuidado, contexto e validação humana.
            <br />
            A organização terá sempre direito de resposta antes de qualquer tomada de posição.
          </p>
        </div>
      </section>

      {/* For Organizations */}
      <section className="bg-gradient-to-r from-[#101018] to-[#1a1a24] py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-[#FF007F]">
            Para Empresas e Organizações
          </h2>
          <p className="mb-8 text-lg text-[#8c8c9c]">
            A sua organização foi sinalizada ou quer evitar práticas de pinkwashing?
            <br />
            O Portugal Pride pode apoiar através de diagnóstico, formação e consultoria.
          </p>
          <button
            onClick={() => router.push("/contacto")}
            className="rounded-xl border-2 border-[#FF007F] bg-[#FF007F]/20 px-8 py-4 font-bold text-[#FF007F] transition-all hover:bg-[#FF007F]/30"
          >
            💼 Falar Connosco
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a30] bg-[#0d0d0f] py-12 text-center">
        <div className="mb-4 text-4xl">🏳️‍🌈</div>
        <p className="mb-2 text-lg font-bold text-white">Portugal Pride</p>
        <p className="text-sm text-[#8c8c9c]">
          O orgulho não é uma campanha. É compromisso.
        </p>
        <div className="mt-6 flex justify-center gap-6 text-xs text-[#8c8c9c]">
          <a href="/privacidade" className="hover:text-[#FF007F]">
            Privacidade
          </a>
          <a href="/termos" className="hover:text-[#FF007F]">
            Termos
          </a>
          <a href="/contacto" className="hover:text-[#FF007F]">
            Contacto
          </a>
        </div>
      </footer>

      {/* Floating Chat Button (mobile) */}
      <button
        onClick={openReporter}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-[#FF007F] px-6 py-4 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-[#FF007F]/50 md:hidden"
      >
        🏳️‍🌈 Reportar
      </button>
    </div>
  );
}
