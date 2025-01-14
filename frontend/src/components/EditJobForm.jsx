import React, { useState } from 'react';
import { updateContact } from '../services/api';
import { X, Plus, Calendar } from 'lucide-react';
import SourceSelect from './SourceSelect';

/**
 * @typedef {Object} Contact
 * @property {string} _id - Contact ID
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
 * EditJobForm component for modifying existing job applications
 * @component
 * @param {Object} props - Component props
 * @param {Contact} props.contact - The contact to edit
 * @param {Function} props.onClose - Function to call when closing the form
 * @param {Function} props.onContactUpdated - Function to call when the contact is successfully updated
 * @returns {JSX.Element} A modal form for editing job applications
 */
export default function EditJobForm({ contact, onClose, onContactUpdated }) {
  const [formData, setFormData] = useState({
    entreprise: contact.entreprise,
    poste: contact.poste,
    source: contact.source,
    datePostulation: new Date(contact.datePostulation).toISOString().split('T')[0],
    statut: contact.statut,
    documents: contact.documents || [],
    emailEmployeur: contact.emailEmployeur || '',
    telephoneContact: contact.telephoneContact || '',
    commentaires: contact.commentaires || '',
    tags: contact.tags || [],
    dateEntretien: contact.dateEntretien ? new Date(contact.dateEntretien).toISOString().split('T')[0] : ''
  });

  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  /**
   * Adds a new tag to the form data
   * @param {Event} e - Event object
   */
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  /**
   * Removes a tag from the form data
   * @param {string} tagToRemove - The tag to remove
   */
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  /**
   * Handles input changes in the form
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'documents') {
      const documents = value.split(',').map(doc => doc.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, [name]: documents }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const updatedContact = await updateContact(contact._id, formData);
      
      // If status is 'entretien' and dateEntretien is set, add to calendar
      if (formData.statut === 'entretien' && formData.dateEntretien && !contact.calendarEventId) {
        setIsAddingToCalendar(true);
        try {
          const response = await fetch('/api/calendar/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to create calendar event');
          }

          const calendarEvent = await response.json();
          // Update the contact with calendar event information
          await updateContact(contact._id, {
            ...formData,
            calendarEventId: calendarEvent.eventId,
            calendarEventUrl: calendarEvent.htmlLink
          });
        } catch (calendarError) {
          console.error('Calendar error:', calendarError);
          // Continue with the form submission even if calendar fails
        } finally {
          setIsAddingToCalendar(false);
        }
      }

      onContactUpdated(updatedContact);
      onClose();
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-dark-text-primary">Modifier la candidature</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Entreprise</label>
            <input
              type="text"
              name="entreprise"
              value={formData.entreprise}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Poste</label>
            <input
              type="text"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Source</label>
            <SourceSelect
              value={formData.source}
              onChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
              className="mt-1 block w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Date de postulation</label>
            <input
              type="date"
              name="datePostulation"
              value={formData.datePostulation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
              required
            >
              <option value="postulé">Postulé</option>
              <option value="relance">Relance</option>
              <option value="entretien">Entretien</option>
              <option value="accepté">Accepté</option>
              <option value="refusé">Refusé</option>
            </select>
          </div>

          {formData.statut === 'entretien' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                Date de l'entretien
                {contact.calendarEventUrl && (
                  <a
                    href={contact.calendarEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    <Calendar size={16} className="mr-1" />
                    Voir dans le calendrier
                  </a>
                )}
              </label>
              <input
                type="datetime-local"
                name="dateEntretien"
                value={formData.dateEntretien}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Email de l'employeur</label>
            <input
              type="email"
              name="emailEmployeur"
              value={formData.emailEmployeur}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Téléphone du contact</label>
            <input
              type="tel"
              name="telephoneContact"
              value={formData.telephoneContact}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Documents envoyés</label>
            <input
              type="text"
              name="documents"
              value={formData.documents.join(', ')}
              onChange={handleChange}
              placeholder="CV, lettre de motivation, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Tags</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Ajouter un tag"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="mt-1 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Commentaires</label>
            <textarea
              name="commentaires"
              value={formData.commentaires}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-bg-hover"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isAddingToCalendar}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isAddingToCalendar ? 'Ajout au calendrier...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 