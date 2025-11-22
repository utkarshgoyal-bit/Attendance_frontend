import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Save, RefreshCw, Plus, Trash2, Edit2, X, Check,
  Clock, Calculator, Calendar, QrCode, Building2, Settings,
  ToggleLeft, ToggleRight, AlertCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import apiClient from '../../services/apiClient';
import Toast from '../../components/Toast';

// Tab configuration
const TABS = [
  { id: 'attendanceSettings', label: 'Attendance', icon: Clock, color: 'blue' },
  { id: 'deductionSettings', label: 'Deductions', icon: Calculator, color: 'orange' },
  { id: 'leaveSettings', label: 'Leave Policy', icon: Calendar, color: 'green' },
  { id: 'workingDaysSettings', label: 'Working Days', icon: Calendar, color: 'purple' },
  { id: 'qrSettings', label: 'QR Settings', icon: QrCode, color: 'indigo' },
  { id: 'companyProfile', label: 'Company Profile', icon: Building2, color: 'gray' },
];

const FIELD_TYPES = [
  { value: 'time', label: 'Time' },
  { value: 'number', label: 'Number' },
  { value: 'toggle', label: 'Toggle (Yes/No)' },
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Dropdown' },
];

const OrgSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('attendanceSettings');
  const [toast, setToast] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({
    key: '', label: '', type: 'text', value: '', description: '', unit: '', min: '', max: '', options: []
  });

  const orgId = "673db4bb4ea85b50f50f20d4";

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/config/${orgId}`);
      setConfig(res.data.config);
    } catch (error) {
      showToast('Failed to load configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleToggleSection = async (section) => {
    try {
      const newEnabled = !config[section].enabled;
      await apiClient.patch(`/config/${orgId}/section/${section}/toggle`, { enabled: newEnabled });
      setConfig({ ...config, [section]: { ...config[section], enabled: newEnabled } });
      showToast(`${section} ${newEnabled ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      showToast('Failed to toggle section', 'error');
    }
  };

  const handleFieldChange = (section, fieldId, value) => {
    const updatedFields = config[section].fields.map(f => f._id === fieldId ? { ...f, value } : f);
    setConfig({ ...config, [section]: { ...config[section], fields: updatedFields } });
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const updates = config[activeTab].fields.map(f => ({ fieldId: f._id, value: f.value }));
      await apiClient.patch(`/config/${orgId}/section/${activeTab}/bulk-update`, { updates });
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.key || !newField.label) {
      showToast('Key and Label are required', 'error');
      return;
    }
    try {
      const fieldData = {
        key: newField.key.replace(/\s+/g, '_').toLowerCase(),
        label: newField.label,
        type: newField.type,
        value: getDefaultValueForType(newField.type),
        description: newField.description,
        unit: newField.unit || undefined,
        min: newField.min ? Number(newField.min) : undefined,
        max: newField.max ? Number(newField.max) : undefined,
        options: newField.type === 'select' ? newField.options : undefined
      };
      const res = await apiClient.post(`/config/${orgId}/section/${activeTab}/field`, fieldData);
      setConfig({ ...config, [activeTab]: { ...config[activeTab], fields: res.data.fields } });
      setShowAddField(false);
      resetNewField();
      showToast('Field added successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add field', 'error');
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    try {
      const res = await apiClient.delete(`/config/${orgId}/section/${activeTab}/field/${fieldId}`);
      setConfig({ ...config, [activeTab]: { ...config[activeTab], fields: res.data.fields } });
      showToast('Field deleted successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete field', 'error');
    }
  };

  const handleUpdateField = async (fieldId, updates) => {
    try {
      await apiClient.put(`/config/${orgId}/section/${activeTab}/field/${fieldId}`, updates);
      const updatedFields = config[activeTab].fields.map(f => f._id === fieldId ? { ...f, ...updates } : f);
      setConfig({ ...config, [activeTab]: { ...config[activeTab], fields: updatedFields } });
      setEditingField(null);
      showToast('Field updated!', 'success');
    } catch (error) {
      showToast('Failed to update field', 'error');
    }
  };

  const handleResetSection = async () => {
    if (!window.confirm('Reset this section to default settings? Custom fields will be removed.')) return;
    try {
      const res = await apiClient.post(`/config/${orgId}/section/${activeTab}/reset`);
      setConfig({ ...config, [activeTab]: res.data.section });
      showToast('Reset to defaults!', 'success');
    } catch (error) {
      showToast('Failed to reset', 'error');
    }
  };

  const getDefaultValueForType = (type) => {
    switch (type) {
      case 'time': return '09:00';
      case 'number': return 0;
      case 'toggle': return false;
      default: return '';
    }
  };

  const resetNewField = () => {
    setNewField({ key: '', label: '', type: 'text', value: '', description: '', unit: '', min: '', max: '', options: [] });
  };

  const renderFieldInput = (field, section) => {
    const isDisabled = !config[section].enabled;

    switch (field.type) {
      case 'time':
        return (
          <input type="time" value={field.value} onChange={(e) => handleFieldChange(section, field._id, e.target.value)}
            disabled={isDisabled} className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
        );
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input type="number" value={field.value} min={field.min} max={field.max}
              onChange={(e) => handleFieldChange(section, field._id, Number(e.target.value))}
              disabled={isDisabled} className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
            {field.unit && <span className="text-sm text-gray-500 whitespace-nowrap">{field.unit}</span>}
          </div>
        );
      case 'toggle':
        return (
          <button onClick={() => !isDisabled && handleFieldChange(section, field._id, !field.value)} disabled={isDisabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-blue-600' : 'bg-gray-300'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        );
      case 'text':
        return (
          <input type="text" value={field.value} onChange={(e) => handleFieldChange(section, field._id, e.target.value)}
            disabled={isDisabled} className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
        );
      case 'select':
        return (
          <select value={field.value} onChange={(e) => handleFieldChange(section, field._id, e.target.value)} disabled={isDisabled}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
            <option value="">Select...</option>
            {field.options?.map((opt, idx) => <option key={idx} value={opt.value}>{opt.label}</option>)}
          </select>
        );
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const currentSection = config[activeTab];
  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 transition-all duration-300">
        {/* Header */}
        <div className="bg-white h-16 flex items-center justify-between px-6 m-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" /> Organization Settings
            </h1>
          </div>
        </div>

        <div className="flex gap-4 px-4 pb-4">
          {/* Left: Vertical Tabs */}
          <div className="w-56 bg-white rounded-lg shadow p-3 h-fit">
            <div className="space-y-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isEnabled = config[tab.id]?.enabled;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                    <span className="flex-1 text-sm">{tab.label}</span>
                    {!isEnabled && <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">OFF</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 bg-white rounded-lg shadow">
            {/* Section Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {React.createElement(currentTab.icon, { className: 'w-5 h-5' })} {currentTab.label}
                </h2>
                <button onClick={() => handleToggleSection(activeTab)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition ${currentSection.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {currentSection.enabled ? <><ToggleRight className="w-4 h-4" /> Enabled</> : <><ToggleLeft className="w-4 h-4" /> Disabled</>}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleResetSection} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button onClick={() => setShowAddField(true)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Field
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="p-6">
              {!currentSection.enabled && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>This section is disabled. Enable it to use these settings.</span>
                </div>
              )}

              <div className="space-y-4">
                {currentSection.fields?.sort((a, b) => a.order - b.order).map(field => (
                  <div key={field._id} className={`p-4 border rounded-lg ${!currentSection.enabled ? 'bg-gray-50' : 'bg-white'} ${!field.deletable ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!field.deletable && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Core</span>}
                          <label className="font-medium text-gray-700">{field.label}</label>
                        </div>
                        {field.description && <p className="text-sm text-gray-500 mb-2">{field.description}</p>}
                        <div className="max-w-xs">{renderFieldInput(field, activeTab)}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingField(field)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit field">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {field.deletable && (
                          <button onClick={() => handleDeleteField(field._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete field">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSaveSection} disabled={saving || !currentSection.enabled}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Field Modal */}
        {showAddField && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">Add Custom Field</h3>
                <button onClick={() => { setShowAddField(false); resetNewField(); }} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Label *</label>
                  <input type="text" value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value, key: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                    placeholder="e.g., Lunch Break Duration" className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Key</label>
                  <input type="text" value={newField.key} onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                    placeholder="auto_generated_from_label" className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                  </select>
                </div>
                {newField.type === 'number' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Min</label>
                      <input type="number" value={newField.min} onChange={(e) => setNewField({ ...newField, min: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max</label>
                      <input type="number" value={newField.max} onChange={(e) => setNewField({ ...newField, max: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit</label>
                      <input type="text" value={newField.unit} onChange={(e) => setNewField({ ...newField, unit: e.target.value })} placeholder="e.g., minutes" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input type="text" value={newField.description} onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                    placeholder="Help text for this field" className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
                <button onClick={() => { setShowAddField(false); resetNewField(); }} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleAddField} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Field</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Field Modal */}
        {editingField && <EditFieldModal field={editingField} onClose={() => setEditingField(null)} onSave={(updates) => handleUpdateField(editingField._id, updates)} />}

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

const EditFieldModal = ({ field, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    label: field.label, description: field.description || '', unit: field.unit || '', min: field.min ?? '', max: field.max ?? ''
  });

  const handleSubmit = () => {
    const updates = { ...formData };
    if (updates.min !== '') updates.min = Number(updates.min); else delete updates.min;
    if (updates.max !== '') updates.max = Number(updates.max); else delete updates.max;
    if (!updates.unit) delete updates.unit;
    onSave(updates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Edit Field</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input type="text" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full border rounded-lg px-3 py-2" disabled={!field.deletable} />
            {!field.deletable && <p className="text-xs text-gray-500 mt-1">Core field labels cannot be changed</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          {field.type === 'number' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Min</label>
                <input type="number" value={formData.min} onChange={(e) => setFormData({ ...formData, min: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max</label>
                <input type="number" value={formData.max} onChange={(e) => setFormData({ ...formData, max: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgSettings;
