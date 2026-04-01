import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Paintbrush, Layers, Gem, Home, Triangle, Building2,
  ChevronRight, ChevronLeft, Check, Calculator, ArrowRight, ArrowLeft,
  Phone, Mail, User, Send, RotateCcw, CheckCircle, Clock, Award, Shield, Star
} from 'lucide-react';
import { Navbar, Footer } from '../App';

const API = process.env.REACT_APP_BACKEND_URL || '';
const iconMap = { Paintbrush, Layers, Gem, Home, Triangle, Building2 };

const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 60 : -60, opacity: 0 })
};

const fmt = (n) => Math.round(n).toLocaleString('fi-FI');

// SEO Head
const CalculatorSEO = () => {
  useEffect(() => {
    document.title = "Hintalaskuri – Laske maalaus- ja tasoitustöiden hinta | J&B Tasoitus ja Maalaus";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä. Sisämaalaus, ulkomaalaus, tasoitustyöt, mikrosementti, kattomaalaus ja julkisivurappaus. Kotitalousvähennys lasketaan automaattisesti. Palvelemme Helsingissä, Espoossa, Vantaalla ja Kauniaisissa.');
    }
  }, []);
  return null;
};

// JSON-LD Schema for calculator page
const CalculatorSchema = ({ config }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "J&B Tasoitus ja Maalaus - Hintalaskuri",
    "description": "Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä. Kotitalousvähennys lasketaan automaattisesti.",
    "url": "https://jbtasoitusmaalaus.fi/hintalaskuri",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "18",
      "highPrice": "120",
      "priceCurrency": "EUR",
      "offerCount": config?.services?.length || 6
    },
    "provider": {
      "@type": "LocalBusiness",
      "name": "J&B Tasoitus ja Maalaus Oy",
      "areaServed": ["Helsinki", "Espoo", "Vantaa", "Kauniainen"]
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};

const PriceCalculatorPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [servicePages, setServicePages] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selections, setSelections] = useState({});
  const [activeAddons, setActiveAddons] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/calculator-config`).then(r => r.json()),
      fetch(`${API}/api/settings`).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/service-pages`).then(r => r.json()).catch(() => [])
    ]).then(([calcData, settingsData, spData]) => {
      setConfig(calcData);
      setSettings(settingsData);
      setServicePages(spData);
      if (settingsData.theme_color) {
        document.documentElement.style.setProperty('--color-primary', settingsData.theme_color);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const enabledServices = useMemo(() =>
    config?.services?.filter(s => s.enabled).sort((a, b) => a.order - b.order) || [],
    [config]
  );

  const service = useMemo(() =>
    enabledServices.find(s => s.id === selectedService),
    [enabledServices, selectedService]
  );

  const totalSteps = service ? service.steps.length + 2 : 1;

  // Price calculation - Finnish tax logic
  const priceBreakdown = useMemo(() => {
    if (!service || !config) return null;
    const g = config.global_settings;
    let area = 0;
    let multiplier = 1;

    for (const step of service.steps) {
      if (step.type === 'slider') {
        area = selections[step.id] ?? step.default;
      } else if (step.type === 'cards') {
        const selected = selections[step.id];
        const opt = step.options.find(o => o.id === selected);
        if (opt) multiplier *= opt.multiplier;
      }
    }

    const basePrice = area * service.base_price_per_m2 * multiplier;
    let addonsTotal = 0;
    for (const addon of (service.addons || [])) {
      if (activeAddons[addon.id]) {
        if (addon.price_per_m2) addonsTotal += area * addon.price_per_m2;
        if (addon.fixed_price) addonsTotal += addon.fixed_price;
      }
    }

    const totalWithAlv = basePrice + addonsTotal;
    const alvRate = g.tax_rate || 25.5;
    const alvOsuus = totalWithAlv - (totalWithAlv / (1 + alvRate / 100));
    const hintaIlmanAlv = totalWithAlv - alvOsuus;
    const laborPct = g.labor_percentage || 70;
    const materialPct = g.material_percentage || 30;
    const tyonOsuus = totalWithAlv * (laborPct / 100);
    const materiaaliOsuus = totalWithAlv * (materialPct / 100);
    const kotiRate = g.kotitalousvahennys_rate || 35;
    const kotiMax = g.kotitalousvahennys_max_per_person || 1600;
    const omavastuu = 150;
    const kotiRaw = tyonOsuus * (kotiRate / 100) - omavastuu;
    const kotitalousvahennys = Math.max(0, Math.min(kotiRaw, kotiMax));
    const finalPrice = totalWithAlv - kotitalousvahennys;

    return { area, basePrice, addonsTotal, totalWithAlv, alvRate, alvOsuus, hintaIlmanAlv,
      tyonOsuus, materiaaliOsuus, laborPct, materialPct, kotiRate, omavastuu, kotitalousvahennys, finalPrice };
  }, [service, config, selections, activeAddons]);

  const selectService = (id) => {
    setSelectedService(id); setSelections({}); setActiveAddons({});
    setShowResult(false); setShowContactForm(false); setContactSent(false);
    setDirection(1); setCurrentStep(1);
  };

  const goNext = () => {
    if (currentStep < totalSteps - 1) { setDirection(1); setCurrentStep(s => s + 1); }
    else { setShowResult(true); }
  };
  const goBack = () => {
    if (showResult) { setShowResult(false); return; }
    setDirection(-1); if (currentStep > 0) setCurrentStep(s => s - 1);
  };
  const resetCalculator = () => {
    setSelectedService(null); setSelections({}); setActiveAddons({});
    setShowResult(false); setShowContactForm(false); setContactSent(false); setCurrentStep(0);
  };
  const canProceed = () => {
    if (currentStep === 0) return !!selectedService;
    if (!service) return false;
    const si = currentStep - 1;
    if (si < service.steps.length) {
      const step = service.steps[si];
      if (step.type === 'cards') return !!selections[step.id];
      return true;
    }
    return true;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm,
          message: `Hintalaskuri: ${service?.name}, ${priceBreakdown?.area} m², arvio ${fmt(priceBreakdown?.totalWithAlv)} € (kotitalousvähennyksen jälkeen ${fmt(priceBreakdown?.finalPrice)} €)`,
          source: 'calculator'
        })
      });
    } catch (e) { /* silent */ }
    setContactSent(true);
  };

  const heroImage = settings?.hero_image_url || 'https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
  const phone = settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar isScrolled={isScrolled} logoUrl={settings?.logo_url} />
      <CalculatorSEO />
      {config && <CalculatorSchema config={config} />}

      {/* HERO - same style as service pages */}
      <section className="relative min-h-[45vh] md:min-h-[50vh] flex items-center pt-16" data-testid="price-calculator-page">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Hintalaskuri - maalaus ja tasoitustyöt" className="w-full h-full object-cover" loading="eager" />
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        <div className="container-custom relative z-10 py-10 md:py-16">
          <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-[#64748B] mb-4 md:mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Etusivu</Link>
            <ChevronRight size={14} />
            <span className="text-[#0F172A] font-medium">Hintalaskuri</span>
          </motion.nav>
          <div className="max-w-[600px]">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 leading-tight" data-testid="calculator-title">
              Hintalaskuri
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-[#64748B] mb-6 leading-relaxed">
              Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä. Saat suuntaa-antavan hinnan heti – ilman rekisteröitymistä.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3">
              <a href="#laskuri" className="btn-primary inline-flex items-center justify-center gap-2 text-sm">
                Laske hinta <Calculator size={16} />
              </a>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-secondary inline-flex items-center justify-center gap-2 text-sm">
                <Phone size={16} /> Soita nyt
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]">
                <CheckCircle size={16} className="text-primary" />
                <span>Kotitalousvähennys lasketaan</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-[#64748B]">
                <CheckCircle size={16} className="text-primary" />
                <span>Ei vaadi rekisteröitymistä</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="container-custom py-4 md:py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, title: settings?.trust_badge_1_title || 'Vuodesta 2018', sub: settings?.trust_badge_1_subtitle || 'Luotettava kokemus' },
              { icon: Award, title: settings?.trust_badge_2_title || 'Ammattitaitoinen työ', sub: settings?.trust_badge_2_subtitle || 'Laadukas lopputulos' },
              { icon: Shield, title: settings?.trust_badge_3_title || 'Kotitalousvähennys', sub: settings?.trust_badge_3_subtitle || 'Hyödynnä veroetu' },
              { icon: Star, title: settings?.trust_badge_4_title || 'Tyytyväisyystakuu', sub: settings?.trust_badge_4_subtitle || '100% tyytyväisyys' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <b.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-[#0F172A]">{b.title}</p>
                  <p className="text-xs text-[#64748B] hidden md:block">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR WIDGET */}
      <section id="laskuri" className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] overflow-hidden">
              {selectedService && !showResult && (
                <div className="h-1 bg-[#F1F5F9]">
                  <motion.div className="h-full bg-primary" initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
              )}

              <div className="p-6 md:p-10">
                <AnimatePresence mode="wait" custom={direction}>
                  {/* STEP 0: Service Selection */}
                  {currentStep === 0 && !showResult && (
                    <motion.div key="svc" custom={direction} variants={stepVariants}
                      initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                      <div className="text-center mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-2">Valitse palvelu</h2>
                        <p className="text-sm text-[#64748B]">Minkä tyyppistä työtä tarvitset?</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="service-selection">
                        {enabledServices.map((s) => {
                          const Icon = iconMap[s.icon] || Paintbrush;
                          const sel = selectedService === s.id;
                          return (
                            <motion.button key={s.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedService(s.id)}
                              className={`relative p-4 md:p-5 rounded-xl border-2 text-left transition-all ${
                                sel ? 'border-primary bg-primary/5 shadow-md' : 'border-[#E2E8F0] hover:border-[#94A3B8] hover:shadow-sm'
                              }`} data-testid={`service-card-${s.id}`}>
                              {sel && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <Check size={12} className="text-white" />
                                </motion.div>
                              )}
                              <Icon size={24} className={sel ? 'text-primary' : 'text-[#94A3B8]'} />
                              <h3 className="font-semibold text-[#0F172A] mt-2 text-sm">{s.name}</h3>
                              <p className="text-xs text-[#94A3B8] mt-0.5 hidden md:block">{s.description}</p>
                              <p className="text-xs font-medium text-primary mt-1.5">alk. {s.base_price_per_m2} €/m²</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* DYNAMIC STEPS */}
                  {service && currentStep > 0 && currentStep <= service.steps.length && !showResult && (
                    <motion.div key={`step-${currentStep}`} custom={direction} variants={stepVariants}
                      initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                      {(() => {
                        const step = service.steps[currentStep - 1];
                        return (
                          <div>
                            <div className="text-center mb-8">
                              <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Vaihe {currentStep} / {totalSteps - 1}</p>
                              <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">{step.title}</h2>
                            </div>
                            {step.type === 'cards' && (
                              <div className={`grid gap-3 ${step.options.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`} data-testid={`step-${step.id}`}>
                                {step.options.map(opt => {
                                  const sel = selections[step.id] === opt.id;
                                  return (
                                    <motion.button key={opt.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                      onClick={() => setSelections(prev => ({ ...prev, [step.id]: opt.id }))}
                                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        sel ? 'border-primary bg-primary/5 shadow-md' : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                                      }`} data-testid={`option-${opt.id}`}>
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h3 className="font-semibold text-[#0F172A] text-sm">{opt.label}</h3>
                                          {opt.description && <p className="text-xs text-[#94A3B8] mt-0.5">{opt.description}</p>}
                                        </div>
                                        {sel && (
                                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-white" />
                                          </motion.div>
                                        )}
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            )}
                            {step.type === 'slider' && (
                              <div className="max-w-md mx-auto" data-testid={`step-${step.id}`}>
                                <div className="text-center mb-8">
                                  <span className="text-5xl font-bold text-[#0F172A]">{selections[step.id] ?? step.default}</span>
                                  <span className="text-lg text-[#64748B] ml-1">{step.unit}</span>
                                </div>
                                <input type="range" min={step.min} max={step.max} step={step.step}
                                  value={selections[step.id] ?? step.default}
                                  onChange={(e) => setSelections(prev => ({ ...prev, [step.id]: Number(e.target.value) }))}
                                  className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-primary"
                                  data-testid="area-slider" />
                                <div className="flex justify-between text-xs text-[#94A3B8] mt-2">
                                  <span>{step.min} {step.unit}</span><span>{step.max} {step.unit}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* ADDONS */}
                  {service && currentStep === service.steps.length + 1 && !showResult && (
                    <motion.div key="addons" custom={direction} variants={stepVariants}
                      initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                      <div className="text-center mb-8">
                        <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Vaihe {currentStep} / {totalSteps - 1}</p>
                        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">Lisäpalvelut</h2>
                        <p className="text-sm text-[#64748B] mt-1">Valitse tarvitsemasi lisäpalvelut (valinnainen)</p>
                      </div>
                      <div className="max-w-md mx-auto space-y-2" data-testid="addons-step">
                        {(service.addons || []).filter(a => a.enabled).map(addon => {
                          const active = activeAddons[addon.id];
                          return (
                            <motion.button key={addon.id} whileTap={{ scale: 0.99 }}
                              onClick={() => setActiveAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                active ? 'border-primary bg-primary/5' : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                              }`} data-testid={`addon-${addon.id}`}>
                              <div className="text-left">
                                <span className="font-medium text-[#0F172A] text-sm">{addon.label}</span>
                                <span className="text-xs text-[#94A3B8] ml-2">
                                  {addon.price_per_m2 ? `${addon.price_per_m2} €/m²` : addon.fixed_price > 0 ? `${addon.fixed_price} €` : ''}
                                </span>
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                active ? 'bg-primary border-primary' : 'border-[#CBD5E1]'
                              }`}>
                                {active && <Check size={12} className="text-white" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* RESULT */}
                  {showResult && priceBreakdown && (
                    <motion.div key="result" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }} data-testid="price-result">
                      <div className="text-center mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">Hinta-arvio: {service.name}</h2>
                        <p className="text-sm text-[#64748B] mt-1">{priceBreakdown.area} m²</p>
                      </div>
                      <div className="max-w-md mx-auto">
                        <div className="bg-[#0F172A] rounded-2xl p-6 text-white mb-4">
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">Hinta ilman ALV</span>
                              <span>{fmt(priceBreakdown.hintaIlmanAlv)} €</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">ALV {priceBreakdown.alvRate}%</span>
                              <span>{fmt(priceBreakdown.alvOsuus)} €</span>
                            </div>
                            {priceBreakdown.addonsTotal > 0 && (
                              <div className="text-xs text-white/40">
                                <span>(sis. lisäpalvelut {fmt(priceBreakdown.addonsTotal)} €)</span>
                              </div>
                            )}
                            <div className="border-t border-white/15 pt-2.5 flex justify-between font-semibold">
                              <span>Yhteensä (sis. ALV)</span><span>{fmt(priceBreakdown.totalWithAlv)} €</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/50">
                            <div className="flex justify-between">
                              <span>Työn osuus ({priceBreakdown.laborPct}%)</span>
                              <span>{fmt(priceBreakdown.tyonOsuus)} €</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Materiaalit ({priceBreakdown.materialPct}%)</span>
                              <span>{fmt(priceBreakdown.materiaaliOsuus)} €</span>
                            </div>
                          </div>
                          {priceBreakdown.kotitalousvahennys > 0 && (
                            <div className="mt-4 bg-green-500/15 border border-green-400/20 rounded-xl p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-green-300 text-xs font-semibold uppercase tracking-wider">Kotitalousvähennys</p>
                                  <p className="text-green-100/60 text-xs mt-0.5">{priceBreakdown.kotiRate}% työn osuudesta – {priceBreakdown.omavastuu} € omavastuu</p>
                                </div>
                                <span className="text-green-300 font-bold text-lg" data-testid="kotitalousvahennys">-{fmt(priceBreakdown.kotitalousvahennys)} €</span>
                              </div>
                            </div>
                          )}
                          <div className="mt-5 text-center">
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Arvioitu loppuhinta</p>
                            <motion.p initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, type: 'spring' }} className="text-4xl font-bold" data-testid="final-price">
                              {fmt(priceBreakdown.finalPrice)} €
                            </motion.p>
                          </div>
                        </div>
                        <p className="text-xs text-[#94A3B8] text-center mb-6">{config.global_settings.disclaimer}</p>
                        {!showContactForm && !contactSent && (
                          <div className="space-y-2">
                            <button onClick={() => setShowContactForm(true)}
                              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                              data-testid="request-quote-btn">
                              {config.global_settings.cta_title} <ArrowRight size={16} />
                            </button>
                            <button onClick={resetCalculator}
                              className="w-full py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center justify-center gap-1"
                              data-testid="recalculate-btn">
                              <RotateCcw size={14} /> Laske uudelle kohteelle
                            </button>
                          </div>
                        )}
                        {showContactForm && !contactSent && (
                          <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleContactSubmit} className="space-y-3" data-testid="calculator-contact-form">
                            <p className="text-sm text-[#64748B] text-center mb-3">{config.global_settings.cta_subtitle}</p>
                            <div className="relative">
                              <User size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                              <input type="text" placeholder="Nimi" required value={contactForm.name}
                                onChange={e => setContactForm(p => ({...p, name: e.target.value}))}
                                className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" data-testid="contact-name" />
                            </div>
                            <div className="relative">
                              <Phone size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                              <input type="tel" placeholder="Puhelin" required value={contactForm.phone}
                                onChange={e => setContactForm(p => ({...p, phone: e.target.value}))}
                                className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" data-testid="contact-phone" />
                            </div>
                            <div className="relative">
                              <Mail size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                              <input type="email" placeholder="Sähköposti (valinnainen)" value={contactForm.email}
                                onChange={e => setContactForm(p => ({...p, email: e.target.value}))}
                                className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" data-testid="contact-email" />
                            </div>
                            <button type="submit"
                              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2" data-testid="send-contact-btn">
                              <Send size={16} /> Pyydä tarjous
                            </button>
                          </motion.form>
                        )}
                        {contactSent && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Check size={24} className="text-green-600" />
                            </div>
                            <p className="font-semibold text-[#0F172A]">Kiitos! Olemme yhteydessä pian.</p>
                            <button onClick={resetCalculator} className="mt-3 text-sm text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 mx-auto">
                              <RotateCcw size={14} /> Laske uudelle kohteelle
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                {!showResult && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F1F5F9]">
                    <button onClick={currentStep > 0 ? goBack : undefined}
                      className={`flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                        currentStep > 0 ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]' : 'invisible'
                      }`} data-testid="calc-back-btn">
                      <ChevronLeft size={16} /> Takaisin
                    </button>
                    {service && priceBreakdown && currentStep > 0 && (
                      <div className="text-center hidden sm:block">
                        <p className="text-xs text-[#94A3B8]">Arvio</p>
                        <p className="font-bold text-[#0F172A] text-sm">{fmt(priceBreakdown.finalPrice)} €</p>
                      </div>
                    )}
                    <button onClick={goNext} disabled={!canProceed()}
                      className={`flex items-center gap-1 px-5 py-2 text-sm rounded-lg font-medium transition-all ${
                        canProceed() ? 'bg-primary text-white hover:bg-primary/90' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                      }`} data-testid="calc-next-btn">
                      {currentStep === totalSteps - 1 ? 'Näytä hinta' : 'Seuraava'} <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO CONTENT - rich text for Google */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto prose prose-sm prose-slate">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Maalaus- ja tasoitustöiden hinnat</h2>
            <p className="text-[#64748B] leading-relaxed">
              Maalaus- ja tasoitustöiden hinta riippuu useista tekijöistä: pinta-alasta, pinnan kunnosta, valitusta palvelusta
              ja mahdollisista lisätöistä. Hintalaskurimme antaa suuntaa-antavan arvion, joka sisältää työn, materiaalit ja
              arvonlisäveron (ALV 25,5 %). Lopullinen hinta varmistetaan aina maksuttomalla kartoituskäynnillä.
            </p>

            <h3 className="text-lg font-bold text-[#0F172A] mt-8 mb-3">Sisämaalaus hinnat</h3>
            <p className="text-[#64748B] leading-relaxed">
              Sisämaalauksen hinta alkaa noin 19 €/m² ja sisältää seinien maalauksen ammattimaisilla materiaaleilla.
              Katon maalaus maksaa lisäksi noin 22 €/m². Hintaan vaikuttavat huoneen koko, seinien kunto ja tarvittavat
              esikäsittelyt. Yksiön (30–40 m²) maalaus maksaa tyypillisesti 800–1 500 € ja kolmion (70–90 m²) 1 800–3 500 €.
            </p>

            <h3 className="text-lg font-bold text-[#0F172A] mt-8 mb-3">Tasoitustyöt hinnat</h3>
            <p className="text-[#64748B] leading-relaxed">
              Tasoitustyöt hinnoitellaan pinta-alan ja vaadittavan tasoituksen laajuuden mukaan. Osatasoitus
              (pienten korjausten paikkaus) on edullisempi vaihtoehto, kun taas ylitasoitus kattaa koko pinnan käsittelyn.
              Tasoitustöiden hinta alkaa 25 €/m².
            </p>

            <h3 className="text-lg font-bold text-[#0F172A] mt-8 mb-3">Julkisivumaalaus ja kattomaalaus</h3>
            <p className="text-[#64748B] leading-relaxed">
              Talon ulkomaalauksen hinta riippuu talon koosta, kerrosluvusta ja pinnan kunnosta.
              Julkisivumaalaus alkaa 35 €/m² ja kattomaalaus 18 €/m². Peltikaton maalaus on edullisempaa kuin
              tiilikaton käsittely. Telineet sisältyvät yleensä julkisivumaalauksen hintaan.
            </p>

            <h3 className="text-lg font-bold text-[#0F172A] mt-8 mb-3">Mikrosementti hinnat</h3>
            <p className="text-[#64748B] leading-relaxed">
              Mikrosementti on moderni pintamateriaali, joka sopii lattioihin, seiniin ja kylpyhuoneisiin.
              Mikrosementin hinta alkaa 120 €/m² ja vaihtelee kohteen tyypin ja alustan kunnon mukaan.
              Kylpyhuoneen mikrosementtipinta on yleensä kalliimpi erikoiskäsittelyn vuoksi.
            </p>

            <h3 className="text-lg font-bold text-[#0F172A] mt-8 mb-3">Kotitalousvähennys maalaus- ja tasoitustöissä</h3>
            <p className="text-[#64748B] leading-relaxed">
              Voit hyödyntää kotitalousvähennystä maalaus- ja tasoitustöissä. Vuonna 2025–2026 vähennys on 35 %
              työn osuudesta (sis. ALV), ja enimmäismäärä on 1 600 € henkilöä kohti vuodessa. Omavastuu on 150 €.
              Esimerkiksi 5 000 € remontissa työn osuus voi olla noin 3 500 €, jolloin kotitalousvähennys on
              3 500 € × 35 % – 150 € = 1 075 €. Hintalaskurimme laskee kotitalousvähennyksen automaattisesti.
            </p>

            <h3 className="text-lg font-bold text-[#0F172A] mt-8 mb-3">Palvelualueet</h3>
            <p className="text-[#64748B] leading-relaxed">
              Palvelemme pääkaupunkiseudulla: <Link to="/maalaustyot-helsinki" className="text-primary hover:underline">Helsingissä</Link>,{' '}
              <Link to="/maalaustyot-espoo" className="text-primary hover:underline">Espoossa</Link>,{' '}
              <Link to="/maalaustyot-vantaa" className="text-primary hover:underline">Vantaalla</Link> ja{' '}
              <Link to="/maalaustyot-kauniainen" className="text-primary hover:underline">Kauniaisissa</Link>.
              Pyydä maksuton arvio – tulemme mielellämme kartoittamaan kohteenne.
            </p>

            {/* Internal links to services */}
            <h3 className="text-lg font-bold text-[#0F172A] mt-8 mb-3">Palvelumme</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 not-prose">
              {[
                { name: 'Sisämaalaus', slug: 'maalaustyot' },
                { name: 'Tasoitustyöt', slug: 'tasoitustyot' },
                { name: 'Mikrosementti', slug: 'mikrosementti' },
                { name: 'Julkisivumaalaus', slug: 'julkisivumaalaus' },
                { name: 'Kattomaalaus', slug: 'kattomaalaus' },
                { name: 'Julkisivurappaus', slug: 'julkisivurappaus' },
              ].map(s => (
                <Link key={s.slug} to={`/${s.slug}`}
                  className="flex items-center gap-2 p-3 bg-white border border-[#E2E8F0] rounded-lg hover:border-primary hover:shadow-sm transition-all text-sm text-[#0F172A] font-medium">
                  <ArrowRight size={14} className="text-primary" /> {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-[#0F172A] text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Haluatko tarkan tarjouksen?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Hintalaskuri antaa suuntaa-antavan arvion. Tarkka hinta varmistuu kartoituskäynnillä – se on aina maksuton ja ei sido sinua mihinkään.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/#yhteystiedot" className="btn-primary inline-flex items-center justify-center gap-2">
              Pyydä tarjous <ArrowRight size={16} />
            </Link>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              <Phone size={16} /> {phone}
            </a>
          </div>
        </div>
      </section>

      <Footer logoUrl={settings?.logo_url} settings={settings} servicePages={servicePages} />
    </>
  );
};

export default PriceCalculatorPage;
