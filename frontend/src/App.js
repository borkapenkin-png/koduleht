import { useState, useEffect } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X, 
  ChevronDown,
  Paintbrush,
  Building2,
  Layers,
  CheckCircle,
  ArrowRight,
  Send
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navbar = ({ isScrolled, activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#palvelut", label: "Palvelut" },
    { href: "#meista", label: "Meistä" },
    { href: "#referenssit", label: "Referenssit" },
    { href: "#yhteystiedot", label: "Yhteystiedot" },
  ];

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "navbar-glass shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" data-testid="logo-link" className="flex items-center gap-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/7282ajdy_jb2-logo.pdf"
              alt="J&B Tasoitus & Maalaus"
              className="h-10 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-[#0056D2] ${
                  activeSection === link.href.substring(1)
                    ? "text-[#0056D2]"
                    : "text-[#64748B]"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#yhteystiedot"
              data-testid="cta-tarjouspyynto"
              className="btn-primary text-sm"
            >
              Pyydä tarjous
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden p-2 text-[#0F172A]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-[#E2E8F0]"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-[#64748B] hover:text-[#0056D2] hover:bg-[#EBF3FF]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="px-4 pt-2">
                  <a
                    href="#yhteystiedot"
                    className="btn-primary block text-center text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pyydä tarjous
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt="Ammattimainen maalari työssä"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 pt-20">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-slogan text-[#0056D2] text-lg md:text-xl mb-4"
          >
            LAATUJOHTAJAT
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#0F172A] mb-6 leading-tight"
          >
            Ammattitaitoista
            <br />
            <span className="text-[#0056D2]">maalausta</span> ja
            <br />
            tasoitusta
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#64748B] mb-8 max-w-xl leading-relaxed"
          >
            Uudellamaalla toimiva luotettava ammattilainen vuodesta 2018. 
            Sisä- ja ulkomaalaukset, julkisivurappaukset sekä tapetoinnit 
            avaimet käteen -periaatteella.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="#yhteystiedot" data-testid="hero-cta-primary" className="btn-primary inline-flex items-center justify-center gap-2">
              Pyydä ilmainen arvio
              <ArrowRight size={18} />
            </a>
            <a href="#palvelut" data-testid="hero-cta-secondary" className="btn-secondary inline-flex items-center justify-center gap-2">
              Tutustu palveluihin
              <ChevronDown size={18} />
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex items-center gap-8"
          >
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <CheckCircle size={18} className="text-[#0056D2]" />
              <span>Kotitalousvähennys</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <CheckCircle size={18} className="text-[#0056D2]" />
              <span>Tyytyväisyystakuu</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown size={32} className="text-[#0056D2] opacity-60" />
      </motion.div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const services = [
    {
      icon: Building2,
      title: "Julkisivurappaus",
      description: "Julkisivun rappaus antaa tasalaatuisen sadetta ja muita sään rasituksia suojaavan pinnan rakenteille. Teemme kokonaisvaltaisia julkisivurappauksia sekä osarappauksia.",
      image: "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      icon: Layers,
      title: "Tasoitustyöt",
      description: "Tasoitetyöt tulee tehdä huolella ennen uutta pintamateriaalia. Kokenut ammattilainen takaa tasaisen ja siistin lopputuloksen oikeilla välineillä.",
      image: "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      icon: Paintbrush,
      title: "Maalaustyöt",
      description: "Maalaustyöt sisätiloihin ja ulkopinnoille huolellisesti toiveidenne mukaan. Palvelemme yrityksiä, yksityisasiakkaita ja taloyhtiöitä.",
      image: "https://images.pexels.com/photos/5691629/pexels-photo-5691629.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    }
  ];

  return (
    <section id="palvelut" data-testid="services-section" className="section-padding bg-[#FAFAFA]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-slogan text-[#0056D2] text-sm mb-3">MITÄ TEEMME</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Palvelumme</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              data-testid={`service-card-${index}`}
              className="service-card group overflow-hidden"
            >
              {/* Service Image */}
              <div className="aspect-[16/10] overflow-hidden -mx-8 -mt-8 mb-6">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#EBF3FF] flex items-center justify-center">
                  <service.icon size={20} className="text-[#0056D2]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">{service.title}</h3>
              </div>
              <p className="text-[#64748B] leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  return (
    <section id="meista" data-testid="about-section" className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src="https://images.pexels.com/photos/7941435/pexels-photo-7941435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Tasoitustyö"
              className="w-full h-[400px] lg:h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-[#0056D2] text-white p-6 hidden lg:block">
              <p className="font-slogan text-3xl">2018</p>
              <p className="text-sm opacity-80">vuodesta alkaen</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-slogan text-[#0056D2] text-sm mb-3">TIETOA MEISTÄ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-6">
              Luotettava kumppani pintaremontteihin
            </h2>
            <div className="space-y-4 text-[#64748B] leading-relaxed">
              <p>
                J&B Tasoitus Ja Maalaus Oy on Uudellamaalla toimiva luotettava maalaustöiden 
                ammattilainen. Olemme tehneet sisä- ja ulkomaalauksia vuodesta 2018.
              </p>
              <p>
                Meiltä sujuu myös katto- ja julkisivumaalaukset, julkisivurappaukset sekä 
                sisäpintojen tapetoinnit. Toiminnassa panostamme asiakaslähtöisyyteen, 
                joustavuuteen ja ensiluokkaiseen työnlaatuun.
              </p>
              <p>
                Teemme työt avaimet käteen -periaatteella ja tarjoamme asiakkaillemme 
                tyytyväisyystakuun.
              </p>
            </div>

            <div className="mt-8 p-6 bg-[#EBF3FF] border-l-4 border-[#0056D2]">
              <p className="font-medium text-[#0F172A] mb-2">Muista kotitalousvähennys!</p>
              <p className="text-sm text-[#64748B]">
                Maalaus luokitellaan kunnossapitotyöhön, joka oikeuttaa kotitalousvähennykseen.
              </p>
              <a 
                href="https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot-ja-vahennykset/kotitalousvahennys/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#0056D2] text-sm font-medium mt-2 hover:underline"
              >
                Lue lisää vero.fi
                <ArrowRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// References Section - Text only cards without images
const ReferencesSection = () => {
  const references = [
    {
      name: "Mehiläinen Ympyrätalo",
      type: "Tasoitus- ja maalaustyöt",
      description: "Laaja sisätilojen pintakäsittely terveydenhuollon tiloissa."
    },
    {
      name: "Crowne Plaza Hotel",
      type: "Tasoitus- ja maalaustyöt",
      description: "Hotellin julkisten tilojen ja huoneiden maalaustyöt."
    },
    {
      name: "Ressun lukio",
      type: "Tasoitus- ja maalaustyöt",
      description: "Koulun sisätilojen kunnostus ja maalaus."
    },
    {
      name: "Jumbo Stockmann",
      type: "Tasoitus- ja maalaustyöt",
      description: "Liiketilan pintakäsittely ja viimeistely."
    },
    {
      name: "Myllypuro koulu",
      type: "Tasoitus- ja maalaustyöt",
      description: "Uuden koulun sisäpintojen tasoitus ja maalaus."
    },
    {
      name: "Ester1",
      type: "Tasoitus- ja maalaustyöt",
      description: "Asuinrakennuksen sisäpintojen käsittely."
    }
  ];

  return (
    <section id="referenssit" data-testid="references-section" className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-slogan text-[#0056D2] text-sm mb-3">TYÖNÄYTTEITÄ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Referenssit</h2>
          <p className="text-[#64748B] mt-4 max-w-2xl mx-auto">
            Olemme toteuttaneet lukuisia projekteja yrityksille, taloyhtiöille ja yksityisille asiakkaille.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {references.map((ref, index) => (
            <motion.div
              key={ref.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              data-testid={`reference-card-${index}`}
              className="bg-[#FAFAFA] border border-[#E2E8F0] p-6 hover:border-[#0056D2]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0056D2] transition-colors">
                  <Building2 size={20} className="text-[#0056D2] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0056D2] transition-colors">
                    {ref.name}
                  </h3>
                  <p className="text-sm text-[#0056D2] font-medium mt-1">{ref.type}</p>
                  <p className="text-sm text-[#64748B] mt-2">{ref.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Quality Guarantee Section
const QualitySection = () => {
  const features = [
    "Tyytyväisyystakuu",
    "Avaimet käteen -palvelu",
    "Kotitalousvähennys",
    "Ilmainen arviokäynti"
  ];

  return (
    <section data-testid="quality-section" className="section-padding bg-[#0056D2]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-slogan text-white/60 text-sm mb-3">MIKSI VALITA MEIDÄT</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Laatutakuu</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white/10 flex items-center justify-center mb-4">
                  <CheckCircle size={28} className="text-white" />
                </div>
                <p className="text-white font-medium text-center">{feature}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    }
    
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="yhteystiedot" data-testid="contact-section" className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-slogan text-[#0056D2] text-sm mb-3">OTA YHTEYTTÄ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-6">Yhteystiedot</h2>
            <p className="text-[#64748B] mb-8 leading-relaxed">
              Lähetä tarjouspyyntö tai pyydä meidät ilmaiselle arviokäynnille. 
              Saat sähköpostiisi tarjouksen, jossa kerromme tarkasti urakan eri vaiheet.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-[#0056D2]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">Päätoimisto</p>
                  <p className="text-[#64748B]">Sienitie 52, 00760 Helsinki</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-[#0056D2]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">Sähköposti</p>
                  <a href="mailto:info@jbtasoitusmaalaus.fi" className="text-[#0056D2] hover:underline">
                    info@jbtasoitusmaalaus.fi
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-[#0056D2]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">Puhelin</p>
                  <div className="text-[#64748B] space-y-1">
                    <p>Boris Penkin: <a href="tel:+358400547270" className="text-[#0056D2] hover:underline">+358 40 054 7270</a></p>
                    <p>Joosep Rohusaar: <a href="tel:+358400298247" className="text-[#0056D2] hover:underline">+358 40 029 8247</a></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment info */}
            <div className="mt-10 p-6 bg-[#FAFAFA] border border-[#E2E8F0]">
              <p className="font-medium text-[#0F172A] mb-2">Työpaikkahaku</p>
              <p className="text-sm text-[#64748B]">
                Haluatko töihin? Lähetä CV ja saatekirje osoitteeseen: info@jbtasoitusmaalaus.fi
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#FAFAFA] p-8 border border-[#E2E8F0]">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Lähetä tarjouspyyntö</h3>
              
              <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#0F172A] mb-2">
                      Etunimi *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      data-testid="input-firstname"
                      className="form-input"
                      placeholder="Etunimi"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#0F172A] mb-2">
                      Sukunimi *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      data-testid="input-lastname"
                      className="form-input"
                      placeholder="Sukunimi"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-2">
                    Sähköposti *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    data-testid="input-email"
                    className="form-input"
                    placeholder="email@esimerkki.fi"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#0F172A] mb-2">
                    Puhelin
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    data-testid="input-phone"
                    className="form-input"
                    placeholder="+358 40 123 4567"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#0F172A] mb-2">
                    Aihe
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    data-testid="input-subject"
                    className="form-input"
                    placeholder="Esim. Tarjouspyyntö sisämaalauksesta"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#0F172A] mb-2">
                    Viesti *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    data-testid="input-message"
                    className="form-input resize-none"
                    placeholder="Kerro projektistasi..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-button"
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    "Lähetetään..."
                  ) : (
                    <>
                      Lähetä viesti
                      <Send size={18} />
                    </>
                  )}
                </button>

                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm"
                  >
                    Kiitos viestistäsi! Otamme sinuun yhteyttä pian.
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm"
                  >
                    Viestin lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä sähköpostilla.
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-testid="footer" className="bg-[#0F172A] text-white py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-xl font-bold">
              J&B <span className="text-[#0056D2]">Tasoitus & Maalaus</span>
            </p>
            <p className="text-white/60 text-sm mt-1">Laatujohtajat vuodesta 2018</p>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-white/60">
            <a href="#palvelut" className="hover:text-white transition-colors">Palvelut</a>
            <a href="#meista" className="hover:text-white transition-colors">Meistä</a>
            <a href="#referenssit" className="hover:text-white transition-colors">Referenssit</a>
            <a href="#yhteystiedot" className="hover:text-white transition-colors">Yhteystiedot</a>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
          <p>© {currentYear} J&B Tasoitus ja Maalaus Oy. Kaikki oikeudet pidätetään.</p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = ["palvelut", "meista", "referenssit", "yhteystiedot"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="App" data-testid="app-container">
      <Navbar isScrolled={isScrolled} activeSection={activeSection} />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <ReferencesSection />
        <QualitySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
