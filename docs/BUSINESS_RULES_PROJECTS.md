# Reglas de Negocio - Proyectos

## 📋 Resumen

Este documento define las reglas de negocio para el sistema de proyectos en la aplicación Nexus AAAIMX. Los proyectos son iniciativas colaborativas que pueden ser creadas, gestionadas y en las que los usuarios pueden participar a través de un sistema de solicitudes.

## 🎯 Estructura de Proyectos

### Entidad Principal

Un proyecto está compuesto por:

- **Identificador único** (UUID)
- **Nombre** (único en el sistema)
- **Descripción** (opcional)
- **Imagen de portada** (opcional)
- **Estado** (DRAFT, PUBLISHED, ARCHIVED, ONLINE)
- **Visibilidad** (público/privado)
- **Creador** (usuario que crea el proyecto)
- **Tags** (múltiples etiquetas de categorización)
- **Divisiones asociadas** (múltiples divisiones)
- **Clubs asociados** (múltiples clubs)
- **Miembros** (usuarios que participan en el proyecto)
- **Solicitudes** (requests de usuarios para unirse)

### Relaciones

- **Un proyecto** puede tener **múltiples usuarios** (relación many-to-many)
- **Un proyecto** puede tener **múltiples tags** (relación many-to-many)
- **Un proyecto** puede estar asociado a **múltiples divisiones** (relación many-to-many)
- **Un proyecto** puede estar asociado a **múltiples clubs** (relación many-to-many)
- **Un proyecto** puede tener **múltiples solicitudes** (project_requests)

## 🔐 Permisos por Rol

### 1. **committee** - Comité Directivo

**Nivel de Acceso:** Máximo

**Capacidades:**

- ✅ **Crear proyectos** en toda la aplicación
- ✅ **Editar proyectos** de cualquier división o club
- ✅ **Eliminar proyectos** de cualquier división o club
- ✅ **Gestionar solicitudes** de cualquier proyecto
- ✅ **Asignar/remover miembros** de cualquier proyecto
- ✅ **Cambiar estado** de cualquier proyecto
- ✅ **Asociar proyectos** a cualquier división o club

**Alcance:** Aplicación completa

---

### 2. **president** - Presidente

**Nivel de Acceso:** Máximo

**Capacidades:**

- ✅ **Crear proyectos** en toda la aplicación
- ✅ **Editar proyectos** de cualquier división o club
- ✅ **Eliminar proyectos** de cualquier división o club
- ✅ **Gestionar solicitudes** de cualquier proyecto
- ✅ **Asignar/remover miembros** de cualquier proyecto
- ✅ **Cambiar estado** de cualquier proyecto
- ✅ **Asociar proyectos** a cualquier división o club

**Alcance:** Aplicación completa

---

### 3. **leader** - Líder

**Nivel de Acceso:** Alto (Limitado por organización)

**Capacidades:**

- ✅ **Crear proyectos** en su división o club
- ✅ **Editar proyectos** de su división o club
- ✅ **Eliminar proyectos** de su división o club
- ✅ **Gestionar solicitudes** de proyectos de su división o club
- ✅ **Asignar/remover miembros** de proyectos de su división o club
- ✅ **Cambiar estado** de proyectos de su división o club
- ✅ **Asociar proyectos** a su división o club

**Alcance:** Su división o club asignado

**Restricciones:**

- ❌ Solo puede gestionar proyectos de **su división o club**
- ❌ No puede acceder a proyectos de otras organizaciones
- ❌ No puede gestionar solicitudes fuera de su ámbito

---

### 4. **co-leader** - Co-líder

**Nivel de Acceso:** Medio-Alto (Limitado por organización)

**Capacidades:**

- ✅ **Crear proyectos** en su división o club
- ✅ **Editar proyectos** de su división o club
- ✅ **Eliminar proyectos** de su división o club
- ✅ **Gestionar solicitudes** de proyectos de su división o club
- ✅ **Asignar/remover miembros** de proyectos de su división o club
- ✅ **Cambiar estado** de proyectos de su división o club
- ✅ **Asociar proyectos** a su división o club

**Alcance:** Su división o club asignado

**Restricciones:**

- ❌ Solo puede gestionar proyectos de **su división o club**
- ❌ No puede acceder a proyectos de otras organizaciones
- ❌ No puede gestionar solicitudes fuera de su ámbito

---

### 5. **senior member** - Miembro Senior

**Nivel de Acceso:** Medio

**Capacidades:**

