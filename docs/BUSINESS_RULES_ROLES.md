# Reglas de Negocio - Roles y Permisos

## 📋 Resumen

Este documento define las reglas de negocio para el sistema de roles en la aplicación Nexus AAAIMX. El sistema utiliza un modelo simplificado basado únicamente en roles, sin permisos granulares adicionales.

## 🎯 Roles del Sistema

### 1. **committee** - Comité Directivo

**Nivel de Acceso:** Máximo

**Capacidades:**

- ✅ **CRUD completo** de eventos en toda la aplicación
- ✅ **CRUD completo** de proyectos en toda la aplicación
- ✅ **CRUD completo** de clubs y divisiones
- ✅ **CRUD completo** de membresías de usuarios en divisiones y clubs
- ✅ **Gestión completa** de solicitudes para divisiones, clubs y proyectos
- ✅ **Acceso administrativo** a todas las funcionalidades del sistema

**Alcance:** Aplicación completa

---

### 2. **president** - Presidente

**Nivel de Acceso:** Máximo

**Capacidades:**

- ✅ **CRUD completo** de eventos en toda la aplicación
- ✅ **CRUD completo** de proyectos en toda la aplicación
- ✅ **CRUD completo** de clubs y divisiones
- ✅ **CRUD completo** de membresías de usuarios en divisiones y clubs
- ✅ **Gestión completa** de solicitudes para divisiones, clubs y proyectos
- ✅ **Acceso administrativo** a todas las funcionalidades del sistema

**Alcance:** Aplicación completa

---

### 3. **leader** - Líder

**Nivel de Acceso:** Alto (Limitado por organización)

**Capacidades:**

- ✅ **CRUD de eventos** de su división o club
- ✅ **CRUD de proyectos** de su división o club
- ✅ **CRUD de membresías** de usuarios en su división o club
- ✅ **Gestión de solicitudes** para su división, club y proyectos asociados
- ✅ **Liderazgo** de un club o división

**Alcance:** Su división o club asignado

**Restricciones:**

- ❌ Solo puede liderar **un solo** club o división
- ❌ No puede acceder a eventos/proyectos de otras divisiones/clubs
- ❌ No puede gestionar solicitudes fuera de su ámbito

---

### 4. **co-leader** - Co-líder

**Nivel de Acceso:** Medio-Alto (Limitado por organización)

**Capacidades:**

- ✅ **CRUD de eventos** de su división o club
- ✅ **CRUD de proyectos** de su división o club
- ✅ **CRUD de membresías** de usuarios en su división o club
- ✅ **Gestión de solicitudes** para su división, club y proyectos asociados

**Alcance:** Su división o club asignado

**Restricciones:**

- ❌ Solo puede liderar **un solo** club o división
- ❌ No puede acceder a eventos/proyectos de otras organizaciones
- ❌ No puede gestionar solicitudes fuera de su ámbito

---

### 5. **senior member** - Miembro Senior

**Nivel de Acceso:** Medio

**Capacidades:**

- ✅ **Visualización** de eventos y proyectos
- ✅ **Participación** en eventos y proyectos
- ✅ **Membresía** en múltiples divisiones y clubs
- ✅ **Liderazgo** de uno o más proyectos

**Alcance:** Divisiones y clubs donde es miembro

**Restricciones:**

- ❌ No puede crear eventos o proyectos
- ❌ No puede gestionar membresías de otros usuarios
- ❌ No puede gestionar solicitudes

---

### 6. **member** - Miembro

**Nivel de Acceso:** Básico

**Capacidades:**

- ✅ **Visualización** de eventos y proyectos
- ✅ **Participación** en eventos y proyectos
- ✅ **Membresía** en múltiples divisiones y clubs

**Alcance:** Divisiones y clubs donde es miembro

**Restricciones:**

- ❌ No puede crear eventos o proyectos
- ❌ No puede gestionar membresías de otros usuarios
- ❌ No puede gestionar solicitudes
- ❌ No puede liderar proyectos

---

## 🔄 Matriz de Permisos

| Funcionalidad                         | committee | president | leader | co-leader | senior member | member |
| ------------------------------------- | --------- | --------- | ------ | --------- | ------------- | ------ |
| **Eventos**                           |
| Crear eventos (global)                | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Crear eventos (propio ámbito)         | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Editar eventos (global)               | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Editar eventos (propio ámbito)        | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Eliminar eventos (global)             | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Eliminar eventos (propio ámbito)      | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Ver eventos                           | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| Participar en eventos                 | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| **Proyectos**                         |
| Crear proyectos (global)              | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Crear proyectos (propio ámbito)       | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Editar proyectos (global)             | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Editar proyectos (propio ámbito)      | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Eliminar proyectos (global)           | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Eliminar proyectos (propio ámbito)    | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Ver proyectos                         | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| Participar en proyectos               | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| Liderar proyectos                     | ✅        | ✅        | ✅     | ✅        | ✅            | ❌     |
| **Membresías**                        |
| Gestionar membresías (global)         | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Gestionar membresías (propio ámbito)  | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Ver membresías                        | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| **Solicitudes**                       |
| Gestionar solicitudes (global)        | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Gestionar solicitudes (propio ámbito) | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Crear solicitudes                     | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| Ver propias solicitudes               | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| **Clubs y Divisiones**                |
| Crear clubs/divisiones                | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Editar clubs/divisiones               | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Eliminar clubs/divisiones             | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Ver catálogo clubs/divisiones         | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |

