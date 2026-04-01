import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar, Footer } from '../App';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// SEO Head Component
const FaqPageSEO = () => {
  useEffect(() => {
    document.title = "Usein kysytyt kysymykset | J&B Tasoitus ja Maalaus - UKK";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Vastauksia yleisimpiin kysymyksiin maalaus- ja tasoitustöistä. Kotitalousvähennys, aikataulut, takuu ja palvelualueet - löydä vastaukset kysymyksiisi.');
    }
  }, []);
  
  return null;
};

// Service slug mapping for links
const serviceSlugMap = {
  'Tasoitustyöt': 'tasoitustyot-helsinki',
  'Maalaustyöt': 'maalaustyot-helsinki',
  'Julkisivurappaus': 'julkisivurappaus-helsinki',
  'Mikrosementti': 'mikrosementti-helsinki',
  'Julkisivujen maalaukset': 'julkisivumaalaus-helsinki',
  'Kattojen maalaukset': 'kattomaalaus-helsinki'
};

// Single FAQ Item
const FaqItem = ({ faq, index, isOpen, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.03 }}
    className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none focus:ring-2 focus:ring-primary/30"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        <HelpCircle size={18} className="text-primary flex-shrink-0" />
        <span className="font-semibold text-[#0F172A] text-sm md:text-base pr-4">{faq.question}</span>
      </div>
      <ChevronDown 
        size={18} 
        className={`text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
    <AnimatePresence>
      {isOpen && (
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
);

// FAQ Hub Page
const FaqHubPage = () => {
  const [groupedFaqs, setGroupedFaqs] = useState({ general: [], by_service: {} });
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [openFaqs, setOpenFaqs] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faqsRes, servicesRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/faqs/grouped`),
          fetch(`${API_URL}/api/services`),
          fetch(`${API_URL}/api/settings`)
        ]);
        
        if (faqsRes.ok) {
          const faqsData = await faqsRes.json();
          setGroupedFaqs(faqsData);
        }
        
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }
        
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
          if (settingsData.theme_color) {
            document.documentElement.style.setProperty('--color-primary', settingsData.theme_color);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
      setLoading(false);
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, []);
  
  const toggleFaq = (faqId) => {
    setOpenFaqs(prev => ({ ...prev, [faqId]: !prev[faqId] }));
  };
  
  // Generate FAQPage schema for all FAQs
  const allFaqs = [
    ...groupedFaqs.general,
    ...Object.values(groupedFaqs.by_service).flatMap(s => s.faqs)
  ];
  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  
  // Get service title by ID
  const getServiceTitle = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service?.title || groupedFaqs.by_service[serviceId]?.service_title || 'Palvelu';
  };
  
  // Get service slug by ID
  const getServiceSlug = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      return serviceSlugMap[service.title] || null;
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const hasGeneralFaqs = groupedFaqs.general.length > 0;
  const hasServiceFaqs = Object.keys(groupedFaqs.by_service).length > 0;
  
  return (
    <>
      <Navbar isScrolled={isScrolled} logoUrl={settings?.logo_url} />
      <FaqPageSEO />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 min-h-[40vh] flex items-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img 
            src={settings?.hero_image_url || "https://images.pexels.com/photos/5493669/pexels-photo-5493669.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"} 
            alt="UKK - Usein kysytyt kysymykset" 
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="hero-overlay absolute inset-0"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-primary mb-6 transition-colors">
              <ArrowLeft size={16} />
              Takaisin etusivulle
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
              Usein kysytyt kysymykset
            </h1>
            <p className="text-base md:text-lg text-[#64748B] leading-relaxed">
              Löydä vastaukset yleisimpiin kysymyksiin maalaus- ja tasoitustöistä. 
              Etkö löytänyt vastausta? Ota yhteyttä - autamme mielellämme!
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            
            {/* General FAQs */}
            {hasGeneralFaqs && (
              <div className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-2">
                    Yleiset kysymykset
                  </h2>
                  <p className="text-sm text-[#64748B]">
                    Yleisimmät kysymykset palveluistamme
                  </p>
                </motion.div>
                
                <div className="space-y-3">
                  {groupedFaqs.general.map((faq, index) => (
                    <FaqItem
                      key={faq.id}
                      faq={faq}
                      index={index}
                      isOpen={openFaqs[faq.id]}
                      onToggle={() => toggleFaq(faq.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Service-specific FAQs */}
            {hasServiceFaqs && Object.entries(groupedFaqs.by_service).map(([serviceId, serviceData]) => {
              const serviceSlug = getServiceSlug(serviceId);
              const serviceTitle = getServiceTitle(serviceId);
              
              return (
                <div key={serviceId} className="mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-6 flex items-center justify-between"
                  >
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-1">
                        {serviceTitle}
                      </h2>
                      <p className="text-sm text-[#64748B]">
                        {serviceData.faqs.length} kysymystä
                      </p>
                    </div>
                    {serviceSlug && (
                      <Link 
                        to={`/${serviceSlug}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Palveluun <ArrowRight size={14} />
                      </Link>
                    )}
                  </motion.div>
                  
                  <div className="space-y-3">
                    {serviceData.faqs.map((faq, index) => (
                      <FaqItem
                        key={faq.id}
                        faq={faq}
                        index={index}
                        isOpen={openFaqs[faq.id]}
                        onToggle={() => toggleFaq(faq.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* No FAQs */}
            {!hasGeneralFaqs && !hasServiceFaqs && (
              <div className="text-center py-12 text-[#64748B]">
                <HelpCircle size={48} className="mx-auto mb-4 opacity-30" />
                <p>Ei kysymyksiä vielä.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section py-12 md:py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Etkö löytänyt vastausta?
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Ota yhteyttä ja vastaamme kysymyksiisi henkilökohtaisesti.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/#yhteystiedot" className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0F172A] font-medium rounded-lg hover:bg-gray-100 transition-colors">
                Ota yhteyttä
              </Link>
              <a href={`tel:${settings?.company_phone_primary?.replace(/\s/g, '') || '+358400547270'}`} className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
                Soita nyt
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Services Links Section with Images for SEO */}
      <section className="py-12 md:py-16 bg-[#F8F5F1]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <p className="text-primary text-sm font-medium mb-2">PALVELUMME</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
              Tutustu palveluihimme
            </h2>
            <p className="text-[#64748B]">Tarjoamme laadukkaita maalaus- ja tasoituspalveluita Helsingissä ja Uudellamaalla</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {services.slice(0, 6).map((service, index) => {
              const serviceSlug = serviceSlugMap[service.title];
              return (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={`/${serviceSlug || 'maalaustyot-helsinki'}`}
                    className="block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {service.image_url && (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img 
                          src={service.image_url.startsWith('http') ? service.image_url : `${API_URL}${service.image_url}`}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-4 md:p-5">
                      <h3 className="font-bold text-[#0F172A] mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-[#64748B] line-clamp-2 mb-3">
                        {service.description}
                      </p>
                      <span className="inline-flex items-center text-primary text-sm font-medium group-hover:underline">
                        Lue lisää <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      <Footer logoUrl={settings?.logo_url} settings={settings} />
    </>
  );
};

export default FaqHubPage;
