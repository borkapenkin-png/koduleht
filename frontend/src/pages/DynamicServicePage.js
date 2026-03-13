// Dynamic Service Page - Redesigned to match Homepage style
// Uses identical styling, components, and layout as the main website

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Mail, MapPin, Menu, X, ChevronDown, ChevronRight, ArrowRight, Send,
  CheckCircle, Clock, Shield, Award, Star, Settings,
  Paintbrush, Building2, Layers, Wrench, Droplets, Square, Sparkles, Frame
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LOGO_URL = "https://jbtasoitusmaalaus.fi/wp-content/uploads/2024/12/jb-tasoitusmaalaus-horizontal-logo2.png";

// Icon map for features
const iconMap = {
  Paintbrush, Building2, Layers, Wrench, Droplets, Square, Sparkles, Frame,
  CheckCircle, Clock, Shield, Award, Star
};

// Helper to get subtitle classes from settings (same as homepage)
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

// Subtitle component (same as homepage)
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

// ========== NAVBAR (Same as homepage) ==========
const Navbar = ({ isScrolled, logoUrl, settings }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logo = logoUrl || settings?.logo_url || LOGO_URL;
  
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
              <Link key={link.href} to={link.href} className="nav-link text-sm font-medium transition-colors">{link.label}</Link>
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

// ========== HERO SECTION (Same style as homepage) ==========
const ServiceHero = ({ page, settings }) => {
  const subtitleClasses = getSubtitleClasses(settings);
  const subtitleFont = settings?.subtitle_font || 'Inter';
  const heroImage = page.hero_image_url || 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=1920';
  const phone = settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270';

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center pt-16">
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt={page.hero_title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="hero-overlay absolute inset-0"></div>
      </div>
      <div className="container-custom relative z-10 py-12 md:py-20">
        {/* Breadcrumbs */}
        <motion.nav 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-[#64748B] mb-6"
        >
          <Link to="/" className="hover:text-primary transition-colors">Etusivu</Link>
          <ChevronRight size={14} />
          <Link to="/#palvelut" className="hover:text-primary transition-colors">Palvelut</Link>
          <ChevronRight size={14} />
          <span className="text-[#0F172A] font-medium">{page.hero_title}</span>
        </motion.nav>

        <div className="max-w-2xl">
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`uppercase text-primary mb-3 md:mb-4 ${subtitleClasses}`}
            style={{ fontFamily: `"${subtitleFont}", sans-serif` }}
          >
            PALVELUMME
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-4 md:mb-6 leading-tight"
          >
            {page.hero_title}
          </motion.h1>
          {page.hero_subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }} 
              className="text-base md:text-lg text-[#64748B] mb-6 md:mb-8 max-w-xl leading-relaxed"
            >
              {page.hero_subtitle}
            </motion.p>
          )}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="flex flex-col sm:flex-row gap-3 md:gap-4"
          >
            <a href="#tarjouspyynto" className="btn-primary inline-flex items-center justify-center gap-2 text-sm md:text-base">
              Pyydä ilmainen arvio
              <ArrowRight size={18} />
            </a>
            <a 
              href={`tel:${phone.replace(/\s/g, '')}`} 
              className="btn-secondary inline-flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Phone size={18} />
              Soita nyt
            </a>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }} 
            className="mt-8 md:mt-12 flex flex-wrap items-center gap-4 md:gap-8"
          >
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

