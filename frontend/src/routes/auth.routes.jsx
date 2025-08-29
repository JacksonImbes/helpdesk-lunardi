import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* CORREÇÃO: Se um utilizador não logado tentar aceder a qualquer outra rota,
          ele será redirecionado para a página de login. */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}