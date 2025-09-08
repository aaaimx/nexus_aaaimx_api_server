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

---

_Documento actualizado: $(date)_
_Versión: 1.0_