## 🏗️ Implementación Técnica

### Validaciones de Negocio

1. **Un usuario puede tener múltiples roles** simultáneamente
2. **Los permisos se calculan** basándose en el rol con mayor nivel de acceso
3. **El ámbito de acceso** se determina por las divisiones/clubs donde el usuario tiene membresía
4. **Las restricciones de co-leader** se validan a nivel de aplicación

## 🔒 Reglas de Seguridad

### Principio de Menor Privilegio

- Los usuarios solo pueden acceder a recursos dentro de su ámbito asignado
- Las operaciones administrativas requieren roles específicos
- La creación de contenido está restringida por rol y ámbito

### Validación de Contexto

- **Líder/Co-líder**: Solo pueden gestionar recursos de sus divisiones/clubs asignados
- **Senior Member**: Solo puede liderar proyectos donde es miembro
- **Member**: Solo puede participar en recursos donde es miembro

## 👥 Gestión de Roles de Usuarios

### Reglas de Asignación de Roles

El sistema implementa una jerarquía de roles que determina quién puede editar los roles de otros usuarios:

#### 1. **President** - Presidente

- ✅ **Puede editar roles de TODOS los usuarios**
- ✅ **Alcance global** - Sin restricciones de división/club
- ✅ **Puede asignar cualquier rol** incluyendo president y committee

#### 2. **Committee** - Comité Directivo

- ✅ **Puede editar roles de TODOS los usuarios EXCEPTO president**
- ✅ **Alcance global** - Sin restricciones de división/club
- ✅ **Puede asignar roles**: committee, leader, co-leader, member, senior member

#### 3. **Leader** - Líder

- ✅ **Puede editar roles SOLO de usuarios de su misma división/club**
- ❌ **NO puede editar roles de**: president, committee
- ✅ **Puede asignar roles**: leader, co-leader, member, senior member
- 🔒 **Restricción de alcance**: Solo usuarios de su división o club

#### 4. **Co-leader** - Co-líder

- ✅ **Puede editar roles SOLO de usuarios de su misma división/club**
- ❌ **NO puede editar roles de**: president, committee
- ✅ **Puede asignar roles**: leader, co-leader, member, senior member
- 🔒 **Restricción de alcance**: Solo usuarios de su división o club

#### 5. **Member** - Miembro

- ❌ **NO puede editar roles de otros usuarios**
- ❌ **Sin permisos de gestión de roles**

#### 6. **Senior Member** - Miembro Senior

- ❌ **NO puede editar roles de otros usuarios**
- ❌ **Sin permisos de gestión de roles**

### Reglas de Validación

#### Prevención de Auto-promoción

- Los usuarios **NO pueden promoverse a sí mismos** a un rol de mayor jerarquía
- Un leader no puede cambiarse a committee o president
- Un co-leader no puede cambiarse a leader (a menos que sea asignado por alguien con permisos)

#### Validación de Alcance

- **Leaders y Co-leaders** solo pueden gestionar usuarios que compartan al menos una división o club
- Si no hay división/club compartido, la operación es rechazada con error 403

#### Jerarquía de Roles

```
President (Nivel 1) - Máxima autoridad
    ↓
Committee (Nivel 2) - Autoridad administrativa
    ↓
Leader/Co-leader (Nivel 3) - Autoridad local
    ↓
Member/Senior Member (Nivel 4) - Sin autoridad de gestión
```

### Endpoints de Gestión de Roles

#### GET `/api/roles/assignable`

- Retorna los roles que el usuario actual puede asignar
- Basado en las reglas de jerarquía definidas
- Respuesta filtrada según permisos del usuario

#### GET `/api/roles/users`

- Lista usuarios con sus roles para interfaz de gestión
- Filtros disponibles: por división, club, o rol específico
- Paginación incluida para manejo eficiente de datos

#### PUT `/api/roles/assign`

- Asigna un nuevo rol a un usuario
- Valida permisos del editor antes de proceder
- Verifica alcance (división/club compartido) para leaders/co-leaders
- Previene auto-promoción a roles superiores

### Códigos de Error

