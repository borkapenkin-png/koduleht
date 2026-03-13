// Shared Components - Design System
// These components are used across Homepage, Service Pages, and other pages
// to ensure visual consistency

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, ChevronRight, CheckCircle, Clock, Shield, Award, Star,
  FileText, Wrench, Send, ArrowRight
} from 'lucide-react';

// ========== DESIGN TOKENS ==========
export const DESIGN = {
  // Spacing
  sectionPadding: 'py-16 md:py-24',
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  cardGap: 'gap-6 md:gap-8',
  // Typography
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
  h2: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  h3: 'text-lg md:text-xl font-semibold',
  body: 'text-base text-gray-600 leading-relaxed',
  small: 'text-sm text-gray-500',
  // Border radius
  cardRadius: 'rounded-xl',
  buttonRadius: 'rounded-lg',
  // Shadows
  cardShadow: 'shadow-sm hover:shadow-lg transition-shadow',
  // Colors
  bgAlt: 'bg-gray-50',
  bgWhite: 'bg-white',
};

// Icon map for features
const iconMap = {
  Clock, Shield, Award, Star, FileText, Wrench, CheckCircle,
  Phone, Mail, MapPin
};

// ========== SECTION WRAPPER ==========
export const Section = ({ 
  children, 
  className = '', 
  id, 
  bg = 'white',
  noPadding = false 
}) => (
  <section 
    id={id}
    className={`
      ${noPadding ? '' : DESIGN.sectionPadding}
      ${bg === 'alt' ? DESIGN.bgAlt : bg === 'primary' ? 'bg-primary' : DESIGN.bgWhite}
      ${className}
    `}
  >
    <div className={`max-w-7xl mx-auto ${DESIGN.containerPadding}`}>
      {children}
    </div>
  </section>
);

// ========== SECTION HEADER ==========
export const SectionHeader = ({ 
  subtitle, 
  title, 
  description,
  centered = true,
  white = false,
  settings 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true }}
    className={`${centered ? 'text-center' : ''} mb-10 md:mb-16`}
  >
    {subtitle && (
      <SubtitleText settings={settings} white={white} className="mb-2 md:mb-3">
        {subtitle}
      </SubtitleText>
    )}
    <h2 className={`${DESIGN.h2} ${white ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </h2>
    {description && (
      <p className={`mt-4 max-w-2xl ${centered ? 'mx-auto' : ''} ${white ? 'text-white/80' : 'text-gray-600'}`}>
        {description}
      </p>
    )}
  </motion.div>
);

// ========== SUBTITLE TEXT ==========
export const SubtitleText = ({ children, settings, white = false, className = '' }) => {
  const size = {
    'small': 'text-xs',
    'normal': 'text-sm',
    'large': 'text-base'
  }[settings?.subtitle_size || 'normal'] || 'text-sm';
  
  const weight = {
    'normal': 'font-normal',
    'medium': 'font-medium',
    'bold': 'font-bold'
  }[settings?.subtitle_weight || 'normal'] || 'font-normal';
  
  const spacing = {
    'normal': 'tracking-normal',
    'wide': 'tracking-wide',
    'wider': 'tracking-wider',
    'widest': 'tracking-widest'
  }[settings?.subtitle_spacing || 'normal'] || 'tracking-normal';
  
  return (
    <p 
      className={`uppercase ${size} ${weight} ${spacing} ${white ? 'text-white/60' : 'text-primary'} ${className}`}
      style={{ fontFamily: `"${settings?.subtitle_font || 'Inter'}", sans-serif` }}
    >
      {children}
    </p>
  );
};

// ========== TRUST BADGES ==========
export const TrustBadges = ({ settings }) => {
  const badges = [
    { 
      icon: Clock, 
      text: settings?.trust_badge_1_title || 'Vuodesta 2018', 
      subtext: settings?.trust_badge_1_subtitle || 'Luotettava kokemus' 
    },
    { 
      icon: Award, 
      text: settings?.trust_badge_2_title || 'Ammattitaitoinen työ', 
      subtext: settings?.trust_badge_2_subtitle || 'Laadukas lopputulos' 
    },
    { 
      icon: Shield, 
      text: settings?.trust_badge_3_title || 'Kotitalousvähennys', 
      subtext: settings?.trust_badge_3_subtitle || 'Hyödynnä veroetu' 
    },
    { 
      icon: Star, 
      text: settings?.trust_badge_4_title || 'Tyytyväisyystakuu', 
      subtext: settings?.trust_badge_4_subtitle || '100% tyytyväisyys' 
    }
  ];

  return (
    <Section bg="alt" noPadding className="py-8 border-b">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((badge, index) => (
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
    </Section>
  );
};

// ========== PROCESS STEPS ==========
export const ProcessSteps = ({ settings, title }) => {
  const steps = [
    { 
      step: 1, 
      title: settings?.process_step_1_title || 'Ilmainen arvio', 
      description: settings?.process_step_1_desc || 'Kartoitamme kohteen ja tarpeet',
      icon: FileText 
    },
    { 
      step: 2, 
      title: settings?.process_step_2_title || 'Tarjous', 
      description: settings?.process_step_2_desc || 'Saat selkeän kirjallisen tarjouksen',
      icon: Mail 
    },
    { 
      step: 3, 
      title: settings?.process_step_3_title || 'Työn toteutus', 
      description: settings?.process_step_3_desc || 'Ammattitaitoinen toteutus sovitusti',
      icon: Wrench 
    },
    { 
      step: 4, 
      title: settings?.process_step_4_title || 'Valmis lopputulos', 
      description: settings?.process_step_4_desc || 'Tarkistamme yhdessä työn laadun',
      icon: CheckCircle 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className={`${DESIGN.h2} text-gray-900 mb-8`}>
        {title || 'Näin projekti etenee'}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
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
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-primary/20"></div>
            )}
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ========== WHY CHOOSE US ==========
export const WhyChooseUs = ({ settings, title, items }) => {
  const defaultItems = settings?.why_choose_us || [
    'Ammattitaitoiset ja kokeneet tekijät',
    'Laadukkaat materiaalit ja työvälineet',
    'Selkeä ja läpinäkyvä hinnoittelu',
    'Nopea aikataulu ja joustava palvelu',
    'Siisti ja huolellinen työnjälki',
    'Kotitalousvähennys kelpaa'
  ];
  
  const displayItems = items?.length > 0 ? items : defaultItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 md:p-10"
    >
      <h2 className={`${DESIGN.h2} text-gray-900 mb-8`}>
        {title || 'Miksi valita J&B Tasoitus ja Maalaus'}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {displayItems.map((item, index) => (
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
  );
};

// ========== SERVICE AREAS ==========
export const ServiceAreas = ({ settings, title, text }) => {
  const areas = settings?.service_areas || ['Helsinki', 'Espoo', 'Vantaa', 'Kauniainen', 'Uusimaa'];
  
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {title || 'Palvelualueet'}
      </h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {areas.map((area, index) => (
          <span 
            key={index}
            className="bg-white px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200"
          >
            {area}
          </span>
        ))}
      </div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// ========== CONTACT SIDEBAR ==========
export const ContactSidebar = ({ settings }) => {
  const phone = settings?.company_phone_primary || '+358 40 054 7270';
  const email = settings?.company_email || 'info@jbtasoitusmaalaus.fi';
  const address = settings?.company_address || 'Sienitie 25, 00760 Helsinki';

  return (
    <div className="bg-primary text-white rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4">Ota yhteyttä</h3>
      <div className="space-y-4">
        <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Phone size={20} />
          <span>{phone}</span>
        </a>
        <a href={`mailto:${email}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Mail size={20} />
          <span>{email}</span>
        </a>
        <div className="flex items-start gap-3">
          <MapPin size={20} className="flex-shrink-0 mt-1" />
          <span>{address}</span>
        </div>
      </div>
    </div>
  );
};

