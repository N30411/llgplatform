import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Modal from '../components/Modal';
import WardForm from '../components/WardForm';

const Wards = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const { data, error, status } = await supabase.from('wards').select('*');
      console.log('fetchWards result', { data, error, status });
      if (error) {
        console.error('Error fetching wards:', error);
        setWards([]);
      } else {
        setWards(data || []);
      }
    } catch (err) {
      console.error('Unexpected fetch error:', err);
      setWards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleAddWard = async (ward) => {
    setAdding(true);
    try {
      // return the inserted row(s)
      const { data, error } = await supabase.from('wards').insert([ward]).select();
      console.log('insert result', { data, error });
      if (error) {
        alert('Error adding ward: ' + error.message);
      } else {
        // optionally show added ward
        console.log('Added ward:', data);
        // refresh list
        await fetchWards();
      }
    } catch (err) {
      console.error('Unexpected insert error:', err);
      alert('Error adding ward: ' + (err.message || String(err)));
    } finally {
      setAdding(false);
      setShowAddModal(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Ward Name',
      render: (value) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-100 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-600">{value[0]}</span>
          </div>
          <div className="ml-4">
            <div className="font-semibold text-primary-700">{value}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'population', 
      label: 'Population',
      render: (value) => (
        <span className="font-bold text-primary-700">{value.toLocaleString()}</span>
      )
    },
    { 
      key: 'area', 
      label: 'Area',
      render: (value) => (
        <span className="text-secondary-700">{value} km²</span>
      )
    },
    { 
      key: 'projects', 
      label: 'Projects',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
          {value} active
        </span>
      )
    },
    {
      key: 'record',
      label: '',
      render: (_v, item) => (
        <a
          href={`/wards/record-book?id=${item.id}`}
          className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors"
        >
          Open Record Book
        </a>
      ),
    },
  ];

  const handleEdit = (ward) => {
    // TODO: Implement edit functionality
    console.log('Edit ward:', ward);
  };

  const handleDelete = (ward) => {
    // TODO: Implement delete functionality
    console.log('Delete ward:', ward);
  };

  return (
    <div className="py-8 bg-[#F4F7FA] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary-700">Wards</h1>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-colors duration-200"
            onClick={() => setShowAddModal(true)}
          >
            + Add Ward
          </button>
        </div>
        <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
          <h2 className="text-xl font-bold mb-4 text-primary-700">Add New Ward</h2>
          <WardForm onSave={handleAddWard} onCancel={() => setShowAddModal(false)} />
          {adding && <div className="mt-2 text-primary-400">Adding...</div>}
        </Modal>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-primary-500 font-semibold">Loading...</span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow border border-primary-50">
            <table className="min-w-full divide-y divide-primary-100">
              <thead className="bg-primary-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-3 text-left text-xs font-bold text-primary-500 uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-100">
                {wards.map((ward) => (
                  <tr key={ward.id} className="hover:bg-primary-50 transition">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                        {col.render ? col.render(ward[col.key], ward) : (ward[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
                {wards.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-primary-400">No wards found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wards;