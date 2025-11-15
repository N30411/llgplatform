import React, { useState } from 'react';

const WardForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    population: '',
    households: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSave({
      ...form,
      population: form.population ? Number(form.population) : null,
      households: form.households ? Number(form.households) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-primary-700">Ward Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Population</label>
        <input name="population" type="number" value={form.population} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm" min="0" />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Households</label>
        <input name="households" type="number" value={form.households} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm" min="0" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-modern-outline">Cancel</button>
        <button type="submit" className="btn-modern-primary">Add Ward</button>
      </div>
    </form>
  );
};

export default WardForm;
