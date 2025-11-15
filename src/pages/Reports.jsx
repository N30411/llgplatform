import React, { useState, useEffect } from 'react';
import { ChartBarIcon, DocumentTextIcon, ClipboardDocumentListIcon, CurrencyDollarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabaseClient';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase.from('reports').select('*');
      if (error) {
        setReports([]);
        return;
      }
      // Map Supabase data to expected format
      const mapped = (data || []).map((r) => ({
        id: r.id,
        title: r.title,
        wardName: r.wardName || '',
        createdBy: r.createdBy || '',
        createdAt: r.createdAt || '',
        type: r.type || '',
        status: r.status || '',
        summary: r.summary || r.content || '',
      }));
      setReports(mapped);
    }
    fetchReports();
  }, []);

  const getTypeBadge = (value) => {
    switch (value) {
      case 'progress': return { label: 'Progress Report', classes: 'bg-blue-100 text-blue-800' };
      case 'assessment': return { label: 'Assessment', classes: 'bg-yellow-100 text-yellow-800' };
      case 'financial': return { label: 'Financial', classes: 'bg-green-100 text-green-800' };
      default: return { label: value, classes: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusBadge = (value) => {
    switch (value) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Assign a unique color to each ward
  const wardColors = [
    'bg-rose-400', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500', 'bg-violet-500',
    'bg-indigo-500', 'bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500',
    'bg-emerald-500', 'bg-green-500', 'bg-lime-500', 'bg-yellow-400', 'bg-amber-500',
    'bg-orange-500', 'bg-red-500'
  ];

  // Helper to get color by ward name
  const getWardColor = (wardName) => {
    if (wardName === 'All Wards') return 'bg-purple-400';
  // getWardColor fallback (no wrbWards)
  const idx = 0;
    return wardColors[idx % wardColors.length] || 'bg-gray-400';
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Report',
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{item.summary}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => {
        const meta = getTypeBadge(value);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.classes}`}>
            {meta.label}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      key: 'wardName', 
      label: 'Ward',
      render: (value) => (
        <span className="inline-flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${getWardColor(value)}`}></span>
          {value}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Date',
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    },
  ];

  const handleEdit = (report) => {
    // TODO: Implement edit functionality
    console.log('Edit report:', report);
  };

  const handleDelete = (report) => {
    // TODO: Implement delete functionality
    console.log('Delete report:', report);
  };

  const filteredReports = reports.filter((r) => {
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    if (query && !(r.title || '').toLowerCase().includes(query.toLowerCase()) && !(r.summary || '').toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  // Summary stats
  const total = reports.length;
  const financial = reports.filter(r => r.type === 'financial').length;
  const progress = reports.filter(r => r.type === 'progress').length;
  const assessment = reports.filter(r => r.type === 'assessment').length;

  return (
    <div className="py-10 bg-gradient-to-br from-primary/5 to-secondary/5 min-h-screen animate-fadein">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        <PageHeader
          title="Reports"
          description="Generate and manage reports across all LLG activities"
          action={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-colors duration-200"
                title="Export reports"
              >
                <DocumentTextIcon className="h-5 w-5 mr-1 text-gray-400" /> Export
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-indigo-200 shadow-lg text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all duration-200"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-white" /> Generate Report
              </button>
            </div>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="bg-white rounded-xl shadow flex items-center p-4 border border-gray-100 animate-pop">
            <ChartBarIcon className="h-8 w-8 text-indigo-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total Reports</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow flex items-center p-4 border border-gray-100 animate-pop">
            <CurrencyDollarIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{financial}</div>
              <div className="text-xs text-gray-500">Financial</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow flex items-center p-4 border border-gray-100 animate-pop">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{progress}</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow flex items-center p-4 border border-gray-100 animate-pop">
            <DocumentTextIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{assessment}</div>
              <div className="text-xs text-gray-500">Assessment</div>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 w-full sm:w-1/2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="mt-3 sm:mt-0">
              <div className="flex items-center space-x-2">
                {['all', 'progress', 'assessment', 'financial'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm border ${
                      selectedType === type
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    } transition-colors duration-200`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
                <div className="ml-2 text-sm text-gray-500">Showing {filteredReports.length} reports</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100 animate-fadein">
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ExclamationCircleIcon className="h-12 w-12 text-gray-300 mb-4 animate-bounce" />
                <div className="text-lg font-semibold text-gray-500 mb-2">No reports found</div>
                <div className="text-sm text-gray-400">Try adjusting your filters or search query.</div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredReports}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;