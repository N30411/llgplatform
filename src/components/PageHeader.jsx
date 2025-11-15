import React from 'react';
import { useLocation } from 'react-router-dom';

const PageHeader = ({ title, description, action }) => {
  const location = useLocation();
  
  return (
    <div className="md:flex md:items-center md:justify-between mb-8">
      <div className="flex-1 min-w-0">
        <nav className="flex mb-3" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <span className="text-slate-500">Pages</span>
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="capitalize text-slate-700">{location.pathname.split('/')[1] || 'Dashboard'}</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 className="text-3xl font-extrabold leading-7 text-primary sm:text-4xl sm:truncate drop-shadow">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-base text-secondary font-semibold">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;