- ✅ **Crear proyectos** (solo en divisiones/clubs donde es miembro)
- ✅ **Editar proyectos** que ha creado
- ✅ **Eliminar proyectos** que ha creado
- ✅ **Gestionar solicitudes** de proyectos que ha creado
- ✅ **Asignar/remover miembros** de proyectos que ha creado
- ✅ **Cambiar estado** de proyectos que ha creado
- ✅ **Visualizar proyectos** donde es miembro
- ✅ **Participar en proyectos** donde es miembro

**Alcance:** Divisiones y clubs donde es miembro

**Restricciones:**

- ❌ Solo puede gestionar proyectos que **él mismo ha creado**
- ❌ No puede gestionar proyectos creados por otros usuarios
- ❌ No puede gestionar solicitudes de proyectos ajenos

---

### 6. **member** - Miembro

**Nivel de Acceso:** Básico

**Capacidades:**

- ✅ **Visualizar proyectos** donde es miembro
- ✅ **Participar en proyectos** donde es miembro
- ✅ **Solicitar unirse** a proyectos públicos

**Alcance:** Divisiones y clubs donde es miembro

**Restricciones:**

- ❌ **NO puede crear proyectos**
- ❌ **NO puede editar proyectos**
- ❌ **NO puede eliminar proyectos**
- ❌ **NO puede gestionar solicitudes**
- ❌ **NO puede gestionar miembros**

---

## 🔄 Matriz de Permisos

| Funcionalidad                             | committee | president | leader | co-leader | senior member | member |
| ----------------------------------------- | --------- | --------- | ------ | --------- | ------------- | ------ |
| **Creación de Proyectos**                 |
| Crear proyectos (global)                  | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Crear proyectos (propio ámbito)           | ✅        | ✅        | ✅     | ✅        | ✅            | ❌     |
| **Edición de Proyectos**                  |
| Editar proyectos (global)                 | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Editar proyectos (propio ámbito)          | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Editar proyectos propios                  | ✅        | ✅        | ✅     | ✅        | ✅            | ❌     |
| **Eliminación de Proyectos**              |
| Eliminar proyectos (global)               | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Eliminar proyectos (propio ámbito)        | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Eliminar proyectos propios                | ✅        | ✅        | ✅     | ✅        | ✅            | ❌     |
| **Gestión de Miembros**                   |
| Gestionar miembros (global)               | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Gestionar miembros (propio ámbito)        | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Gestionar miembros (proyectos propios)    | ✅        | ✅        | ✅     | ✅        | ✅            | ❌     |
| **Gestión de Solicitudes**                |
| Gestionar solicitudes (global)            | ✅        | ✅        | ❌     | ❌        | ❌            | ❌     |
| Gestionar solicitudes (propio ámbito)     | ✅        | ✅        | ✅     | ✅        | ❌            | ❌     |
| Gestionar solicitudes (proyectos propios) | ✅        | ✅        | ✅     | ✅        | ✅            | ❌     |
| **Visualización y Participación**         |
| Ver proyectos                             | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| Participar en proyectos                   | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |
| Solicitar unirse a proyectos              | ✅        | ✅        | ✅     | ✅        | ✅            | ✅     |

## 📝 Sistema de Solicitudes (Project Requests)

### Flujo de Solicitudes

1. **Usuario solicita unirse** a un proyecto
2. **Sistema valida** que el usuario no esté ya en el proyecto
3. **Solicitud se crea** con estado `PENDING`
4. **Creador del proyecto** recibe notificación
5. **Creador procesa** la solicitud (APPROVED/REJECTED)
6. **Si es aprobada**, usuario se agrega automáticamente al proyecto

### Estados de Solicitud

- **PENDING**: Solicitud pendiente de revisión
- **APPROVED**: Solicitud aprobada, usuario agregado al proyecto
- **REJECTED**: Solicitud rechazada

### Quién Puede Gestionar Solicitudes

- **Creador del proyecto**: Siempre puede gestionar las solicitudes de sus proyectos
- **committee/president**: Pueden gestionar solicitudes de cualquier proyecto
- **leader/co-leader**: Pueden gestionar solicitudes de proyectos de su división/club
- **senior member**: Solo puede gestionar solicitudes de proyectos que él creó
- **member**: No puede gestionar solicitudes

### Campos de Solicitud

- **user_id**: Usuario que solicita unirse
- **project_id**: Proyecto al que solicita unirse
- **status**: Estado de la solicitud
- **message**: Mensaje opcional del solicitante
- **admin_message**: Mensaje del administrador al aprobar/rechazar

## 🏗️ Implementación Técnica

### Validaciones de Negocio

