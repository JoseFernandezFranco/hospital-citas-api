const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');
require('./seed');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const base = '/api';

function paginate(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const size = Math.min(Math.max(parseInt(req.query.size || '10', 10), 1), 100);
  const offset = (page - 1) * size;
  return { page: page, size: size, offset: offset };
}

function collectionLinks(req, page, size, total) {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl.split('?')[0]);
  const last = Math.max(Math.ceil(total / size), 1);
  const links = {};
  function mk(p) {
    const u = new URL(url);
    u.searchParams.set('page', p);
    u.searchParams.set('size', size);
    return u.toString();
  }
  links.self = mk(page);
  if (page > 1) {
    links.prev = mk(page - 1);
  }
  if (page < last) {
    links.next = mk(page + 1);
  }
  links.first = mk(1);
  links.last = mk(last);
  return links;
}

// Doctores endpoints
app.get(base + '/doctores', (req, res) => {
  const info = paginate(req);
  const page = info.page;
  const size = info.size;
  const offset = info.offset;
  const where = [];
  const params = [];
  if (req.query.especialidad) {
    where.push('especialidad = ?');
    params.push(req.query.especialidad);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare('SELECT COUNT(*) AS c FROM doctores ' + whereSql).get(...params).c;
  const rows = db.prepare('SELECT * FROM doctores ' + whereSql + ' LIMIT ? OFFSET ?').all(...params, size, offset);
  res.json({ data: rows, page: page, size: size, total: total, _links: collectionLinks(req, page, size, total) });
});

app.post(base + '/doctores', (req, res) => {
  const nombre = req.body.nombre;
  const especialidad = req.body.especialidad;
  const sala_consulta = req.body.sala_consulta || null;
  const info = db.prepare('INSERT INTO doctores (nombre, especialidad, sala_consulta) VALUES (?, ?, ?)').run(nombre, especialidad, sala_consulta);
  const item = db.prepare('SELECT * FROM doctores WHERE id_doctor = ?').get(info.lastInsertRowid);
  res.status(201).location(base + '/doctores/' + item.id_doctor).json(item);
});

app.get(base + '/doctores/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM doctores WHERE id_doctor = ?').get(req.params.id);
  if (!item) {
    return res.sendStatus(404);
  }
  res.json(item);
});

app.put(base + '/doctores/:id', (req, res) => {
  const prev = db.prepare('SELECT * FROM doctores WHERE id_doctor = ?').get(req.params.id);
  if (!prev) {
    return res.sendStatus(404);
  }
  const nombre = req.body.nombre !== undefined ? req.body.nombre : prev.nombre;
  const especialidad = req.body.especialidad !== undefined ? req.body.especialidad : prev.especialidad;
  const sala_consulta = req.body.sala_consulta !== undefined ? req.body.sala_consulta : prev.sala_consulta;
  db.prepare('UPDATE doctores SET nombre=?, especialidad=?, sala_consulta=? WHERE id_doctor=?').run(nombre, especialidad, sala_consulta, req.params.id);
  const updated = db.prepare('SELECT * FROM doctores WHERE id_doctor = ?').get(req.params.id);
  res.json(updated);
});

app.delete(base + '/doctores/:id', (req, res) => {
  db.prepare('DELETE FROM doctores WHERE id_doctor=?').run(req.params.id);
  res.sendStatus(204);
});

// Pacientes endpoints
app.get(base + '/pacientes', (req, res) => {
  const info = paginate(req);
  const page = info.page;
  const size = info.size;
  const offset = info.offset;
  const total = db.prepare('SELECT COUNT(*) AS c FROM pacientes').get().c;
  const rows = db.prepare('SELECT * FROM pacientes LIMIT ? OFFSET ?').all(size, offset);
  res.json({ data: rows, page: page, size: size, total: total, _links: collectionLinks(req, page, size, total) });
});

app.post(base + '/pacientes', (req, res) => {
  const nombre = req.body.nombre;
  const dni = req.body.dni;
  const contacto = req.body.contacto || null;
  const numero_sanitario = req.body.numero_sanitario || null;
  const info = db.prepare('INSERT INTO pacientes (nombre, dni, contacto, numero_sanitario) VALUES (?, ?, ?, ?)').run(nombre, dni, contacto, numero_sanitario);
  const item = db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(info.lastInsertRowid);
  res.status(201).location(base + '/pacientes/' + item.id_paciente).json(item);
});

app.get(base + '/pacientes/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(req.params.id);
  if (!item) {
    return res.sendStatus(404);
  }
  res.json(item);
});

app.put(base + '/pacientes/:id', (req, res) => {
  const prev = db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(req.params.id);
  if (!prev) {
    return res.sendStatus(404);
  }
  const nombre = req.body.nombre !== undefined ? req.body.nombre : prev.nombre;
  const dni = req.body.dni !== undefined ? req.body.dni : prev.dni;
  const contacto = req.body.contacto !== undefined ? req.body.contacto : prev.contacto;
  const numero_sanitario = req.body.numero_sanitario !== undefined ? req.body.numero_sanitario : prev.numero_sanitario;
  db.prepare('UPDATE pacientes SET nombre=?, dni=?, contacto=?, numero_sanitario=? WHERE id_paciente=?').run(nombre, dni, contacto, numero_sanitario, req.params.id);
  const updated = db.prepare('SELECT * FROM pacientes WHERE id_paciente = ?').get(req.params.id);
  res.json(updated);
});

