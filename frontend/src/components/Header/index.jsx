import React from 'react';
import { FiMenu } from 'react-icons/fi';
import './styles.css';

// Recebe a função para abrir/fechar a sidebar como propriedade
const Header = ({ toggleSidebar }) => {
  return (
    <header className="header-container">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FiMenu size={24} />
      </button>
      {/* Futuramente, podemos adicionar o nome do usuário logado ou o título da página aqui */}
    </header>
  );
};

export default Header;