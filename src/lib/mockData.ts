export interface StartupData {
  startup_name: string;
  idea_summary: string;
  problem_statement: string;
  target_customers: string[];
  market_size_estimate: string;
  competitors: string[];
  unique_advantage: string;
  revenue_model: string[];
  revenue_projection: {
    year1: string;
    year2: string;
    year3: string;
  };
  business_model_canvas: {
    key_partners: string[];
    key_activities: string[];
    value_proposition: string[];
    customer_relationships: string[];
    customer_segments: string[];
    key_resources: string[];
    channels: string[];
    cost_structure: string[];
    revenue_streams: string[];
  };
  pitch_deck_preview: string[];
  marketing_video_idea: string;
  startup_score: string;
  chat_response: string;
  next_question_for_founder: string;
}

export const INITIAL_STARTUP_DATA: StartupData = {
  startup_name: "LogiFlow India",
  idea_summary: "SME Logistics Automation for the Next Billion",
  problem_statement: "SMEs in India struggle with fragmented logistics, high costs, and lack of real-time visibility.",
  target_customers: ["Small Manufacturers", "E-commerce Sellers", "Local Distributors"],
  market_size_estimate: "$215B",
  competitors: ["Delhivery", "Shadowfax", "Rivigo"],
  unique_advantage: "AI-driven route optimization tailored for Tier 2 and Tier 3 Indian cities.",
  revenue_model: ["SaaS Subscription", "Transaction Fees"],
  revenue_projection: {
    year1: "$1.2M",
    year2: "$4.5M",
    year3: "$12.8M"
  },
  business_model_canvas: {
    key_partners: ["Local Transporters", "Fuel Providers", "E-commerce Platforms"],
    key_activities: ["Route Optimization", "Fleet Management", "Customer Support"],
    value_proposition: ["30% Cost Reduction", "Real-time Tracking", "Automated Billing"],
    customer_relationships: ["Self-service Portal", "Account Managers"],
    customer_segments: ["SMEs", "D2C Brands"],
    key_resources: ["AI Algorithms", "Mobile App", "Logistics Network"],
    channels: ["Direct Sales", "Digital Marketing", "Partnerships"],
    cost_structure: ["Tech Development", "Marketing", "Operations"],
    revenue_streams: ["Subscription Fees", "Commission per Trip"]
  },
  pitch_deck_preview: [
    "Fragmented logistics leads to 20% waste in SME margins.",
    "Unified AI platform for automated dispatch and tracking.",
    "India's logistics market is $215B, SME segment is underserved.",
    "Mobile-first dashboard for drivers and control tower for managers.",
    "SaaS + Marketplace commission model.",
    "Direct sales in manufacturing hubs like Pune and Bangalore."
  ],
  marketing_video_idea: "A day in the life of an SME owner before and after LogiFlow.",
  startup_score: "8.5/10",
  chat_response: "That's a solid start. I've mapped out the initial logistics framework for you.",
  next_question_for_founder: "How do you plan to acquire your first 50 SME customers in Pune?"
};

export const MOCK_MESSAGES = [
  { role: "assistant", content: "Hi! I'm your AI Co-Founder. What startup idea are we building today?" },
];
