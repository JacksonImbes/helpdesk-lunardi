import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiHardDrive, FiUsers, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import logoBranca from '../../assets/images/logo_rodape.png';
import './styles.css';

export default function Sidebar() {
  const { signOut, user } = useAuth(); // Pegamos os dados completos do utilizador logado
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Verificação de segurança: se o utilizador ainda não carregou, não mostra nada
  if (!user) {
    return null;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoBranca} alt="Transportadora Lunardi" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end><FiGrid size={20} /><span>Dashboard</span></NavLink>
        <NavLink to="/inventario"><FiHardDrive size={20} /><span>Inventário</span></NavLink>
        
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
  );
}