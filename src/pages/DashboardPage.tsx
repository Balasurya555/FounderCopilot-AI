import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Lightbulb,
  Presentation,
  Palette,
  Megaphone,
  UserCircle,
  Settings,
  Search,
  Bell,
  Plus,
  Send,
  Mic,
  MicOff,
  Volume2,
  Play,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Users,
  Target,
  BarChart2,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { MOCK_MESSAGES, INITIAL_STARTUP_DATA, StartupData } from "../lib/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateStartupInsights, editLogo, checkHealth } from "../services/geminiService";
import { generateLogo } from "../services/logoService";
import { exportCanvasToExcel } from "../utils/exportToExcel";
import Community from "./Community";
import { useVoice } from "../lib/useVoice";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [startupData, setStartupData] = useState<StartupData | null>(null);
  const [startupLogo, setStartupLogo] = useState<string | null>(null);
  const [hasUploadedLogo, setHasUploadedLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [logoEditPrompt, setLogoEditPrompt] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");

  const [logoShape, setLogoShape] = useState("Minimal");
  const [logoStyle, setLogoStyle] = useState("Modern SaaS");
  const [logoTheme, setLogoTheme] = useState("Tech");
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);

  useEffect(() => {
    const checkBackend = async () => {
      const ready = await checkHealth();
      setIsBackendReady(ready);
    };

    // Check immediately, then poll every 2 seconds
    checkBackend();
    const interval = setInterval(checkBackend, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Logo generation is now manually triggered via user choice in chat
  }, [startupData?.startup_name, startupLogo, isGeneratingLogo, hasUploadedLogo]);

  const handleGenerateLogo = async () => {
    if (!startupData?.startup_name || hasUploadedLogo) return;
    setIsGeneratingLogo(true);
    setLogoError(null);
    setGeneratedLogos([]);
    try {
      const fullDescription = logoEditPrompt
        ? `${startupData.idea_summary}. Stylistic requests from founder: ${logoEditPrompt}.`
        : startupData.idea_summary;

      const urls = await generateLogo(startupData.startup_name, fullDescription, logoShape, logoStyle, logoTheme);
      if (urls && urls.length > 0) {
        setGeneratedLogos(urls);
      } else {
        setLogoError("Logo generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Logo generation error:", error);
      setLogoError("Logo generation failed. Please try again.");
    }
    setIsGeneratingLogo(false);
  };

  const handleEditLogo = async () => {
    if (!startupLogo || !logoEditPrompt.trim()) return;
    setIsGeneratingLogo(true);

    const colorInstruction = `Ensure the design heavily incorporates the primary color ${primaryColor} and secondary color ${secondaryColor}.`;
    const fullEditPrompt = `${logoEditPrompt}. ${colorInstruction}`;

    const url = await editLogo(startupLogo, fullEditPrompt);
    if (url) setStartupLogo(url);
    setLogoEditPrompt("");
    setIsGeneratingLogo(false);
  };

  const handleDownloadLogo = (format: 'png' | 'svg') => {
    if (!startupLogo) return;
    const link = document.createElement('a');

    // In our new flow with Imagen 3, the images are actually JPEG base64 (despite the prompt constraints).
    // We should download them as returned by the generated model.
    link.href = startupLogo;
    link.download = `${startupData?.startup_name?.replace(/\s+/g, '_').toLowerCase() || 'startup'}_logo.${format}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMsg = { role: "user", content: messageText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);
    voice.setProcessing();

    try {
      const insights = await generateStartupInsights(newMessages, askedQuestions);
      setIsTyping(false);

      if (insights.next_question_for_founder) {
        setAskedQuestions(prev => [...prev, insights.next_question_for_founder]);
      }

      const aiMsg = {
        role: "assistant",
        content: insights.chat_response || insights.next_question_for_founder || "I've updated the dashboard with my latest analysis. What do you think?",
        data: insights
      };

      setMessages(prev => {
        const isInBrandingStage = insights.design_thinking_stage === "BRANDING";
        const hasAskedLogo = prev.some((m: any) => m.isLogoChoice) || hasUploadedLogo || startupLogo;
        const newMsgs = [...prev, aiMsg];

        if (isInBrandingStage && !hasAskedLogo && insights.startup_name) {
          return [...newMsgs, {
            role: "assistant",
            content: "Since we're in the Branding stage — do you already have a logo, or would you like me to generate one for you?",
            isLogoChoice: true
          }];
        }
        return newMsgs;
      });

      setStartupData(insights);

      // Voice output: speak the AI response aloud if voice mode is on
      const spokenText = insights.chat_response || insights.next_question_for_founder || "";
      if (spokenText) voice.speak(spokenText);
    } catch (error: any) {
      console.error("AI Error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: error.message || "I encountered an error while analyzing your idea. Please try again."
      }]);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
        setLogoError("Invalid file type. Please upload a PNG, JPG, or SVG.");
        return;
      }
      try {
        const reader = new FileReader();
        reader.onload = (rev) => {
          setStartupLogo(rev.target?.result as string);
          setHasUploadedLogo(true);
          setLogoError(null);
          setMessages(prev => prev.filter(msg => !(msg as any).isLogoChoice));
          setActiveTab("Branding");
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setLogoError("Logo upload failed.");
      }
    }
  };

  const handleGenerateLogoChoice = () => {
    setMessages(prev => prev.filter(msg => !(msg as any).isLogoChoice));
    setActiveTab("Branding");
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to start a new session? This will clear the current chat.")) {
      setMessages([MOCK_MESSAGES[0]]);
      setAskedQuestions([]);
    }
  };

  // Voice interaction hook
  const handleVoiceTranscript = useCallback((text: string) => {
    setInputValue(text);
    // Auto-send after a short delay so user sees the text
    setTimeout(() => handleSend(text), 300);
  }, []);

  const voice = useVoice({ onTranscript: handleVoiceTranscript });

  const toggleMic = () => {
    if (voice.isSpeaking) {
      // Interrupt AI speech and start listening
      voice.interrupt();
    } else {
      voice.toggleListening();
    }
  };

  const handleExport = () => {
    window.print();
  };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };
  const handleSettings = () => alert("Opening account settings...");
  const handleUpgrade = () => alert("Redirecting to subscription plans...");
  const handleNotifications = () => alert("No new notifications.");
  const handleMatrix = () => alert("Opening detailed competitor matrix...");
  const handleCustomizeBrand = () => alert("Opening brand customization suite...");

  const handleDeployToCommunity = async () => {
    if (!startupData) return;
    try {
      await fetch("http://localhost:5000/community/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: startupData.startup_name,
          description: startupData.idea_summary + " - " + startupData.problem_statement,
          tags: startupData.target_customers,
          author: "Alex Rivera"
        })
      });
      alert("Successfully deployed to Community!");
      setActiveTab("Community");
    } catch (e) {
      alert("Failed to deploy to Community");
    }
  };

  const DESIGN_THINKING_STAGES = ["EMPATHIZE", "DEFINE", "IDEATE", "VALIDATE", "PROTOTYPE", "BRANDING", "LAUNCH"];

  const isStageUnlocked = (targetStage: string) => {
    if (!startupData?.design_thinking_stage) return targetStage === "EMPATHIZE";
    const currentIndex = DESIGN_THINKING_STAGES.indexOf(startupData.design_thinking_stage);
    const targetIndex = DESIGN_THINKING_STAGES.indexOf(targetStage);
    return currentIndex >= targetIndex;
  };

  const availableNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", requiredStage: "EMPATHIZE" },
    { icon: Users, label: "Community", requiredStage: "EMPATHIZE" },
    { icon: Lightbulb, label: "Idea Validation", requiredStage: "DEFINE" },
    { icon: Presentation, label: "Pitch Deck", requiredStage: "PROTOTYPE" },
    { icon: Palette, label: "Branding", requiredStage: "BRANDING" },
    { icon: Megaphone, label: "Marketing Assets", requiredStage: "BRANDING" },
    { icon: UserCircle, label: "Investor Mode", requiredStage: "LAUNCH" },
  ].filter(item => isStageUnlocked(item.requiredStage));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Dream2Reality AI</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {availableNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === item.label
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <div className="mt-4 p-3 bg-slate-900 rounded-2xl text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pro Plan</p>
            <p className="text-sm font-medium mb-3">Unlock unlimited AI generations</p>
            <button
              onClick={handleUpgrade}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Nav */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, assets..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleNotifications}
              className="p-2 text-slate-400 hover:text-slate-600 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Alex Rivera</p>
                <p className="text-xs text-slate-500 mt-1">Serial Founder</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                AR
              </div>
            </div>
          </div>
        </header>

        {/* AI Service Status Banner */}
        {!isBackendReady && (
          <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-8 py-2 flex items-center gap-2 text-amber-700 text-sm font-medium">
            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            AI service starting… The chatbot will be ready in a moment.
          </div>
        )}

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Output Panel */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
            <AnimatePresence mode="wait">
              {startupData ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 max-w-5xl mx-auto"
                >
                  {/* Header Info - Always visible */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Analysis Active</span>
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{startupData.startup_name}</h1>
                      <p className="text-slate-500 mt-1">{startupData.idea_summary}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                        Export <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleShare}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all font-medium"
                      >
                        Share Link
                      </button>
                      {isStageUnlocked("LAUNCH") && (
                        <button
                          onClick={handleDeployToCommunity}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                          Deploy to Community
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Design Thinking Progress */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto">
                    {DESIGN_THINKING_STAGES.map((stage, index) => {
                      const currentStageIndex = DESIGN_THINKING_STAGES.indexOf(startupData.design_thinking_stage || "EMPATHIZE");
                      const isCompleted = index < currentStageIndex;
                      const isCurrent = index === currentStageIndex;

                      return (
                        <div key={stage} className="flex items-center gap-2 shrink-0">
                          <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                            isCompleted ? "bg-green-100 text-green-600" : isCurrent ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                          )}>
                            {isCompleted ? "✓" : index + 1}
                          </div>
                          <span className={cn("text-sm font-bold", isCurrent ? "text-indigo-600" : isCompleted ? "text-slate-800" : "text-slate-400")}>{stage}</span>
                          {index < DESIGN_THINKING_STAGES.length - 1 && (
                            <div className={cn("w-8 sm:w-16 h-px", isCompleted ? "bg-green-200" : "bg-slate-200")} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dashboard Tab */}
                  {(activeTab === "Dashboard" || activeTab === "Idea Validation") && (
                    <>
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { label: "Market Size", value: startupData.market_size_estimate, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                          { label: "Startup Score", value: startupData.startup_score, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
                          { label: "Competitors", value: startupData.competitors.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                          { label: "Revenue Potential", value: startupData.revenue_projection.year3, icon: BarChart2, color: "text-orange-600", bg: "bg-orange-50" },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                                <stat.icon className="w-5 h-5" />
                              </div>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                              <p className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold mb-6">Market Opportunity & Pain Points</h3>
                            <p className="text-slate-600 leading-relaxed mb-6 font-medium italic">"{startupData.problem_statement}"</p>

                            <div className="mb-6 space-y-3">
                              <h4 className="font-bold text-sm text-slate-900">User Pain Points</h4>
                              {startupData.user_pain_points?.map((pain: string, idx: number) => (
                                <div key={idx} className="flex gap-2 items-start"><span className="text-red-500">•</span><span className="text-sm text-slate-700">{pain}</span></div>
                              ))}
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 mb-3">Target Customers</h4>
                            <div className="flex flex-wrap gap-2">
                              {startupData.target_customers?.map((tag: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {isStageUnlocked("IDEATE") && (
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Business Model Canvas</h3>
                                <button
                                  onClick={() => exportCanvasToExcel(startupData.business_model_canvas, startupData.startup_name)}
                                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                >
                                  Export to Excel
                                </button>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-[8px] font-bold uppercase tracking-tighter">
                                <div className="col-span-1 border border-slate-100 p-2 rounded-lg bg-slate-50 h-48 overflow-y-auto">
                                  <p className="mb-1 text-slate-400">Key Partners</p>
                                  {startupData.business_model_canvas.key_partners.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                </div>
                                <div className="col-span-1 flex flex-col gap-2">
                                  <div className="border border-slate-100 p-2 rounded-lg bg-slate-50 h-24 overflow-y-auto">
                                    <p className="mb-1 text-slate-400">Key Activities</p>
                                    {startupData.business_model_canvas.key_activities.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                  </div>
                                  <div className="border border-slate-100 p-2 rounded-lg bg-slate-50 h-22 overflow-y-auto">
                                    <p className="mb-1 text-slate-400">Key Resources</p>
                                    {startupData.business_model_canvas.key_resources.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                  </div>
                                </div>
                                <div className="col-span-1 border border-indigo-100 p-2 rounded-lg bg-indigo-50/50 h-48 text-indigo-600 overflow-y-auto">
                                  <p className="mb-1 text-indigo-400">Value Proposition</p>
                                  {startupData.business_model_canvas.value_proposition.map((p, j) => <p key={j} className="mb-1">• {p}</p>)}
                                </div>
                                <div className="col-span-1 flex flex-col gap-2">
                                  <div className="border border-slate-100 p-2 rounded-lg bg-slate-50 h-24 overflow-y-auto">
                                    <p className="mb-1 text-slate-400">Customer Relationships</p>
                                    {startupData.business_model_canvas.customer_relationships.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                  </div>
                                  <div className="border border-slate-100 p-2 rounded-lg bg-slate-50 h-22 overflow-y-auto">
                                    <p className="mb-1 text-slate-400">Channels</p>
                                    {startupData.business_model_canvas.channels.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                  </div>
                                </div>
                                <div className="col-span-1 border border-slate-100 p-2 rounded-lg bg-slate-50 h-48 overflow-y-auto">
                                  <p className="mb-1 text-slate-400">Customer Segments</p>
                                  {startupData.business_model_canvas.customer_segments.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                </div>
                                <div className="col-span-2 border border-slate-100 p-2 rounded-lg bg-slate-50 h-20 overflow-y-auto">
                                  <p className="mb-1 text-slate-400">Cost Structure</p>
                                  {startupData.business_model_canvas.cost_structure.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                </div>
                                <div className="col-span-3 border border-slate-100 p-2 rounded-lg bg-slate-50 h-20 overflow-y-auto">
                                  <p className="mb-1 text-slate-400">Revenue Streams</p>
                                  {startupData.business_model_canvas.revenue_streams.map((p, j) => <p key={j} className="text-slate-700 mb-1">• {p}</p>)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-8">
                          {isStageUnlocked("IDEATE") && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                              <h3 className="font-bold mb-4">Competitor Landscape</h3>
                              <div className="space-y-4">
                                {startupData.competitors?.map((comp, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-xs">
                                        {comp[0]}
                                      </div>
                                      <span className="text-sm font-medium">{comp}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Direct</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {isStageUnlocked("TEST") && (
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                              <h3 className="font-bold mb-4">Validation Plan</h3>
                              <div className="space-y-3">
                                {startupData.validation_plan?.map((plan: string, idx: number) => (
                                  <div key={idx} className="flex gap-2 items-start text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>{plan}</span>
                                  </div>
                                ))}
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <h4 className="font-bold text-[10px] text-slate-400 uppercase mb-2">Early Adopters Strategy</h4>
                                  <p className="text-sm font-medium text-slate-800">{startupData.early_adopters_strategy}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Pitch Deck Tab */}
                  {(activeTab === "Dashboard" || activeTab === "Pitch Deck") && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-bold mb-6">Pitch Deck Preview</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {["Problem", "Solution", "Market", "Product", "Business Model", "Go To Market"].map((title, i) => (
                          <div key={i} className="aspect-video bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slide {i + 1}</span>
                              <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                              {startupData.pitch_deck_preview[i] || "Generating content..."}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Branding Tab */}
                  {(activeTab === "Dashboard" || activeTab === "Branding") && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                        <div className="relative z-10 flex gap-8">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">Logo Concept</h3>
                            <p className="text-indigo-100 text-sm mb-6">AI-generated based on your unique advantage: "{startupData.unique_advantage}"</p>

                            {/* Setup form moved to the Brand Identity card on the right */}
                          </div>

                          <div className="w-48 h-48 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0 overflow-hidden border border-white/30 relative group">
                            {isGeneratingLogo ? (
                              <div className="flex flex-col items-center gap-2">
                                <Sparkles className="w-10 h-10 animate-pulse text-white" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white">Generating brand identity...</span>
                              </div>
                            ) : startupLogo ? (
                              <>
                                <img src={startupLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-xs font-bold uppercase tracking-widest text-white">
                                  Change Logo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUploadLogo}
                                  />
                                </label>
                              </>
                            ) : logoError ? (
                              <div className="flex flex-col items-center gap-2 p-4 text-center">
                                <span className="text-xs font-bold text-white/80">{logoError}</span>
                                <button
                                  onClick={handleGenerateLogo}
                                  className="text-[10px] font-bold uppercase tracking-widest underline text-white"
                                >
                                  Try Again
                                </button>
                              </div>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                                <span className="text-6xl font-black tracking-tighter text-white">{startupData.startup_name.substring(0, 2).toUpperCase()}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest mt-2 text-white/60">Upload Logo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleUploadLogo}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                      </div>

                      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-xl font-bold mb-2">Brand Identity</h3>
                        <p className="text-slate-500 text-sm mb-6">Visual guidelines generated for {startupData.startup_name}</p>
                        {!startupLogo && !hasUploadedLogo && !isGeneratingLogo ? (
                          <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex-1 flex flex-col justify-start">
                            {generatedLogos.length > 0 ? (
                              <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-800">Select a Professional Logo Concept</p>
                                <div className="grid grid-cols-3 gap-4">
                                  {generatedLogos.map((logo, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                      <div className="aspect-square bg-white rounded-xl border border-slate-200 overflow-hidden">
                                        <img src={logo} alt={`Concept ${idx + 1}`} className="w-full h-full object-cover" />
                                      </div>
                                      <button
                                        onClick={() => {
                                          setStartupLogo(logo);
                                          setHasUploadedLogo(false);

                                          // Aesthetic Auto generation of brand identity based on logo selection (mock logical mapping based on shape/style)
                                          const stylingColors = {
                                            "Modern SaaS": ["#6366f1", "#14b8a6"],
                                            "Futuristic AI": ["#8b5cf6", "#f43f5e"],
                                            "Minimal Tech": ["#0f172a", "#3b82f6"],
                                            "Clean Startup": ["#10b981", "#3b82f6"],
                                            "Bold Tech": ["#ef4444", "#f59e0b"],
                                            "Geometric Symbol": ["#3b82f6", "#8b5cf6"]
                                          };

                                          const colors = stylingColors[logoStyle as keyof typeof stylingColors] || ["#4f46e5", "#10b981"];
                                          setPrimaryColor(colors[0]);
                                          setSecondaryColor(colors[1]);
                                        }}
                                        className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all"
                                      >
                                        Select Logo {idx + 1}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-3">
                                  <button
                                    onClick={() => setGeneratedLogos([])}
                                    className="w-full py-2 bg-white text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all"
                                  >
                                    Edit Options & Regenerate
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-800 mb-2">Design your startup identity</p>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Logo Shape</label>
                                    <select
                                      value={logoShape}
                                      onChange={(e) => setLogoShape(e.target.value)}
                                      className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="Circle">Circle</option>
                                      <option value="Hexagon">Hexagon</option>
                                      <option value="Square">Square</option>
                                      <option value="Abstract geometric">Abstract geometric</option>
                                      <option value="Shield">Shield</option>
                                      <option value="Minimal symbol">Minimal symbol</option>
                                      <option value="AI generated abstract">AI generated abstract</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Logo Style</label>
                                    <select
                                      value={logoStyle}
                                      onChange={(e) => setLogoStyle(e.target.value)}
                                      className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="Minimal Tech">Minimal Tech</option>
                                      <option value="Modern SaaS">Modern SaaS</option>
                                      <option value="Futuristic AI">Futuristic AI</option>
                                      <option value="Clean Startup">Clean Startup</option>
                                      <option value="Bold Tech">Bold Tech</option>
                                      <option value="Geometric Symbol">Geometric Symbol</option>
                                    </select>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Icon Theme</label>
                                    <select
                                      value={logoTheme}
                                      onChange={(e) => setLogoTheme(e.target.value)}
                                      className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="AI">AI</option>
                                      <option value="Logistics">Logistics</option>
                                      <option value="Fintech">Fintech</option>
                                      <option value="HealthTech">HealthTech</option>
                                      <option value="Education">Education</option>
                                      <option value="Developer Tools">Developer Tools</option>
                                      <option value="Generic Tech">Generic Tech</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">Additional Concepts (Optional)</label>
                                  <textarea
                                    value={logoEditPrompt}
                                    onChange={(e) => setLogoEditPrompt(e.target.value)}
                                    placeholder="e.g. 'Use a rocket icon'"
                                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 custom-scrollbar"
                                  />
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                  <button
                                    onClick={handleGenerateLogo}
                                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg"
                                  >
                                    Generate 3 Concepts
                                  </button>
                                  <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400">OR</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                  </div>
                                  <label className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-center cursor-pointer">
                                    Upload Your Own Logo
                                    <input
                                      type="file"
                                      accept=".png,.jpg,.jpeg,.svg"
                                      className="hidden"
                                      onChange={handleUploadLogo}
                                    />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              {startupLogo ? (
                                <img src={startupLogo} alt="Small Logo" className="w-12 h-12 rounded-lg object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                  {startupData.startup_name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold">{startupData.startup_name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Brand Mark</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 flex-1 mb-6">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Primary Color</p>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-lg shadow-inner border border-black/10 relative overflow-hidden cursor-pointer"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    <input
                                      type="color"
                                      className="absolute inset-[-10px] w-[50px] h-[50px] cursor-pointer opacity-0"
                                      value={primaryColor}
                                      onChange={(e) => setPrimaryColor(e.target.value)}
                                    />
                                  </div>
                                  <span className="text-sm font-mono font-medium">{primaryColor.toUpperCase()}</span>
                                </div>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Secondary Color</p>
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-lg shadow-inner border border-black/10 relative overflow-hidden cursor-pointer"
                                    style={{ backgroundColor: secondaryColor }}
                                  >
                                    <input
                                      type="color"
                                      className="absolute inset-[-10px] w-[50px] h-[50px] cursor-pointer opacity-0"
                                      value={secondaryColor}
                                      onChange={(e) => setSecondaryColor(e.target.value)}
                                    />
                                  </div>
                                  <span className="text-sm font-mono font-medium">{secondaryColor.toUpperCase()}</span>
                                </div>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Typography</p>
                                <p className="text-lg font-bold tracking-tight">Inter / Space Grotesk</p>
                              </div>
                            </div>

                            <div className="space-y-4 mt-auto pt-6 border-t border-slate-100">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={logoEditPrompt}
                                  onChange={(e) => setLogoEditPrompt(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleEditLogo()}
                                  placeholder="Edit logo (e.g. 'Make it blue')"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={handleEditLogo}
                                  disabled={isGeneratingLogo || !logoEditPrompt.trim()}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleGenerateLogo}
                                  disabled={isGeneratingLogo}
                                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                                >
                                  Regenerate
                                </button>
                                <div className="flex gap-2 w-full">
                                  <button
                                    onClick={() => handleDownloadLogo('png')}
                                    disabled={isGeneratingLogo || !startupLogo}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                                  >
                                    Download PNG
                                  </button>
                                  <button
                                    onClick={() => handleDownloadLogo('svg')}
                                    disabled={isGeneratingLogo || !startupLogo}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                                  >
                                    Download SVG
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Marketing Tab */}
                  {(activeTab === "Dashboard" || activeTab === "Marketing Assets") && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-bold mb-6">Marketing Video Preview</h3>
                      <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current" />
                        </div>
                        <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-bold">{startupData.startup_name}: The Vision</p>
                          <p className="text-[10px] opacity-80">{startupData.marketing_video_idea}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Investor Mode Tab */}
                  {activeTab === "UserCircle" || activeTab === "Investor Mode" && (
                    <div className="space-y-8">
                      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold mb-6">Investment Thesis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-900">The "Why Now?"</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {startupData.idea_summary}. With a market size of {startupData.market_size_estimate}, the opportunity for {startupData.startup_name} is significant given the current gaps in the market.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-900">Venture Scale Potential</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              Projected to reach {startupData.revenue_projection.year3} in revenue by Year 3. The {startupData.unique_advantage} provides a defensible moat against incumbents like {startupData.competitors.join(", ")}.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { label: "Risk Level", value: "Medium", color: "text-orange-600" },
                          { label: "Exit Potential", value: "High (M&A)", color: "text-green-600" },
                          { label: "Team Requirement", value: "Technical Heavy", color: "text-indigo-600" },
                        ].map((item, i) => (
                          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.label}</p>
                            <p className={cn("text-xl font-bold", item.color)}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === "Community" ? (
                <div key="community">
                  <Community startupData={startupData} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-8 animate-pulse">
                    <Lightbulb className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Ready to build?</h2>
                  <p className="text-slate-500 leading-relaxed">
                    Tell me your startup idea in the chat, or upload a rough business plan to get started. I'll help you with everything from market research to pitch decks.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-10 w-full">
                    <button
                      onClick={() => handleSend("I want to build a SaaS for SME logistics")}
                      className="p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left"
                    >
                      "I want to build a SaaS for..."
                    </button>
                    <button
                      onClick={() => handleSend("Validate my idea for a quick commerce logistics startup")}
                      className="p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left"
                    >
                      "Validate my idea for..."
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat Panel */}
          <div className="w-[400px] border-l border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">AI Co-Founder</h2>
              <button
                onClick={clearChat}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col gap-2",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none"
                  )}>
                    {msg.content}
                    {(msg as any).isLogoChoice && (
                      <div className="mt-4 flex flex-col gap-2">
                        <label className="w-full text-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all cursor-pointer">
                          Upload Logo
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml"
                            className="hidden"
                            onChange={handleUploadLogo}
                          />
                        </label>
                        <button
                          onClick={handleGenerateLogoChoice}
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                        >
                          Generate Logo
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {msg.role === "user" ? "You" : "Copilot"} • Just now
                  </span>
                </div>
              ))}
              {!isBackendReady && (
                <div className="flex flex-col gap-2 items-start">
                  <div className="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed bg-slate-100 text-slate-800 rounded-tl-none">
                    Connecting to AI backend...
                  </div>
                </div>
              )}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100">
              {/* Voice Mode Toggle + Status */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  {voice.status === "listening" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 animate-pulse">
                      <span className="w-2 h-2 bg-red-500 rounded-full" /> Listening...
                    </span>
                  )}
                  {voice.status === "processing" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Processing...
                    </span>
                  )}
                  {voice.status === "speaking" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" /> AI speaking...
                    </span>
                  )}
                  {voice.interimText && (
                    <span className="text-xs text-slate-500 italic truncate max-w-[200px]">
                      "{voice.interimText}"
                    </span>
                  )}
                </div>
                <button
                  onClick={voice.toggleVoiceMode}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border",
                    voice.voiceMode
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {voice.voiceMode ? <Volume2 className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  Voice Mode {voice.voiceMode ? "ON" : "OFF"}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={voice.isListening ? "Listening... speak now" : "Ask your innovation mentor anything..."}
                  disabled={!isBackendReady || isTyping || isGeneratingLogo}
                  className={cn(
                    "w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-24 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-24",
                    voice.isListening && "border-red-400 bg-red-50/30 ring-2 ring-red-200",
                    voice.isSpeaking && "border-indigo-400 bg-indigo-50/30",
                    (!isBackendReady || isTyping || isGeneratingLogo) && "opacity-50 cursor-not-allowed"
                  )}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={toggleMic}
                    disabled={!isBackendReady}
                    title={voice.isSpeaking ? "Interrupt AI & start talking" : voice.isListening ? "Stop listening" : "Start talking"}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      voice.isListening
                        ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200"
                        : voice.isSpeaking
                          ? "bg-amber-500 text-white"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    )}
                  >
                    {voice.isListening ? <Mic className="w-5 h-5" /> : voice.isSpeaking ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={!isBackendReady || isTyping || isGeneratingLogo || !inputValue.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}
