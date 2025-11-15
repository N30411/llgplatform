import React from 'react';

const RecentProjects = ({ projects }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Projects</h3>
      <ul className="mt-4 space-y-3">
        {projects.map((p) => (
          <li key={p.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{p.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{p.ward}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.progress}%</div>
              <div className="text-xs text-gray-500">{p.status}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentProjects;
