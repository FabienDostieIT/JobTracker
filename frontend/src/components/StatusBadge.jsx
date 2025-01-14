import React from 'react';

export default function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    const colors = {
      'postulé': 'bg-blue-100 text-blue-800',
      'relance': 'bg-yellow-100 text-yellow-800',
      'entretien': 'bg-purple-100 text-purple-800',
      'refusé': 'bg-red-100 text-red-800',
      'accepté': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
} 