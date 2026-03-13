// Global Settings Admin Component
// Handles company-wide settings that apply across all pages

import React, { useState, useEffect } from 'react';
import { 
  Save, Building2, Phone, Mail, MapPin, Plus, Trash2, CheckCircle
} from 'lucide-react';

const GlobalSettingsAdmin = ({ settings, onChange, onSave, saving }) => {
  const [localSettings, setLocalSettings] = useState(settings || {});

  useEffect(() => {
    setLocalSettings(settings || {});
  }, [settings]);

  const handleChange = (field, value) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    if (onChange) onChange(updated);
  };

  const handleArrayChange = (field, index, value) => {
    const arr = [...(localSettings[field] || [])];
    arr[index] = value;
    handleChange(field, arr);
  };

  const addArrayItem = (field, defaultValue = '') => {
    const arr = [...(localSettings[field] || []), defaultValue];
    handleChange(field, arr);
  };

  const removeArrayItem = (field, index) => {
    const arr = (localSettings[field] || []).filter((_, i) => i !== index);
    handleChange(field, arr);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Building2 size={20} className="text-[#0056D2]" />
            Yleiset asetukset
          </h2>
          <p className="text-sm text-[#64748B]">
            Nämä tiedot näkyvät koko sivustolla
          </p>
        </div>
        <button 
          onClick={onSave} 
          disabled={saving}
          className="px-4 py-2 bg-[#0056D2] text-white rounded-lg hover:bg-[#0045A8] flex items-center gap-2"
        >
          <Save size={16} />
          {saving ? 'Tallennetaan...' : 'Tallenna'}
        </button>
      </div>

      {/* Company Info */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2 flex items-center gap-2">
          <Building2 size={18} className="text-[#0056D2]" />
          Yrityksen tiedot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Yrityksen nimi</label>
            <input
              type="text"
              value={localSettings.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#0056D2] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y-tunnus</label>
            <input
              type="text"
              value={localSettings.company_vat_id || ''}
              onChange={(e) => handleChange('company_vat_id', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Perustusvuosi</label>
            <input
              type="text"
              value={localSettings.company_founded_year || ''}
              onChange={(e) => handleChange('company_founded_year', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kaupunki</label>
            <input
              type="text"
              value={localSettings.company_city || ''}
              onChange={(e) => handleChange('company_city', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2 flex items-center gap-2">
          <Phone size={18} className="text-[#0056D2]" />
          Yhteystiedot
        </h3>
        <p className="text-sm text-[#64748B]">
          Nämä tiedot päivittyvät automaattisesti koko sivustolle
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ensisijainen puhelin</label>
            <input
              type="text"
              value={localSettings.company_phone_primary || ''}
              onChange={(e) => handleChange('company_phone_primary', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="+358 40 054 7270"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Toissijainen puhelin</label>
            <input
              type="text"
              value={localSettings.company_phone_secondary || ''}
              onChange={(e) => handleChange('company_phone_secondary', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="+358 40 029 8247"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sähköposti</label>
            <input
              type="email"
              value={localSettings.company_email || ''}
              onChange={(e) => handleChange('company_email', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="info@jbtasoitusmaalaus.fi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Osoite</label>
            <input
              type="text"
              value={localSettings.company_address || ''}
              onChange={(e) => handleChange('company_address', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="Sienitie 25, 00760 Helsinki"
            />
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2 flex items-center gap-2">
          <MapPin size={18} className="text-[#0056D2]" />
          Palvelualueet
        </h3>
        <p className="text-sm text-[#64748B]">
          Alueet, joilla tarjoatte palveluita (näkyy kaikilla sivuilla)
        </p>
        <div className="flex flex-wrap gap-2">
          {(localSettings.service_areas || []).map((area, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg"
            >
              <input
                type="text"
                value={area}
                onChange={(e) => handleArrayChange('service_areas', index, e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-24"
              />
              <button
                onClick={() => removeArrayItem('service_areas', index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayItem('service_areas', 'Uusi alue')}
            className="flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:border-[#0056D2] hover:text-[#0056D2]"
          >
            <Plus size={14} />
            Lisää alue
          </button>
        </div>
      </div>

      {/* CTA Texts */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2">
          CTA-tekstit (toimintakutsut)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ensisijainen CTA</label>
            <input
              type="text"
              value={localSettings.cta_primary_text || ''}
              onChange={(e) => handleChange('cta_primary_text', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="Pyydä ilmainen arvio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Toissijainen CTA</label>
            <input
              type="text"
              value={localSettings.cta_secondary_text || ''}
              onChange={(e) => handleChange('cta_secondary_text', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="Soita nyt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Puhelin-CTA</label>
            <input
              type="text"
              value={localSettings.cta_phone_text || ''}
              onChange={(e) => handleChange('cta_phone_text', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="Pyydä tarjous"
            />
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2">
          Luottamusmerkit
        </h3>
        <p className="text-sm text-[#64748B]">
          Neljä luottamusmerkkiä jotka näkyvät sivuston yläosassa
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-xs font-medium text-[#64748B]">Merkki {num}</p>
              <input
                type="text"
                value={localSettings[`trust_badge_${num}_title`] || ''}
                onChange={(e) => handleChange(`trust_badge_${num}_title`, e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                placeholder="Otsikko"
              />
              <input
                type="text"
                value={localSettings[`trust_badge_${num}_subtitle`] || ''}
                onChange={(e) => handleChange(`trust_badge_${num}_subtitle`, e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                placeholder="Alaotsikko"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2 flex items-center gap-2">
          <CheckCircle size={18} className="text-[#0056D2]" />
          Miksi valita meidät -lista
        </h3>
        <p className="text-sm text-[#64748B]">
          Näkyy kaikilla sivuilla "Miksi valita" -osiossa
        </p>
        <div className="space-y-2">
          {(localSettings.why_choose_us || []).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#0056D2] flex-shrink-0" />
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('why_choose_us', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
              />
              <button
                onClick={() => removeArrayItem('why_choose_us', index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => addArrayItem('why_choose_us', 'Uusi kohta')}
            className="flex items-center gap-1 text-sm text-[#0056D2] hover:underline"
          >
            <Plus size={14} />
            Lisää kohta
          </button>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2">
          Prosessivaiheet
        </h3>
        <p className="text-sm text-[#64748B]">
          "Näin projekti etenee" -osion vaiheet
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0056D2] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {num}
                </span>
                <p className="text-xs font-medium text-[#64748B]">Vaihe {num}</p>
              </div>
              <input
                type="text"
                value={localSettings[`process_step_${num}_title`] || ''}
                onChange={(e) => handleChange(`process_step_${num}_title`, e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                placeholder="Otsikko"
              />
              <input
                type="text"
                value={localSettings[`process_step_${num}_desc`] || ''}
                onChange={(e) => handleChange(`process_step_${num}_desc`, e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
                placeholder="Kuvaus"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#0F172A] border-b pb-2">
          Footer-asetukset
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Footer-teksti</label>
            <input
              type="text"
              value={localSettings.footer_text || ''}
              onChange={(e) => handleChange('footer_text', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="Laatujohtajat vuodesta 2018"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Copyright-teksti</label>
            <input
              type="text"
              value={localSettings.footer_copyright || ''}
              onChange={(e) => handleChange('footer_copyright', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
              placeholder="Kaikki oikeudet pidätetään."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettingsAdmin;
