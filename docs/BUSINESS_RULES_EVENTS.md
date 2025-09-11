# Reglas de Negocio - Eventos

## 📋 Resumen

Este documento define las reglas de negocio para el sistema de eventos en la aplicación Nexus AAAIMX. El sistema maneja diferentes tipos de eventos con capacidades de recurrencia, gestión de asistentes y validaciones de horarios.

## 🎯 Tipos de Eventos

### 1. **SINGLE** - Evento Único

**Descripción:** Un evento de un solo día con una fecha específica y horario definido.

**Características:**

- ✅ **Fecha única:** `start_date` y `end_date` con la misma fecha
- ✅ **Horario específico:** `start_time` y `end_time` definidos
- ✅ **Duración fija:** `session_duration_minutes` opcional
- ✅ **Sin recurrencia:** `is_recurring = false`

**Ejemplo:**

```
Fecha: 2024-03-15
Horario: 09:00 - 11:00
Duración: 120 minutos
```

---

### 2. **COURSE** - Curso

**Descripción:** Un evento que puede durar varios días, cada día con su propia fecha y horario.

**Características:**

- ✅ **Múltiples fechas:** `start_date` y `end_date` pueden ser diferentes
- ✅ **Sesiones individuales:** Cada día es una sesión separada
- ✅ **Horarios por sesión:** `start_time` y `end_time` aplican a cada sesión
- ✅ **Duración por sesión:** `session_duration_minutes` para cada sesión

**Ejemplo:**

```
Curso: "Desarrollo Web Avanzado"
Fecha inicio: 2024-03-15
Fecha fin: 2024-03-20
Horario: 09:00 - 12:00 (cada día)
```

---

### 3. **WORKSHOP** - Taller

**Descripción:** Similar a COURSE, puede durar varios días con sesiones programadas.

**Características:**

- ✅ **Múltiples fechas:** `start_date` y `end_date` pueden ser diferentes
- ✅ **Sesiones individuales:** Cada día es una sesión separada
- ✅ **Horarios por sesión:** `start_time` y `end_time` aplican a cada sesión
- ✅ **Duración por sesión:** `session_duration_minutes` para cada sesión

**Ejemplo:**

```
Taller: "Machine Learning Práctico"
Fecha inicio: 2024-04-01
Fecha fin: 2024-04-03
Horario: 14:00 - 17:00 (cada día)
```

---

### 4. **RECURRING** - Evento Recurrente

**Descripción:** Evento que se repite siguiendo un patrón específico de recurrencia.

**Características:**

- ✅ **Patrón de recurrencia:** `recurrence_pattern` (DAILY, WEEKLY, MONTHLY, CUSTOM)
- ✅ **Intervalo:** `recurrence_interval` (cada X días/semanas/meses)
- ✅ **Fechas de recurrencia:** `recurrence_start_date` y `recurrence_end_date`
- ✅ **Días personalizados:** `recurrence_days` para patrones CUSTOM
- ✅ **Sesiones generadas:** Se crean automáticamente en `event_sessions`

**Ejemplo:**

```
Reunión semanal: "Stand-up del equipo"
Patrón: WEEKLY
Intervalo: 1 (cada semana)
Días: Lunes
Horario: 09:00 - 10:00
Duración: 3 meses
```

---

## 🔄 Patrones de Recurrencia

### Tabla Hash de Patrones

| Patrón      | Descripción   | Intervalo                     | Ejemplo                                    |
| ----------- | ------------- | ----------------------------- | ------------------------------------------ |
| **DAILY**   | Diario        | `recurrence_interval` días    | Cada 2 días                                |
| **WEEKLY**  | Semanal       | `recurrence_interval` semanas | Cada semana                                |
| **MONTHLY** | Mensual       | `recurrence_interval` meses   | Cada 2 meses                               |
| **CUSTOM**  | Personalizado | N/A                           | `recurrence_days: "1,3,5"` (Lun, Mié, Vie) |

### Validaciones de Recurrencia