1. **Un usuario solo puede solicitar una vez** por proyecto (constraint único)
2. **El creador del proyecto** siempre puede gestionar sus solicitudes
3. **Los permisos de gestión** se validan según el rol y ámbito del usuario
4. **Los proyectos pueden tener múltiples tags** y asociaciones
5. **La membresía en proyectos** se maneja a través de la tabla `user_projects`

### Estados de Proyecto

- **DRAFT**: Proyecto en borrador (no visible públicamente)
- **PUBLISHED**: Proyecto publicado y visible
- **ARCHIVED**: Proyecto archivado (solo visible para miembros)
- **ONLINE**: Proyecto activo y en curso

### Reglas de Visibilidad

- **Proyectos públicos**: Visibles para todos los usuarios
- **Proyectos privados**: Solo visibles para miembros y usuarios con permisos
- **Proyectos en DRAFT**: Solo visibles para el creador y administradores

## 🔒 Reglas de Seguridad

### Principio de Menor Privilegio

- Los usuarios solo pueden gestionar proyectos dentro de su ámbito asignado
- Los miembros solo pueden participar en proyectos donde tienen acceso
- Las operaciones administrativas requieren roles específicos

### Validación de Contexto

- **Leader/Co-leader**: Solo pueden gestionar proyectos de sus divisiones/clubs
- **Senior Member**: Solo puede gestionar proyectos que él creó
- **Member**: Solo puede participar en proyectos donde es miembro

### Prevención de Acceso No Autorizado

- Validación de permisos en cada operación
- Verificación de membresía antes de permitir acceso
- Logging de todas las operaciones de gestión de proyectos

## 📊 Endpoints de Gestión

### Proyectos

- **GET** `/api/projects` - Listar proyectos (filtrado por permisos)
- **POST** `/api/projects` - Crear proyecto
- **GET** `/api/projects/:id` - Obtener proyecto específico
- **PUT** `/api/projects/:id` - Actualizar proyecto
- **DELETE** `/api/projects/:id` - Eliminar proyecto

### Solicitudes de Proyecto

- **GET** `/api/projects/:id/requests` - Listar solicitudes de un proyecto
- **POST** `/api/projects/:id/requests` - Solicitar unirse a proyecto
- **PUT** `/api/projects/:id/requests/:requestId` - Procesar solicitud
- **DELETE** `/api/projects/:id/requests/:requestId` - Cancelar solicitud

### Miembros de Proyecto

- **GET** `/api/projects/:id/members` - Listar miembros del proyecto
- **POST** `/api/projects/:id/members` - Agregar miembro directamente
- **DELETE** `/api/projects/:id/members/:userId` - Remover miembro

## 🚨 Códigos de Error

| Código | Descripción                  | Cuándo Ocurre                                  |
| ------ | ---------------------------- | ---------------------------------------------- |
| 403    | Insufficient permissions     | Usuario sin permisos para la operación         |
| 403    | Cannot manage this project   | Intento de gestionar proyecto fuera del ámbito |
| 403    | Cannot edit others' projects | Senior member intenta editar proyecto ajeno    |
| 400    | Project already exists       | Intento de crear proyecto con nombre duplicado |
| 400    | Invalid project status       | Estado de proyecto no válido                   |
| 404    | Project not found            | Proyecto no existe                             |
| 404    | Request not found            | Solicitud no existe                            |
| 409    | Already a member             | Usuario ya es miembro del proyecto             |
| 409    | Request already exists       | Usuario ya solicitó unirse al proyecto         |

## 📝 Auditoría y Logging

- **Todas las operaciones de proyecto** son registradas con:

  - Usuario que realiza la acción
  - Proyecto afectado
  - Tipo de operación
  - Timestamp de la operación
  - IP y User-Agent del usuario

- **Logs de seguridad** para intentos de acceso no autorizados
- **Monitoreo** de creación y eliminación de proyectos
- **Tracking** de cambios de estado y membresías

## 🔄 Flujo de Trabajo Típico

### Creación de Proyecto

1. Usuario con permisos crea proyecto
2. Proyecto se crea en estado DRAFT
3. Se asocian tags, divisiones y clubs según permisos
4. Proyecto se publica (cambio a PUBLISHED)

### Solicitud de Membresía

1. Usuario solicita unirse al proyecto
2. Sistema valida que no sea miembro actual
3. Creador recibe notificación
4. Creador aprueba/rechaza solicitud
5. Si aprobada, usuario se agrega automáticamente

### Gestión de Proyecto

1. Creador puede editar proyecto en cualquier momento
2. Creador puede cambiar estado del proyecto
3. Creador puede gestionar miembros y solicitudes
4. Administradores pueden gestionar cualquier proyecto

---

_Documento actualizado: $(date)_
_Versión: 1.0_
