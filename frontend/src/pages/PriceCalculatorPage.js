import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Paintbrush, Layers, Gem, Home, Triangle, Building2,
  ChevronRight, ChevronLeft, Check, ArrowRight,
  Phone, Mail, User, Send, RotateCcw, CheckCircle, Clock, Award, Shield, Star,
  HelpCircle, ChevronDown, Camera, Info
} from 'lucide-react';
import { Navbar, Footer } from '../App';
import {
  ProcessSection,
  ServiceFAQSection,
  ContactFormSection,
  StrongCTA,
  Subtitle,
  getImageUrl
} from './DynamicServicePage';

const API = process.env.REACT_APP_BACKEND_URL || '';
const iconMap = { Paintbrush, Layers, Gem, Home, Triangle, Building2 };
const fmt = (n) => Math.round(n).toLocaleString('fi-FI');
const STORAGE_KEY = 'jb_calculator_state';

// SEO Head
const CalculatorSEO = () => {
  useEffect(() => {
    document.title = "Hintalaskuri – Laske maalaus- ja tasoitustöiden hinta | J&B Tasoitus ja Maalaus";
    document.getElementById('root')?.classList.add('app-ready');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Laske maalaus- ja tasoitustöiden hinta-arvio hetkessä. Sisämaalaus, ulkomaalaus, tasoitustyöt, mikrosementti, kattomaalaus ja julkisivurappaus. Kotitalousvähennys lasketaan automaattisesti.');
    }
  }, []);
  return null;
};

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

// Progress bar stages
const STAGES = ['Palvelu', 'Kohde', 'Tarkennukset', 'Lisävalinnat', 'Hinta-arvio'];

