import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Libros from "./pages/Libros";
import Categorias from "./pages/Categorias";
import "./index.css"; // Asegúrate de importar tus estilos globales aquí

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/libros" element={<Libros />} />
        <Route path="/categorias" element={<Categorias />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
