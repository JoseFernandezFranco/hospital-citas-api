const Database = require('better-sqlite3');
const db = new Database('data/app.db');

// Configure WAL journaling mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables if they do not exist
db.exec(
  "CREATE TABLE IF NOT EXISTS doctores (" +
  " id_doctor INTEGER PRIMARY KEY AUTOINCREMENT," +
  " nombre TEXT NOT NULL," +
  " especialidad TEXT NOT NULL," +
  " sala_consulta TEXT" +
  ");" +
  "CREATE TABLE IF NOT EXISTS pacientes (" +
  " id_paciente INTEGER PRIMARY KEY AUTOINCREMENT," +
  " nombre TEXT NOT NULL," +
  " dni TEXT UNIQUE NOT NULL," +
  " contacto TEXT," +
  " numero_sanitario TEXT" +
  ");" +
  "CREATE TABLE IF NOT EXISTS citas (" +
  " id_cita INTEGER PRIMARY KEY AUTOINCREMENT," +
  " id_doctor INTEGER NOT NULL," +
  " id_paciente INTEGER NOT NULL," +
  " fecha TEXT NOT NULL," +
  " hora TEXT NOT NULL," +
  " estado TEXT NOT NULL DEFAULT 'pendiente'," +
  " FOREIGN KEY (id_doctor) REFERENCES doctores(id_doctor)," +
  " FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)" +
  ");"
);

module.exports = db;
