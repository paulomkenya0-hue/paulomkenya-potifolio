import { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, Briefcase, BookOpen, Mail, Lock, Sun, Moon, Github, Linkedin,
  MessageCircle, Menu, X, Plus, Pencil, Trash2, Search,
  Calendar, User, Settings as SettingsIcon, Send,
  LogOut, Eye, EyeOff, Bold, Italic, List as ListIcon, ArrowRight, Download,
  ExternalLink, Check, AlertCircle, Wifi, Volume2, BatteryFull, ArrowLeft,
  MessageSquare, LayoutDashboard, FileText, Users, Twitter, Phone,
  ShieldCheck, Underline as UnderlineIcon
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "./supabaseClient";

/* ============================================================================
   PAULO MKENYA — SYSTEMS PORTFOLIO (Supabase-backed, deployable build)
   Same "Console" design system as the demo, but every read/write now goes to
   a real Postgres database via Supabase, and admin login uses real Supabase
   Auth instead of a hardcoded password.
============================================================================ */

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

const THEME = {
  dark: {
    bg: "#0A0E18",
    bgImage:
      "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(232,163,61,0.10), transparent), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(47,191,159,0.10), transparent), linear-gradient(180deg,#0A0E18 0%, #0D1220 50%, #0A0E18 100%)",
    panel: "rgba(19,24,38,0.72)",
    panelSolid: "#131826",
    border: "rgba(255,255,255,0.09)",
    borderStrong: "rgba(255,255,255,0.16)",
    text: "#EDEFF5",
    textMuted: "#8B93A7",
    textFaint: "#5D6478",
    accent: "#E8A33D",
    accent2: "#2FBF9F",
    danger: "#E2574C",
    dockBg: "rgba(13,17,28,0.75)",
    inputBg: "rgba(255,255,255,0.04)",
    shadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
  },
  light: {
    bg: "#F6F4EE",
    bgImage:
      "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(201,127,30,0.08), transparent), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(28,138,115,0.08), transparent), linear-gradient(180deg,#F8F6F0 0%, #F1EEE5 50%, #F6F4EE 100%)",
    panel: "rgba(255,255,255,0.75)",
    panelSolid: "#FFFFFF",
    border: "rgba(20,20,20,0.08)",
    borderStrong: "rgba(20,20,20,0.14)",
    text: "#1A1D26",
    textMuted: "#6B7280",
    textFaint: "#9CA3AF",
    accent: "#B9791A",
    accent2: "#1C8A73",
    danger: "#C8433A",
    dockBg: "rgba(255,255,255,0.75)",
    inputBg: "rgba(0,0,0,0.03)",
    shadow: "0 20px 60px -25px rgba(0,0,0,0.25)",
  },
};

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const T = {
  sw: {
    nav: { home: "Nyumbani", projects: "Miradi", blog: "Blogu", contact: "Mawasiliano", admin: "Admin" },
    hero: {
      greet: "Habari, mimi ni",
      roles: ["Full-Stack Developer", "Mtengeneza Mobile & Web", "Mtatuzi wa Matatizo", "Software Engineer"],
      blurb: "Ninajenga mifumo na programu za kigitaali zinazobadilisha mawazo kuwa suluhisho halisi kwa shule, hospitali, mashamba na biashara.",
      viewProjects: "Tazama Miradi", downloadCV: "Pakua CV", contactMe: "Wasiliana Nami",
      available: "Ninapatikana kwa miradi mipya",
    },
    status: { years: "Miaka ya Uzoefu", projects: "Miradi Imekamilika", clients: "Wateja Waliridhika", uptime: "Utayari" },
    about: {
      eyebrow: "kuhusu.txt", title: "Kunihusu",
      role: "Full-Stack Developer • Mtatuzi wa Matatizo • Mpenzi wa Teknolojia",
      p1: "Mimi ni Paulo Mkenya, Msanidi Programu wa Full-Stack niliyesoma Chuo Kikuu cha Ruaha Catholic University.",
      p2: "Kazi yangu inalenga mifumo ya usimamizi — shule, hospitali, mashamba, usafiri na biashara.",
      university: "Chuo",
    },
    skills: { eyebrow: "ujuzi.txt", title: "Ujuzi Wangu", cmd: "cat ujuzi.txt", categories: { frontend: "Frontend", backend: "Backend", mobile: "Mobile", database: "Database", tools: "Tools" } },
    journey: { eyebrow: "safari.txt", title: "Safari Yangu" },
    projectsPage: {
      eyebrow: "miradi/", title: "Miradi Yangu",
      subtitle: "Mifumo ya kweli niliyoijenga kwa taasisi na biashara mbalimbali.",
      all: "Vyote", web: "Web", mobile: "Mobile", search: "Tafuta mradi...",
      live: "Demo", code: "Chanzo", noResults: "Hakuna mradi uliopatikana.",
      soon: "Kiungo cha demo kitaongezwa hivi karibuni.",
    },
    blogPage: {
      eyebrow: "blogu/", title: "Blogu", subtitle: "Mawazo, mafunzo na masimulizi kuhusu usanidi programu.",
      search: "Tafuta makala...", allCategories: "Kategoria Zote", readMore: "Soma Zaidi",
      noPosts: "Hakuna makala kwa sasa.", back: "Rudi Blogu", minRead: "dak. kusoma",
      comments: "Maoni", addComment: "Ongeza maoni", yourName: "Jina lako", yourComment: "Andika maoni yako...",
      postComment: "Tuma Maoni", noComments: "Hakuna maoni bado. Kuwa wa kwanza!", tags: "Vitambulisho",
    },
    contactPage: {
      eyebrow: "mawasiliano/", title: "Mawasiliano", subtitle: "Una mradi akilini? Niandikie — tuzungumze.",
      formTitle: "Tuma Ujumbe", name: "Jina Lako", email: "Barua pepe", phone: "Namba ya Simu (hiari)",
      message: "Ujumbe Wako", send: "Tuma Ujumbe", sending: "Inatuma...",
      success: "Asante! Ujumbe wako umepokelewa, nitawasiliana nawe hivi karibuni.",
      infoTitle: "Njia Nyingine za Kuwasiliana", callWhats: "Piga au WhatsApp",
    },
    footer: { line1: "Imetengenezwa kwa ❤️ na Paulo Mkenya", rights: "Haki zote zimehifadhiwa." },
    admin: {
      loginEyebrow: "admin/ingia", loginTitle: "Ingia Admin", username: "Barua pepe", password: "Nenosiri",
      login: "Ingia", loginHint: "Tumia barua pepe/nenosiri uliyoyaunda kwenye Supabase > Authentication > Users.",
      invalid: "Barua pepe au nenosiri sio sahihi.",
      welcome: "Karibu", logout: "Toka",
      tabs: { analytics: "Muhtasari", projects: "Miradi", posts: "Blogu", messages: "Ujumbe", settings: "Mipangilio" },
      stats: { visitors: "Watembeleaji", projects: "Miradi", posts: "Machapisho", published: "Yaliyochapishwa", messages: "Ujumbe", unread: "Bado Kusomwa" },
      chartTitle: "Miradi kwa Kundi",
      newProject: "Ongeza Mradi", editProject: "Hariri Mradi", newPost: "Andika Makala", editPost: "Hariri Makala",
      title: "Kichwa", category: "Kundi", tech: "Teknolojia (tenganisha kwa koma)", desc: "Maelezo",
      github: "Kiungo cha GitHub", live: "Kiungo cha Demo", save: "Hifadhi", cancel: "Ghairi",
      delete: "Futa", confirmDelete: "Una uhakika unataka kufuta?", yes: "Ndiyo, Futa", no: "Hapana",
      content: "Maudhui", tags: "Vitambulisho (tenganisha kwa koma)", excerpt: "Muhtasari mfupi",
      status: "Hali", draft: "Rasimu", published: "Imechapishwa", color: "Rangi ya Kadi",
      noMessages: "Hakuna ujumbe bado.", markRead: "Weka kama Umesomwa", from: "Kutoka",
      settingsTitle: "Mipangilio ya Tovuti", heroTagline: "Maelezo mafupi ya Hero",
      aboutText1: "Kuhusu — Aya ya 1", aboutText2: "Kuhusu — Aya ya 2",
      contactInfo: "Taarifa za Mawasiliano", emailField: "Barua pepe", phoneField: "Namba ya Simu",
      whatsappField: "Namba ya WhatsApp", githubField: "Kiungo cha GitHub", linkedinField: "Kiungo cha LinkedIn",
      twitterField: "Kiungo cha X/Twitter", seoTitle: "Kichwa cha SEO", seoDesc: "Maelezo ya SEO",
      saved: "Mipangilio imehifadhiwa.", securityNote: "Admin sasa inatumia Supabase Auth halisi — tengeneza mtumiaji kwenye dashibodi ya Supabase kabla ya kuingia.",
      addNew: "Ongeza Mpya",
    },
    common: { close: "Funga", required: "Sehemu hii inahitajika.", invalidEmail: "Barua pepe si sahihi.", loading: "Inapakia..." },
  },
  en: {
    nav: { home: "Home", projects: "Projects", blog: "Blog", contact: "Contact", admin: "Admin" },
    hero: {
      greet: "Hello, I'm",
      roles: ["Full-Stack Developer", "Mobile & Web Developer", "Problem Solver", "Software Engineer"],
      blurb: "I build digital systems and software that turn ideas into real solutions for schools, hospitals, farms and businesses.",
      viewProjects: "View Projects", downloadCV: "Download CV", contactMe: "Contact Me",
      available: "Available for new projects",
    },
    status: { years: "Years Experience", projects: "Projects Completed", clients: "Happy Clients", uptime: "Availability" },
    about: {
      eyebrow: "about.txt", title: "About Me",
      role: "Full-Stack Developer • Problem Solver • Tech Enthusiast",
      p1: "I'm Paulo Mkenya, a Full-Stack Developer who studied at Ruaha Catholic University.",
      p2: "My work focuses on management systems — for schools, hospitals, farms, transport and business.",
      university: "University",
    },
    skills: { eyebrow: "skills.txt", title: "My Skills", cmd: "cat skills.txt", categories: { frontend: "Frontend", backend: "Backend", mobile: "Mobile", database: "Database", tools: "Tools" } },
    journey: { eyebrow: "journey.txt", title: "My Journey" },
    projectsPage: {
      eyebrow: "projects/", title: "My Projects",
      subtitle: "Real systems I've built for institutions and businesses.",
      all: "All", web: "Web", mobile: "Mobile", search: "Search projects...",
      live: "Live Demo", code: "Source", noResults: "No projects found.",
      soon: "Demo link coming soon.",
    },
    blogPage: {
      eyebrow: "blog/", title: "Blog", subtitle: "Thoughts, tutorials and stories about building software.",
      search: "Search articles...", allCategories: "All Categories", readMore: "Read More",
      noPosts: "No posts yet.", back: "Back to Blog", minRead: "min read",
      comments: "Comments", addComment: "Add a comment", yourName: "Your name", yourComment: "Write your comment...",
      postComment: "Post Comment", noComments: "No comments yet. Be the first!", tags: "Tags",
    },
    contactPage: {
      eyebrow: "contact/", title: "Contact", subtitle: "Have a project in mind? Reach out — let's talk.",
      formTitle: "Send a Message", name: "Your Name", email: "Email", phone: "Phone Number (optional)",
      message: "Your Message", send: "Send Message", sending: "Sending...",
      success: "Thanks! Your message has been received — I'll get back to you soon.",
      infoTitle: "Other Ways to Reach Me", callWhats: "Call or WhatsApp",
    },
    footer: { line1: "Built with ❤️ by Paulo Mkenya", rights: "All rights reserved." },
    admin: {
      loginEyebrow: "admin/login", loginTitle: "Admin Login", username: "Email", password: "Password",
      login: "Log In", loginHint: "Use the email/password you created in Supabase > Authentication > Users.",
      invalid: "Incorrect email or password.",
      welcome: "Welcome", logout: "Log Out",
      tabs: { analytics: "Overview", projects: "Projects", posts: "Blog", messages: "Messages", settings: "Settings" },
      stats: { visitors: "Visitors", projects: "Projects", posts: "Posts", published: "Published", messages: "Messages", unread: "Unread" },
      chartTitle: "Projects by Category",
      newProject: "Add Project", editProject: "Edit Project", newPost: "New Post", editPost: "Edit Post",
      title: "Title", category: "Category", tech: "Tech Stack (comma separated)", desc: "Description",
      github: "GitHub Link", live: "Live Demo Link", save: "Save", cancel: "Cancel",
      delete: "Delete", confirmDelete: "Are you sure you want to delete this?", yes: "Yes, Delete", no: "No",
      content: "Content", tags: "Tags (comma separated)", excerpt: "Short excerpt",
      status: "Status", draft: "Draft", published: "Published", color: "Card Color",
      noMessages: "No messages yet.", markRead: "Mark as Read", from: "From",
      settingsTitle: "Site Settings", heroTagline: "Hero Tagline",
      aboutText1: "About — Paragraph 1", aboutText2: "About — Paragraph 2",
      contactInfo: "Contact Information", emailField: "Email", phoneField: "Phone Number",
      whatsappField: "WhatsApp Number", githubField: "GitHub URL", linkedinField: "LinkedIn URL",
      twitterField: "X/Twitter URL", seoTitle: "SEO Title", seoDesc: "SEO Description",
      saved: "Settings saved.", securityNote: "Admin now uses real Supabase Auth — create a user in the Supabase dashboard before logging in.",
      addNew: "Add New",
    },
    common: { close: "Close", required: "This field is required.", invalidEmail: "Invalid email address.", loading: "Loading..." },
  },
};

const SKILLS = {
  frontend: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind CSS"],
  backend: ["Node.js", "Express.js", "PHP", "Laravel"],
  mobile: ["Flutter", "Dart", "Android (Kotlin)"],
  database: ["MySQL", "PostgreSQL", "Firebase", "MongoDB"],
  tools: ["Git", "GitHub", "VS Code", "Figma", "Docker"],
};

const JOURNEY = [
  { year: "2021", sw: "Nilianza safari yangu ya programu na kujifunza misingi ya web development.", en: "Started my programming journey learning the fundamentals of web development." },
  { year: "2022", sw: "Niliingia katika mobile development na kutengeneza app yangu ya kwanza ya Flutter.", en: "Moved into mobile development and built my first Flutter app." },
  { year: "2023", sw: "Nilihitimu Ruaha Catholic University na kuanza kufanya kazi za kujitegemea kwa wateja.", en: "Graduated from Ruaha Catholic University and started freelancing for clients." },
  { year: "2024", sw: "Niliongeza mifumo mikubwa ya usimamizi — shule, hospitali na biashara.", en: "Delivered larger management systems — for schools, hospitals and businesses." },
  { year: "2026", sw: "Ninaendelea kujenga bidhaa za kidijitali zenye matokeo halisi kwa jamii.", en: "Continuing to build digital products with real impact for the community." },
];

const CATS = ["Web", "Mobile"];

function cx(...a) { return a.filter(Boolean).join(" "); }

function sanitizeHTML(html) {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ on\w+="[^"]*"/gi, "")
    .replace(/ on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

/* Map DB settings row (flat, snake_case) <-> UI settings object (nested {sw,en}) */
function rowToSettings(row) {
  if (!row) return null;
  return {
    visitors: row.visitors || 0,
    email: row.email || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    github: row.github || "",
    linkedin: row.linkedin || "",
    twitter: row.twitter || "",
    heroTagline: { sw: row.hero_tagline_sw || "", en: row.hero_tagline_en || "" },
    about1: { sw: row.about1_sw || "", en: row.about1_en || "" },
    about2: { sw: row.about2_sw || "", en: row.about2_en || "" },
    seoTitle: row.seo_title || "",
    seoDesc: row.seo_desc || "",
  };
}
function settingsToRow(s) {
  return {
    email: s.email, phone: s.phone, whatsapp: s.whatsapp, github: s.github, linkedin: s.linkedin, twitter: s.twitter,
    hero_tagline_sw: s.heroTagline?.sw, hero_tagline_en: s.heroTagline?.en,
    about1_sw: s.about1?.sw, about1_en: s.about1?.en,
    about2_sw: s.about2?.sw, about2_en: s.about2?.en,
    seo_title: s.seoTitle, seo_desc: s.seoDesc,
  };
}

/* ------------------------------ SMALL UI ATOMS ------------------------------ */
function WindowChrome({ theme, title, icon, children, style, bodyStyle, dots = true }) {
  return (
    <div style={{
      background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 16,
      backdropFilter: "blur(16px)", boxShadow: theme.shadow, overflow: "hidden", ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
        borderBottom: `1px solid ${theme.border}`, background: "rgba(0,0,0,0.08)",
      }}>
        {dots && (
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 99, background: "#EF5D57" }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: "#F6BE4F" }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: "#61C454" }} />
          </div>
        )}
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.textMuted, marginLeft: dots ? 4 : 0 }}>
          {icon} {title}
        </span>
      </div>
      <div style={{ padding: 20, ...bodyStyle }}>{children}</div>
    </div>
  );
}

