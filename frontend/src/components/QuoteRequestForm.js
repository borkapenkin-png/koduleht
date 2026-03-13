import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Service options for multi-select
const SERVICE_OPTIONS = [
  { id: 'tasoitustyot', label: 'Tasoitustyöt' },
  { id: 'sisamaalaus', label: 'Sisämaalaus' },
  { id: 'julkisivumaalaus', label: 'Julkisivumaalaus' },
  { id: 'julkisivurappaus', label: 'Julkisivurappaus' },
  { id: 'mikrosementti', label: 'Mikrosementti' },
  { id: 'kattomaalaus', label: 'Kattomaalaus' },
  { id: 'huoltomaalaus', label: 'Huoltomaalaus' },
  { id: 'parvekemaalaus', label: 'Parvekemaalaus' },
  { id: 'muu', label: 'Muu' },
];

// Dropdown options
const PROPERTY_TYPES = [
  { value: '', label: 'Valitse kohde' },
  { value: 'omakotitalo', label: 'Omakotitalo' },
  { value: 'kerrostalo', label: 'Kerrostalo' },
  { value: 'taloyhtio', label: 'Taloyhtiö' },
  { value: 'toimitila', label: 'Toimitila' },
  { value: 'muu', label: 'Muu' },
];

const AREA_SIZES = [
  { value: '', label: 'Valitse pinta-ala' },
  { value: 'alle-50', label: 'Alle 50 m²' },
  { value: '50-150', label: '50–150 m²' },
  { value: '150-500', label: '150–500 m²' },
  { value: 'yli-500', label: 'Yli 500 m²' },
  { value: 'en-osaa-sanoa', label: 'En osaa sanoa' },
];

const TIMELINES = [
  { value: '', label: 'Valitse aikataulu' },
  { value: 'heti', label: 'Mahdollisimman pian' },
  { value: '1-3kk', label: '1–3 kuukauden sisällä' },
  { value: 'myohemmin', label: 'Myöhemmin' },
  { value: 'suunnittelu', label: 'Suunnitteluvaiheessa' },
];