app.delete(base + '/pacientes/:id', (req, res) => {
  db.prepare('DELETE FROM pacientes WHERE id_paciente=?').run(req.params.id);
  res.sendStatus(204);
});

// Citas endpoints
app.get(base + '/citas', (req, res) => {
  const info = paginate(req);
  const page = info.page;
  const size = info.size;
  const offset = info.offset;
  const where = [];
  const params = [];
  if (req.query.fecha) {
    where.push('fecha = ?');
    params.push(req.query.fecha);
  }
  if (req.query.estado) {
    where.push('estado = ?');
    params.push(req.query.estado);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = db.prepare('SELECT COUNT(*) AS c FROM citas ' + whereSql).get(...params).c;
  const rows = db.prepare('SELECT * FROM citas ' + whereSql + ' ORDER BY fecha, hora LIMIT ? OFFSET ?').all(...params, size, offset);
  res.json({ data: rows, page: page, size: size, total: total, _links: collectionLinks(req, page, size, total) });
});

app.post(base + '/citas', (req, res) => {
  const id_doctor = req.body.id_doctor;
  const id_paciente = req.body.id_paciente;
  const fecha = req.body.fecha;
  const hora = req.body.hora;
  const estado = req.body.estado || 'pendiente';
  const info = db.prepare('INSERT INTO citas (id_doctor, id_paciente, fecha, hora, estado) VALUES (?, ?, ?, ?, ?)').run(id_doctor, id_paciente, fecha, hora, estado);
  const item = db.prepare('SELECT * FROM citas WHERE id_cita = ?').get(info.lastInsertRowid);
  res.status(201).location(base + '/citas/' + item.id_cita).json(item);
});

app.get(base + '/citas/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM citas WHERE id_cita = ?').get(req.params.id);
  if (!item) {
    return res.sendStatus(404);
  }
  res.json(item);
});

app.put(base + '/citas/:id', (req, res) => {
  const prev = db.prepare('SELECT * FROM citas WHERE id_cita = ?').get(req.params.id);
  if (!prev) {
    return res.sendStatus(404);
  }
  const id_doctor = req.body.id_doctor !== undefined ? req.body.id_doctor : prev.id_doctor;
  const id_paciente = req.body.id_paciente !== undefined ? req.body.id_paciente : prev.id_paciente;
  const fecha = req.body.fecha !== undefined ? req.body.fecha : prev.fecha;
  const hora = req.body.hora !== undefined ? req.body.hora : prev.hora;
  const estado = req.body.estado !== undefined ? req.body.estado : prev.estado;
  db.prepare('UPDATE citas SET id_doctor=?, id_paciente=?, fecha=?, hora=?, estado=? WHERE id_cita=?').run(id_doctor, id_paciente, fecha, hora, estado, req.params.id);
  const updated = db.prepare('SELECT * FROM citas WHERE id_cita = ?').get(req.params.id);
  res.json(updated);
});

app.delete(base + '/citas/:id', (req, res) => {
  db.prepare('DELETE FROM citas WHERE id_cita=?').run(req.params.id);
  res.sendStatus(204);
});

app.post(base + '/citas/:id/reprogramar', (req, res) => {
  const nueva_fecha = req.body.nueva_fecha;
  const nueva_hora = req.body.nueva_hora;
  const prev = db.prepare('SELECT * FROM citas WHERE id_cita = ?').get(req.params.id);
  if (!prev) {
    return res.sendStatus(404);
  }
  const fecha = nueva_fecha || prev.fecha;
  const hora = nueva_hora || prev.hora;
  db.prepare('UPDATE citas SET fecha=?, hora=? WHERE id_cita=?').run(fecha, hora, req.params.id);
  const updated = db.prepare('SELECT * FROM citas WHERE id_cita = ?').get(req.params.id);
  res.json(updated);
});

app.post(base + '/citas/:id/recordatorio', (req, res) => {
  const prev = db.prepare('SELECT * FROM citas WHERE id_cita = ?').get(req.params.id);
  if (!prev) {
    return res.sendStatus(404);
  }
  res.status(202).json({ mensaje: 'Recordatorio en cola', cita: prev.id_cita });
});

app.get(base + '/doctores/:id/citas', (req, res) => {
  const rows = db.prepare('SELECT * FROM citas WHERE id_doctor = ? ORDER BY fecha, hora').all(req.params.id);
  res.json({ data: rows });
});

app.get(base + '/pacientes/:id/citas', (req, res) => {
  const rows = db.prepare('SELECT * FROM citas WHERE id_paciente = ? ORDER BY fecha, hora').all(req.params.id);
  res.json({ data: rows });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('API running on http://localhost:' + PORT);
});
