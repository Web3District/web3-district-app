"use client";

import Link from "next/link";

export default function PortugalPridePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Rainbow Flag */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-20 rounded-lg overflow-hidden shadow-2xl">
            <div className="h-1/6 bg-[#FF0000]"></div>
            <div className="h-1/6 bg-[#FF7F00]"></div>
            <div className="h-1/6 bg-[#FFFF00]"></div>
            <div className="h-1/6 bg-[#00FF00]"></div>
            <div className="h-1/6 bg-[#0000FF]"></div>
            <div className="h-1/6 bg-[#8B00FF]"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold text-center mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent">
          PORTUGAL PRIDE
        </h1>

        {/* Subtitle */}
        <p className="text-2xl text-center mb-8 text-pink-200">
          🇵🇹 Celebrating Diversity & Inclusion in Web4City 🏳️‍🌈
        </p>

        {/* Portugal Flag Emoji */}
        <div className="text-center text-8xl mb-12">🇵🇹</div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* About Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-4 text-yellow-300">
              🌈 Our Pride Landmark
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              In the heart of Web4City, standing tall in the center plaza, you'll find our 
              <strong className="text-pink-300"> Portugal Pride Building</strong> - a 
              celebratory landmark honoring diversity, inclusion, and the vibrant LGBTQ+ 
              community in Portugal and beyond.
            </p>
            <p className="text-lg leading-relaxed">
              This isn't just a building - it's a symbol of love, acceptance, and pride. 
              With its rainbow flag flying high, colorful windows glowing with pride, and 
              the illuminated "PORTUGAL PRIDE" sign, it stands as a beacon of hope and 
              celebration for all.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
              <div className="text-5xl mb-4">🏳️‍🌈</div>
              <h3 className="text-xl font-bold mb-2 text-pink-300">Rainbow Flag</h3>
              <p className="text-sm">
                A proud rainbow flag waves atop the building, visible from across the city
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2 text-yellow-300">Illuminated Sign</h3>
              <p className="text-sm">
                "PORTUGAL PRIDE" shines bright in colorful LED lights
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2 text-purple-300">Colorful Windows</h3>
              <p className="text-sm">
                Every window glows with rainbow colors, celebrating diversity
              </p>
            </div>
          </div>

          {/* Visit CTA */}
          <div className="bg-gradient-to-r from-pink-600/50 to-purple-600/50 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <h2 className="text-3xl font-bold mb-4">
              🏙️ Visit Web4City
            </h2>
            <p className="text-lg mb-6">
              Come explore our vibrant 3D city and see the Portugal Pride building 
              in all its glory! Located in the center plaza, it's impossible to miss.
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Enter Web4City
            </Link>
          </div>

          {/* Message */}
          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-pink-200 mb-4">
              💙 Love is Love 💙
            </p>
            <p className="text-lg text-white/80">
              Built with pride, for everyone. Because diversity makes us stronger.
            </p>
            <div className="text-4xl mt-6">
              🇵🇹 🏳️‍🌈 🇵🇹 🏳️‍🌈 🇵🇹
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/60">
          <p>A Web4City Initiative</p>
          <p className="text-sm mt-2">Celebrating Pride, Diversity & Inclusion</p>
        </div>
      </div>

      {/* Floating Rainbow Hearts Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            💜
          </div>
        ))}
      </div>
    </div>
  );
}
