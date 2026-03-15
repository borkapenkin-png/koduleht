import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SEOHead, COMPANY } from "./seo/SEOHead";
import { serviceSlugMap } from "./seo/serviceContent";
import DynamicServicePage from "./pages/DynamicServicePage";
import ReferencesPage from "./pages/ReferencesPage";
import FaqHubPage from "./pages/FaqHubPage";
import ServicePagesAdmin from "./components/admin/ServicePagesAdmin";
import GlobalSettingsAdmin from "./components/admin/GlobalSettingsAdmin";
import StructuredData from "./components/StructuredData";
import FAQSection from "./components/FAQSection";
import QuoteRequestForm from "./components/QuoteRequestForm";
import { 
  Phone, Mail, MapPin, Menu, X, ChevronDown, Paintbrush, Building2, Layers,
  CheckCircle, ArrowRight, Send, Settings, LogOut, Plus, Trash2, Edit2, Save, Download,
  MessageSquare, Briefcase, Upload, Award, Image as ImageIcon, Home, FileText, Users, Lock, Shield, Palette, Globe, Calendar, HelpCircle, RefreshCw,
  // Additional service icons
  Hammer, Wrench, PaintBucket, Brush, Ruler, HardHat, Construction, Warehouse,
  DoorOpen, DoorClosed, Sofa, Lamp, Frame, Square, CircleDot, Sparkles,
  Sun, Droplets, Wind, TreeDeciduous, Fence, Scaling, LayoutGrid, PanelTop,
  Wallpaper, LampCeiling, Armchair
} from "lucide-react";
import axios from "axios";

// GA4 Route Change Tracking Hook
const useGA4PageTracking = () => {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-ZP42XN14NG', {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location]);
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/g1de58um_jb2-logo.png";

// Helper function to get full image URL from relative or absolute path
// Use this everywhere images are displayed
const getImageUrl = (url) => {
  if (!url) return null;
  // If already absolute URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // If relative URL (starts with /), prepend backend URL
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  // Otherwise return as-is
  return url;
};

// Extended icon map with more service icons
const iconMap = { 
  // Original icons
  Building2, Layers, Paintbrush,
  // Construction & Tools
  Hammer, Wrench, PaintBucket, Brush, Ruler, HardHat, Construction, Warehouse,
  // Interior icons
  DoorOpen, DoorClosed, Sofa, Lamp, Frame, Square, Sparkles, Wallpaper, LampCeiling, Armchair,
  // Exterior/Roof icons
  Sun, Droplets, Wind, TreeDeciduous, Fence, Scaling, LayoutGrid, PanelTop, CircleDot
};

// Default settings
const defaultSettings = {
  hero_slogan: "LAATUJOHTAJAT",
  hero_title_1: "Ammattitaitoista",
  hero_title_2: "maalausta",
  hero_title_3: "ja tasoitusta",
  hero_description: "Uudellamaalla toimiva luotettava ammattilainen vuodesta 2018. Sisä- ja ulkomaalaukset, julkisivurappaukset sekä tapetoinnit avaimet käteen -periaatteella.",
  hero_image_url: "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  hero_badge_1: "Kotitalousvähennys",
  hero_badge_2: "Tyytyväisyystakuu",
  about_subtitle: "TIETOA MEISTÄ",
  about_title: "Luotettava kumppani pintaremontteihin",
  about_text_1: "J&B Tasoitus Ja Maalaus Oy on Uudellamaalla toimiva luotettava maalaustöiden ammattilainen. Olemme tehneet sisä- ja ulkomaalauksia vuodesta 2018.",
  about_text_2: "Meiltä sujuu myös katto- ja julkisivumaalaukset, julkisivurappaukset sekä sisäpintojen tapetoinnit. Toiminnassa panostamme asiakaslähtöisyyteen, joustavuuteen ja ensiluokkaiseen työnlaatuun.",
  about_text_3: "Teemme työt avaimet käteen -periaatteella ja tarjoamme asiakkaillemme tyytyväisyystakuun.",
  about_image_url: "https://images.pexels.com/photos/7941435/pexels-photo-7941435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  about_year: "2018",
  about_info_title: "Muista kotitalousvähennys!",
  about_info_text: "Maalaus luokitellaan kunnossapitotyöhön, joka oikeuttaa kotitalousvähennykseen.",
  contact_subtitle: "OTA YHTEYTTÄ",
  contact_title: "Yhteystiedot",
  contact_description: "Lähetä tarjouspyyntö tai pyydä meidät ilmaiselle arviokäynnille.",
  contact_address: "Sienitie 52, 00760 Helsinki",
  contact_email: "info@jbtasoitusmaalaus.fi",
  contact_phone_1_name: "Boris Penkin",
  contact_phone_1: "+358 40 054 7270",
  contact_phone_2_name: "Joosep Rohusaar",
  contact_phone_2: "+358 40 029 8247",
  contact_jobs_title: "Työpaikkahaku",
  contact_jobs_text: "Haluatko töihin? Lähetä CV ja saatekirje: info@jbtasoitusmaalaus.fi",
  // Theme defaults
  theme_font: "Inter",
  theme_color: "#0056D2",
  theme_size: "medium",
  // Subtitle/slogan settings
  subtitle_font: "Inter",
  subtitle_size: "normal",
  subtitle_weight: "normal",
  subtitle_spacing: "normal",
  logo_url: null,
  favicon_url: null
};

// Available fonts
const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Moderni)" },
  { value: "Poppins", label: "Poppins (Pyöreä)" },
  { value: "Roboto", label: "Roboto (Selkeä)" },
  { value: "Open Sans", label: "Open Sans (Luettava)" },
  { value: "Montserrat", label: "Montserrat (Tyylikäs)" },
  { value: "Lato", label: "Lato (Ystävällinen)" },
  { value: "Playfair Display", label: "Playfair (Klassinen)" },
  { value: "Raleway", label: "Raleway (Elegantti)" }
];

// Subtitle/Slogan options
const SUBTITLE_SIZE_OPTIONS = [
  { value: "small", label: "Pieni", class: "text-xs" },
  { value: "normal", label: "Normaali", class: "text-sm" },
  { value: "large", label: "Suuri", class: "text-base" }
];

const SUBTITLE_WEIGHT_OPTIONS = [
  { value: "normal", label: "Normaali", class: "font-normal" },
  { value: "medium", label: "Keskipaksu", class: "font-medium" },
  { value: "bold", label: "Lihavoitu", class: "font-bold" }
];

const SUBTITLE_SPACING_OPTIONS = [
  { value: "normal", label: "Normaali", class: "tracking-normal" },
  { value: "wide", label: "Leveä", class: "tracking-wide" },
  { value: "wider", label: "Leveämpi", class: "tracking-wider" },
  { value: "widest", label: "Levein", class: "tracking-widest" }
];

// Color presets
const COLOR_OPTIONS = [
  { value: "#0056D2", label: "Sininen", bg: "#0056D2" },
  { value: "#059669", label: "Vihreä", bg: "#059669" },
  { value: "#DC2626", label: "Punainen", bg: "#DC2626" },
  { value: "#7C3AED", label: "Violetti", bg: "#7C3AED" },
  { value: "#EA580C", label: "Oranssi", bg: "#EA580C" },
  { value: "#0891B2", label: "Turkoosi", bg: "#0891B2" },
  { value: "#4F46E5", label: "Indigo", bg: "#4F46E5" },
  { value: "#BE185D", label: "Pinkki", bg: "#BE185D" }
];

// Size presets
const SIZE_OPTIONS = [
  { value: "small", label: "Pieni" },
  { value: "medium", label: "Keskikokoinen" },
  { value: "large", label: "Suuri" }
];

// Helper to generate lighter shade
const lightenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

// Helper to get subtitle classes from settings
const getSubtitleClasses = (settings) => {
  const sizeClass = {
    'small': 'text-xs',
    'normal': 'text-sm',
    'large': 'text-base'
  }[settings?.subtitle_size || 'normal'] || 'text-sm';
  
  const weightClass = {
    'normal': 'font-normal',
    'medium': 'font-medium',
    'bold': 'font-bold'
  }[settings?.subtitle_weight || 'normal'] || 'font-normal';
  
  const spacingClass = {
    'normal': 'tracking-normal',
    'wide': 'tracking-wide',
    'wider': 'tracking-wider',
    'widest': 'tracking-widest'
  }[settings?.subtitle_spacing || 'normal'] || 'tracking-normal';
  
  return `${sizeClass} ${weightClass} ${spacingClass}`;
};

// Subtitle component with custom styling
const Subtitle = ({ children, settings, className = "", white = false }) => {
  const subtitleClasses = getSubtitleClasses(settings);
  const fontFamily = settings?.subtitle_font || 'Inter';
  
  return (
    <p 
      className={`uppercase ${subtitleClasses} ${white ? 'text-white/60' : 'text-primary'} ${className}`}
      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
    >
      {children}
    </p>
  );
};

// Apply theme to document
const applyTheme = (settings) => {
  const root = document.documentElement;
  const color = settings.theme_color || defaultSettings.theme_color;
  const font = settings.theme_font || defaultSettings.theme_font;
  const size = settings.theme_size || defaultSettings.theme_size;
  
  // Apply colors
  root.style.setProperty('--color-primary', color);
  root.style.setProperty('--color-primary-light', lightenColor(color, 90));
  root.style.setProperty('--color-primary-hover', lightenColor(color, -10));
  
  // Apply font
  root.style.setProperty('--font-main', `"${font}", sans-serif`);
  
  // Apply size multiplier
  const sizeMultiplier = size === 'small' ? 0.9 : size === 'large' ? 1.1 : 1;
  root.style.setProperty('--size-multiplier', sizeMultiplier);
  
  // Update favicon if set
  if (settings.favicon_url) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.favicon_url;
  }
};

