# Hospital Citas API

Esta API proporciona un servicio REST para gestionar las citas médicas de un hospital. Está basada en Node.js con Express y almacena sus datos en una base de datos SQLite mediante la librería `better-sqlite3`.

## Ejecución local

Instala las dependencias y arranca el servidor en modo desarrollo:

```bash
npm ci
npm run dev
# El servicio estará disponible en http://localhost:3000/health
```

Para un entorno de producción, ejecuta:

```bash
npm start
```

## Endpoints principales

Las rutas se sirven bajo el prefijo `/api` y permiten operaciones CRUD sobre doctores, pacientes y citas. También se proporcionan operaciones no-CRUD para reprogramar citas y enviar recordatorios.

**Colección de doctores**

| Verbo | URI                          | Descripción                             |
|------|------------------------------|-----------------------------------------|
| GET  | `/api/doctores`             | Lista doctores, con filtros opcionales  |
| POST | `/api/doctores`             | Crea un nuevo doctor                    |
| GET  | `/api/doctores/{id}`        | Obtiene un doctor por id                |
| PUT  | `/api/doctores/{id}`        | Actualiza un doctor existente           |
| DELETE | `/api/doctores/{id}`      | Elimina un doctor por id                |

**Colección de pacientes**

| Verbo | URI                          | Descripción                             |
|------|------------------------------|-----------------------------------------|
| GET  | `/api/pacientes`           | Lista pacientes                         |
| POST | `/api/pacientes`           | Crea un nuevo paciente                  |
| GET  | `/api/pacientes/{id}`      | Obtiene un paciente por id              |
| PUT  | `/api/pacientes/{id}`      | Actualiza un paciente existente         |
| DELETE | `/api/pacientes/{id}`    | Elimina un paciente por id              |

**Colección de citas**

| Verbo | URI                          | Descripción                             |
|------|------------------------------|-----------------------------------------|
| GET  | `/api/citas`              | Lista citas, con filtros opcionales     |
| POST | `/api/citas`              | Crea una nueva cita                     |
| GET  | `/api/citas/{id}`         | Obtiene una cita por id                 |
| PUT  | `/api/citas/{id}`         | Actualiza una cita existente            |
| DELETE | `/api/citas/{id}`       | Elimina una cita por id                 |
| POST | `/api/citas/{id}/reprogramar` | Reprograma la fecha u hora de una cita |
| POST | `/api/citas/{id}/recordatorio` | Envía un recordatorio (simulado)        |

### Paginación y enlaces

Los endpoints que devuelven colecciones aceptan los parámetros `page` y `size` para paginación. Las respuestas incluyen un objeto `_links` con enlaces HATEOAS a `first`, `last`, `prev`, `next` y `self`.