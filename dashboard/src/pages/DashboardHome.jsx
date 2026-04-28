import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, FolderKanban, FileText, Users, Activity } from 'lucide-react';
import api from '../api/axios';

const DashboardHome = () => {
  // Fetch stats (we can use the total counts from the list endpoints)
  const { data: services } = useQuery({ queryKey: ['services'], queryFn: () => api.get('/services').then(res => res.data) });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => api.get('/projects').then(res => res.data) });
  const { data: blogs } = useQuery({ queryKey: ['blogs'], queryFn: () => api.get('/blogs').then(res => res.data) });
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: () => api.get('/teams').then(res => res.data) });

  const stats = [
    { name: 'Total Services', value: services?.total || 0, icon: Briefcase, color: 'bg-blue-500' },
    { name: 'Total Projects', value: projects?.total || 0, icon: FolderKanban, color: 'bg-emerald-500' },
    { name: 'Total Blogs', value: blogs?.total || 0, icon: FileText, color: 'bg-amber-500' },
    { name: 'Team Members', value: teams?.total || 0, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 flex items-center">
              <div className={`p-3 rounded-lg ${item.color} text-white mr-4`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
        </div>
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 mt-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">API Connection Active</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>The dashboard is successfully connected to the backend API at <span className="font-mono font-bold">{api.defaults.baseURL}</span>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
