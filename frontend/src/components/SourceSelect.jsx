import React, { useState, useEffect } from 'react';
import { getSources, addSource, deleteSource } from '../services/api';
import { Plus, X, Image as ImageIcon, Loader2, AlertCircle, Trash2 } from 'lucide-react';

export default function SourceSelect({ value, onChange, className }) {
  const [sources, setSources] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSource, setNewSource] = useState({ nom: '', logoUrl: '' });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const data = await getSources();
      setSources(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des sources:', error);
    }
  };

  const validateLogoUrl = async (url) => {
    if (!url) return false;
    
    // Vérifier le format de l'URL
    try {
      new URL(url);
    } catch {
      return false;
    }

    // Vérifier si l'image est accessible et valide
    try {
      setIsValidatingUrl(true);
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      return contentType.startsWith('image/');
    } catch {
      return false;
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const handleLogoUrlChange = async (e) => {
    const url = e.target.value;
    setNewSource(prev => ({ ...prev, logoUrl: url }));
    setIsDirty(true);

    if (url) {
      const isValid = await validateLogoUrl(url);
      if (isValid) {
        setPreviewUrl(url);
        setError(null);
      } else {
        setPreviewUrl('');
        setError('URL invalide ou image inaccessible');
      }
    } else {
      setPreviewUrl('');
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSource.nom || !newSource.logoUrl) {
      setError('Tous les champs sont requis');
      return;
    }

    const isValid = await validateLogoUrl(newSource.logoUrl);
    if (!isValid) {
      setError('URL du logo invalide');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addSource(newSource);
      await fetchSources();
      setNewSource({ nom: '', logoUrl: '' });
      setPreviewUrl('');
      setShowAddForm(false);
      setIsDirty(false);
    } catch (error) {
      setError('Erreur lors de l\'ajout de la source');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) {
      return;
    }

    try {
      await deleteSource(sourceId);
      await fetchSources();
    } catch (error) {
      console.error('Erreur lors de la suppression de la source:', error);
      alert('Erreur lors de la suppression de la source');
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Des modifications non sauvegardées seront perdues. Voulez-vous continuer ?')) {
        setShowAddForm(false);
        setNewSource({ nom: '', logoUrl: '' });
        setPreviewUrl('');
        setError(null);
        setIsDirty(false);
      }
    } else {
      setShowAddForm(false);
      setNewSource({ nom: '', logoUrl: '' });
      setPreviewUrl('');
      setError(null);
    }
  };

  // Confirmation avant de quitter si des modifications sont en cours
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border-gray-200 pr-10 ${className}`}
      >
        <option value="">Sélectionner une source</option>
        {sources.map(source => (
          <option key={source._id} value={source._id}>
            {source.nom}
          </option>
        ))}
      </select>

      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-custom-blue-600"
        >
          <Plus size={20} />
        </button>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter une source</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la source
                </label>
                <input
                  type="text"
                  value={newSource.nom}
                  onChange={(e) => {
                    setNewSource(prev => ({ ...prev, nom: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="w-full rounded-lg border-gray-200 focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
                  placeholder="Ex: LinkedIn, Indeed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du logo
                </label>
                <input
                  type="url"
                  value={newSource.logoUrl}
                  onChange={handleLogoUrlChange}
                  className="w-full rounded-lg border-gray-200 focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
                  placeholder="https://..."
                />
              </div>

              {isValidatingUrl && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Validation de l'URL...</span>
                </div>
              )}

              {previewUrl && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Prévisualisation</p>
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="max-h-20 object-contain"
                    onError={() => {
                      setPreviewUrl('');
                      setError('Erreur lors du chargement de l\'image');
                    }}
                  />
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isValidatingUrl}
                  className={`px-4 py-2 bg-custom-blue-600 text-white rounded-md hover:bg-custom-blue-700 flex items-center gap-2 ${
                    (isLoading || isValidatingUrl) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Ajout en cours...' : 'Ajouter'}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sources existantes</h4>
              <div className="space-y-2">
                {sources.map(source => (
                  <div key={source._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={source.logoUrl}
                        alt={source.nom}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-sm text-gray-700">{source.nom}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSource(source._id)}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Supprimer ${source.nom}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 