function Chip({ theme, children, tone = "default", active, onClick, small }) {
  const toneColor = tone === "accent" ? theme.accent : tone === "accent2" ? theme.accent2 : theme.textMuted;
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT_MONO, fontSize: small ? 11 : 12, padding: small ? "4px 10px" : "6px 14px",
        borderRadius: 99, border: `1px solid ${active ? toneColor : theme.border}`,
        background: active ? `${toneColor}22` : "transparent", color: active ? toneColor : theme.textMuted,
        cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap", transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ theme, children, onClick, icon: Icon, type = "button", full, style, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 22px", borderRadius: 12, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14.5, color: "#0A0E18",
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
        width: full ? "100%" : "auto", boxShadow: `0 8px 24px -8px ${theme.accent}66`,
        opacity: disabled ? 0.6 : 1, transition: "transform .15s", ...style,
      }}
    >
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}

function GhostButton({ theme, children, onClick, icon: Icon, type = "button", full, danger }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 22px", borderRadius: 12, cursor: "pointer",
        fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14.5,
        color: danger ? theme.danger : theme.text,
        background: "transparent", border: `1.5px solid ${danger ? theme.danger : theme.borderStrong}`,
        width: full ? "100%" : "auto",
      }}
    >
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}

function Field({ theme, label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: theme.textMuted, marginBottom: 6, fontFamily: FONT_MONO }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(theme) {
  return {
    width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`,
    background: theme.inputBg, color: theme.text, fontFamily: FONT_BODY, fontSize: 14.5,
    outline: "none", boxSizing: "border-box",
  };
}

function Toast({ toast, theme }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 200,
      display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 12,
      background: theme.panelSolid, border: `1px solid ${isErr ? theme.danger : theme.accent2}`,
      color: theme.text, fontFamily: FONT_BODY, fontSize: 14, boxShadow: theme.shadow, maxWidth: "90vw",
    }}>
      {isErr ? <AlertCircle size={16} color={theme.danger} /> : <Check size={16} color={theme.accent2} />}
      {toast.message}
    </div>
  );
}

function Modal({ theme, title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflowY: "auto",
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.panelSolid, border: `1px solid ${theme.border}`, borderRadius: 16,
          width: "100%", maxWidth: wide ? 720 : 480, boxShadow: theme.shadow, marginTop: "2vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: theme.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function RichTextEditor({ theme, value, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
    // eslint-disable-next-line
  }, []);
  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
    if (ref.current) onChange(ref.current.innerHTML);
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[
          { icon: Bold, cmd: "bold" }, { icon: Italic, cmd: "italic" },
          { icon: UnderlineIcon, cmd: "underline" }, { icon: ListIcon, cmd: "insertUnorderedList" },
        ].map(({ icon: Icon, cmd }) => (
          <button key={cmd} type="button" onClick={() => exec(cmd)}
            style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.inputBg, cursor: "pointer", color: theme.text }}>
            <Icon size={14} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        style={{
          minHeight: 160, padding: 14, borderRadius: 10, border: `1px solid ${theme.border}`,
          background: theme.inputBg, color: theme.text, fontFamily: FONT_BODY, fontSize: 14.5, lineHeight: 1.7,
        }}
      />
    </div>
  );
}

function ProjectGlyph({ icon, color }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
      background: `${color}22`, border: `1px solid ${color}55`, fontFamily: FONT_MONO, fontWeight: 700,
      color, fontSize: 14, flexShrink: 0,
    }}>
      {icon.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ================================ MAIN APP ================================ */
export default function App() {
  const [lang, setLang] = useState("sw");
  const [mode, setMode] = useState("dark");
  const [page, setPage] = useState("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [toast, setToast] = useState(null);

  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [activePostId, setActivePostId] = useState(null);

  const [session, setSession] = useState(null);
  const isAdmin = !!session;
  const [adminTab, setAdminTab] = useState("analytics");

  const theme = THEME[mode];
  const t = T[lang];

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* Auth session */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  /* Initial public data load + visitor counter */
  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: po }, { data: s }] = await Promise.all([
        supabase.from("projects").select("*").order("id"),
        supabase.from("posts").select("*, comments(*)").order("id"),
        supabase.from("settings").select("*").eq("id", 1).single(),
      ]);
      setProjects(p || []);
      setPosts((po || []).map((p) => ({ ...p, comments: p.comments || [] })));
      setSettings(rowToSettings(s) || rowToSettings({}));
      setLoaded(true);
      supabase.rpc("increment_visitors").then(() => {
        supabase.from("settings").select("visitors").eq("id", 1).single().then(({ data }) => {
          if (data) setSettings((cur) => cur ? { ...cur, visitors: data.visitors } : cur);
        });
      });
    })();
  }, []);

  /* Fetch messages once admin logs in (RLS only allows authenticated reads) */
  useEffect(() => {
    if (!isAdmin) { setMessages([]); return; }
    supabase.from("messages").select("*").order("created_at", { ascending: false }).then(({ data }) => setMessages(data || []));
  }, [isAdmin]);

  useEffect(() => {
    const iv = setInterval(() => setClock(new Date()), 1000 * 30);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (settings?.seoTitle) document.title = settings.seoTitle;
  }, [settings?.seoTitle]);

  /* ---------- CRUD helpers (each talks to Supabase, then patches local state) ---------- */
  const addProject = async (data) => {
    const { tech, id, ...rest } = data;
    const { data: row, error } = await supabase.from("projects").insert({ ...rest, tech }).select().single();
    if (error) return showToast(error.message, "error");
    setProjects((cur) => [...cur, row]);
  };
  const updateProject = async (data) => {
    const { id, ...rest } = data;
    const { data: row, error } = await supabase.from("projects").update(rest).eq("id", id).select().single();
    if (error) return showToast(error.message, "error");
    setProjects((cur) => cur.map((p) => (p.id === id ? row : p)));
  };
  const deleteProject = async (id) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return showToast(error.message, "error");
    setProjects((cur) => cur.filter((p) => p.id !== id));
  };

  const addPost = async (data) => {
    const { tags, id, ...rest } = data;
    const { data: row, error } = await supabase.from("posts").insert({ ...rest, tags }).select().single();
    if (error) return showToast(error.message, "error");
    setPosts((cur) => [...cur, { ...row, comments: [] }]);
  };
  const updatePost = async (data) => {
    const { id, comments, ...rest } = data;
    const { data: row, error } = await supabase.from("posts").update(rest).eq("id", id).select().single();
    if (error) return showToast(error.message, "error");
    setPosts((cur) => cur.map((p) => (p.id === id ? { ...row, comments: p.comments } : p)));
  };
  const deletePost = async (id) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return showToast(error.message, "error");
    setPosts((cur) => cur.filter((p) => p.id !== id));
  };
  const addComment = async (postId, name, comment) => {
    const { data: row, error } = await supabase.from("comments").insert({ post_id: postId, name, comment }).select().single();
    if (error) return showToast(error.message, "error");
    setPosts((cur) => cur.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), row] } : p)));
  };

  const addMessage = async (data) => {
    const { error } = await supabase.from("messages").insert(data);
    if (error) return showToast(error.message, "error");
  };
  const markMessageRead = async (id) => {
    const { error } = await supabase.from("messages").update({ read: true }).eq("id", id);
    if (error) return showToast(error.message, "error");
    setMessages((cur) => cur.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };
  const deleteMessage = async (id) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) return showToast(error.message, "error");
    setMessages((cur) => cur.filter((m) => m.id !== id));
  };

  const saveSettings = async (next) => {
    const { error } = await supabase.from("settings").update(settingsToRow(next)).eq("id", 1);
    if (error) return showToast(error.message, "error");
    setSettings(next);
  };

  const goto = (p) => { setPage(p); setMobileNav(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const navItems = [
    { key: "home", label: t.nav.home, icon: Home },
    { key: "projects", label: t.nav.projects, icon: Briefcase },
    { key: "blog", label: t.nav.blog, icon: BookOpen },
    { key: "contact", label: t.nav.contact, icon: Mail },
    { key: "admin", label: t.nav.admin, icon: SettingsIcon },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, backgroundImage: theme.bgImage,
      fontFamily: FONT_BODY, color: theme.text, transition: "background .3s",
    }}>
      <style>{`
        @import url('${FONT_IMPORT_URL}');
        * { box-sizing: border-box; }
        ::selection { background: ${theme.accent}55; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 8px; }
        [contenteditable]:focus { outline: none; box-shadow: 0 0 0 2px ${theme.accent}55; border-radius: 10px; }
        a { color: inherit; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fadeSlide { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
        .fade-in { animation: fadeSlide .5s ease both; }
      `}</style>

      <TopBar theme={theme} mode={mode} setMode={setMode} lang={lang} setLang={setLang}
        clock={clock} mobileNav={mobileNav} setMobileNav={setMobileNav} />

      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto" }}>
        <SideDock theme={theme} navItems={navItems} page={page} goto={goto} />

        {mobileNav && (
          <div style={{ position: "fixed", inset: 0, top: 56, background: theme.dockBg, backdropFilter: "blur(20px)", zIndex: 90, padding: 20 }}>
            {navItems.map((it) => (
              <button key={it.key} onClick={() => goto(it.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "16px 14px",
                  background: page === it.key ? `${theme.accent}18` : "transparent", border: "none",
                  borderRadius: 12, marginBottom: 6, cursor: "pointer", color: page === it.key ? theme.accent : theme.text,
                  fontFamily: FONT_BODY, fontWeight: 600, fontSize: 16,
                }}>
                <it.icon size={20} /> {it.label}
              </button>
            ))}
          </div>
        )}

        <main style={{ flex: 1, minWidth: 0, padding: "28px 20px 60px" }}>
          {!loaded ? (
            <LoadingState theme={theme} t={t} />
          ) : page === "home" ? (
            <HomeView theme={theme} t={t} lang={lang} settings={settings} goto={goto} showToast={showToast} />
          ) : page === "projects" ? (
            <ProjectsView theme={theme} t={t} lang={lang} projects={projects} showToast={showToast} />
          ) : page === "blog" ? (
            activePostId ? (
              <BlogPostView theme={theme} t={t} lang={lang} posts={posts} addComment={addComment}
                postId={activePostId} onBack={() => setActivePostId(null)} />
            ) : (
              <BlogListView theme={theme} t={t} lang={lang} posts={posts} onOpen={(id) => setActivePostId(id)} />
            )
          ) : page === "contact" ? (
            <ContactView theme={theme} t={t} lang={lang} settings={settings} addMessage={addMessage} showToast={showToast} />
          ) : page === "admin" ? (
            <AdminView theme={theme} t={t} lang={lang} isAdmin={isAdmin}
              adminTab={adminTab} setAdminTab={setAdminTab}
              projects={projects} addProject={addProject} updateProject={updateProject} deleteProject={deleteProject}
              posts={posts} addPost={addPost} updatePost={updatePost} deletePost={deletePost}
              messages={messages} markMessageRead={markMessageRead} deleteMessage={deleteMessage}
              settings={settings} saveSettings={saveSettings}
              showToast={showToast} />
          ) : null}

          <Footer theme={theme} t={t} />
        </main>
      </div>

      <Toast toast={toast} theme={theme} />
    </div>
  );
}

function LoadingState({ theme, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${theme.border}`, borderTopColor: theme.accent, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: theme.textMuted }}>{t.common.loading}</span>
    </div>
  );
}

/* ---------------------------------- TOP BAR --------------------------------- */
function TopBar({ theme, mode, setMode, lang, setLang, clock, mobileNav, setMobileNav }) {
  const hh = clock.getHours().toString().padStart(2, "0");
  const mm = clock.getMinutes().toString().padStart(2, "0");
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100, background: theme.dockBg, backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${theme.border}`, padding: "10px 20px",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, fontFamily: FONT_MONO, fontWeight: 700, color: "#0A0E18", fontSize: 13,
          }}>PM</div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>Mkenya<span style={{ color: theme.accent }}>.</span></span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", border: `1px solid ${theme.border}`, borderRadius: 99, padding: 3, gap: 2 }}>
            <button onClick={() => setLang("sw")} style={{
              padding: "5px 10px", borderRadius: 99, border: "none", cursor: "pointer",
              background: lang === "sw" ? theme.accent : "transparent", color: lang === "sw" ? "#0A0E18" : theme.textMuted,
              fontFamily: FONT_MONO, fontSize: 11.5, fontWeight: 700,
            }}>SW</button>
            <button onClick={() => setLang("en")} style={{
              padding: "5px 10px", borderRadius: 99, border: "none", cursor: "pointer",
              background: lang === "en" ? theme.accent : "transparent", color: lang === "en" ? "#0A0E18" : theme.textMuted,
              fontFamily: FONT_MONO, fontSize: 11.5, fontWeight: 700,
            }}>EN</button>
          </div>

          <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{
            display: "flex", alignItems: "center", gap: 6, background: theme.inputBg, border: `1px solid ${theme.border}`,
            borderRadius: 99, padding: "5px 10px", cursor: "pointer", color: theme.text,
          }}>
            {mode === "dark" ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 10, color: theme.textFaint }}>
            <Wifi size={15} /> <Volume2 size={15} /> <BatteryFull size={15} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: theme.textMuted, minWidth: 40 }}>{hh}:{mm}</span>
          </div>

          <button onClick={() => setMobileNav((v) => !v)} className="mobile-menu-btn" style={{
            background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, padding: 6, cursor: "pointer", color: theme.text,
          }}>
            {mobileNav ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <style>{`
        .desktop-only { display: flex; }
        @media (max-width: 860px) { .desktop-only { display: none !important; } }
      `}</style>
    </div>
  );
}

/* --------------------------------- SIDE DOCK --------------------------------- */
function SideDock({ theme, navItems, page, goto }) {
  return (
    <>
      <aside className="side-dock" style={{
        width: 84, flexShrink: 0, position: "sticky", top: 57, height: "calc(100vh - 57px)",
        borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column",
        alignItems: "center", paddingTop: 24, gap: 6, background: "rgba(0,0,0,0.03)",
      }}>
        {navItems.map((it) => {
          const active = page === it.key;
          return (
            <button key={it.key} onClick={() => goto(it.key)} title={it.label} style={{
              width: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "10px 4px", borderRadius: 12, border: "none", cursor: "pointer",
              background: active ? `${theme.accent}1A` : "transparent",
              color: active ? theme.accent : theme.textMuted, position: "relative",
            }}>
              {active && <span style={{ position: "absolute", left: -12, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, borderRadius: 3, background: theme.accent }} />}
              <it.icon size={19} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 9.5 }}>{it.label}</span>
            </button>
          );
        })}
      </aside>
      <style>{`
        @media (max-width: 860px) { .side-dock { display: none; } }
        @media (min-width: 861px) { .mobile-menu-btn { display: none !important; } }
      `}</style>
    </>
  );
}

/* ==================================== HOME =================================== */
function HomeView({ theme, t, lang, settings, goto, showToast }) {
  const [roleIdx, setRoleIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setRoleIdx((i) => (i + 1) % t.hero.roles.length), 2400);
    return () => clearInterval(iv);
  }, [t]);

  const downloadCV = () => {
    const cvText = `PAULO MKENYA\nFull-Stack Developer\n\nChuo: Ruaha Catholic University\nEmail: ${settings.email}\nSimu: ${settings.phone}\n\nUJUZI\nFrontend: ${SKILLS.frontend.join(", ")}\nBackend: ${SKILLS.backend.join(", ")}\nMobile: ${SKILLS.mobile.join(", ")}\nDatabase: ${SKILLS.database.join(", ")}\nTools: ${SKILLS.tools.join(", ")}\n`;
    const blob = new Blob([cvText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Paulo_Mkenya_CV.txt"; a.click();
    URL.revokeObjectURL(url);
    showToast(lang === "sw" ? "CV imepakuliwa." : "CV downloaded.");
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <WindowChrome theme={theme} icon="~/" title="hero.sh" style={{ padding: 0 }}>
        <div style={{ padding: "44px 32px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32, alignItems: "center" }} className="hero-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 99, border: `1px solid ${theme.accent2}55`, background: `${theme.accent2}14`, marginBottom: 18 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: theme.accent2, animation: "pulseDot 1.6s infinite" }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.accent2 }}>{t.hero.available}</span>
            </div>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: theme.textMuted, margin: 0 }}>{t.hero.greet}</p>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(38px, 6vw, 62px)", fontWeight: 700, margin: "4px 0 10px", lineHeight: 1.02, letterSpacing: -1 }}>
              Paulo Mkenya<span style={{ color: theme.accent }}>.</span>
            </h1>
            <div style={{ height: 30, overflow: "hidden", marginBottom: 14 }}>
              <p key={roleIdx} className="fade-in" style={{
                fontFamily: FONT_MONO, fontSize: 18, fontWeight: 600, margin: 0,
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {"> "}{t.hero.roles[roleIdx]}
              </p>
            </div>
            <p style={{ color: theme.textMuted, fontSize: 15.5, lineHeight: 1.7, maxWidth: 520, marginBottom: 26 }}>
              {settings.heroTagline?.[lang] || t.hero.blurb}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
              <PrimaryButton theme={theme} icon={ArrowRight} onClick={() => goto("projects")}>{t.hero.viewProjects}</PrimaryButton>
              <GhostButton theme={theme} icon={Download} onClick={downloadCV}>{t.hero.downloadCV}</GhostButton>
              <GhostButton theme={theme} icon={Mail} onClick={() => goto("contact")}>{t.hero.contactMe}</GhostButton>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { Icon: Github, href: settings.github },
                { Icon: Linkedin, href: settings.linkedin },
                { Icon: Twitter, href: settings.twitter },
                { Icon: MessageCircle, href: `https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}` },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer" style={{
                  width: 38, height: 38, borderRadius: 10, border: `1px solid ${theme.border}`, display: "flex",
                  alignItems: "center", justifyContent: "center", color: theme.text, background: theme.inputBg,
                }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 220, height: 220 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: `conic-gradient(${theme.accent}, ${theme.accent2}, ${theme.accent})`, padding: 4,
              }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: theme.panelSolid, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: theme.text }}>PM</span>
                </div>
              </div>
              <div style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: theme.accent2, border: `3px solid ${theme.panelSolid}` }} />
            </div>
          </div>
        </div>
      </WindowChrome>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="status-grid">
        {[
          { label: t.status.years, value: "3+" },
          { label: t.status.projects, value: "14+" },
          { label: t.status.clients, value: "15+" },
          { label: t.status.uptime, value: "99%" },
        ].map((s, i) => (
          <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "18px 16px", backdropFilter: "blur(16px)" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: theme.accent }}>{s.value}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: theme.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="two-col">
        <WindowChrome theme={theme} icon="◆" title={t.about.eyebrow}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>{t.about.title}</h2>
          <p style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: theme.accent2, margin: "0 0 14px" }}>{t.about.role}</p>
          <p style={{ color: theme.textMuted, lineHeight: 1.7, fontSize: 14.5, marginBottom: 12 }}>{settings.about1?.[lang] || t.about.p1}</p>
          <p style={{ color: theme.textMuted, lineHeight: 1.7, fontSize: 14.5, marginBottom: 16 }}>{settings.about2?.[lang] || t.about.p2}</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 10, background: theme.inputBg, border: `1px solid ${theme.border}` }}>
            <User size={15} color={theme.accent} />
            <span style={{ fontSize: 13.5 }}><strong>{t.about.university}:</strong> Ruaha Catholic University</span>
          </div>
        </WindowChrome>

        <WindowChrome theme={theme} icon=">_" title={t.skills.eyebrow}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: "0 0 14px" }}>{t.skills.title}</h2>
          <div style={{ background: "#05070C", borderRadius: 10, padding: 16, fontFamily: FONT_MONO, fontSize: 13, border: `1px solid ${theme.border}` }}>
            <div style={{ color: theme.accent2, marginBottom: 10 }}>paulo@mkenya:~$ {t.skills.cmd}</div>
            {Object.entries(SKILLS).map(([key, list]) => (
              <div key={key} style={{ marginBottom: 6, color: "#C9D1E0" }}>
                <span style={{ color: theme.accent }}>&gt; {t.skills.categories[key]}:</span> {list.join(", ")}
              </div>
            ))}
            <div style={{ color: theme.textFaint, marginTop: 8 }}>paulo@mkenya:~$ <span style={{ opacity: 0.6 }}>▌</span></div>
          </div>
        </WindowChrome>
      </div>

      <WindowChrome theme={theme} icon="⏱" title={t.journey.eyebrow}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: "0 0 18px" }}>{t.journey.title}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {JOURNEY.map((j, i) => (
            <div key={i} style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === JOURNEY.length - 1 ? theme.accent : theme.textFaint, flexShrink: 0, marginTop: 4 }} />
                {i < JOURNEY.length - 1 && <div style={{ width: 2, flex: 1, background: theme.border, marginTop: 2 }} />}
              </div>
              <div style={{ paddingBottom: 22 }}>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 700, color: theme.accent, fontSize: 13.5 }}>{j.year}</div>
                <div style={{ color: theme.textMuted, fontSize: 14.5, lineHeight: 1.6, marginTop: 2 }}>{j[lang]}</div>
              </div>
            </div>
          ))}
        </div>
      </WindowChrome>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .status-grid { grid-template-columns: repeat(2,1fr) !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ================================== PROJECTS ================================= */
function ProjectsView({ theme, t, lang, projects, showToast }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = projects.filter((p) => {
    const title = lang === "sw" ? p.title_sw : p.title_en;
    const matchesFilter = filter === "All" || p.category === filter;
    const matchesQuery = title.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const noLink = (e) => { e.preventDefault(); showToast(t.projectsPage.soon, "error"); };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <WindowChrome theme={theme} icon="/" title={t.projectsPage.eyebrow}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, margin: "0 0 6px" }}>{t.projectsPage.title}</h1>
        <p style={{ color: theme.textMuted, marginBottom: 20 }}>{t.projectsPage.subtitle}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[t.projectsPage.all, t.projectsPage.web, t.projectsPage.mobile].map((label, i) => {
              const val = ["All", "Web", "Mobile"][i];
              return <Chip key={val} theme={theme} tone="accent" active={filter === val} onClick={() => setFilter(val)}>{label}</Chip>;
            })}
          </div>
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: 12, color: theme.textFaint }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.projectsPage.search}
              style={{ ...inputStyle(theme), paddingLeft: 36 }} />
          </div>
        </div>
      </WindowChrome>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="proj-grid">
        {filtered.map((p) => {
          const title = lang === "sw" ? p.title_sw : p.title_en;
          const desc = lang === "sw" ? p.desc_sw : p.desc_en;
          const color = p.category === "Web" ? theme.accent : theme.accent2;
          return (
            <div key={p.id} style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", backdropFilter: "blur(16px)" }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "#EF5D57" }} />
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "#F6BE4F" }} />
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "#61C454" }} />
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: theme.textFaint, marginLeft: 2 }}>{p.icon}.sys</span>
              </div>
              <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <ProjectGlyph icon={p.icon} color={color} />
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15.5, lineHeight: 1.2 }}>{title}</div>
                    <Chip theme={theme} small tone={p.category === "Web" ? "accent" : "accent2"} active>{p.category}</Chip>
                  </div>
                </div>
                <p style={{ color: theme.textMuted, fontSize: 13.5, lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {(p.tech || []).map((tc) => (
                    <span key={tc} style={{ fontFamily: FONT_MONO, fontSize: 10.5, padding: "3px 8px", borderRadius: 6, background: theme.inputBg, color: theme.textMuted, border: `1px solid ${theme.border}` }}>{tc}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={p.github || "#"} onClick={!p.github ? noLink : undefined} target={p.github ? "_blank" : undefined} rel="noreferrer" style={{ flex: 1 }}>
                    <GhostButton theme={theme} icon={Github} full>{t.projectsPage.code}</GhostButton>
                  </a>
                  <a href={p.live || "#"} onClick={!p.live ? noLink : undefined} target={p.live ? "_blank" : undefined} rel="noreferrer" style={{ flex: 1 }}>
                    <PrimaryButton theme={theme} icon={ExternalLink} full>{t.projectsPage.live}</PrimaryButton>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: theme.textMuted }}>{t.projectsPage.noResults}</div>
        )}
      </div>
      <style>{`
        @media (max-width: 1100px) { .proj-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 700px) { .proj-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* =================================== BLOG =================================== */
function BlogListView({ theme, t, lang, posts, onOpen }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const published = posts.filter((p) => p.status === "published");
  const categories = ["all", ...new Set(published.map((p) => p.category))];
  const filtered = published.filter((p) => {
    const matchQ = p.title.toLowerCase().includes(query.toLowerCase());
    const matchC = cat === "all" || p.category === cat;
    return matchQ && matchC;
  });

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <WindowChrome theme={theme} icon="/" title={t.blogPage.eyebrow}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, margin: "0 0 6px" }}>{t.blogPage.title}</h1>
        <p style={{ color: theme.textMuted, marginBottom: 18 }}>{t.blogPage.subtitle}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <Chip key={c} theme={theme} tone="accent2" active={cat === c} onClick={() => setCat(c)}>
                {c === "all" ? t.blogPage.allCategories : c}
              </Chip>
            ))}
          </div>
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: 12, color: theme.textFaint }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.blogPage.search} style={{ ...inputStyle(theme), paddingLeft: 36 }} />
          </div>
        </div>
      </WindowChrome>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="proj-grid">
        {filtered.map((p) => (
          <button key={p.id} onClick={() => onOpen(p.id)} style={{
            textAlign: "left", background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 16,
            overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", backdropFilter: "blur(16px)",
          }}>
            <div style={{ height: 90, background: `linear-gradient(135deg, ${p.color}, ${theme.bg})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText color="#fff" size={28} opacity={0.85} />
            </div>
            <div style={{ padding: 16 }}>
              <Chip theme={theme} small tone="accent2" active>{p.category}</Chip>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 16.5, fontWeight: 700, margin: "10px 0 6px" }}>{p.title}</h3>
              <p style={{ color: theme.textMuted, fontSize: 13.5, lineHeight: 1.6, marginBottom: 10 }}>{p.excerpt}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT_MONO, fontSize: 11, color: theme.textFaint }}>
                <Calendar size={12} /> {p.date} <span>•</span> {Math.max(1, Math.round((p.content || "").length / 800))} {t.blogPage.minRead}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: theme.textMuted }}>{t.blogPage.noPosts}</div>}
      </div>
    </div>
  );
}

function BlogPostView({ theme, t, lang, posts, addComment, postId, onBack }) {
  const post = posts.find((p) => p.id === postId);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  if (!post) return null;

  const submitComment = () => {
    if (!name.trim() || !comment.trim()) return;
    addComment(postId, name.trim(), comment.trim());
    setName(""); setComment("");
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: theme.accent, fontFamily: FONT_MONO, fontSize: 13, width: "fit-content" }}>
        <ArrowLeft size={15} /> {t.blogPage.back}
      </button>
      <WindowChrome theme={theme} icon="#" title={post.category}>
        <div style={{ height: 140, margin: "-20px -20px 20px", background: `linear-gradient(135deg, ${post.color}, ${theme.bg})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText color="#fff" size={44} opacity={0.85} />
        </div>
        <Chip theme={theme} small tone="accent2" active>{post.category}</Chip>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, margin: "14px 0 8px" }}>{post.title}</h1>
        <div style={{ display: "flex", gap: 12, fontFamily: FONT_MONO, fontSize: 12, color: theme.textFaint, marginBottom: 20 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={12} /> Paulo Mkenya</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {post.date}</span>
        </div>
        <div style={{ lineHeight: 1.85, fontSize: 15.5, color: theme.text }} dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
          {(post.tags || []).map((tg) => (
            <span key={tg} style={{ fontFamily: FONT_MONO, fontSize: 11.5, padding: "4px 10px", borderRadius: 99, background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.textMuted }}>#{tg}</span>
          ))}
        </div>
      </WindowChrome>

      <WindowChrome theme={theme} icon="💬" title={`${t.blogPage.comments} (${(post.comments || []).length})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {(post.comments || []).length === 0 && <p style={{ color: theme.textMuted, fontSize: 14 }}>{t.blogPage.noComments}</p>}
          {(post.comments || []).map((c) => (
            <div key={c.id} style={{ padding: 14, borderRadius: 10, background: theme.inputBg, border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 13.5 }}>{c.name}</strong>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: theme.textFaint }}>{(c.created_at || "").slice(0, 10)}</span>
              </div>
              <p style={{ fontSize: 13.5, color: theme.textMuted, margin: 0 }}>{c.comment}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.blogPage.yourName} style={inputStyle(theme)} />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t.blogPage.yourComment} rows={3} style={{ ...inputStyle(theme), resize: "vertical" }} />
          <PrimaryButton theme={theme} icon={Send} onClick={submitComment} style={{ alignSelf: "flex-start" }}>{t.blogPage.postComment}</PrimaryButton>
        </div>
      </WindowChrome>
    </div>
  );
}

/* ================================== CONTACT ================================== */
function ContactView({ theme, t, lang, settings, addMessage, showToast }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = t.common.required;
    if (!form.email.trim()) errs.email = t.common.required;
    else if (!isValidEmail(form.email)) errs.email = t.common.invalidEmail;
    if (!form.message.trim()) errs.message = t.common.required;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    await addMessage(form);
    setForm({ name: "", email: "", phone: "", message: "" });
    setSending(false);
    showToast(t.contactPage.success);
  };

  const infoItems = [
    { Icon: Mail, label: settings.email, href: `mailto:${settings.email}` },
    { Icon: Phone, label: settings.phone, href: `tel:${(settings.phone || "").replace(/\s/g, "")}` },
    { Icon: MessageCircle, label: t.contactPage.callWhats, href: `https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}` },
    { Icon: Github, label: "GitHub", href: settings.github },
    { Icon: Linkedin, label: "LinkedIn", href: settings.linkedin },
  ];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <WindowChrome theme={theme} icon="/" title={t.contactPage.eyebrow}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, margin: "0 0 6px" }}>{t.contactPage.title}</h1>
        <p style={{ color: theme.textMuted }}>{t.contactPage.subtitle}</p>
      </WindowChrome>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }} className="two-col">
        <WindowChrome theme={theme} icon="✉" title={t.contactPage.formTitle}>
          <form onSubmit={submit}>
            <Field theme={theme} label={t.contactPage.name}>
              <input style={inputStyle(theme)} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <ErrorText theme={theme} text={errors.name} />}
            </Field>
            <Field theme={theme} label={t.contactPage.email}>
              <input style={inputStyle(theme)} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <ErrorText theme={theme} text={errors.email} />}
            </Field>
            <Field theme={theme} label={t.contactPage.phone}>
              <input style={inputStyle(theme)} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field theme={theme} label={t.contactPage.message}>
              <textarea rows={5} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {errors.message && <ErrorText theme={theme} text={errors.message} />}
            </Field>
            <PrimaryButton theme={theme} type="submit" icon={Send} full disabled={sending}>{sending ? t.contactPage.sending : t.contactPage.send}</PrimaryButton>
          </form>
        </WindowChrome>

        <WindowChrome theme={theme} icon="☎" title={t.contactPage.infoTitle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {infoItems.map(({ Icon, label, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10,
                background: theme.inputBg, border: `1px solid ${theme.border}`,
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${theme.accent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={theme.accent} />
                </div>
                <span style={{ fontSize: 14 }}>{label}</span>
              </a>
            ))}
          </div>
        </WindowChrome>
      </div>
    </div>
  );
}

function ErrorText({ theme, text }) {
  return <span style={{ display: "block", color: theme.danger, fontSize: 12, marginTop: 5 }}>{text}</span>;
}

/* =================================== ADMIN =================================== */
function AdminView(props) {
  const { theme, t, isAdmin } = props;
  if (!isAdmin) return <AdminLogin theme={theme} t={t} />;
  return <AdminDashboard {...props} />;
}

function AdminLogin({ theme, t }) {
  const [email, setEmail] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: p });
    setBusy(false);
    if (error) setErr(t.admin.invalid);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 420, margin: "40px auto" }}>
      <WindowChrome theme={theme} icon="🔒" title={t.admin.loginEyebrow}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${theme.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Lock size={22} color={theme.accent} />
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, margin: 0 }}>{t.admin.loginTitle}</h1>
        </div>
        <form onSubmit={submit}>
          <Field theme={theme} label={t.admin.username}>
            <input type="email" style={inputStyle(theme)} value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="none" />
          </Field>
          <Field theme={theme} label={t.admin.password}>
            <div style={{ position: "relative" }}>
              <input type={show ? "text" : "password"} style={{ ...inputStyle(theme), paddingRight: 40 }} value={p} onChange={(e) => setP(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer", color: theme.textMuted }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          {err && <ErrorText theme={theme} text={err} />}
          <div style={{ marginTop: 16 }}>
            <PrimaryButton theme={theme} type="submit" icon={Lock} full disabled={busy}>{t.admin.login}</PrimaryButton>
          </div>
        </form>
        <p style={{ textAlign: "center", fontFamily: FONT_MONO, fontSize: 11.5, color: theme.textFaint, marginTop: 16 }}>{t.admin.loginHint}</p>
      </WindowChrome>
    </div>
  );
}

function AdminDashboard({ theme, t, lang, adminTab, setAdminTab, projects, addProject, updateProject, deleteProject, posts, addPost, updatePost, deletePost, messages, markMessageRead, deleteMessage, settings, saveSettings, showToast }) {
  const tabs = [
    { key: "analytics", label: t.admin.tabs.analytics, icon: LayoutDashboard },
    { key: "projects", label: t.admin.tabs.projects, icon: Briefcase },
    { key: "posts", label: t.admin.tabs.posts, icon: BookOpen },
    { key: "messages", label: t.admin.tabs.messages, icon: MessageSquare },
    { key: "settings", label: t.admin.tabs.settings, icon: SettingsIcon },
  ];
  const unread = messages.filter((m) => !m.read).length;
  const logout = () => supabase.auth.signOut();

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.textMuted, margin: 0 }}>{t.admin.welcome},</p>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, margin: 0 }}>Paulo Mkenya</h1>
        </div>
        <GhostButton theme={theme} icon={LogOut} onClick={logout}>{t.admin.logout}</GhostButton>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${theme.border}`, paddingBottom: 12 }}>
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setAdminTab(tb.key)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer",
            background: adminTab === tb.key ? theme.accent : theme.inputBg, color: adminTab === tb.key ? "#0A0E18" : theme.text,
            fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13.5, position: "relative",
          }}>
            <tb.icon size={15} /> {tb.label}
            {tb.key === "messages" && unread > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, background: theme.danger, color: "#fff", fontSize: 10, borderRadius: 99, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>
            )}
          </button>
        ))}
      </div>

      {adminTab === "analytics" && <AdminAnalytics theme={theme} t={t} projects={projects} posts={posts} messages={messages} settings={settings} />}
      {adminTab === "projects" && <AdminProjects theme={theme} t={t} lang={lang} projects={projects} addProject={addProject} updateProject={updateProject} deleteProject={deleteProject} showToast={showToast} />}
      {adminTab === "posts" && <AdminPosts theme={theme} t={t} posts={posts} addPost={addPost} updatePost={updatePost} deletePost={deletePost} showToast={showToast} />}
      {adminTab === "messages" && <AdminMessages theme={theme} t={t} messages={messages} markMessageRead={markMessageRead} deleteMessage={deleteMessage} />}
      {adminTab === "settings" && <AdminSettings theme={theme} t={t} settings={settings} saveSettings={saveSettings} showToast={showToast} />}
    </div>
  );
}

