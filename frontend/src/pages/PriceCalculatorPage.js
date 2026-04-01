import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paintbrush, Layers, Gem, Home, Triangle, Building2,
  ChevronRight, ChevronLeft, Check, Calculator, ArrowRight,
  Phone, Mail, User, Send, RotateCcw
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
    document.title = "Hintalaskuri | J&B Tasoitus ja Maalaus - Laske hinta-arvio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä. Sisämaalaus, tasoitustyöt, mikrosementti, julkisivumaalaus, kattomaalaus ja julkisivurappaus.');
    }
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

  // =============================================
  // CORRECT PRICE CALCULATION (Finnish tax logic)
  // Prices are ALV-inclusive (as shown to customer)
  // Kotitalousvähennys: 35% of labor (incl. ALV) - 150€ omavastuu, max 1600€/hlö
  // =============================================
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

    // All prices include ALV
    const basePrice = area * service.base_price_per_m2 * multiplier;

    let addonsTotal = 0;
    for (const addon of (service.addons || [])) {
      if (activeAddons[addon.id]) {
        if (addon.price_per_m2) addonsTotal += area * addon.price_per_m2;
        if (addon.fixed_price) addonsTotal += addon.fixed_price;
      }
    }

    const totalWithAlv = basePrice + addonsTotal;
    
    // ALV portion (reverse-calculated from ALV-inclusive price)
    const alvRate = g.tax_rate || 25.5;
    const alvOsuus = totalWithAlv - (totalWithAlv / (1 + alvRate / 100));
    const hintaIlmanAlv = totalWithAlv - alvOsuus;

    // Labor and material split (of ALV-inclusive total)
    const laborPct = g.labor_percentage || 70;
    const materialPct = g.material_percentage || 30;
    const tyonOsuus = totalWithAlv * (laborPct / 100);
    const materiaaliOsuus = totalWithAlv * (materialPct / 100);

    // Kotitalousvähennys: 35% of labor (incl. ALV) minus 150€ omavastuu
    const kotiRate = g.kotitalousvahennys_rate || 35;
    const kotiMax = g.kotitalousvahennys_max_per_person || 1600;
    const omavastuu = 150;
    const kotiRaw = tyonOsuus * (kotiRate / 100) - omavastuu;
    const kotitalousvahennys = Math.max(0, Math.min(kotiRaw, kotiMax));

    const finalPrice = totalWithAlv - kotitalousvahennys;

    return {
      area,
      basePrice,
      addonsTotal,
      totalWithAlv,
      alvRate,
      alvOsuus,
      hintaIlmanAlv,
      tyonOsuus,
      materiaaliOsuus,
      laborPct,
      materialPct,
      kotiRate,
      omavastuu,
      kotitalousvahennys,
      finalPrice
    };
  }, [service, config, selections, activeAddons]);

  const selectService = (id) => {
    setSelectedService(id);
    setSelections({});
    setActiveAddons({});
    setShowResult(false);
    setShowContactForm(false);
    setContactSent(false);
    setDirection(1);
    setCurrentStep(1);
  };

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    } else {
      setShowResult(true);
    }
  };

  const goBack = () => {
    if (showResult) { setShowResult(false); return; }
    setDirection(-1);
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const resetCalculator = () => {
    setSelectedService(null);
    setSelections({});
    setActiveAddons({});
    setShowResult(false);
    setShowContactForm(false);
    setContactSent(false);
    setCurrentStep(0);
  };

  const canProceed = () => {
    if (currentStep === 0) return !!selectedService;
    if (!service) return false;
    const stepIndex = currentStep - 1;
    if (stepIndex < service.steps.length) {
      const step = service.steps[stepIndex];
      if (step.type === 'cards') return !!selections[step.id];
      if (step.type === 'slider') return true;
    }
    return true;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          message: `Hintalaskuri: ${service?.name}, ${priceBreakdown?.area} m², arvio ${fmt(priceBreakdown?.totalWithAlv)} € (kotitalousvähennyksen jälkeen ${fmt(priceBreakdown?.finalPrice)} €)`,
          source: 'calculator'
        })
      });
    } catch (e) { /* silent */ }
    setContactSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="price-calculator-page">
      <Navbar isScrolled={isScrolled} logoUrl={settings?.logo_url} />

      {/* Hero - matching site style */}
      <section className="relative bg-[#0F172A] text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm mb-6 border border-white/10">
              <Calculator size={16} />
              <span>Hintalaskuri</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" data-testid="calculator-title">
              Laske hinta-arvio hetkessä
            </h1>
            <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto">
              Saat suuntaa-antavan hinnan heti – ilman rekisteröitymistä tai yhteystietojen jättämistä.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="flex-1 bg-[#F8FAFC] py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] overflow-hidden">
            {/* Progress bar */}
            {selectedService && !showResult && (
              <div className="h-1 bg-[#F1F5F9]">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
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
                            <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">
                              Vaihe {currentStep} / {totalSteps - 1}
                            </p>
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
                                <motion.div key={selections[step.id] || step.default}
                                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                  <span className="text-5xl font-bold text-[#0F172A]">
                                    {selections[step.id] ?? step.default}
                                  </span>
                                  <span className="text-lg text-[#64748B] ml-1">{step.unit}</span>
                                </motion.div>
                              </div>
                              <input type="range" min={step.min} max={step.max} step={step.step}
                                value={selections[step.id] ?? step.default}
                                onChange={(e) => setSelections(prev => ({ ...prev, [step.id]: Number(e.target.value) }))}
                                className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-primary"
                                data-testid="area-slider" />
                              <div className="flex justify-between text-xs text-[#94A3B8] mt-2">
                                <span>{step.min} {step.unit}</span>
                                <span>{step.max} {step.unit}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* ADDONS STEP */}
                {service && currentStep === service.steps.length + 1 && !showResult && (
                  <motion.div key="addons" custom={direction} variants={stepVariants}
                    initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                    <div className="text-center mb-8">
                      <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">
                        Vaihe {currentStep} / {totalSteps - 1}
                      </p>
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
                      {(!service.addons || service.addons.filter(a => a.enabled).length === 0) && (
                        <p className="text-center text-[#94A3B8] py-4">Ei lisäpalveluja saatavilla.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* RESULT */}
                {showResult && priceBreakdown && (
                  <motion.div key="result" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    data-testid="price-result">
                    <div className="text-center mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">Hinta-arvio: {service.name}</h2>
                      <p className="text-sm text-[#64748B] mt-1">{priceBreakdown.area} m²</p>
                    </div>

                    <div className="max-w-md mx-auto">
                      {/* Price card */}
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
                            <div className="flex justify-between text-xs text-white/40">
                              <span>(sis. lisäpalvelut {fmt(priceBreakdown.addonsTotal)} €)</span>
                            </div>
                          )}
                          <div className="border-t border-white/15 pt-2.5 flex justify-between font-semibold">
                            <span>Yhteensä (sis. ALV)</span>
                            <span>{fmt(priceBreakdown.totalWithAlv)} €</span>
                          </div>
                        </div>

                        {/* Work/material split */}
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

                        {/* Kotitalousvähennys */}
                        {priceBreakdown.kotitalousvahennys > 0 && (
                          <div className="mt-4 bg-green-500/15 border border-green-400/20 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-green-300 text-xs font-semibold uppercase tracking-wider">Kotitalousvähennys</p>
                                <p className="text-green-100/60 text-xs mt-0.5">
                                  {priceBreakdown.kotiRate}% työn osuudesta – {priceBreakdown.omavastuu} € omavastuu
                                </p>
                              </div>
                              <span className="text-green-300 font-bold text-lg" data-testid="kotitalousvahennys">
                                -{fmt(priceBreakdown.kotitalousvahennys)} €
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Final price */}
                        <div className="mt-5 text-center">
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Arvioitu loppuhinta</p>
                          <motion.p initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="text-4xl font-bold" data-testid="final-price">
                            {fmt(priceBreakdown.finalPrice)} €
                          </motion.p>
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <p className="text-xs text-[#94A3B8] text-center mb-6">
                        {config.global_settings.disclaimer}
                      </p>

                      {/* CTA */}
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

                      {/* Contact form */}
                      {showContactForm && !contactSent && (
                        <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          onSubmit={handleContactSubmit} className="space-y-3" data-testid="calculator-contact-form">
                          <p className="text-sm text-[#64748B] text-center mb-3">{config.global_settings.cta_subtitle}</p>
                          <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                            <input type="text" placeholder="Nimi" required value={contactForm.name}
                              onChange={e => setContactForm(p => ({...p, name: e.target.value}))}
                              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              data-testid="contact-name" />
                          </div>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                            <input type="tel" placeholder="Puhelin" required value={contactForm.phone}
                              onChange={e => setContactForm(p => ({...p, phone: e.target.value}))}
                              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              data-testid="contact-phone" />
                          </div>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                            <input type="email" placeholder="Sähköposti (valinnainen)" value={contactForm.email}
                              onChange={e => setContactForm(p => ({...p, email: e.target.value}))}
                              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              data-testid="contact-email" />
                          </div>
                          <button type="submit"
                            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            data-testid="send-contact-btn">
                            <Send size={16} /> Pyydä tarjous
                          </button>
                        </motion.form>
                      )}

                      {/* Success */}
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
                      canProceed()
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                    }`} data-testid="calc-next-btn">
                    {currentStep === totalSteps - 1 ? 'Näytä hinta' : 'Seuraava'} <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer logoUrl={settings?.logo_url} settings={settings} servicePages={servicePages} />
    </div>
  );
};

export default PriceCalculatorPage;
