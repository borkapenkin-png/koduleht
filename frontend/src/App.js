import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { 
  Phone, Mail, MapPin, Menu, X, ChevronDown, Paintbrush, Building2, Layers,
  CheckCircle, ArrowRight, Send, Settings, LogOut, Plus, Trash2, Edit2, Save,
  MessageSquare, Briefcase, Upload, Award, Image as ImageIcon, Home, FileText, Users, Lock, Shield
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/g1de58um_jb2-logo.png";

const iconMap = { Building2, Layers, Paintbrush };

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
  contact_jobs_text: "Haluatko töihin? Lähetä CV ja saatekirje: info@jbtasoitusmaalaus.fi"
};

// ========== IMAGE UPLOAD ==========
const ImageUpload = ({ currentImage, onImageChange, token }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || "");

  useEffect(() => { setPreview(currentImage || ""); }, [currentImage]);

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
      const imageUrl = `${BACKEND_URL}${response.data.url}`;
      setPreview(imageUrl);
      onImageChange(imageUrl);
    } catch (error) { alert("Lataus epäonnistui"); }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {preview ? (
          <img src={preview} alt="Preview" className="w-16 h-12 object-cover border border-[#E2E8F0]" />
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

// ========== NAVBAR ==========
const Navbar = ({ isScrolled, activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    { href: "#palvelut", label: "Palvelut" },
    { href: "#meista", label: "Meistä" },
    { href: "#referenssit", label: "Referenssit" },
    { href: "#yhteystiedot", label: "Yhteystiedot" },
  ];

  return (
    <nav data-testid="navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "navbar-glass shadow-sm" : "bg-transparent"}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#" data-testid="logo-link"><img src={LOGO_URL} alt="J&B" className="h-10 md:h-12 w-auto" /></a>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-[#0056D2] ${activeSection === link.href.substring(1) ? "text-[#0056D2]" : "text-[#64748B]"}`}>{link.label}</a>
            ))}
            <a href="#yhteystiedot" className="btn-primary text-sm py-2 px-4">Pyydä tarjous</a>
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
                  <a key={link.href} href={link.href} className="block px-4 py-3 text-[#64748B] hover:text-[#0056D2] hover:bg-[#EBF3FF]" onClick={() => setIsMobileMenuOpen(false)}>{link.label}</a>
                ))}
                <div className="px-4 pt-2"><a href="#yhteystiedot" className="btn-primary block text-center text-sm" onClick={() => setIsMobileMenuOpen(false)}>Pyydä tarjous</a></div>
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
  return (
    <section data-testid="hero-section" className="relative min-h-[90vh] md:min-h-screen flex items-center pt-16">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Tausta" className="w-full h-full object-cover" />
        <div className="hero-overlay absolute inset-0"></div>
      </div>
      <div className="container-custom relative z-10 py-12 md:py-20">
        <div className="max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-slogan text-[#0056D2] text-base md:text-xl mb-3 md:mb-4">{s.hero_slogan}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-[#0F172A] mb-4 md:mb-6 leading-tight">
            {s.hero_title_1}<br /><span className="text-[#0056D2]">{s.hero_title_2}</span> {s.hero_title_3}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base md:text-lg text-[#64748B] mb-6 md:mb-8 max-w-xl leading-relaxed">{s.hero_description}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <a href="#yhteystiedot" className="btn-primary inline-flex items-center justify-center gap-2 text-sm md:text-base">Pyydä ilmainen arvio<ArrowRight size={18} /></a>
            <a href="#palvelut" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm md:text-base">Tutustu palveluihin<ChevronDown size={18} /></a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 md:mt-12 flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]"><CheckCircle size={16} className="text-[#0056D2]" /><span>{s.hero_badge_1}</span></div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]"><CheckCircle size={16} className="text-[#0056D2]" /><span>{s.hero_badge_2}</span></div>
          </motion.div>
        </div>
      </div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block">
        <ChevronDown size={32} className="text-[#0056D2] opacity-60" />
      </motion.div>
    </section>
  );
};

// ========== SERVICES ==========
const ServicesSection = ({ services }) => (
  <section id="palvelut" data-testid="services-section" className="section-padding bg-[#FAFAFA]">
    <div className="container-custom">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
        <p className="font-slogan text-[#0056D2] text-sm mb-2 md:mb-3">MITÄ TEEMME</p>
        <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A]">Palvelumme</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {services.map((service, index) => {
          const Icon = iconMap[service.icon] || Building2;
          return (
            <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="service-card group overflow-hidden">
              {service.image_url && (
                <div className="aspect-[16/10] overflow-hidden -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-4 md:mb-6">
                  <img src={service.image_url} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#EBF3FF] flex items-center justify-center"><Icon size={18} className="text-[#0056D2]" /></div>
                <h3 className="text-lg md:text-xl font-bold text-[#0F172A]">{service.title}</h3>
              </div>
              <p className="text-sm md:text-base text-[#64748B] leading-relaxed">{service.description}</p>
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
    <section id="meista" data-testid="about-section" className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative order-2 lg:order-1">
            <img src={aboutImage} alt="Työ" className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover" />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-[#0056D2] text-white p-4 md:p-6 hidden sm:block">
              <p className="font-slogan text-2xl md:text-3xl">{s.about_year}</p>
              <p className="text-xs md:text-sm opacity-80">vuodesta alkaen</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
            <p className="font-slogan text-[#0056D2] text-sm mb-2 md:mb-3">{s.about_subtitle}</p>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] mb-4 md:mb-6">{s.about_title}</h2>
            <div className="space-y-3 md:space-y-4 text-sm md:text-base text-[#64748B] leading-relaxed">
              <p>{s.about_text_1}</p>
              <p>{s.about_text_2}</p>
              <p>{s.about_text_3}</p>
            </div>
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-[#EBF3FF] border-l-4 border-[#0056D2]">
              <p className="font-medium text-[#0F172A] mb-2 text-sm md:text-base">{s.about_info_title}</p>
              <p className="text-xs md:text-sm text-[#64748B]">{s.about_info_text}</p>
              <a href="https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot-ja-vahennykset/kotitalousvahennys/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#0056D2] text-xs md:text-sm font-medium mt-2 hover:underline">Lue lisää<ArrowRight size={12} /></a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== REFERENCES ==========
const ReferencesSection = ({ references }) => (
  <section id="referenssit" data-testid="references-section" className="section-padding bg-white">
    <div className="container-custom">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
        <p className="font-slogan text-[#0056D2] text-sm mb-2 md:mb-3">TYÖNÄYTTEITÄ</p>
        <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A]">Referenssit</h2>
        <p className="text-sm md:text-base text-[#64748B] mt-3 md:mt-4 max-w-2xl mx-auto">Olemme toteuttaneet lukuisia projekteja yrityksille, taloyhtiöille ja yksityisille asiakkaille.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {references.map((ref, index) => (
          <motion.div key={ref.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-[#FAFAFA] border border-[#E2E8F0] p-4 md:p-6 hover:border-[#0056D2]/30 hover:shadow-md transition-all group">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0056D2] transition-colors">
                <Building2 size={18} className="text-[#0056D2] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#0F172A] group-hover:text-[#0056D2] transition-colors">{ref.name}</h3>
                <p className="text-xs md:text-sm text-[#0056D2] font-medium mt-1">{ref.type}</p>
                {ref.description && <p className="text-xs md:text-sm text-[#64748B] mt-2">{ref.description}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ========== QUALITY/PARTNERS ==========
const QualitySection = ({ partners }) => (
  <section data-testid="quality-section" className="section-padding bg-[#0056D2]">
    <div className="container-custom">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
        <p className="font-slogan text-white/60 text-sm mb-2 md:mb-3">MIKSI VALITA MEIDÄT</p>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 md:mb-12">Laatutakuu</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {partners.map((partner, index) => (
            <motion.div key={partner.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex flex-col items-center">
              {partner.image_url ? (
                <div className="w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-4 flex items-center justify-center">
                  <img src={partner.image_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 flex items-center justify-center mb-3 md:mb-4">
                  <CheckCircle size={24} className="text-white" />
                </div>
              )}
              <p className="text-white font-medium text-center text-xs md:text-base">{partner.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// ========== CONTACT ==========
const ContactSection = ({ settings }) => {
  const s = { ...defaultSettings, ...settings };
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitStatus("success");
      setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch { setSubmitStatus("error"); }
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  return (
    <section id="yhteystiedot" data-testid="contact-section" className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="font-slogan text-[#0056D2] text-sm mb-2 md:mb-3">{s.contact_subtitle}</p>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] mb-4 md:mb-6">{s.contact_title}</h2>
            <p className="text-sm md:text-base text-[#64748B] mb-6 md:mb-8">{s.contact_description}</p>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><MapPin size={18} className="text-[#0056D2]" /></div>
                <div><p className="font-medium text-[#0F172A] text-sm md:text-base">Päätoimisto</p><p className="text-[#64748B] text-sm">{s.contact_address}</p></div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Mail size={18} className="text-[#0056D2]" /></div>
                <div><p className="font-medium text-[#0F172A] text-sm md:text-base">Sähköposti</p><a href={`mailto:${s.contact_email}`} className="text-[#0056D2] hover:underline text-sm">{s.contact_email}</a></div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Phone size={18} className="text-[#0056D2]" /></div>
                <div>
                  <p className="font-medium text-[#0F172A] text-sm md:text-base">Puhelin</p>
                  <div className="text-[#64748B] space-y-1 text-sm">
                    <p>{s.contact_phone_1_name}: <a href={`tel:${s.contact_phone_1.replace(/\s/g, '')}`} className="text-[#0056D2] hover:underline">{s.contact_phone_1}</a></p>
                    <p>{s.contact_phone_2_name}: <a href={`tel:${s.contact_phone_2.replace(/\s/g, '')}`} className="text-[#0056D2] hover:underline">{s.contact_phone_2}</a></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-10 p-4 md:p-6 bg-[#FAFAFA] border border-[#E2E8F0]">
              <p className="font-medium text-[#0F172A] mb-2 text-sm md:text-base">{s.contact_jobs_title}</p>
              <p className="text-xs md:text-sm text-[#64748B]">{s.contact_jobs_text}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-[#FAFAFA] p-5 md:p-8 border border-[#E2E8F0]">
              <h3 className="text-lg md:text-xl font-bold text-[#0F172A] mb-4 md:mb-6">Lähetä tarjouspyyntö</h3>
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div><label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Etunimi *</label><input type="text" name="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required className="form-input text-sm" placeholder="Etunimi" /></div>
                  <div><label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Sukunimi *</label><input type="text" name="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required className="form-input text-sm" placeholder="Sukunimi" /></div>
                </div>
                <div><label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Sähköposti *</label><input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="form-input text-sm" placeholder="email@esimerkki.fi" /></div>
                <div><label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Puhelin</label><input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="form-input text-sm" placeholder="+358 40 123 4567" /></div>
                <div><label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Aihe</label><input type="text" name="subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="form-input text-sm" placeholder="Tarjouspyyntö" /></div>
                <div><label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Viesti *</label><textarea name="message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required rows={4} className="form-input text-sm resize-none" placeholder="Kerro projektistasi..." /></div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-60">{isSubmitting ? "Lähetetään..." : (<>Lähetä viesti<Send size={16} /></>)}</button>
                {submitStatus === "success" && <div className="p-3 md:p-4 bg-green-50 border border-green-200 text-green-800 text-xs md:text-sm">Kiitos viestistäsi!</div>}
                {submitStatus === "error" && <div className="p-3 md:p-4 bg-red-50 border border-red-200 text-red-800 text-xs md:text-sm">Lähetys epäonnistui.</div>}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== FOOTER ==========
const Footer = () => (
  <footer data-testid="footer" className="bg-[#0F172A] text-white py-8 md:py-12">
    <div className="container-custom">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={LOGO_URL} alt="J&B" className="h-8 md:h-10 w-auto" />
          <p className="text-white/60 text-xs md:text-sm">Laatujohtajat vuodesta 2018</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-white/60">
          <a href="#palvelut" className="hover:text-white">Palvelut</a>
          <a href="#meista" className="hover:text-white">Meistä</a>
          <a href="#referenssit" className="hover:text-white">Referenssit</a>
          <a href="#yhteystiedot" className="hover:text-white">Yhteystiedot</a>
          <Link to="/admin" className="hover:text-white flex items-center gap-1"><Settings size={12} />Admin</Link>
        </div>
      </div>
      <div className="border-t border-white/10 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-white/40">
        <p>© {new Date().getFullYear()} J&B Tasoitus ja Maalaus Oy</p>
      </div>
    </div>
  </footer>
);

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
      loadData(tokenToVerify);
    } catch {
      localStorage.removeItem('admin_token');
      setToken("");
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
    setLoading(true);
    const headers = { headers: { Authorization: `Bearer ${tokenToUse}` } };
    try {
      const [settingsRes, servicesRes, refsRes, partnersRes, contactsRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/services`),
        axios.get(`${API}/references`),
        axios.get(`${API}/partners`),
        axios.get(`${API}/admin/contacts`, headers)
      ]);
      setSettings({ ...defaultSettings, ...settingsRes.data });
      setServices(servicesRes.data);
      setReferences(refsRes.data);
      setPartners(partnersRes.data);
      setContacts(contactsRes.data);
    } catch (e) { 
      console.error(e);
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
      alert("Tallennettu!");
    } catch (error) { 
      if (error.response?.status === 401) handleLogout();
      else alert("Virhe tallennuksessa"); 
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
    } catch (error) { if (error.response?.status === 401) handleLogout(); }
  };
  const deleteService = async (id) => { if (window.confirm("Poista?")) { try { await axios.delete(`${API}/admin/services/${id}`, getAuthHeaders()); loadData(); } catch (error) { if (error.response?.status === 401) handleLogout(); } } };
  
  const saveReference = async (r) => {
    try {
      if (r.id && !r.isNew) await axios.put(`${API}/admin/references/${r.id}`, r, getAuthHeaders());
      else { const { isNew, ...d } = r; await axios.post(`${API}/admin/references`, d, getAuthHeaders()); }
      loadData(); setEditingItem(null); setNewItem(null);
    } catch (error) { if (error.response?.status === 401) handleLogout(); }
  };
  const deleteReference = async (id) => { if (window.confirm("Poista?")) { try { await axios.delete(`${API}/admin/references/${id}`, getAuthHeaders()); loadData(); } catch (error) { if (error.response?.status === 401) handleLogout(); } } };

  const savePartner = async (p) => {
    try {
      if (p.id && !p.isNew) await axios.put(`${API}/admin/partners/${p.id}`, p, getAuthHeaders());
      else { const { isNew, ...d } = p; await axios.post(`${API}/admin/partners`, d, getAuthHeaders()); }
      loadData(); setEditingItem(null); setNewItem(null);
    } catch (error) { if (error.response?.status === 401) handleLogout(); }
  };
  const deletePartner = async (id) => { if (window.confirm("Poista?")) { try { await axios.delete(`${API}/admin/partners/${id}`, getAuthHeaders()); loadData(); } catch (error) { if (error.response?.status === 401) handleLogout(); } } };

  const deleteContact = async (id) => { if (window.confirm("Poista?")) { try { await axios.delete(`${API}/admin/contacts/${id}`, getAuthHeaders()); loadData(); } catch (error) { if (error.response?.status === 401) handleLogout(); } } };

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
          <Link to="/" className="block text-center text-sm text-[#64748B] mt-4 hover:text-[#0056D2]">← Etusivulle</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "settings", label: "Sivusto", icon: Home },
    { id: "services", label: "Palvelut", icon: Briefcase },
    { id: "references", label: "Referenssit", icon: Building2 },
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
            <Link to="/" className="text-xs md:text-sm text-[#64748B] hover:text-[#0056D2]">Sivusto</Link>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs md:text-sm text-[#64748B] hover:text-red-600"><LogOut size={14} />Ulos</button>
          </div>
        </div>
      </header>

      <div className="container-custom py-4 md:py-8">
        <div className="flex gap-1 md:gap-2 mb-6 md:mb-8 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditingItem(null); setNewItem(null); }} className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3 font-medium text-xs md:text-sm border-b-2 -mb-px whitespace-nowrap ${activeTab === tab.id ? "border-[#0056D2] text-[#0056D2]" : "border-transparent text-[#64748B]"}`}>
              <tab.icon size={16} />{tab.label}
              {tab.id === "contacts" && contacts.length > 0 && <span className="bg-[#0056D2] text-white text-xs px-1.5 py-0.5 rounded-full">{contacts.length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0056D2]"></div></div>
        ) : (
          <>
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
                {newItem && <div className="bg-white border border-[#0056D2] p-4 md:p-6 mb-4"><h3 className="font-bold mb-4">Uusi palvelu</h3><ServiceForm service={newItem} onChange={setNewItem} onSave={() => saveService(newItem)} onCancel={() => setNewItem(null)} token={token} /></div>}
                <div className="space-y-3 md:space-y-4">
                  {services.map((s) => (
                    <div key={s.id} className="bg-white border p-4 md:p-6">
                      {editingItem?.id === s.id ? <ServiceForm service={editingItem} onChange={setEditingItem} onSave={() => saveService(editingItem)} onCancel={() => setEditingItem(null)} token={token} /> : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {s.image_url && <img src={s.image_url} alt={s.title} className="w-16 md:w-24 h-12 md:h-16 object-cover" />}
                            <div><h3 className="font-bold text-sm md:text-base">{s.title}</h3><p className="text-xs md:text-sm text-[#64748B] mt-1 line-clamp-2">{s.description}</p></div>
                          </div>
                          <div className="flex gap-1"><button onClick={() => setEditingItem(s)} className="p-2 text-[#64748B] hover:text-[#0056D2]"><Edit2 size={16} /></button><button onClick={() => deleteService(s.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 size={16} /></button></div>
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
                  <h2 className="text-lg md:text-xl font-bold">Referenssit ({references.length})</h2>
                  <button onClick={() => setNewItem({ name: "", type: "Tasoitus- ja maalaustyöt", description: "", order: references.length + 1, isNew: true })} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Plus size={14} />Lisää</button>
                </div>
                {newItem && <div className="bg-white border border-[#0056D2] p-4 md:p-6 mb-4"><h3 className="font-bold mb-4">Uusi referenssi</h3><ReferenceForm reference={newItem} onChange={setNewItem} onSave={() => saveReference(newItem)} onCancel={() => setNewItem(null)} /></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {references.map((r) => (
                    <div key={r.id} className="bg-white border p-4 md:p-6">
                      {editingItem?.id === r.id ? <ReferenceForm reference={editingItem} onChange={setEditingItem} onSave={() => saveReference(editingItem)} onCancel={() => setEditingItem(null)} /> : (
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-bold text-sm md:text-base">{r.name}</h3><p className="text-xs md:text-sm text-[#0056D2]">{r.type}</p>{r.description && <p className="text-xs text-[#64748B] mt-1">{r.description}</p>}</div>
                          <div className="flex gap-1"><button onClick={() => setEditingItem(r)} className="p-2 text-[#64748B] hover:text-[#0056D2]"><Edit2 size={16} /></button><button onClick={() => deleteReference(r.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 size={16} /></button></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PARTNERS TAB */}
            {activeTab === "partners" && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <div><h2 className="text-lg md:text-xl font-bold">Laatutakuu ({partners.length})</h2><p className="text-xs md:text-sm text-[#64748B] mt-1">Kumppanit ja sertifikaatit</p></div>
                  <button onClick={() => setNewItem({ name: "", image_url: "", order: partners.length + 1, isNew: true })} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Plus size={14} />Lisää</button>
                </div>
                {newItem && <div className="bg-white border border-[#0056D2] p-4 md:p-6 mb-4"><h3 className="font-bold mb-4">Uusi</h3><PartnerForm partner={newItem} onChange={setNewItem} onSave={() => savePartner(newItem)} onCancel={() => setNewItem(null)} token={token} /></div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {partners.map((p) => (
                    <div key={p.id} className="bg-white border p-4 md:p-6">
                      {editingItem?.id === p.id ? <PartnerForm partner={editingItem} onChange={setEditingItem} onSave={() => savePartner(editingItem)} onCancel={() => setEditingItem(null)} token={token} /> : (
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {p.image_url ? <img src={p.image_url} alt={p.name} className="w-12 h-12 object-contain" /> : <div className="w-12 h-12 bg-[#EBF3FF] flex items-center justify-center"><Award size={20} className="text-[#0056D2]" /></div>}
                            <div><h3 className="font-bold text-sm md:text-base">{p.name}</h3></div>
                          </div>
                          <div className="flex gap-1"><button onClick={() => setEditingItem(p)} className="p-2 text-[#64748B] hover:text-[#0056D2]"><Edit2 size={16} /></button><button onClick={() => deletePartner(p.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 size={16} /></button></div>
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
                            <p className="text-xs md:text-sm text-[#0056D2]">{c.email}</p>
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
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2"><Shield size={20} className="text-[#0056D2]" />Turvallisuusasetukset</h2>
                
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
    <div className="grid grid-cols-2 gap-3">
      <div><label className="block text-sm font-medium mb-1">Ikoni</label><select value={service.icon} onChange={(e) => onChange({ ...service, icon: e.target.value })} className="form-input text-sm"><option value="Building2">Rakennus</option><option value="Layers">Kerrokset</option><option value="Paintbrush">Sivellin</option></select></div>
      <div><label className="block text-sm font-medium mb-1">Järjestys</label><input type="number" value={service.order} onChange={(e) => onChange({ ...service, order: parseInt(e.target.value) || 0 })} className="form-input text-sm" /></div>
    </div>
    <div><label className="block text-sm font-medium mb-1">Kuva</label><ImageUpload currentImage={service.image_url} onImageChange={(url) => onChange({ ...service, image_url: url })} token={token} /></div>
    <div className="flex gap-2"><button onClick={onSave} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Save size={14} />Tallenna</button><button onClick={onCancel} className="btn-secondary text-xs md:text-sm">Peruuta</button></div>
  </div>
);

const ReferenceForm = ({ reference, onChange, onSave, onCancel }) => (
  <div className="space-y-3 md:space-y-4">
    <div><label className="block text-sm font-medium mb-1">Nimi</label><input value={reference.name} onChange={(e) => onChange({ ...reference, name: e.target.value })} className="form-input text-sm" /></div>
    <div><label className="block text-sm font-medium mb-1">Tyyppi</label><input value={reference.type} onChange={(e) => onChange({ ...reference, type: e.target.value })} className="form-input text-sm" /></div>
    <div><label className="block text-sm font-medium mb-1">Kuvaus</label><textarea value={reference.description || ""} onChange={(e) => onChange({ ...reference, description: e.target.value })} className="form-input text-sm" rows={2} /></div>
    <div><label className="block text-sm font-medium mb-1">Järjestys</label><input type="number" value={reference.order} onChange={(e) => onChange({ ...reference, order: parseInt(e.target.value) || 0 })} className="form-input text-sm" /></div>
    <div className="flex gap-2"><button onClick={onSave} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Save size={14} />Tallenna</button><button onClick={onCancel} className="btn-secondary text-xs md:text-sm">Peruuta</button></div>
  </div>
);

const PartnerForm = ({ partner, onChange, onSave, onCancel, token }) => (
  <div className="space-y-3 md:space-y-4">
    <div><label className="block text-sm font-medium mb-1">Nimi</label><input value={partner.name} onChange={(e) => onChange({ ...partner, name: e.target.value })} className="form-input text-sm" placeholder="Luotettava kumppani" /></div>
    <div><label className="block text-sm font-medium mb-1">Logo</label><ImageUpload currentImage={partner.image_url} onImageChange={(url) => onChange({ ...partner, image_url: url })} token={token} /></div>
    <div><label className="block text-sm font-medium mb-1">Järjestys</label><input type="number" value={partner.order} onChange={(e) => onChange({ ...partner, order: parseInt(e.target.value) || 0 })} className="form-input text-sm" /></div>
    <div className="flex gap-2"><button onClick={onSave} className="btn-primary text-xs md:text-sm flex items-center gap-1"><Save size={14} />Tallenna</button><button onClick={onCancel} className="btn-secondary text-xs md:text-sm">Peruuta</button></div>
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
        setSettings({ ...defaultSettings, ...settingsRes.data });
        setServices(servicesRes.data);
        setReferences(refsRes.data);
        setPartners(partnersRes.data);
      } catch {
        setSettings(defaultSettings);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

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

  // Show loading state until data is fetched
  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <img src={LOGO_URL} alt="J&B" className="h-16 mx-auto mb-4 animate-pulse" />
          <div className="w-8 h-8 border-2 border-[#0056D2] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar isScrolled={isScrolled} activeSection={activeSection} />
      <main>
        <HeroSection settings={settings} />
        <ServicesSection services={services} />
        <AboutSection settings={settings} />
        <ReferencesSection references={references} />
        <QualitySection partners={partners} />
        <ContactSection settings={settings} />
      </main>
      <Footer />
    </>
  );
};

// ========== APP ==========
function App() {
  return (
    <div className="App" data-testid="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
