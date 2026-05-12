"use client";

import { useState } from "react";

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    organization: "",
    name: "",
    email: "",
    interest: "diagnostico",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Send to Portugal Pride team
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#1a1a24] font-pixel text-white">
      {/* Header */}
      <header className="border-b-4 border-[#FF007F] bg-[#0d0d0f] px-6 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl text-[#FF007F]">💼 Para Organizações</h1>
          <p className="text-sm text-[#8c8c9c]">
            Quer comunicar inclusão com responsabilidade?
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {submitted ? (
          <div className="rounded-2xl border-4 border-green-600 bg-green-900/20 p-8 text-center">
            <div className="mb-4 text-6xl">✅</div>
            <h2 className="mb-4 text-2xl font-bold text-green-400">
              Obrigado pelo contacto!
            </h2>
            <p className="text-[#8c8c9c]">
              A equipa Portugal Pride entrará em contacto dentro de 2-3 dias úteis.
            </p>
          </div>
        ) : (
          <>
            <section className="mb-12 rounded-2xl border-4 border-[#2a2a30] bg-[#101018] p-8">
              <h2 className="mb-6 text-2xl font-bold text-[#FF007F]">
                Como Podemos Ajudar?
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    icon: "📊",
                    title: "Diagnóstico LGBTI+",
                    desc: "Avaliação de maturidade e políticas internas",
                  },
                  {
                    icon: "🎓",
                    title: "Formação",
                    desc: "Workshops para lideranças e equipas",
                  },
                  {
                    icon: "📝",
                    title: "Revisão de Campanhas",
                    desc: "Guidelines anti-pinkwashing para comunicações",
                  },
                  {
                    icon: "🏳️‍🌈",
                    title: "Ativação Pride",
                    desc: "Planos responsáveis para mês do Orgulho",
                  },
                  {
                    icon: "📈",
                    title: "Relatório de Impacto",
                    desc: "Métricas e prestação de contas à comunidade",
                  },
                  {
                    icon: "🤝",
                    title: "Parcerias Comunitárias",
                    desc: "Ligação a organizações e projetos LGBTI+",
                  },
                ].map((service, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border-2 border-[#2a2a30] bg-[#161618] p-4"
                  >
                    <div className="text-3xl">{service.icon}</div>
                    <div>
                      <h3 className="font-bold text-white">{service.title}</h3>
                      <p className="text-sm text-[#8c8c9c]">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border-4 border-[#2a2a30] bg-[#101018] p-8">
              <h2 className="mb-6 text-2xl font-bold text-[#FF007F]">
                Fale Connosco
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm text-[#8c8c9c]">
                    Organização / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({ ...formData, organization: e.target.value })
                    }
                    className="w-full rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-3 font-pixel text-white focus:border-[#FF007F] focus:outline-none"
                    placeholder="Nome da sua organização"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-[#8c8c9c]">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-3 font-pixel text-white focus:border-[#FF007F] focus:outline-none"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-[#8c8c9c]">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-3 font-pixel text-white focus:border-[#FF007F] focus:outline-none"
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#8c8c9c]">
                    Interesse Principal
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) =>
                      setFormData({ ...formData, interest: e.target.value })
                    }
                    className="w-full rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-3 font-pixel text-white focus:border-[#FF007F] focus:outline-none"
                  >
                    <option value="diagnostico">Diagnóstico de Maturidade</option>
                    <option value="formacao">Formação LGBTI+</option>
                    <option value="campanhas">Revisão de Campanhas</option>
                    <option value="pride">Ativação Pride</option>
                    <option value="impacto">Relatório de Impacto</option>
                    <option value="parcerias">Parcerias Comunitárias</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#8c8c9c]">
                    Mensagem
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-3 font-pixel text-white focus:border-[#FF007F] focus:outline-none"
                    placeholder="Conte-nos mais sobre as suas necessidades..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#FF007F] py-4 font-bold text-white transition-all hover:bg-[#FF007F]/90"
                >
                  📩 Enviar Mensagem
                </button>

                <p className="text-center text-xs text-[#8c8c9c]">
                  Ao enviar, concorda com a nossa política de privacidade.
                  <br />
                  Responderemos dentro de 2-3 dias úteis.
                </p>
              </form>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a30] bg-[#0d0d0f] py-8 text-center text-sm text-[#8c8c9c]">
        <p>🏳️‍🌈 Portugal Pride © {new Date().getFullYear()}</p>
        <p className="mt-2">O orgulho não é uma campanha. É compromisso.</p>
      </footer>
    </div>
  );
}
