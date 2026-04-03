// Dynamic Service Page - Polished Layout
// Visual balance improvements with consistent spacing

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Mail, MapPin, Menu, X, ChevronRight, ArrowRight, Send,
  CheckCircle, Clock, Shield, Award, Star, ChevronDown, HelpCircle,
  Paintbrush, Building2, Layers, Wrench, Droplets, Square, Sparkles, Frame, Calculator
} from 'lucide-react';
import QuoteRequestForm from '../components/QuoteRequestForm';
import { Footer } from '../App';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/g1de58um_jb2-logo.png";

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return url;
};

// Dynamic SEO for Service Pages using useEffect
const useServicePageSEO = (page, settings, faqs) => {
  useEffect(() => {
    if (!page) return;
    
    const companyName = settings?.company_name || 'J&B Tasoitus ja Maalaus Oy';
    const phone = settings?.company_phone_primary || '+358 40 054 7270';
    const address = settings?.company_address || 'Sienitie 25, 00760 Helsinki';
    const city = settings?.company_city || 'Helsinki';
    
    // Set page title
    document.title = `${page.seo_title} | ${companyName}`;
    
    // Reveal page — prevents FOUC
    document.getElementById('root')?.classList.add('app-ready');
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = page.seo_description;
    
    // Update meta keywords
    if (page.seo_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = page.seo_keywords;
    }
    
    // Service structured data (JSON-LD)
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": page.hero_title || page.seo_title,
      "description": page.seo_description,
      "provider": {
        "@type": "LocalBusiness",
        "name": companyName,
        "telephone": phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": address,
          "addressLocality": city,
          "addressCountry": "FI"
        }
      },
      "areaServed": settings?.service_areas || ["Helsinki", "Espoo", "Vantaa", "Uusimaa"],
      "serviceType": page.hero_title
    };
    
    // Add service schema
    let serviceSchemaScript = document.querySelector('#service-schema');
    if (!serviceSchemaScript) {
      serviceSchemaScript = document.createElement('script');
      serviceSchemaScript.id = 'service-schema';
      serviceSchemaScript.type = 'application/ld+json';
      document.head.appendChild(serviceSchemaScript);
    }
    serviceSchemaScript.textContent = JSON.stringify(serviceSchema);
    
    // FAQ structured data if there are FAQs
    if (faqs && faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      
      let faqSchemaScript = document.querySelector('#faq-schema');
      if (!faqSchemaScript) {
        faqSchemaScript = document.createElement('script');
        faqSchemaScript.id = 'faq-schema';
        faqSchemaScript.type = 'application/ld+json';
        document.head.appendChild(faqSchemaScript);
      }
      faqSchemaScript.textContent = JSON.stringify(faqSchema);
    }
    
    // Cleanup on unmount
    return () => {
      const serviceScript = document.querySelector('#service-schema');
      const faqScript = document.querySelector('#faq-schema');
      if (serviceScript) serviceScript.remove();
      if (faqScript) faqScript.remove();
    };
  }, [page, settings, faqs]);
};

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
    { href: "/referenssit", label: "Referenssit", isPage: true },
    { href: "/ukk", label: "UKK", isPage: true },
    { href: "/hintalaskuri", label: "Hintalaskuri", isPage: true },
    { href: "/#yhteystiedot", label: "Yhteystiedot" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "navbar-glass shadow-sm" : "bg-white/95 backdrop-blur-sm shadow-sm"}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="J&B Tasoitus ja Maalaus" className="h-10 md:h-12 w-auto max-w-[180px] object-contain" />
          </Link>
          <div className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="nav-link text-sm font-medium">{link.label}</Link>
            ))}
            <Link to="/#yhteystiedot" className="btn-primary text-sm py-2 px-4">Pyydä tarjous</Link>
          </div>
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t">
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
  // Use the same hero image as the landing page (from settings)
  const heroImage = settings?.hero_image_url || 'https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
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
            <Link to="/hintalaskuri" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm" data-testid="hero-calculator-btn">
              <Calculator size={16} /> Hintalaskuri
            </Link>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-secondary inline-flex items-center justify-center gap-2 text-sm">
              <Phone size={16} /> Soita nyt
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-sm md:text-base text-[#64748B]">
              <CheckCircle size={21} className="text-primary" />
              <span>{settings?.trust_badge_3_title || 'Kotitalousvähennys'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base text-[#64748B]">
              <CheckCircle size={21} className="text-primary" />
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {badges.map((badge, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-center gap-2 md:gap-3">
              <div className="icon-box flex-shrink-0 rounded-lg">
                <badge.icon size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#0F172A] text-xs md:text-sm truncate">{badge.title}</p>
                <p className="text-[#64748B] text-xs hidden lg:block">{badge.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== DESCRIPTION - Float layout: text wraps around image, continues full-width ==========
const DescriptionSection = ({ page, settings, services }) => {
  // Find matching service from landing page to get image_url
  const matchingService = services?.find(s => 
    s.title?.toLowerCase().includes(page.hero_title?.toLowerCase()?.split(' ')[0]) ||
    page.hero_title?.toLowerCase().includes(s.title?.toLowerCase()?.split(' ')[0])
  );
  
  // Use service image from landing page, fallback to page's own images, then default
  const defaultImage = 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=800';
  const descriptionImage = matchingService?.image_url || page.description_image_url || page.hero_image_url || defaultImage;
  
  return (
    <section className="service-section-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
          <Subtitle settings={settings} className="mb-3">PALVELUN KUVAUS</Subtitle>
          <h2 className="section-title">{page.description_title || 'Mitä tarjoamme'}</h2>
        </motion.div>
        {/* Content with floated image */}
        <div className="description-float-layout">
          {/* Image floats right on desktop */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="description-float-image">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img 
                src={getImageUrl(descriptionImage)} 
                alt={page.hero_title} 
                className="w-full h-64 md:h-80 lg:h-[360px] object-cover"
                onError={(e) => { e.target.src = defaultImage; }}
              />
            </div>
          </motion.div>
          {/* Text wraps around image, continues full-width below */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div 
              className="service-description-content"
              dangerouslySetInnerHTML={{ __html: page.description_text || '<p>Ammattitaitoista palvelua.</p>' }} 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== FEATURES - Premium cards on light grey background ==========
const FeaturesSection = ({ page, settings }) => {
  const features = page.features || [];
  if (features.length === 0) return null;

  return (
    <section className="service-section-grey">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-14">
          <Subtitle settings={settings} className="mb-3">PALVELUN SISÄLTÖ</Subtitle>
          <h2 className="section-title">{page.features_title || 'Mitä palvelu sisältää'}</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || CheckCircle;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                className="service-feature-card group">
                <div className="icon-bg-primary mb-4">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2 text-base group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ========== WHY CHOOSE - White background section ==========
const WhyChooseSection = ({ page, settings }) => {
  const defaultItems = settings?.why_choose_us || [
    'Ammattitaitoiset tekijät', 'Laadukkaat materiaalit', 'Selkeä hinnoittelu',
    'Nopea aikataulu', 'Siisti työnjälki', 'Kotitalousvähennys kelpaa'
  ];
  const items = page.why_items?.length > 0 ? page.why_items : defaultItems;

  return (
    <section className="service-section-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Subtitle settings={settings} className="mb-3">MIKSI MEIDÄT</Subtitle>
            <h2 className="section-title mb-6">{page.why_title || 'Miksi valita J&B Tasoitus ja Maalaus'}</h2>
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}
                  className="why-choose-item">
                  <div className="icon-bg-primary-sm">
                    <CheckCircle size={14} className="text-primary" />
                  </div>
                  <span className="text-[#0F172A] text-sm md:text-base">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          {/* Soft benefits box */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="benefits-box-premium">
            <div className="flex items-center gap-4 mb-4">
              <div className="icon-bg-primary">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A]">{settings?.trust_badge_3_title || 'Kotitalousvähennys'}</h3>
            </div>
            <p className="text-[#64748B] text-sm md:text-base mb-5 leading-relaxed">
              Maalaus- ja tasoitustyöt luokitellaan kunnossapitotyöhön, joka oikeuttaa kotitalousvähennykseen.
            </p>
            <div className="bg-white rounded-xl p-5 border border-primary/15 shadow-sm">
              <p className="text-[#0F172A] font-bold text-xl mb-1">Jopa 40% vähennys</p>
              <p className="text-[#64748B] text-sm">Työn osuudesta, max 2 250 €/vuosi</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== PROCESS - Light grey background with connector lines ==========
const ProcessSection = ({ page, settings }) => {
  const steps = [
    { num: 1, title: settings?.process_step_1_title || 'Ilmainen arvio', desc: settings?.process_step_1_desc || 'Kartoitamme kohteen' },
    { num: 2, title: settings?.process_step_2_title || 'Tarjous', desc: settings?.process_step_2_desc || 'Selkeä kirjallinen tarjous' },
    { num: 3, title: settings?.process_step_3_title || 'Työn toteutus', desc: settings?.process_step_3_desc || 'Ammattitaitoinen toteutus' },
    { num: 4, title: settings?.process_step_4_title || 'Valmis lopputulos', desc: settings?.process_step_4_desc || 'Laaduntarkastus' }
  ];

  return (
    <section className="service-section-grey">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-14">
          <Subtitle settings={settings} className="mb-3">TYÖVAIHEET</Subtitle>
          <h2 className="section-title">{page.process_title || 'Näin projekti etenee'}</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}
              className="text-center relative group">
              {/* Connector line (hidden on mobile, visible on lg) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[55%] w-[90%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10"></div>
              )}
              <div className="relative z-10">
                <div className="process-step-number group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2 text-sm md:text-base">{step.title}</h3>
                <p className="text-[#64748B] text-xs md:text-sm max-w-[180px] mx-auto">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== SERVICE AREAS - Centered, themed background with impact ==========
const ServiceAreasSection = ({ page, settings, areas: areasProp, currentSlug }) => {
  const [areas, setAreas] = useState(areasProp || []);
  const phone = settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270';
  const serviceTitle = page?.hero_title || 'Palvelumme';
  
  useEffect(() => {
    if (!areasProp || areasProp.length === 0) {
      fetch(`${API_URL}/api/areas`).then(r => r.json()).then(setAreas).catch(() => {});
    }
  }, [areasProp]);

  // Determine base slug for linking (e.g., "maalaustyot" from "maalaustyot-helsinki")
  const baseSlug = (currentSlug || page?.slug || '').replace(/-helsinki$|-espoo$|-vantaa$|-kauniainen$/, '');

  if (!areas || areas.length === 0) return null;

  return (
    <section className="service-area-themed" data-testid="service-areas-section">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
          <p className="text-white/60 uppercase text-sm font-medium tracking-wider mb-3">TOIMIALUE</p>
          {page?.slug && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
              {serviceTitle} ja Uudellamaalla
            </h2>
          )}
          
          {/* Area badges as links */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
            {areas.map((area, index) => {
              const areaSlug = area.slug || area.name?.toLowerCase();
              const linkTarget = baseSlug ? `/${baseSlug}-${areaSlug}` : `/#palvelut`;
              return (
                <motion.div key={areaSlug || index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                  <Link to={linkTarget} className="service-area-badge inline-flex items-center gap-1.5 hover:bg-white/20 transition-all" data-testid={`area-link-${areaSlug}`}>
                    <MapPin size={14} className="opacity-70" />
                    {area.name || area}
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#tarjouspyynto" className="inline-flex items-center justify-center gap-2 bg-white text-[#0F172A] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-white/90 transition-all hover:scale-105 shadow-lg">
              Pyydä ilmainen arvio <ArrowRight size={16} />
            </a>
            <a href={`tel:${(phone || '').replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-white/20 transition-all border border-white/20">
              <Phone size={16} /> Soita nyt
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ========== CONTACT FORM SECTION ==========
const ContactFormSection = ({ page, settings }) => {
  const phone = settings?.company_phone_primary || '+358 40 054 7270';
  const email = settings?.company_email || 'info@jbtasoitusmaalaus.fi';

  return (
    <section id="tarjouspyynto" className="cta-section py-10 md:py-14">
      <div className="container-custom">
        {/* Stacked layout - full width blocks */}
        <div className="space-y-8 md:space-y-10">
          
          {/* Contact info block - full width, centered */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-white text-center">
            <Subtitle settings={settings} white className="mb-2">OTA YHTEYTTÄ</Subtitle>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{page.cta_title || 'Pyydä ilmainen arvio'}</h2>
            <p className="text-white/80 mb-6 text-sm max-w-lg mx-auto leading-relaxed">
              {page.cta_text || 'Lähetä tarjouspyyntö ja vastaamme 24 tunnin sisällä.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
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
          
          {/* Form block - full width */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl max-w-4xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-6 text-center">Lähetä tarjouspyyntö</h3>
              <QuoteRequestForm />
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

// ========== RELATED SERVICES - Project cards on light grey ==========
const RelatedServices = ({ allPages, currentSlug, settings, services }) => {
  const otherPages = allPages.filter(p => p.slug !== currentSlug).slice(0, 3);
  if (otherPages.length === 0) return null;
  
  // Helper to find matching service image from landing page
  const getServiceImage = (relPage) => {
    const matchingService = services?.find(s => 
      s.title?.toLowerCase().includes(relPage.hero_title?.toLowerCase()?.split(' ')[0]) ||
      relPage.hero_title?.toLowerCase().includes(s.title?.toLowerCase()?.split(' ')[0])
    );
    return matchingService?.image_url || relPage.hero_image_url || 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg';
  };

  return (
    <section className="service-section-grey">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-14">
          <Subtitle settings={settings} className="mb-3">MUUT PALVELUT</Subtitle>
          <h2 className="section-title">Tutustu myös muihin palveluihimme</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {otherPages.map((relPage, index) => (
            <motion.div key={relPage.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <Link to={`/${relPage.slug}`} className="project-card block h-full group">
                <div className="overflow-hidden">
                  <img 
                    src={getImageUrl(getServiceImage(relPage))} 
                    alt={relPage.hero_title}
                    onError={(e) => { e.target.src = 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg'; }}
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-primary font-medium uppercase tracking-wide mb-2">Palvelu</p>
                  <h3 className="font-semibold text-[#0F172A] mb-2 text-base group-hover:text-primary transition-colors">{relPage.hero_title}</h3>
                  <p className="text-[#64748B] text-sm line-clamp-2 mb-3">{relPage.hero_subtitle}</p>
                  <span className="inline-flex items-center text-primary text-sm font-medium link-underline">Lue lisää <ArrowRight size={14} className="ml-1" /></span>
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
// ========== CALCULATOR CTA ==========
const CalculatorCTA = () => (
  <section className="section-padding bg-primary/5 border-y border-primary/10">
    <div className="container-custom">
      <div className="max-w-3xl mx-auto text-center">
        <Calculator size={32} className="text-primary mx-auto mb-3" />
        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-2">Laske hinta-arvio hetkessä</h2>
        <p className="text-sm text-[#64748B] mb-5 max-w-lg mx-auto">
          Käytä hintalaskuriamme ja saat suuntaa-antavan hinnan heti – kotitalousvähennys lasketaan automaattisesti.
        </p>
        <Link to="/hintalaskuri" className="btn-primary inline-flex items-center gap-2 text-sm">
          Avaa hintalaskuri <Calculator size={16} />
        </Link>
      </div>
    </div>
  </section>
);

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

// ========== SERVICE FAQ SECTION ==========
const ServiceFAQSection = ({ faqs, settings, serviceName }) => {
  const [openFaqs, setOpenFaqs] = useState({});
  
  if (!faqs || faqs.length === 0) return null;
  
  const toggleFaq = (faqId) => {
    setOpenFaqs(prev => ({ ...prev, [faqId]: !prev[faqId] }));
  };
  
  // Generate FAQPage schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  
  return (
    <section className="section-padding bg-[#FAFAFA]">
      {/* JSON-LD Schema for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <p className="uppercase text-xs font-medium tracking-wider text-primary mb-2">Usein kysytyt kysymykset</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            {serviceName ? `UKK - ${serviceName}` : 'Usein kysyttyä'}
          </h2>
        </motion.div>
        
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-expanded={openFaqs[faq.id]}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-primary flex-shrink-0" />
                  <span className="font-semibold text-[#0F172A] text-sm md:text-base pr-4">{faq.question}</span>
                </div>
                <ChevronDown 
                  size={18} 
                  className={`text-primary flex-shrink-0 transition-transform duration-300 ${openFaqs[faq.id] ? 'rotate-180' : ''}`} 
                />
              </button>
              <AnimatePresence>
                {openFaqs[faq.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-5 pb-4 md:pb-5 pl-12 md:pl-14">
                      <p className="text-[#64748B] text-sm md:text-base leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        {/* Link to full FAQ page */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/ukk" className="text-primary hover:underline text-sm inline-flex items-center gap-2">
            Katso kaikki kysymykset <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// ========== MAIN ==========
const DynamicServicePage = () => {
  const { slug } = useParams();
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceFaqs, setServiceFaqs] = useState([]);
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const [baseSlug, setBaseSlug] = useState(null);
  const [isGeneralPage, setIsGeneralPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicePages, setServicePages] = useState([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const reservedSlugs = ['admin', 'api', 'static', 'assets'];
    if (reservedSlugs.includes(slug?.toLowerCase())) { setError('not_found'); setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true); setError(null); setIsGeneralPage(false); setCurrentArea(null);
      try {
        // Fetch settings, all service pages, services, and areas in parallel
        const [settingsRes, allPagesRes, servicesRes, areasRes] = await Promise.all([
          fetch(`${API_URL}/api/settings`),
          fetch(`${API_URL}/api/service-pages`),
          fetch(`${API_URL}/api/services`),
          fetch(`${API_URL}/api/areas`)
        ]);
        if (!settingsRes.ok) throw new Error('Settings error');
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        if (settingsData.theme_color) document.documentElement.style.setProperty('--color-primary', settingsData.theme_color);
        
        const allPagesData = allPagesRes.ok ? await allPagesRes.json() : [];
        setAllPages(allPagesData);
        setServicePages(allPagesData);
        if (servicesRes.ok) setServices(await servicesRes.json());
        const areasData = areasRes.ok ? await areasRes.json() : [];
        setAreas(areasData);
        
        // Try to find the exact page first
        const exactPage = allPagesData.find(p => p.slug === slug);
        
        if (exactPage) {
          // Exact match found (e.g., /maalaustyot-helsinki)
          let finalPage = { ...exactPage };
          // Determine current area and base slug
          const matchedArea = areasData.find(a => slug.endsWith(`-${a.slug}`));
          if (matchedArea) {
            setCurrentArea(matchedArea);
            const computedBase = slug.replace(`-${matchedArea.slug}`, '');
            setBaseSlug(computedBase);
            // Apply custom_texts overrides for default area too
            const customTexts = matchedArea.custom_texts || {};
            const cityEntry = customTexts[computedBase];
            if (cityEntry && typeof cityEntry === 'object') {
              if (cityEntry.seo_title) finalPage.seo_title = cityEntry.seo_title;
              if (cityEntry.hero_title) finalPage.hero_title = cityEntry.hero_title;
              if (cityEntry.seo_description) finalPage.seo_description = cityEntry.seo_description;
              if (cityEntry.text) {
                const existingDesc = finalPage.description_text || '';
                finalPage.description_text = existingDesc + `<div class="city-specific-content"><p>${cityEntry.text}</p></div>`;
              }
            } else if (typeof cityEntry === 'string' && cityEntry) {
              const existingDesc = finalPage.description_text || '';
              finalPage.description_text = existingDesc + `<div class="city-specific-content"><p>${cityEntry}</p></div>`;
            }
          }
          setPage(finalPage);
        } else {
          // No exact match - check if it's a city variant or general page
          const defaultArea = areasData.find(a => a.is_default) || areasData[0];
          
          // Check if slug matches a general page pattern (no city suffix)
          const matchedBaseFromGeneral = allPagesData.find(p => {
            if (!defaultArea) return false;
            return p.slug === `${slug}-${defaultArea.slug}`;
          });
          
          if (matchedBaseFromGeneral) {
            // This is a general page (e.g., /maalaustyot → base is maalaustyot-helsinki)
            setIsGeneralPage(true);
            setBaseSlug(slug);
            // Remove city from the page title for display
            const generalPage = { ...matchedBaseFromGeneral };
            if (defaultArea) {
              const replacer = (text) => {
                if (!text) return text;
                return text.replace(new RegExp(`\\s*${defaultArea.name_inessive}`, 'gi'), '')
                           .replace(new RegExp(`\\s*${defaultArea.name}`, 'gi'), '').trim();
              };
              generalPage.hero_title = replacer(generalPage.hero_title);
              generalPage.seo_title = replacer(generalPage.seo_title);
            }
            setPage(generalPage);
          } else {
            // Check if slug matches a city variant (e.g., /maalaustyot-espoo)
            const targetArea = areasData.find(a => slug.endsWith(`-${a.slug}`));
            if (targetArea && defaultArea) {
              const computedBaseSlug = slug.replace(`-${targetArea.slug}`, '');
              const basePage = allPagesData.find(p => p.slug === `${computedBaseSlug}-${defaultArea.slug}`);
              
              if (basePage) {
                // Found base page - create city variant
                setCurrentArea(targetArea);
                setBaseSlug(computedBaseSlug);
                const variantPage = { ...basePage, slug: slug };
                // Strip default city from title, then add target city
                const stripCity = (text) => {
                  if (!text) return text;
                  return text.replace(new RegExp(`\\s*${defaultArea.name_inessive}`, 'gi'), '')
                             .replace(new RegExp(`\\s*${defaultArea.name}`, 'gi'), '').trim();
                };
                const baseTitle = stripCity(variantPage.hero_title);
                variantPage.hero_title = `${baseTitle} ${targetArea.name_inessive}`;
                const baseSeoTitle = stripCity(variantPage.seo_title);
                variantPage.seo_title = `${baseSeoTitle} ${targetArea.name_inessive}`;
                // Apply city-specific overrides from custom_texts (object or legacy string)
                const customTexts = targetArea.custom_texts || {};
                const cityEntry = customTexts[computedBaseSlug];
                if (cityEntry && typeof cityEntry === 'object') {
                  if (cityEntry.seo_title) variantPage.seo_title = cityEntry.seo_title;
                  if (cityEntry.hero_title) variantPage.hero_title = cityEntry.hero_title;
                  if (cityEntry.seo_description) variantPage.seo_description = cityEntry.seo_description;
                  if (cityEntry.text) {
                    const existingDesc = variantPage.description_text || '';
                    variantPage.description_text = existingDesc + `<div class="city-specific-content"><p>${cityEntry.text}</p></div>`;
                  }
                } else if (typeof cityEntry === 'string' && cityEntry) {
                  const existingDesc = variantPage.description_text || '';
                  variantPage.description_text = existingDesc + `<div class="city-specific-content"><p>${cityEntry}</p></div>`;
                }
                setPage(variantPage);
              } else {
                setError('not_found');
              }
            } else {
              setError('not_found');
            }
          }
        }
        
        // Fetch FAQs for the service if available
        // For city variants, find the base page by computing base slug
        let resolvedPage = exactPage || allPagesData.find(p => p.slug === slug);
        if (!resolvedPage && areasData.length > 0) {
          const faqTargetArea = areasData.find(a => slug.endsWith(`-${a.slug}`));
          const faqDefaultArea = areasData.find(a => a.is_default) || areasData[0];
          if (faqTargetArea && faqDefaultArea) {
            const computedBase = slug.replace(`-${faqTargetArea.slug}`, '');
            resolvedPage = allPagesData.find(p => p.slug === `${computedBase}-${faqDefaultArea.slug}`);
          }
          if (!resolvedPage && faqDefaultArea) {
            resolvedPage = allPagesData.find(p => p.slug === `${slug}-${faqDefaultArea.slug}`);
          }
        }
        if (resolvedPage?.service_id) {
          try {
            const faqsRes = await fetch(`${API_URL}/api/faqs?service_id=${resolvedPage.service_id}`);
            if (faqsRes.ok) setServiceFaqs(await faqsRes.json());
          } catch (e) { /* ignore */ }
        }
      } catch (err) { setError('error'); }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  // Apply SEO
  useServicePageSEO(page, settings, serviceFaqs);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (error || !page) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-4">Sivua ei löytynyt</h1>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">Takaisin etusivulle</Link>
      </div>
    </div>
  );

  // General page - show area selection
  if (isGeneralPage && baseSlug) {
    return (
      <div className="App">
        <Navbar isScrolled={isScrolled} settings={settings} />
        <ServiceHero page={page} settings={settings} />
        <TrustBadges settings={settings} />
        <DescriptionSection page={page} settings={settings} services={services} />
        
        {/* Area Selection Section */}
        <section className="section-padding bg-[#FAFAFA]" data-testid="area-selection">
          <div className="container-custom">
            <div className="text-center mb-8 md:mb-12">
              <p className="uppercase text-sm font-medium text-primary tracking-wide mb-2">Valitse alue</p>
              <h2 className="section-title">Palvelemme seuraavilla alueilla</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {areas.map((area) => (
                <Link 
                  key={area.slug} 
                  to={`/${baseSlug}-${area.slug}`}
                  className="bg-white border border-gray-200 p-6 md:p-8 text-center hover:border-primary hover:shadow-lg transition-all group"
                  data-testid={`area-card-${area.slug}`}
                >
                  <MapPin size={24} className="mx-auto mb-3 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <h3 className="font-bold text-[#0F172A] text-lg mb-1">{area.name}</h3>
                  <p className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    Lue lisää <ArrowRight size={14} />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection page={page} settings={settings} />
        <WhyChooseSection page={page} settings={settings} />
        {page.use_global_process !== false && <ProcessSection page={page} settings={settings} />}
        <ServiceAreasSection page={page} settings={settings} currentSlug={slug} />
        <ServiceFAQSection faqs={serviceFaqs} settings={settings} serviceName={page.hero_title || page.seo_title} />
        <ContactFormSection page={page} settings={settings} />
        <CalculatorCTA />
        <RelatedServices allPages={allPages} currentSlug={slug} settings={settings} services={services} />
        <StrongCTA settings={settings} />
        <Footer logoUrl={settings?.logo_url} settings={settings} servicePages={servicePages} />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar isScrolled={isScrolled} settings={settings} />
      <ServiceHero page={page} settings={settings} />
      <TrustBadges settings={settings} />
      <DescriptionSection page={page} settings={settings} services={services} />
      <FeaturesSection page={page} settings={settings} />
      <WhyChooseSection page={page} settings={settings} />
      {page.use_global_process !== false && <ProcessSection page={page} settings={settings} />}
      <ServiceAreasSection page={page} settings={settings} />
      
      {/* Other Areas Section */}
      {baseSlug && areas.length > 1 && (
        <section className="section-padding bg-[#FAFAFA]" data-testid="other-areas">
          <div className="container-custom">
            <div className="text-center mb-6">
              <h2 className="section-title text-xl md:text-2xl">Muut alueet</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={`/${baseSlug}`} className="px-4 py-2 border border-gray-300 text-sm hover:border-primary hover:text-primary transition-colors">
                Kaikki alueet
              </Link>
              {areas.filter(a => !currentArea || a.slug !== currentArea.slug).map(area => (
                <Link key={area.slug} to={`/${baseSlug}-${area.slug}`} className="px-4 py-2 border border-gray-300 text-sm hover:border-primary hover:text-primary transition-colors">
                  {area.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <ServiceFAQSection faqs={serviceFaqs} settings={settings} serviceName={page.hero_title || page.seo_title} />
      <ContactFormSection page={page} settings={settings} />
      <CalculatorCTA />
      <RelatedServices allPages={allPages} currentSlug={slug} settings={settings} services={services} />
      <StrongCTA settings={settings} />
      <Footer logoUrl={settings?.logo_url} settings={settings} servicePages={servicePages} />
    </div>
  );
};

export default DynamicServicePage;

// Named exports for reuse in PriceCalculatorPage
export {
  TrustBadges,
  DescriptionSection,
  FeaturesSection,
  WhyChooseSection,
  ProcessSection,
  ServiceAreasSection,
  ServiceFAQSection,
  ContactFormSection,
  RelatedServices,
  StrongCTA,
  getImageUrl,
  Subtitle,
  getSubtitleClasses,
  iconMap
};