1. **DAILY:** `recurrence_interval` debe ser >= 1
2. **WEEKLY:** `recurrence_interval` debe ser >= 1
3. **MONTHLY:** `recurrence_interval` debe ser >= 1
4. **CUSTOM:** `recurrence_days` debe contener números del 1-7 (1=Lunes, 7=Domingo)

---

## ⏰ Reglas de Horarios

### Prevención de Conflictos

**Regla Principal:** Dos o más eventos **NO** pueden tener el mismo horario y fecha.

**Validaciones:**

- ❌ **Conflictos de horario:** No se permiten eventos simultáneos
- ❌ **Solapamiento parcial:** No se permiten eventos que se superpongan en tiempo
- ❌ **Mismo organizador:** Un organizador no puede tener eventos conflictivos

**Algoritmo de Validación:**

```
Para cada nuevo evento:
1. Verificar que start_time < end_time
2. Verificar que no existan eventos con:
   - Misma fecha (start_date)
   - Horarios que se solapen:
     * start_time < evento_existente.end_time
     * end_time > evento_existente.start_time
3. Si es recurrente, verificar todas las fechas generadas
```

### Ejemplos de Conflictos

**❌ CONFLICTO:**

```
Evento A: 2024-03-15, 09:00 - 11:00
Evento B: 2024-03-15, 10:00 - 12:00
```

**✅ VÁLIDO:**

```
Evento A: 2024-03-15, 09:00 - 11:00
Evento B: 2024-03-15, 14:00 - 16:00
```

---

## 👥 Gestión de Asistentes

### Tipos de Organizadores

| Tipo         | Descripción                  | Campo Utilizado           |
| ------------ | ---------------------------- | ------------------------- |
| **USER**     | Persona individual           | `organizer_user_id`       |
| **DIVISION** | División de la organización  | `organizer_division_id`   |
| **CLUB**     | Club de la organización      | `organizer_club_id`       |
| **EXTERNAL** | Organización/persona externa | `external_organizer_name` |

### Estados de Asistencia

| Estado         | Descripción              | Comportamiento                  |
| -------------- | ------------------------ | ------------------------------- |
| **registered** | Registrado (por defecto) | Usuario confirmado para asistir |
| **cancelled**  | Cancelado                | Usuario canceló su asistencia   |

### Reglas de Asistencia

1. **Cualquier usuario** con cualquier rol puede asistir a eventos
2. **Registro único:** Un usuario solo puede registrarse una vez por evento
3. **Cambio de estado:** Los usuarios pueden cambiar su estado de `registered` a `cancelled`
4. **Cancelación global:** Si un usuario cancela un evento recurrente, se cancela para todas las sesiones
5. **Re-registro:** Un usuario cancelado puede volver a registrarse

### Flujo de Asistencia

```
1. Usuario se registra → status: "registered"
2. Usuario puede cancelar → status: "cancelled"
3. Usuario puede re-registrarse → status: "registered"
4. Si es evento recurrente → cambio aplica a todas las sesiones
```

---

## 🏗️ Estructura de Datos

### Eventos Únicos (SINGLE)

```sql
events:
- start_date: 2024-03-15
- end_date: 2024-03-15
- start_time: "09:00"
- end_time: "11:00"
- is_recurring: false
```

### Eventos Multi-día (COURSE/WORKSHOP)

```sql
events:
- start_date: 2024-03-15
- end_date: 2024-03-20
- start_time: "09:00"
- end_time: "12:00"
- is_recurring: false

event_sessions:
- session_date: 2024-03-15, start_time: "09:00", end_time: "12:00"
- session_date: 2024-03-16, start_time: "09:00", end_time: "12:00"
- session_date: 2024-03-17, start_time: "09:00", end_time: "12:00"
```

### Eventos Recurrentes (RECURRING)

