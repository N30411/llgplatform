import React, { useMemo } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ProjectOverview = ({ projects = [] }) => {
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalProgress = useMemo(() => {
    if (!projects.length) return 0;
    const total = projects.reduce((acc, project) => acc + (project.progress || 0), 0);
    return Math.round(total / projects.length);
  }, [projects]);

  return (
    <div className="rounded-xl bg-gradient-card p-6 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">Project Overview</h3>
        <Link
          to="/projects"
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center transition-colors duration-200"
        >
          View all
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-semibold text-gray-900">{projects.length}</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-semibold text-gray-900">{totalProgress}%</div>
            <div className="text-sm text-gray-500">Avg. Progress</div>
          </div>
        </div>

        <div className="border-t border-gray-200 -mx-6 px-6 pt-4">
          {projects.map((project) => (
            <div key={project.id} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{project.title}</h4>
                  <p className="text-xs text-gray-500">{project.ward}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-300 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
