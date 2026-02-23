import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { SEOHead, COMPANY } from '../seo/SEOHead';
import { getServiceSEO, serviceSlugMap } from '../seo/serviceContent';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServicePage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  
  const seoContent = getServiceSEO(slug);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, settingsRes] = await Promise.all([
          axios.get(`${API}/services`),
          axios.get(`${API}/settings`)
        ]);
        setAllServices(servicesRes.data);
        setSettings(settingsRes.data);
        
        // Find matching service
        const matchedService = servicesRes.data.find(s => {
          const serviceSlug = serviceSlugMap[s.title];
          return serviceSlug === slug;
        });
        setService(matchedService);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!seoContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Sivua ei löytynyt</h1>
        <Link to="/" className="text-primary hover:underline">Palaa etusivulle</Link>
      </div>
    );
  }

  const breadcrumbs = [
    { name: "Etusivu", url: COMPANY.url },
    { name: "Palvelut", url: `${COMPANY.url}/#palvelut` },
    { name: seoContent.h1, url: `${COMPANY.url}/palvelut/${slug}` }
  ];

  const otherServices = allServices.filter(s => serviceSlugMap[s.title] !== slug).slice(0, 3);

  return (
    <>
      <SEOHead 
        title={seoContent.title}
        description={seoContent.metaDescription}
        keywords={seoContent.keywords}
        canonical={`${COMPANY.url}/palvelut/${slug}`}
        type="article"
        service={{ name: seoContent.h1, description: seoContent.metaDescription, slug }}
        breadcrumbs={breadcrumbs}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/g1de58um_jb2-logo.png" alt="J&B Tasoitus ja Maalaus" className="h-10" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-primary">Etusivu</Link>
              <Link to="/#palvelut" className="text-gray-600 hover:text-primary">Palvelut</Link>
              <Link to="/#referenssit" className="text-gray-600 hover:text-primary">Referenssit</Link>
              <Link to="/#yhteystiedot" className="text-gray-600 hover:text-primary">Yhteystiedot</Link>
              <a href={`tel:${COMPANY.phone}`} className="btn-primary">Pyydä tarjous</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="bg-gray-50 py-3" aria-label="Breadcrumb">
        <div className="container-custom">
          <ol className="flex items-center gap-2 text-sm">
            <li><Link to="/" className="text-gray-500 hover:text-primary">Etusivu</Link></li>
            <li className="text-gray-400">/</li>
            <li><span className="text-gray-500">Palvelut</span></li>
            <li className="text-gray-400">/</li>
            <li><span className="text-primary font-medium">{seoContent.h1.split(' - ')[0]}</span></li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
              <ArrowLeft size={16} />
              Takaisin etusivulle
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              {seoContent.h1}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              {seoContent.metaDescription}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={`tel:${COMPANY.phone}`} className="btn-primary inline-flex items-center gap-2">
                <Phone size={18} />
                Soita nyt: {COMPANY.phone}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="btn-secondary inline-flex items-center gap-2">
                <Mail size={18} />
                Lähetä sähköpostia
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <article className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-600 prose-li:text-gray-600 prose-ul:my-4 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: seoContent.content }}
              />
              
              {/* Service Image */}
              {service?.image_url && (
                <div className="mt-8">
                  <img 
                    src={service.image_url} 
                    alt={`${seoContent.h1} - J&B Tasoitus ja Maalaus`}
                    className="w-full rounded-lg shadow-lg"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* CTA Box */}
              <div className="bg-primary text-white rounded-xl p-6 mb-8 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Pyydä ilmainen arvio</h3>
                <p className="mb-6 text-white/90">
                  Kerro projektistasi ja saat tarjouksen 24 tunnin sisällä.
                </p>
                <div className="space-y-4">
                  <a 
                    href={`tel:${COMPANY.phone}`}
                    className="flex items-center gap-3 bg-white text-primary px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                  >
                    <Phone size={20} />
                    {COMPANY.phone}
                  </a>
                  <a 
                    href={`mailto:${COMPANY.email}`}
                    className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/20 transition"
                  >
                    <Mail size={20} />
                    {COMPANY.email}
                  </a>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} />
                    <span className="text-sm">Kotitalousvähennyskelpoinen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span className="text-sm">Tyytyväisyystakuu</span>
                  </div>
                </div>
              </div>

              {/* Other Services */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Muut palvelumme</h3>
                <ul className="space-y-3">
                  {otherServices.map(s => {
                    const serviceSlug = serviceSlugMap[s.title];
                    return serviceSlug ? (
                      <li key={s.id}>
                        <Link 
                          to={`/palvelut/${serviceSlug}`}
                          className="flex items-center justify-between text-gray-600 hover:text-primary transition"
                        >
                          <span>{s.title}</span>
                          <ArrowRight size={16} />
                        </Link>
                      </li>
                    ) : null;
                  })}
                </ul>
                <Link 
                  to="/#palvelut" 
                  className="mt-4 inline-block text-primary hover:underline font-medium"
                >
                  Katso kaikki palvelut →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Tarvitsetko apua projektissasi?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Ota yhteyttä ja kerro projektistasi. Annamme ilmaisen arvion ja autamme löytämään parhaan ratkaisun.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${COMPANY.phone}`} className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
              Soita: {COMPANY.phone}
            </a>
            <Link to="/#yhteystiedot" className="bg-white/10 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/20 transition">
              Lähetä viesti
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img src="https://customer-assets.emergentagent.com/job_modern-jbta/artifacts/g1de58um_jb2-logo.png" alt="J&B Tasoitus ja Maalaus" className="h-10 mb-4 brightness-0 invert" />
              <p className="text-gray-400">
                Ammattitaitoista tasoitus- ja maalaustyötä vuodesta 2018.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Yhteystiedot</h4>
              <p className="text-gray-400">{COMPANY.address.street}</p>
              <p className="text-gray-400">{COMPANY.address.postalCode} {COMPANY.address.city}</p>
              <p className="text-gray-400 mt-2">{COMPANY.phone}</p>
              <p className="text-gray-400">{COMPANY.email}</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Palvelualueet</h4>
              <p className="text-gray-400">Helsinki, Espoo, Vantaa, Kauniainen</p>
              <p className="text-gray-400">ja koko Uusimaa</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} J&B Tasoitus ja Maalaus Oy. Kaikki oikeudet pidätetään.
          </div>
        </div>
      </footer>
    </>
  );
};

export default ServicePage;