function StatCard({ theme, label, value, Icon }) {
  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18, display: "flex", alignItems: "center", gap: 14, backdropFilter: "blur(16px)" }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: `${theme.accent}1E`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={19} color={theme.accent} />
      </div>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700 }}>{value}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: theme.textMuted }}>{label}</div>
      </div>
    </div>
  );
}

function AdminAnalytics({ theme, t, projects, posts, messages, settings }) {
  const chartData = CATS.map((c) => ({ name: c, count: projects.filter((p) => p.category === c).length }));
  const published = posts.filter((p) => p.status === "published").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="status-grid">
        <StatCard theme={theme} label={t.admin.stats.visitors} value={settings.visitors || 0} Icon={Users} />
        <StatCard theme={theme} label={t.admin.stats.projects} value={projects.length} Icon={Briefcase} />
        <StatCard theme={theme} label={`${t.admin.stats.posts} (${t.admin.stats.published})`} value={`${posts.length} (${published})`} Icon={BookOpen} />
        <StatCard theme={theme} label={`${t.admin.stats.messages} (${t.admin.stats.unread})`} value={`${messages.length} (${messages.filter((m) => !m.read).length})`} Icon={MessageSquare} />
      </div>
      <WindowChrome theme={theme} icon="📊" title={t.admin.chartTitle}>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="name" stroke={theme.textMuted} fontSize={12} />
              <YAxis stroke={theme.textMuted} fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: theme.panelSolid, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text }} />
              <Bar dataKey="count" fill={theme.accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </WindowChrome>
    </div>
  );
}

