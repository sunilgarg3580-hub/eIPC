export const BRAND = {
  name: "eIPC Legal Portal",
  tagline: "AI legal workspace for clients and advocates",
  logo: "⚖️",
};

export const HEADER = {
  clientLogin: "Client Login",
  advocateLogin: "Advocate Login",
  loggedInAs: "Logged in as",
  logout: "Logout",
};

export const LOGIN = {
  clientTitle: "Client Login / Registration",
  advocateTitle: "Advocate Login / Registration",
  clientDescription:
    "Create client profile to manage legal cases, drafts, evidence and court tracking.",
  advocateDescription:
    "Create advocate profile to receive leads, reply to clients and review drafts.",
  google: "Continue with Google",
  facebook: "Continue with Facebook",
  separator: "or register as new user",
  clientButton: "Enter Client Portal",
  advocateButton: "Enter Advocate Portal",
  note:
    "Note: Google/Facebook buttons are UI only right now. We will connect real authentication using Clerk, Supabase or Auth0 in the next step.",
};

export const CLIENT_REGISTER_FIELDS = [
  "Full name",
  "Mobile number",
  "Email",
  "City / State",
  "Preferred language",
  "Case type",
];

export const ADVOCATE_REGISTER_FIELDS = [
  "Advocate name",
  "Mobile number",
  "Email",
  "Bar registration number",
  "State Bar Council",
  "Years of experience",
  "City / Court practice area",
  "Practice specialization",
];

export const REGISTER = {
  clientIssuePlaceholder: "Briefly describe your legal issue",
  advocateSummaryPlaceholder:
    "Profile summary, courts handled, languages, consultation preference",
};

export const GUEST = {
  chatBadge: "⚖️ eIPC Legal AI",
  chatTitle: "Discuss your legal issue",
  chatSubtitle: "Get preliminary guidance before creating a case file.",
  welcome:
    "🙏 Namaste! Please tell me your legal issue. I can help you understand next steps, required documents, possible drafts and whether advocate review is required.",
  inputPlaceholder:
    "Example: My tenant is not vacating my flat and rent is pending...",
  send: "Send",
  loading: "eIPC is analysing your matter...",
  fallback:
    "Please share your city, facts, documents available and what relief you want. I will guide you step by step.",
  emptyReply:
    "I can help you understand legal options, required evidence and next steps.",
  signupPrompt:
    "To save this case, upload evidence, generate final drafts or contact an advocate, please create a client account.",
  actionButtons: [
    { label: "Save Case", icon: "💾" },
    { label: "Generate Draft", icon: "📝" },
    { label: "Find Advocate", icon: "👨‍⚖️" },
  ],
  heroBadge: "🇮🇳 AI-powered legal workspace for India",
  heroTitle:
    "Manage legal matters, drafts, evidence, court tracking and advocate support in one place.",
  heroDescription:
    "eIPC helps clients understand their legal position, maintain case files, prepare replies/notices and connect with verified advocates.",
  clientAccount: "Create Client Account",
  advocateAccount: "Register as Advocate",
  advocateNote:
    "Advocate portal includes leads, client messages, draft review queue and case management.",
  features: [
    {
      icon: "⚖️",
      title: "Legal Guidance",
      description: "Understand possible remedies and next steps.",
    },
    {
      icon: "📁",
      title: "Case File",
      description: "Maintain facts, evidence and documents.",
    },
    {
      icon: "📝",
      title: "Drafts",
      description: "Prepare notices, replies and case summaries.",
    },
    {
      icon: "👨‍⚖️",
      title: "Advocate Connect",
      description: "Send matters for professional review.",
    },
  ],
};

export const CLIENT_TABS = [
  ["dashboard", "Dashboard"],
  ["chat", "AI Legal Chat"],
  ["cases", "My Case Files"],
  ["evidence", "Evidence Vault"],
  ["drafts", "Drafts & Replies"],
  ["tracker", "Court Case Tracker"],
  ["lawyers", "Find Advocate"],
];

export const ADVOCATE_TABS = [
  ["dashboard", "Dashboard"],
  ["leads", "New Leads"],
  ["messages", "Client Messages"],
  ["reviews", "Draft Review Queue"],
  ["cases", "Client Cases"],
  ["profile", "Advocate Profile"],
];

export const CLIENT_DASHBOARD = {
  stats: [
    ["Active cases", "3"],
    ["Drafts pending", "5"],
    ["Evidence files", "18"],
    ["Upcoming dates", "2"],
  ],
  recentCaseFiles: "Recent Case Files",
  cases: [
    ["Money recovery from client", "Legal notice pending"],
    ["Tenant not vacating flat", "Evidence collection"],
    ["Cheque bounce complaint", "Notice timeline review"],
  ],
};

export const CLIENT_CHAT = {
  title: "AI Legal Chat",
  welcome: "Welcome back. Ask your legal query or continue your saved case discussion.",
  placeholder: "Ask your legal query...",
  send: "Send",
  fallback: "Please provide more facts so I can guide you better.",
};

export const CLIENT_CASES = {
  title: "My Case Files",
  createButton: "+ Create New Case File",
  cases: [
    ["Money recovery from client", "Drafting legal notice"],
    ["Rent dispute", "Advocate review pending"],
  ],
};

export const CLIENT_DRAFTS = {
  title: "Drafts & Replies",
  buttons: [
    "Legal Notice",
    "Reply to Notice",
    "Written Statement",
    "Civil Suit",
    "Evidence List",
    "Lawyer Brief",
  ],
};

export const COURT_TRACKER = {
  title: "Court Case Tracker",
  fields: ["CNR Number", "Court / District", "Case Number", "Party Name / Advocate Name"],
  button: "Track / Save Case",
};

export const FIND_ADVOCATE = {
  title: "Find Advocate",
  cards: [
    ["Civil Advocate", "Verified profile and practice-area matching."],
    ["Family Advocate", "Verified profile and practice-area matching."],
    ["Criminal Advocate", "Verified profile and practice-area matching."],
  ],
  button: "Request Consultation",
};

export const ADVOCATE_DASHBOARD = {
  stats: [
    ["New leads", "3"],
    ["Client messages", "7"],
    ["Review requests", "4"],
    ["Active clients", "8"],
  ],
};

export const ADVOCATE_LEADS = {
  title: "New Leads",
  viewButton: "View Lead",
  replyButton: "Reply to Client",
  leads: [
    ["Amit Sharma", "Cheque bounce notice review", "Delhi"],
    ["Neha Gupta", "Divorce consultation", "Gurugram"],
    ["Rakesh Jain", "Money recovery suit", "Jaipur"],
  ],
};

export const ADVOCATE_MESSAGES = {
  title: "Client Messages",
  messages: [
    ["Amit Sharma", "Client asking for urgent cheque bounce reply"],
    ["Neha Gupta", "Client shared matrimonial facts for review"],
  ],
};

export const REVIEW_QUEUE = {
  title: "Draft Review Queue",
  items: [
    ["Legal notice for recovery", "AI draft ready for advocate review"],
    ["Reply to rent eviction notice", "Client requested review"],
    ["Cheque bounce complaint", "Timeline verification required"],
  ],
};

export const ADVOCATE_CASES = {
  title: "Client Cases",
  cases: [
    ["Commercial recovery case", "Notice reviewed"],
    ["Matrimonial case", "Consultation scheduled"],
  ],
};

export const ADVOCATE_PROFILE = {
  title: "Advocate Profile",
  fields: ["Advocate name", "Bar registration number", "City", "Practice area"],
  button: "Save Profile",
};
