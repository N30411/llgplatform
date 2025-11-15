import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import BudgetForm from '../components/BudgetForm';
import { supabase } from '../lib/supabaseClient';


const LOCAL_STORAGE_KEY = 'ahi-llg-budget-records';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, budget: null });
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [search, setSearch] = useState('');
  const [wards, setWards] = useState([]);
  const unsyncedRef = useRef([]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      if (navigator.onLine) {
        try {
          setSyncing(true);
          setSyncError(null);
          // Sync any unsynced local records first
          const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
          if (local.length > 0) {
            for (const record of local) {
              const { id, ...payload } = record;
              const { error } = await supabase.from('budgets').insert([payload]);
              if (error) throw error;
            }
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
          // Fetch from Supabase
          const { data, error } = await supabase.from('budgets').select('*');
          if (error) throw error;
          setBudgets(data || []);
        } catch (err) {
          setSyncError(err.message || String(err));
          const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
          setBudgets(local);
        } finally {
          setSyncing(false);
        }
      } else {
        try {
          const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
          setBudgets(local);
        } catch {
          setBudgets([]);
        }
      }
    }
    loadData();
  }, [online]);

  useEffect(() => {
    if (!online) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(budgets));
    }
  }, [budgets, online]);

  // Fetch wards from Supabase (or localStorage if offline)
  useEffect(() => {
    async function fetchWards() {
      if (navigator.onLine) {
        const { data, error } = await supabase.from('wards').select('id, name');
        if (!error && data) {
          setWards(data);
          localStorage.setItem('ahi-llg-wards', JSON.stringify(data));
        }
      } else {
        const cached = localStorage.getItem('ahi-llg-wards');
        setWards(cached ? JSON.parse(cached) : []);
      }
    }
    fetchWards();
  }, [online]);

  // Helper to get ward name by id
  const getWardName = (id) => {
    const ward = wards.find(w => w.id === id);
    return ward ? ward.name : id;
  };

  const columns = [
    { 
      key: 'category', 
      label: 'Category',
      render: (value) => (
        <div className="font-semibold text-primary-700">{value}</div>
      )
    },
    { 
      key: 'amount', 
      label: 'Total Budget',
      render: (value) => (
        <div className="font-bold text-primary-700">${value !== undefined && value !== null ? value.toLocaleString() : '0'}</div>
      )
    },
    { 
      key: 'allocated', 
      label: 'Allocated',
      render: (value, item) => (
        <div>
          <div className="flex items-center">
            <div className="w-32">
              <div className="flex items-center">
                <div className="w-full bg-primary-100 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(value && item.amount ? (value / item.amount) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="ml-2 text-xs text-primary-700 font-semibold">${value !== undefined && value !== null ? value.toLocaleString() : '0'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'remaining', 
      label: 'Remaining',
      render: (value) => (
        <span className={`font-bold ${value > 0 ? 'text-accent-green' : 'text-accent-pink'}`}>${value !== undefined && value !== null ? value.toLocaleString() : '0'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
          ${value === 'active' ? 'bg-primary-100 text-primary-700' : 
            value === 'pending' ? 'bg-secondary-100 text-secondary-700' : 
            'bg-gray-100 text-gray-800'}`}>{value ? value.charAt(0).toUpperCase() + value.slice(1) : ''}</span>
      )
    },
    {
      key: 'ward_id',
      label: 'Ward',
      render: (value) => (
        <span className="font-semibold text-primary-700">{getWardName(value)}</span>
      )
    }
  ];

  const handleEdit = (budget) => {
    setEditBudget(budget);
    setShowEditModal(true);
  };

  const handleEditSave = async (updated) => {
    const fiscal_year = updated.fiscal_year && String(updated.fiscal_year).trim() ? String(updated.fiscal_year) : '2025';
    const payload = { ...updated, fiscal_year, ward_id: updated.ward_id };
    if (online) {
      try {
        const { id, ...updatePayload } = payload;
        const { error } = await supabase.from('budgets').update(updatePayload).eq('id', updated.id);
        if (error) throw error;
        setBudgets((prev) => prev.map(b => b.id === updated.id ? { ...updated, fiscal_year, ward_id: updated.ward_id } : b));
      } catch (err) {
        alert('Error updating budget: ' + (err.message || String(err)));
      }
    } else {
      setBudgets((prev) => prev.map(b => b.id === updated.id ? { ...updated, fiscal_year, ward_id: updated.ward_id } : b));
    }
    setShowEditModal(false);
    setEditBudget(null);
  };

  const handleDelete = (budget) => {
    setDeleteConfirm({ open: true, budget });
  };

  const confirmDelete = async () => {
    if (online) {
      try {
        const { error } = await supabase.from('budgets').delete().eq('id', deleteConfirm.budget.id);
        if (error) throw error;
        setBudgets((prev) => prev.filter(b => b.id !== deleteConfirm.budget.id));
      } catch (err) {
        alert('Error deleting budget: ' + (err.message || String(err)));
      }
    } else {
      setBudgets((prev) => prev.filter(b => b.id !== deleteConfirm.budget.id));
    }
    setDeleteConfirm({ open: false, budget: null });
  };

  const filteredBudgets = budgets.filter(b =>
    String(b.fiscal_year) === String(selectedYear) &&
    (b.category?.toLowerCase().includes(search.toLowerCase()) ||
     getWardName(b.ward_id)?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalAllocated = filteredBudgets.reduce((sum, b) => sum + b.allocated, 0);

  const handleAddBudget = async (budget) => {
    const fiscal_year = budget.fiscal_year && String(budget.fiscal_year).trim() ? String(budget.fiscal_year) : '2025';
    const payload = { ...budget, fiscal_year, ward_id: budget.ward_id };
    if (online) {
      try {
        const { id, remaining, ...insertPayload } = payload;
        const { data, error } = await supabase.from('budgets').insert([insertPayload]).select();
        if (error) throw error;
        setBudgets((prev) => [...prev, ...(data || [])]);
      } catch (err) {
        alert('Error saving budget: ' + (err.message || String(err)));
      }
    } else {
      setBudgets((prev) => [...prev, { ...payload, id: Date.now() }]);
    }
    setShowAddModal(false);
  };

  return (
    <div className="py-8 bg-[#F4F7FA] min-h-screen animate-fadein">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-block w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}
              title={online ? 'Online' : 'Offline'}
            />
            <span className="text-sm font-medium text-green-700">
              {online ? 'Online' : 'Offline'}
              {syncing && <span className="ml-2 text-xs text-yellow-600 animate-pulse">Syncing...</span>}
              {syncError && <span className="ml-2 text-xs text-red-600">Sync error: {syncError}</span>}
            </span>
          </div>
        <PageHeader
          title="Budgets"
          description="Manage and track budget allocations across wards"
          action={
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-colors duration-200"
              onClick={() => setShowAddModal(true)}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Budget
            </button>
          }
        />
          {/* Search/filter box */}
          <div className="mt-4 flex justify-end">
            <input
              type="text"
              className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm"
              placeholder="Search by category or ward..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

        <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
          <h2 className="text-xl font-bold mb-4 text-primary-700">Add New Budget</h2>
          <BudgetForm onSave={handleAddBudget} onCancel={() => setShowAddModal(false)} wards={wards} />
        </Modal>

        <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setEditBudget(null); }}>
          <h2 className="text-xl font-bold mb-4 text-primary-700">Edit Budget</h2>
          {editBudget && (
            <BudgetForm
              onSave={handleEditSave}
              onCancel={() => { setShowEditModal(false); setEditBudget(null); }}
              initial={editBudget}
              isEdit
              wards={wards}
            />
          )}
        </Modal>

        <Modal open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, budget: null })}>
          <h2 className="text-xl font-bold mb-4 text-red-700">Delete Budget</h2>
          <p>Are you sure you want to delete <span className="font-semibold">{deleteConfirm.budget?.category}</span> for <span className="font-semibold">{getWardName(deleteConfirm.budget?.ward_id)}</span>?</p>
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn-modern-outline" onClick={() => setDeleteConfirm({ open: false, budget: null })}>Cancel</button>
            <button className="btn-modern-primary bg-red-600 hover:bg-red-700 border-red-600" onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>

        {/* Summary Cards */}
        <div className="mt-6 mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 p-6 shadow border border-primary-100">
            <dt className="truncate text-sm font-medium text-primary-700">Total Budget</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-primary-700">
              ${totalBudget.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-accent-green/10 to-primary-50 p-6 shadow border border-green-100">
            <dt className="truncate text-sm font-medium text-accent-green">Allocated</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-accent-green">
              ${totalAllocated.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-accent-yellow/10 to-primary-50 p-6 shadow border border-yellow-100">
            <dt className="truncate text-sm font-medium text-accent-yellow">Remaining</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-accent-yellow">
              ${(totalBudget - totalAllocated).toLocaleString()}
            </dd>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-secondary-100 to-primary-50 p-6 shadow border border-secondary-100">
            <dt className="truncate text-sm font-medium text-secondary-700">Fiscal Year</dt>
            <dd className="mt-1">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-400 sm:text-sm"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </dd>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-white rounded-2xl shadow p-4 border border-primary-50 animate-fadein">
            <DataTable
              columns={columns}
              data={filteredBudgets}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;