// Form field component with improved styling
const FormField = ({ label, required, error, children }) => (
  <div className="quote-form-field">
    <label className="quote-form-label">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="quote-form-error"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// Service checkbox component with large clickable area
const ServiceCheckbox = ({ service, checked, onChange }) => (
  <label
    className={`quote-service-checkbox ${checked ? 'quote-service-checkbox-checked' : ''}`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span className={`quote-checkbox-indicator ${checked ? 'quote-checkbox-indicator-checked' : ''}`}>
      {checked && <CheckCircle size={14} />}
    </span>
    <span className="quote-checkbox-label">{service.label}</span>
  </label>
);

// Main form component
const QuoteRequestForm = ({ 
  variant = 'default', // 'default' | 'compact' | 'service-page'
  preselectedService = null,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    services: preselectedService ? [preselectedService] : [],
    propertyType: '',
    areaSize: '',
    location: '',
    timeline: '',
    message: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [touched, setTouched] = useState({});

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle service checkbox toggle
  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  // Handle blur for validation
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Validate single field
  const validateField = (field) => {
    let error = null;
    const value = formData[field];

    switch (field) {
      case 'firstName':
        if (!value.trim()) error = 'Etunimi on pakollinen';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Sukunimi on pakollinen';
        break;
      case 'email':
        if (!value.trim()) error = 'Sähköposti on pakollinen';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Tarkista sähköpostiosoite';
        break;
      case 'phone':
        if (value && !/^[+]?[\d\s-]{6,}$/.test(value)) error = 'Tarkista puhelinnumero';
        break;
      case 'message':
        if (!value.trim()) error = 'Viesti on pakollinen';
        else if (value.trim().length < 10) error = 'Kerro projektistasi tarkemmin (vähintään 10 merkkiä)';
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  // Validate all fields
  const validateAll = () => {
    const newErrors = {};
    ['firstName', 'lastName', 'email', 'message'].forEach(field => {
      const error = validateField(field);
      if (error) newErrors[field] = error;
    });
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    setTouched({ firstName: true, lastName: true, email: true, phone: true, message: true });
    
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare payload - include subject for backward compatibility
      const payload = {
        ...formData,
        subject: formData.services.length > 0 
          ? `Tarjouspyyntö: ${formData.services.map(s => SERVICE_OPTIONS.find(o => o.id === s)?.label || s).join(', ')}`
          : 'Tarjouspyyntö',
      };

      await axios.post(`${API}/contact`, payload);
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        services: [],
        propertyType: '',
        areaSize: '',
        location: '',
        timeline: '',
        message: '',
      });
      setTouched({});
      setErrors({});
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    }
    
    setIsSubmitting(false);
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`quote-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="quote-form" noValidate>
        
        {/* Success Message */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="quote-form-success"
            >
              <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Kiitos tarjouspyynnöstäsi!</p>
                <p className="text-sm text-green-700 mt-1">Vastaamme sinulle 24 tunnin sisällä arkisin.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="quote-form-error-box"
            >
              <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Lähetys epäonnistui</p>
                <p className="text-sm text-red-700 mt-1">Yritä uudelleen tai ota yhteyttä puhelimitse.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {submitStatus !== 'success' && (
          <>
            {/* CONTACT INFO */}
            <div className="quote-form-section">
              <h4 className="quote-form-section-title">Yhteystiedot</h4>
              <div className="quote-form-grid-2">
                <FormField label="Etunimi" required error={touched.firstName && errors.firstName}>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    className={`quote-form-input ${touched.firstName && errors.firstName ? 'quote-form-input-error' : ''}`}
                    placeholder="Matti"
                  />
                </FormField>
                <FormField label="Sukunimi" required error={touched.lastName && errors.lastName}>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    className={`quote-form-input ${touched.lastName && errors.lastName ? 'quote-form-input-error' : ''}`}
                    placeholder="Meikäläinen"
                  />
                </FormField>
              </div>
              <div className="quote-form-grid-2">
                <FormField label="Sähköposti" required error={touched.email && errors.email}>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`quote-form-input ${touched.email && errors.email ? 'quote-form-input-error' : ''}`}
                    placeholder="matti@esimerkki.fi"
                  />
                </FormField>
                <FormField label="Puhelin" required error={touched.phone && errors.phone}>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={`quote-form-input ${touched.phone && errors.phone ? 'quote-form-input-error' : ''}`}
                    placeholder="+358 40 123 4567"
                  />
                </FormField>
              </div>
            </div>

            {/* PROJECT INFO */}
            <div className="quote-form-section">
              <h4 className="quote-form-section-title">Projektin tiedot</h4>
              
              {/* Service Multi-Select */}
              <FormField label="Mitä palveluita tarvitset?">
                <div className="quote-services-grid">
                  {SERVICE_OPTIONS.map(service => (
                    <ServiceCheckbox
                      key={service.id}
                      service={service}
                      checked={formData.services.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                    />
                  ))}
                </div>
              </FormField>

              {/* Dropdowns - always visible */}
              <div className="quote-form-grid-2">
                <FormField label="Kohde">
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    className="quote-form-select"
                  >
                    {PROPERTY_TYPES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Pinta-ala">
                  <select
                    value={formData.areaSize}
                    onChange={(e) => handleChange('areaSize', e.target.value)}
                    className="quote-form-select"
                  >
                    {AREA_SIZES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="quote-form-grid-2">
                <FormField label="Sijainti">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="quote-form-input"
                    placeholder="Esim. Helsinki, Espoo"
                  />
                </FormField>
                <FormField label="Aikataulu">
                  <select
                    value={formData.timeline}
                    onChange={(e) => handleChange('timeline', e.target.value)}
                    className="quote-form-select"
                  >
                    {TIMELINES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            {/* PROJECT DESCRIPTION */}
            <div className="quote-form-section">
              <h4 className="quote-form-section-title">Projektin kuvaus</h4>
              <FormField label="Kerro projektistasi" required error={touched.message && errors.message}>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  rows={4}
                  className={`quote-form-textarea ${touched.message && errors.message ? 'quote-form-input-error' : ''}`}
                  placeholder="Kuvaile projektisi: mitä tehdään, missä, milloin, ja muut tärkeät tiedot..."
                />
              </FormField>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="quote-form-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Lähetetään...
                </>
              ) : (
                <>
                  Lähetä tarjouspyyntö
                  <Send size={18} />
                </>
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default QuoteRequestForm;
