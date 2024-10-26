import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/Registro.module.css";

const Registro = () => {
  const [nombre_usuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("usuario_regular");
  const [error, setError] = useState("");

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/usuarios`, {
        nombre_usuario,
        password,
        email,
        rol,
      });
      window.location.href = "/login"; // Redirigir a la página de inicio de sesión
    } catch (err) {
      setError("Error al registrar el usuario.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Registro</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleRegistro}>
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className={styles.field}>
          <label htmlFor="rol">Rol</label>
          <select id="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="usuario_regular">Usuario Regular</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Registro;