function AdminProjects({ theme, t, lang, projects, addProject, updateProject, deleteProject, showToast }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = { title_sw: "", title_en: "", category: "Web", tech: "", desc_sw: "", desc_en: "", github: "", live: "", icon: "app" };

  const save = async (data) => {
    const techArr = typeof data.tech === "string" ? data.tech.split(",").map((s) => s.trim()).filter(Boolean) : data.tech;
    if (data.id) await updateProject({ ...data, tech: techArr });
    else await addProject({ ...data, tech: techArr });
    showToast(t.admin.saved || "Saved");
    setEditing(null);
  };
  const remove = async (id) => { await deleteProject(id); setConfirmId(null); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <PrimaryButton theme={theme} icon={Plus} onClick={() => setEditing({ ...blank })}>{t.admin.newProject}</PrimaryButton>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 12, background: theme.panel, border: `1px solid ${theme.border}` }}>
            <ProjectGlyph icon={p.icon} color={p.category === "Web" ? theme.accent : theme.accent2} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{lang === "sw" ? p.title_sw : p.title_en}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: theme.textMuted }}>{p.category} • {(p.tech || []).join(", ")}</div>
            </div>
            <button onClick={() => setEditing({ ...p, tech: (p.tech || []).join(", ") })} style={iconBtnStyle(theme)}><Pencil size={15} /></button>
            <button onClick={() => setConfirmId(p.id)} style={iconBtnStyle(theme, true)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      {editing && (
        <Modal theme={theme} title={editing.id ? t.admin.editProject : t.admin.newProject} onClose={() => setEditing(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="two-col">
            <Field theme={theme} label={`${t.admin.title} (SW)`}><input style={inputStyle(theme)} value={editing.title_sw} onChange={(e) => setEditing({ ...editing, title_sw: e.target.value })} /></Field>
            <Field theme={theme} label={`${t.admin.title} (EN)`}><input style={inputStyle(theme)} value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></Field>
          </div>
          <Field theme={theme} label={t.admin.category}>
            <select style={inputStyle(theme)} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field theme={theme} label={t.admin.tech}><input style={inputStyle(theme)} value={editing.tech} onChange={(e) => setEditing({ ...editing, tech: e.target.value })} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="two-col">
            <Field theme={theme} label={`${t.admin.desc} (SW)`}><textarea rows={3} style={{ ...inputStyle(theme), resize: "vertical" }} value={editing.desc_sw} onChange={(e) => setEditing({ ...editing, desc_sw: e.target.value })} /></Field>
            <Field theme={theme} label={`${t.admin.desc} (EN)`}><textarea rows={3} style={{ ...inputStyle(theme), resize: "vertical" }} value={editing.desc_en} onChange={(e) => setEditing({ ...editing, desc_en: e.target.value })} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="two-col">
            <Field theme={theme} label={t.admin.github}><input style={inputStyle(theme)} value={editing.github} onChange={(e) => setEditing({ ...editing, github: e.target.value })} placeholder="https://github.com/..." /></Field>
            <Field theme={theme} label={t.admin.live}><input style={inputStyle(theme)} value={editing.live} onChange={(e) => setEditing({ ...editing, live: e.target.value })} placeholder="https://..." /></Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <PrimaryButton theme={theme} onClick={() => save(editing)}>{t.admin.save}</PrimaryButton>
            <GhostButton theme={theme} onClick={() => setEditing(null)}>{t.admin.cancel}</GhostButton>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Modal theme={theme} title={t.admin.delete} onClose={() => setConfirmId(null)}>
          <p style={{ color: theme.textMuted, marginBottom: 18 }}>{t.admin.confirmDelete}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <GhostButton theme={theme} danger onClick={() => remove(confirmId)}>{t.admin.yes}</GhostButton>
            <GhostButton theme={theme} onClick={() => setConfirmId(null)}>{t.admin.no}</GhostButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminPosts({ theme, t, posts, addPost, updatePost, deletePost, showToast }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = { title: "", category: "", tags: "", excerpt: "", content: "", color: "#E8A33D", status: "draft" };

  const save = async (data) => {
    const tagsArr = typeof data.tags === "string" ? data.tags.split(",").map((s) => s.trim()).filter(Boolean) : data.tags;
    if (data.id) await updatePost({ ...data, tags: tagsArr });
    else await addPost({ ...data, tags: tagsArr });
    showToast(t.admin.saved || "Saved");
    setEditing(null);
  };
  const remove = async (id) => { await deletePost(id); setConfirmId(null); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <PrimaryButton theme={theme} icon={Plus} onClick={() => setEditing({ ...blank, tags: "" })}>{t.admin.newPost}</PrimaryButton>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {posts.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 12, background: theme.panel, border: `1px solid ${theme.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.title}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: theme.textMuted }}>{p.category} • {p.date}</div>
            </div>
            <Chip theme={theme} small tone={p.status === "published" ? "accent2" : "default"} active>{p.status === "published" ? t.admin.published : t.admin.draft}</Chip>
            <button onClick={() => setEditing({ ...p, tags: (p.tags || []).join(", ") })} style={iconBtnStyle(theme)}><Pencil size={15} /></button>
            <button onClick={() => setConfirmId(p.id)} style={iconBtnStyle(theme, true)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      {editing && (
        <Modal theme={theme} title={editing.id ? t.admin.editPost : t.admin.newPost} onClose={() => setEditing(null)} wide>
          <Field theme={theme} label={t.admin.title}><input style={inputStyle(theme)} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="two-col">
            <Field theme={theme} label={t.admin.category}><input style={inputStyle(theme)} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
            <Field theme={theme} label={t.admin.tags}><input style={inputStyle(theme)} value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} /></Field>
          </div>
          <Field theme={theme} label={t.admin.excerpt}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field>
          <Field theme={theme} label={t.admin.content}>
            <RichTextEditor theme={theme} value={editing.content} onChange={(html) => setEditing({ ...editing, content: html })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="two-col">
            <Field theme={theme} label={t.admin.color}><input type="color" style={{ ...inputStyle(theme), padding: 4, height: 42 }} value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} /></Field>
            <Field theme={theme} label={t.admin.status}>
              <select style={inputStyle(theme)} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="draft">{t.admin.draft}</option>
                <option value="published">{t.admin.published}</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <PrimaryButton theme={theme} onClick={() => save(editing)}>{t.admin.save}</PrimaryButton>
            <GhostButton theme={theme} onClick={() => setEditing(null)}>{t.admin.cancel}</GhostButton>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Modal theme={theme} title={t.admin.delete} onClose={() => setConfirmId(null)}>
          <p style={{ color: theme.textMuted, marginBottom: 18 }}>{t.admin.confirmDelete}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <GhostButton theme={theme} danger onClick={() => remove(confirmId)}>{t.admin.yes}</GhostButton>
            <GhostButton theme={theme} onClick={() => setConfirmId(null)}>{t.admin.no}</GhostButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminMessages({ theme, t, messages, markMessageRead, deleteMessage }) {
  const [confirmId, setConfirmId] = useState(null);
  const remove = async (id) => { await deleteMessage(id); setConfirmId(null); };

  if (messages.length === 0) return <p style={{ color: theme.textMuted, textAlign: "center", padding: 40 }}>{t.admin.noMessages}</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {messages.map((m) => (
        <div key={m.id} style={{ padding: 16, borderRadius: 12, background: theme.panel, border: `1px solid ${m.read ? theme.border : theme.accent}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div>
              <strong style={{ fontSize: 14.5 }}>{m.name}</strong>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: theme.textMuted }}>{m.email} {m.phone && `• ${m.phone}`}</div>
            </div>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: theme.textFaint }}>{new Date(m.created_at).toLocaleString()}</span>
          </div>
          <p style={{ fontSize: 14, color: theme.text, marginBottom: 10 }}>{m.message}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {!m.read && <GhostButton theme={theme} icon={Check} onClick={() => markMessageRead(m.id)}>{t.admin.markRead}</GhostButton>}
            <GhostButton theme={theme} danger icon={Trash2} onClick={() => setConfirmId(m.id)}>{t.admin.delete}</GhostButton>
          </div>
        </div>
      ))}
      {confirmId && (
        <Modal theme={theme} title={t.admin.delete} onClose={() => setConfirmId(null)}>
          <p style={{ color: theme.textMuted, marginBottom: 18 }}>{t.admin.confirmDelete}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <GhostButton theme={theme} danger onClick={() => remove(confirmId)}>{t.admin.yes}</GhostButton>
            <GhostButton theme={theme} onClick={() => setConfirmId(null)}>{t.admin.no}</GhostButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminSettings({ theme, t, settings, saveSettings, showToast }) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);

  const save = () => { saveSettings(form); showToast(t.admin.saved); };
  const setLangField = (field, lang, val) => setForm({ ...form, [field]: { ...form[field], [lang]: val } });

  if (!form) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ padding: 14, borderRadius: 10, background: `${theme.accent}14`, border: `1px solid ${theme.accent}44`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <ShieldCheck size={17} color={theme.accent} style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 13, color: theme.textMuted }}>{t.admin.securityNote}</span>
      </div>

      <WindowChrome theme={theme} icon="⚙" title={t.admin.settingsTitle}>
        <Field theme={theme} label={`${t.admin.heroTagline} (SW)`}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.heroTagline?.sw || ""} onChange={(e) => setLangField("heroTagline", "sw", e.target.value)} /></Field>
        <Field theme={theme} label={`${t.admin.heroTagline} (EN)`}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.heroTagline?.en || ""} onChange={(e) => setLangField("heroTagline", "en", e.target.value)} /></Field>
        <Field theme={theme} label={`${t.admin.aboutText1} (SW)`}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.about1?.sw || ""} onChange={(e) => setLangField("about1", "sw", e.target.value)} /></Field>
        <Field theme={theme} label={`${t.admin.aboutText1} (EN)`}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.about1?.en || ""} onChange={(e) => setLangField("about1", "en", e.target.value)} /></Field>
        <Field theme={theme} label={`${t.admin.aboutText2} (SW)`}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.about2?.sw || ""} onChange={(e) => setLangField("about2", "sw", e.target.value)} /></Field>
        <Field theme={theme} label={`${t.admin.aboutText2} (EN)`}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.about2?.en || ""} onChange={(e) => setLangField("about2", "en", e.target.value)} /></Field>
      </WindowChrome>

      <WindowChrome theme={theme} icon="☎" title={t.admin.contactInfo}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="two-col">
          <Field theme={theme} label={t.admin.emailField}><input style={inputStyle(theme)} value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field theme={theme} label={t.admin.phoneField}><input style={inputStyle(theme)} value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field theme={theme} label={t.admin.whatsappField}><input style={inputStyle(theme)} value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></Field>
          <Field theme={theme} label={t.admin.githubField}><input style={inputStyle(theme)} value={form.github || ""} onChange={(e) => setForm({ ...form, github: e.target.value })} /></Field>
          <Field theme={theme} label={t.admin.linkedinField}><input style={inputStyle(theme)} value={form.linkedin || ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></Field>
          <Field theme={theme} label={t.admin.twitterField}><input style={inputStyle(theme)} value={form.twitter || ""} onChange={(e) => setForm({ ...form, twitter: e.target.value })} /></Field>
        </div>
      </WindowChrome>

      <WindowChrome theme={theme} icon="🔎" title="SEO">
        <Field theme={theme} label={t.admin.seoTitle}><input style={inputStyle(theme)} value={form.seoTitle || ""} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} /></Field>
        <Field theme={theme} label={t.admin.seoDesc}><textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical" }} value={form.seoDesc || ""} onChange={(e) => setForm({ ...form, seoDesc: e.target.value })} /></Field>
      </WindowChrome>

      <PrimaryButton theme={theme} icon={Check} onClick={save} style={{ alignSelf: "flex-start" }}>{t.admin.save}</PrimaryButton>
    </div>
  );
}

function iconBtnStyle(theme, danger) {
  return {
    width: 34, height: 34, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.inputBg,
    color: danger ? theme.danger : theme.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
}

/* --------------------------------- FOOTER --------------------------------- */
function Footer({ theme, t }) {
  return (
    <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${theme.border}`, textAlign: "center" }}>
      <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>{t.footer.line1}</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.textMuted, margin: "0 0 4px" }}>Ruaha Catholic University</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: theme.textFaint, margin: 0 }}>© {new Date().getFullYear()} Paulo Mkenya. {t.footer.rights}</p>
    </footer>
  );
}
