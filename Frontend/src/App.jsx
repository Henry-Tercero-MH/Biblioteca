import "./App.css"; // Importa el archivo de estilos globales
import React from "react";
import { Link } from "react-router-dom";

const App = () => {
  return (
    <div id="app-container">
      {" "}
      {/* Cambié el id para ser más específico */}
      <h1>Bienvenido a la Aplicación</h1>
      <nav>
        <Link to="/login">Iniciar Sesión</Link>
        <Link to="/registro">Registrar</Link>
        <Link to="/categorias">Categorías</Link>
        <Link to="/libros">Ver Libros</Link>
      </nav>
    </div>
  );
};

export default App;
