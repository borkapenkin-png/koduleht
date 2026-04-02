// Areas (Cities/Locations) Admin Component
// Manages location-specific SEO pages (e.g., maalaustyot-helsinki)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, Plus, Edit2, Save, Trash2, X, GripVertical, Star, RefreshCw, FileText
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const emptyArea = { name: '', slug: '', name_inessive: '', is_default: false, order: 0, custom_texts: {} };

const AreasAdmin = ({ token, onRefresh }) => {
  const [areas, setAreas] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...emptyArea });
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showTexts, setShowTexts] = useState(null);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { loadAreas(); loadServices(); }, []);

  const loadServices = async () => {
    try {
      const res = await axios.get(`${API}/service-pages`, headers);
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load service pages:', err);
    }
  };

  const loadAreas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/areas`, headers);
      setAreas(res.data);
    } catch (err) {
      console.error('Failed to load areas:', err);
    }
    setLoading(false);
  };

  const startCreate = () => {
    const maxOrder = areas.length > 0 ? Math.max(...areas.map(a => a.order)) + 1 : 0;
    setForm({ ...emptyArea, order: maxOrder });
    setCreating(true);
    setEditing(null);
  };

  const startEdit = (area) => {
    setForm({ ...area });
    setEditing(area.id);
    setCreating(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setForm({ ...emptyArea });
  };

  const handleNameChange = (name) => {
    const slug = generateSlug(name);
    setForm(prev => ({ ...prev, name, slug }));
  };

  const saveArea = async () => {
    if (!form.name || !form.slug || !form.name_inessive) {
      alert('Täytä kaikki kentät (nimi, slug, inessiivi)');
      return;
    }
    setSaving(true);
    try {
      if (creating) {
        await axios.post(`${API}/admin/areas`, {
          name: form.name,
          slug: form.slug,
          name_inessive: form.name_inessive,
          is_default: form.is_default,
          order: form.order,
          custom_texts: form.custom_texts || {}
        }, headers);
      } else {
        await axios.put(`${API}/admin/areas/${editing}`, {
          name: form.name,
          slug: form.slug,
          name_inessive: form.name_inessive,
          is_default: form.is_default,
          order: form.order,
          custom_texts: form.custom_texts || {}
        }, headers);
      }
      cancelEdit();
      await loadAreas();
    } catch (err) {
      alert(err.response?.data?.detail || 'Virhe tallennuksessa');
    }
    setSaving(false);
  };

  const deleteArea = async (id) => {
    if (!window.confirm('Haluatko varmasti poistaa tämän alueen?')) return;
    try {
      await axios.delete(`${API}/admin/areas/${id}`, headers);
      await loadAreas();
    } catch (err) {
      alert(err.response?.data?.detail || 'Virhe poistossa');
    }
  };

  const regeneratePages = async () => {
    setRegenerating(true);
    try {
      const res = await axios.post(`${API}/admin/regenerate-static`, {}, headers);
      if (res.data.success) {
        alert('SEO-sivut päivitetty onnistuneesti! Uudet aluesivut ovat nyt käytössä.');
      } else {
        alert(`Virhe: ${res.data.message}`);
      }
    } catch (err) {
      alert('Virhe sivujen generoinnissa');
    }
    setRegenerating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="areas-admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Palvelualueet
          </h2>
          <p className="text-sm text-[#64748B]">
            Hallinnoi kaupunkeja ja alueita. Jokaiselle kaupungille luodaan omat SEO-sivut.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={regeneratePages}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors"
            data-testid="areas-regenerate-btn"
          >
            <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
            {regenerating ? 'Päivitetään...' : 'Päivitä SEO-sivut'}
          </button>
          <button
            onClick={startCreate}
            disabled={creating}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="areas-add-btn"
          >
            <Plus size={16} />
            Lisää kaupunki
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Miten tämä toimii:</strong> Jokaiselle kaupungille luodaan automaattisesti omat palvelusivut
        (esim. <code className="bg-blue-100 px-1 rounded">/maalaustyot-helsinki</code>). Lisää uusia kaupunkeja ja paina "Päivitä SEO-sivut" generoidaksesi sivut.
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white border-2 border-primary/30 rounded-lg p-4 md:p-6 space-y-4" data-testid="areas-create-form">
          <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            Uusi kaupunki
          </h3>
          <AreaForm form={form} setForm={setForm} onNameChange={handleNameChange} />
          <div className="flex gap-2 pt-2">
            <button onClick={saveArea} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90" data-testid="areas-save-btn">
              <Save size={14} />{saving ? 'Tallennetaan...' : 'Tallenna'}
            </button>
            <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9]" data-testid="areas-cancel-btn">
              <X size={14} />Peruuta
            </button>
          </div>
        </div>
      )}

      {/* Areas list */}
      <div className="space-y-2">
        {areas.map((area) => (
          <div key={area.id} className="bg-white border rounded-lg" data-testid={`area-item-${area.slug}`}>
            {editing === area.id ? (
              <div className="p-4 md:p-6 space-y-4">
                <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                  <Edit2 size={16} className="text-primary" />
                  Muokkaa: {area.name}
                </h3>
                <AreaForm form={form} setForm={setForm} onNameChange={handleNameChange} />
                <div className="flex gap-2 pt-2">
                  <button onClick={saveArea} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90" data-testid="areas-save-btn">
                    <Save size={14} />{saving ? 'Tallennetaan...' : 'Tallenna'}
                  </button>
                  <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9]" data-testid="areas-cancel-btn">
                    <X size={14} />Peruuta
                  </button>
                </div>
              </div>
            ) : (
              <>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-[#CBD5E1]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#0F172A]" data-testid={`area-name-${area.slug}`}>{area.name}</span>
                      {area.is_default && (
                        <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full" data-testid={`area-default-${area.slug}`}>
                          <Star size={10} />Oletus
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">
                      <span>slug: <code className="bg-[#F1F5F9] px-1 rounded">{area.slug}</code></span>
                      <span className="mx-2">|</span>
                      <span>inessiivi: <code className="bg-[#F1F5F9] px-1 rounded">{area.name_inessive}</code></span>
                      <span className="mx-2">|</span>
                      <span>järjestys: {area.order}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowTexts(showTexts === area.id ? null : area.id)} className={`p-2 rounded-lg transition-colors ${showTexts === area.id ? 'text-primary bg-primary/10' : 'text-[#64748B] hover:text-primary hover:bg-[#F1F5F9]'}`} data-testid={`area-texts-${area.slug}`} title="Linna-spetsiifilised tekstid">
                    <FileText size={16} />
                  </button>
                  <button onClick={() => startEdit(area)} className="p-2 text-[#64748B] hover:text-primary rounded-lg hover:bg-[#F1F5F9] transition-colors" data-testid={`area-edit-${area.slug}`}>
                    <Edit2 size={16} />
                  </button>
                  {!area.is_default && (
                    <button onClick={() => deleteArea(area.id)} className="p-2 text-[#64748B] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" data-testid={`area-delete-${area.slug}`}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              {/* City-specific custom texts panel */}
              {showTexts === area.id && (
                <CityTextsPanel area={area} services={services} token={token} onSave={loadAreas} />
              )}
            </>
            )}
          </div>
        ))}
        {areas.length === 0 && (
          <div className="text-center py-8 text-[#94A3B8]">
            Ei alueita. Lisää ensimmäinen kaupunki yllä olevalla painikkeella.
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable form for create/edit
const AreaForm = ({ form, setForm, onNameChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-[#334155] mb-1">Kaupungin nimi *</label>
      <input
        type="text"
        value={form.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="esim. Helsinki"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        data-testid="area-name-input"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-[#334155] mb-1">Slug (URL) *</label>
      <input
        type="text"
        value={form.slug}
        onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
        placeholder="esim. helsinki"
        className="w-full border rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        data-testid="area-slug-input"
      />
      <p className="text-xs text-[#94A3B8] mt-1">URL-muoto: /maalaustyot-<strong>{form.slug || '...'}</strong></p>
    </div>
    <div>
      <label className="block text-sm font-medium text-[#334155] mb-1">Inessiivi (missä-muoto) *</label>
      <input
        type="text"
        value={form.name_inessive}
        onChange={(e) => setForm(prev => ({ ...prev, name_inessive: e.target.value }))}
        placeholder="esim. Helsingissä"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        data-testid="area-inessive-input"
      />
      <p className="text-xs text-[#94A3B8] mt-1">Käytetään otsikossa: "Maalaustyöt <strong>{form.name_inessive || '...'}</strong>"</p>
    </div>
    <div className="flex items-end gap-6">
      <div>
        <label className="block text-sm font-medium text-[#334155] mb-1">Järjestys</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
          className="w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          data-testid="area-order-input"
        />
      </div>
      <label className="flex items-center gap-2 pb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => setForm(prev => ({ ...prev, is_default: e.target.checked }))}
          className="rounded border-[#CBD5E1] text-primary focus:ring-primary"
          data-testid="area-default-checkbox"
        />
        <span className="text-sm text-[#334155]">Oletuskaupunki</span>
      </label>
    </div>
  </div>
);

// City-specific custom texts panel
const CityTextsPanel = ({ area, services, token, onSave }) => {
  const [texts, setTexts] = useState(area.custom_texts || {});
  const [saving, setSaving] = useState(false);
  const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/areas/${area.id}`, { custom_texts: texts }, apiHeaders);
      await onSave();
    } catch (err) {
      alert(err.response?.data?.detail || 'Virhe tallennuksessa');
    }
    setSaving(false);
  };

  // Get base service slugs from service pages (remove city suffix)
  const serviceList = services.map(sp => {
    const baseSlug = (sp.slug || '').replace(/-helsinki$|-espoo$|-vantaa$|-kauniainen$/, '');
    const baseTitle = (sp.hero_title || sp.seo_title || baseSlug).replace(/ Helsingissä| Espoossa| Vantaalla| Kauniaisissa/gi, '').trim();
    return { slug: baseSlug, title: baseTitle };
  }).filter((s, i, arr) => arr.findIndex(x => x.slug === s.slug) === i && s.slug);

  return (
    <div className="border-t border-[#E2E8F0] p-4 bg-[#F8FAFC] space-y-4" data-testid={`city-texts-${area.slug}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#334155]">
          Linna-spetsiifilised tekstid: {area.name}
        </h4>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90" data-testid={`city-texts-save-${area.slug}`}>
          <Save size={12} />{saving ? 'Tallennetaan...' : 'Tallenna'}
        </button>
      </div>
      <p className="text-xs text-[#94A3B8]">
        Lisää jokaiselle palvelulle uniikkia sisältöä tämän kaupungin palvelusivuille. Teksti näkyy palvelun kuvauksen lopussa.
      </p>
      <div className="space-y-3">
        {serviceList.map(service => (
          <div key={service.slug}>
            <label className="block text-xs font-medium text-[#475569] mb-1">
              {service.title} <span className="text-[#94A3B8]">({service.slug}-{area.slug})</span>
            </label>
            <textarea
              value={texts[service.slug] || ''}
              onChange={(e) => setTexts(prev => ({ ...prev, [service.slug]: e.target.value }))}
              placeholder={`Uniikki teksti: ${service.title} ${area.name_inessive}...`}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              data-testid={`city-text-${area.slug}-${service.slug}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreasAdmin;