// ========== QUICK CONTACT FORM ==========
export const QuickContactForm = ({ serviceName, settings }) => {
  const [formData, setFormData] = React.useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = React.useState('');
  const API_URL = process.env.REACT_APP_BACKEND_URL;

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
          subject: serviceName ? `Tarjouspyyntö: ${serviceName}` : 'Tarjouspyyntö',
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {settings?.cta_primary_text || 'Pyydä ilmainen arvio'}
      </h3>
      <p className="text-gray-600 text-sm mb-6">
        Kerro projektistasi ja saat tarjouksen 24 tunnin sisällä.
      </p>
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
    </div>
  );
};

// ========== CTA SECTION ==========
export const CTASection = ({ settings, title, description }) => {
  const phone = settings?.company_phone_primary || '+358 40 054 7270';
  const ctaPrimary = settings?.cta_primary_text || 'Pyydä ilmainen arvio';
  const ctaSecondary = settings?.cta_secondary_text || 'Soita nyt';

  return (
    <Section bg="primary" className="py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-4xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title || 'Tarvitsetko apua pintaremonttiin?'}
        </h2>
        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
          {description || 'Pyydä maksuton arvio ja saat selkeän tarjouksen nopeasti. Palvelemme koko Uudenmaan alueella.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#tarjouspyynto" 
            className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            {ctaPrimary}
          </a>
          <a 
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
          >
            <Phone size={20} />
            {ctaSecondary}
          </a>
        </div>
      </motion.div>
    </Section>
  );
};

// ========== FEATURE CARDS ==========
export const FeatureCard = ({ title, description, icon = 'Wrench' }) => {
  const Icon = iconMap[icon] || Wrench;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
        <Icon size={24} className="text-primary" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
};

// ========== BREADCRUMBS ==========
export const Breadcrumbs = ({ items, white = false }) => (
  <nav className={`flex items-center gap-2 text-sm ${white ? 'text-white/70' : 'text-gray-500'} mb-6`}>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight size={14} />}
        {item.href ? (
          <Link 
            to={item.href} 
            className={`${white ? 'hover:text-white' : 'hover:text-primary'} transition-colors`}
          >
            {item.label}
          </Link>
        ) : (
          <span className={white ? 'text-white' : 'text-gray-900'}>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ========== RELATED SERVICES ==========
export const RelatedServices = ({ services, currentSlug, settings }) => {
  const otherServices = services.filter(s => s.slug !== currentSlug).slice(0, 3);
  
  if (otherServices.length === 0) return null;

  return (
    <Section bg="alt">
      <SectionHeader
        subtitle="MUUT PALVELUT"
        title="Tutustu myös muihin palveluihimme"
        settings={settings}
      />
      <div className="grid md:grid-cols-3 gap-6">
        {otherServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={`/${service.slug}`}
              className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              {service.hero_image_url && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={service.hero_image_url} 
                    alt={service.hero_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {service.hero_title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">{service.hero_subtitle}</p>
                <span className="mt-4 inline-flex items-center text-primary text-sm font-medium">
                  Lue lisää <ArrowRight size={14} className="ml-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default {
  DESIGN,
  Section,
  SectionHeader,
  SubtitleText,
  TrustBadges,
  ProcessSteps,
  WhyChooseUs,
  ServiceAreas,
  ContactSidebar,
  QuickContactForm,
  CTASection,
  FeatureCard,
  Breadcrumbs,
  RelatedServices
};
