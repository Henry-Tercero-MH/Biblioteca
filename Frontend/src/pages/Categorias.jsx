import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Categorias.module.css";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [newCategoria, setNewCategoria] = useState("");
  const [editCategoria, setEditCategoria] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Función para cargar las categorías
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
      setCategorias(response.data); // Almacena las categorías en el estado
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al cargar las categorías.");
    }
  };

  useEffect(() => {
    fetchCategorias(); // Llama a la función para obtener las categorías
  }, []);

  const handleAddCategoria = async (e) => {
    e.preventDefault();
    if (!newCategoria.trim()) return; // Evita agregar categorías vacías

    // Verifica si la categoría ya existe
    const exists = categorias.some(
      (cat) => cat.nombre_categoria.toLowerCase() === newCategoria.toLowerCase()
    );

    if (exists) {
      setError("La categoría ya existe.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/categorias`,
        { nombre_categoria: newCategoria },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      // Actualiza el estado con la nueva categoría
      setCategorias((prevCategorias) => [...prevCategorias, response.data]);
      setNewCategoria(""); // Limpia el formulario
      setError(""); // Limpia el error
      setSuccess("Categoría agregada exitosamente.");

      // Vuelve a cargar las categorías
      fetchCategorias();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al agregar la categoría.");
      setSuccess("");
    }
  };

  const handleEditCategoria = (categoria) => {
    setEditCategoria(categoria);
    setNewCategoria(categoria.nombre_categoria); // Carga el nombre en el formulario
  };

  const handleUpdateCategoria = async (e) => {
    e.preventDefault();
    if (!newCategoria.trim()) return; // Evita actualizar con nombre vacío

    // Verifica si la categoría ya existe, excluyendo la que se está editando
    const exists = categorias.some(
      (cat) =>
        cat.nombre_categoria.toLowerCase() === newCategoria.toLowerCase() &&
        cat.categoria_id !== editCategoria.categoria_id // Asegúrate de que no sea la misma
    );

    if (exists) {
      setError("La categoría ya existe.");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/categorias/${
          editCategoria.categoria_id
        }`,
        { nombre_categoria: newCategoria },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      // Actualiza el estado con la categoría editada
      setCategorias((prevCategorias) =>
        prevCategorias.map((cat) =>
          cat.categoria_id === response.data.categoria_id ? response.data : cat
        )
      );

      setEditCategoria(null); // Limpia el estado de edición
      setNewCategoria(""); // Limpia el formulario
      setError(""); // Limpia el error
      setSuccess("Categoría actualizada exitosamente.");

      // Vuelve a cargar las categorías
      fetchCategorias();
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Error al actualizar la categoría.");
      setSuccess("");
    }
  };

  const handleDeleteCategoria = async (categoria_id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/categorias/${categoria_id}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        // Actualiza el estado eliminando la categoría
        setCategorias((prevCategorias) =>
          prevCategorias.filter((cat) => cat.categoria_id !== categoria_id)
        );
        setError(""); // Limpia el error
        setSuccess("Categoría eliminada exitosamente.");

        // Vuelve a cargar las categorías
        fetchCategorias();
      } catch (err) {
        console.error(err);
        setError(err.response?.data || "Error al eliminar la categoría.");
        setSuccess("");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2>Categorías</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <form
        onSubmit={editCategoria ? handleUpdateCategoria : handleAddCategoria}
        className={styles.form}
      >
        <label htmlFor="nueva-categoria">
          {editCategoria ? "Editar Categoría:" : "Nueva Categoría:"}
        </label>
        <input
          type="text"
          id="nueva-categoria"
          placeholder="Nombre de la Categoría"
          value={newCategoria}
          onChange={(e) => setNewCategoria(e.target.value)}
          required
        />
        <button type="submit">
          {editCategoria ? "Actualizar Categoría" : "Agregar Categoría"}
        </button>
      </form>
      <section className={styles.categoriaList}>
        {categorias.map((categoria) => (
          <div key={categoria.categoria_id} className={styles.categoriaItem}>
            <span>{categoria.nombre_categoria}</span>
            <div>
              <button onClick={() => handleEditCategoria(categoria)}>
                Editar
              </button>
              <button
                onClick={() => handleDeleteCategoria(categoria.categoria_id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Categorias;
