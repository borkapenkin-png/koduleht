import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, Save, ChevronDown, ChevronUp, Settings, DollarSign, Plus, Trash2, Package, GripVertical, FileText, Image as ImageIcon } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const GROUPS = [
  { id: 'esityot', label: 'Esityöt' },
  { id: 'tarvittaessa', label: 'Tarvittaessa' },
  { id: 'lisapalvelut', label: 'Lisäpalvelut' }
];
const BADGES = ['', 'Suositeltu', 'Usein valitaan'];

const CalculatorAdmin = ({ token }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedService, setExpandedService] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  const [pageData, setPageData] = useState(null);
  const [seoExpanded, setSeoExpanded] = useState(false);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const configRes = await axios.get(`${API}/admin/calculator-config`, headers);
      setConfig(configRes.data);
    } catch (err) {
      console.error('Failed to load calculator config:', err);
    }
    try {
      const pageRes = await axios.get(`${API}/service-pages/hintalaskuri`);
      if (pageRes.data) setPageData(pageRes.data);
    } catch (pageErr) {
      console.warn('Hintalaskuri page not found:', pageErr.message);
    }
    setLoading(false);
  };

  const updatePageField = (field, value) => {
    setPageData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/calculator-config`, config, headers);
      if (pageData?.id) {
        await axios.put(`${API}/admin/service-pages/${pageData.id}`, {
          seo_title: pageData.seo_title,
          seo_description: pageData.seo_description,
          hero_title: pageData.hero_title,
          hero_subtitle: pageData.hero_subtitle,
          hero_image_url: pageData.hero_image_url,
          description_text: pageData.description_text,
        }, headers);
      }
      alert('Hintalaskuri päivitetty!');
    } catch (err) {
      alert('Virhe tallennuksessa');
    }
    setSaving(false);
  };

  const updateGlobal = (key, value) => {
    setConfig(prev => ({ ...prev, global_settings: { ...prev.global_settings, [key]: value } }));
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
        return { ...s, steps: s.steps.map(step => {
          if (step.id !== stepId) return step;
          return { ...step, options: step.options.map(opt => opt.id === optionId ? { ...opt, [key]: value } : opt) };
        })};
      })
    }));
  };

  const updateConditionalOption = (serviceId, stepId, condKey, optionId, key, value) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return { ...s, steps: s.steps.map(step => {
          if (step.id !== stepId) return step;
          const updatedCond = { ...step.conditional_options };
          updatedCond[condKey] = updatedCond[condKey].map(opt => opt.id === optionId ? { ...opt, [key]: value } : opt);
          return { ...step, conditional_options: updatedCond };
        })};
      })
    }));
  };

  const updateAddon = (serviceId, addonId, key, value) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return { ...s, addons: s.addons.map(a => a.id === addonId ? { ...a, [key]: value } : a) };
      })
    }));
  };

  const addAddon = (serviceId) => {
    const id = `addon_${Date.now()}`;
    const newAddon = {
      id, label: 'Uusi lisäpalvelu', hint: '', price_per_m2: 0,
      enabled: true, group: 'lisapalvelut', badge: '', warning: ''
    };
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return { ...s, addons: [...(s.addons || []), newAddon] };
      })
    }));
  };

  const removeAddon = (serviceId, addonId) => {
    if (!window.confirm('Poistetaanko tämä lisäpalvelu?')) return;
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          addons: s.addons.filter(a => a.id !== addonId),
          packages: (s.packages || []).map(p => ({
            ...p,
            addon_ids: p.addon_ids.filter(aid => aid !== addonId)
          }))
        };
      })
    }));
  };

  const togglePackageAddon = (serviceId, packageId, addonId) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          packages: (s.packages || []).map(p => {
            if (p.id !== packageId) return p;
            const has = p.addon_ids.includes(addonId);
            return { ...p, addon_ids: has ? p.addon_ids.filter(a => a !== addonId) : [...p.addon_ids, addonId] };
          })
        };
      })
    }));
  };

  const updatePackage = (serviceId, packageId, key, value) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return { ...s, packages: (s.packages || []).map(p => p.id === packageId ? { ...p, [key]: value } : p) };
      })
    }));
  };

  const setDefaultPackage = (serviceId, packageId) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.id !== serviceId) return s;
        return { ...s, packages: (s.packages || []).map(p => ({ ...p, default: p.id === packageId })) };
      })
    }));
  };

  const getTab = (serviceId) => activeTab[serviceId] || 'base';
  const setTab = (serviceId, tab) => setActiveTab(prev => ({ ...prev, [serviceId]: tab }));

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }
  if (!config) return <p className="text-center text-red-500">Virhe ladattaessa konfiguraatiota</p>;

  return (
    <div className="space-y-6" data-testid="calculator-admin">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Calculator size={20} className="text-primary" /> Hintalaskuri
          </h2>
          <p className="text-sm text-[#64748B]">Muokkaa hintoja, paketteja ja lisäpalveluja.</p>
        </div>
        <button onClick={saveConfig} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90" data-testid="calc-save-btn">
          <Save size={14} />{saving ? 'Tallennetaan...' : 'Tallenna'}
        </button>
      </div>

      {/* SEO & Hero Settings */}
      {pageData && (
        <div className="bg-white border rounded-lg overflow-hidden" data-testid="calc-seo-settings">
          <button onClick={() => setSeoExpanded(!seoExpanded)}
            className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-[#F8FAFC] transition-colors">
            <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Sivun SEO & Hero
            </h3>
            {seoExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {seoExpanded && (
            <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 border-t pt-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">SEO-otsikko (title)</label>
                <input type="text" value={pageData.seo_title || ''} onChange={e => updatePageField('seo_title', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Hintalaskuri – Maalaus- ja tasoitustöiden hinta-arvio" />
                <p className="text-xs text-[#94A3B8] mt-1">{(pageData.seo_title || '').length}/60 merkkiä</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Meta-kuvaus</label>
                <textarea value={pageData.seo_description || ''} onChange={e => updatePageField('seo_description', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={3} placeholder="Laske maalaus- ja tasoitustöiden hinta-arvio..." />
                <p className="text-xs text-[#94A3B8] mt-1">{(pageData.seo_description || '').length}/160 merkkiä</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Hero-otsikko (H1)</label>
                <input type="text" value={pageData.hero_title || ''} onChange={e => updatePageField('hero_title', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Laske hinta-arvio hetkessä" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Hero-alaotsikko</label>
                <textarea value={pageData.hero_subtitle || ''} onChange={e => updatePageField('hero_subtitle', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={2} placeholder="Saat suuntaa-antavan hinnan heti..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">Hero-taustakuva URL</label>
                <input type="text" value={pageData.hero_image_url || ''} onChange={e => updatePageField('hero_image_url', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                {pageData.hero_image_url && (
                  <img src={pageData.hero_image_url} alt="Preview" className="mt-2 h-24 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">SEO-teksti (description_text, HTML)</label>
                <textarea value={pageData.description_text || ''} onChange={e => updatePageField('description_text', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none" rows={6} placeholder="<p>Hintaan vaikuttavat tekijät...</p>" />
                <p className="text-xs text-[#94A3B8] mt-1">Tämä teksti näkyy hintalaskurisivulla hakukoneita varten.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Settings */}
      <div className="bg-white border rounded-lg p-4 md:p-6" data-testid="calc-global-settings">
        <h3 className="font-bold text-[#0F172A] flex items-center gap-2 mb-4">
          <Settings size={16} className="text-primary" /> Yleiset asetukset
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'ALV %', key: 'tax_rate', step: '0.1' },
            { label: 'Kotitalousvähennys %', key: 'kotitalousvahennys_rate', step: '1' },
            { label: 'Max vähennys/hlö €', key: 'kotitalousvahennys_max_per_person', step: '1' },
            { label: 'Työn osuus %', key: 'labor_percentage', step: '1' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-[#64748B] mb-1">{f.label}</label>
              <input type="number" step={f.step} value={config.global_settings[f.key]} onChange={e => updateGlobal(f.key, parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
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
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Palveluvalinta — otsikko</label>
            <input type="text" value={config.global_settings.service_step_title || ''} onChange={e => updateGlobal('service_step_title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Valitse palvelu" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Palveluvalinta — alaotsikko</label>
            <input type="text" value={config.global_settings.service_step_subtitle || ''} onChange={e => updateGlobal('service_step_subtitle', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Minkä tyyppistä työtä tarvitset?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Lisävalinnat — otsikko</label>
            <input type="text" value={config.global_settings.addons_step_title || ''} onChange={e => updateGlobal('addons_step_title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Lisävalinnat" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Lisävalinnat — alaotsikko</label>
            <input type="text" value={config.global_settings.addons_step_subtitle || ''} onChange={e => updateGlobal('addons_step_subtitle', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Valitse tarvitsemasi lisäpalvelut" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Tuloksen otsikko</label>
            <input type="text" value={config.global_settings.result_title || ''} onChange={e => updateGlobal('result_title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Arvioitu hinta" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Yhteenveto-otsikko</label>
            <input type="text" value={config.global_settings.summary_title || ''} onChange={e => updateGlobal('summary_title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Mihin arvio perustuu" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Erittely-otsikko</label>
            <input type="text" value={config.global_settings.breakdown_title || ''} onChange={e => updateGlobal('breakdown_title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Miten hinta muodostuu" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Ryhmä: Esityöt</label>
            <input type="text" value={config.global_settings.group_label_esityot || ''} onChange={e => updateGlobal('group_label_esityot', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Esityöt" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Ryhmä: Tarvittaessa</label>
            <input type="text" value={config.global_settings.group_label_tarvittaessa || ''} onChange={e => updateGlobal('group_label_tarvittaessa', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tarvittaessa" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1">Ryhmä: Lisäpalvelut</label>
            <input type="text" value={config.global_settings.group_label_lisapalvelut || ''} onChange={e => updateGlobal('group_label_lisapalvelut', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Lisäpalvelut" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#64748B] mb-1">Vastuuvapauslauseke</label>
            <textarea value={config.global_settings.disclaimer || ''} onChange={e => updateGlobal('disclaimer', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={2} />
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
            <button onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${service.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-medium text-[#0F172A] text-sm">{service.name}</span>
                <span className="text-xs text-[#94A3B8]">{service.base_price_per_m2} €/m²</span>
                <span className="text-xs text-[#94A3B8]">({(service.addons || []).length} lisäpalvelua)</span>
              </div>
              {expandedService === service.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandedService === service.id && (
              <div className="border-t">
                {/* Tabs */}
                <div className="flex border-b bg-[#F8FAFC]">
                  {[
                    { id: 'base', label: 'Perustiedot' },
                    { id: 'addons', label: `Lisäpalvelut (${(service.addons || []).length})` }
                  ].map(t => (
                    <button key={t.id} onClick={() => setTab(service.id, t.id)}
                      className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                        getTab(service.id) === t.id ? 'text-primary border-b-2 border-primary bg-white' : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}>{t.label}</button>
                  ))}
                </div>

                <div className="p-4 space-y-4">
                  {/* BASE TAB */}
                  {getTab(service.id) === 'base' && (
                    <>
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
                      {/* Step multipliers & slider helper texts */}
                      {service.steps.filter(s => s.type === 'cards' || s.type === 'size_cards' || s.type === 'slider').map(step => (
                        <div key={step.id}>
                          {(step.type === 'cards' || step.type === 'size_cards') && (
                            <>
                              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">{step.title}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <label className="text-[10px] text-[#94A3B8]">Otsikko:</label>
                                <input type="text" value={step.title} onChange={e => {
                                  setConfig(prev => ({
                                    ...prev,
                                    services: prev.services.map(s => s.id !== service.id ? s : {
                                      ...s, steps: s.steps.map(st => st.id !== step.id ? st : { ...st, title: e.target.value })
                                    })
                                  }));
                                }} className="flex-1 border rounded px-2 py-1 text-xs" />
                              </div>
                              {step.conditional_options ? (
                                Object.entries(step.conditional_options).map(([condKey, condOpts]) => {
                                  const parentStep = service.steps.find(s => s.id === step.conditional_on);
                                  const parentOpt = parentStep?.options?.find(o => o.id === condKey);
                                  const groupLabel = parentOpt?.label || condKey;
                                  return (
                                    <div key={condKey} className="mb-3">
                                      <p className="text-[10px] font-semibold text-[#0D9488] uppercase mb-1">{groupLabel}</p>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {condOpts.map(opt => (
                                          <div key={opt.id} className="bg-[#F8FAFC] p-2 rounded space-y-1 border-l-2 border-[#0D9488]/30">
                                            <input type="text" value={opt.label} onChange={e => updateConditionalOption(service.id, step.id, condKey, opt.id, 'label', e.target.value)}
                                              className="flex-1 border rounded px-1.5 py-0.5 text-xs min-w-0 w-full" title="Nimi" />
                                            {opt.multiplier !== undefined && (
                                              <div className="flex items-center gap-1">
                                                <span className="text-[9px] text-[#94A3B8] whitespace-nowrap">×hinta</span>
                                                <input type="number" step="0.01" value={opt.multiplier} onChange={e => updateConditionalOption(service.id, step.id, condKey, opt.id, 'multiplier', parseFloat(e.target.value) || 0)}
                                                  className="w-14 border rounded px-1.5 py-0.5 text-xs text-center" title="Hintakerroin" />
                                              </div>
                                            )}
                                            {opt.description !== undefined && (
                                              <input type="text" value={opt.description || ''} onChange={e => updateConditionalOption(service.id, step.id, condKey, opt.id, 'description', e.target.value)}
                                                className="w-full border rounded px-1.5 py-0.5 text-[10px] text-[#64748B]" placeholder="Kuvaus" title="Kuvaus" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : step.options ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {step.options.map(opt => (
                                  <div key={opt.id} className="bg-[#F8FAFC] p-2 rounded space-y-1">
                                    <div className="flex items-center gap-1">
                                      <input type="text" value={opt.label} onChange={e => updateStepOption(service.id, step.id, opt.id, 'label', e.target.value)}
                                        className="flex-1 border rounded px-1.5 py-0.5 text-xs min-w-0" title="Nimi" />
                                    </div>
                                    {opt.area_multiplier !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] text-[#94A3B8] whitespace-nowrap">×m²</span>
                                        <input type="number" step="0.1" value={opt.area_multiplier} onChange={e => updateStepOption(service.id, step.id, opt.id, 'area_multiplier', parseFloat(e.target.value) || 0)}
                                          className="w-14 border rounded px-1.5 py-0.5 text-xs text-center" title="Pinta-alakerroin" />
                                      </div>
                                    )}
                                    {opt.multiplier !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] text-[#94A3B8] whitespace-nowrap">×hinta</span>
                                        <input type="number" step="0.01" value={opt.multiplier} onChange={e => updateStepOption(service.id, step.id, opt.id, 'multiplier', parseFloat(e.target.value) || 0)}
                                          className="w-14 border rounded px-1.5 py-0.5 text-xs text-center" title="Hintakerroin" />
                                      </div>
                                    )}
                                    {opt.description !== undefined && (
                                      <input type="text" value={opt.description || ''} onChange={e => updateStepOption(service.id, step.id, opt.id, 'description', e.target.value)}
                                        className="w-full border rounded px-1.5 py-0.5 text-[10px] text-[#64748B]" placeholder="Kuvaus" title="Kuvaus" />
                                    )}
                                  </div>
                                ))}
                              </div>
                              ) : null}
                            </>
                          )}
                          {step.type === 'slider' && (
                            <>
                              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">{step.title} (liukusäädin)</h4>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] text-[#94A3B8]">Otsikko:</label>
                                  <input type="text" value={step.title} onChange={e => {
                                    setConfig(prev => ({
                                      ...prev,
                                      services: prev.services.map(s => s.id !== service.id ? s : {
                                        ...s, steps: s.steps.map(st => st.id !== step.id ? st : { ...st, title: e.target.value })
                                      })
                                    }));
                                  }} className="flex-1 border rounded px-2 py-1 text-xs" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] text-[#94A3B8]">Aputeksti:</label>
                                  <input type="text" value={step.helper_text || ''} onChange={e => {
                                    setConfig(prev => ({
                                      ...prev,
                                      services: prev.services.map(s => s.id !== service.id ? s : {
                                        ...s, steps: s.steps.map(st => st.id !== step.id ? st : { ...st, helper_text: e.target.value })
                                      })
                                    }));
                                  }} className="flex-1 border rounded px-2 py-1 text-xs" placeholder="Syötä huoneiston pohjapinta-ala..." />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  {/* ADDONS TAB */}
                  {getTab(service.id) === 'addons' && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[#64748B]">Hallinnoi lisäpalveluja ja niiden hintoja</p>
                        <button onClick={() => addAddon(service.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
                          data-testid={`add-addon-${service.id}`}>
                          <Plus size={12} /> Lisää palvelu
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(service.addons || []).map((addon, idx) => (
                          <div key={addon.id} className="border rounded-lg p-3 bg-[#FAFBFC]" data-testid={`admin-addon-${addon.id}`}>
                            <div className="flex items-start gap-2">
                              <GripVertical size={14} className="text-[#CBD5E1] mt-2 flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                {/* Row 1: Name + Enable + Delete */}
                                <div className="flex items-center gap-2">
                                  <input type="text" value={addon.label} onChange={e => updateAddon(service.id, addon.id, 'label', e.target.value)}
                                    className="flex-1 border rounded px-2 py-1.5 text-sm font-medium" placeholder="Nimi" />
                                  <label className="flex items-center gap-1 flex-shrink-0">
                                    <input type="checkbox" checked={addon.enabled} onChange={e => updateAddon(service.id, addon.id, 'enabled', e.target.checked)} className="rounded" />
                                    <span className="text-xs text-[#64748B]">On</span>
                                  </label>
                                  <button onClick={() => removeAddon(service.id, addon.id)} className="p-1 text-red-400 hover:text-red-600" data-testid={`del-addon-${addon.id}`}>
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                {/* Row 2: Hint */}
                                <input type="text" value={addon.hint || ''} onChange={e => updateAddon(service.id, addon.id, 'hint', e.target.value)}
                                  className="w-full border rounded px-2 py-1.5 text-xs text-[#64748B]" placeholder="Kuvaus (näkyy asiakkaalle)" />
                                {/* Row 3: Price + Group + Badge */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <input type="number" step="0.5" value={addon.price_per_m2 ?? ''} placeholder="€/m²"
                                      onChange={e => {
                                        const v = e.target.value ? parseFloat(e.target.value) : undefined;
                                        updateAddon(service.id, addon.id, 'price_per_m2', v);
                                      }}
                                      className="w-16 border rounded px-1.5 py-1 text-xs text-center" />
                                    <span className="text-xs text-[#94A3B8]">€/m²</span>
                                  </div>
                                  <span className="text-xs text-[#CBD5E1]">tai</span>
                                  <div className="flex items-center gap-1">
                                    <input type="number" value={addon.fixed_price ?? ''} placeholder="€"
                                      onChange={e => {
                                        const v = e.target.value ? parseFloat(e.target.value) : undefined;
                                        updateAddon(service.id, addon.id, 'fixed_price', v);
                                      }}
                                      className="w-16 border rounded px-1.5 py-1 text-xs text-center" />
                                    <span className="text-xs text-[#94A3B8]">€ (kiinteä)</span>
                                  </div>
                                  <select value={addon.group || 'lisapalvelut'} onChange={e => updateAddon(service.id, addon.id, 'group', e.target.value)}
                                    className="border rounded px-1.5 py-1 text-xs">
                                    {GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                                  </select>
                                  <select value={addon.badge || ''} onChange={e => updateAddon(service.id, addon.id, 'badge', e.target.value)}
                                    className="border rounded px-1.5 py-1 text-xs">
                                    {BADGES.map(b => <option key={b} value={b}>{b || '— Ei badge —'}</option>)}
                                  </select>
                                </div>
                                {/* Row 4: Quantity + Warning + Price Label */}
                                <div className="flex gap-2 items-center">
                                  <label className="flex items-center gap-1 whitespace-nowrap">
                                    <input type="checkbox" checked={addon.allow_quantity || false} onChange={e => updateAddon(service.id, addon.id, 'allow_quantity', e.target.checked)} className="rounded" />
                                    <span className="text-xs text-[#64748B]">kpl-valinta</span>
                                  </label>
                                  <input type="text" value={addon.warning || ''} onChange={e => updateAddon(service.id, addon.id, 'warning', e.target.value)}
                                    className="flex-1 border rounded px-2 py-1.5 text-xs" placeholder="Varoitus (kun poistetaan valinta)" />
                                  <input type="text" value={addon.price_label || ''} onChange={e => updateAddon(service.id, addon.id, 'price_label', e.target.value)}
                                    className="w-32 border rounded px-2 py-1.5 text-xs" placeholder="Hintateksti" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* PACKAGES TAB */}
                  {getTab(service.id) === 'packages' && (
                    <>
                      <p className="text-xs text-[#64748B] mb-3">Hallinnoi paketteja ja valitse mitkä lisäpalvelut kuuluvat kuhunkin pakettiin.</p>
                      <div className="space-y-4">
                        {(service.packages || []).map((pkg, pi) => (
                          <div key={pkg.id} className={`border rounded-lg p-4 ${pkg.default ? 'border-primary/40 bg-primary/[0.02]' : 'bg-[#FAFBFC]'}`}
                            data-testid={`admin-package-${pkg.id}`}>
                            <div className="flex items-center gap-3 mb-3">
                              <Package size={16} className={pkg.default ? 'text-primary' : 'text-[#94A3B8]'} />
                              <div className="flex-1 flex items-center gap-2">
                                <input type="text" value={pkg.label} onChange={e => updatePackage(service.id, pkg.id, 'label', e.target.value)}
                                  className="border rounded px-2 py-1.5 text-sm font-bold w-32" />
                                <input type="text" value={pkg.description} onChange={e => updatePackage(service.id, pkg.id, 'description', e.target.value)}
                                  className="flex-1 border rounded px-2 py-1.5 text-xs text-[#64748B]" placeholder="Kuvaus" />
                              </div>
                              <button onClick={() => setDefaultPackage(service.id, pkg.id)}
                                className={`px-2 py-1 text-xs rounded font-medium ${
                                  pkg.default ? 'bg-primary text-white' : 'bg-[#E2E8F0] text-[#64748B] hover:bg-[#CBD5E1]'
                                }`}>
                                {pkg.default ? 'Oletus' : 'Aseta oletukseksi'}
                              </button>
                            </div>
                            {/* Addon checkboxes for this package */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                              {(service.addons || []).filter(a => a.enabled).map(addon => {
                                const included = pkg.addon_ids.includes(addon.id);
                                return (
                                  <label key={addon.id} className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                                    included ? 'bg-primary/10 text-primary font-medium' : 'text-[#64748B] hover:bg-[#F1F5F9]'
                                  }`}>
                                    <input type="checkbox" checked={included}
                                      onChange={() => togglePackageAddon(service.id, pkg.id, addon.id)}
                                      className="rounded" />
                                    {addon.label}
                                    {addon.price_per_m2 ? ` (${addon.price_per_m2}€/m²)` : addon.fixed_price ? ` (${addon.fixed_price}€)` : ''}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorAdmin;
