import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import StatCard from '../components/StatCard';
import ProjectOverview from '../components/ProjectOverview';
import BudgetSummary from '../components/BudgetSummary';
import PageHeader from '../components/PageHeader';
import { CHART_COLORS } from '../theme/colors';
import {
  UsersIcon, ChartBarIcon, BanknotesIcon,
  ArrowTopRightOnSquareIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [reports, setReports] = useState([]);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [wardsData, projectsData, budgetsData, expendituresData, reportsData] = await Promise.all([
        supabase.from('wards').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('expenditures').select('*'),
        supabase.from('reports').select('*')
      ]).then(results => results.map(r => r.data || []));
      
      setWards(wardsData);
      setProjects(projectsData);
      setBudgets(budgetsData);
      setExpenditures(expendituresData);
      setReports(reportsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Supabase Realtime subscriptions
  useEffect(() => {
    const tables = ['wards', 'projects', 'budgets', 'expenditures', 'reports'];
    const setters = [setWards, setProjects, setBudgets, setExpenditures, setReports];

    const channel = supabase.channel('realtime-dashboard');

    tables.forEach((table, idx) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        payload => {
          setters[idx](prev => {
            const index = prev.findIndex(item => item.id === payload.new?.id);
            if (payload.eventType === 'DELETE') {
              return prev.filter(item => item.id !== payload.old.id);
            } else if (index > -1) {
              prev[index] = payload.new;
              return [...prev];
            } else {
              return [...prev, payload.new];
            }
          });
        }
      );
    });

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // Dashboard calculations
  const wardData = useMemo(() => wards.map(w => {
    const wardProjects = projects.filter(p => p.ward_id === w.id);
    const wardBudgets = budgets.filter(b => b.ward_id === w.id);
    const wardExpenditures = expenditures.filter(e => wardProjects.some(p => p.id === e.project_id));
    return {
      id: w.id,
      name: w.name,
      population: w.population || 0,
      projectsTotal: wardProjects.length,
      projectsInProgress: wardProjects.filter(p => p.status === 'in-progress').length,
      projectsCompleted: wardProjects.filter(p => p.status === 'completed').length,
      budgetTotal: wardBudgets.reduce((s, b) => s + (b.amount || 0), 0),
      budgetAllocated: wardBudgets.reduce((s, b) => s + (b.allocated || 0), 0),
      expenditure: wardExpenditures.reduce((s, e) => s + (e.amount || 0), 0),
    };
  }), [wards, projects, budgets, expenditures]);

  const budgetPieData = useMemo(() => wardData.map(w => ({ name: w.name, value: w.budgetTotal })), [wardData]);
  const projectStatusData = useMemo(() => wardData.map(w => ({
    name: w.name,
    InProgress: w.projectsInProgress,
    Completed: w.projectsCompleted,
    Pending: w.projectsTotal - (w.projectsInProgress + w.projectsCompleted),
  })), [wardData]);

  const totalPopulation = useMemo(() => wardData.reduce((s, w) => s + w.population, 0), [wardData]);
  const totalBudget = useMemo(() => wardData.reduce((s, w) => s + w.budgetTotal, 0), [wardData]);
  const totalAllocated = useMemo(() => wardData.reduce((s, w) => s + w.budgetAllocated, 0), [wardData]);
  const pendingReports = useMemo(() => reports.filter(r => r.status === 'draft').length, [reports]);

  if (loading) return <div className="text-center mt-20">Loading dashboard...</div>;

  return (
    <div className="py-10 bg-gradient-to-br from-primary/5 to-secondary/5 min-h-screen animate-fadein">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <PageHeader
          title="Dashboard"
          description={`Overview of LLG activities — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        />

        {/* Stat Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Population" value={totalPopulation.toLocaleString()} icon={<UsersIcon className="h-7 w-7 text-primary-600" />} delta="+3.4% since last month" trend="up" />
          <StatCard title="Active Projects" value={projects.filter(p => p.status === 'in-progress').length.toString()} icon={<ChartBarIcon className="h-7 w-7 text-blue-600" />} delta={`${projects.filter(p => p.status === 'in-progress').length} in-progress`} trend="up" />
          <StatCard title="Total Budget" value={`$${totalBudget.toLocaleString()}`} icon={<BanknotesIcon className="h-7 w-7 text-green-600" />} delta={`${totalBudget ? Math.round((totalAllocated / totalBudget) * 100) : 0}% allocated`} trend="none" />
          <StatCard title="Pending Reports" value={pendingReports.toString()} icon={<ArrowPathIcon className="h-7 w-7 text-amber-600" />} delta="Needs review" trend="none" />
        </div>

        {/* Charts */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                       label={({ name, value }) => `${name}: $${(value/1000).toFixed(0)}K`}>
                    {budgetPieData.map((entry, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => `$${(value/1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Status by Ward</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="InProgress" stackId="a" fill={CHART_COLORS[1]} />
                  <Bar dataKey="Completed" stackId="a" fill={CHART_COLORS[2]} />
                  <Bar dataKey="Pending" stackId="a" fill={CHART_COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Links & Overviews */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Tailwind-safe Quick Links */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-100 to-blue-50 p-6 shadow border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">Quick Links</h3>
            {[
              { href: '/wards', label: 'Wards Overview', color: 'primary' },
              { href: '/projects', label: 'Projects', color: 'blue' },
              { href: '/budgets', label: 'Budgets', color: 'green' },
              { href: '/reports', label: 'Reports', color: 'amber' }
            ].map((link, i) => (
              <Link
                key={i}
                to={link.href}
                className={`flex items-center px-4 py-2 mb-2 rounded-lg bg-white hover:bg-${link.color}-50 border border-${link.color}-100 text-${link.color}-700 font-medium transition-all`}
              >
                {link.label} <ArrowTopRightOnSquareIcon className={`ml-auto h-4 w-4 text-${link.color}-400`} />
              </Link>
            ))}
          </div>

          <div className="space-y-8">
            <ProjectOverview projects={projects} />
            <BudgetSummary budgetData={wardData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