| Código | Descripción              | Cuándo Ocurre                                                |
| ------ | ------------------------ | ------------------------------------------------------------ |
| 403    | Insufficient permissions | Usuario sin permisos de gestión de roles                     |
| 403    | Cannot assign role 'X'   | Intento de asignar rol no permitido                          |
| 403    | Different division/club  | Leader/co-leader intenta editar usuario de otra organización |
| 403    | Cannot promote yourself  | Usuario intenta auto-promoverse                              |
| 400    | Missing required fields  | Faltan targetUserId o newRoleId                              |
| 404    | User not found           | Usuario objetivo no existe                                   |
| 404    | Role not found           | Rol a asignar no existe                                      |

### Auditoría y Logging

- **Todas las operaciones de cambio de rol** son registradas con:

  - Usuario que realiza el cambio (editor)
  - Usuario afectado (target)
  - Rol anterior y nuevo rol
  - Timestamp de la operación
  - IP y User-Agent del editor

- **Logs de seguridad** para intentos de acceso no autorizados
- **Monitoreo** de cambios de roles de alto nivel (president, committee)

## 🏛️ Gestión de Clubs y Divisiones

### Estructura Organizacional

Los **clubs** y **divisiones** son las entidades organizacionales principales en Nexus AAAIMX:

- **Divisiones**: Grandes áreas temáticas o departamentos (ej: División de Tecnología, División de Marketing)
- **Clubs**: Grupos más específicos dentro de las divisiones (ej: Club de IA, Club de Robótica)

### Permisos por Rol

#### **committee** y **president** - Acceso Total

- ✅ **Crear** clubs y divisiones
- ✅ **Editar** cualquier club o división
- ✅ **Eliminar** clubs y divisiones
- ✅ **Ver** todas las organizaciones
- 🌐 **Alcance**: Toda la aplicación

#### **leader**, **co-leader**, **senior member**, **member** - Solo Lectura

- ✅ **Ver** catálogo de clubs y divisiones
- ❌ **No pueden** crear, editar o eliminar
- 📖 **Alcance**: Solo consulta pública

### API Endpoints

#### Clubs Management

| Método   | Endpoint            | Acceso              | Descripción               |
| -------- | ------------------- | ------------------- | ------------------------- |
| `GET`    | `/api/v1/clubs`     | Público             | Obtener catálogo de clubs |
| `POST`   | `/api/v1/clubs`     | committee/president | Crear nuevo club          |
| `PUT`    | `/api/v1/clubs/:id` | committee/president | Actualizar club           |
| `DELETE` | `/api/v1/clubs/:id` | committee/president | Eliminar club             |

#### Divisions Management

| Método   | Endpoint                | Acceso              | Descripción                    |
| -------- | ----------------------- | ------------------- | ------------------------------ |
| `GET`    | `/api/v1/divisions`     | Público             | Obtener catálogo de divisiones |
| `POST`   | `/api/v1/divisions`     | committee/president | Crear nueva división           |
| `PUT`    | `/api/v1/divisions/:id` | committee/president | Actualizar división            |
| `DELETE` | `/api/v1/divisions/:id` | committee/president | Eliminar división              |

### Validaciones de Negocio

#### Reglas de Creación/Edición

1. **Nombre único**: No pueden existir dos clubs/divisiones con el mismo nombre
2. **Nombre requerido**: Mínimo 1 carácter, máximo 100 caracteres
3. **Descripción opcional**: Máximo 500 caracteres
4. **Logo opcional**: Debe ser una URL válida si se proporciona

#### Códigos de Respuesta HTTP

| Código | Significado           | Uso                                   |
| ------ | --------------------- | ------------------------------------- |
| `200`  | OK                    | Operaciones GET, PUT, DELETE exitosas |
| `201`  | Created               | Operaciones POST exitosas             |
| `400`  | Bad Request           | Datos inválidos, nombre duplicado     |
| `401`  | Unauthorized          | Autenticación requerida               |
| `403`  | Forbidden             | Permisos insuficientes                |
| `404`  | Not Found             | Recurso no encontrado                 |
| `500`  | Internal Server Error | Error del servidor                    |

### Ejemplo de Uso

#### Crear un Club (committee/president)

```http
POST /api/v1/clubs
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "name": "Club de Inteligencia Artificial",
  "description": "Club dedicado al desarrollo y estudio de IA",
  "logoUrl": "https://example.com/ai-logo.png"
}
```

#### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Club created successfully",
  "data": {
    "id": "uuid",
    "name": "Club de Inteligencia Artificial",
    "description": "Club dedicado al desarrollo y estudio de IA",
    "logoUrl": "https://example.com/ai-logo.png",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "status": 201
}
```

#### Error de Permisos

```json
{
  "success": false,
  "message": "Insufficient permissions. Only committee and president roles can create clubs.",
  "data": null,
  "status": 403
}
```

### Archivos de Prueba

Para pruebas completas de los endpoints, consulta:

- `api-http/clubs.api.http` - Tests completos para clubs
- `api-http/divisions.api.http` - Tests completos para divisiones

Estos archivos incluyen:

- Casos de éxito para todas las operaciones
- Casos de error y validación
- Ejemplos de respuestas esperadas

---

_Documento actualizado: $(date)_
_Versión: 1.2_
