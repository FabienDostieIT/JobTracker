import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getContacts, deleteContact } from '../services/api';
import JobForm from './JobForm';
import EditJobForm from './EditJobForm';
import SourceLogo from './SourceLogo';
// Search icon from lucide-react was unused
import { Trash2, Edit, ChevronDown, ChevronUp, SlidersHorizontal, BarChart } from 'lucide-react'; 
import InterviewNotifications from './InterviewNotifications'; // This is used

export default function JobTracker() {
  const [applications, setApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    startDate: '',
    endDate: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'datePostulation',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      'postulé': 'Postulé',
      'relance': 'Relancé',
      'entretien': 'Entretien',
      'accepté': 'Accepté',
      'refusé': 'Refusé'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'postulé': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'relance': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'entretien': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      'accepté': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'refusé': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  const fetchApplications = async () => {
    try {
      const data = await getContacts();
      setApplications(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      try {
        await deleteContact(id);
        await fetchApplications();
      } catch (error) {
        console.error('Erreur lors de la suppression du contact:', error);
      }
    }
  };

  const handleEdit = (application) => {
    setEditingApplication(application);
  };

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];

    // Recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.entreprise.toLowerCase().includes(searchLower) ||
        app.poste.toLowerCase().includes(searchLower) ||
        app.commentaires?.toLowerCase().includes(searchLower)
      );
    }

    // Filtres
    if (filters.status) {
      result = result.filter(app => app.statut === filters.status);
    }
    if (filters.source) {
      result = result.filter(app => app.source === filters.source);
    }
    if (filters.startDate) {
      result = result.filter(app => app.datePostulation >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter(app => app.datePostulation <= filters.endDate);
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'entreprise':
          comparison = a.entreprise.localeCompare(b.entreprise);
          break;
        case 'datePostulation':
          comparison = new Date(a.datePostulation) - new Date(b.datePostulation);
          break;
        case 'statut':
          comparison = a.statut.localeCompare(b.statut);
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [applications, searchTerm, filters, sortConfig]);

  const availableSources = useMemo(() => {
    return [...new Set(applications.map(app => app.source))];
  }, [applications]);

  const handleAddApplication = async () => {
    await fetchApplications();
  };

  const handleApplicationUpdated = async () => {
    await fetchApplications();
    setEditingApplication(null);
  };

  // Component definitions
  // const StatsPanel = ({ applications }) => { // Commenting out StatsPanel as it's unused
  //   const stats = useMemo(() => {
  //     return applications.reduce((acc, app) => {
  //       acc[app.statut] = (acc[app.statut] || 0) + 1;
  //       return acc;
  //     }, {});
  //   }, [applications]);

  //   return (
  //     <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm p-4 mb-6">
  //       <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-dark-text-primary">
  //         <BarChart className="w-5 h-5" />
  //         Statistiques
  //       </h3>
  //       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
  //         {Object.entries(stats).map(([status, count]) => (
  //           <div key={status} className={`p-3 rounded-lg ${getStatusColor(status)}`}>
  //             <div className="text-2xl font-bold">{count}</div>
  //             <div className="text-sm">{getStatusText(status)}</div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  const Application = ({ application, onDelete, onEdit, isExpanded, onToggle }) => {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-primary transition-colors flex items-center justify-between"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-3 flex-grow">
            <SourceLogo source={application.source} className="w-8 h-8" />
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">{application.entreprise}</h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{application.poste}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.statut)}`}>
                {getStatusText(application.statut)}
              </span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-dark-border">
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Date de postulation</p>
                  <p className="text-gray-900 dark:text-dark-text-primary">{formatDate(application.datePostulation)}</p>
                </div>
                {application.emailEmployeur && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Email</p>
                    <p className="text-gray-900 dark:text-dark-text-primary">{application.emailEmployeur}</p>
                  </div>
                )}
                {application.telephoneContact && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Téléphone</p>
                    <p className="text-gray-900 dark:text-dark-text-primary">{application.telephoneContact}</p>
                  </div>
                )}
              </div>

              {application.documents?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Documents envoyés</p>
                  <div className="flex flex-wrap gap-2">
                    {application.documents.map((doc, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-dark-bg-primary text-gray-700 dark:text-dark-text-primary rounded-full text-sm"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {application.tags?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {application.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-custom-blue-100 dark:bg-custom-blue-900/30 text-custom-blue-700 dark:text-custom-blue-200 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {application.commentaires && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary mb-1">Commentaires</p>
                  <p className="text-gray-700 dark:text-dark-text-primary whitespace-pre-line">
                    {application.commentaires}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(application);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(application._id);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 bg-white dark:bg-dark-bg-secondary hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-200 dark:border-red-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  Application.propTypes = {
    application: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      entreprise: PropTypes.string.isRequired,
      poste: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired,
      statut: PropTypes.string.isRequired,
      datePostulation: PropTypes.string.isRequired,
      emailEmployeur: PropTypes.string,
      telephoneContact: PropTypes.string,
      documents: PropTypes.arrayOf(PropTypes.string),
      tags: PropTypes.arrayOf(PropTypes.string),
      commentaires: PropTypes.string,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
  };

  // Prop types for StatsPanel (if it were to be used)
  // StatsPanel.propTypes = {
  //   applications: PropTypes.arrayOf(PropTypes.shape({
  //     statut: PropTypes.string.isRequired,
  //   })).isRequired,
  // };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* <StatsPanel applications={applications} /> */} {/* StatsPanel is not currently rendered */}
      <div className="lg:col-span-7">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6">
          <JobForm onApplicationAdded={handleAddApplication} />
        </div>
      </div>
      
      <div className="lg:col-span-5">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                Candidatures
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-custom-blue-600 dark:bg-dark-bg-primary dark:border-dark-border dark:text-dark-text-primary"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                >
                  <SlidersHorizontal size={20} />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="p-4 bg-gray-50 dark:bg-dark-bg-primary rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                    Statut
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-secondary dark:border-dark-border dark:text-dark-text-primary"
                  >
                    <option value="">Tous</option>
                    <option value="postulé">Postulé</option>
                    <option value="relance">Relance</option>
                    <option value="entretien">Entretien</option>
                    <option value="accepté">Accepté</option>
                    <option value="refusé">Refusé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                    Source
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-secondary dark:border-dark-border dark:text-dark-text-primary"
                  >
                    <option value="">Toutes</option>
                    {availableSources.map(source => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      Date début
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-secondary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      Date fin
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full rounded-lg border-gray-200 dark:bg-dark-bg-secondary dark:border-dark-border dark:text-dark-text-primary"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFilters({
                      status: '',
                      source: '',
                      startDate: '',
                      endDate: ''
                    });
                    setSearchTerm('');
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary bg-white dark:bg-dark-bg-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            <div className="space-y-4">
              {filteredAndSortedApplications.map(application => (
                <Application
                  key={application._id}
                  application={application}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onToggle={() => handleToggle(application._id)}
                  isExpanded={expandedId === application._id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {editingApplication && (
        <EditJobForm
          contact={editingApplication}
          onClose={() => setEditingApplication(null)}
          onContactUpdated={handleApplicationUpdated}
        />
      )}
    </div>
  );
} 