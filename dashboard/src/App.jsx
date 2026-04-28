import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import ServicesList from './pages/services/ServicesList';
import ProjectsList from './pages/projects/ProjectsList';
import BlogsList from './pages/blogs/BlogsList';
import TeamsList from './pages/teams/TeamsList';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!admin) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="services" element={<ServicesList />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="blogs" element={<BlogsList />} />
          <Route path="teams" element={<TeamsList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
