# Reglas de Negocio - Roles y Permisos

## 📋 Resumen

Este documento define las reglas de negocio para el sistema de roles en la aplicación Nexus AAAIMX. El sistema utiliza un modelo simplificado basado únicamente en roles, sin permisos granulares adicionales.

## 🎯 Roles del Sistema

### 1. **committee** - Comité Directivo

**Nivel de Acceso:** Máximo

**Capacidades:**

- ✅ **CRUD completo** de eventos en toda la aplicación
- ✅ **CRUD completo** de proyectos en toda la aplicación
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

---

_Documento actualizado: $(date)_
_Versión: 1.1_
