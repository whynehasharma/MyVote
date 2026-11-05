import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Vote, BarChart3, FileText, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) return null;

  return (
    <nav className="nav-links mobile-nav" style={{ display: 'none' }} aria-label="Mobile Navigation">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </NavLink>

      {isAdmin && (
        <>
          <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={16} />
            <span>Users</span>
          </NavLink>
          <NavLink to="/elections" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Vote size={16} />
            <span>Elections</span>
          </NavLink>
          <NavLink to="/audit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={16} />
            <span>Audit</span>
          </NavLink>
        </>
      )}

      <NavLink to="/vote" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Vote size={16} />
        <span>Vote</span>
      </NavLink>
      <NavLink to="/results" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart3 size={16} />
        <span>Results</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={16} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
