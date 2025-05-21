import { useState } from 'react';
import PropTypes from 'prop-types';
import { updateContact } from '../services/api';
import SourceSelect from './SourceSelect';
import { X, Plus, Calendar } from 'lucide-react';

export default function EditJobForm({ application, onClose, onUpdate }) { // Renamed props to match usage
  const [formData, setFormData] = useState({
    entreprise: application.entreprise,
    poste: application.poste,
    source: application.source,
    datePostulation: application.datePostulation.split('T')[0],
    statut: application.statut,
    emailEmployeur: application.emailEmployeur || '',
    telephoneContact: application.telephoneContact || '',
    dateRelance: application.dateRelance ? application.dateRelance.split('T')[0] : '',
    commentaires: application.commentaires || '',
    entrevues: application.entrevues || []
  });

  const [showNewInterview, setShowNewInterview] = useState(false);
  const [newInterview, setNewInterview] = useState({
    type: 'première',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    lieu: '',
    lienVisio: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateContact(application._id, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error); // Keep this console.error for now
    }
  };

  const addInterview = () => {
    setFormData(prev => ({
      ...prev,
      entrevues: [...prev.entrevues, { ...newInterview }]
    }));
    setShowNewInterview(false);
    setNewInterview({
      type: 'première',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      lieu: '',
      lienVisio: ''
    });
  };

  const removeInterview = (index) => {
    setFormData(prev => ({
      ...prev,
      entrevues: prev.entrevues.filter((_, i) => i !== index)
    }));
  };

  const addToGoogleCalendar = (entrevue) => {
    const event = {
      text: `Entretien ${entrevue.type} - ${formData.entreprise}`,
      dates: new Date(entrevue.date).toISOString().split('T')[0],
      details: `Entretien ${entrevue.type} pour le poste de ${formData.poste}\n${entrevue.notes || ''}\n${entrevue.lienVisio ? `Lien visio: ${entrevue.lienVisio}` : ''}`,
      location: entrevue.lieu || ''
    };

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates.replace(/-/g, '')}/${event.dates.replace(/-/g, '')}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold mb-6">Modifier la candidature</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Entreprise</label>
          <input
            type="text"
            value={formData.entreprise}
            onChange={e => setFormData(prev => ({ ...prev, entreprise: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Poste</label>
          <input
            type="text"
            value={formData.poste}
            onChange={e => setFormData(prev => ({ ...prev, poste: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source</label>
          <SourceSelect
            value={formData.source}
            onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de postulation</label>
          <input
            type="date"
            value={formData.datePostulation}
            onChange={e => setFormData(prev => ({ ...prev, datePostulation: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Statut</label>
          <select
            value={formData.statut}
            onChange={e => setFormData(prev => ({ ...prev, statut: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
            required
          >
            <option value="postulé">Postulé</option>
            <option value="relance">Relancé</option>
            <option value="entretien">Entretien</option>
            <option value="accepté">Accepté</option>
            <option value="refusé">Refusé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email employeur</label>
          <input
            type="email"
            value={formData.emailEmployeur}
            onChange={e => setFormData(prev => ({ ...prev, emailEmployeur: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            value={formData.telephoneContact}
            onChange={e => setFormData(prev => ({ ...prev, telephoneContact: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de relance</label>
          <input
            type="date"
            value={formData.dateRelance}
            onChange={e => setFormData(prev => ({ ...prev, dateRelance: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Commentaires</label>
          <textarea
            value={formData.commentaires}
            onChange={e => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
            rows="3"
          />
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Entrevues</h3>
            <button
              type="button"
              onClick={() => setShowNewInterview(true)}
              className="flex items-center gap-2 px-3 py-2 bg-custom-blue-600 text-white rounded-md hover:bg-custom-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une entrevue
            </button>
          </div>

          <div className="space-y-4">
            {formData.entrevues.map((entrevue, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{entrevue.type} entrevue</h4>
                    <p className="text-sm text-gray-500">{new Date(entrevue.date).toLocaleDateString()}</p>
                    {entrevue.lieu && <p className="text-sm text-gray-600">Lieu: {entrevue.lieu}</p>}
                    {entrevue.lienVisio && <p className="text-sm text-gray-600">Lien: {entrevue.lienVisio}</p>}
                    {entrevue.notes && <p className="text-sm text-gray-600 mt-2">{entrevue.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addToGoogleCalendar(entrevue)}
                      className="p-2 text-custom-blue-600 hover:text-custom-blue-700 transition-colors"
                      title="Ajouter au calendrier"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeInterview(index)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showNewInterview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h4 className="text-lg font-medium mb-4">Nouvelle entrevue</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d&apos;entrevue</label>
                    <select
                      value={newInterview.type}
                      onChange={e => setNewInterview(prev => ({ ...prev, type: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
                    >
                      <option value="première">Première</option>
                      <option value="deuxième">Deuxième</option>
                      <option value="technique">Technique</option>
                      <option value="finale">Finale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={newInterview.date}
                      onChange={e => setNewInterview(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lieu</label>
                    <input
                      type="text"
                      value={newInterview.lieu}
                      onChange={e => setNewInterview(prev => ({ ...prev, lieu: e.target.value }))}
                      placeholder="En présentiel ou en ligne"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lien visioconférence</label>
                    <input
                      type="text"
                      value={newInterview.lienVisio}
                      onChange={e => setNewInterview(prev => ({ ...prev, lienVisio: e.target.value }))}
                      placeholder="Lien Zoom, Teams, etc."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={newInterview.notes}
                      onChange={e => setNewInterview(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue-600 focus:ring focus:ring-custom-blue-200"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowNewInterview(false)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={addInterview}
                      className="px-4 py-2 bg-custom-blue-600 text-white rounded-md hover:bg-custom-blue-700 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-custom-blue-600 text-white rounded-md hover:bg-custom-blue-700 transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}

EditJobForm.propTypes = {
  application: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    entreprise: PropTypes.string.isRequired,
    poste: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    datePostulation: PropTypes.string.isRequired, // Expecting string to be split
    statut: PropTypes.string.isRequired,
    emailEmployeur: PropTypes.string,
    telephoneContact: PropTypes.string,
    dateRelance: PropTypes.string, // Expecting string to be split
    commentaires: PropTypes.string,
    entrevues: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      date: PropTypes.string,
      notes: PropTypes.string,
      lieu: PropTypes.string,
      lienVisio: PropTypes.string,
    })),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};