import React, { useState, useEffect } from 'react';
import { addContact } from '../services/api';
import SourceSelect from './SourceSelect';
import { AlertCircle, X, Plus } from 'lucide-react';

/**
 * @typedef {Object} FormData
 * @property {string} entreprise - Company name
 * @property {string} poste - Job position
 * @property {string} source - Application source
 * @property {string} datePostulation - Application date
 * @property {string} statut - Application status
 * @property {string[]} documents - List of submitted documents
 * @property {string} emailEmployeur - Employer's email
 * @property {string} telephoneContact - Contact phone number
 * @property {string} commentaires - Additional comments
 * @property {string[]} tags - List of tags
 */

/**
 * JobForm component for adding new job applications
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onApplicationAdded - Callback function called when a new application is successfully added
 * @returns {JSX.Element} A form for adding new job applications
 */
export default function JobForm({ onApplicationAdded }) {
  const [formData, setFormData] = useState({
    entreprise: '',
    poste: '',
    source: '',
    datePostulation: new Date().toISOString().split('T')[0],
    statut: 'postulé',
    documents: [],
    emailEmployeur: '',
    telephoneContact: '',
    commentaires: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sauvegarder le brouillon automatiquement
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('jobFormDraft', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDirty]);

  // Charger le brouillon au montage
  useEffect(() => {
    const draft = localStorage.getItem('jobFormDraft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon:', error);
      }
    }
  }, []);

  /**
   * Validates the form data
   * @param {FormData} formData - The form data to validate
   * @returns {boolean} True if the form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.entreprise.trim()) {
      newErrors.entreprise = 'Le nom de l\'entreprise est requis';
    }
    
    if (!formData.poste.trim()) {
      newErrors.poste = 'L\'intitulé du poste est requis';
    }
    
    if (!formData.source) {
      newErrors.source = 'La source est requise';
    }
    
    if (!formData.datePostulation) {
      newErrors.datePostulation = 'La date de postulation est requise';
    }
    
    if (formData.emailEmployeur && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailEmployeur)) {
      newErrors.emailEmployeur = 'Format d\'email invalide';
    }
    
    if (formData.telephoneContact && !/^[+\d\s-()]{6,}$/.test(formData.telephoneContact)) {
      newErrors.telephoneContact = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input changes in the form
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value, type, multiple } = e.target;
    
    if (type === 'select-multiple') {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setIsDirty(true);
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Confirmation avant de quitter
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

  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await addContact(formData);
      console.log('Contact ajouté:', response);
      onApplicationAdded();
      setFormData({
        entreprise: '',
        poste: '',
        source: '',
        datePostulation: new Date().toISOString().split('T')[0],
        statut: 'postulé',
        documents: [],
        emailEmployeur: '',
        telephoneContact: '',
        commentaires: '',
        tags: []
      });
      setIsDirty(false);
      localStorage.removeItem('jobFormDraft');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Erreur lors de l\'ajout de la candidature. Veuillez réessayer.'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        <span>{errors[fieldName]}</span>
      </div>
    );
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, tagInput.trim()])]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* Entreprise */}
      <div>
        <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Entreprise
        </label>
        <input
          type="text"
          id="entreprise"
          name="entreprise"
          value={formData.entreprise}
          onChange={handleChange}
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
          required
        />
      </div>

      {/* Poste */}
      <div>
        <label htmlFor="poste" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Poste
        </label>
        <input
          type="text"
          id="poste"
          name="poste"
          value={formData.poste}
          onChange={handleChange}
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
          required
        />
      </div>

      {/* Date de postulation */}
      <div>
        <label htmlFor="datePostulation" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Date de postulation
        </label>
        <input
          type="date"
          id="datePostulation"
          name="datePostulation"
          value={formData.datePostulation}
          onChange={handleChange}
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
          required
        />
      </div>

      {/* Source */}
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Source
        </label>
        <SourceSelect
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
        />
      </div>

      {/* Statut */}
      <div>
        <label htmlFor="statut" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Statut
        </label>
        <select
          id="statut"
          name="statut"
          value={formData.statut}
          onChange={handleChange}
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
          required
        >
          <option value="postulé">Postulé</option>
          <option value="relance">Relance</option>
          <option value="entretien">Entretien</option>
          <option value="accepté">Accepté</option>
          <option value="refusé">Refusé</option>
        </select>
      </div>

      {/* Email employeur */}
      <div>
        <label htmlFor="emailEmployeur" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Email de l'employeur
        </label>
        <input
          type="email"
          id="emailEmployeur"
          name="emailEmployeur"
          value={formData.emailEmployeur}
          onChange={handleChange}
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
        />
      </div>

      {/* Téléphone contact */}
      <div>
        <label htmlFor="telephoneContact" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Téléphone du contact
        </label>
        <input
          type="tel"
          id="telephoneContact"
          name="telephoneContact"
          value={formData.telephoneContact}
          onChange={handleChange}
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
        />
      </div>

      {/* Documents */}
      <div>
        <label htmlFor="documents" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Documents envoyés
        </label>
        <select
          id="documents"
          name="documents"
          value={formData.documents}
          onChange={handleChange}
          multiple
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
        >
          <option value="CV">CV</option>
          <option value="Lettre de motivation">Lettre de motivation</option>
          <option value="Portfolio">Portfolio</option>
          <option value="Références">Références</option>
        </select>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
          Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs documents
        </p>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Tags
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              placeholder="Ajouter un tag..."
              className="flex-1 rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
            />
            <button
              onClick={handleAddTag}
              type="button"
              className="px-3 py-2 bg-custom-blue-600 text-white rounded-lg hover:bg-custom-blue-700 focus:outline-none focus:ring-2 focus:ring-custom-blue-600 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-custom-blue-100 dark:bg-custom-blue-900/30 text-custom-blue-700 dark:text-custom-blue-200 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-custom-blue-600 hover:text-custom-blue-800 dark:text-custom-blue-300 dark:hover:text-custom-blue-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commentaires */}
      <div>
        <label htmlFor="commentaires" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
          Commentaires
        </label>
        <textarea
          id="commentaires"
          name="commentaires"
          value={formData.commentaires}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-custom-blue-600 text-white rounded-lg hover:bg-custom-blue-700 focus:outline-none focus:ring-2 focus:ring-custom-blue-600 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary transition-colors"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
} 