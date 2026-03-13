// Dynamic Service Page - Polished Layout
// Visual balance improvements with consistent spacing

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Mail, MapPin, Menu, X, ChevronRight, ArrowRight, Send,
  CheckCircle, Clock, Shield, Award, Star,
  Paintbrush, Building2, Layers, Wrench, Droplets, Square, Sparkles, Frame
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/g1de58um_jb2-logo.png";

// Icon map
const iconMap = {
  Paintbrush, Building2, Layers, Wrench, Droplets, Square, Sparkles, Frame,
  CheckCircle, Clock, Shield, Award, Star
};

// Subtitle helper
const getSubtitleClasses = (settings) => {
  const sizeClass = { 'small': 'text-xs', 'normal': 'text-sm', 'large': 'text-base' }[settings?.subtitle_size || 'normal'] || 'text-sm';
  const weightClass = { 'normal': 'font-normal', 'medium': 'font-medium', 'bold': 'font-bold' }[settings?.subtitle_weight || 'normal'] || 'font-normal';
  const spacingClass = { 'normal': 'tracking-normal', 'wide': 'tracking-wide', 'wider': 'tracking-wider', 'widest': 'tracking-widest' }[settings?.subtitle_spacing || 'normal'] || 'tracking-normal';
  return `${sizeClass} ${weightClass} ${spacingClass}`;
};

const Subtitle = ({ children, settings, className = "", white = false }) => (
  <p className={`uppercase ${getSubtitleClasses(settings)} ${white ? 'text-white/60' : 'text-primary'} ${className}`}
     style={{ fontFamily: `"${settings?.subtitle_font || 'Inter'}", sans-serif` }}>
    {children}
  </p>
);

// ========== NAVBAR ==========
const Navbar = ({ isScrolled, settings }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logo = settings?.logo_url || LOGO_URL;
  
  const navLinks = [
    { href: "/#palvelut", label: "Palvelut" },
    { href: "/#meista", label: "Meistä" },
    { href: "/#referenssit", label: "Referenssit" },
    { href: "/#yhteystiedot", label: "Yhteystiedot" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "navbar-glass shadow-sm" : "bg-white/95 backdrop-blur-sm shadow-sm"}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="J&B Tasoitus ja Maalaus" className="h-10 md:h-12 w-auto max-w-[180px] object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="nav-link text-sm font-medium">{link.label}</Link>
            ))}
            <Link to="/#yhteystiedot" className="btn-primary text-sm py-2 px-4">Pyydä tarjous</Link>
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
                  <Link key={link.href} to={link.href} className="block px-4 py-3 nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
                ))}
                <div className="px-4 pt-2">
                  <Link to="/#yhteystiedot" className="btn-primary block text-center text-sm" onClick={() => setIsMobileMenuOpen(false)}>Pyydä tarjous</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// ========== HERO - Text width limited to 600px ==========
