import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Requiere tener react-router-dom instalado
import styles from "../styles/Login.module.css";

const Login = () => {
  const [nombre_usuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores anteriores
    setLoading(true); // Indicar que la solicitud está en curso

    if (!nombre_usuario || !password) {
      setError("Por favor, rellena todos los campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { nombre_usuario, password }
      );
      localStorage.setItem("token", response.data.token);
      navigate("/libros"); // Redirigir a la página de libros
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else if (err.response) {
        setError(err.response.data.message || "Error inesperado.");
      } else {
        setError("Error inesperado, por favor intenta más tarde.");
      }
    } finally {
      setLoading(false); // Detener el indicador de carga
    }
  };

  return (
    <div className={styles.container}>
      <h2>Iniciar Sesión</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div className={styles.field}>
          <label htmlFor="nombre_usuario">Nombre de Usuario</label>
          <input
            type="text"
            id="nombre_usuario"
            value={nombre_usuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};

export default Login;
