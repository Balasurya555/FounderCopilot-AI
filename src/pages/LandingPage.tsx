import { motion } from "motion/react";
import { ArrowRight, Play, CheckCircle2, Zap, BarChart3, Rocket, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Founder Copilot</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Log in</Link>
            <Link to="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Start Building
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
              The Future of Entrepreneurship
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Your AI Co-Founder That <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Builds Startups With You
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk to an AI agent that validates ideas, creates pitch decks, designs logos, and generates marketing content in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                Start Building <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" /> Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden aspect-video">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                    <Play className="w-6 h-6 text-indigo-600 fill-current" />
                  </div>
                  <p className="text-slate-500 font-medium tracking-tight">Click to preview the Copilot in action</p>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">Idea Validated</p>
                  <p className="text-xs text-slate-500">Market Score: 92/100</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">Pitch Deck Ready</p>
                  <p className="text-xs text-slate-500">12 slides generated</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to launch</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From the first spark of an idea to your first investor meeting, we've got your back.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Instant Validation", desc: "Get real-time market analysis and competitor research for any startup idea." },
              { icon: BarChart3, title: "Pitch Deck Generation", desc: "Professional slides created automatically based on your business model." },
              { icon: Shield, title: "Investor Mode", desc: "Simulate tough questions from VCs to prepare for your next big pitch." },
              { icon: Globe, title: "Landing Pages", desc: "Generate high-converting landing page copy and UI mockups instantly." },
              { icon: CheckCircle2, title: "Branding & Logos", desc: "Create unique brand identities and logos that match your startup's vibe." },
              { icon: Rocket, title: "Go-to-Market Strategy", desc: "Step-by-step roadmaps to acquire your first 1,000 customers." },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Founder Copilot</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 Founder Copilot AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
