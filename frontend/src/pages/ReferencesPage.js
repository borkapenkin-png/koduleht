import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, ArrowLeft, ChevronDown } from 'lucide-react';
import { Navbar, Footer } from '../App';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Helper to get full image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return url;
};

// SEO Head Component
const ReferencesPageSEO = () => {
  useEffect(() => {
    document.title = "Referenssit | J&B Tasoitus ja Maalaus - Toteutetut projektit Helsingissä";
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Tutustu J&B Tasoitus ja Maalaus toteutettuihin referenssikohteisiin. Maalaus- ja tasoitustyöt yrityksille, taloyhtiöille ja yksityisille Helsingissä ja Uudellamaalla.');
    }
  }, []);
  
  return null;
};

// References Page Component
const ReferencesPage = () => {
  const [references, setReferences] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const initialCount = 6; // Show 6 initially (3 rows of 2)
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [refsRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/references`),
          fetch(`${API_URL}/api/settings`)
        ]);
        
        if (refsRes.ok) {
          const refsData = await refsRes.json();
          setReferences(refsData);
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
  
  const placeholderImage = "https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=600";
  const visibleRefs = showAll ? references : references.slice(0, initialCount);
  const hasMore = references.length > initialCount;
  
  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Referenssit - J&B Tasoitus ja Maalaus",
    "description": "Toteutetut maalaus- ja tasoitusprojektit",
    "itemListElement": references.slice(0, 10).map((ref, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "CreativeWork",
        "name": ref.name,
        "description": ref.description || ref.type,
        "locationCreated": {
          "@type": "Place",
          "name": ref.location || "Helsinki"
        }
      }
    }))
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      <Navbar isScrolled={isScrolled} logoUrl={settings?.logo_url} />
      <ReferencesPageSEO />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-[#f8fafc] to-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-primary mb-6 transition-colors">
              <ArrowLeft size={16} />
              Takaisin etusivulle
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
              Referenssit
            </h1>
            <p className="text-base md:text-lg text-[#64748B] leading-relaxed">
              Olemme toteuttaneet maalaus- ja tasoitustöitä useisiin kohteisiin pääkaupunkiseudulla. 
              Tutustu referensseihimme ja näe mitä olemme saaneet aikaan.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* References Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {references.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">
              <p>Ei referenssejä vielä.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {visibleRefs.map((ref, index) => (
                  <motion.article
                    key={ref.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="reference-card-full group"
                  >
                    {/* Cover Image */}
                    <div className="reference-card-image-container">
                      <img
                        src={getImageUrl(ref.cover_image_url) || placeholderImage}
                        alt={`${ref.name} - ${ref.type}${ref.location ? ` ${ref.location}` : ''}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-[#0F172A] group-hover:text-primary transition-colors mb-2">
                        {ref.name}
                      </h2>
                      <p className="text-sm text-primary font-medium mb-3">{ref.type}</p>
                      
                      {ref.description && (
                        <p className="text-sm text-[#64748B] mb-3">{ref.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#64748B]">
                        {ref.main_contractor && (
                          <div className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-primary" />
                            <span>{ref.main_contractor}</span>
                          </div>
                        )}
                        {ref.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-primary" />
                            <span>{ref.location}</span>
                          </div>
                        )}
                        {ref.year && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary" />
                            <span>{ref.year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
              
              {/* Show More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mt-10"
                >
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
                  >
                    {showAll ? 'Näytä vähemmän' : 'Näytä lisää'}
                    <ChevronDown size={18} className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
                  </button>
                </motion.div>
              )}
            </>
          )}
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
              Haluatko projektisi näihin referensseihin?
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Ota yhteyttä ja pyydä ilmainen arvio. Toteutamme maalaus- ja tasoitustyöt ammattitaidolla.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/#yhteydenotto" className="btn-primary bg-white text-[#0F172A] hover:bg-gray-100">
                Pyydä tarjous
              </Link>
              <a href={`tel:${settings?.company_phone_primary?.replace(/\s/g, '') || '+358400547270'}`} className="btn-secondary border-white text-white hover:bg-white/10">
                Soita nyt
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer logoUrl={settings?.logo_url} />
    </>
  );
};

export default ReferencesPage;
