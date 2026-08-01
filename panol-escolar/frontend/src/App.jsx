import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Retiro from './pages/Retiro';
import Devolucion from './pages/Devolucion';
import AdminDashboard from './pages/AdminDashboard';
import MenuPanolero from './pages/MenuPanolero';
import Inventario from './pages/Inventario';
import CargaHerramientas from './pages/CargaHerramientas';
import ModificacionHerramientas from './pages/ModificacionHerramientas';
import AdminUsuarios from './pages/AdminUsuarios';
import DesktopNav from './components/DesktopNav';
import './App.css';

function App() {
  return (
    <Router>
      <DesktopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/retiro" element={<Retiro />} />
        <Route path="/devolucion" element={<Devolucion />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/buscador" element={<Inventario />} />
        <Route path="/buscador" element={<Inventario />} />
        <Route path="/admin/inventario" element={<Inventario />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/admin/carga" element={<CargaHerramientas />} />
        <Route path="/carga" element={<CargaHerramientas />} />
        <Route path="/admin/modificaciones" element={<ModificacionHerramientas />} />
        <Route path="/modificaciones" element={<ModificacionHerramientas />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/usuarios" element={<AdminUsuarios />} />
        <Route path="/menu" element={<MenuPanolero />} />
      </Routes>
    </Router>
  );
}

export default App;
