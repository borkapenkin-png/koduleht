import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  Shield,
  Award,
  Users,
  FileText,
  Wrench,
  Star,
  Send
} from 'lucide-react';
import { SEOHead, COMPANY } from '../seo/SEOHead';
import { getServiceSEO } from '../seo/serviceContent';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Hero images for each service
const serviceHeroImages = {
  tasoitustyo: 'https://images.unsplash.com/photo-1761986757577-140af8859587?auto=format&fit=crop&w=1920&q=80',
  maalaustyot: 'https://images.unsplash.com/photo-1693985120993-e9b203ce7631?auto=format&fit=crop&w=1920&q=80',
  mikrosementti: 'https://images.unsplash.com/photo-1766961980272-921bba4240bc?auto=format&fit=crop&w=1920&q=80',
  julkisivurappaus: 'https://images.unsplash.com/photo-1766961980272-921bba4240bc?auto=format&fit=crop&w=1920&q=80',
  kattomaalaus: 'https://images.unsplash.com/photo-1726589004565-bedfba94d3a2?auto=format&fit=crop&w=1920&q=80',
  julkisivumaalaus: 'https://images.unsplash.com/photo-1722876720000-f39b65b7d4a1?auto=format&fit=crop&w=1920&q=80'
};

// Service-specific work images
const serviceWorkImages = {
  tasoitustyo: 'https://images.unsplash.com/photo-1761986757577-140af8859587?auto=format&fit=crop&w=800&q=80',
  maalaustyot: 'https://images.unsplash.com/photo-1693985120993-e9b203ce7631?auto=format&fit=crop&w=800&q=80',
  mikrosementti: 'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=800',
  julkisivurappaus: 'https://images.unsplash.com/photo-1766961980272-921bba4240bc?auto=format&fit=crop&w=800&q=80',
  kattomaalaus: 'https://images.unsplash.com/photo-1726589004565-bedfba94d3a2?auto=format&fit=crop&w=800&q=80',
  julkisivumaalaus: 'https://images.unsplash.com/photo-1722876720000-f39b65b7d4a1?auto=format&fit=crop&w=800&q=80'
};

// Trust badges
const trustBadges = [
  { icon: Clock, text: 'Vuodesta 2018', subtext: 'Luotettava kokemus' },
  { icon: Award, text: 'Ammattitaitoinen työ', subtext: 'Laadukas lopputulos' },
  { icon: Shield, text: 'Kotitalousvähennys', subtext: 'Hyödynnä veroetu' },
  { icon: Star, text: 'Tyytyväisyystakuu', subtext: '100% tyytyväisyys' }
];

// Process steps
const processSteps = [
  { step: 1, title: 'Ilmainen arvio', description: 'Kartoitamme kohteen ja tarpeet', icon: FileText },
  { step: 2, title: 'Tarjous', description: 'Saat selkeän kirjallisen tarjouksen', icon: Mail },
  { step: 3, title: 'Työn toteutus', description: 'Ammattitaitoinen toteutus sovitusti', icon: Wrench },
  { step: 4, title: 'Valmis lopputulos', description: 'Tarkistamme yhdessä työn laadun', icon: CheckCircle }
];

// Why choose us items
const whyChooseUs = [
  'Ammattitaitoiset ja kokeneet tekijät',
  'Laadukkaat materiaalit ja työvälineet',
  'Selkeä ja läpinäkyvä hinnoittelu',
  'Nopea aikataulu ja joustava palvelu',
  'Siisti ja huolellinen työnjälki',
  'Kotitalousvähennys kelpaa'
];

// Service areas
const serviceAreas = ['Helsinki', 'Espoo', 'Vantaa', 'Kauniainen', 'Uusimaa'];

