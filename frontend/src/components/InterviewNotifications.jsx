import React, { useState, useEffect } from 'react';
import { Bell, Calendar, X } from 'lucide-react';

export default function InterviewNotifications({ applications }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Filtrer les candidatures avec des entretiens à venir
    const today = new Date();
    const upcomingInterviews = applications
      .filter(app => app.statut === 'entretien')
      .map(app => {
        const interviewDate = new Date(app.datePostulation);
        const daysUntil = Math.ceil((interviewDate - today) / (1000 * 60 * 60 * 24));
        return {
          id: app._id,
          entreprise: app.entreprise,
          poste: app.poste,
          date: interviewDate,
          daysUntil,
          isToday: daysUntil === 0,
          isUpcoming: daysUntil > 0 && daysUntil <= 7
        };
      })
      .filter(interview => interview.isToday || interview.isUpcoming)
      .sort((a, b) => a.date - b.date);

    setNotifications(upcomingInterviews);
  }, [applications]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-custom-blue-600 transition-colors"
        aria-label="Notifications d'entretiens"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Entretiens à venir
            </h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 ${
                  notification.isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{notification.entreprise}</div>
                <div className="text-sm text-gray-600">{notification.poste}</div>
                <div className="mt-1 text-sm">
                  <span className={`font-medium ${
                    notification.isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {notification.isToday ? "Aujourd'hui" : formatDate(notification.date)}
                  </span>
                  {!notification.isToday && (
                    <span className="text-gray-500">
                      {' '}
                      (dans {notification.daysUntil} jour{notification.daysUntil > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 rounded-b-lg">
              {notifications.length} entretien{notifications.length > 1 ? 's' : ''} à venir
            </div>
          )}
        </div>
      )}
    </div>
  );
} 