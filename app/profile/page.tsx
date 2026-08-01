'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-cyber-gradient">
      {/* Scanline effect */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(88,166,255,0.02)_50%)] bg-[length:100%_4px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16">
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"></div>
          <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Cyberpunk header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-block">
              <span className="rounded border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                MULTI-AI SYSTEM ARCHITECT
              </span>
            </div>
            
            <h1 className={`mb-4 text-5xl font-black tracking-tight md:text-7xl ${glitchActive ? 'animate-glitch' : ''}`}>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SANTOSH
              </span>
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}KUMAR
              </span>
            </h1>

            <p className="mx-auto mb-6 max-w-2xl text-lg text-muted">
              Digital Architect • AI Orchestrator • Cyberpunk Visionary
            </p>

            {/* Status indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent2"></span>
                <span className="text-muted">SYSTEM ONLINE</span>
              </span>
              <span className="text-muted/30">|</span>
              <span className="text-muted">NEURAL LINK: ACTIVE</span>
              <span className="text-muted/30">|</span>
              <span className="text-muted">AI ARSENAL: LOADED</span>
            </div>
          </div>

          {/* ASCII Art Name */}
          <div className="mb-12 overflow-x-auto">
            <pre className="text-center text-[8px] leading-none text-accent/40 md:text-[10px]">
{`██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗    ██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ 
██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝    ██║  ██║██╔══██╗████╗  ██║██╔═══██╗
██║   ██║███████║██║   ██║██║     ██║       ███████║███████║██╔██╗ ██║██║   ██║
╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║       ██╔══██║██╔══██║██║╚██╗██║██║   ██║
 ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║       ██║  ██║██║  ██║██║ ╚████║╚██████╔╝
  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ `}
            </pre>
          </div>

          {/* Multi-AI Arsenal Grid */}
          <div className="mb-16">
            <h2 className="mb-6 text-center text-2xl font-bold text-white">
              <span className="text-accent">🤖</span> Multi-AI Arsenal
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: '🧠', name: 'Neural Network', desc: 'Deep learning & pattern recognition', status: 'ONLINE' },
                { icon: '💬', name: 'Language AI', desc: 'GPT-4, Claude, LLaMA integration', status: 'ONLINE' },
                { icon: '🖼️', name: 'Vision AI', desc: 'DALL-E, Stable Diffusion, ImageGen', status: 'ONLINE' },
                { icon: '🎵', name: 'Audio AI', desc: 'Voice synthesis & music generation', status: 'ONLINE' },
                { icon: '📊', name: 'Data AI', desc: 'Analytics & predictive modeling', status: 'ONLINE' },
                { icon: '⚡', name: 'Code AI', desc: 'Development automation & review', status: 'ONLINE' },
              ].map((ai, i) => (
                <div 
                  key={i}
                  className="group relative overflow-hidden rounded-xl border border-line bg-panel/80 p-4 transition-all duration-300 hover:border-accent/50 hover:shadow-cyber"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <div className="relative">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-3xl">{ai.icon}</span>
                      <span className="rounded bg-accent2/20 px-2 py-0.5 text-[10px] font-bold text-accent2">
                        {ai.status}
                      </span>
                    </div>
                    <h3 className="mb-1 font-bold text-white">{ai.name}</h3>
                    <p className="text-xs text-muted">{ai.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-16">
            <h2 className="mb-6 text-center text-2xl font-bold text-white">
              <span className="text-accent">⚙️</span> Tech Arsenal
            </h2>
            
            <div className="rounded-xl border border-line bg-panel/80 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { category: 'Languages', items: ['TypeScript', 'Python', 'Rust', 'Go', 'Solidity'] },
                  { category: 'Frameworks', items: ['Next.js', 'React', 'FastAPI', 'TensorFlow', 'PyTorch'] },
                  { category: 'Cloud & DevOps', items: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'] },
                  { category: 'AI & ML', items: ['LangChain', 'OpenAI', 'HuggingFace', 'Vertex AI'] },
                ].map((cat, i) => (
                  <div key={i}>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-accent">{cat.category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item, j) => (
                        <span 
                          key={j}
                          className="rounded border border-line bg-ink px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-16">
            <h2 className="mb-6 text-center text-2xl font-bold text-white">
              <span className="text-accent">📊</span> System Stats
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: '50+', label: 'Projects Built', icon: '🚀' },
                { value: '1M+', label: 'Downloads', icon: '📥' },
                { value: '99.9%', label: 'Uptime', icon: '⚡' },
                { value: '10+', label: 'AI Models', icon: '🤖' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="rounded-xl border border-line bg-panel/80 p-6 text-center transition-all hover:shadow-cyber"
                >
                  <span className="text-3xl">{stat.icon}</span>
                  <div className="mt-2 text-3xl font-black text-accent">{stat.value}</div>
                  <div className="text-xs text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-white">
              <span className="text-accent">🔗</span> Connect
            </h2>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { label: 'GitHub', href: 'https://github.com/santoshkumarvvv', color: 'accent' },
                { label: 'Twitter', href: 'https://twitter.com/santoshkumarvvv', color: 'cyan' },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/santoshkumarvvv', color: 'blue' },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-line bg-panel/80 px-6 py-3 font-bold text-white transition-all hover:border-accent hover:shadow-cyber"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-8 text-center">
        <p className="text-sm text-muted">
          <span className="text-accent font-bold">SANTOSH KUMAR</span> • Multi-AI Cyberpunk Edition
        </p>
        <p className="mt-2 text-xs text-muted/50">
          Built with neural networks and caffeine • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
