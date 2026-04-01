import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paintbrush, Layers, Gem, Home, Triangle, Building2,
  ChevronRight, ChevronLeft, Check, Calculator, ArrowRight,
  Phone, Mail, User, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  Paintbrush, Layers, Gem, Home, Triangle, Building2
};

// Animation variants
const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 80 : -80, opacity: 0 })
};

const cardHover = {
  scale: 1.03,
  transition: { type: 'spring', stiffness: 400 }
};

// Format number with spaces
const fmt = (n) => Math.round(n).toLocaleString('fi-FI');

const PriceCalculatorPage = ({ settings }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0 = service selection
  const [direction, setDirection] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selections, setSelections] = useState({});
  const [activeAddons, setActiveAddons] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    fetch(`${API}/calculator-config`)
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const enabledServices = useMemo(() => 
    config?.services?.filter(s => s.enabled).sort((a, b) => a.order - b.order) || [],
    [config]
  );

  const service = useMemo(() => 
    enabledServices.find(s => s.id === selectedService),
    [enabledServices, selectedService]
  );

  const totalSteps = service ? service.steps.length + 2 : 1; // service + steps + addons

  // Calculate price
  const priceBreakdown = useMemo(() => {
    if (!service || !config) return null;
    const g = config.global_settings;
    let area = 0;
    let multiplier = 1;

    for (const step of service.steps) {
      if (step.type === 'slider') {
        area = selections[step.id] || step.default;
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

    const subtotal = basePrice + addonsTotal;
    const taxAmount = subtotal * (g.tax_rate / 100);
    const totalWithTax = subtotal + taxAmount;
    const laborPortion = totalWithTax * (g.labor_percentage / 100);
    const materialPortion = totalWithTax * (g.material_percentage / 100);
    const kotitalousvahennys = Math.min(
      laborPortion * (g.kotitalousvahennys_rate / 100),
      g.kotitalousvahennys_max_per_person
    );
    const finalPrice = totalWithTax - kotitalousvahennys;

    return {
      area,
      basePrice,
      addonsTotal,
      subtotal,
      taxRate: g.tax_rate,
      taxAmount,
      totalWithTax,
      laborPortion,
      materialPortion,
      kotitalousvahennysRate: g.kotitalousvahennys_rate,
      kotitalousvahennys,
      finalPrice
    };
  }, [service, config, selections, activeAddons]);

  const selectService = (id) => {
    setSelectedService(id);
    setSelections({});
    setActiveAddons({});
    setShowResult(false);
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
    if (showResult) {
      setShowResult(false);
      return;
    }
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
    return true; // addons step, always can proceed
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          message: `Hintalaskurin arvio: ${service?.name} - ${fmt(priceBreakdown?.finalPrice)} € (${priceBreakdown?.area} m²)`,
          source: 'calculator'
        })
      });
    } catch (e) { /* silent */ }
    setContactSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F172A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="price-calculator-page">
      {/* Hero */}
      <div className="bg-[#0F172A] text-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Calculator size={16} />
              <span>Hintalaskuri</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" data-testid="calculator-title">
              Laske hinta-arvio hetkessä
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
              Saat suuntaa-antavan hinnan heti – ilman rekisteröitymistä tai yhteystietojen jättämistä.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Calculator body */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
          {/* Progress bar */}
          {selectedService && !showResult && (
            <div className="h-1.5 bg-[#F1F5F9]">
              <motion.div
                className="h-full bg-[#0F172A]"
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
                <motion.div
                  key="service-select"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-2">Valitse palvelu</h2>
                    <p className="text-sm text-[#64748B]">Minkä tyyppistä työtä tarvitset?</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" data-testid="service-selection">
                    {enabledServices.map((s) => {
                      const Icon = iconMap[s.icon] || Paintbrush;
                      const isSelected = selectedService === s.id;
                      return (
                        <motion.button
                          key={s.id}
                          whileHover={cardHover}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedService(s.id)}
                          className={`relative p-4 md:p-6 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-[#0F172A] bg-[#0F172A]/5 shadow-lg'
                              : 'border-[#E2E8F0] hover:border-[#94A3B8] hover:shadow-md'
                          }`}
                          data-testid={`service-card-${s.id}`}
                        >
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center"
                            >
                              <Check size={14} className="text-white" />
                            </motion.div>
                          )}
                          <Icon size={28} className={isSelected ? 'text-[#0F172A]' : 'text-[#64748B]'} />
                          <h3 className="font-semibold text-[#0F172A] mt-3 text-sm md:text-base">{s.name}</h3>
                          <p className="text-xs text-[#94A3B8] mt-1 hidden md:block">{s.description}</p>
                          <p className="text-xs font-medium text-[#0F172A] mt-2">alk. {s.base_price_per_m2} €/m²</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* DYNAMIC STEPS */}
              {service && currentStep > 0 && currentStep <= service.steps.length && !showResult && (
                <motion.div
                  key={`step-${currentStep}`}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.3 }}
                >
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
                          <div className={`grid gap-3 ${step.options.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-' + Math.min(step.options.length, 4)}`} data-testid={`step-${step.id}`}>
                            {step.options.map(opt => {
                              const isSelected = selections[step.id] === opt.id;
                              return (
                                <motion.button
                                  key={opt.id}
                                  whileHover={cardHover}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setSelections(prev => ({ ...prev, [step.id]: opt.id }))}
                                  className={`p-4 md:p-5 rounded-xl border-2 text-left transition-all ${
                                    isSelected
                                      ? 'border-[#0F172A] bg-[#0F172A]/5 shadow-lg'
                                      : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                                  }`}
                                  data-testid={`option-${opt.id}`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-semibold text-[#0F172A] text-sm md:text-base">{opt.label}</h3>
                                      {opt.description && (
                                        <p className="text-xs text-[#94A3B8] mt-1">{opt.description}</p>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="w-6 h-6 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0"
                                      >
                                        <Check size={14} className="text-white" />
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}

                        {step.type === 'slider' && (
                          <div className="max-w-lg mx-auto" data-testid={`step-${step.id}`}>
                            <div className="text-center mb-8">
                              <motion.div
                                key={selections[step.id] || step.default}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-block"
                              >
                                <span className="text-5xl md:text-6xl font-bold text-[#0F172A]">
                                  {selections[step.id] || step.default}
                                </span>
                                <span className="text-xl text-[#64748B] ml-2">{step.unit}</span>
                              </motion.div>
                            </div>
                            <input
                              type="range"
                              min={step.min}
                              max={step.max}
                              step={step.step}
                              value={selections[step.id] || step.default}
                              onChange={(e) => setSelections(prev => ({ ...prev, [step.id]: Number(e.target.value) }))}
                              className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0F172A]"
                              data-testid="area-slider"
                            />
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
                <motion.div
                  key="addons"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">
                      Vaihe {currentStep} / {totalSteps - 1}
                    </p>
                    <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">Lisäpalvelut</h2>
                    <p className="text-sm text-[#64748B] mt-1">Valitse tarvitsemasi lisäpalvelut (valinnainen)</p>
                  </div>
                  <div className="max-w-lg mx-auto space-y-3" data-testid="addons-step">
                    {(service.addons || []).filter(a => a.enabled).map(addon => {
                      const isActive = activeAddons[addon.id];
                      return (
                        <motion.button
                          key={addon.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setActiveAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            isActive
                              ? 'border-[#0F172A] bg-[#0F172A]/5'
                              : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                          }`}
                          data-testid={`addon-${addon.id}`}
                        >
                          <div className="text-left">
                            <span className="font-medium text-[#0F172A] text-sm">{addon.label}</span>
                            <span className="text-xs text-[#94A3B8] ml-2">
                              {addon.price_per_m2 ? `${addon.price_per_m2} €/m²` : addon.fixed_price ? `${addon.fixed_price} €` : 'Sisältyy'}
                            </span>
                          </div>
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            isActive ? 'bg-[#0F172A] border-[#0F172A]' : 'border-[#CBD5E1]'
                          }`}>
                            {isActive && <Check size={14} className="text-white" />}
                          </div>
                        </motion.button>
                      );
                    })}
                    {(!service.addons || service.addons.filter(a => a.enabled).length === 0) && (
                      <p className="text-center text-[#94A3B8] py-4">Ei lisäpalveluja saatavilla tälle palvelulle.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* RESULT */}
              {showResult && priceBreakdown && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  data-testid="price-result"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">Hinta-arvio: {service.name}</h2>
                    <p className="text-sm text-[#64748B] mt-1">{priceBreakdown.area} m² &middot; {config.global_settings.disclaimer}</p>
                  </div>

                  {/* Price card */}
                  <div className="max-w-lg mx-auto">
                    <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-6 md:p-8 text-white mb-6">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Työn osuus ({config.global_settings.labor_percentage}%)</span>
                          <span>{fmt(priceBreakdown.laborPortion)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Materiaalit ({config.global_settings.material_percentage}%)</span>
                          <span>{fmt(priceBreakdown.materialPortion)} €</span>
                        </div>
                        {priceBreakdown.addonsTotal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Lisäpalvelut</span>
                            <span>{fmt(priceBreakdown.addonsTotal)} €</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-white/70">ALV {config.global_settings.tax_rate}%</span>
                          <span>{fmt(priceBreakdown.taxAmount)} €</span>
                        </div>
                        <div className="border-t border-white/20 pt-3 flex justify-between font-semibold text-base">
                          <span>Yhteensä</span>
                          <span>{fmt(priceBreakdown.totalWithTax)} €</span>
                        </div>
                      </div>

                      {/* Kotitalousvähennys */}
                      <div className="mt-4 bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-green-300 text-xs font-medium uppercase tracking-wider">Kotitalousvähennys</p>
                            <p className="text-green-100 text-xs mt-0.5">{config.global_settings.kotitalousvahennys_rate}% työn osuudesta</p>
                          </div>
                          <span className="text-green-300 font-bold text-lg">-{fmt(priceBreakdown.kotitalousvahennys)} €</span>
                        </div>
                      </div>

                      {/* Final price */}
                      <div className="mt-6 text-center">
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Arvioitu loppuhinta</p>
                        <motion.p
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                          className="text-4xl md:text-5xl font-bold"
                          data-testid="final-price"
                        >
                          {fmt(priceBreakdown.finalPrice)} €
                        </motion.p>
                      </div>
                    </div>

                    {/* CTA */}
                    {!showContactForm && !contactSent && (
                      <div className="text-center space-y-3">
                        <button
                          onClick={() => setShowContactForm(true)}
                          className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl font-semibold hover:bg-[#1E293B] transition-colors flex items-center justify-center gap-2"
                          data-testid="request-quote-btn"
                        >
                          {config.global_settings.cta_title} <ArrowRight size={18} />
                        </button>
                        <button
                          onClick={resetCalculator}
                          className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                          data-testid="recalculate-btn"
                        >
                          Laske uudelle kohteelle
                        </button>
                      </div>
                    )}

                    {/* Contact Form */}
                    {showContactForm && !contactSent && (
                      <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleContactSubmit}
                        className="space-y-3"
                        data-testid="calculator-contact-form"
                      >
                        <p className="text-sm text-[#64748B] text-center mb-4">{config.global_settings.cta_subtitle}</p>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                          <input type="text" placeholder="Nimi" value={contactForm.name} onChange={e => setContactForm(p => ({...p, name: e.target.value}))} required className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] outline-none" data-testid="contact-name" />
                        </div>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                          <input type="tel" placeholder="Puhelin" value={contactForm.phone} onChange={e => setContactForm(p => ({...p, phone: e.target.value}))} required className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] outline-none" data-testid="contact-phone" />
                        </div>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-3 text-[#94A3B8]" />
                          <input type="email" placeholder="Sähköposti" value={contactForm.email} onChange={e => setContactForm(p => ({...p, email: e.target.value}))} className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] outline-none" data-testid="contact-email" />
                        </div>
                        <button type="submit" className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-semibold hover:bg-[#1E293B] transition-colors flex items-center justify-center gap-2" data-testid="send-contact-btn">
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
                        <button onClick={resetCalculator} className="mt-3 text-sm text-[#64748B] hover:text-[#0F172A]">
                          Laske uudelle kohteelle
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {!showResult && (
              <div className="flex justify-between mt-8 pt-6 border-t border-[#F1F5F9]">
                <button
                  onClick={currentStep > 0 ? goBack : undefined}
                  className={`flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentStep > 0 ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]' : 'invisible'
                  }`}
                  data-testid="calc-back-btn"
                >
                  <ChevronLeft size={16} /> Takaisin
                </button>

                {/* Live price preview */}
                {service && priceBreakdown && currentStep > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-[#94A3B8]">Arvio</p>
                    <p className="font-bold text-[#0F172A]">{fmt(priceBreakdown.finalPrice)} €</p>
                  </div>
                )}

                <button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className={`flex items-center gap-1 px-6 py-2 text-sm rounded-lg font-medium transition-all ${
                    canProceed()
                      ? 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                      : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                  }`}
                  data-testid="calc-next-btn"
                >
                  {currentStep === totalSteps - 1 ? 'Näytä hinta' : 'Seuraava'} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculatorPage;