// Service-specific features
const serviceFeatures = {
  tasoitustyo: [
    { icon: Wrench, title: 'Seinien tasoitus', desc: 'Tasaiset seinäpinnat ammattitaidolla' },
    { icon: Wrench, title: 'Kattojen tasoitus', desc: 'Kattojen pohjatyöt ja tasoitus' },
    { icon: Wrench, title: 'Kulmasuojaus', desc: 'Kulmat ja reunat siististi' },
    { icon: Wrench, title: 'Pintatasoitus', desc: 'Viimeistellyt pinnat maalausta varten' }
  ],
  maalaustyot: [
    { icon: Wrench, title: 'Sisämaalaus', desc: 'Seinät, katot ja ovet' },
    { icon: Wrench, title: 'Ulkomaalaus', desc: 'Julkisivut ja ulkorakenteet' },
    { icon: Wrench, title: 'Lakkatyöt', desc: 'Puupintojen lakkaus' },
    { icon: Wrench, title: 'Erikoismaalaukset', desc: 'Kuviot ja tehosteseinät' }
  ],
  mikrosementti: [
    { icon: Wrench, title: 'Seinäpinnat', desc: 'Modernit mikrosementtiseinät' },
    { icon: Wrench, title: 'Lattiapinnat', desc: 'Kestävät mikrosementtilattiat' },
    { icon: Wrench, title: 'Märkätilat', desc: 'Kylpyhuoneet ja saunat' },
    { icon: Wrench, title: 'Kalusteet', desc: 'Tasot ja kalustepinnat' }
  ],
  julkisivurappaus: [
    { icon: Wrench, title: 'Rappaus', desc: 'Julkisivujen rappaustyöt' },
    { icon: Wrench, title: 'Korjausrappaus', desc: 'Vanhojen pintojen korjaus' },
    { icon: Wrench, title: 'Pinnoitus', desc: 'Suojaavat pinnoitukset' },
    { icon: Wrench, title: 'Väritys', desc: 'Värjätyt rappauslaastit' }
  ],
  kattomaalaus: [
    { icon: Wrench, title: 'Katon pesu', desc: 'Sammaleen ja lian poisto' },
    { icon: Wrench, title: 'Huoltomaalaus', desc: 'Katon suojamaalaus' },
    { icon: Wrench, title: 'Peltikaton maalaus', desc: 'Peltikattojen erikoismaalaus' },
    { icon: Wrench, title: 'Tiilikaton käsittely', desc: 'Tiilikattojen suojaus' }
  ],
  julkisivumaalaus: [
    { icon: Wrench, title: 'Julkisivun pesu', desc: 'Perusteellinen painepsu' },
    { icon: Wrench, title: 'Puutalon maalaus', desc: 'Puujulkisivujen maalaus' },
    { icon: Wrench, title: 'Kivitalon maalaus', desc: 'Betoni- ja kivipinnat' },
    { icon: Wrench, title: 'Kerrostalojen maalaus', desc: 'Suuret kohteet' }
  ]
};

// Quick contact form component
const QuickContactForm = ({ serviceName }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.name,
          lastName: '',
          email: 'quick@form.fi',
          phone: formData.phone,
          subject: `Tarjouspyyntö: ${serviceName}`,
          message: formData.message
        })
      });
      setStatus('success');
      setFormData({ name: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nimi *"
        required
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
      />
      <input
        type="tel"
        placeholder="Puhelin *"
        required
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
      />
      <textarea
        placeholder="Kerro projektistasi..."
        rows={3}
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
      >
        {status === 'sending' ? 'Lähetetään...' : <><Send size={18} /> Lähetä tarjouspyyntö</>}
      </button>
      {status === 'success' && <p className="text-green-600 text-sm text-center">Kiitos! Otamme yhteyttä pian.</p>}
      {status === 'error' && <p className="text-red-600 text-sm text-center">Virhe. Yritä uudelleen.</p>}
    </form>
  );
};

