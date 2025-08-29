import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import ChamadoDetalhe from '../pages/ChamadoDetalhe';
import Inventario from '../pages/Inventario';
import Usuarios from '../pages/Usuarios'; 

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chamado/:id" element={<ChamadoDetalhe />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}