// ========== TRUST BADGES (Same as homepage would have) ==========
const TrustBadges = ({ settings }) => {
  const badges = [
    { icon: Clock, title: settings?.trust_badge_1_title || 'Vuodesta 2018', subtitle: settings?.trust_badge_1_subtitle || 'Luotettava kokemus' },
    { icon: Award, title: settings?.trust_badge_2_title || 'Ammattitaitoinen työ', subtitle: settings?.trust_badge_2_subtitle || 'Laadukas lopputulos' },
    { icon: Shield, title: settings?.trust_badge_3_title || 'Kotitalousvähennys', subtitle: settings?.trust_badge_3_subtitle || 'Hyödynnä veroetu' },
    { icon: Star, title: settings?.trust_badge_4_title || 'Tyytyväisyystakuu', subtitle: settings?.trust_badge_4_subtitle || '100% tyytyväisyys' }
  ];

  return (
    <section className="section-bg-alt py-6 md:py-8 border-b border-[#E2E8F0]">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 md:gap-4"
            >
              <div className="icon-box flex-shrink-0">
                <badge.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-xs md:text-sm">{badge.title}</p>
                <p className="text-[#64748B] text-xs">{badge.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== SERVICE DESCRIPTION SECTION ==========
const DescriptionSection = ({ page, settings }) => (
  <section className="section-padding">
    <div className="container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Subtitle settings={settings} className="mb-2 md:mb-3">PALVELUN KUVAUS</Subtitle>
          <h2 className="section-title mb-4 md:mb-6">{page.description_title || 'Mitä tarjoamme'}</h2>
          <div 
            className="text-sm md:text-base text-[#64748B] leading-relaxed space-y-4 prose prose-p:text-[#64748B] max-w-none"
            dangerouslySetInnerHTML={{ __html: page.description_text || '<p>Ammattitaitoista palvelua koko Uudenmaan alueella.</p>' }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          {page.description_image_url ? (
            <img 
              src={page.description_image_url} 
              alt={page.hero_title}
              className="w-full h-64 md:h-80 object-cover rounded-none shadow-lg"
            />
          ) : page.hero_image_url && (
            <img 
              src={page.hero_image_url} 
              alt={page.hero_title}
              className="w-full h-64 md:h-80 object-cover rounded-none shadow-lg"
            />
          )}
        </motion.div>
      </div>
    </div>
  </section>
);

// ========== FEATURES SECTION ==========
const FeaturesSection = ({ page, settings }) => {
  const features = page.features || [];
  if (features.length === 0) return null;

  return (
    <section className="section-padding section-bg-alt">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-10 md:mb-16"
        >
          <Subtitle settings={settings} className="mb-2 md:mb-3">PALVELUN SISÄLTÖ</Subtitle>
          <h2 className="section-title">{page.features_title || 'Mitä palvelu sisältää'}</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || CheckCircle;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="service-card p-5 md:p-6"
              >
                <div className="icon-box mb-4">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2 text-sm md:text-base">{feature.title}</h3>
                <p className="text-[#64748B] text-xs md:text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ========== WHY CHOOSE US SECTION ==========
const WhyChooseSection = ({ page, settings }) => {
  const defaultItems = settings?.why_choose_us || [
    'Ammattitaitoiset ja kokeneet tekijät',
    'Laadukkaat materiaalit ja työvälineet',
    'Selkeä ja läpinäkyvä hinnoittelu',
    'Nopea aikataulu ja joustava palvelu',
    'Siisti ja huolellinen työnjälki',
    'Kotitalousvähennys kelpaa'
  ];
  const items = page.why_items?.length > 0 ? page.why_items : defaultItems;

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Subtitle settings={settings} className="mb-2 md:mb-3">MIKSI MEIDÄT</Subtitle>
            <h2 className="section-title mb-6 md:mb-8">{page.why_title || 'Miksi valita J&B Tasoitus ja Maalaus'}</h2>
            <div className="space-y-3 md:space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-primary" />
                  </div>
                  <span className="text-[#0F172A] text-sm md:text-base">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 p-6 md:p-10 border border-primary/10"
          >
            <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-4">
              {settings?.trust_badge_3_title || 'Kotitalousvähennys'}
            </h3>
            <p className="text-[#64748B] text-sm md:text-base mb-4">
              Maalaus luokitellaan kunnossapitotyöhön, joka oikeuttaa kotitalousvähennykseen. 
              Voit vähentää työn osuudesta jopa 40%, enintään 2 250 euroa vuodessa.
            </p>
            <p className="text-[#64748B] text-sm">
              Autamme mielellämme kotitalousvähennyksen hyödyntämisessä.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== PROCESS SECTION ==========
const ProcessSection = ({ page, settings }) => {
  const steps = [
    { 
      num: 1, 
      title: settings?.process_step_1_title || 'Ilmainen arvio', 
      desc: settings?.process_step_1_desc || 'Kartoitamme kohteen ja tarpeet' 
    },
    { 
      num: 2, 
      title: settings?.process_step_2_title || 'Tarjous', 
      desc: settings?.process_step_2_desc || 'Saat selkeän kirjallisen tarjouksen' 
    },
    { 
      num: 3, 
      title: settings?.process_step_3_title || 'Työn toteutus', 
      desc: settings?.process_step_3_desc || 'Ammattitaitoinen toteutus sovitusti' 
    },
    { 
      num: 4, 
      title: settings?.process_step_4_title || 'Valmis lopputulos', 
      desc: settings?.process_step_4_desc || 'Tarkistamme yhdessä työn laadun' 
    }
  ];

  return (
    <section className="section-padding section-bg-alt">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-10 md:mb-16"
        >
          <Subtitle settings={settings} className="mb-2 md:mb-3">TYÖVAIHEET</Subtitle>
          <h2 className="section-title">{page.process_title || 'Näin projekti etenee'}</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center relative"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl md:text-2xl font-bold shadow-lg">
                {step.num}
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-primary/20"></div>
              )}
              <h3 className="font-semibold text-[#0F172A] mb-2 text-sm md:text-base">{step.title}</h3>
              <p className="text-[#64748B] text-xs md:text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== SERVICE AREAS SECTION ==========
const ServiceAreasSection = ({ page, settings }) => {
  const areas = settings?.service_areas || ['Helsinki', 'Espoo', 'Vantaa', 'Kauniainen', 'Uusimaa'];

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Subtitle settings={settings} className="mb-2 md:mb-3">TOIMIALUE</Subtitle>
            <h2 className="section-title mb-4 md:mb-6">{page.areas_title || 'Palvelualueet'}</h2>
            <p className="text-[#64748B] text-sm md:text-base mb-6">
              {page.areas_text || 'Palvelemme yksityisasiakkaita, yrityksiä ja taloyhtiöitä koko Uudenmaan alueella.'}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {areas.map((area, index) => (
                <span 
                  key={index}
                  className="bg-primary/5 border border-primary/10 px-3 md:px-4 py-1.5 md:py-2 text-[#0F172A] text-xs md:text-sm font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#FAFAFA] border border-[#E2E8F0] p-6 md:p-8"
          >
            <h3 className="font-bold text-[#0F172A] mb-4 text-base md:text-lg">Yhteystiedot</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-[#64748B] text-sm">{settings?.company_address || settings?.contact_address || 'Sienitie 25, 00760 Helsinki'}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <a href={`tel:${(settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270').replace(/\s/g, '')}`} className="text-primary hover:underline block">
                    {settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270'}
                  </a>
                  <a href={`tel:${(settings?.company_phone_secondary || settings?.contact_phone_2 || '+358 40 029 8247').replace(/\s/g, '')}`} className="text-primary hover:underline block">
                    {settings?.company_phone_secondary || settings?.contact_phone_2 || '+358 40 029 8247'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <a href={`mailto:${settings?.company_email || settings?.contact_email || 'info@jbtasoitusmaalaus.fi'}`} className="text-primary hover:underline text-sm">
                  {settings?.company_email || settings?.contact_email || 'info@jbtasoitusmaalaus.fi'}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== CONTACT/CTA SECTION ==========
const ContactCTASection = ({ page, settings }) => {
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
        body: JSON.stringify({
          ...formData,
          subject: `Tarjouspyyntö: ${page.hero_title}`
        })
      });
      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch {
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  return (
    <section id="tarjouspyynto" className="cta-section py-12 md:py-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <Subtitle settings={settings} white className="mb-2 md:mb-3">OTA YHTEYTTÄ</Subtitle>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              {page.cta_title || 'Pyydä ilmainen arvio'}
            </h2>
            <p className="text-white/80 mb-6 md:mb-8 text-sm md:text-base max-w-lg">
              {page.cta_text || 'Lähetä tarjouspyyntö tai pyydä meidät ilmaiselle arviokäynnille. Vastaamme 24 tunnin sisällä.'}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Puhelin</p>
                  <a href={`tel:${(settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270').replace(/\s/g, '')}`} className="text-white font-medium hover:underline text-sm md:text-base">
                    {settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270'}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Mail size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Sähköposti</p>
                  <a href={`mailto:${settings?.company_email || settings?.contact_email || 'info@jbtasoitusmaalaus.fi'}`} className="text-white font-medium hover:underline text-sm md:text-base">
                    {settings?.company_email || settings?.contact_email || 'info@jbtasoitusmaalaus.fi'}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-5 md:p-8 shadow-xl">
              <h3 className="text-lg md:text-xl font-bold text-[#0F172A] mb-4 md:mb-6">Lähetä tarjouspyyntö</h3>
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Etunimi *</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required 
                      className="form-input text-sm" 
                      placeholder="Etunimi" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Sukunimi *</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required 
                      className="form-input text-sm" 
                      placeholder="Sukunimi" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Sähköposti *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                    className="form-input text-sm" 
                    placeholder="email@esimerkki.fi" 
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Puhelin</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input text-sm" 
                    placeholder="+358 40 123 4567" 
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-[#0F172A] mb-1 md:mb-2">Viesti *</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required 
                    rows={4} 
                    className="form-input text-sm resize-none" 
                    placeholder="Kerro projektistasi..." 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                >
                  {isSubmitting ? 'Lähetetään...' : (<>Lähetä viesti<Send size={16} /></>)}
                </button>
                {submitStatus === 'success' && (
                  <div className="p-3 md:p-4 bg-green-50 border border-green-200 text-green-800 text-xs md:text-sm">
                    Kiitos viestistäsi! Otamme yhteyttä pian.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-3 md:p-4 bg-red-50 border border-red-200 text-red-800 text-xs md:text-sm">
                    Lähetys epäonnistui. Yritä uudelleen.
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== FOOTER (Same as homepage) ==========
const Footer = ({ settings }) => {
  const logo = settings?.logo_url || LOGO_URL;
  const footerText = settings?.footer_text || 'Laatujohtajat vuodesta 2018';
  
  return (
    <footer className="footer-bg text-white py-8 md:py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <img src={logo} alt="J&B" className="h-8 md:h-10 w-auto max-w-[150px] object-contain" />
            <p className="text-white/60 text-xs md:text-sm">{footerText}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-white/60">
            <Link to="/#palvelut" className="hover:text-white">Palvelut</Link>
            <Link to="/#meista" className="hover:text-white">Meistä</Link>
            <Link to="/#referenssit" className="hover:text-white">Referenssit</Link>
            <Link to="/#yhteystiedot" className="hover:text-white">Yhteystiedot</Link>
            <Link to="/admin" className="hover:text-white flex items-center gap-1"><Settings size={12} />Admin</Link>
          </div>
        </div>
        <div className="border-t border-white/10 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-white/40">
          <p>© {new Date().getFullYear()} {settings?.company_name || 'J&B Tasoitus ja Maalaus Oy'}</p>
        </div>
      </div>
    </footer>
  );
};

// ========== RELATED SERVICES ==========
const RelatedServices = ({ allPages, currentSlug, settings }) => {
  const otherPages = allPages.filter(p => p.slug !== currentSlug).slice(0, 3);
  if (otherPages.length === 0) return null;

  return (
    <section className="section-padding section-bg-alt">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-10 md:mb-16"
        >
          <Subtitle settings={settings} className="mb-2 md:mb-3">MUUT PALVELUT</Subtitle>
          <h2 className="section-title">Tutustu myös muihin palveluihimme</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {otherPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/${page.slug}`}
                className="service-card group overflow-hidden h-full flex flex-col"
              >
                {page.hero_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={page.hero_image_url} 
                      alt={page.hero_title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4 md:p-6 flex-grow">
                  <h3 className="font-semibold text-[#0F172A] mb-2 text-sm md:text-base group-hover:text-primary transition-colors">
                    {page.hero_title}
                  </h3>
                  <p className="text-[#64748B] text-xs md:text-sm line-clamp-2">{page.hero_subtitle}</p>
                  <span className="mt-3 md:mt-4 inline-flex items-center text-primary text-xs md:text-sm font-medium">
                    Lue lisää <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== MAIN COMPONENT ==========
const DynamicServicePage = () => {
  const { slug } = useParams();
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch data
  useEffect(() => {
    // Don't try to load reserved routes as service pages
    const reservedSlugs = ['admin', 'api', 'static', 'assets'];
    if (reservedSlugs.includes(slug?.toLowerCase())) {
      setError('not_found');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [settingsRes, pageRes, allPagesRes] = await Promise.all([
          fetch(`${API_URL}/api/settings`),
          fetch(`${API_URL}/api/service-pages/${slug}`),
          fetch(`${API_URL}/api/service-pages`)
        ]);

        if (!settingsRes.ok) throw new Error('Failed to fetch settings');
        const settingsData = await settingsRes.json();
        setSettings(settingsData);

        // Apply theme
        if (settingsData.theme_color) {
          document.documentElement.style.setProperty('--color-primary', settingsData.theme_color);
        }

        if (!pageRes.ok) {
          setError('not_found');
          return;
        }
        const pageData = await pageRes.json();
        setPage(pageData);

        // Set page title
        document.title = pageData.seo_title || `${pageData.hero_title} | J&B Tasoitus ja Maalaus`;

        if (allPagesRes.ok) {
          const allPagesData = await allPagesRes.json();
          setAllPages(allPagesData);
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('error');
      }
      setLoading(false);
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error === 'not_found' || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-4">Sivua ei löytynyt</h1>
          <p className="text-[#64748B] mb-6">Etsimääsi palvelusivua ei löytynyt.</p>
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center gap-2"
          >
            Takaisin etusivulle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar isScrolled={isScrolled} settings={settings} />
      <ServiceHero page={page} settings={settings} />
      <TrustBadges settings={settings} />
      <DescriptionSection page={page} settings={settings} />
      <FeaturesSection page={page} settings={settings} />
      <WhyChooseSection page={page} settings={settings} />
      {page.use_global_process !== false && (
        <ProcessSection page={page} settings={settings} />
      )}
      <ServiceAreasSection page={page} settings={settings} />
      <ContactCTASection page={page} settings={settings} />
      <RelatedServices allPages={allPages} currentSlug={slug} settings={settings} />
      <Footer settings={settings} />
    </div>
  );
};

export default DynamicServicePage;
