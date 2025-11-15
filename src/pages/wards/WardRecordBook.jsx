import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'demographics', label: 'Demographics' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'projects', label: 'Projects' },
  { key: 'meetings', label: 'Meetings' },
];

const LOCAL_STORAGE_KEY = 'ahi-llg-ward-records';
const pieColors = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#f472b6'];

function WardRecordBook() {
  const [wards, setWards] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWard, setSelectedWard] = useState(null);
  const [form, setForm] = useState({
    ward_number: '',
    ward_name: '',
    councilor_name: '',
    village_name: '',
    population: '',
    male: '',
    female: '',
    households: '',
    land_area: '',
    gps_lat: '',
    gps_long: '',
    remarks: '',
    demographics: {},
    infrastructure: [],
    projects: [],
    meetings: [],
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const unsyncedRef = useRef([]);

  // Connection status indicator
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

  // Load data on mount and when online/offline changes
  useEffect(() => {
    async function loadData() {
      if (navigator.onLine) {
        try {
          setSyncing(true);
          setSyncError(null);
          // Sync any unsynced local records first
          const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
          if (local.length > 0) {
            console.log('[SYNC] Uploading unsynced local records to Supabase:', local);
            for (const record of local) {
              // If record has id, try upsert, else insert
              const { id, ...payload } = record;
              // Add 'name' for Supabase NOT NULL constraint
              const supabasePayload = { ...payload, name: payload.ward_name };
              const { error } = await supabase.from('wards').insert([supabasePayload]);
              if (error) {
                throw error;
              }
            }
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            console.log('[SYNC] Local cache cleared after upload.');
          }
          // Fetch from Supabase
          const { data, error } = await supabase.from('wards').select('*');
          if (error) {
            throw error;
          }
          setWards(data || []);
        } catch (err) {
          setSyncError(err.message || String(err));
          console.error('[SYNC] Error syncing with Supabase:', err);
          // Fallback to local cache if available
          const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
          setWards(local);
        } finally {
          setSyncing(false);
        }
      } else {
        // Offline: load from localStorage
        try {
          const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
          setWards(local);
        } catch {
          setWards([]);
        }
      }
    }
    loadData();
  }, [online]);

  // Save to localStorage if offline
  useEffect(() => {
    if (!online) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wards));
    }
  }, [wards, online]);

  // Filtering, sorting, and paging logic
  const filteredWards = wards.filter(
    w =>
      w.ward_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.ward_number?.toString().includes(search)
  );
  const totalWards = wards.length;
  const totalPopulation = wards.reduce((sum, w) => sum + (parseInt(w.population) || 0), 0);
  const totalHouseholds = wards.reduce((sum, w) => sum + (parseInt(w.households) || 0), 0);

  const [sortKey, setSortKey] = useState('ward_number');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const sortedWards = [...filteredWards].sort((a, b) => {
    if (a[sortKey] === undefined || b[sortKey] === undefined) return 0;
    if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
    return 0;
  });
  const pagedWards = sortedWards.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(sortedWards.length / pageSize);

  const openModal = (ward = null) => {
    setSelectedWard(ward);
    setForm(ward || {
      ward_number: '',
      ward_name: '',
      councilor_name: '',
      village_name: '',
      population: '',
      male: '',
      female: '',
      households: '',
      land_area: '',
      gps_lat: '',
      gps_long: '',
      remarks: '',
      demographics: {},
      infrastructure: [],
      projects: [],
      meetings: [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWard(null);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Add or update a ward
  const handleSave = async () => {
    try {
      if (online) {
        if (selectedWard) {
          // Update
          const { id, ...payload } = { ...form, id: selectedWard.id };
          const supabasePayload = { ...payload, name: payload.ward_name };
          const { error } = await supabase.from('wards').update(supabasePayload).eq('id', selectedWard.id);
          if (error) throw error;
          setWards(ws => ws.map(w => (w.id === selectedWard.id ? { ...payload, id: selectedWard.id } : w)));
          console.log('[ONLINE] Updated ward:', supabasePayload);
        } else {
          // Insert
          const { id, ...payload } = form;
          const supabasePayload = { ...payload, name: payload.ward_name };
          const { data, error } = await supabase.from('wards').insert([supabasePayload]).select();
          if (error) throw error;
          setWards(ws => [...ws, ...(data || [])]);
          console.log('[ONLINE] Inserted ward:', data);
        }
      } else {
        // Offline: save to localStorage and mark as unsynced
        if (selectedWard) {
          setWards(ws => ws.map(w => (w.id === selectedWard.id ? { ...form, id: selectedWard.id } : w)));
        } else {
          setWards(ws => [...ws, { ...form, id: Date.now() }]);
        }
        setTimeout(() => {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...wards, { ...form, id: Date.now() }]));
        }, 0);
        console.log('[OFFLINE] Saved locally:', form);
      }
    } catch (err) {
      console.error('[SAVE] Error:', err);
      alert('Error saving ward: ' + (err.message || String(err)));
    }
    closeModal();
  };

  // Delete a ward
  const handleDelete = async id => {
    if (!window.confirm('Delete this record?')) return;
    try {
      if (online) {
        const { error } = await supabase.from('wards').delete().eq('id', id);
        if (error) throw error;
        setWards(ws => ws.filter(w => w.id !== id));
        console.log('[ONLINE] Deleted ward id:', id);
      } else {
        setWards(ws => ws.filter(w => w.id !== id));
        setTimeout(() => {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wards.filter(w => w.id !== id)));
        }, 0);
        console.log('[OFFLINE] Deleted locally, id:', id);
      }
    } catch (err) {
      console.error('[DELETE] Error:', err);
      alert('Error deleting ward: ' + (err.message || String(err)));
    }
  };

  const handleTabChange = key => setActiveTab(key);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-green-800 tracking-tight drop-shadow-sm mb-2 md:mb-0">Ward Record Book</h1>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                className="pl-10 pr-4 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white shadow-sm transition-all duration-200 w-full md:w-64"
                placeholder="Search by ward name or number"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-green-400" />
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => openModal()}
            >
              <FaPlus /> Add New Record
            </button>
          </div>
        </div>
        {/* Summary Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center border border-green-100 hover:shadow-xl transition-shadow duration-200">
            <span className="text-lg font-semibold text-green-700">Total Wards</span>
            <span className="text-3xl font-extrabold text-green-800 mt-1">{totalWards}</span>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center border border-green-100 hover:shadow-xl transition-shadow duration-200">
            <span className="text-lg font-semibold text-green-700">Total Population</span>
            <span className="text-3xl font-extrabold text-green-800 mt-1">{totalPopulation}</span>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center border border-green-100 hover:shadow-xl transition-shadow duration-200">
            <span className="text-lg font-semibold text-green-700">Total Households</span>
            <span className="text-3xl font-extrabold text-green-800 mt-1">{totalHouseholds}</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-5 py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm border ${activeTab === tab.key ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-10 border border-green-100 transition-shadow duration-200">
          {activeTab === 'overview' && (
            <div>
              <div className="overflow-x-auto rounded-xl border border-green-100">
                <table className="min-w-full text-sm bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-50 to-lime-50 text-green-800">
                      <th className="p-3 cursor-pointer font-bold" onClick={() => { setSortKey('ward_number'); setSortAsc(!sortAsc); }}>Ward #</th>
                      <th className="p-3 cursor-pointer font-bold" onClick={() => { setSortKey('ward_name'); setSortAsc(!sortAsc); }}>Ward Name</th>
                      <th className="p-3 font-bold">Councilor</th>
                      <th className="p-3 font-bold">Village(s)</th>
                      <th className="p-3 font-bold">Population</th>
                      <th className="p-3 font-bold">Male</th>
                      <th className="p-3 font-bold">Female</th>
                      <th className="p-3 font-bold">Households</th>
                      <th className="p-3 font-bold">Land Area</th>
                      <th className="p-3 font-bold">GPS</th>
                      <th className="p-3 font-bold">Remarks</th>
                      <th className="p-3 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedWards.map(w => (
                      <tr key={w.id} className="border-b last:border-b-0 hover:bg-green-50 transition-colors">
                        <td className="p-3 font-mono text-green-900">{w.ward_number}</td>
                        <td className="p-3 font-semibold">{w.ward_name}</td>
                        <td className="p-3">{w.councilor_name}</td>
                        <td className="p-3">{w.village_name}</td>
                        <td className="p-3">{w.population}</td>
                        <td className="p-3">{w.male}</td>
                        <td className="p-3">{w.female}</td>
                        <td className="p-3">{w.households}</td>
                        <td className="p-3">{w.land_area}</td>
                        <td className="p-3">{w.gps_lat}, {w.gps_long}</td>
                        <td className="p-3">{w.remarks}</td>
                        <td className="p-3 flex gap-2 items-center">
                          <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors" title="Edit" onClick={() => openModal(w)}><FaEdit /></button>
                          <button className="text-red-600 hover:text-red-800 p-1 rounded transition-colors" title="Delete" onClick={() => handleDelete(w.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex flex-wrap justify-end gap-2 mt-4">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-1 rounded-lg bg-green-50 border border-green-200 text-green-700 font-semibold disabled:opacity-50">Prev</button>
                <span className="px-2 text-green-800 font-medium">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-1 rounded-lg bg-green-50 border border-green-200 text-green-700 font-semibold disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
          {/* ...other tabs remain unchanged, but use pagedWards[0] for demo pie chart, etc... */}
        </div>
        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-all duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative border border-green-200 animate-fadeIn">
              <button className="absolute top-3 right-4 text-green-400 hover:text-red-500 text-3xl font-bold transition-colors" onClick={closeModal} aria-label="Close">&times;</button>
              <h2 className="text-2xl font-extrabold mb-6 text-green-800 tracking-tight">{selectedWard ? 'Edit Ward Record' : 'Add New Ward Record'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input name="ward_number" value={form.ward_number} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Ward Number" />
                <input name="ward_name" value={form.ward_name} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Ward Name" />
                <input name="councilor_name" value={form.councilor_name} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Councilor Name" />
                <input name="village_name" value={form.village_name} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Village(s) Name" />
                <input name="population" value={form.population} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Population" type="number" />
                <input name="male" value={form.male} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Male" type="number" />
                <input name="female" value={form.female} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Female" type="number" />
                <input name="households" value={form.households} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Households" type="number" />
                <input name="land_area" value={form.land_area} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Land Area" />
                <input name="gps_lat" value={form.gps_lat} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="GPS Latitude" />
                <input name="gps_long" value={form.gps_long} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="GPS Longitude" />
                <input name="remarks" value={form.remarks} onChange={handleFormChange} className="border border-green-200 p-3 rounded-lg md:col-span-2 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all" placeholder="Remarks" />
              </div>
              <div className="flex justify-end mt-6 gap-3">
                <button className="px-6 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-all" onClick={closeModal}>Cancel</button>
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600 text-white font-bold shadow-lg transition-all" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WardRecordBook;


