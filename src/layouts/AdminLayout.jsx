import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../App';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { session, profile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // Free access: no authentication check
  // Remove loading state

  return (
    <div className="min-h-screen bg-gradient-modern">
      <Sidebar user={profile} />
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col md:pl-64">
          <Navbar onOpenSidebar={() => {}} />
          <main className="flex-1 overflow-auto bg-gradient-modern">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
