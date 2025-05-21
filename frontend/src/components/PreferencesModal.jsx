import PropTypes from 'prop-types';
import { X } from 'lucide-react';

export default function PreferencesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Préférences</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
            aria-label="Fermer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Section Notifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-700">Activer les notifications par email</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-700">Rappels de relance</span>
              </label>
            </div>
          </div>

          {/* Section Affichage */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Affichage</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-700">Mode sombre</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-700">Afficher les statistiques</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            type="button"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-custom-blue-600 text-white rounded-md hover:bg-custom-blue-700 transition-colors"
            type="button"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

PreferencesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};