
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// BudgetForm sends CRUD operations directly to Supabase
// All field names use snake_case to match Supabase table columns
const BudgetForm = ({ onSave, onCancel, initial, isEdit, wards }) => {
  const [form, setForm] = useState({
    fiscal_year: 2025,
    amount: '',
    allocated: '',
    category: '',
    ward_id: '',
    status: 'active',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        fiscal_year: initial.fiscal_year || 2025,
        amount: initial.amount || '',
        allocated: initial.allocated || '',
        category: initial.category || '',
        ward_id: initial.ward_id || '',
        status: initial.status || 'active',
        id: initial.id,
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure correct types for Supabase
    if (name === 'fiscal_year' || name === 'ward_id') {
      setForm({ ...form, [name]: parseInt(value) });
    } else if (name === 'amount' || name === 'allocated') {
      setForm({ ...form, [name]: parseFloat(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // CRUD operation: Insert or Update budget in Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.ward_id) return;

    // Map form fields to Supabase columns (snake_case)
    const payload = {
      fiscal_year: form.fiscal_year || 2025,
      amount: form.amount,
      allocated: form.allocated || 0,
      category: form.category,
      ward_id: form.ward_id,
      status: form.status || 'active',
    };
    let result;
    if (isEdit && form.id) {
      // Update existing budget
      result = await supabase.from('budgets').update(payload).eq('id', form.id);
    } else {
      // Insert new budget
      result = await supabase.from('budgets').insert([payload]);
    }
    // Log result for debugging
    console.log('Supabase result:', result);
    if (result.error) {
      alert('Error saving budget: ' + result.error.message);
      return;
    }
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ...existing form fields... */}
      <div>
        <label className="block text-sm font-medium text-primary-700">Fiscal Year</label>
        <select
          name="fiscal_year"
          value={form.fiscal_year}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-400 sm:text-sm"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Category</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
          required
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
        <label className="block text-sm font-medium text-primary-700">Total Budget (PGK)</label>
        <input
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
          required
          min="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-700">Allocated (PGK)</label>
        <input
          name="allocated"
          type="number"
          value={form.allocated}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-400 sm:text-sm"
          min="0"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-modern-outline">
          Cancel
        </button>
        <button type="submit" className="btn-modern-primary">
          {isEdit ? 'Save Changes' : 'Add Budget'}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