const ServiceHero = ({ page, settings }) => {
  const heroImage = page.hero_image_url || 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=1920';
  const phone = settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270';

  return (
    <section className="relative min-h-[55vh] md:min-h-[60vh] flex items-center pt-16">
      <div className="absolute inset-0">
        <img src={heroImage} alt={page.hero_title} className="w-full h-full object-cover" loading="eager" />
        <div className="hero-overlay absolute inset-0"></div>
      </div>
      <div className="container-custom relative z-10 py-10 md:py-16">
        {/* Breadcrumbs */}
        <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-[#64748B] mb-4 md:mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Etusivu</Link>
          <ChevronRight size={14} />
          <Link to="/#palvelut" className="hover:text-primary transition-colors">Palvelut</Link>
          <ChevronRight size={14} />
          <span className="text-[#0F172A] font-medium">{page.hero_title}</span>
        </motion.nav>

        {/* Text content limited to 600px */}
        <div className="max-w-[600px]">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`uppercase text-primary mb-2 md:mb-3 ${getSubtitleClasses(settings)}`}>
            PALVELUMME
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 leading-tight">
            {page.hero_title}
          </motion.h1>
          {page.hero_subtitle && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base md:text-lg text-[#64748B] mb-6 leading-relaxed">
              {page.hero_subtitle}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3">
            <a href="#tarjouspyynto" className="btn-primary inline-flex items-center justify-center gap-2 text-sm">
              Pyydä ilmainen arvio <ArrowRight size={16} />
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-secondary inline-flex items-center justify-center gap-2 text-sm">
              <Phone size={16} /> Soita nyt
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]">
              <CheckCircle size={16} className="text-primary" />
              <span>{settings?.trust_badge_3_title || 'Kotitalousvähennys'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]">
              <CheckCircle size={16} className="text-primary" />
              <span>{settings?.trust_badge_4_title || 'Tyytyväisyystakuu'}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== TRUST BADGES ==========
const TrustBadges = ({ settings }) => {
  const badges = [
    { icon: Clock, title: settings?.trust_badge_1_title || 'Vuodesta 2018', subtitle: settings?.trust_badge_1_subtitle || 'Luotettava kokemus' },
    { icon: Award, title: settings?.trust_badge_2_title || 'Ammattitaitoinen työ', subtitle: settings?.trust_badge_2_subtitle || 'Laadukas lopputulos' },
    { icon: Shield, title: settings?.trust_badge_3_title || 'Kotitalousvähennys', subtitle: settings?.trust_badge_3_subtitle || 'Hyödynnä veroetu' },
    { icon: Star, title: settings?.trust_badge_4_title || 'Tyytyväisyystakuu', subtitle: settings?.trust_badge_4_subtitle || '100% tyytyväisyys' }
  ];

  return (
    <section className="section-bg-alt py-5 md:py-6 border-b border-[#E2E8F0]">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3">
              <div className="icon-box flex-shrink-0 rounded-lg">
                <badge.icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-xs md:text-sm">{badge.title}</p>
                <p className="text-[#64748B] text-xs hidden md:block">{badge.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== DESCRIPTION - 45/55 split ==========
const DescriptionSection = ({ page, settings }) => (
  <section className="section-padding">
    <div className="container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Text - 45% (roughly 5/12) */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5">
          <Subtitle settings={settings} className="mb-2">PALVELUN KUVAUS</Subtitle>
          <h2 className="section-title mb-4">{page.description_title || 'Mitä tarjoamme'}</h2>
          <div className="text-sm md:text-base text-[#64748B] leading-relaxed space-y-4 prose prose-p:text-[#64748B] max-w-none"
               dangerouslySetInnerHTML={{ __html: page.description_text || '<p>Ammattitaitoista palvelua.</p>' }} />
        </motion.div>
        {/* Image - 55% (roughly 7/12) */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <img src={page.description_image_url || page.hero_image_url} alt={page.hero_title} className="w-full h-64 md:h-80 lg:h-96 object-cover" />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ========== FEATURES - Polished cards ==========
const FeaturesSection = ({ page, settings }) => {
  const features = page.features || [];
  if (features.length === 0) return null;

  return (
    <section className="section-padding section-bg-alt">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
          <Subtitle settings={settings} className="mb-2">PALVELUN SISÄLTÖ</Subtitle>
          <h2 className="section-title">{page.features_title || 'Mitä palvelu sisältää'}</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || CheckCircle;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                className="feature-card">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-1.5 text-sm md:text-base">{feature.title}</h3>
                <p className="text-[#64748B] text-xs md:text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ========== WHY CHOOSE - Soft benefits box ==========
const WhyChooseSection = ({ page, settings }) => {
  const defaultItems = settings?.why_choose_us || [
    'Ammattitaitoiset tekijät', 'Laadukkaat materiaalit', 'Selkeä hinnoittelu',
    'Nopea aikataulu', 'Siisti työnjälki', 'Kotitalousvähennys kelpaa'
  ];
  const items = page.why_items?.length > 0 ? page.why_items : defaultItems;

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Subtitle settings={settings} className="mb-2">MIKSI MEIDÄT</Subtitle>
            <h2 className="section-title mb-5">{page.why_title || 'Miksi valita J&B Tasoitus ja Maalaus'}</h2>
            <div className="space-y-2.5">
              {items.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}
                  className="why-item">
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-primary" />
                  </div>
                  <span className="text-[#0F172A] text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          {/* Soft benefits box */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="benefits-box">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-primary/20 rounded-xl flex items-center justify-center">
                <Shield size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">{settings?.trust_badge_3_title || 'Kotitalousvähennys'}</h3>
            </div>
            <p className="text-[#64748B] text-sm mb-4 leading-relaxed">
              Maalaus- ja tasoitustyöt luokitellaan kunnossapitotyöhön, joka oikeuttaa kotitalousvähennykseen.
            </p>
            <div className="bg-white/90 rounded-xl p-4 border border-primary/10 shadow-sm">
              <p className="text-[#0F172A] font-bold text-lg mb-0.5">Jopa 40% vähennys</p>
              <p className="text-[#64748B] text-sm">Työn osuudesta, max 2 250 €/vuosi</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== PROCESS - With connector lines ==========
const ProcessSection = ({ page, settings }) => {
  const steps = [
    { num: 1, title: settings?.process_step_1_title || 'Ilmainen arvio', desc: settings?.process_step_1_desc || 'Kartoitamme kohteen' },
    { num: 2, title: settings?.process_step_2_title || 'Tarjous', desc: settings?.process_step_2_desc || 'Selkeä kirjallinen tarjous' },
    { num: 3, title: settings?.process_step_3_title || 'Työn toteutus', desc: settings?.process_step_3_desc || 'Ammattitaitoinen toteutus' },
    { num: 4, title: settings?.process_step_4_title || 'Valmis lopputulos', desc: settings?.process_step_4_desc || 'Laaduntarkastus' }
  ];

  return (
    <section className="section-padding section-bg-alt">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
          <Subtitle settings={settings} className="mb-2">TYÖVAIHEET</Subtitle>
          <h2 className="section-title">{page.process_title || 'Näin projekti etenee'}</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}
              className="text-center relative group">
              {/* Connector line (hidden on mobile, visible on lg) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[55%] w-[90%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10"></div>
              )}
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-1 text-sm md:text-base">{step.title}</h3>
                <p className="text-[#64748B] text-xs md:text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== SERVICE AREAS - 60/40 split ==========
const ServiceAreasSection = ({ page, settings }) => {
  const areas = settings?.service_areas || ['Helsinki', 'Espoo', 'Vantaa', 'Kauniainen', 'Uusimaa'];
  const phone = settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270';
  const phone2 = settings?.company_phone_secondary || settings?.contact_phone_2 || '+358 40 029 8247';
  const email = settings?.company_email || settings?.contact_email || 'info@jbtasoitusmaalaus.fi';
  const address = settings?.company_address || settings?.contact_address || 'Sienitie 25, 00760 Helsinki';

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Areas - 60% (7/12) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-7">
            <Subtitle settings={settings} className="mb-2">TOIMIALUE</Subtitle>
            <h2 className="section-title mb-3">{page.areas_title || 'Palvelualueet'}</h2>
            <p className="text-[#64748B] text-sm mb-5">
              {page.areas_text || 'Palvelemme koko Uudenmaan alueella.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {areas.map((area, index) => (
                <span key={index} className="area-tag">
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
          {/* Contact card - 40% (5/12) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-5">
            <div className="contact-card">
              <h3 className="font-bold text-[#0F172A] mb-4 text-base">Yhteystiedot</h3>
              <div className="space-y-3">
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-[#64748B] hover:text-primary transition-colors group">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Puhelin</p>
                    <p className="font-medium text-[#0F172A] text-sm">{phone}</p>
                  </div>
                </a>
                <a href={`tel:${phone2.replace(/\s/g, '')}`} className="flex items-center gap-3 text-[#64748B] hover:text-primary transition-colors group">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Puhelin 2</p>
                    <p className="font-medium text-[#0F172A] text-sm">{phone2}</p>
                  </div>
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-[#64748B] hover:text-primary transition-colors group">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Sähköposti</p>
                    <p className="font-medium text-[#0F172A] text-sm">{email}</p>
                  </div>
                </a>
                <div className="flex items-start gap-3 text-[#64748B]">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Osoite</p>
                    <p className="font-medium text-[#0F172A] text-sm">{address}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== CONTACT FORM SECTION ==========
const ContactFormSection = ({ page, settings }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, subject: `Tarjouspyyntö: ${page.hero_title}` })
      });
      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch { setSubmitStatus('error'); }
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const phone = settings?.company_phone_primary || '+358 40 054 7270';
  const email = settings?.company_email || 'info@jbtasoitusmaalaus.fi';

  return (
    <section id="tarjouspyynto" className="cta-section py-10 md:py-14">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-white">
            <Subtitle settings={settings} white className="mb-2">OTA YHTEYTTÄ</Subtitle>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{page.cta_title || 'Pyydä ilmainen arvio'}</h2>
            <p className="text-white/80 mb-5 text-sm max-w-md leading-relaxed">
              {page.cta_text || 'Lähetä tarjouspyyntö ja vastaamme 24 tunnin sisällä.'}
            </p>
            <div className="space-y-2.5">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center"><Phone size={16} /></div>
                <span className="font-medium text-sm">{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center"><Mail size={16} /></div>
                <span className="font-medium text-sm">{email}</span>
              </a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xl">
              <h3 className="text-base font-bold text-[#0F172A] mb-4">Lähetä tarjouspyyntö</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Etunimi *" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="form-input text-sm py-2.5" />
                  <input type="text" placeholder="Sukunimi *" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="form-input text-sm py-2.5" />
                </div>
                <input type="email" placeholder="Sähköposti *" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="form-input text-sm py-2.5" />
                <input type="tel" placeholder="Puhelin" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="form-input text-sm py-2.5" />
                <textarea placeholder="Kerro projektistasi *" required rows={3} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="form-input text-sm resize-none py-2.5" />
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
                  {isSubmitting ? 'Lähetetään...' : (<>Lähetä viesti <Send size={14} /></>)}
                </button>
                {submitStatus === 'success' && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs">Kiitos! Otamme yhteyttä pian.</div>}
                {submitStatus === 'error' && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">Virhe. Yritä uudelleen.</div>}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== RELATED SERVICES - Project cards with images ==========
const RelatedServices = ({ allPages, currentSlug, settings }) => {
  const otherPages = allPages.filter(p => p.slug !== currentSlug).slice(0, 3);
  if (otherPages.length === 0) return null;

  return (
    <section className="section-padding section-bg-alt">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
          <Subtitle settings={settings} className="mb-2">MUUT PALVELUT</Subtitle>
          <h2 className="section-title">Tutustu myös muihin palveluihimme</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {otherPages.map((relPage, index) => (
            <motion.div key={relPage.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <Link to={`/${relPage.slug}`} className="project-card block h-full group">
                <div className="overflow-hidden">
                  <img src={relPage.hero_image_url || 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg'} alt={relPage.hero_title} />
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">Palvelu</p>
                  <h3 className="font-semibold text-[#0F172A] mb-1.5 text-sm md:text-base group-hover:text-primary transition-colors">{relPage.hero_title}</h3>
                  <p className="text-[#64748B] text-xs md:text-sm line-clamp-2 mb-2">{relPage.hero_subtitle}</p>
                  <span className="inline-flex items-center text-primary text-xs md:text-sm font-medium link-underline">Lue lisää <ArrowRight size={12} className="ml-1" /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== STRONG CTA BEFORE FOOTER ==========
const StrongCTA = ({ settings }) => {
  const phone = settings?.company_phone_primary || '+358 40 054 7270';
  
  return (
    <section className="cta-strong py-8 md:py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Valmis aloittamaan projektin?</h2>
          <p className="text-white/80 mb-5 max-w-lg mx-auto text-sm">Pyydä maksuton arvio ja saat selkeän tarjouksen ilman sitoumuksia.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#tarjouspyynto" className="inline-flex items-center justify-center gap-2 bg-white text-[#0F172A] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
              Pyydä tarjous <ArrowRight size={16} />
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
              <Phone size={16} /> {phone}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ========== FOOTER ==========
const Footer = ({ settings }) => {
  const logo = settings?.logo_url || LOGO_URL;
  const footerText = settings?.footer_text || 'Laatujohtajat vuodesta 2018';
  
  return (
    <footer className="footer-bg text-white py-8 md:py-10">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="J&B" className="h-8 md:h-10 w-auto max-w-[150px] object-contain" />
            <p className="text-white/60 text-xs md:text-sm">{footerText}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-white/60">
            <Link to="/#palvelut" className="hover:text-white">Palvelut</Link>
            <Link to="/#meista" className="hover:text-white">Meistä</Link>
            <Link to="/#referenssit" className="hover:text-white">Referenssit</Link>
            <Link to="/#yhteystiedot" className="hover:text-white">Yhteystiedot</Link>
          </div>
        </div>
        <div className="border-t border-white/10 mt-6 pt-6 text-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} {settings?.company_name || 'J&B Tasoitus ja Maalaus Oy'}</p>
        </div>
      </div>
    </footer>
  );
};

// ========== MAIN ==========
const DynamicServicePage = () => {
  const { slug } = useParams();
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const reservedSlugs = ['admin', 'api', 'static', 'assets'];
    if (reservedSlugs.includes(slug?.toLowerCase())) { setError('not_found'); setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const [settingsRes, pageRes, allPagesRes] = await Promise.all([
          fetch(`${API_URL}/api/settings`),
          fetch(`${API_URL}/api/service-pages/${slug}`),
          fetch(`${API_URL}/api/service-pages`)
        ]);
        if (!settingsRes.ok) throw new Error('Settings error');
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        if (settingsData.theme_color) document.documentElement.style.setProperty('--color-primary', settingsData.theme_color);
        if (!pageRes.ok) { setError('not_found'); setLoading(false); return; }
        const pageData = await pageRes.json();
        setPage(pageData);
        document.title = pageData.seo_title || 'J&B Tasoitus ja Maalaus';
        if (allPagesRes.ok) setAllPages(await allPagesRes.json());
      } catch (err) { setError('error'); }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (error || !page) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-4">Sivua ei löytynyt</h1>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">Takaisin etusivulle</Link>
      </div>
    </div>
  );

  return (
    <div className="App">
      <Navbar isScrolled={isScrolled} settings={settings} />
      <ServiceHero page={page} settings={settings} />
      <TrustBadges settings={settings} />
      <DescriptionSection page={page} settings={settings} />
      <FeaturesSection page={page} settings={settings} />
      <WhyChooseSection page={page} settings={settings} />
      {page.use_global_process !== false && <ProcessSection page={page} settings={settings} />}
      <ServiceAreasSection page={page} settings={settings} />
      <ContactFormSection page={page} settings={settings} />
      <RelatedServices allPages={allPages} currentSlug={slug} settings={settings} />
      <StrongCTA settings={settings} />
      <Footer settings={settings} />
    </div>
  );
};

export default DynamicServicePage;