```sql
events:
- recurrence_pattern: "WEEKLY"
- recurrence_interval: 1
- recurrence_start_date: 2024-03-15
- recurrence_end_date: 2024-06-15
- start_time: "09:00"
- end_time: "10:00"
- is_recurring: true

event_sessions: (generadas automáticamente)
- session_date: 2024-03-15, start_time: "09:00", end_time: "10:00"
- session_date: 2024-03-22, start_time: "09:00", end_time: "10:00"
- session_date: 2024-03-29, start_time: "09:00", end_time: "10:00"
```

---

## 🔒 Validaciones de Negocio

### Validaciones Obligatorias

1. **Nombre único:** `name` debe ser único en toda la aplicación
2. **Fechas válidas:** `start_date` <= `end_date`
3. **Horarios válidos:** `start_time` < `end_time`
4. **Organizador válido:** Debe especificar exactamente un tipo de organizador
5. **Sin conflictos:** No puede haber eventos simultáneos
6. **Recurrencia válida:** Si `is_recurring = true`, debe tener patrón válido

### Validaciones por Tipo de Evento

#### SINGLE

- `start_date` = `end_date`
- `is_recurring = false`
- No requiere `event_sessions`

#### COURSE/WORKSHOP

- `start_date` puede ser diferente a `end_date`
- `is_recurring = false`
- Requiere `event_sessions` para cada día

#### RECURRING

- `is_recurring = true`
- Debe tener `recurrence_pattern`
- Debe tener `recurrence_start_date` y `recurrence_end_date`
- Genera `event_sessions` automáticamente

---

## 🚫 Restricciones y Limitaciones

### Limitaciones de Horarios

- ❌ No se permiten eventos que terminen antes de empezar
- ❌ No se permiten eventos con duración negativa
- ❌ No se permiten eventos en fechas pasadas (excepto para edición)

### Limitaciones de Recurrencia

- ❌ No se puede cambiar el patrón de recurrencia una vez creado
- ❌ No se pueden editar fechas de recurrencia si ya hay asistentes
- ❌ No se pueden eliminar sesiones individuales de eventos recurrentes

### Limitaciones de Asistentes

- ❌ No se puede exceder `max_participants` si está definido
- ❌ No se pueden registrar usuarios inactivos
- ❌ No se pueden registrar usuarios no verificados (opcional)

---

## 📊 Estados del Evento

| Estado        | Descripción | Comportamiento                                |
| ------------- | ----------- | --------------------------------------------- |
| **draft**     | Borrador    | No visible públicamente, solo para el creador |
| **published** | Publicado   | Visible públicamente, acepta registros        |
| **archived**  | Archivado   | No visible, no acepta nuevos registros        |
| **online**    | En línea    | Evento en curso (para eventos virtuales)      |

### Transiciones de Estado

```
draft → published (publicar evento)
published → archived (archivar evento)
published → online (iniciar evento virtual)
online → archived (finalizar evento)
```

---

## 🔧 Consideraciones Técnicas

### Eliminación del Modelo session_attendees

**Justificación:** Como mencionaste, el modelo `session_attendees` no es necesario porque:

1. **Simplicidad:** Los usuarios se registran para todo el evento, no para sesiones individuales
2. **Consistencia:** El estado de asistencia se mantiene a nivel de evento
3. **Menos complejidad:** Reduce la complejidad del modelo de datos
4. **Mejor UX:** Los usuarios no necesitan registrarse para cada sesión

### Implementación Recomendada

```sql
-- Solo usar event_attendees
event_attendees:
- user_id: UUID
- event_id: UUID
- status: "registered" | "cancelled"
- created_at: DateTime
- updated_at: DateTime

-- Eliminar session_attendees
-- session_attendees: ❌ NO NECESARIO
```

---

## 📈 Métricas y Reportes

### Métricas por Evento

- Total de registrados
- Total de cancelados
- Tasa de asistencia
- Eventos más populares

### Métricas por Usuario

- Eventos asistidos
- Eventos organizados
- Historial de cancelaciones

### Métricas por Organizador

- Eventos por tipo de organizador
- Rendimiento por división/club
- Eventos externos vs internos

---

_Documento actualizado: $(date)_
_Versión: 1.0_
