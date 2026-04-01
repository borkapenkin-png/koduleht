import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, Save, RefreshCw, ChevronDown, ChevronUp, Settings, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CalculatorAdmin = ({ token }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedService, setExpandedService] = useState(null);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/calculator-config`, headers);
      setConfig(res.data);
    } catch (err) {
      console.error('Failed to load calculator config:', err);
    }
    setLoading(false);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/calculator-config`, config, headers);
      alert('Hintalaskuri päivitetty!');
    } catch (err) {
      alert('Virhe tallennuksessa');
    }
    setSaving(false);
  };

  const updateGlobal = (key, value) => {
    setConfig(prev => ({
      ...prev,
      global_settings: { ...prev.global_settings, [key]: value }
    }));
  };

  const updateService = (serviceId, key, value) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === serviceId ? { ...s, [key]: value } : s)
    }));
  };

  const updateStepOption = (serviceId, stepId, optionId, key, value) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          steps: s.steps.map(step => {
            if (step.id !== stepId) return step;
            return {
              ...step,
              options: step.options.map(opt =>
                opt.id === optionId ? { ...opt, [key]: value } : opt
              )
            };
          })
        };
      })
    }));
  };

  const updateAddon = (serviceId, addonId, key, value) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          addons: s.addons.map(a => a.id === addonId ? { ...a, [key]: value } : a)
        };
      })
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) return <p className="text-center text-red-500">Virhe ladattaessa konfiguraatiota</p>;

  return (
    <div className="space-y-6" data-testid="calculator-admin">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Calculator size={20} className="text-primary" />
            Hintalaskuri
          </h2>
          <p className="text-sm text-[#64748B]">Muokkaa hintalaskurin hintoja, kertoimia ja asetuksia.</p>
        </div>
        <button onClick={saveConfig} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90" data-testid="calc-save-btn">
          <Save size={14} />{saving ? 'Tallennetaan...' : 'Tallenna'}
        </button>
      </div>

      {/* Global Settings */}
      <div className="bg-white border rounded-lg p-4 md:p-6" data-testid="calc-global-settings">
        <h3 className="font-bold text-[#0F172A] flex items-center gap-2 mb-4">
          <Settings size={16} className="text-primary" /> Yleiset asetukset
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">ALV %</label>
            <input type="number" step="0.1" value={config.global_settings.tax_rate} onChange={e => updateGlobal('tax_rate', parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" data-testid="calc-tax-rate" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Kotitalousvähennys %</label>
            <input type="number" step="1" value={config.global_settings.kotitalousvahennys_rate} onChange={e => updateGlobal('kotitalousvahennys_rate', parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" data-testid="calc-koti-rate" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Max vähennys/hlö €</label>
            <input type="number" value={config.global_settings.kotitalousvahennys_max_per_person} onChange={e => updateGlobal('kotitalousvahennys_max_per_person', parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" data-testid="calc-koti-max" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Työn osuus %</label>
            <input type="number" value={config.global_settings.labor_percentage} onChange={e => updateGlobal('labor_percentage', parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" data-testid="calc-labor-pct" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">CTA otsikko</label>
            <input type="text" value={config.global_settings.cta_title} onChange={e => updateGlobal('cta_title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">CTA alaotsikko</label>
            <input type="text" value={config.global_settings.cta_subtitle} onChange={e => updateGlobal('cta_subtitle', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-2">
        <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
          <DollarSign size={16} className="text-primary" /> Palveluiden hinnoittelu
        </h3>
        {config.services.map(service => (
          <div key={service.id} className="bg-white border rounded-lg overflow-hidden" data-testid={`calc-service-${service.id}`}>
            <button
              onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${service.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium text-[#0F172A] text-sm">{service.name}</span>
                <span className="text-xs text-[#94A3B8]">{service.base_price_per_m2} €/m²</span>
              </div>
              {expandedService === service.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandedService === service.id && (
              <div className="border-t p-4 space-y-4">
                {/* Base settings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Perushinta €/m²</label>
                    <input type="number" step="0.5" value={service.base_price_per_m2} onChange={e => updateService(service.id, 'base_price_per_m2', parseFloat(e.target.value))} className="w-full border rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">Järjestys</label>
                    <input type="number" value={service.order} onChange={e => updateService(service.id, 'order', parseInt(e.target.value))} className="w-full border rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 pb-1">
                      <input type="checkbox" checked={service.enabled} onChange={e => updateService(service.id, 'enabled', e.target.checked)} className="rounded" />
                      <span className="text-sm text-[#334155]">Käytössä</span>
                    </label>
                  </div>
                </div>

                {/* Step multipliers */}
                {service.steps.filter(s => s.type === 'cards').map(step => (
                  <div key={step.id}>
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">{step.title} – kertoimet</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {step.options.map(opt => (
                        <div key={opt.id} className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded">
                          <span className="text-xs text-[#334155] flex-1">{opt.label}</span>
                          <input type="number" step="0.01" value={opt.multiplier} onChange={e => updateStepOption(service.id, step.id, opt.id, 'multiplier', parseFloat(e.target.value))} className="w-16 border rounded px-1.5 py-1 text-xs text-center" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Addons */}
                {service.addons && service.addons.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Lisäpalvelut</h4>
                    <div className="space-y-2">
                      {service.addons.map(addon => (
                        <div key={addon.id} className="flex items-center gap-3 bg-[#F8FAFC] p-2 rounded">
                          <input type="checkbox" checked={addon.enabled} onChange={e => updateAddon(service.id, addon.id, 'enabled', e.target.checked)} className="rounded" />
                          <span className="text-xs text-[#334155] flex-1">{addon.label}</span>
                          {addon.price_per_m2 !== undefined && (
                            <div className="flex items-center gap-1">
                              <input type="number" step="0.5" value={addon.price_per_m2} onChange={e => updateAddon(service.id, addon.id, 'price_per_m2', parseFloat(e.target.value))} className="w-16 border rounded px-1.5 py-1 text-xs text-center" />
                              <span className="text-xs text-[#94A3B8]">€/m²</span>
                            </div>
                          )}
                          {addon.fixed_price !== undefined && (
                            <div className="flex items-center gap-1">
                              <input type="number" value={addon.fixed_price} onChange={e => updateAddon(service.id, addon.id, 'fixed_price', parseFloat(e.target.value))} className="w-16 border rounded px-1.5 py-1 text-xs text-center" />
                              <span className="text-xs text-[#94A3B8]">€</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorAdmin;
