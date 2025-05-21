import { useState } from 'react';
import PropTypes from 'prop-types';
import { Bell, Calendar, X, Clock, Check } from 'lucide-react'; // Removed Mail

export default function InterviewReminder({ interview, onClose, onSave }) {
  const [reminderSettings, setReminderSettings] = useState({
    email: true,
    timing: '1day', // Options: 1hour, 3hours, 1day, 2days, 1week
    additionalEmails: '',
    sendCalendarInvite: true,
  });

  const timingOptions = [
    { value: '1hour', label: '1 heure avant' },
    { value: '3hours', label: '3 heures avant' },
    { value: '1day', label: '1 jour avant' },
    { value: '2days', label: '2 jours avant' },
    { value: '1week', label: '1 semaine avant' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailList = reminderSettings.additionalEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    const reminderData = {
      interviewId: interview._id,
      settings: {
        ...reminderSettings,
        additionalEmails: emailList,
      },
    };

    try {
      await onSave(reminderData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la configuration du rappel:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-custom-blue-600" />
            Configurer les rappels
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-custom-blue-50 rounded-lg">
          <h4 className="font-medium text-custom-blue-700 mb-1">Détails de l&apos;entrevue</h4>
          <div className="text-sm text-custom-blue-600 space-y-1">
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(interview.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(interview.date).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={reminderSettings.email}
                onChange={(e) => setReminderSettings(prev => ({
                  ...prev,
                  email: e.target.checked
                }))}
                className="rounded border-gray-300 text-custom-blue-600 focus:ring-custom-blue-500"
              />
              Recevoir un rappel par email
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quand envoyer le rappel ?
            </label>
            <select
              value={reminderSettings.timing}
              onChange={(e) => setReminderSettings(prev => ({
                ...prev,
                timing: e.target.value
              }))}
              className="w-full rounded-lg border-gray-200 focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
            >
              {timingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emails additionnels (séparés par des virgules)
            </label>
            <input
              type="text"
              value={reminderSettings.additionalEmails}
              onChange={(e) => setReminderSettings(prev => ({
                ...prev,
                additionalEmails: e.target.value
              }))}
              placeholder="exemple@email.com, autre@email.com"
              className="w-full rounded-lg border-gray-200 focus:border-custom-blue-600 focus:ring-2 focus:ring-custom-blue-200"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={reminderSettings.sendCalendarInvite}
                onChange={(e) => setReminderSettings(prev => ({
                  ...prev,
                  sendCalendarInvite: e.target.checked
                }))}
                className="rounded border-gray-300 text-custom-blue-600 focus:ring-custom-blue-500"
              />
              Envoyer une invitation Google Calendar
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-custom-blue-600 text-white rounded-md hover:bg-custom-blue-700 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

InterviewReminder.propTypes = {
  interview: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired, // Or PropTypes.instanceOf(Date)
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};