import { Link } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  subtitle, 
  primaryAction, 
  secondaryAction,
  children 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
          {children}
        </div>
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <Link 
              to={secondaryAction.to} 
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {secondaryAction.label}
            </Link>
          )}
          {primaryAction && (
            <Link 
              to={primaryAction.to} 
              className="px-3 py-2 text-sm btn-primary"
            >
              {primaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
