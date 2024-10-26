import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Libros.module.css";

const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newLibro, setNewLibro] = useState({
    titulo: "",
    autor: "",
    fecha_publicacion: "",
    categoria_id: "",
    editorial: "",
    idioma: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [prestamoLibroId, setPrestamoLibroId] = useState(null);

  const fetchLibros = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/libros`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (Array.isArray(response.data)) {
        setLibros(response.data);
      } else {
        setError("La respuesta no es un array de libros.");
        setLibros([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al cargar los libros.");
      setLibros([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/categorias`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setCategorias(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al cargar las categorías.");
    }
  };

  const checkUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setIsAdmin(decoded.rol === "administrador");
    }
  };

  const handleAddLibro = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/libros`, newLibro, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setNewLibro({
        titulo: "",
        autor: "",
        fecha_publicacion: "",
        categoria_id: "",
        editorial: "",
        idioma: "",
      });
      fetchLibros();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al agregar el libro.");
    }
  };

  const handlePrestamo = async (libroId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/prestamos`,
        {
          usuario_id: JSON.parse(
            atob(localStorage.getItem("token").split(".")[1])
          ).usuario_id,
          libro_id: libroId,
          fecha_prestamo: new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setPrestamoLibroId(libroId);
      fetchLibros();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al realizar el préstamo.");
    }
  };

  const handleDeleteLibro = async (libroId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/libros/${libroId}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      fetchLibros();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al eliminar el libro.");
    }
  };

  const handleEditLibro = (libro) => {
    setNewLibro({
      titulo: libro.titulo,
      autor: libro.autor,
      fecha_publicacion: libro.fecha_publicacion.split("T")[0], // Convierte a YYYY-MM-DD
      categoria_id: libro.categoria_id,
      editorial: libro.editorial,
      idioma: libro.idioma,
    });
    setPrestamoLibroId(libro.libro_id);
  };

  const handleUpdateLibro = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/libros/${prestamoLibroId}`,
        newLibro,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setNewLibro({
        titulo: "",
        autor: "",
        fecha_publicacion: "",
        categoria_id: "",
        editorial: "",
        idioma: "",
      });
      setPrestamoLibroId(null);
      fetchLibros();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al actualizar el libro.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchLibros();
    fetchCategorias();
    checkUserRole();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Libros</h2>

      {loading ? (
        <div>Cargando libros...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          {isAdmin && (
            <form
              onSubmit={prestamoLibroId ? handleUpdateLibro : handleAddLibro}
              className={styles.form}
            >
              <h3>
                {prestamoLibroId ? "Editar Libro" : "Agregar Nuevo Libro"}
              </h3>
              <input
                type="text"
                placeholder="Título"
                value={newLibro.titulo}
                onChange={(e) =>
                  setNewLibro({ ...newLibro, titulo: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Autor"
                value={newLibro.autor}
                onChange={(e) =>
                  setNewLibro({ ...newLibro, autor: e.target.value })
                }
                required
              />
              <input
                type="date"
                placeholder="Fecha de Publicación"
                value={newLibro.fecha_publicacion}
                onChange={(e) =>
                  setNewLibro({
                    ...newLibro,
                    fecha_publicacion: e.target.value,
                  })
                }
                required
              />
              <select
                value={newLibro.categoria_id}
                onChange={(e) =>
                  setNewLibro({ ...newLibro, categoria_id: e.target.value })
                }
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria) => (
                  <option
                    key={categoria.categoria_id}
                    value={categoria.categoria_id}
                  >
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Editorial"
                value={newLibro.editorial}
                onChange={(e) =>
                  setNewLibro({ ...newLibro, editorial: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Idioma"
                value={newLibro.idioma}
                onChange={(e) =>
                  setNewLibro({ ...newLibro, idioma: e.target.value })
                }
              />
              <button type="submit">
                {prestamoLibroId ? "Actualizar Libro" : "Agregar Libro"}
              </button>
            </form>
          )}

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Fecha de Publicación</th>
                <th>Editorial</th>
                <th>Idioma</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {libros.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5}>No hay libros disponibles.</td>
                </tr>
              ) : (
                libros.map((libro) => (
                  <tr key={libro.libro_id}>
                    <td>{libro.titulo}</td>
                    <td>{libro.autor}</td>
                    <td>{formatDate(libro.fecha_publicacion)}</td>{" "}
                    {/* Formato de fecha */}
                    <td>{libro.editorial}</td>
                    <td>{libro.idioma}</td>
                    {isAdmin ? (
                      <td>
                        <button onClick={() => handleEditLibro(libro)}>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteLibro(libro.libro_id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    ) : (
                      <td>
                        <button onClick={() => handlePrestamo(libro.libro_id)}>
                          Prestar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Libros;