const ProgressBar = ({ activeStage, onStageClick }) => (
  <div className="flex items-center w-full mb-8 md:mb-10" data-testid="progress-bar">
    {STAGES.map((name, i) => {
      const done = i < activeStage;
      const active = i === activeStage;
      const canClick = done;
      return (
        <React.Fragment key={name}>
          {i > 0 && (
            <div className={`flex-1 h-[2px] mx-1 transition-colors duration-500 ${done ? 'bg-[#0F172A]' : 'bg-[#E2E8F0]'}`} />
          )}
          <div
            className={`flex flex-col items-center gap-1 min-w-0 ${canClick ? 'cursor-pointer' : ''}`}
            onClick={() => canClick && onStageClick && onStageClick(i)}
          >
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-400 ${
              done ? 'bg-[#0F172A] text-white' : active ? 'bg-[#0F172A] text-white ring-4 ring-[#0F172A]/10' : 'bg-[#F1F5F9] text-[#94A3B8]'
            }`}>
              {done ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-[10px] md:text-xs font-medium whitespace-nowrap transition-colors ${
              active ? 'text-[#0F172A]' : done ? 'text-[#64748B]' : 'text-[#CBD5E1]'
            }`}>{name}</span>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

// Live price box (desktop sidebar + mobile bottom)
const LivePriceBox = ({ priceData, visible, isMobile }) => {
  if (!visible || !priceData) return null;
  const { totalMin, totalMax, finalMin, finalMax, kotitalousvahennys } = priceData;
  const hasPrice = totalMax > 0;

  if (isMobile) {
    return (
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 lg:hidden"
        data-testid="mobile-price-bar"
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Arvioitu hinta</p>
            {hasPrice ? (
              <motion.p key={`${totalMin}-${totalMax}`} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                className="text-lg font-bold text-[#0F172A]">
                {fmt(totalMin)} – {fmt(totalMax)} &euro;
              </motion.p>
            ) : (
              <p className="text-sm text-[#94A3B8]">Täytä tiedot...</p>
            )}
          </div>
          {hasPrice && kotitalousvahennys > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-emerald-600 font-medium">Vähennyksen jälkeen</p>
              <p className="text-sm font-semibold text-emerald-700">{fmt(finalMin)} – {fmt(finalMax)} &euro;</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="sticky top-28" data-testid="desktop-price-box">
      <div className="bg-[#FAFBFC] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
        <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Arvioitu hinta</p>
        {hasPrice ? (
          <>
            <motion.p key={`${totalMin}-${totalMax}`} initial={{ opacity: 0.6, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-[#0F172A] leading-tight">
              {fmt(totalMin)} – {fmt(totalMax)} &euro;
            </motion.p>
            {kotitalousvahennys > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <p className="text-xs text-emerald-600 font-medium mb-0.5">Kotitalousvähennyksen jälkeen</p>
                <motion.p key={`${finalMin}-${finalMax}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}
                  className="text-xl font-bold text-emerald-700">
                  noin {fmt(finalMin)} – {fmt(finalMax)} &euro;
                </motion.p>
              </div>
            )}
          </>
        ) : (
          <p className="text-lg text-[#CBD5E1] font-medium">Täytä tiedot...</p>
        )}
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          Sis. ALV 25,5 % &middot; Hinta tarkentuu yleensä &plusmn;10 %
        </p>
      </div>
    </div>
  );
};

// Step animation variants
const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 40 : -40, opacity: 0 })
};

const PriceCalculatorPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [servicePages, setServicePages] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceFaqs, setServiceFaqs] = useState([]);
  const [references, setReferences] = useState([]);

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selections, setSelections] = useState({});
  const [activeAddons, setActiveAddons] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [dontKnowMode, setDontKnowMode] = useState({});
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [dismissedWarnings, setDismissedWarnings] = useState({});
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '' });
  const [contactSent, setContactSent] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load config + settings
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/calculator-config`).then(r => r.json()),
      fetch(`${API}/api/settings`).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/service-pages`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/service-pages/hintalaskuri`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/api/services`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/faqs?service_id=hintalaskuri`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API}/api/references`).then(r => r.json()).catch(() => [])
    ]).then(([calcData, settingsData, spData, hintaPage, servicesData, faqsData, refsData]) => {
      setConfig(calcData);
      setSettings(settingsData);
      setServicePages(spData);
      setPageData(hintaPage);
      setServices(servicesData);
      setServiceFaqs(faqsData);
      setReferences(refsData);
      if (settingsData.theme_color) {
        document.documentElement.style.setProperty('--color-primary', settingsData.theme_color);
      }
      setLoading(false);
      // Restore state from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && saved.selectedService) {
          setSelectedService(saved.selectedService);
          setSelections(saved.selections || {});
          setActiveAddons(saved.activeAddons || {});
          setCurrentStep(saved.currentStep || 0);
          setDontKnowMode(saved.dontKnowMode || {});
        }
      } catch {}
    }).catch(() => setLoading(false));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!config) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedService, selections, activeAddons, currentStep, dontKnowMode, selectedPackage
      }));
    } catch {}
  }, [selectedService, selections, activeAddons, currentStep, dontKnowMode, config]);

  const enabledServices = useMemo(() =>
    config?.services?.filter(s => s.enabled).sort((a, b) => a.order - b.order) || [],
    [config]
  );

  const service = useMemo(() =>
    enabledServices.find(s => s.id === selectedService),
    [enabledServices, selectedService]
  );

  const totalSteps = service ? service.steps.length + 2 : 1; // +1 for service select, +1 for addons

  // Resolve step options (handles conditional_options)
  const getStepOptions = useCallback((step) => {
    if (step.conditional_on && step.conditional_options) {
      const refValue = selections[step.conditional_on];
      if (refValue && step.conditional_options[refValue]) {
        return step.conditional_options[refValue];
      }
    }
    return step.options || [];
  }, [selections]);

  // Calculate active stage for progress bar
  const activeStage = useMemo(() => {
    if (showResult) return 4;
    if (currentStep === 0) return 0;
    if (!service) return 0;
    const stepIdx = currentStep - 1;
    if (stepIdx === 0) return 1; // target_type = Kohde
    if (stepIdx >= service.steps.length) return 3; // addons = Lisävalinnat
    return 2; // everything else = Tarkennukset
  }, [currentStep, showResult, service]);

  // Kotitalousvähennys helper — separate calculation per price
  const calcKoti = useCallback((priceWithAlv, g, personsCount = 1) => {
    if (!g) return 0;
    const laborPct = g.labor_percentage || 70;
    const kotiRate = g.kotitalousvahennys_rate || 35;
    const kotiMaxPerPerson = g.kotitalousvahennys_max_per_person || 1600;
    const kotiMaxTotal = kotiMaxPerPerson * Math.max(1, personsCount);
    const tyonOsuus = priceWithAlv * (laborPct / 100);
    const raw = tyonOsuus * (kotiRate / 100) - 150;
    return Math.max(0, Math.min(raw, kotiMaxTotal));
  }, []);

  // Price calculation with RANGES
  const priceData = useMemo(() => {
    if (!service || !config) return null;
    const g = config.global_settings;
    let area = 0;
    let multiplier = 1;

    for (const step of service.steps) {
      if (step.type === 'slider') {
        area = selections[step.id] ?? step.default;
      } else if (step.type === 'size_cards') {
        const selected = selections[step.id];
        const opt = step.options.find(o => o.id === selected);
        if (opt && opt.area_value) area = opt.area_value;
      } else if (step.type === 'cards') {
        const selected = selections[step.id];
        const opts = getStepOptions(step);
        const opt = opts.find(o => o.id === selected);
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

    const total = basePrice + addonsTotal;
    const alvRate = g.tax_rate || 25.5;
    const totalWithAlv = total * (1 + alvRate / 100);
    const totalMin = Math.round(totalWithAlv * 0.9);
    const totalMax = Math.round(totalWithAlv * 1.15);
    const personsCount = selections.persons_count || 1;
    const kotiMin = calcKoti(totalMin, g, personsCount);
    const kotiMax = calcKoti(totalMax, g, personsCount);
    const kotitalousvahennys = Math.round((kotiMin + kotiMax) / 2);
    const finalMin = Math.max(0, Math.round(totalMin - kotiMin));
    const finalMax = Math.max(0, Math.round(totalMax - kotiMax));

    // Summary labels for result page
    const selectedLabels = [];
    for (const step of service.steps) {
      const val = selections[step.id];
      if (step.type === 'slider') {
        selectedLabels.push({ title: step.title, value: `${val ?? step.default} ${step.unit}` });
      } else if (step.type === 'size_cards') {
        const opt = step.options.find(o => o.id === val);
        if (opt) selectedLabels.push({ title: step.title, value: opt.label });
      } else if (step.type === 'cards') {
        const opts = getStepOptions(step);
        const opt = opts.find(o => o.id === val);
        if (opt) selectedLabels.push({ title: step.title, value: opt.label });
      }
    }
    const activeAddonLabels = (service.addons || []).filter(a => a.enabled && activeAddons[a.id]).map(a => a.label);

    return {
      area, basePrice, addonsTotal, total, totalWithAlv, alvRate,
      totalMin, totalMax,
      kotitalousvahennys, kotiMin, kotiMax,
      finalMin, finalMax,
      selectedLabels, activeAddonLabels,
      laborPct: g.labor_percentage || 70
    };
  }, [service, config, selections, activeAddons, calcKoti]);

  const selectService = (id) => {
    setSelectedService(id);
    setSelections({});
    setActiveAddons({});
    setDontKnowMode({});
    setSelectedPackage(null);
    setDismissedWarnings({});
    setShowResult(false);
    setShowContactForm(false);
    setContactSent(false);
    setShowBreakdown(false);
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

  // Navigate to a specific stage via progress bar click (backward only)
  const handleStageClick = (stageIdx) => {
    if (stageIdx >= activeStage) return; // only backward
    setDirection(-1);
    if (stageIdx === 0) {
      // Back to service selection
      setCurrentStep(0);
      setShowResult(false);
    } else if (stageIdx === 1) {
      setCurrentStep(1);
      setShowResult(false);
    } else if (stageIdx === 2) {
      // Tarkennukset — step after Kohde
      setCurrentStep(2);
      setShowResult(false);
    } else if (stageIdx === 3) {
      // Lisävalinnat — last step before result
      if (service) setCurrentStep(service.steps.length);
      setShowResult(false);
    }
  };

  const resetCalculator = () => {
    setSelectedService(null);
    setSelections({});
    setActiveAddons({});
    setDontKnowMode({});
    setSelectedPackage(null);
    setDismissedWarnings({});
    setShowResult(false);
    setShowContactForm(false);
    setContactSent(false);
    setShowBreakdown(false);
    setCurrentStep(0);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Apply auto-triggers + default package when entering addons step
  const addonsStepIdx = service ? service.steps.length + 1 : -1;
  const [autoTriggersApplied, setAutoTriggersApplied] = useState(false);
  useEffect(() => {
    if (!service || currentStep !== addonsStepIdx || autoTriggersApplied) return;
    const newAddons = {};
    // Apply auto-triggers based on selections
    for (const trigger of (service.auto_triggers || [])) {
      const selected = selections[trigger.if_step];
      if (selected && trigger.if_values.includes(selected)) {
        for (const addonId of trigger.enable_addons) newAddons[addonId] = true;
      }
    }
    // Apply default package (suositeltu)
    const defaultPkg = (service.packages || []).find(p => p.default);
    if (defaultPkg) {
      for (const addonId of defaultPkg.addon_ids) newAddons[addonId] = true;
      setSelectedPackage(defaultPkg.id);
    }
    // Merge: auto-triggers ON TOP of default package
    setActiveAddons(prev => ({ ...prev, ...newAddons }));
    setAutoTriggersApplied(true);
  }, [currentStep, addonsStepIdx, service, selections, autoTriggersApplied]);

  // Reset trigger tracking when service changes
  useEffect(() => { setAutoTriggersApplied(false); }, [selectedService]);

  const applyPackage = (pkgId) => {
    if (!service) return;
    setSelectedPackage(pkgId);
    setDismissedWarnings({});
    const pkg = (service.packages || []).find(p => p.id === pkgId);
    if (!pkg) return;
    const newAddons = {};
    for (const addonId of pkg.addon_ids) newAddons[addonId] = true;
    // Also keep auto-triggered addons
    for (const trigger of (service.auto_triggers || [])) {
      const selected = selections[trigger.if_step];
      if (selected && trigger.if_values.includes(selected)) {
        for (const addonId of trigger.enable_addons) newAddons[addonId] = true;
      }
    }
    setActiveAddons(newAddons);
  };

  const toggleAddon = (addonId) => {
    setSelectedPackage('custom');
    setActiveAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
    if (activeAddons[addonId]) setDismissedWarnings(prev => ({ ...prev, [addonId]: false }));
  };

  const canProceed = () => {
    if (currentStep === 0) return !!selectedService;
    if (!service) return false;
    const si = currentStep - 1;
    if (si < service.steps.length) {
      const step = service.steps[si];
      if (step.type === 'cards' || step.type === 'size_cards') return !!selections[step.id];
      return true; // sliders always have a default
    }
    return true; // addons are optional
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: contactForm.name,
          lastName: '',
          email: contactForm.email || 'ei-sahkopostia@hintalaskuri.fi',
          phone: contactForm.phone,
          message: `Hintalaskuri: ${service?.name}, arvio ${fmt(priceData?.totalMin)} – ${fmt(priceData?.totalMax)} € (kotitalousvähennyksen jälkeen ${fmt(priceData?.finalMin)} – ${fmt(priceData?.finalMax)} €)`,
          source: 'calculator'
        })
      });
    } catch {}
    setContactSent(true);
  };

  const phone = settings?.company_phone_primary || settings?.contact_phone_1 || '+358 40 054 7270';
  const areaStepIdx = service ? service.steps.findIndex(s => s.type === 'slider' || s.type === 'size_cards') : -1;
  const showPriceBox = currentStep > 0 && service && priceData && !showResult && areaStepIdx >= 0 && (currentStep - 1) >= areaStepIdx;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F172A]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar isScrolled={isScrolled} logoUrl={settings?.logo_url} />
      <CalculatorSEO />
      {config && <CalculatorSchema config={config} />}

      {/* HERO - matching site design */}
      <section className="relative min-h-[45vh] md:min-h-[50vh] flex items-center pt-16" data-testid="price-calculator-page">
        <div className="absolute inset-0">
          <img src={pageData?.hero_image_url || settings?.hero_image_url || 'https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'}
            alt="Hintalaskuri - maalaus ja tasoitustyöt" className="w-full h-full object-cover" loading="eager" />
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        <div className="container-custom relative z-10 py-10 md:py-16">
          <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-[#64748B] mb-4 md:mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Etusivu</Link>
            <ChevronRight size={14} />
            <span className="text-[#0F172A] font-medium">Hintalaskuri</span>
          </motion.nav>
          <div className="max-w-[600px]">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="uppercase text-primary mb-2 md:mb-3 text-xs md:text-sm font-semibold tracking-wider">
              HINTALASKURI
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 leading-tight" data-testid="calculator-title">
              {pageData?.hero_title || 'Laske hinta-arvio hetkessä'}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-[#64748B] mb-6 leading-relaxed">
              {pageData?.hero_subtitle || 'Saat suuntaa-antavan hinnan heti \u2013 ilman rekisteröitymistä tai yhteystietoja.'}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3">
              <a href="#laskuri" className="btn-primary inline-flex items-center justify-center gap-2 text-sm">
                Aloita laskeminen <ArrowRight size={16} />
              </a>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-secondary inline-flex items-center justify-center gap-2 text-sm">
                <Phone size={16} /> Soita nyt
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-sm md:text-base text-[#64748B]">
                <CheckCircle size={21} className="text-primary" />
                <span>Kotitalousvähennys lasketaan</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-[#64748B]">
                <CheckCircle size={21} className="text-primary" />
                <span>Ei vaadi rekisteröitymistä</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges - matching site design */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0] py-5 md:py-6">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Clock, title: settings?.trust_badge_1_title || 'Vuodesta 2018', sub: settings?.trust_badge_1_subtitle || 'Luotettava kokemus' },
              { icon: Award, title: settings?.trust_badge_2_title || 'Ammattitaitoinen työ', sub: settings?.trust_badge_2_subtitle || 'Laadukas lopputulos' },
              { icon: Shield, title: settings?.trust_badge_3_title || 'Kotitalousvähennys', sub: settings?.trust_badge_3_subtitle || 'Hyödynnä veroetu' },
              { icon: Star, title: settings?.trust_badge_4_title || 'Tyytyväisyystakuu', sub: settings?.trust_badge_4_subtitle || '100% tyytyväisyys' },
            ].map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <b.icon size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#0F172A] text-xs md:text-sm truncate">{b.title}</p>
                  <p className="text-[#64748B] text-xs hidden lg:block">{b.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="laskuri" className="section-padding bg-white pb-32 lg:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Progress bar */}
          {selectedService && <ProgressBar activeStage={activeStage} onStageClick={handleStageClick} />}

          {/* Main layout: question + sticky price */}
          <div className="flex gap-8 items-start">
            {/* Left: Question area */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 lg:p-10">
                  <AnimatePresence mode="wait" custom={direction}>

                    {/* STEP 0: Service Selection */}
                    {currentStep === 0 && !showResult && (
                      <motion.div key="svc" custom={direction} variants={stepVariants}
                        initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                        <h2 className="text-lg md:text-xl font-bold text-[#0F172A] mb-1">Valitse palvelu</h2>
                        <p className="text-sm text-[#94A3B8] mb-6">Minkä tyyppistä työtä tarvitset?</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" data-testid="service-selection">
                          {enabledServices.map((s) => {
                            const Icon = iconMap[s.icon] || Paintbrush;
                            const sel = selectedService === s.id;
                            return (
                              <motion.button key={s.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedService(s.id)}
                                className={`relative p-5 md:p-6 rounded-2xl border text-left transition-all duration-200 ${
                                  sel
                                    ? 'border-[#0F172A] bg-[#0F172A]/[0.03] shadow-md'
                                    : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm'
                                }`} data-testid={`service-card-${s.id}`}>
                                {sel && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute top-3 right-3 w-5 h-5 bg-[#0F172A] rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                  </motion.div>
                                )}
                                <Icon size={22} className={sel ? 'text-[#0F172A]' : 'text-[#94A3B8]'} strokeWidth={1.5} />
                                <h3 className="font-semibold text-[#0F172A] mt-3 text-sm">{s.name}</h3>
                                <p className="text-xs text-[#94A3B8] mt-1 hidden md:block leading-relaxed">{s.description}</p>
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
                              <h2 className="text-lg md:text-xl font-bold text-[#0F172A] mb-6">{step.title}</h2>

                              {/* CARDS type */}
                              {step.type === 'cards' && (() => {
                                const opts = getStepOptions(step);
                                return (
                                <div className={`grid gap-3 ${
                                  opts.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'
                                }`} data-testid={`step-${step.id}`}>
                                  {opts.map(opt => {
                                    const sel = selections[step.id] === opt.id;
                                    return (
                                      <motion.button key={opt.id} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelections(prev => {
                                          const next = { ...prev, [step.id]: opt.id };
                                          // Clear downstream conditional selections
                                          service.steps.forEach(s => {
                                            if (s.conditional_on === step.id) delete next[s.id];
                                          });
                                          return next;
                                        })}
                                        className={`p-4 md:p-5 rounded-2xl border text-left transition-all duration-200 ${
                                          sel
                                            ? 'border-[#0F172A] bg-[#0F172A]/[0.03] shadow-md'
                                            : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm'
                                        }`} data-testid={`option-${opt.id}`}>
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <h3 className="font-semibold text-[#0F172A] text-sm">{opt.label}</h3>
                                            {opt.description && (
                                              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{opt.description}</p>
                                            )}
                                          </div>
                                          {sel && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                              className="w-5 h-5 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                              <Check size={12} className="text-white" />
                                            </motion.div>
                                          )}
                                        </div>
                                      </motion.button>
                                    );
                                  })}
                                </div>
                                );
                              })()}

                              {/* SIZE CARDS type */}
                              {step.type === 'size_cards' && (
                                <div className={`grid gap-3 ${
                                  step.options.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'
                                }`} data-testid={`step-${step.id}`}>
                                  {step.options.map(opt => {
                                    const sel = selections[step.id] === opt.id;
                                    return (
                                      <motion.button key={opt.id} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelections(prev => ({ ...prev, [step.id]: opt.id }))}
                                        className={`p-4 md:p-5 rounded-2xl border text-left transition-all duration-200 ${
                                          sel
                                            ? 'border-[#0F172A] bg-[#0F172A]/[0.03] shadow-md'
                                            : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm'
                                        }`} data-testid={`option-${opt.id}`}>
                                        <div className="flex items-start justify-between gap-2">
                                          <h3 className="font-semibold text-[#0F172A] text-sm">{opt.label}</h3>
                                          {sel && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                              className="w-5 h-5 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0">
                                              <Check size={12} className="text-white" />
                                            </motion.div>
                                          )}
                                        </div>
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* SLIDER type with "En tiedä" option */}
                              {step.type === 'slider' && (
                                <div className="max-w-md" data-testid={`step-${step.id}`}>
                                  {!dontKnowMode[step.id] ? (
                                    <>
                                      <div className="text-center mb-8">
                                        <span className="text-5xl font-bold text-[#0F172A] tabular-nums">
                                          {selections[step.id] ?? step.default}
                                        </span>
                                        <span className="text-lg text-[#94A3B8] ml-1.5">{step.unit}</span>
                                      </div>
                                      <input type="range" min={step.min} max={step.max} step={step.step}
                                        value={selections[step.id] ?? step.default}
                                        onChange={(e) => setSelections(prev => ({ ...prev, [step.id]: Number(e.target.value) }))}
                                        className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0F172A]"
                                        data-testid="area-slider" />
                                      <div className="flex justify-between text-xs text-[#94A3B8] mt-2">
                                        <span>{step.min} {step.unit}</span>
                                        <span>{step.max} {step.unit}</span>
                                      </div>
                                      {step.dont_know_options && (
                                        <button
                                          onClick={() => setDontKnowMode(prev => ({ ...prev, [step.id]: true }))}
                                          className="mt-6 flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors mx-auto"
                                          data-testid="dont-know-btn">
                                          <HelpCircle size={15} />
                                          <span>En tiedä tarkkaa pinta-alaa</span>
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-sm text-[#64748B] mb-4">Valitse lähinnä vastaava:</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {step.dont_know_options.map(opt => {
                                          const sel = selections[step.id] === opt.area_value;
                                          return (
                                            <motion.button key={opt.id} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                                              onClick={() => setSelections(prev => ({ ...prev, [step.id]: opt.area_value }))}
                                              className={`p-4 rounded-2xl border text-center transition-all duration-200 ${
                                                sel
                                                  ? 'border-[#0F172A] bg-[#0F172A]/[0.03] shadow-md'
                                                  : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                                              }`} data-testid={`dontknow-${opt.id}`}>
                                              <h3 className="font-semibold text-[#0F172A] text-sm">{opt.label}</h3>
                                              <p className="text-xs text-[#94A3B8] mt-0.5">~{opt.area_value} {step.unit}</p>
                                            </motion.button>
                                          );
                                        })}
                                      </div>
                                      <button
                                        onClick={() => setDontKnowMode(prev => ({ ...prev, [step.id]: false }))}
                                        className="mt-4 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                                        data-testid="show-slider-btn">
                                        Syötä tarkka pinta-ala
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}

                    {/* ADDONS STEP — Packages + Grouped Cards */}
                    {service && currentStep === service.steps.length + 1 && !showResult && (
                      <motion.div key="addons" custom={direction} variants={stepVariants}
                        initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                        <h2 className="text-lg md:text-xl font-bold text-[#0F172A] mb-1">Lisävalinnat</h2>
                        <p className="text-sm text-[#94A3B8] mb-5">Valitse paketti tai räätälöi itse</p>

                        {/* Package selector */}
                        {(service.packages || []).length > 0 && (
                          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6" data-testid="package-selector">
                            {service.packages.map((pkg, i) => {
                              const isActive = selectedPackage === pkg.id;
                              const isDefault = pkg.default;
                              return (
                                <motion.button key={pkg.id} whileTap={{ scale: 0.97 }}
                                  onClick={() => applyPackage(pkg.id)}
                                  className={`relative p-3 md:p-4 rounded-xl border text-left transition-all duration-200 ${
                                    isActive
                                      ? i === 2 ? 'border-[#7C3AED] bg-[#7C3AED]/[0.04] shadow-md' : i === 1 ? 'border-[#0F172A] bg-[#0F172A]/[0.03] shadow-md' : 'border-[#10B981] bg-[#10B981]/[0.04] shadow-md'
                                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                                  }`} data-testid={`package-${pkg.id}`}>
                                  {isDefault && (
                                    <span className="absolute -top-2.5 left-3 bg-[#0F172A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Eniten valittu
                                    </span>
                                  )}
                                  <h4 className={`font-bold text-sm ${i === 2 ? 'text-[#7C3AED]' : i === 1 ? 'text-[#0F172A]' : 'text-[#10B981]'}`}>
                                    {pkg.label}
                                  </h4>
                                  <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug hidden sm:block">{pkg.description}</p>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}

                        {/* Grouped addon cards */}
                        <div className="space-y-5" data-testid="addons-step">
                          {['esityot', 'tarvittaessa', 'lisapalvelut'].map(groupId => {
                            const groupAddons = (service.addons || []).filter(a => a.enabled && a.group === groupId);
                            if (groupAddons.length === 0) return null;
                            const groupLabel = groupId === 'esityot' ? 'Esityöt' : groupId === 'tarvittaessa' ? 'Tarvittaessa' : 'Lisäpalvelut';
                            return (
                              <div key={groupId}>
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
                                  {groupLabel}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {groupAddons.map(addon => {
                                    const active = activeAddons[addon.id];
                                    const showWarning = !active && addon.warning && !dismissedWarnings[addon.id];
                                    return (
                                      <div key={addon.id}>
                                        <motion.button whileTap={{ scale: 0.98 }}
                                          onClick={() => toggleAddon(addon.id)}
                                          className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                                            active
                                              ? 'border-[#0F172A] bg-[#0F172A]/[0.03] shadow-sm'
                                              : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                                          }`} data-testid={`addon-${addon.id}`}>
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-[#0F172A] text-sm">{addon.label}</h3>
                                                {addon.badge && (
                                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                    addon.badge === 'Suositeltu' ? 'bg-[#0F172A]/10 text-[#0F172A]' : 'bg-amber-100 text-amber-700'
                                                  }`}>{addon.badge}</span>
                                                )}
                                              </div>
                                              <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{addon.hint}</p>
                                              <p className="text-xs font-semibold text-[#0F172A] mt-1.5">
                                                {addon.price_label ? addon.price_label : addon.price_per_m2 ? `+${addon.price_per_m2} €/m²` : addon.fixed_price > 0 ? `+${addon.fixed_price} €` : ''}
                                              </p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                              active ? 'bg-[#0F172A] border-[#0F172A]' : 'border-[#CBD5E1]'
                                            }`}>
                                              {active && <Check size={12} className="text-white" />}
                                            </div>
                                          </div>
                                        </motion.button>
                                        {/* Soft warning when deselected */}
                                        <AnimatePresence>
                                          {showWarning && (
                                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                                              className="text-[11px] text-amber-600 mt-1 ml-1 flex items-start gap-1">
                                              <Info size={11} className="flex-shrink-0 mt-0.5" />
                                              {addon.warning}
                                            </motion.p>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                          {/* Fallback: show ungrouped addons too */}
                          {(service.addons || []).filter(a => a.enabled && !a.group).length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(service.addons || []).filter(a => a.enabled && !a.group).map(addon => {
                                const active = activeAddons[addon.id];
                                return (
                                  <motion.button key={addon.id} whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleAddon(addon.id)}
                                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                      active ? 'border-[#0F172A] bg-[#0F172A]/[0.03] shadow-sm' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                                    }`} data-testid={`addon-${addon.id}`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <h3 className="font-semibold text-[#0F172A] text-sm">{addon.label}</h3>
                                        {addon.hint && <p className="text-xs text-[#94A3B8] mt-0.5">{addon.hint}</p>}
                                        <p className="text-xs font-semibold text-[#0F172A] mt-1.5">
                                          {addon.price_label ? addon.price_label : addon.price_per_m2 ? `+${addon.price_per_m2} €/m²` : addon.fixed_price > 0 ? `+${addon.fixed_price} €` : ''}
                                        </p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                        active ? 'bg-[#0F172A] border-[#0F172A]' : 'border-[#CBD5E1]'
                                      }`}>
                                        {active && <Check size={12} className="text-white" />}
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* RESULT PAGE */}
                    {showResult && priceData && (
                      <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }} data-testid="price-result">

                        {/* Price heading */}
                        <div className="text-center mb-8">
                          <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-2">Arvioitu hinta</p>
                          <motion.h2 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className="text-4xl md:text-5xl font-bold text-[#0F172A]" data-testid="final-price">
                            {fmt(priceData.totalMin)} – {fmt(priceData.totalMax)} &euro;
                          </motion.h2>
                          {priceData.kotitalousvahennys > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                              className="mt-3">
                              <p className="text-sm text-emerald-600 font-medium">
                                Kotitalousvähennyksen jälkeen
                              </p>
                              <p className="text-2xl font-bold text-emerald-700 mt-0.5" data-testid="kotitalousvahennys">
                                noin {fmt(priceData.finalMin)} – {fmt(priceData.finalMax)} &euro;
                              </p>
                            </motion.div>
                          )}
                          <p className="text-xs text-[#94A3B8] mt-2">Sis. ALV {priceData.alvRate} %</p>
                        </div>

                        {/* Summary: "Mihin arvio perustuu" */}
                        <div className="bg-[#F8FAFC] rounded-2xl p-5 md:p-6 mb-6">
                          <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                            <Info size={15} className="text-[#94A3B8]" />
                            Mihin arvio perustuu
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#64748B]">Palvelu</span>
                              <span className="font-medium text-[#0F172A]">{service.name}</span>
                            </div>
                            {priceData.selectedLabels.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-[#64748B]">{item.title}</span>
                                <span className="font-medium text-[#0F172A]">{item.value}</span>
                              </div>
                            ))}
                            {priceData.activeAddonLabels.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-[#64748B]">Lisäpalvelut</span>
                                <span className="font-medium text-[#0F172A]">{priceData.activeAddonLabels.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expandable: "Miten hinta muodostuu" */}
                        <button
                          onClick={() => setShowBreakdown(!showBreakdown)}
                          className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC] transition-colors mb-6"
                          data-testid="breakdown-toggle">
                          <span className="font-medium">Miten hinta muodostuu</span>
                          <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={16} />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {showBreakdown && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                              className="overflow-hidden mb-6">
                              <div className="bg-[#0F172A] rounded-2xl p-5 text-white text-sm space-y-2.5">
                                <div className="flex justify-between">
                                  <span className="text-white/60">Perustyö ({service.base_price_per_m2} &euro;/m&sup2; &times; {priceData.area} m&sup2;)</span>
                                  <span>{fmt(priceData.basePrice)} &euro;</span>
                                </div>
                                {priceData.addonsTotal > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-white/60">Lisäpalvelut</span>
                                    <span>{fmt(priceData.addonsTotal)} &euro;</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-white/60">ALV {priceData.alvRate} %</span>
                                  <span>{fmt(priceData.totalWithAlv - priceData.total)} &euro;</span>
                                </div>
                                <div className="border-t border-white/15 pt-2.5 flex justify-between font-semibold">
                                  <span>Yhteensä (sis. ALV)</span>
                                  <span>{fmt(priceData.totalWithAlv)} &euro;</span>
                                </div>
                                {priceData.kotitalousvahennys > 0 && (
                                  <div className="flex justify-between text-emerald-300">
                                    <span>Kotitalousvähennys</span>
                                    <span>-{fmt(priceData.kotitalousvahennys)} &euro;</span>
                                  </div>
                                )}
                                <p className="text-white/30 text-xs pt-2">
                                  Hintahaarukka (&times;0.9 – &times;1.15) huomioi kohteen yksilölliset tekijät.
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* CTAs */}
                        {!showContactForm && !contactSent && (
                          <div className="space-y-3">
                            <button onClick={() => setShowContactForm(true)}
                              className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl font-semibold hover:bg-[#1E293B] transition-colors flex items-center justify-center gap-2 text-sm"
                              data-testid="request-quote-btn">
                              Pyydä tarkka tarjous (maksuton) <ArrowRight size={16} />
                            </button>
                            <button onClick={() => setShowContactForm(true)}
                              className="w-full py-3.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl font-semibold hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2 text-sm"
                              data-testid="send-photos-btn">
                              <Camera size={16} /> Lähetä kuvat nopeaa arviota varten
                            </button>
                            <button onClick={resetCalculator}
                              className="w-full py-2 text-sm text-[#94A3B8] hover:text-[#0F172A] transition-colors flex items-center justify-center gap-1"
                              data-testid="recalculate-btn">
                              <RotateCcw size={13} /> Laske uudelle kohteelle
                            </button>
                          </div>
                        )}

                        {/* Contact form */}
                        {showContactForm && !contactSent && (
                          <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleContactSubmit} className="space-y-3" data-testid="calculator-contact-form">
                            <p className="text-sm text-[#64748B] text-center mb-3">
                              {config.global_settings.cta_subtitle}
                            </p>
                            <div className="relative">
                              <User size={16} className="absolute left-3.5 top-3.5 text-[#94A3B8]" />
                              <input type="text" placeholder="Nimi" required value={contactForm.name}
                                onChange={e => setContactForm(p => ({...p, name: e.target.value}))}
                                className="w-full pl-11 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:ring-2 focus:ring-[#0F172A]/10 focus:border-[#0F172A] outline-none transition-all"
                                data-testid="contact-name" />
                            </div>
                            <div className="relative">
                              <Phone size={16} className="absolute left-3.5 top-3.5 text-[#94A3B8]" />
                              <input type="tel" placeholder="Puhelin" required value={contactForm.phone}
                                onChange={e => setContactForm(p => ({...p, phone: e.target.value}))}
                                className="w-full pl-11 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:ring-2 focus:ring-[#0F172A]/10 focus:border-[#0F172A] outline-none transition-all"
                                data-testid="contact-phone" />
                            </div>
                            <div className="relative">
                              <Mail size={16} className="absolute left-3.5 top-3.5 text-[#94A3B8]" />
                              <input type="email" placeholder="Sähköposti (valinnainen)" value={contactForm.email}
                                onChange={e => setContactForm(p => ({...p, email: e.target.value}))}
                                className="w-full pl-11 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:ring-2 focus:ring-[#0F172A]/10 focus:border-[#0F172A] outline-none transition-all"
                                data-testid="contact-email" />
                            </div>
                            <button type="submit"
                              className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl font-semibold hover:bg-[#1E293B] transition-colors flex items-center justify-center gap-2 text-sm"
                              data-testid="send-contact-btn">
                              <Send size={15} /> Lähetä
                            </button>
                          </motion.form>
                        )}
                        {contactSent && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Check size={24} className="text-emerald-600" />
                            </div>
                            <p className="font-semibold text-[#0F172A] mb-1">Kiitos! Olemme yhteydessä pian.</p>
                            <p className="text-sm text-[#64748B] mb-4">Saat tarjouksen 24h sisällä.</p>
                            <button onClick={resetCalculator}
                              className="text-sm text-[#94A3B8] hover:text-[#0F172A] flex items-center gap-1 mx-auto transition-colors">
                              <RotateCcw size={13} /> Laske uudelle kohteelle
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* Navigation buttons */}
                  {!showResult && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F1F5F9]">
                      <button onClick={currentStep > 0 ? goBack : undefined}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-xl transition-colors ${
                          currentStep > 0 ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]' : 'invisible'
                        }`} data-testid="calc-back-btn">
                        <ChevronLeft size={16} /> Takaisin
                      </button>
                      <button onClick={goNext} disabled={!canProceed()}
                        className={`flex items-center gap-1.5 px-6 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                          canProceed()
                            ? 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                            : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed'
                        }`} data-testid="calc-next-btn">
                        {currentStep === totalSteps - 1 ? 'Näytä hinta-arvio' : 'Seuraava'} <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Desktop sticky price box */}
            <div className="hidden lg:block w-[300px] flex-shrink-0">
              <LivePriceBox priceData={priceData} visible={showPriceBox} />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile bottom sticky price bar */}
      <LivePriceBox priceData={priceData} visible={showPriceBox} isMobile />

      {/* DYNAMIC SERVICE PAGE SECTIONS */}
      {pageData && (
        <>
          {pageData.use_global_process !== false && <ProcessSection page={pageData} settings={settings} />}
          <ServiceFAQSection faqs={serviceFaqs} settings={settings} serviceName="Hintalaskuri" />
          <ContactFormSection page={pageData} settings={settings} />
          {/* References section */}
          {references.length > 0 && (
            <section className="service-section-grey" data-testid="references-section">
              <div className="container-custom">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-14">
                  <Subtitle settings={settings} className="mb-3">REFERENSSIT</Subtitle>
                  <h2 className="section-title">Tutustu referensseihimme</h2>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {references.slice(0, 3).map((ref, index) => (
                    <motion.div key={ref.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                      <Link to={ref.slug ? `/referenssit/${ref.slug}` : '/referenssit'} className="project-card block h-full group">
                        <div className="overflow-hidden">
                          <img
                            src={getImageUrl(ref.cover_image_url) || 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg'}
                            alt={ref.cover_image_alt || ref.name}
                            onError={(e) => { e.target.src = 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg'; }}
                          />
                        </div>
                        <div className="p-5">
                          <p className="text-xs text-primary font-medium uppercase tracking-wide mb-2">{ref.type}</p>
                          <h3 className="font-semibold text-[#0F172A] mb-2 text-base group-hover:text-primary transition-colors">{ref.name}</h3>
                          {ref.description && <p className="text-[#64748B] text-sm line-clamp-2 mb-3">{ref.description}</p>}
                          <span className="inline-flex items-center text-primary text-sm font-medium link-underline">Lue lisää <ArrowRight size={14} className="ml-1" /></span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
                  <Link to="/referenssit" className="btn-primary inline-flex items-center gap-2 text-sm">
                    Katso kaikki referenssit <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </section>
          )}
          <StrongCTA settings={settings} />
        </>
      )}

      {/* Fallback: show hardcoded content if no page data */}
      {!pageData && (
        <>
          <section className="py-16 md:py-20 bg-[#F8FAFC]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-sm prose-slate">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Maalaus- ja tasoitustöiden hinnat</h2>
              <p className="text-[#64748B] leading-relaxed">
                Maalaus- ja tasoitustöiden hinta riippuu useista tekijöistä: pinta-alasta, pinnan kunnosta, valitusta palvelusta
                ja mahdollisista lisätöistä.
              </p>
            </div>
          </section>

          <section className="py-16 md:py-20 bg-[#0F172A] text-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Haluatko tarkan tarjouksen?</h2>
              <p className="text-white/50 mb-8 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                Hintalaskuri antaa suuntaa-antavan arvion. Tarkka hinta varmistuu kartoituskäynnillä.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/#yhteystiedot"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#0F172A] font-semibold px-6 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
                  Pyydä tarjous <ArrowRight size={16} />
                </Link>
                <a href={`tel:${phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
                  <Phone size={16} /> {phone}
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer logoUrl={settings?.logo_url} settings={settings} servicePages={servicePages} />
    </>
  );
};

export default PriceCalculatorPage;
