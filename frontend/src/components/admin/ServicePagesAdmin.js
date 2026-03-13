// Service Pages Admin Component
// Handles CRUD operations for CMS-driven service pages

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit2, Save, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  FileText, Image as ImageIcon, Link as LinkIcon, CheckCircle, X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Finnish slug generator
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-helsinki';
};

// Default features for a service
const defaultFeatures = [
  { title: 'Ammattitaitoinen työ', description: 'Kokeneet tekijät varmistavat laadukkaan lopputuloksen', icon: 'Award' },
  { title: 'Laadukkaat materiaalit', description: 'Käytämme vain parhaita materiaaleja', icon: 'Shield' },
  { title: 'Nopea aikataulu', description: 'Sovittu aikataulu pitää aina', icon: 'Clock' },
  { title: 'Siisti työnjälki', description: 'Siivous ja suojaukset kuuluvat hintaan', icon: 'CheckCircle' }
];

const ServicePagesAdmin = ({ token, onRefresh }) => {
  const [pages, setPages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesRes, servicesRes] = await Promise.all([
        axios.get(`${API}/admin/service-pages`, getAuthHeaders()),
        axios.get(`${API}/services`)
      ]);
      setPages(pagesRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Failed to load service pages:', error);
    }
    setLoading(false);
  };

  // Create new page for a service
  const createPage = (service) => {
    const slug = generateSlug(service.title);
    setEditingPage({
      isNew: true,
      service_id: service.id,
      slug: slug,
      is_published: true,
      seo_title: `${service.title} Helsinki | J&B Tasoitus ja Maalaus`,
      seo_description: `Ammattitaitoista ${service.title.toLowerCase()}ta Helsingissä ja Uudellamaalla. Pyydä maksuton arvio! Kotitalousvähennys kelpaa.`,
      seo_keywords: `${service.title.toLowerCase()}, ${service.title.toLowerCase()} helsinki, ${service.title.toLowerCase()} hinta`,
      hero_title: `${service.title} Helsingissä`,
      hero_subtitle: service.description,
      hero_image_url: service.image_url || '',
      description_title: 'Palvelun kuvaus',
      description_text: `<p>${service.description}</p><p>Palvelemme yksityisasiakkaita, yrityksiä ja taloyhtiöitä koko Uudenmaan alueella.</p>`,
      description_image_url: '',
      features_title: 'Mitä palvelu sisältää',
      features: [...defaultFeatures],
      why_title: 'Miksi valita J&B Tasoitus ja Maalaus',
      why_items: [],
      process_title: 'Näin projekti etenee',
      use_global_process: true,
      areas_title: 'Palvelualueet',
      areas_text: `Tarjoamme ${service.title.toLowerCase()}ta seuraavilla alueilla: Helsinki, Espoo, Vantaa, Kauniainen ja muu Uusimaa.`,
      use_global_areas: true,
      related_service_ids: [],
      cta_title: '',
      cta_text: ''
    });
  };

  // Save page
  const savePage = async () => {
    if (!editingPage) return;
    setSaving(true);
    try {
      if (editingPage.isNew) {
        const { isNew, ...data } = editingPage;
        await axios.post(`${API}/admin/service-pages`, data, getAuthHeaders());
      } else {
        const { isNew, id, service_id, created_at, updated_at, ...data } = editingPage;
        await axios.put(`${API}/admin/service-pages/${editingPage.id}`, data, getAuthHeaders());
      }
      setEditingPage(null);
      loadData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Save error:', error);
      alert(`Virhe: ${error.response?.data?.detail || error.message}`);
    }
    setSaving(false);
  };

  // Delete page
  const deletePage = async (id) => {
    if (!window.confirm('Haluatko varmasti poistaa tämän palvelusivun?')) return;
    try {
      await axios.delete(`${API}/admin/service-pages/${id}`, getAuthHeaders());
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Virhe: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Toggle publish status
  const togglePublish = async (page) => {
    try {
      await axios.put(`${API}/admin/service-pages/${page.id}`, {
        is_published: !page.is_published
      }, getAuthHeaders());
      loadData();
    } catch (error) {
      console.error('Toggle publish error:', error);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Update editing page field
  const updateField = (field, value) => {
    setEditingPage(prev => ({ ...prev, [field]: value }));
  };

  // Update feature
  const updateFeature = (index, field, value) => {
    const newFeatures = [...editingPage.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateField('features', newFeatures);
  };

  // Add feature
  const addFeature = () => {
    updateField('features', [
      ...editingPage.features,
      { title: '', description: '', icon: 'CheckCircle' }
    ]);
  };

  // Remove feature
  const removeFeature = (index) => {
    const newFeatures = editingPage.features.filter((_, i) => i !== index);
    updateField('features', newFeatures);
  };

  // Get service name by ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service?.title || 'Tuntematon';
  };

  // Check if service has a page
  const serviceHasPage = (serviceId) => {
    return pages.some(p => p.service_id === serviceId);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0056D2]"></div>
      </div>
    );
  }

  // Editor view
  if (editingPage) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              {editingPage.isNew ? 'Uusi palvelusivu' : 'Muokkaa palvelusivua'}
            </h2>
            <p className="text-sm text-[#64748B]">
              Palvelu: {getServiceName(editingPage.service_id)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingPage(null)}
              className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-gray-50"
            >
              Peruuta
            </button>
            <button
              onClick={savePage}
              disabled={saving}
              className="px-4 py-2 bg-[#0056D2] text-white rounded-lg hover:bg-[#0045A8] flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Tallennetaan...' : 'Tallenna'}
            </button>
          </div>
        </div>

        {/* URL & Status */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
            <LinkIcon size={18} className="text-[#0056D2]" />
            URL ja julkaisutila
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">URL-slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">/</span>
                <input
                  type="text"
                  value={editingPage.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#0056D2] focus:border-transparent"
                  placeholder="tasoitustyot-helsinki"
                />
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Esim: tasoitustyot-helsinki, maalaustyot-helsinki
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Julkaisutila</label>
              <button
                onClick={() => updateField('is_published', !editingPage.is_published)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  editingPage.is_published 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {editingPage.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                {editingPage.is_published ? 'Julkaistu' : 'Piilotettu'}
              </button>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('seo')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
              <FileText size={18} className="text-[#0056D2]" />
              SEO-asetukset (hakukoneoptimointi)
            </h3>
            {expandedSections.seo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.seo && (
            <div className="p-6 pt-0 space-y-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">SEO-otsikko (title) *</label>
                <input
                  type="text"
                  value={editingPage.seo_title}
                  onChange={(e) => updateField('seo_title', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
                  placeholder="Tasoitustyöt Helsinki | J&B Tasoitus ja Maalaus"
                />
                <p className="text-xs text-[#64748B] mt-1">{editingPage.seo_title?.length || 0}/60 merkkiä</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta-kuvaus *</label>
                <textarea
                  value={editingPage.seo_description}
                  onChange={(e) => updateField('seo_description', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg resize-none"
                  rows={3}
                  placeholder="Ammattitaitoista tasoitustyötä Helsingissä..."
                />
                <p className="text-xs text-[#64748B] mt-1">{editingPage.seo_description?.length || 0}/160 merkkiä</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Avainsanat</label>
                <input
                  type="text"
                  value={editingPage.seo_keywords}
                  onChange={(e) => updateField('seo_keywords', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
                  placeholder="tasoitustyöt, tasoitus helsinki, seinien tasoitus"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('hero')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
              <ImageIcon size={18} className="text-[#0056D2]" />
              Hero-osio (sivun yläosa)
            </h3>
            {expandedSections.hero ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.hero && (
            <div className="p-6 pt-0 space-y-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Pääotsikko (H1) *</label>
                <input
                  type="text"
                  value={editingPage.hero_title}
                  onChange={(e) => updateField('hero_title', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
                  placeholder="Tasoitustyöt Helsingissä"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lyhyt esittely</label>
                <textarea
                  value={editingPage.hero_subtitle}
                  onChange={(e) => updateField('hero_subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg resize-none"
                  rows={2}
                  placeholder="Ammattitaitoista tasoitustyötä..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Taustakuva URL</label>
                <input
                  type="text"
                  value={editingPage.hero_image_url}
                  onChange={(e) => updateField('hero_image_url', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
                  placeholder="https://..."
                />
                {editingPage.hero_image_url && (
                  <img 
                    src={editingPage.hero_image_url} 
                    alt="Preview" 
                    className="mt-2 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('description')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
              <FileText size={18} className="text-[#0056D2]" />
              Palvelun kuvaus
            </h3>
            {expandedSections.description ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.description && (
            <div className="p-6 pt-0 space-y-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Osion otsikko</label>
                <input
                  type="text"
                  value={editingPage.description_title}
                  onChange={(e) => updateField('description_title', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sisältö (HTML sallittu)</label>
                <textarea
                  value={editingPage.description_text}
                  onChange={(e) => updateField('description_text', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg resize-none font-mono text-sm"
                  rows={6}
                  placeholder="<p>Palvelun kuvaus...</p>"
                />
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
              <CheckCircle size={18} className="text-[#0056D2]" />
              Palvelun ominaisuudet ({editingPage.features?.length || 0})
            </h3>
            {expandedSections.features ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.features && (
            <div className="p-6 pt-0 space-y-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Osion otsikko</label>
                <input
                  type="text"
                  value={editingPage.features_title}
                  onChange={(e) => updateField('features_title', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div className="space-y-3">
                {editingPage.features?.map((feature, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="px-3 py-2 border border-[#E2E8F0] rounded-lg"
                        placeholder="Otsikko"
                      />
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        className="px-3 py-2 border border-[#E2E8F0] rounded-lg"
                        placeholder="Kuvaus"
                      />
                    </div>
                    <button
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addFeature}
                className="flex items-center gap-2 text-[#0056D2] hover:underline text-sm"
              >
                <Plus size={16} />
                Lisää ominaisuus
              </button>
            </div>
          )}
        </div>

        {/* Areas */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('areas')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <h3 className="font-bold text-[#0F172A]">Palvelualueet</h3>
            {expandedSections.areas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {expandedSections.areas && (
            <div className="p-6 pt-0 space-y-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Osion otsikko</label>
                <input
                  type="text"
                  value={editingPage.areas_title}
                  onChange={(e) => updateField('areas_title', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SEO-teksti alueista</label>
                <textarea
                  value={editingPage.areas_text}
                  onChange={(e) => updateField('areas_text', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg resize-none"
                  rows={3}
                  placeholder="Tarjoamme palvelua seuraavilla alueilla..."
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPage.use_global_areas}
                  onChange={(e) => updateField('use_global_areas', e.target.checked)}
                  className="rounded border-[#E2E8F0]"
                />
                <span className="text-sm">Käytä globaaleja palvelualueita</span>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <FileText size={20} className="text-[#0056D2]" />
            Palvelusivut
          </h2>
          <p className="text-sm text-[#64748B]">
            Hallitse SEO-optimoituja palvelusivuja
          </p>
        </div>
      </div>

      {/* Services without pages */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-3">Palvelut ilman omaa sivua:</h3>
        <div className="flex flex-wrap gap-2">
          {services.filter(s => !serviceHasPage(s.id)).map(service => (
            <button
              key={service.id}
              onClick={() => createPage(service)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm hover:bg-amber-100 transition-colors"
            >
              <Plus size={16} className="text-amber-600" />
              {service.title}
            </button>
          ))}
          {services.filter(s => !serviceHasPage(s.id)).length === 0 && (
            <p className="text-amber-700 text-sm">Kaikilla palveluilla on oma sivu!</p>
          )}
        </div>
      </div>

      {/* Existing pages */}
      <div className="space-y-3">
        {pages.map(page => (
          <div 
            key={page.id} 
            className="bg-white border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${page.is_published ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div>
                <h3 className="font-medium text-[#0F172A]">{page.hero_title}</h3>
                <p className="text-sm text-[#64748B]">/{page.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePublish(page)}
                className={`p-2 rounded-lg ${page.is_published ? 'hover:bg-gray-100' : 'hover:bg-green-50'}`}
                title={page.is_published ? 'Piilota' : 'Julkaise'}
              >
                {page.is_published ? <Eye size={18} className="text-green-600" /> : <EyeOff size={18} className="text-gray-400" />}
              </button>
              <a
                href={`/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded-lg text-[#64748B]"
                title="Avaa sivu"
              >
                <LinkIcon size={18} />
              </a>
              <button
                onClick={() => setEditingPage(page)}
                className="p-2 hover:bg-gray-100 rounded-lg text-[#0056D2]"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => deletePage(page.id)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <div className="text-center py-8 text-[#64748B]">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>Ei vielä palvelusivuja. Luo ensimmäinen sivu valitsemalla palvelu yllä.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePagesAdmin;
