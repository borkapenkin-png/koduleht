// Dynamic Service Page - CMS Driven
// This page fetches all content from the database via API

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ChevronRight, ArrowRight } from 'lucide-react';
import { SEOHead, COMPANY } from '../seo/SEOHead';
import {
  Section,
  TrustBadges,
  ProcessSteps,
  WhyChooseUs,
  ServiceAreas,
  ContactSidebar,
  QuickContactForm,
  CTASection,
  FeatureCard,
  Breadcrumbs
} from '../components/shared';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Shared Navbar component
const ServiceNavbar = ({ settings }) => {
  const logo = settings?.logo_url;
  const companyName = settings?.company_name || 'J&B Tasoitus ja Maalaus';
  const phone = settings?.company_phone_primary || '+358 40 054 7270';
  const ctaText = settings?.cta_phone_text || 'Pyydä tarjous';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={companyName} className="h-10 w-auto" />
            ) : (
              <span className="text-xl font-bold text-primary">{companyName}</span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Etusivu</Link>
            <Link to="/#palvelut" className="text-gray-700 hover:text-primary transition-colors">Palvelut</Link>
            <Link to="/#referenssit" className="text-gray-700 hover:text-primary transition-colors">Referenssit</Link>
            <Link to="/#yhteystiedot" className="text-gray-700 hover:text-primary transition-colors">Yhteystiedot</Link>
            <a 
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Shared Footer component
const ServiceFooter = ({ settings }) => {
  const companyName = settings?.company_name || 'J&B Tasoitus ja Maalaus Oy';
  const phone = settings?.company_phone_primary || '+358 40 054 7270';
  const email = settings?.company_email || 'info@jbtasoitusmaalaus.fi';
  const copyright = settings?.footer_copyright || 'Kaikki oikeudet pidätetään.';

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{companyName}</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{phone}</a>
            <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} {companyName}. {copyright}
        </div>
      </div>
    </footer>
  );
};

const DynamicServicePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch settings and service page in parallel
        const [settingsRes, pageRes, allPagesRes] = await Promise.all([
          fetch(`${API_URL}/api/settings`),
          fetch(`${API_URL}/api/service-pages/${slug}`),
          fetch(`${API_URL}/api/service-pages`)
        ]);

        if (!settingsRes.ok) throw new Error('Failed to fetch settings');
        const settingsData = await settingsRes.json();
        setSettings(settingsData);

        if (!pageRes.ok) {
          // Page not found - might be old URL, redirect to home
          setError('not_found');
          return;
        }
        const pageData = await pageRes.json();
        setPage(pageData);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sivua ei löytynyt</h1>
          <p className="text-gray-600 mb-6">Etsimääsi palvelusivua ei löytynyt.</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            Takaisin etusivulle
          </Link>
        </div>
      </div>
    );
  }

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Etusivu', href: '/' },
    { label: 'Palvelut', href: '/#palvelut' },
    { label: page.hero_title }
  ];

  // Hero image fallback
  const heroImage = page.hero_image_url || 'https://images.pexels.com/photos/5691544/pexels-photo-5691544.jpeg?auto=compress&cs=tinysrgb&w=1920';

  // Get phone for CTAs
  const phone = settings?.company_phone_primary || '+358 40 054 7270';

  // Related services
  const relatedPages = allPages.filter(p => 
    page.related_service_ids?.includes(p.service_id) || 
    (p.slug !== slug && !page.related_service_ids?.length)
  ).slice(0, 3);

  return (
    <>
      {/* SEO */}
      <SEOHead 
        title={page.seo_title}
        description={page.seo_description}
        keywords={page.seo_keywords}
        canonical={`${COMPANY.url}/${slug}`}
        service={{ name: page.hero_title, description: page.seo_description, slug }}
      />

      {/* Navbar */}
      <ServiceNavbar settings={settings} />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center pt-16">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt={page.hero_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Breadcrumbs items={breadcrumbs} white />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {page.hero_title}
            </h1>
            {page.hero_subtitle && (
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                {page.hero_subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#tarjouspyynto" 
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl"
              >
                {settings?.cta_primary_text || 'Pyydä ilmainen arvio'}
              </a>
              <a 
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
              >
                <Phone size={20} />
                {settings?.cta_secondary_text || 'Soita nyt'}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges settings={settings} />

      {/* Main Content with Sidebar */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              
              {/* Service Description */}
              {page.description_text && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {page.description_title || 'Palvelun kuvaus'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div 
                      className="prose prose-lg text-gray-600"
                      dangerouslySetInnerHTML={{ __html: page.description_text }}
                    />
                    {page.description_image_url && (
                      <div className="relative rounded-2xl overflow-hidden shadow-xl">
                        <img 
                          src={page.description_image_url} 
                          alt={`${page.hero_title} - työkuva`}
                          className="w-full h-64 md:h-80 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Features */}
              {page.features && page.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                    {page.features_title || 'Mitä palvelu sisältää'}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {page.features.map((feature, index) => (
                      <FeatureCard 
                        key={index}
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Why Choose Us */}
              <WhyChooseUs 
                settings={settings}
                title={page.why_title}
                items={page.why_items?.length > 0 ? page.why_items : null}
              />

              {/* Process Steps */}
              {page.use_global_process !== false && (
                <ProcessSteps 
                  settings={settings}
                  title={page.process_title}
                />
              )}

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div id="tarjouspyynto" className="sticky top-24 space-y-6">
                <QuickContactForm 
                  serviceName={page.hero_title} 
                  settings={settings}
                />
                <ContactSidebar settings={settings} />
                <ServiceAreas 
                  settings={settings}
                  title={page.areas_title}
                  text={page.areas_text}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedPages.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-sm text-primary font-medium uppercase tracking-wide mb-2">MUUT PALVELUT</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Tutustu myös muihin palveluihimme
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPages.map((relatedPage, index) => (
                <motion.div
                  key={relatedPage.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={`/${relatedPage.slug}`}
                    className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                  >
                    {relatedPage.hero_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={relatedPage.hero_image_url} 
                          alt={relatedPage.hero_title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {relatedPage.hero_title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{relatedPage.hero_subtitle}</p>
                      <span className="mt-4 inline-flex items-center text-primary text-sm font-medium">
                        Lue lisää <ArrowRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <CTASection 
        settings={settings}
        title={page.cta_title || `Tarvitsetko apua ${page.hero_title.toLowerCase().includes('maalau') ? 'maalaustyössä' : page.hero_title.toLowerCase()}?`}
        description={page.cta_text}
      />

      {/* Footer */}
      <ServiceFooter settings={settings} />
    </>
  );
};

export default DynamicServicePage;
