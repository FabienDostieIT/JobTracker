import PropTypes from 'prop-types';
import { Briefcase } from 'lucide-react';

const SourceLogo = ({ source, className = "" }) => {
  const getSourceInfo = (source) => {
    const sources = {
      'linkedin': {
        name: 'LinkedIn',
        color: 'text-blue-600'
      },
      'indeed': {
        name: 'Indeed',
        color: 'text-blue-500'
      },
      'welcometothejungle': {
        name: 'WTTJ',
        color: 'text-yellow-600'
      },
      'glassdoor': {
        name: 'Glassdoor',
        color: 'text-green-600'
      },
      'autre': {
        name: 'Autre',
        color: 'text-gray-600'
      }
    };
    return sources[source] || { name: source || 'Source', color: 'text-gray-400' };
  };

  const sourceInfo = getSourceInfo(source);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Briefcase className={`w-full h-full ${sourceInfo.color}`} />
    </div>
  );
};

SourceLogo.propTypes = {
  source: PropTypes.string,
  className: PropTypes.string,
};

export default SourceLogo;