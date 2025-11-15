import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabaseClient';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        setProjects([]);
        return;
      }
      // Map Supabase data to expected format
      const mapped = (data || []).map((p) => ({
        id: p.id,
        title: p.name || p.title || `Project ${p.id}`,
        status: (p.status || 'planned').toLowerCase(),
        budget: Number(p.budget || 0),
        progress: p.progress !== undefined ? p.progress : 0,
        ward: p.ward || '',
        due_date: p.due_date || null,
      }));
      setProjects(mapped);
    }
    fetchProjects();
  }, []);

  const columns = [
    { 
      key: 'title', 
      label: 'Project',
      render: (value, item) => (
        <div>
          <div className="font-semibold text-primary-700">{value}</div>
          <div className="text-xs text-primary-400">{item.ward}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
          ${value === 'in-progress' ? 'bg-primary-100 text-primary-700' : 
            value === 'completed' ? 'bg-accent-green/20 text-accent-green' : 
            'bg-secondary-100 text-secondary-700'}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      key: 'budget', 
      label: 'Budget',
      render: (value) => (
        <span className="font-bold text-primary-700">${value.toLocaleString()}</span>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value) => (
        <div className="flex items-center">
          <div className="w-32">
            <div className="flex items-center">
              <div className="w-full bg-primary-100 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="ml-2 text-xs text-primary-700 font-semibold">{value}%</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'due_date', 
      label: 'Due Date',
      render: (value) => (
        <span className="text-secondary-700 text-xs">{value ? new Date(value).toLocaleDateString() : '-'}</span>
      )
    },
  ];

  const handleEdit = (project) => {
    setEditProject(project);
    setShowEditModal(true);
  };

  const handleDelete = (project) => {
    // TODO: Implement delete functionality
    console.log('Delete project:', project);
  };

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="py-10 bg-gradient-to-br from-primary/5 to-secondary/5 min-h-screen animate-fadein">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        <PageHeader
          title="Projects"
          description="Track and manage all development projects across wards"
          action={
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-colors duration-200"
              onClick={() => setShowAddModal(true)}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Project
            </button>
          }
        />

        <div className="mt-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'planned', 'in-progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm border transition-colors duration-200
                  ${filter === status
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : 'bg-white text-secondary-700 border-secondary-100 hover:bg-primary-50'}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-white rounded-2xl shadow p-4 border border-primary-50 animate-fadein">
            <DataTable
              columns={columns}
              data={filteredProjects}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Add Project Modal */}
        <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
          <ProjectForm
            onSave={async (project) => {
              try {
                const { data, error } = await supabase.from('projects').insert([project]).select();
                if (error) throw error;
                setProjects((prev) => [...prev, ...(data || [])]);
                setShowAddModal(false);
              } catch (err) {
                alert('Error saving project: ' + (err.message || String(err)));
              }
            }}
            onCancel={() => setShowAddModal(false)}
            wards={[]}
          />
        </Modal>

        {/* Edit Project Modal */}
        <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setEditProject(null); }}>
          <ProjectForm
            initial={editProject}
            onSave={async (project) => {
              try {
                const { id, ...updatePayload } = project;
                const { error } = await supabase.from('projects').update(updatePayload).eq('id', id);
                if (error) throw error;
                setProjects((prev) => prev.map(p => p.id === id ? { ...p, ...project } : p));
                setShowEditModal(false);
                setEditProject(null);
              } catch (err) {
                alert('Error updating project: ' + (err.message || String(err)));
              }
            }}
            onCancel={() => { setShowEditModal(false); setEditProject(null); }}
            wards={[]}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Projects;