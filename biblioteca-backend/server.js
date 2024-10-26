const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.stack);
    return;
  }
  console.log("Conectado a la base de datos MySQL.");
});

// Rutas de la API

// Registro de usuario
app.post("/usuarios", async (req, res) => {
  const { nombre_usuario, password, email, rol } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO Usuarios (nombre_usuario, password, email, rol) VALUES (?, ?, ?, ?)",
    [nombre_usuario, hashedPassword, email, rol],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res
        .status(201)
        .send({ message: "Usuario creado", usuario_id: result.insertId });
    }
  );
});

// Inicio de sesión
app.post("/login", (req, res) => {
  const { nombre_usuario, password } = req.body;

  db.query(
    "SELECT * FROM Usuarios WHERE nombre_usuario = ?",
    [nombre_usuario],
    async (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0)
        return res.status(401).send("Usuario no encontrado");

      const usuario = results[0];
      const match = await bcrypt.compare(password, usuario.password);
      if (!match) return res.status(401).send("Contraseña incorrecta");

      const token = jwt.sign(
        { usuario_id: usuario.usuario_id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    }
  );
});

// Middleware de autorización
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.usuario.rol)) {
      return res.status(401).send("No autorizado");
    }
    next();
  };
};

// Proteger las rutas
app.use((req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Acceso denegado");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send("Token inválido");
    req.usuario = decoded;
    next();
  });
});

// Obtener todos los libros
app.get("/libros", (req, res) => {
  db.query("SELECT * FROM Libros", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Agregar un nuevo libro
app.post("/libros", authorize(["administrador"]), (req, res) => {
  const { titulo, autor, fecha_publicacion, categoria_id, editorial, idioma } =
    req.body;
  db.query(
    "INSERT INTO Libros (titulo, autor, fecha_publicacion, categoria_id, editorial, idioma) VALUES (?, ?, ?, ?, ?, ?)",
    [titulo, autor, fecha_publicacion, categoria_id, editorial, idioma],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res
        .status(201)
        .send({ message: "Libro creado", libro_id: result.insertId });
    }
  );
});

// Actualizar un libro
app.put("/libros/:id", authorize(["administrador"]), (req, res) => {
  const { id } = req.params;
  const { titulo, autor, fecha_publicacion, categoria_id, editorial, idioma } =
    req.body;

  db.query(
    "UPDATE Libros SET titulo = ?, autor = ?, fecha_publicacion = ?, categoria_id = ?, editorial = ?, idioma = ? WHERE libro_id = ?",
    [titulo, autor, fecha_publicacion, categoria_id, editorial, idioma, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "Libro actualizado" });
    }
  );
});

// Eliminar un libro
app.delete("/libros/:id", authorize(["administrador"]), (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Libros WHERE libro_id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Libro eliminado" });
  });
});
// Obtener todas las categorías
app.get("/categorias", (req, res) => {
  db.query("SELECT * FROM Categorias", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Agregar una nueva categoría
app.post("/categorias", authorize(["administrador"]), (req, res) => {
  const { nombre_categoria } = req.body;

  db.query(
    "INSERT INTO Categorias (nombre_categoria) VALUES (?)",
    [nombre_categoria],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res
        .status(201)
        .send({ message: "Categoría creada", categoria_id: result.insertId });
    }
  );
});

// Actualizar una categoría
app.put("/categorias/:id", authorize(["administrador"]), (req, res) => {
  const { id } = req.params;
  const { nombre_categoria } = req.body;

  db.query(
    "UPDATE Categorias SET nombre_categoria = ? WHERE categoria_id = ?",
    [nombre_categoria, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "Categoría actualizada" });
    }
  );
});

// Eliminar una categoría
app.delete("/categorias/:id", authorize(["administrador"]), (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Categorias WHERE categoria_id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Categoría eliminada" });
  });
});
// Agregar un nuevo préstamo
app.post("/prestamos", (req, res) => {
  const { usuario_id, libro_id, fecha_prestamo } = req.body;

  db.query(
    "INSERT INTO Prestamos (usuario_id, libro_id, fecha_prestamo, estado) VALUES (?, ?, ?, 'prestado')",
    [usuario_id, libro_id, fecha_prestamo],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res
        .status(201)
        .send({ message: "Préstamo creado", prestamo_id: result.insertId });
    }
  );
});

// Obtener todos los préstamos
app.get("/prestamos", (req, res) => {
  db.query("SELECT * FROM Prestamos", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Obtener todos los préstamos de un usuario específico
app.get("/prestamos/usuario/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;

  db.query(
    "SELECT * FROM Prestamos WHERE usuario_id = ?",
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// Actualizar estado a devuelto (actualizar estado y fecha_devolucion)
app.put("/prestamos/:id/devolver", (req, res) => {
  const { id } = req.params;
  const { fecha_devolucion } = req.body;

  db.query(
    "UPDATE Prestamos SET estado = 'devuelto', fecha_devolucion = ? WHERE prestamo_id = ?",
    [fecha_devolucion, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "Préstamo actualizado como devuelto" });
    }
  );
});

// Eliminar un préstamo
app.delete("/prestamos/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Prestamos WHERE prestamo_id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "Préstamo eliminado" });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
