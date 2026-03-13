import { motion } from "motion/react";
import { ArrowRight, Play, CheckCircle2, Zap, BarChart3, Rocket, Globe, Shield, Users, Lightbulb, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";

const DESIGN_THINKING_STEPS = [
  { label: "Dream / Problem", emoji: "💡", desc: "Start with your idea or a real-world problem you want to solve." },
  { label: "Empathize", emoji: "🤝", desc: "Understand who is affected and what they truly need." },
  { label: "Define", emoji: "🎯", desc: "Craft a clear, focused problem statement." },
  { label: "Ideate", emoji: "🧠", desc: "Generate creative solutions and explore possibilities." },
  { label: "Prototype", emoji: "⚙️", desc: "Build a concept: logo, pitch deck, and MVP." },
  { label: "Test", emoji: "🔬", desc: "Validate your idea with real users and metrics." },
  { label: "Reality", emoji: "🚀", desc: "Launch your product and bring it to the world." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Dream2Reality AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#design-thinking" className="hover:text-indigo-600 transition-colors">Design Thinking Flow</a>
            <a href="#community" className="hover:text-indigo-600 transition-colors">Community</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Log in</Link>
            <Link to="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Start Your Journey
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
              AI-Powered Design Thinking Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Turn Dreams Into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Real Solutions With AI
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              Dream2Reality AI guides you step-by-step through the Design Thinking process to transform real problems into validated solutions, prototypes, and startup ideas.
            </p>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Talk with an AI mentor that helps you understand users, define problems, generate ideas, build prototypes, and launch real products.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                Start Your Innovation Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" /> See How It Works
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
                  <p className="text-slate-500 font-medium tracking-tight">See Dream2Reality AI in action</p>
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
                  <p className="text-sm font-bold">Problem Defined</p>
                  <p className="text-xs text-slate-500">Design Thinking: DEFINE</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">Prototype Ready</p>
                  <p className="text-xs text-slate-500">MVP + Pitch Deck generated</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to go from idea to reality</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">An AI-powered mentor that walks you through every stage of turning a problem into a product.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "AI Design Thinking Mentor",
                desc: "An AI agent that guides you through Empathy, Problem Definition, Ideation, Prototyping, and Testing — one step at a time."
              },
              {
                icon: Zap,
                title: "Problem → Solution Builder",
                desc: "Transform real-world problems into innovative products with structured guidance and AI-powered insights at every stage."
              },
              {
                icon: FlaskConical,
                title: "Prototype & Launch",
                desc: "Generate logos, pitch decks, market analysis, and validate your idea before bringing it to reality."
              },
              {
                icon: BarChart3,
                title: "Market Validation",
                desc: "Get real-time market size estimates, competitor analysis, and revenue projections for any solution idea."
              },
              {
                icon: Globe,
                title: "Branding & Identity",
                desc: "Create unique brand identities, AI-generated logos, and colour palettes that match your product's vision."
              },
              {
                icon: Shield,
                title: "Investor-Ready Pitch Deck",
                desc: "Automatically generate a professional pitch deck covering problem, solution, market, and business model."
              },
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

      {/* Design Thinking Flow Section */}
      <section id="design-thinking" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Dream2Reality Flow</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our AI mentor walks you through each stage of Design Thinking — from the first spark to a launched product.</p>
          </div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-start">
              {DESIGN_THINKING_STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-2xl mb-3 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all shadow-sm"
                  >
                    {step.emoji}
                  </motion.div>
                  <p className="text-sm font-bold text-slate-900 mb-1">{step.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed hidden md:block">{step.desc}</p>
                  {i < DESIGN_THINKING_STEPS.length - 1 && (
                    <div className="hidden md:flex absolute" style={{ left: `calc(${(i + 1) * (100 / 7)}% - 8px)`, top: "28px" }}>
                      <ArrowRight className="w-4 h-4 text-indigo-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Mobile step descriptions */}
            <div className="mt-8 space-y-3 md:hidden">
              {DESIGN_THINKING_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xl shrink-0">{step.emoji}</span>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{step.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 group">
              Begin Your Design Thinking Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Innovation Hub</h2>
          <p className="text-indigo-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with innovators, share your ideas, find teammates, and collaborate to bring projects to life.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: "Share Ideas", desc: "Post your startup concept and get feedback from the community." },
              { title: "Find Co-Founders", desc: "Connect with people who have complementary skills and shared vision." },
              { title: "Collaborate", desc: "Join teams, contribute expertise, and build together." },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-50 transition-all shadow-xl group">
            Join the Community <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Dream2Reality AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 Dream2Reality AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