const ServicePage = () => {
  const { slug } = useParams();
  const [settings, setSettings] = useState({});
  const seoContent = getServiceSEO(slug);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings');
      }
    };
    fetchSettings();
    window.scrollTo(0, 0);
  }, [slug]);

  if (!seoContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Palvelua ei löytynyt</h1>
          <Link to="/" className="text-primary hover:underline">Takaisin etusivulle</Link>
        </div>
      </div>
    );
  }

  const heroImage = serviceHeroImages[slug] || serviceHeroImages.maalaustyot;
  const workImage = serviceWorkImages[slug] || serviceWorkImages.maalaustyot;
  const features = serviceFeatures[slug] || serviceFeatures.maalaustyot;

  const breadcrumbs = [
    { name: 'Etusivu', url: COMPANY.url },
    { name: 'Palvelut', url: `${COMPANY.url}/#palvelut` },
    { name: seoContent.h1, url: `${COMPANY.url}/palvelut/${slug}` }
  ];

  return (
    <>
      <SEOHead 
        title={seoContent.title}
        description={seoContent.metaDescription}
        keywords={seoContent.keywords}
        canonical={`${COMPANY.url}/palvelut/${slug}`}
        service={{ name: seoContent.h1, description: seoContent.metaDescription, slug }}
        breadcrumbs={breadcrumbs}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="J&B Tasoitus ja Maalaus" className="h-10 w-auto" />
              ) : (
                <span className="text-xl font-bold text-primary">J&B tasoitusmaalaus</span>
              )}
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Etusivu</Link>
              <Link to="/#palvelut" className="text-gray-700 hover:text-primary transition-colors">Palvelut</Link>
              <Link to="/#referenssit" className="text-gray-700 hover:text-primary transition-colors">Referenssit</Link>
              <Link to="/#yhteystiedot" className="text-gray-700 hover:text-primary transition-colors">Yhteystiedot</Link>
              <a href="tel:+358400547270" className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors">
                Pyydä tarjous
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center pt-16">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt={seoContent.h1}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Etusivu</Link>
            <ChevronRight size={14} />
            <Link to="/#palvelut" className="hover:text-white transition-colors">Palvelut</Link>
            <ChevronRight size={14} />
            <span className="text-white">{seoContent.h1}</span>
          </nav>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {seoContent.h1}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              {seoContent.metaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#tarjouspyynto" 
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl"
              >
                Pyydä ilmainen arvio
              </a>
              <a 
                href="tel:+358400547270" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
              >
                <Phone size={20} />
                Soita nyt
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-50 py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <badge.icon size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">{badge.text}</p>
                  <p className="text-gray-500 text-xs md:text-sm">{badge.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              
              {/* Service Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Palvelun kuvaus</h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div 
                    className="prose prose-lg text-gray-600"
                    dangerouslySetInnerHTML={{ __html: seoContent.content.split('</ul>')[0] + '</ul>' }}
                  />
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src={workImage} 
                      alt={`${seoContent.h1} - työkuva`}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Mitä palvelu sisältää</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <feature.icon size={24} className="text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Why Choose Us Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 md:p-10"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Miksi valita J&B Tasoitus ja Maalaus</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {whyChooseUs.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle size={20} className="text-primary flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Process Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Näin projekti etenee</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 }}
                      className="relative text-center"
                    >
                      <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                        {step.step}
                      </div>
                      {index < processSteps.length - 1 && (
                        <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-primary/20"></div>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Extended Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="prose prose-lg max-w-none"
              >
                <div 
                  className="text-gray-600 space-y-6"
                  dangerouslySetInnerHTML={{ __html: seoContent.content.split('</ul>').slice(1).join('</ul>') }}
                />
              </motion.div>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Quick Contact Form */}
                <div id="tarjouspyynto" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pyydä ilmainen arvio</h3>
                  <p className="text-gray-600 text-sm mb-6">Kerro projektistasi ja saat tarjouksen 24 tunnin sisällä.</p>
                  <QuickContactForm serviceName={seoContent.h1} />
                </div>

                {/* Contact Info */}
                <div className="bg-primary text-white rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Ota yhteyttä</h3>
                  <div className="space-y-4">
                    <a href="tel:+358400547270" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <Phone size={20} />
                      <span>+358 40 054 7270</span>
                    </a>
                    <a href="mailto:info@jbtasoitusmaalaus.fi" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <Mail size={20} />
                      <span>info@jbtasoitusmaalaus.fi</span>
                    </a>
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="flex-shrink-0 mt-1" />
                      <span>Sienitie 25, 00760 Helsinki</span>
                    </div>
                  </div>
                </div>

                {/* Service Areas */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Palvelualueet</h3>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area, index) => (
                      <span 
                        key={index}
                        className="bg-white px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tarvitsetko apua {seoContent.h1.toLowerCase().includes('maalau') ? 'maalaustyössä' : seoContent.h1.toLowerCase()}?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Pyydä maksuton arvio ja saat selkeän tarjouksen nopeasti. Palvelemme koko Uudenmaan alueella.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#tarjouspyynto" 
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                Pyydä tarjous
              </a>
              <a 
                href="tel:+358400547270" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
              >
                <Phone size={20} />
                Soita nyt
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">J&B Tasoitus ja Maalaus Oy</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="tel:+358400547270" className="hover:text-white transition-colors">+358 40 054 7270</a>
              <a href="mailto:info@jbtasoitusmaalaus.fi" className="hover:text-white transition-colors">info@jbtasoitusmaalaus.fi</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} J&B Tasoitus ja Maalaus Oy. Kaikki oikeudet pidätetään.
          </div>
        </div>
      </footer>
    </>
  );
};

export default ServicePage;
