
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// ProjectForm sends CRUD operations directly to Supabase
// All field names use snake_case to match Supabase table columns
const defaultForm = {
  name: '', // Supabase column: name
  status: 'planned',
  budget: '',
  progress: 0,
  ward_id: '', // Supabase column: ward_id
  start_date: '', // Supabase column: start_date
  end_date: '', // Supabase column: end_date
};

const ProjectForm = ({ onSave, onCancel, initial, wards, isEdit }) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        status: initial.status || 'planned',
        budget: initial.budget || '',
        progress: initial.progress || 0,
        ward_id: initial.ward_id || '',
        start_date: initial.start_date || '',
        end_date: initial.end_date || '',
        id: initial.id,
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // CRUD operation: Insert or Update project in Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.budget || !form.ward_id) return;

    // Map form fields to Supabase columns (snake_case)
    const payload = {
      name: form.name,
      status: form.status,
      budget: Number(form.budget),
      progress: Number(form.progress),
      ward_id: form.ward_id,
      start_date: form.start_date,
      end_date: form.end_date,
    };
    let result;
    if (isEdit && form.id) {
      // Update existing project
      result = await supabase.from('projects').update(payload).eq('id', form.id);
    } else {
      // Insert new project
      result = await supabase.from('projects').insert([payload]);
    }
    // Log result for debugging
    console.log('Supabase result:', result);
    if (result.error) {
      alert('Error saving project: ' + result.error.message);
      return;
    }
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ...existing form fields, now mapped to snake_case... */}
      <div>
        <label className="block text-sm font-medium text-primary-700">Project Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-400 sm:text-sm"
        >
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Budget (PGK)</label>
        <input
          name="budget"
          type="number"
          value={form.budget}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
          required
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Progress (%)</label>
        <input
          name="progress"
          type="number"
          value={form.progress}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
          min="0"
          max="100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Ward</label>
        <select
          name="ward_id"
          value={form.ward_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-400 sm:text-sm"
          required
        >
          <option value="">Select a ward</option>
          {wards.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Start Date</label>
        <input
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">End Date</label>
        <input
          name="end_date"
          type="date"
          value={form.end_date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-modern-outline">
          Cancel
        </button>
        <button type="submit" className="btn-modern-primary">
          {isEdit ? 'Save Changes' : 'Add Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
