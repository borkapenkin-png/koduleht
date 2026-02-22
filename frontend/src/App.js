import { useState, useEffect } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route, useNavigate, Link } from "react-router-dom";
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
  Send,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  MessageSquare,
  Briefcase,
  Image
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Logo URL
const LOGO_URL = "https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/y0ykpqft_jb2-logo.png";

// Icon mapping
const iconMap = {
  Building2: Building2,
  Layers: Layers,
  Paintbrush: Paintbrush,
};

// ========== NAVIGATION ==========
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
          <a href="#" data-testid="logo-link" className="flex items-center">
            <img 
              src={LOGO_URL} 
              alt="J&B Tasoitus & Maalaus" 
              className="h-8 md:h-10 w-auto max-w-[200px]"
            />
          </a>

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

          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden p-2 text-[#0F172A]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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

// ========== HERO SECTION ==========
const HeroSection = () => {
  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt="Ammattimainen maalari työssä"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0"></div>
      </div>

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

// ========== SERVICES SECTION (Dynamic) ==========
const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      // Fallback to default services
      setServices([
        {
          id: "1",
          title: "Julkisivurappaus",
          description: "Julkisivun rappaus antaa tasalaatuisen sadetta ja muita sään rasituksia suojaavan pinnan rakenteille.",
          icon: "Building2",
          image_url: "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
        },
        {
          id: "2",
          title: "Tasoitustyöt",
          description: "Tasoitetyöt tulee tehdä huolella ennen uutta pintamateriaalia.",
          icon: "Layers",
          image_url: "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
        },
        {
          id: "3",
          title: "Maalaustyöt",
          description: "Maalaustyöt sisätiloihin ja ulkopinnoille huolellisesti toiveidenne mukaan.",
          icon: "Paintbrush",
          image_url: "https://images.pexels.com/photos/5691629/pexels-photo-5691629.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
        }
      ]);
    }
    setLoading(false);
  };

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

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056D2]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Building2;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  data-testid={`service-card-${index}`}
                  className="service-card group overflow-hidden"
                >
                  {service.image_url && (
                    <div className="aspect-[16/10] overflow-hidden -mx-8 -mt-8 mb-6">
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#EBF3FF] flex items-center justify-center">
                      <IconComponent size={20} className="text-[#0056D2]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A]">{service.title}</h3>
                  </div>
                  <p className="text-[#64748B] leading-relaxed">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// ========== ABOUT SECTION ==========
const AboutSection = () => {
  return (
    <section id="meista" data-testid="about-section" className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
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

// ========== REFERENCES SECTION (Dynamic) ==========
const ReferencesSection = () => {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      const response = await axios.get(`${API}/references`);
      setReferences(response.data);
    } catch (error) {
      console.error("Error fetching references:", error);
      // Fallback
      setReferences([
        { id: "1", name: "Mehiläinen Ympyrätalo", type: "Tasoitus- ja maalaustyöt", description: "Laaja sisätilojen pintakäsittely." },
        { id: "2", name: "Crowne Plaza Hotel", type: "Tasoitus- ja maalaustyöt", description: "Hotellin maalaustyöt." },
        { id: "3", name: "Ressun lukio", type: "Tasoitus- ja maalaustyöt", description: "Koulun sisätilojen kunnostus." },
      ]);
    }
    setLoading(false);
  };

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

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056D2]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {references.map((ref, index) => (
              <motion.div
                key={ref.id}
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
                    {ref.description && (
                      <p className="text-sm text-[#64748B] mt-2">{ref.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ========== QUALITY SECTION ==========
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

// ========== CONTACT SECTION ==========
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
      setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
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

            <div className="mt-10 p-6 bg-[#FAFAFA] border border-[#E2E8F0]">
              <p className="font-medium text-[#0F172A] mb-2">Työpaikkahaku</p>
              <p className="text-sm text-[#64748B]">
                Haluatko töihin? Lähetä CV ja saatekirje: info@jbtasoitusmaalaus.fi
              </p>
            </div>
          </motion.div>

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
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#0F172A] mb-2">Etunimi *</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required data-testid="input-firstname" className="form-input" placeholder="Etunimi" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#0F172A] mb-2">Sukunimi *</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required data-testid="input-lastname" className="form-input" placeholder="Sukunimi" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-2">Sähköposti *</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required data-testid="input-email" className="form-input" placeholder="email@esimerkki.fi" />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#0F172A] mb-2">Puhelin</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} data-testid="input-phone" className="form-input" placeholder="+358 40 123 4567" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#0F172A] mb-2">Aihe</label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} data-testid="input-subject" className="form-input" placeholder="Esim. Tarjouspyyntö sisämaalauksesta" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#0F172A] mb-2">Viesti *</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} data-testid="input-message" className="form-input resize-none" placeholder="Kerro projektistasi..." />
                </div>

                <button type="submit" disabled={isSubmitting} data-testid="submit-button" className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSubmitting ? "Lähetetään..." : (<>Lähetä viesti<Send size={18} /></>)}
                </button>

                {submitStatus === "success" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm">
                    Kiitos viestistäsi! Otamme sinuun yhteyttä pian.
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                    Viestin lähetys epäonnistui. Yritä uudelleen.
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

// ========== FOOTER ==========
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-testid="footer" className="bg-[#0F172A] text-white py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="J&B Tasoitus & Maalaus" className="h-8 w-auto brightness-0 invert" />
            <p className="text-white/60 text-sm">Laatujohtajat vuodesta 2018</p>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-white/60">
            <a href="#palvelut" className="hover:text-white transition-colors">Palvelut</a>
            <a href="#meista" className="hover:text-white transition-colors">Meistä</a>
            <a href="#referenssit" className="hover:text-white transition-colors">Referenssit</a>
            <a href="#yhteystiedot" className="hover:text-white transition-colors">Yhteystiedot</a>
            <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1">
              <Settings size={14} />
              Admin
            </Link>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
          <p>© {currentYear} J&B Tasoitus ja Maalaus Oy. Kaikki oikeudet pidätetään.</p>
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
  const [activeTab, setActiveTab] = useState("services");
  const [services, setServices] = useState([]);
  const [references, setReferences] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState(null);

  const getAuthHeader = () => {
    return { auth: { username: credentials.username, password: credentials.password } };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await axios.get(`${API}/admin/verify`, getAuthHeader());
      setIsAuthenticated(true);
      loadData();
    } catch (error) {
      setAuthError("Väärä käyttäjätunnus tai salasana");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesRes, refsRes, contactsRes] = await Promise.all([
        axios.get(`${API}/services`),
        axios.get(`${API}/references`),
        axios.get(`${API}/admin/contacts`, getAuthHeader())
      ]);
      setServices(servicesRes.data);
      setReferences(refsRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const seedData = async () => {
    try {
      await axios.post(`${API}/admin/seed`, {}, getAuthHeader());
      loadData();
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  // Service CRUD
  const saveService = async (service) => {
    try {
      if (service.id) {
        await axios.put(`${API}/admin/services/${service.id}`, service, getAuthHeader());
      } else {
        await axios.post(`${API}/admin/services`, service, getAuthHeader());
      }
      loadData();
      setEditingItem(null);
      setNewItem(null);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän palvelun?")) return;
    try {
      await axios.delete(`${API}/admin/services/${id}`, getAuthHeader());
      loadData();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // Reference CRUD
  const saveReference = async (ref) => {
    try {
      if (ref.id) {
        await axios.put(`${API}/admin/references/${ref.id}`, ref, getAuthHeader());
      } else {
        await axios.post(`${API}/admin/references`, ref, getAuthHeader());
      }
      loadData();
      setEditingItem(null);
      setNewItem(null);
    } catch (error) {
      console.error("Error saving reference:", error);
    }
  };

  const deleteReference = async (id) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän referenssin?")) return;
    try {
      await axios.delete(`${API}/admin/references/${id}`, getAuthHeader());
      loadData();
    } catch (error) {
      console.error("Error deleting reference:", error);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän viestin?")) return;
    try {
      await axios.delete(`${API}/admin/contacts/${id}`, getAuthHeader());
      loadData();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="bg-white p-8 border border-[#E2E8F0] w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="J&B" className="h-12" />
          </div>
          <h1 className="text-2xl font-bold text-center text-[#0F172A] mb-6">Admin-paneeli</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Käyttäjätunnus</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Salasana</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="form-input"
                required
              />
            </div>
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <button type="submit" className="btn-primary w-full">Kirjaudu</button>
          </form>
          
          <Link to="/" className="block text-center text-sm text-[#64748B] mt-4 hover:text-[#0056D2]">
            ← Takaisin etusivulle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="container-custom flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="J&B" className="h-8" />
            <span className="font-bold text-[#0F172A]">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-[#64748B] hover:text-[#0056D2]">Katso sivusto</Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 text-sm text-[#64748B] hover:text-red-600"
            >
              <LogOut size={16} />
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#E2E8F0]">
          {[
            { id: "services", label: "Palvelut", icon: Briefcase },
            { id: "references", label: "Referenssit", icon: Building2 },
            { id: "contacts", label: "Viestit", icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-[#0056D2] text-[#0056D2]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.id === "contacts" && contacts.length > 0 && (
                <span className="bg-[#0056D2] text-white text-xs px-2 py-0.5 rounded-full">{contacts.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056D2]"></div>
          </div>
        ) : (
          <>
            {/* Services Tab */}
            {activeTab === "services" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#0F172A]">Palvelut ({services.length})</h2>
                  <div className="flex gap-2">
                    {services.length === 0 && (
                      <button onClick={seedData} className="btn-secondary text-sm">Lisää oletusdata</button>
                    )}
                    <button
                      onClick={() => setNewItem({ title: "", description: "", icon: "Building2", image_url: "", order: services.length + 1 })}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Lisää palvelu
                    </button>
                  </div>
                </div>

                {newItem && (
                  <div className="bg-white border border-[#0056D2] p-6 mb-6">
                    <h3 className="font-bold text-[#0F172A] mb-4">Uusi palvelu</h3>
                    <ServiceForm
                      service={newItem}
                      onChange={setNewItem}
                      onSave={() => saveService(newItem)}
                      onCancel={() => setNewItem(null)}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white border border-[#E2E8F0] p-6">
                      {editingItem?.id === service.id ? (
                        <ServiceForm
                          service={editingItem}
                          onChange={setEditingItem}
                          onSave={() => saveService(editingItem)}
                          onCancel={() => setEditingItem(null)}
                        />
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {service.image_url && (
                              <img src={service.image_url} alt={service.title} className="w-24 h-16 object-cover" />
                            )}
                            <div>
                              <h3 className="font-bold text-[#0F172A]">{service.title}</h3>
                              <p className="text-sm text-[#64748B] mt-1">{service.description}</p>
                              <p className="text-xs text-[#94A3B8] mt-2">Ikoni: {service.icon} | Järjestys: {service.order}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingItem(service)} className="p-2 text-[#64748B] hover:text-[#0056D2]">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => deleteService(service.id)} className="p-2 text-[#64748B] hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References Tab */}
            {activeTab === "references" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#0F172A]">Referenssit ({references.length})</h2>
                  <button
                    onClick={() => setNewItem({ name: "", type: "Tasoitus- ja maalaustyöt", description: "", order: references.length + 1 })}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Lisää referenssi
                  </button>
                </div>

                {newItem && (
                  <div className="bg-white border border-[#0056D2] p-6 mb-6">
                    <h3 className="font-bold text-[#0F172A] mb-4">Uusi referenssi</h3>
                    <ReferenceForm
                      reference={newItem}
                      onChange={setNewItem}
                      onSave={() => saveReference(newItem)}
                      onCancel={() => setNewItem(null)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {references.map((ref) => (
                    <div key={ref.id} className="bg-white border border-[#E2E8F0] p-6">
                      {editingItem?.id === ref.id ? (
                        <ReferenceForm
                          reference={editingItem}
                          onChange={setEditingItem}
                          onSave={() => saveReference(editingItem)}
                          onCancel={() => setEditingItem(null)}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-[#0F172A]">{ref.name}</h3>
                            <p className="text-sm text-[#0056D2]">{ref.type}</p>
                            {ref.description && <p className="text-sm text-[#64748B] mt-1">{ref.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingItem(ref)} className="p-2 text-[#64748B] hover:text-[#0056D2]">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => deleteReference(ref.id)} className="p-2 text-[#64748B] hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">Viestit ({contacts.length})</h2>
                
                {contacts.length === 0 ? (
                  <p className="text-[#64748B] text-center py-12">Ei viestejä</p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="bg-white border border-[#E2E8F0] p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-[#0F172A]">{contact.firstName} {contact.lastName}</h3>
                            <p className="text-sm text-[#0056D2]">{contact.email}</p>
                            {contact.phone && <p className="text-sm text-[#64748B]">{contact.phone}</p>}
                            {contact.subject && <p className="text-sm font-medium text-[#0F172A] mt-2">Aihe: {contact.subject}</p>}
                            <p className="text-[#64748B] mt-2">{contact.message}</p>
                            <p className="text-xs text-[#94A3B8] mt-2">{new Date(contact.created_at).toLocaleString('fi-FI')}</p>
                          </div>
                          <button onClick={() => deleteContact(contact.id)} className="p-2 text-[#64748B] hover:text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Service Form Component
const ServiceForm = ({ service, onChange, onSave, onCancel }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">Otsikko</label>
      <input
        type="text"
        value={service.title}
        onChange={(e) => onChange({ ...service, title: e.target.value })}
        className="form-input"
        placeholder="Palvelun nimi"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">Kuvaus</label>
      <textarea
        value={service.description}
        onChange={(e) => onChange({ ...service, description: e.target.value })}
        className="form-input resize-none"
        rows={3}
        placeholder="Palvelun kuvaus"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1">Ikoni</label>
        <select
          value={service.icon}
          onChange={(e) => onChange({ ...service, icon: e.target.value })}
          className="form-input"
        >
          <option value="Building2">Rakennus</option>
          <option value="Layers">Kerrokset</option>
          <option value="Paintbrush">Sivellin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1">Järjestys</label>
        <input
          type="number"
          value={service.order}
          onChange={(e) => onChange({ ...service, order: parseInt(e.target.value) || 0 })}
          className="form-input"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">Kuvan URL</label>
      <input
        type="url"
        value={service.image_url || ""}
        onChange={(e) => onChange({ ...service, image_url: e.target.value })}
        className="form-input"
        placeholder="https://..."
      />
    </div>
    <div className="flex gap-2 pt-2">
      <button onClick={onSave} className="btn-primary text-sm flex items-center gap-2">
        <Save size={16} />
        Tallenna
      </button>
      <button onClick={onCancel} className="btn-secondary text-sm">Peruuta</button>
    </div>
  </div>
);

// Reference Form Component
const ReferenceForm = ({ reference, onChange, onSave, onCancel }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">Nimi</label>
      <input
        type="text"
        value={reference.name}
        onChange={(e) => onChange({ ...reference, name: e.target.value })}
        className="form-input"
        placeholder="Projektin nimi"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">Tyyppi</label>
      <input
        type="text"
        value={reference.type}
        onChange={(e) => onChange({ ...reference, type: e.target.value })}
        className="form-input"
        placeholder="Tasoitus- ja maalaustyöt"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">Kuvaus</label>
      <textarea
        value={reference.description || ""}
        onChange={(e) => onChange({ ...reference, description: e.target.value })}
        className="form-input resize-none"
        rows={2}
        placeholder="Lyhyt kuvaus projektista"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">Järjestys</label>
      <input
        type="number"
        value={reference.order}
        onChange={(e) => onChange({ ...reference, order: parseInt(e.target.value) || 0 })}
        className="form-input"
      />
    </div>
    <div className="flex gap-2 pt-2">
      <button onClick={onSave} className="btn-primary text-sm flex items-center gap-2">
        <Save size={16} />
        Tallenna
      </button>
      <button onClick={onCancel} className="btn-secondary text-sm">Peruuta</button>
    </div>
  </div>
);

// ========== HOME PAGE ==========
const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

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
    <>
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
    </>
  );
};

// ========== MAIN APP ==========
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