// ========== IMAGE UPLOAD ==========
const ImageUpload = ({ currentImage, onImageChange, token }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || "");

  useEffect(() => { setPreview(currentImage || ""); }, [currentImage]);

  // Helper to get display URL (adds BACKEND_URL if relative path)
  const getDisplayUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url}`;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      alert("Sallitut: JPEG, PNG, GIF, WEBP"); return;
    }
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API}/admin/upload`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      // Store only relative URL (e.g., /api/images/123)
      const relativeUrl = response.data.url;
      setPreview(relativeUrl);
      onImageChange(relativeUrl);
    } catch (error) { alert("Lataus epäonnistui"); }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {preview ? (
          <img src={getDisplayUrl(preview)} alt="Preview" className="w-16 h-12 object-cover border border-[#E2E8F0]" />
        ) : (
          <div className="w-16 h-12 bg-[#FAFAFA] border border-[#E2E8F0] flex items-center justify-center">
            <ImageIcon size={16} className="text-[#94A3B8]" />
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1">
          <Upload size={14} />{uploading ? "..." : "Lataa"}
        </button>
      </div>
      <input type="url" value={preview} onChange={(e) => { setPreview(e.target.value); onImageChange(e.target.value); }} placeholder="Tai URL" className="form-input text-sm" />
    </div>
  );
};

// Image Upload with ALT text support
const ImageUploadWithAlt = ({ currentImage, currentAlt, onImageChange, onAltChange, token, altPlaceholder }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || "");

  useEffect(() => { setPreview(currentImage || ""); }, [currentImage]);

  const getDisplayUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url}`;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      alert("Sallitut: JPEG, PNG, GIF, WEBP"); return;
    }
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API}/admin/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
      });
      const relativeUrl = response.data.url;
      setPreview(relativeUrl);
      onImageChange(relativeUrl);
    } catch (error) { alert("Lataus epäonnistui"); }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {preview ? (
          <img src={getDisplayUrl(preview)} alt={currentAlt || "Preview"} className="w-16 h-12 object-cover border border-[#E2E8F0]" />
        ) : (
          <div className="w-16 h-12 bg-[#FAFAFA] border border-[#E2E8F0] flex items-center justify-center">
            <ImageIcon size={16} className="text-[#94A3B8]" />
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1">
          <Upload size={14} />{uploading ? "..." : "Lataa"}
        </button>
      </div>
      <input type="url" value={preview} onChange={(e) => { setPreview(e.target.value); onImageChange(e.target.value); }} placeholder="Tai URL" className="form-input text-sm" />
      <input type="text" value={currentAlt || ''} onChange={(e) => onAltChange(e.target.value)} placeholder={altPlaceholder || "ALT-teksti (SEO)"} className="form-input text-sm" />
    </div>
  );
};

// ========== NAVBAR ==========
const Navbar = ({ isScrolled, activeSection, logoUrl }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = window.location.pathname;
  const isHomePage = location === '/' || location === '';
  
  const navLinks = [
    { href: "#palvelut", label: "Palvelut" },
    { href: "#meista", label: "Meistä" },
    { href: "#referenssit", label: "Referenssit" },
    { href: "/ukk", label: "UKK", isPage: true },
    { href: "#yhteystiedot", label: "Yhteystiedot" },
  ];
  const logo = logoUrl || LOGO_URL;

  // Get the correct href - use full path if not on homepage
  const getHref = (href) => {
    if (href.startsWith('#')) {
      return isHomePage ? href : `/${href}`;
    }
    return href;
  };

  return (
    <nav data-testid="navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "navbar-glass shadow-sm" : "bg-transparent"}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" data-testid="logo-link"><img src={logo} alt="J&B" className="h-10 md:h-12 w-auto max-w-[180px] object-contain" /></a>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              link.isPage ? (
                <Link key={link.href} to={link.href} className="nav-link text-sm font-medium transition-colors">{link.label}</Link>
              ) : (
                <a key={link.href} href={getHref(link.href)} className={`nav-link text-sm font-medium transition-colors ${activeSection === link.href.substring(1) ? "nav-link-active" : ""}`}>{link.label}</a>
              )
            ))}
            <a href={getHref("#yhteystiedot")} className="btn-primary text-sm py-2 px-4">Pyydä tarjous</a>
          </div>
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t">
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  link.isPage ? (
                    <Link key={link.href} to={link.href} className="block px-4 py-3 nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
                  ) : (
                    <a key={link.href} href={getHref(link.href)} className="block px-4 py-3 nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>{link.label}</a>
                  )
                ))}
                <div className="px-4 pt-2"><a href={getHref("#yhteystiedot")} className="btn-primary block text-center text-sm" onClick={() => setIsMobileMenuOpen(false)}>Pyydä tarjous</a></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// ========== HERO ==========
const HeroSection = ({ settings }) => {
  const s = { ...defaultSettings, ...settings };
  // Use default image if hero_image_url is empty
  const heroImage = s.hero_image_url || defaultSettings.hero_image_url;
  const subtitleClasses = getSubtitleClasses(s);
  const subtitleFont = s.subtitle_font || 'Inter';
  return (
    <section data-testid="hero-section" className="relative min-h-[90vh] md:min-h-screen flex items-center pt-16">
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Maalaustyöt ja tasoitustyöt Helsinki - J&B Tasoitus ja Maalaus Oy" 
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
        />
        <div className="hero-overlay absolute inset-0"></div>
      </div>
      <div className="container-custom relative z-10 py-12 md:py-20">
        <div className="max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`uppercase text-primary mb-3 md:mb-4 ${subtitleClasses}`} style={{ fontFamily: `"${subtitleFont}", sans-serif` }}>{s.hero_slogan}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-[#0F172A] mb-4 md:mb-6 leading-tight">
            {s.hero_title_1}<br /><span className="text-primary">{s.hero_title_2}</span> {s.hero_title_3}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base md:text-lg text-[#64748B] mb-6 md:mb-8 max-w-xl leading-relaxed">{s.hero_description}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <a href="#yhteystiedot" className="btn-primary inline-flex items-center justify-center gap-2 text-sm md:text-base">Pyydä ilmainen arvio<ArrowRight size={18} /></a>
            <a href="#palvelut" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm md:text-base">Tutustu palveluihin<ChevronDown size={18} /></a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 md:mt-12 flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]"><CheckCircle size={16} className="text-primary" /><span>{s.hero_badge_1}</span></div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]"><CheckCircle size={16} className="text-primary" /><span>{s.hero_badge_2}</span></div>
          </motion.div>
        </div>
      </div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block">
        <ChevronDown size={32} className="text-primary opacity-60" />
      </motion.div>
    </section>
  );
};

// ========== SERVICES ==========
// SEO-friendly alt text generator
const getServiceAltText = (title) => {
  const altMap = {
    'Tasoitustyöt': 'Tasoitustyöt Helsinki - ammattitaitoinen seinien tasoitus',
    'Maalaustyöt': 'Maalaustyöt Helsinki - sisä- ja ulkomaalaukset',
    'Mikrosementti': 'Mikrosementti pinnoitus Helsinki - moderni sisustus',
    'Julkisivurappaus': 'Julkisivurappaus Helsinki - julkisivujen kunnostus',
    'Julkisivujen maalaukset': 'Julkisivujen maalaukset Helsinki - ulkomaalaustyöt',
    'Kattojen maalaukset': 'Kattojen maalaukset Helsinki - kattomaalaus'
  };
  return altMap[title] || `${title} Helsinki - J&B Tasoitus ja Maalaus`;
};

const ServicesSection = ({ services_data, settings }) => (
  <section id="palvelut" data-testid="services-section" className="section-padding section-bg-alt" aria-labelledby="services-heading">
    <div className="container-custom">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
        <Subtitle settings={settings} className="mb-2 md:mb-3">MITÄ TEEMME</Subtitle>
        <h2 id="services-heading" className="section-title">Palvelumme</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {services_data.map((service, index) => {
          const Icon = iconMap[service.icon] || Building2;
          // Use link_url from service if available, otherwise fall back to static map
          const serviceSlug = service.link_url || serviceSlugMap[service.title];
          
          const CardContent = (
            <article className="service-card group overflow-hidden h-full flex flex-col">
              {service.image_url && (
                <div className="aspect-[16/10] overflow-hidden -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-4 md:mb-6">
                  <img 
                    src={getImageUrl(service.image_url)} 
                    alt={service.image_alt || getServiceAltText(service.title)}
                    title={`${service.title} - J&B Tasoitus ja Maalaus Oy`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="icon-box"><Icon size={18} className="text-primary" aria-hidden="true" /></div>
                <h3 className="card-title line-clamp-2">{service.title}</h3>
              </div>
              <p className="card-text flex-grow">{service.description}</p>
              {serviceSlug && (
                <span className="mt-4 inline-flex items-center text-primary text-sm font-medium group-hover:underline">
                  Lue lisää <ArrowRight size={14} className="ml-1" aria-hidden="true" />
                </span>
              )}
            </article>
          );
          
          return (
            <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="h-full">
              {serviceSlug ? (
                <Link to={`/${serviceSlug}`} className="block h-full hover:shadow-lg transition-shadow">
                  {CardContent}
                </Link>
              ) : (
                CardContent
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

// ========== ABOUT ==========
const AboutSection = ({ settings }) => {
  const s = { ...defaultSettings, ...settings };
  const aboutImage = s.about_image_url || defaultSettings.about_image_url;
  return (
    <section id="meista" data-testid="about-section" className="section-padding" aria-labelledby="about-heading">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative order-2 lg:order-1">
            <img 
              src={aboutImage} 
              alt="Maalaustyöt Helsinki - J&B Tasoitus ja Maalaus Oy ammattilaiset työssä" 
              className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-primary text-white p-4 md:p-6 hidden sm:block">
              <p className="font-bold text-2xl md:text-3xl">{s.about_year}</p>
              <p className="text-xs md:text-sm opacity-80">vuodesta alkaen</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
            <Subtitle settings={s} className="mb-2 md:mb-3">{s.about_subtitle}</Subtitle>
            <h2 id="about-heading" className="section-title mb-4 md:mb-6">{s.about_title}</h2>
            <div className="space-y-3 md:space-y-4 text-sm md:text-base text-[#64748B] leading-relaxed">
              <p>{s.about_text_1}</p>
              <p>{s.about_text_2}</p>
              <p>{s.about_text_3}</p>
            </div>
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-primary-light border-l-4 border-primary">
              <p className="font-medium text-[#0F172A] mb-2 text-sm md:text-base">{s.about_info_title}</p>
              <p className="text-xs md:text-sm text-[#64748B]">{s.about_info_text}</p>
              <a href="https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot-ja-vahennykset/kotitalousvahennys/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-xs md:text-sm font-medium mt-2 hover:underline">Lue lisää<ArrowRight size={12} aria-hidden="true" /></a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== REFERENCES - Image + Text cards with "Näytä lisää" ==========
const ReferencesSection = ({ settings, references }) => {
  // State for showing more references
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Get settings with defaults
  const refSettings = {
    subtitle: settings?.references_subtitle || "TYÖNÄYTTEITÄ",
    title: settings?.references_title || "Referenssit",
    description: settings?.references_description || "Olemme toteuttaneet lukuisia projekteja yrityksille, taloyhtiöille ja yksityisille asiakkaille.",
    initialCountDesktop: settings?.references_initial_count_desktop || 4,
    initialCountMobile: settings?.references_initial_count_mobile || 2,
    loadMoreEnabled: settings?.references_load_more_enabled !== false,
    showMoreText: settings?.references_show_more_text || "Näytä lisää",
    showLessText: settings?.references_show_less_text || "Näytä vähemmän",
  };
  
  // Calculate how many to show
  const initialCount = isMobile ? refSettings.initialCountMobile : refSettings.initialCountDesktop;
  const visibleRefs = showAll ? references : references.slice(0, initialCount);
  const hasMore = references.length > initialCount;
  
  // Default placeholder image
  const placeholderImage = "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=600";
  
  return (
    <section id="referenssit" data-testid="references-section" className="section-padding bg-white" aria-labelledby="references-heading">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-8">
          <Subtitle settings={settings} className="mb-2 md:mb-3">{refSettings.subtitle}</Subtitle>
          <h2 id="references-heading" className="section-title">{refSettings.title}</h2>
          <p className="text-sm md:text-base text-[#64748B] mt-3 md:mt-4 max-w-2xl mx-auto">{refSettings.description}</p>
          
          {/* Link to all references page */}
          <div className="mt-6">
            <Link 
              to="/referenssit"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
              data-testid="references-view-all-btn"
            >
              Katso kaikki referenssit ({references.length})
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
        
        {/* Reference Cards Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {visibleRefs.map((ref, index) => (
            <motion.div 
              key={ref.id} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: index * 0.08 }}
              className="reference-card-full group"
              data-testid={`reference-card-${index}`}
            >
              {/* Cover Image */}
              <div className="reference-card-image-container">
                <img 
                  src={getImageUrl(ref.cover_image_url) || placeholderImage} 
                  alt={ref.cover_image_alt || `${ref.name} - ${ref.type}${ref.location ? ` ${ref.location}` : ''}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Text Content - Always visible below image */}
              <div className="p-5 md:p-6">
                {/* Project Title */}
                <h3 className="text-base md:text-lg font-bold text-[#0F172A] group-hover:text-primary transition-colors mb-2">
                  {ref.name}
                </h3>
                
                {/* Work Type / Description */}
                <p className="text-sm text-primary font-medium mb-3">{ref.type}</p>
                
                {/* Description - Always show full text */}
                {ref.description && (
                  <p className="text-sm text-[#64748B] mb-3 leading-relaxed">{ref.description}</p>
                )}
                
                {/* Meta info row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#64748B]">
                  {/* Main Contractor - Pääurakoitsija */}
                  {ref.main_contractor && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-primary" />
                      <span><span className="font-medium">Pääurakoitsija:</span> {ref.main_contractor}</span>
                    </div>
                  )}
                  
                  {/* Location */}
                  {ref.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" />
                      <span>{ref.location}</span>
                    </div>
                  )}
                  
                  {/* Year if available */}
                  {ref.year && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      <span>{ref.year}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Show More/Less Button */}
        {refSettings.loadMoreEnabled && hasMore && (
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
              data-testid="references-show-more-btn"
            >
              {showAll ? refSettings.showLessText : refSettings.showMoreText}
              <ChevronDown size={18} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// ========== LOCATION (GOOGLE MAPS) ==========
const LocationSection = ({ settings }) => (
  <section data-testid="location-section" className="section-padding bg-primary" aria-labelledby="location-heading">
    <div className="container-custom">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
        <Subtitle settings={settings} white className="mb-2 md:mb-3">SIJAINTI</Subtitle>
        <h2 id="location-heading" className="text-2xl md:text-4xl font-bold text-white mb-8 md:mb-12">Löydät meidät</h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ delay: 0.1 }}
          className="rounded-xl overflow-hidden shadow-2xl mb-8"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1984.5!2d25.08!3d60.24!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x469208e7b5b4e8d7%3A0x0!2sSienitie%2025%2C%2000760%20Helsinki!5e0!3m2!1sfi!2sfi!4v1709910000000!5m2!1sfi!2sfi"
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="J&B Tasoitus ja Maalaus Oy sijainti - Sienitie 25, Helsinki"
            className="w-full"
          />
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ delay: 0.2 }}
          className="text-white/90 text-base md:text-lg max-w-3xl mx-auto leading-relaxed"
        >
          J&B Tasoitus ja Maalaus Oy palvelee asiakkaita Helsingissä sekä koko Uudenmaan alueella. 
          Toteutamme tasoitus-, maalaus- ja rappaustyöt luotettavasti rakennusliikkeille, taloyhtiöille ja yrityksille.
        </motion.p>
      </motion.div>
    </div>
  </section>
);

