import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiHardDrive, FiUsers, FiLogOut, FiSettings, FiChevronDown, FiArchive } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import logoBranca from '../../assets/images/logo_rodape.png';
import './styles.css';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { signOut, user } = useAuth();
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <aside className="sidebar-container">
        <div className="sidebar-header">
          <img src={logoBranca} alt="Transportadora Lunardi" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end><FiGrid size={20} /><span>Dashboard</span></NavLink>
          <NavLink to="/inventario"><FiArchive size={20} /><span>Inventário</span></NavLink>

          {/* MENU COM SUBMENU */}
          {user.role === 'admin' && (
            <div className="submenu-container">
              <button className="submenu-toggle" onClick={() => setSettingsOpen(!isSettingsOpen)}>
                <div className="submenu-title">
                  <FiSettings size={20} />
                  <span>Configurações</span>
                </div>
                <FiChevronDown className={`submenu-arrow ${isSettingsOpen ? 'open' : ''}`} />
              </button>
              {isSettingsOpen && (
                <div className="submenu-items">
                  <NavLink to="/usuarios"><FiUsers size={20} /><span>Utilizadores</span></NavLink>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={signOut} className="logout-button">
            <FiLogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="sidebar-overlay" onClick={toggleSidebar}></div>
    </>
  );
}