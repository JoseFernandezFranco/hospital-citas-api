const db = require('./db');

/**
 * Populate the database with initial doctors and patients if none exist.
 */
function seed() {
  // Seed doctors
  const doctorCount = db.prepare('SELECT COUNT(*) AS c FROM doctores').get().c;
  if (doctorCount === 0) {
    const insD = db.prepare('INSERT INTO doctores (nombre, especialidad, sala_consulta) VALUES (?, ?, ?)');
    insD.run('Dr. Pérez', 'Cardiología', 'C-101');
    insD.run('Dra. Sánchez', 'Pediatría', 'P-204');
  }

  // Seed patients
  const pacienteCount = db.prepare('SELECT COUNT(*) AS c FROM pacientes').get().c;
  if (pacienteCount === 0) {
    const insP = db.prepare('INSERT INTO pacientes (nombre, dni, contacto, numero_sanitario) VALUES (?, ?, ?, ?)');
    insP.run('Juan López', '12345678A', 'juan@example.com', 'SNS-0001');
    insP.run('María Ruiz', '87654321B', 'maria@example.com', 'SNS-0002');
  }
}

seed();
console.log('Seed database executed successfully.');