// ========== CONTACT ==========
const ContactSection = ({ settings }) => {
  const s = { ...defaultSettings, ...settings };

  return (
    <section id="yhteystiedot" data-testid="contact-section" className="section-padding" aria-labelledby="contact-heading">
      <div className="container-custom">
        {/* Stacked layout - full width blocks */}
        <div className="space-y-10 md:space-y-14">
          
          {/* Yhteystiedot block - full width */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-8 md:mb-10">
              <Subtitle settings={s} className="mb-2 md:mb-3">{s.contact_subtitle}</Subtitle>
              <h2 id="contact-heading" className="section-title mb-4 md:mb-6">{s.contact_title}</h2>
              <p className="text-sm md:text-base text-[#64748B] max-w-2xl mx-auto">{s.contact_description}</p>
            </div>
            
            {/* Contact info grid - responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <address className="not-italic bg-[#FFFFFF] p-4 md:p-6 border border-[#E2E8F0] rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="icon-box flex-shrink-0"><MapPin size={18} className="text-primary" aria-hidden="true" /></div>
                  <div>
                    <p className="font-medium text-[#0F172A] text-sm md:text-base">Päätoimisto</p>
                    <p className="text-[#64748B] text-sm mt-1">{s.contact_address}</p>
                  </div>
                </div>
              </address>
              
              <div className="bg-[#FFFFFF] p-4 md:p-6 border border-[#E2E8F0] rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="icon-box flex-shrink-0"><Mail size={18} className="text-primary" aria-hidden="true" /></div>
                  <div>
                    <p className="font-medium text-[#0F172A] text-sm md:text-base">Sähköposti</p>
                    <a href={`mailto:${s.contact_email}`} className="text-primary hover:underline text-sm mt-1 block">{s.contact_email}</a>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#FFFFFF] p-4 md:p-6 border border-[#E2E8F0] rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="icon-box flex-shrink-0"><Phone size={18} className="text-primary" aria-hidden="true" /></div>
                  <div>
                    <p className="font-medium text-[#0F172A] text-sm md:text-base">Puhelin</p>
                    <div className="text-[#64748B] space-y-2 text-sm mt-1">
                      <div>
                        <p className="text-xs text-[#94A3B8]">{s.contact_phone_1_name}</p>
                        <a href={`tel:${s.contact_phone_1.replace(/\s/g, '')}`} className="text-primary hover:underline whitespace-nowrap">{s.contact_phone_1}</a>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A3B8]">{s.contact_phone_2_name}</p>
                        <a href={`tel:${s.contact_phone_2.replace(/\s/g, '')}`} className="text-primary hover:underline whitespace-nowrap">{s.contact_phone_2}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#FFFFFF] p-4 md:p-6 border border-[#E2E8F0] rounded-lg">
                <p className="font-medium text-[#0F172A] mb-2 text-sm md:text-base">{s.contact_jobs_title}</p>
                <p className="text-xs md:text-sm text-[#64748B]">{s.contact_jobs_text}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Tarjouspyyntö form - full width */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="bg-[#FAFAFA] p-6 md:p-10 border border-[#E2E8F0] rounded-lg max-w-4xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-6 md:mb-8 text-center">Lähetä tarjouspyyntö</h3>
              <QuoteRequestForm />
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

// ========== FOOTER ==========
const Footer = ({ logoUrl, settings }) => {
  const logo = logoUrl || settings?.logo_url || LOGO_URL;
  const companyName = settings?.company_name || 'J&B Tasoitus ja Maalaus Oy';
  const footerDescription = settings?.footer_description || 'Tasoitus- ja maalaustyöt Helsingissä ja Uudellamaalla.';
  const footerServices = settings?.footer_services || 'Tasoitustyöt,Sisämaalaus,Julkisivumaalaus,Julkisivurappaus,Mikrosementti,Kattomaalaus,Huoltomaalaus,Parvekemaalaus';
  const footerServiceArea = settings?.footer_service_area || 'Palvelemme asiakkaita Helsingissä ja koko Uudenmaan alueella.';
  const city = settings?.company_city || 'Helsinki';
  
  // Trust badges
  const trustBadge1 = settings?.footer_trust_badge_1 || '';
  const trustBadge2 = settings?.footer_trust_badge_2 || '';
  
  const servicesList = footerServices.split(',').map(s => s.trim()).filter(s => s);
  
  return (
    <footer data-testid="footer" className="footer-bg text-white py-10 md:py-14">
      <div className="container-custom">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          
          {/* Company info + SEO description */}
          <div>
            <img src={logo} alt={companyName} className="h-10 md:h-12 w-auto max-w-[180px] object-contain mb-4" />
            <p className="text-white/80 text-sm font-medium mb-2">{companyName}</p>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed">
              {footerDescription}
            </p>
          </div>
          
          {/* Services list - SEO keywords */}
          <div>
            <p className="text-white/80 text-sm font-medium mb-3">Tarjoamme:</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs md:text-sm text-white/60">
              {servicesList.map((service, idx) => (
                <li key={idx}>{service}</li>
              ))}
            </ul>
          </div>
          
          {/* Navigation links + Trust badges */}
          <div>
            <p className="text-white/80 text-sm font-medium mb-3">Sivusto</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm text-white/60">
              <a href="#palvelut" className="hover:text-white transition-colors">Palvelut</a>
              <a href="#meista" className="hover:text-white transition-colors">Meistä</a>
              <a href="#referenssit" className="hover:text-white transition-colors">Referenssit</a>
              <Link to="/ukk" className="hover:text-white transition-colors">UKK</Link>
              <a href="#yhteystiedot" className="hover:text-white transition-colors">Yhteystiedot</a>
            </div>
            <p className="text-white/50 text-xs mt-4 leading-relaxed">
              {footerServiceArea}
            </p>
            
            {/* Trust badges */}
            {(trustBadge1 || trustBadge2) && (
              <div className="flex items-center gap-4 mt-4" data-testid="footer-trust-badges">
                {trustBadge1 && (
                  <img 
                    src={getImageUrl(trustBadge1)} 
                    alt="Luotettava kumppani" 
                    className="object-contain rounded"
                    style={{ height: '150px', width: 'auto', maxWidth: '300px' }}
                  />
                )}
                {trustBadge2 && (
                  <img 
                    src={getImageUrl(trustBadge2)} 
                    alt="Asiakastieto" 
                    className="object-contain rounded"
                    style={{ height: '150px', width: 'auto', maxWidth: '300px' }}
                  />
                )}
              </div>
            )}
          </div>
          
        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/10 mt-8 md:mt-10 pt-6 md:pt-8 text-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} {companyName} · {city}, Finland</p>
        </div>
      </div>
    </footer>
  );
};

// ========== ADMIN PANEL ==========
const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [token, setToken] = useState(localStorage.getItem('admin_token') || "");
  const [activeTab, setActiveTab] = useState("settings");
  const [settings, setSettings] = useState(defaultSettings);
  const [services, setServices] = useState([]);
  const [references, setReferences] = useState([]);
  const [partners, setPartners] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Check existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      await axios.get(`${API}/admin/verify`, { headers: { Authorization: `Bearer ${tokenToVerify}` } });
      setIsAuthenticated(true);
      setToken(tokenToVerify);
      // Pass token directly to loadData to avoid state timing issues
      loadData(tokenToVerify);
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('admin_token');
      setToken("");
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await axios.post(`${API}/admin/login`, {
        username: credentials.username,
        password: credentials.password
      });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('admin_token', newToken);
      setIsAuthenticated(true);
      loadData(newToken);
    } catch (error) {
      const message = error.response?.data?.detail || "Kirjautuminen epäonnistui";
      setAuthError(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken("");
    setIsAuthenticated(false);
    setCredentials({ username: "", password: "" });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("Salasanat eivät täsmää");
      return;
    }
    if (passwordData.new.length < 8) {
      setPasswordError("Salasanan tulee olla vähintään 8 merkkiä");
      return;
    }

    try {
      await axios.post(`${API}/admin/change-password`, {
        current_password: passwordData.current,
        new_password: passwordData.new
      }, getAuthHeaders());
      setPasswordSuccess("Salasana vaihdettu! Kirjaudu uudelleen uudella salasanalla.");
      setPasswordData({ current: "", new: "", confirm: "" });
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.detail || "Salasanan vaihto epäonnistui");
    }
  };

  const loadData = async (tokenToUse = token) => {
    if (!tokenToUse) {
      console.warn('loadData called without token');
      setLoading(false);
      return;
    }
    setLoading(true);
    const headers = { headers: { Authorization: `Bearer ${tokenToUse}` } };
    try {
      // Load public data first
      const [settingsRes, servicesRes, refsRes, partnersRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/services`),
        axios.get(`${API}/references`),
        axios.get(`${API}/partners`)
      ]);
      setSettings({ ...defaultSettings, ...settingsRes.data });
      setServices(servicesRes.data);
      setReferences(refsRes.data);
      setPartners(partnersRes.data);
      
      // Load FAQs (public)
      try {
        const faqsRes = await axios.get(`${API}/admin/faqs`, headers);
        setFaqs(faqsRes.data);
      } catch (faqError) {
        console.error('Failed to load FAQs:', faqError);
        setFaqs([]);
      }
      
      // Load protected data separately
      try {
        const contactsRes = await axios.get(`${API}/admin/contacts`, headers);
        setContacts(contactsRes.data);
      } catch (contactError) {
        console.error('Failed to load contacts:', contactError);
        if (contactError.response?.status === 401) {
          // Only logout on authentication error, not on other errors
          console.warn('Contacts 401 - token may be invalid');
          handleLogout();
          return;
        }
        // Don't logout for other errors, just show empty contacts
        setContacts([]);
      }
    } catch (e) { 
      console.error('Failed to load data:', e);
      // Only logout on 401, not on network errors etc
      if (e.response?.status === 401) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, settings, getAuthHeaders());
      alert("Tallennettu! Staattiset sivut päivitetään taustalla.");
    } catch (error) { 
      console.error('Save settings error:', error);
      if (error.response?.status === 401) handleLogout();
      else alert(`Virhe tallennuksessa: ${error.response?.data?.detail || error.message}`); 
    }
    setSaving(false);
  };

  const regenerateStaticPages = async () => {
    setSaving(true);
    try {
      const response = await axios.post(`${API}/admin/regenerate-static`, {}, getAuthHeaders());
      if (response.data.success) {
        alert("Staattiset sivut päivitetty onnistuneesti!");
      } else {
        alert(`Virhe: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Regenerate error:', error);
      if (error.response?.status === 401) handleLogout();
      else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
    }
    setSaving(false);
  };

  const seedData = async () => {
    try { await axios.post(`${API}/admin/seed`, {}, getAuthHeaders()); loadData(); } catch {}
  };

  // CRUD helpers
  const saveService = async (s) => {
    try {
      if (s.id && !s.isNew) await axios.put(`${API}/admin/services/${s.id}`, s, getAuthHeaders());
      else { const { isNew, ...d } = s; await axios.post(`${API}/admin/services`, d, getAuthHeaders()); }
      loadData(); setEditingItem(null); setNewItem(null);
    } catch (error) { 
      console.error('Save service error:', error);
      if (error.response?.status === 401) handleLogout();
      else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
    }
  };
  const deleteService = async (id) => { 
    if (window.confirm("Poista?")) { 
      try { 
        await axios.delete(`${API}/admin/services/${id}`, getAuthHeaders()); 
        loadData(); 
      } catch (error) { 
        console.error('Delete service error:', error);
        if (error.response?.status === 401) handleLogout();
        else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
      } 
    } 
  };
  
  const saveReference = async (r) => {
    try {
      if (r.id && !r.isNew) await axios.put(`${API}/admin/references/${r.id}`, r, getAuthHeaders());
      else { const { isNew, ...d } = r; await axios.post(`${API}/admin/references`, d, getAuthHeaders()); }
      loadData(); setEditingItem(null); setNewItem(null);
    } catch (error) { 
      console.error('Save reference error:', error);
      if (error.response?.status === 401) handleLogout();
      else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
    }
  };
  const deleteReference = async (id) => { 
    if (window.confirm("Poista?")) { 
      try { 
        await axios.delete(`${API}/admin/references/${id}`, getAuthHeaders()); 
        loadData(); 
      } catch (error) { 
        console.error('Delete reference error:', error);
        if (error.response?.status === 401) handleLogout(); 
        else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
      } 
    } 
  };

  const savePartner = async (p) => {
    try {
      if (p.id && !p.isNew) await axios.put(`${API}/admin/partners/${p.id}`, p, getAuthHeaders());
      else { const { isNew, ...d } = p; await axios.post(`${API}/admin/partners`, d, getAuthHeaders()); }
      loadData(); setEditingItem(null); setNewItem(null);
    } catch (error) { 
      console.error('Save partner error:', error);
      if (error.response?.status === 401) handleLogout();
      else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
    }
  };
  const deletePartner = async (id) => { 
    if (window.confirm("Poista?")) { 
      try { 
        await axios.delete(`${API}/admin/partners/${id}`, getAuthHeaders()); 
        loadData(); 
      } catch (error) { 
        console.error('Delete partner error:', error);
        if (error.response?.status === 401) handleLogout();
        else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
      } 
    } 
  };

  const deleteContact = async (id) => { if (window.confirm("Poista?")) { try { await axios.delete(`${API}/admin/contacts/${id}`, getAuthHeaders()); loadData(); } catch (error) { if (error.response?.status === 401) handleLogout(); } } };

  // FAQ CRUD
  const saveFaq = async (faq) => {
    try {
      if (faq.id && !faq.isNew) {
        await axios.put(`${API}/admin/faqs/${faq.id}`, faq, getAuthHeaders());
      } else {
        const { isNew, ...data } = faq;
        await axios.post(`${API}/admin/faqs`, data, getAuthHeaders());
      }
      loadData();
      setEditingItem(null);
      setNewItem(null);
    } catch (error) {
      console.error('Save FAQ error:', error);
      if (error.response?.status === 401) handleLogout();
      else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
    }
  };
  const deleteFaq = async (id) => {
    if (window.confirm("Poista kysymys?")) {
      try {
        await axios.delete(`${API}/admin/faqs/${id}`, getAuthHeaders());
        loadData();
      } catch (error) {
        console.error('Delete FAQ error:', error);
        if (error.response?.status === 401) handleLogout();
        else alert(`Virhe: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  // Data Export/Import functions
  const exportAllData = async () => {
    try {
      const response = await axios.get(`${API}/admin/export-all-data`, getAuthHeaders());
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jb-site-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Data exportattu onnistuneesti!');
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export epäonnistui: ${error.message}`);
    }
  };

  const exportFaqsOnly = async () => {
    try {
      const response = await axios.get(`${API}/admin/export-faqs`, getAuthHeaders());
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jb-faqs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert(`FAQ exportattu onnistuneesti! (${response.data.faqs?.length || 0} kysymystä)`);
    } catch (error) {
      console.error('FAQ Export error:', error);
      alert(`FAQ Export epäonnistui: ${error.message}`);
    }
  };

  const importFaqsOnly = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!window.confirm('Tämä korvaa kaikki nykyiset UKK-kysymykset! Haluatko jatkaa?')) {
      event.target.value = '';
      return;
    }
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const response = await axios.post(`${API}/admin/import-faqs`, data, getAuthHeaders());
      alert(`FAQ importattu onnistuneesti! (${response.data.imported_count} kysymystä)`);
      loadData();
    } catch (error) {
      console.error('FAQ Import error:', error);
      alert(`FAQ Import epäonnistui: ${error.message}`);
    }
    event.target.value = '';
  };

  const importAllData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!window.confirm('VAROITUS: Tämä korvaa kaikki nykyiset tiedot! Haluatko jatkaa?')) {
      event.target.value = '';
      return;
    }
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await axios.post(`${API}/admin/import-all-data`, data, getAuthHeaders());
      alert('Data importattu onnistuneesti! Sivu päivittyy...');
      loadData();
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import epäonnistui: ${error.message}`);
    }
    event.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 border border-[#E2E8F0] w-full max-w-md">
          <div className="flex justify-center mb-6"><img src={LOGO_URL} alt="J&B" className="h-12 md:h-14" /></div>
          <h1 className="text-xl md:text-2xl font-bold text-center text-[#0F172A] mb-6">Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-sm font-medium mb-2">Käyttäjä</label><input type="text" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} className="form-input" required /></div>
            <div><label className="block text-sm font-medium mb-2">Salasana</label><input type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className="form-input" required /></div>
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <button type="submit" className="btn-primary w-full">Kirjaudu</button>
          </form>
          <Link to="/" className="block text-center text-sm text-[#64748B] mt-4 hover:text-primary">← Etusivulle</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "theme", label: "Teema", icon: Palette },
    { id: "global", label: "Yleiset", icon: Globe },
    { id: "settings", label: "Etusivu", icon: Home },
    { id: "servicepages", label: "Palvelusivut", icon: FileText },
    { id: "services", label: "Palvelut", icon: Briefcase },
    { id: "references", label: "Referenssit", icon: Building2 },
    { id: "faqs", label: "UKK", icon: HelpCircle },
    { id: "partners", label: "Laatutakuu", icon: Award },
    { id: "contacts", label: "Viestit", icon: MessageSquare },
    { id: "security", label: "Turvallisuus", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container-custom flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-3"><img src={LOGO_URL} alt="J&B" className="h-8 md:h-10" /><span className="font-bold text-[#0F172A] text-sm md:text-base">Admin</span></div>
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={seedData} className="text-xs md:text-sm text-[#64748B] hover:text-green-600 flex items-center gap-1" title="Palauta oletusdata jos tietokanta on tyhjä">
              <Plus size={14} />Palauta data
            </button>
            <button onClick={exportAllData} className="text-xs md:text-sm text-[#64748B] hover:text-blue-600 flex items-center gap-1" title="Lataa kaikki sivuston data JSON-tiedostona">
              <Download size={14} />Export
            </button>
            <label className="text-xs md:text-sm text-[#64748B] hover:text-green-600 flex items-center gap-1 cursor-pointer" title="Lataa data JSON-tiedostosta">
              <Upload size={14} />Import
              <input type="file" accept=".json" onChange={importAllData} className="hidden" />
            </label>
            <button onClick={regenerateStaticPages} disabled={saving} className="flex items-center gap-1 text-xs md:text-sm text-[#64748B] hover:text-primary" title="Päivitä staattiset SEO-sivut">
              <RefreshCw size={14} className={saving ? "animate-spin" : ""} />SEO
            </button>
            <Link to="/" className="text-xs md:text-sm text-[#64748B] hover:text-primary">Sivusto</Link>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs md:text-sm text-[#64748B] hover:text-red-600"><LogOut size={14} />Ulos</button>
          </div>
        </div>
      </header>

      <div className="container-custom py-4 md:py-8">
        <div className="flex gap-1 md:gap-2 mb-6 md:mb-8 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditingItem(null); setNewItem(null); }} className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3 font-medium text-xs md:text-sm border-b-2 -mb-px whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-[#64748B] hover:text-primary"}`}>
              <tab.icon size={16} />{tab.label}
              {tab.id === "contacts" && contacts.length > 0 && <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{contacts.length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
        ) : (
          <>
            {/* THEME TAB */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-bold flex items-center gap-2"><Palette size={20} className="text-primary" />Teema-asetukset</h2>
                  <button onClick={saveSettings} disabled={saving} className="btn-primary text-sm flex items-center gap-2"><Save size={16} />{saving ? "..." : "Tallenna"}</button>
                </div>

                {/* Logo & Favicon */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Logo ja Favicon</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Sivuston logo</label>
                      <ImageUpload currentImage={settings.logo_url} onImageChange={(url) => setSettings({...settings, logo_url: url})} token={token} />
                      <p className="text-xs text-[#64748B] mt-2">Suositeltu: PNG tai SVG, max leveys 200px</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Favicon (välilehden ikoni)</label>
                      <ImageUpload currentImage={settings.favicon_url} onImageChange={(url) => setSettings({...settings, favicon_url: url})} token={token} />
                      <p className="text-xs text-[#64748B] mt-2">Suositeltu: 32x32px PNG tai ICO</p>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Värimaailma</h3>
                  <p className="text-sm text-[#64748B]">Valitse pääväri - koko sivuston teema päivittyy automaattisesti</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSettings({...settings, theme_color: color.value})}
                        className={`aspect-square rounded-lg border-2 transition-all ${settings.theme_color === color.value ? 'border-[#0F172A] scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: color.bg }}
                        title={color.label}
                      >
                        {settings.theme_color === color.value && (
                          <CheckCircle size={20} className="text-white mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <label className="text-sm font-medium">Mukautettu väri:</label>
                    <input 
                      type="color" 
                      value={settings.theme_color || "#0056D2"} 
                      onChange={(e) => setSettings({...settings, theme_color: e.target.value})}
                      className="w-12 h-10 cursor-pointer border border-[#E2E8F0] rounded"
                    />
                    <span className="text-sm text-[#64748B]">{settings.theme_color}</span>
                  </div>
                </div>

                {/* Font */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Fontti</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setSettings({...settings, theme_font: font.value})}
                        className={`p-4 border rounded-lg text-left transition-all ${settings.theme_font === font.value ? 'border-primary bg-primary-light' : 'border-[#E2E8F0] hover:border-primary/50'}`}
                        style={{ fontFamily: `"${font.value}", sans-serif` }}
                      >
                        <span className="block text-lg font-bold">Aa</span>
                        <span className="text-xs text-[#64748B]">{font.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Tekstin koko</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {SIZE_OPTIONS.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setSettings({...settings, theme_size: size.value})}
                        className={`p-4 border rounded-lg text-center transition-all ${settings.theme_size === size.value ? 'border-primary bg-primary-light' : 'border-[#E2E8F0] hover:border-primary/50'}`}
                      >
                        <span className={`block font-bold ${size.value === 'small' ? 'text-lg' : size.value === 'large' ? 'text-3xl' : 'text-2xl'}`}>Aa</span>
                        <span className="text-sm text-[#64748B]">{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitle/Slogan Settings */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Alaotsikko (Slogan) asetukset</h3>
                  <p className="text-sm text-[#64748B]">Muokkaa alaotsikon ulkonäköä (esim. "LAATUJOHTAJAT", "MITÄ TEEMME")</p>
                  
                  {/* Subtitle Font */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Fontti</label>
                    <select 
                      value={settings.subtitle_font || 'Inter'} 
                      onChange={(e) => setSettings({...settings, subtitle_font: e.target.value})}
                      className="form-input text-sm w-full"
                    >
                      {FONT_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subtitle Size */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Koko</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SUBTITLE_SIZE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSettings({...settings, subtitle_size: opt.value})}
                          className={`p-2 border rounded text-center transition-all ${settings.subtitle_size === opt.value ? 'border-primary bg-primary-light' : 'border-[#E2E8F0] hover:border-primary/50'}`}
                        >
                          <span className={`block ${opt.class}`}>ABC</span>
                          <span className="text-xs text-[#64748B]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle Weight */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Paksuus</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SUBTITLE_WEIGHT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSettings({...settings, subtitle_weight: opt.value})}
                          className={`p-2 border rounded text-center transition-all ${settings.subtitle_weight === opt.value ? 'border-primary bg-primary-light' : 'border-[#E2E8F0] hover:border-primary/50'}`}
                        >
                          <span className={`block ${opt.class}`}>Aa</span>
                          <span className="text-xs text-[#64748B]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle Letter Spacing */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Kirjainväli</label>
                    <div className="grid grid-cols-4 gap-2">
                      {SUBTITLE_SPACING_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSettings({...settings, subtitle_spacing: opt.value})}
                          className={`p-2 border rounded text-center transition-all ${settings.subtitle_spacing === opt.value ? 'border-primary bg-primary-light' : 'border-[#E2E8F0] hover:border-primary/50'}`}
                        >
                          <span className={`block text-xs ${opt.class}`}>ABC</span>
                          <span className="text-xs text-[#64748B]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-[#64748B] mb-2">Esikatselu:</p>
                    <p 
                      className={`uppercase ${SUBTITLE_SIZE_OPTIONS.find(o => o.value === (settings.subtitle_size || 'normal'))?.class || 'text-sm'} ${SUBTITLE_WEIGHT_OPTIONS.find(o => o.value === (settings.subtitle_weight || 'normal'))?.class || 'font-normal'} ${SUBTITLE_SPACING_OPTIONS.find(o => o.value === (settings.subtitle_spacing || 'normal'))?.class || 'tracking-normal'}`}
                      style={{ 
                        color: settings.theme_color || '#0056D2',
                        fontFamily: `"${settings.subtitle_font || 'Inter'}", sans-serif`
                      }}
                    >
                      LAATUJOHTAJAT
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white border p-4 md:p-6">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2 mb-4">Esikatselu</h3>
                  <div 
                    className="p-6 rounded-lg border" 
                    style={{ 
                      fontFamily: `"${settings.theme_font || 'Inter'}", sans-serif`,
                      '--preview-color': settings.theme_color || '#0056D2'
                    }}
                  >
                    <p className="text-sm mb-2" style={{ color: settings.theme_color }}>ALAOTSIKKO</p>
                    <h2 className={`font-bold text-[#0F172A] mb-4 ${settings.theme_size === 'small' ? 'text-xl' : settings.theme_size === 'large' ? 'text-4xl' : 'text-2xl'}`}>
                      Esimerkki otsikko
                    </h2>
                    <p className={`text-[#64748B] mb-4 ${settings.theme_size === 'small' ? 'text-sm' : settings.theme_size === 'large' ? 'text-lg' : 'text-base'}`}>
                      Tämä on esimerkkiteksti, joka näyttää miltä sivuston sisältö näyttää valituilla asetuksilla.
                    </p>
                    <button 
                      className="px-4 py-2 text-white rounded font-medium"
                      style={{ backgroundColor: settings.theme_color }}
                    >
                      Esimerkki nappi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GLOBAL SETTINGS TAB */}
            {activeTab === "global" && (
              <GlobalSettingsAdmin 
                settings={settings}
                onChange={setSettings}
                onSave={saveSettings}
                saving={saving}
              />
            )}

            {/* SERVICE PAGES TAB */}
            {activeTab === "servicepages" && (
              <ServicePagesAdmin 
                token={token}
                onRefresh={loadData}
              />
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-bold">Sivuston asetukset</h2>
                  <button onClick={saveSettings} disabled={saving} className="btn-primary text-sm flex items-center gap-2"><Save size={16} />{saving ? "..." : "Tallenna"}</button>
                </div>
                
                {/* Hero */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Hero-osio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Slogan</label><input value={settings.hero_slogan} onChange={(e) => setSettings({...settings, hero_slogan: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Badge 1</label><input value={settings.hero_badge_1} onChange={(e) => setSettings({...settings, hero_badge_1: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Otsikko 1</label><input value={settings.hero_title_1} onChange={(e) => setSettings({...settings, hero_title_1: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Badge 2</label><input value={settings.hero_badge_2} onChange={(e) => setSettings({...settings, hero_badge_2: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Otsikko 2 (sininen)</label><input value={settings.hero_title_2} onChange={(e) => setSettings({...settings, hero_title_2: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Otsikko 3</label><input value={settings.hero_title_3} onChange={(e) => setSettings({...settings, hero_title_3: e.target.value})} className="form-input text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Kuvaus</label><textarea value={settings.hero_description} onChange={(e) => setSettings({...settings, hero_description: e.target.value})} className="form-input text-sm" rows={3} /></div>
                  <div><label className="block text-sm font-medium mb-1">Taustakuva</label><ImageUpload currentImage={settings.hero_image_url} onImageChange={(url) => setSettings({...settings, hero_image_url: url})} token={token} /></div>
                </div>

                {/* About */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Meistä-osio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Alaotsikko</label><input value={settings.about_subtitle} onChange={(e) => setSettings({...settings, about_subtitle: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Vuosi</label><input value={settings.about_year} onChange={(e) => setSettings({...settings, about_year: e.target.value})} className="form-input text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Otsikko</label><input value={settings.about_title} onChange={(e) => setSettings({...settings, about_title: e.target.value})} className="form-input text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Teksti 1</label><textarea value={settings.about_text_1} onChange={(e) => setSettings({...settings, about_text_1: e.target.value})} className="form-input text-sm" rows={2} /></div>
                  <div><label className="block text-sm font-medium mb-1">Teksti 2</label><textarea value={settings.about_text_2} onChange={(e) => setSettings({...settings, about_text_2: e.target.value})} className="form-input text-sm" rows={2} /></div>
                  <div><label className="block text-sm font-medium mb-1">Teksti 3</label><textarea value={settings.about_text_3} onChange={(e) => setSettings({...settings, about_text_3: e.target.value})} className="form-input text-sm" rows={2} /></div>
                  <div><label className="block text-sm font-medium mb-1">Kuva</label><ImageUpload currentImage={settings.about_image_url} onImageChange={(url) => setSettings({...settings, about_image_url: url})} token={token} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Info-otsikko</label><input value={settings.about_info_title} onChange={(e) => setSettings({...settings, about_info_title: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Info-teksti</label><input value={settings.about_info_text} onChange={(e) => setSettings({...settings, about_info_text: e.target.value})} className="form-input text-sm" /></div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Yhteystiedot-osio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Alaotsikko</label><input value={settings.contact_subtitle} onChange={(e) => setSettings({...settings, contact_subtitle: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Otsikko</label><input value={settings.contact_title} onChange={(e) => setSettings({...settings, contact_title: e.target.value})} className="form-input text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Kuvaus</label><input value={settings.contact_description} onChange={(e) => setSettings({...settings, contact_description: e.target.value})} className="form-input text-sm" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Osoite</label><input value={settings.contact_address} onChange={(e) => setSettings({...settings, contact_address: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Sähköposti</label><input value={settings.contact_email} onChange={(e) => setSettings({...settings, contact_email: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Puh 1 nimi</label><input value={settings.contact_phone_1_name} onChange={(e) => setSettings({...settings, contact_phone_1_name: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Puh 1</label><input value={settings.contact_phone_1} onChange={(e) => setSettings({...settings, contact_phone_1: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Puh 2 nimi</label><input value={settings.contact_phone_2_name} onChange={(e) => setSettings({...settings, contact_phone_2_name: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Puh 2</label><input value={settings.contact_phone_2} onChange={(e) => setSettings({...settings, contact_phone_2: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Työpaikat otsikko</label><input value={settings.contact_jobs_title} onChange={(e) => setSettings({...settings, contact_jobs_title: e.target.value})} className="form-input text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">Työpaikat teksti</label><input value={settings.contact_jobs_text} onChange={(e) => setSettings({...settings, contact_jobs_text: e.target.value})} className="form-input text-sm" /></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-white border p-4 md:p-6 space-y-4">
                  <h3 className="font-bold text-[#0F172A] border-b pb-2">Alatunniste (Footer)</h3>
                  <div><label className="block text-sm font-medium mb-1">Yrityksen kuvaus</label><input value={settings.footer_description || ''} onChange={(e) => setSettings({...settings, footer_description: e.target.value})} className="form-input text-sm" placeholder="Tasoitus- ja maalaustyöt Helsingissä ja Uudellamaalla." /></div>
                  <div><label className="block text-sm font-medium mb-1">Palvelut (pilkulla erotettuna)</label><input value={settings.footer_services || ''} onChange={(e) => setSettings({...settings, footer_services: e.target.value})} className="form-input text-sm" placeholder="Tasoitustyöt,Sisämaalaus,Julkisivumaalaus..." /></div>
                  <div><label className="block text-sm font-medium mb-1">Palvelualue teksti</label><input value={settings.footer_service_area || ''} onChange={(e) => setSettings({...settings, footer_service_area: e.target.value})} className="form-input text-sm" placeholder="Palvelemme asiakkaita Helsingissä ja koko Uudenmaan alueella." /></div>
                  
                  {/* Trust badges */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-3">Luotettavuusmerkit</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Merkki 1 (esim. Luotettava Kumppani)</label>
                        <ImageUpload 
                          value={settings.footer_trust_badge_1 || ''} 
                          onChange={(url) => setSettings({...settings, footer_trust_badge_1: url})} 
                          token={token}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Merkki 2 (esim. Asiakastieto)</label>
                        <ImageUpload 
                          value={settings.footer_trust_badge_2 || ''} 
                          onChange={(url) => setSettings({...settings, footer_trust_badge_2: url})} 
                          token={token}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === "services" && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-bold">Palvelut ({services.length})</h2>
                  <div className="flex gap-2">
                    {services.length === 0 && <button onClick={seedData} className="btn-secondary text-xs md:text-sm">Lisää oletukset</button>}
                    <button onClick={() => setNewItem({ title: "", description: "", icon: "Building2", image_url: "", order: services.length + 1, isNew: true })} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Plus size={14} />Lisää</button>
                  </div>
                </div>
                {newItem && <div className="bg-white border border-primary p-4 md:p-6 mb-4"><h3 className="font-bold mb-4">Uusi palvelu</h3><ServiceForm service={newItem} onChange={setNewItem} onSave={() => saveService(newItem)} onCancel={() => setNewItem(null)} token={token} /></div>}
                <div className="space-y-3 md:space-y-4">
                  {services.map((s) => (
                    <div key={s.id} className="bg-white border p-4 md:p-6">
                      {editingItem?.id === s.id ? <ServiceForm service={editingItem} onChange={setEditingItem} onSave={() => saveService(editingItem)} onCancel={() => setEditingItem(null)} token={token} /> : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {s.image_url && <img src={getImageUrl(s.image_url)} alt={s.title} className="w-16 md:w-24 h-12 md:h-16 object-cover" />}
                            <div><h3 className="font-bold text-sm md:text-base">{s.title}</h3><p className="text-xs md:text-sm text-[#64748B] mt-1 line-clamp-2">{s.description}</p></div>
                          </div>
                          <div className="flex gap-1"><button onClick={() => setEditingItem(s)} className="p-2 text-[#64748B] hover:text-primary"><Edit2 size={16} /></button><button onClick={() => deleteService(s.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 size={16} /></button></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REFERENCES TAB */}
            {activeTab === "references" && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold">Referenssit ({references.length})</h2>
                    <p className="text-xs md:text-sm text-[#64748B] mt-1">Hallitse projektireferenssejä kuvilla ja tiedoilla</p>
                  </div>
                  <button onClick={() => setNewItem({ name: "", type: "Tasoitus- ja maalaustyöt", description: "", main_contractor: "", location: "", cover_image_url: "", year: "", is_published: true, order: references.length + 1, isNew: true })} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Plus size={14} />Lisää referenssi</button>
                </div>
                {newItem && <div className="bg-white border border-primary p-4 md:p-6 mb-4"><h3 className="font-bold mb-4">Uusi referenssi</h3><ReferenceForm reference={newItem} onChange={setNewItem} onSave={() => saveReference(newItem)} onCancel={() => setNewItem(null)} token={token} /></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {references.map((r) => (
                    <div key={r.id} className={`bg-white border p-4 md:p-5 ${r.is_published === false ? 'opacity-60' : ''}`}>
                      {editingItem?.id === r.id ? <ReferenceForm reference={editingItem} onChange={setEditingItem} onSave={() => saveReference(editingItem)} onCancel={() => setEditingItem(null)} token={token} /> : (
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-24 h-20 flex-shrink-0 bg-[#FAFAFA] rounded-lg overflow-hidden">
                            {r.cover_image_url ? (
                              <img src={getImageUrl(r.cover_image_url)} alt={r.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 size={24} className="text-[#94A3B8]" />
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <h3 className="font-bold text-sm md:text-base truncate">{r.name}</h3>
                                <p className="text-xs md:text-sm text-primary">{r.type}</p>
                                {r.main_contractor && <p className="text-xs text-[#64748B]">Pääurakoitsija: {r.main_contractor}</p>}
                                {r.location && <p className="text-xs text-[#64748B] flex items-center gap-1"><MapPin size={10} />{r.location}</p>}
                                {r.is_published === false && <span className="text-xs text-orange-600 font-medium">Piilotettu</span>}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => setEditingItem(r)} className="p-2 text-[#64748B] hover:text-primary"><Edit2 size={16} /></button>
                                <button onClick={() => deleteReference(r.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ TAB */}
            {activeTab === "faqs" && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                      <HelpCircle size={20} className="text-primary" />
                      Usein kysytyt kysymykset ({faqs.length})
                    </h2>
                    <p className="text-xs md:text-sm text-[#64748B] mt-1">
                      Hallitse UKK-osion sisältöä. Kysymykset näytetään /ukk -sivulla ja palvelukohtaiset kysymykset palvelusivuilla.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={exportFaqsOnly} className="text-xs text-[#64748B] hover:text-blue-600 flex items-center gap-1 border border-[#E2E8F0] px-2 py-1 rounded" title="Lataa vain UKK-kysymykset">
                      <Download size={12} />Export FAQ
                    </button>
                    <label className="text-xs text-[#64748B] hover:text-green-600 flex items-center gap-1 border border-[#E2E8F0] px-2 py-1 rounded cursor-pointer" title="Lataa UKK-kysymykset tiedostosta">
                      <Upload size={12} />Import FAQ
                      <input type="file" accept=".json" onChange={importFaqsOnly} className="hidden" />
                    </label>
                    <button 
                      onClick={() => setNewItem({ question: "", answer: "", service_id: null, order: faqs.length + 1, is_published: true, isNew: true })} 
                      className="btn-primary text-xs md:text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />Lisää kysymys
                    </button>
                  </div>
                </div>

                {/* New FAQ Form */}
                {newItem && (
                  <div className="bg-white border border-primary p-4 md:p-6 mb-4">
                    <h3 className="font-bold mb-4">Uusi kysymys</h3>
                    <FaqForm 
                      faq={newItem} 
                      onChange={setNewItem} 
                      onSave={() => saveFaq(newItem)} 
                      onCancel={() => setNewItem(null)}
                      services={services}
                    />
                  </div>
                )}

                {/* FAQ List */}
                {faqs.length === 0 ? (
                  <div className="text-center py-12 text-[#64748B]">
                    <HelpCircle size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Ei kysymyksiä vielä. Lisää ensimmäinen UKK!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqs.map((faq, index) => {
                      const linkedService = services.find(s => s.id === faq.service_id);
                      return (
                        <div key={faq.id} className="bg-white border p-4 md:p-6">
                          {editingItem?.id === faq.id ? (
                            <FaqForm 
                              faq={editingItem} 
                              onChange={setEditingItem} 
                              onSave={() => saveFaq(editingItem)} 
                              onCancel={() => setEditingItem(null)}
                              services={services}
                            />
                          ) : (
                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded">#{index + 1}</span>
                                    {linkedService ? (
                                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{linkedService.title}</span>
                                    ) : (
                                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Yleinen</span>
                                    )}
                                    {!faq.is_published && (
                                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">Piilotettu</span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-[#0F172A] text-sm md:text-base mb-2">{faq.question}</h4>
                                  <p className="text-sm text-[#64748B] line-clamp-2">{faq.answer}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button 
                                    onClick={() => setEditingItem(faq)} 
                                    className="p-2 text-[#64748B] hover:text-primary"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => deleteFaq(faq.id)} 
                                    className="p-2 text-[#64748B] hover:text-red-600"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SEO Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 font-medium mb-1">SEO-vinkki</p>
                  <p className="text-xs text-blue-700">
                    UKK-osio luo automaattisesti FAQPage-skeeman (JSON-LD), joka parantaa sivuston näkyvyyttä Google-haussa.
                    Palvelukohtaiset FAQ:t näytetään palvelusivuilla ja /ukk -sivulla ryhmiteltyinä palvelun mukaan.
                  </p>
                </div>
              </div>
            )}

            {/* PARTNERS TAB */}
            {activeTab === "partners" && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <div><h2 className="text-lg md:text-xl font-bold">Laatutakuu - Logot ({partners.length})</h2><p className="text-xs md:text-sm text-[#64748B] mt-1">Lisää kumppaneiden ja sertifikaattien logoja</p></div>
                  <button onClick={() => setNewItem({ name: "Logo", image_url: "", order: partners.length + 1, isNew: true })} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Plus size={14} />Lisää logo</button>
                </div>
                {newItem && <div className="bg-white border border-primary p-4 md:p-6 mb-4"><h3 className="font-bold mb-4">Uusi logo</h3><PartnerForm partner={newItem} onChange={setNewItem} onSave={() => savePartner(newItem)} onCancel={() => setNewItem(null)} token={token} /></div>}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {partners.map((p) => (
                    <div key={p.id} className="bg-white border p-4 md:p-6">
                      {editingItem?.id === p.id ? <PartnerForm partner={editingItem} onChange={setEditingItem} onSave={() => savePartner(editingItem)} onCancel={() => setEditingItem(null)} token={token} /> : (
                        <div className="flex flex-col items-center gap-3">
                          {p.image_url ? <img src={getImageUrl(p.image_url)} alt="Logo" className="w-20 h-16 object-contain" /> : <div className="w-20 h-16 bg-primary-light flex items-center justify-center"><Award size={24} className="text-primary" /></div>}
                          <div className="flex gap-1"><button onClick={() => setEditingItem(p)} className="p-2 text-[#64748B] hover:text-primary"><Edit2 size={16} /></button><button onClick={() => deletePartner(p.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 size={16} /></button></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACTS TAB */}
            {activeTab === "contacts" && (
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Viestit ({contacts.length})</h2>
                {contacts.length === 0 ? <p className="text-[#64748B] text-center py-12">Ei viestejä</p> : (
                  <div className="space-y-3 md:space-y-4">
                    {contacts.map((c) => (
                      <div key={c.id} className="bg-white border p-4 md:p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm md:text-base">{c.firstName} {c.lastName}</h3>
                            <p className="text-xs md:text-sm text-primary">{c.email}</p>
                            {c.phone && <p className="text-xs text-[#64748B]">{c.phone}</p>}
                            {c.subject && <p className="text-xs md:text-sm font-medium mt-2">Aihe: {c.subject}</p>}
                            <p className="text-xs md:text-sm text-[#64748B] mt-2">{c.message}</p>
                            <p className="text-xs text-[#94A3B8] mt-2">{new Date(c.created_at).toLocaleString('fi-FI')}</p>
                          </div>
                          <button onClick={() => deleteContact(c.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="max-w-md">
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2"><Shield size={20} className="text-primary" />Turvallisuusasetukset</h2>
                
                <div className="bg-white border p-4 md:p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-full">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base">JWT-autentikointi</h3>
                      <p className="text-xs text-[#64748B]">Aktiivinen - Turvallinen token-pohjainen kirjautuminen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-full">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base">Rate Limiting</h3>
                      <p className="text-xs text-[#64748B]">Aktiivinen - Max 5 yritystä / 5 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-full">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base">Salasanan hashaus</h3>
                      <p className="text-xs text-[#64748B]">Aktiivinen - Bcrypt-salaus</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border p-4 md:p-6">
                  <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2"><Lock size={16} />Vaihda salasana</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nykyinen salasana</label>
                      <input 
                        type="password" 
                        value={passwordData.current} 
                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} 
                        className="form-input text-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Uusi salasana</label>
                      <input 
                        type="password" 
                        value={passwordData.new} 
                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} 
                        className="form-input text-sm" 
                        required 
                        minLength={8}
                      />
                      <p className="text-xs text-[#64748B] mt-1">Vähintään 8 merkkiä</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vahvista uusi salasana</label>
                      <input 
                        type="password" 
                        value={passwordData.confirm} 
                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} 
                        className="form-input text-sm" 
                        required 
                      />
                    </div>
                    {passwordError && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm">{passwordError}</div>}
                    {passwordSuccess && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm">{passwordSuccess}</div>}
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <Lock size={16} />Vaihda salasana
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Form Components
const ServiceForm = ({ service, onChange, onSave, onCancel, token }) => (
  <div className="space-y-3 md:space-y-4">
    <div><label className="block text-sm font-medium mb-1">Otsikko</label><input value={service.title} onChange={(e) => onChange({ ...service, title: e.target.value })} className="form-input text-sm" placeholder="Nimi" /></div>
    <div><label className="block text-sm font-medium mb-1">Kuvaus</label><textarea value={service.description} onChange={(e) => onChange({ ...service, description: e.target.value })} className="form-input text-sm" rows={3} /></div>
    <div><label className="block text-sm font-medium mb-1">Linkki palvelusivulle</label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">/</span>
        <input value={service.link_url || ''} onChange={(e) => onChange({ ...service, link_url: e.target.value })} className="form-input text-sm flex-1" placeholder="tasoitustyot-helsinki" />
      </div>
      <p className="text-xs text-gray-500 mt-1">Palvelusivun slug (esim. tasoitustyot-helsinki)</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className="block text-sm font-medium mb-1">Ikoni</label>
        <select value={service.icon} onChange={(e) => onChange({ ...service, icon: e.target.value })} className="form-input text-sm">
          <optgroup label="Perus">
            <option value="Building2">🏢 Rakennus</option>
            <option value="Layers">📚 Kerrokset</option>
            <option value="Paintbrush">🖌️ Sivellin</option>
          </optgroup>
          <optgroup label="Katto ja ulkopinnat">
            <option value="PanelTop">🏠 Katto</option>
            <option value="Sun">☀️ Aurinko/Ulko</option>
            <option value="Scaling">📐 Julkisivu</option>
            <option value="Fence">🚧 Aita</option>
            <option value="TreeDeciduous">🌳 Piha</option>
            <option value="Droplets">💧 Vesieristys</option>
            <option value="Wind">💨 Ilmastointi</option>
          </optgroup>
          <optgroup label="Sisustus">
            <option value="Sofa">🛋️ Sisustus</option>
            <option value="Armchair">🪑 Nojatuoli</option>
            <option value="Lamp">💡 Lamppu</option>
            <option value="LampCeiling">💡 Kattovalaisin</option>
            <option value="Wallpaper">🎨 Tapetti</option>
            <option value="Frame">🖼️ Kehys/Taulu</option>
            <option value="DoorOpen">🚪 Ovi (auki)</option>
            <option value="DoorClosed">🚪 Ovi (kiinni)</option>
            <option value="Sparkles">✨ Koristelu</option>
          </optgroup>
          <optgroup label="Työkalut">
            <option value="Hammer">🔨 Vasara</option>
            <option value="Wrench">🔧 Jakoavain</option>
            <option value="PaintBucket">🪣 Maaliämpäri</option>
            <option value="Brush">🖌️ Harja</option>
            <option value="Ruler">📏 Viivoitin</option>
            <option value="HardHat">⛑️ Kypärä</option>
            <option value="Construction">🚧 Rakennustyö</option>
            <option value="Warehouse">🏭 Varasto</option>
          </optgroup>
          <optgroup label="Muut">
            <option value="Square">◻️ Neliö</option>
            <option value="CircleDot">⭕ Ympyrä</option>
            <option value="LayoutGrid">📊 Ruudukko</option>
          </optgroup>
        </select>
      </div>
      <div><label className="block text-sm font-medium mb-1">Järjestys</label><input type="number" value={service.order} onChange={(e) => onChange({ ...service, order: parseInt(e.target.value) || 0 })} className="form-input text-sm" /></div>
    </div>
    <div><label className="block text-sm font-medium mb-1">Kuva</label><ImageUploadWithAlt currentImage={service.image_url} currentAlt={service.image_alt} onImageChange={(url) => onChange({ ...service, image_url: url })} onAltChange={(alt) => onChange({ ...service, image_alt: alt })} token={token} altPlaceholder="ALT-teksti (esim. Tasoitustyöt Helsinki)" /></div>
    <div className="flex gap-2"><button onClick={onSave} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Save size={14} />Tallenna</button><button onClick={onCancel} className="btn-secondary text-xs md:text-sm">Peruuta</button></div>
  </div>
);

const ReferenceForm = ({ reference, onChange, onSave, onCancel, token }) => (
  <div className="space-y-3 md:space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Projektin nimi *</label><input value={reference.name} onChange={(e) => onChange({ ...reference, name: e.target.value })} className="form-input text-sm" placeholder="Esim. Mehiläinen Ympyrätalo" /></div>
      <div><label className="block text-sm font-medium mb-1">Palvelutyyppi *</label><input value={reference.type} onChange={(e) => onChange({ ...reference, type: e.target.value })} className="form-input text-sm" placeholder="Esim. Tasoitus- ja maalaustyöt" /></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm font-medium mb-1">Pääurakoitsija</label><input value={reference.main_contractor || ""} onChange={(e) => onChange({ ...reference, main_contractor: e.target.value })} className="form-input text-sm" placeholder="Esim. NCC, Skanska, YIT" /></div>
      <div><label className="block text-sm font-medium mb-1">Sijainti</label><input value={reference.location || ""} onChange={(e) => onChange({ ...reference, location: e.target.value })} className="form-input text-sm" placeholder="Esim. Helsinki" /></div>
    </div>
    <div><label className="block text-sm font-medium mb-1">Kuvakuva (Kansi)</label><ImageUploadWithAlt currentImage={reference.cover_image_url} currentAlt={reference.cover_image_alt} onImageChange={(url) => onChange({ ...reference, cover_image_url: url })} onAltChange={(alt) => onChange({ ...reference, cover_image_alt: alt })} token={token} altPlaceholder="ALT-teksti (esim. Projektin nimi - Sijainti)" /></div>
    <div><label className="block text-sm font-medium mb-1">Lyhyt kuvaus</label><textarea value={reference.description || ""} onChange={(e) => onChange({ ...reference, description: e.target.value })} className="form-input text-sm" rows={2} placeholder="Lyhyt kuvaus projektista..." /></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div><label className="block text-sm font-medium mb-1">Vuosi</label><input value={reference.year || ""} onChange={(e) => onChange({ ...reference, year: e.target.value })} className="form-input text-sm" placeholder="2024" /></div>
      <div><label className="block text-sm font-medium mb-1">Järjestys</label><input type="number" value={reference.order} onChange={(e) => onChange({ ...reference, order: parseInt(e.target.value) || 0 })} className="form-input text-sm" /></div>
      <div className="flex items-center pt-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={reference.is_published !== false} onChange={(e) => onChange({ ...reference, is_published: e.target.checked })} className="w-4 h-4" />
          <span className="text-sm">Julkaistu</span>
        </label>
      </div>
    </div>
    <div className="flex gap-2 pt-2"><button onClick={onSave} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Save size={14} />Tallenna</button><button onClick={onCancel} className="btn-secondary text-xs md:text-sm">Peruuta</button></div>
  </div>
);

const PartnerForm = ({ partner, onChange, onSave, onCancel, token }) => (
  <div className="space-y-3 md:space-y-4">
    <div><label className="block text-sm font-medium mb-1">Logo *</label><ImageUpload currentImage={partner.image_url} onImageChange={(url) => onChange({ ...partner, image_url: url })} token={token} /></div>
    <p className="text-xs text-[#64748B]">Lataa logo (PNG tai SVG suositeltu, läpinäkyvä tausta toimii parhaiten)</p>
    <div className="flex gap-2"><button onClick={onSave} disabled={!partner.image_url} className="btn-primary text-xs md:text-sm flex items-center gap-1 disabled:opacity-50"><Save size={14} />Tallenna</button><button onClick={onCancel} className="btn-secondary text-xs md:text-sm">Peruuta</button></div>
  </div>
);

// FAQ Form Component
const FaqForm = ({ faq, onChange, onSave, onCancel, services = [] }) => (
  <div className="space-y-3 md:space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Kysymys *</label>
      <input 
        value={faq.question} 
        onChange={(e) => onChange({ ...faq, question: e.target.value })} 
        className="form-input text-sm" 
        placeholder="Esim: Mitä kotitalousvähennys tarkoittaa?" 
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Vastaus *</label>
      <textarea 
        value={faq.answer} 
        onChange={(e) => onChange({ ...faq, answer: e.target.value })} 
        className="form-input text-sm" 
        rows={4}
        placeholder="Kirjoita selkeä ja informatiivinen vastaus..."
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Palvelu (valinnainen)</label>
      <select 
        value={faq.service_id || ""} 
        onChange={(e) => onChange({ ...faq, service_id: e.target.value || null })}
        className="form-input text-sm"
      >
        <option value="">Yleinen (näkyy kaikilla sivuilla)</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>
      <p className="text-xs text-[#64748B] mt-1">Valitse palvelu, jos tämä FAQ liittyy tiettyyn palveluun</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Järjestys</label>
        <input 
          type="number" 
          value={faq.order || 0} 
          onChange={(e) => onChange({ ...faq, order: parseInt(e.target.value) || 0 })} 
          className="form-input text-sm" 
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tila</label>
        <select 
          value={faq.is_published !== false ? "true" : "false"} 
          onChange={(e) => onChange({ ...faq, is_published: e.target.value === "true" })}
          className="form-input text-sm"
        >
          <option value="true">Julkaistu</option>
          <option value="false">Piilotettu</option>
        </select>
      </div>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={onSave} 
        disabled={!faq.question || !faq.answer} 
        className="btn-primary text-xs md:text-sm flex items-center gap-1 disabled:opacity-50"
      >
        <Save size={14} />Tallenna
      </button>
      <button onClick={onCancel} className="btn-secondary text-xs md:text-sm">Peruuta</button>
    </div>
  </div>
);

// ========== HOME PAGE ==========
const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [references, setReferences] = useState([]);
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, servicesRes, refsRes, partnersRes] = await Promise.all([
          axios.get(`${API}/settings`),
          axios.get(`${API}/services`),
          axios.get(`${API}/references`),
          axios.get(`${API}/partners`)
        ]);
        const mergedSettings = { ...defaultSettings, ...settingsRes.data };
        setSettings(mergedSettings);
        setServices(servicesRes.data);
        setReferences(refsRes.data);
        setPartners(partnersRes.data);
        // Apply theme
        applyTheme(mergedSettings);
      } catch {
        setSettings(defaultSettings);
        applyTheme(defaultSettings);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Apply theme when settings change
  useEffect(() => {
    if (settings) {
      applyTheme(settings);
    }
  }, [settings?.theme_color, settings?.theme_font, settings?.theme_size, settings?.favicon_url]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      ["palvelut", "meista", "referenssit", "yhteystiedot"].forEach((section) => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) setActiveSection(section);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle scroll to hash on page load or navigation
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
          // Small delay to ensure page is fully rendered
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    // Run on initial load
    if (!isLoading) {
      scrollToHash();
    }

    // Listen for hash changes
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [isLoading]);

  // Show loading state until data is fetched
  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <img src={LOGO_URL} alt="J&B" className="h-16 mx-auto mb-4 animate-pulse" />
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <StructuredData settings={settings} />
      
      <Navbar isScrolled={isScrolled} activeSection={activeSection} logoUrl={settings.logo_url} />
      <main>
        <HeroSection settings={settings} />
        <ServicesSection settings={settings} services_data={services} />
        <AboutSection settings={settings} />
        <ReferencesSection settings={settings} references={references} />
        <LocationSection settings={settings} />
        <ContactSection settings={settings} />
      </main>
      <Footer logoUrl={settings.logo_url} settings={settings} />
    </>
  );
};

// ========== APP ==========
// GA4 Page Tracking Component
const GA4Tracker = () => {
  useGA4PageTracking();
  return null;
};

function App() {
  return (
    <div className="App" data-testid="app-container">
      <BrowserRouter>
        <GA4Tracker />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Admin panel - MUST be before catch-all route */}
          <Route path="/admin" element={<AdminPanel />} />
          {/* FAQ hub page */}
          <Route path="/ukk" element={<FaqHubPage />} />
          {/* References page - SEO dedicated page */}
          <Route path="/referenssit" element={<ReferencesPage />} />
          {/* Legacy route for old service URLs */}
          <Route path="/palvelut/:slug" element={<DynamicServicePage />} />
          {/* New SEO-friendly Finnish URLs - catch-all for service pages */}
          <Route path="/:slug" element={<DynamicServicePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export { Navbar, Footer };
export default App;
