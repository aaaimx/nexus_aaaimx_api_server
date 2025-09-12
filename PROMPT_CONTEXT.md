# 🤖 Prompt Context: Reglas para este proyecto

## 📋 Componentes del Prompt

Este documento está estructurado siguiendo las mejores prácticas para prompts de LLM, incluyendo los cuatro componentes esenciales:

- **🎯 Context** - Detalles relevantes del proyecto que no están en el training data del LLM
- **📝 Directive** - Tareas específicas a realizar en el proyecto
- **👤 Persona** - Conjunto de habilidades, conocimiento y experiencia requerida
- **🧠 Core LLM** - El modelo de lenguaje de IA que procesará las instrucciones

## 🔄 Interacción de Componentes

- **Core LLM** → **Persona**: Define la estructura de toma de decisiones
- **Core LLM** → **Directive**: Asigna tareas específicas de alcance limitado
- **Context** → **Core LLM**: Proporciona enfoques de solución basados en el proyecto

## 🎯 Uso del Contexto

### Para Tareas de Desarrollo

```
## Context
{Usar la información de este documento como contexto del proyecto}

## Task
Como desarrollador senior de Node.js/TypeScript, [tarea específica]

## Steps
### 1. Diagnóstico
- Analizar el código existente
- Identificar patrones y convenciones del proyecto
- **No continuar hasta recibir confirmación**

### 2. Propuesta de Solución
- Presentar opciones de implementación
- Considerar arquitectura limpia y patrones establecidos
- **Esperar aprobación antes de proceder**

### 3. Implementación
- Ejecutar la solución aprobada
- Seguir convenciones de código del proyecto
- Aplicar testing y validaciones necesarias
```

### Para Tareas de Debugging

```
## Context
{Información del proyecto + error específico}

## Task
Como desarrollador senior, resolver el siguiente problema siguiendo estos pasos:

### 1. Diagnóstico
- Identificar la causa raíz del problema
- Analizar archivos fuente relevantes
- **No avanzar hasta confirmación**

### 2. Solución
- Proponer fixes que resuelvan el issue
- Presentar opciones numeradas si hay múltiples soluciones
- **Esperar aprobación de la solución**

### 3. Implementación
- Aplicar la solución aprobada
- Verificar que el problema esté resuelto
```

## Stack

### Tecnologías Principales

- **Node.js** >= 18.0.0 - Runtime de JavaScript
- **TypeScript** - Lenguaje principal con tipado estático
- **Express.js** - Framework web para APIs REST
- **Prisma** - ORM moderno para base de datos
- **MySQL** - Base de datos relacional
- **pnpm** - Gestor de paquetes (versión 10.5.1)

### Herramientas de Desarrollo

- **ESLint** - Linting y calidad de código
- **Jest** - Framework de testing
- **Husky** - Git hooks para calidad
- **Commitlint** - Validación de mensajes de commit
- **Docker** - Containerización
- **Swagger** - Documentación de API

### Servicios Externos

- **Google OAuth** - Autenticación social
- **Nodemailer** - Envío de emails
- **Winston** - Sistema de logging
- **JWT** - Tokens de autenticación

## Estructura del código

### Arquitectura Limpia (Clean Architecture)

```
src/
├── application/          # Capa de aplicación (casos de uso, servicios)
├── domain/              # Capa de dominio (entidades, repositorios)
├── infrastructure/      # Capa de infraestructura (servicios externos, ORM)
├── interfaces/          # Capa de interfaz (controladores, rutas, DTOs)
├── shared/              # Utilidades y constantes compartidas
└── tests/               # Archivos de prueba
```

### Patrones de Diseño

- **Repository Pattern** - Abstracción de acceso a datos
- **Use Case Pattern** - Lógica de negocio encapsulada
- **Factory Pattern** - Creación de objetos complejos
- **Dependency Injection** - Inyección de dependencias manual

### Organización de Archivos

- **Entidades**: `src/domain/entities/` - Modelos de dominio
- **Repositorios**: `src/domain/repositories/` - Interfaces de acceso a datos
- **Casos de Uso**: `src/application/use-cases/` - Lógica de negocio
- **Servicios**: `src/application/services/` - Servicios de aplicación
- **Controladores**: `src/interfaces/controllers/` - Manejo de HTTP
- **Rutas**: `src/interfaces/routes/` - Definición de endpoints
- **Validadores**: `src/interfaces/validators/` - Validación de datos

## Estilo de código

### TypeScript

- **Strict Mode**: Habilitado con todas las validaciones estrictas
- **ESM Modules**: Uso de módulos ES6
- **Path Mapping**: Aliases configurados (`@/*`, `@/domain/*`, etc.)
- **Type Safety**: Tipado estricto en todas las interfaces

### Convenciones de Naming

- **Archivos**: kebab-case (`user.repository.ts`)
- **Clases**: PascalCase (`UserRepository`)
- **Interfaces**: PascalCase con prefijo I (`IUserRepository`)
- **Funciones/Variables**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Enums**: PascalCase (`UserStatus`)

### Estructura de Código

- **Una responsabilidad por clase/función**
- **Inyección de dependencias en constructores**
- **Manejo de errores con AppException personalizada**
- **Logging estructurado con Winston**
- **Validación de entrada con Zod schemas**

### Reglas de ESLint

- **No console.log** - Usar logger estructurado
- **Indentación**: 2 espacios
- **Variables no usadas**: Prefijo `_` para ignorar
- **TypeScript strict**: Todas las reglas estrictas habilitadas

## Convenciones de nombres

### Base de Datos (Prisma)

- **Tablas**: snake_case (`users`, `user_roles`)
- **Campos**: snake_case (`first_name`, `created_at`)
- **Enums**: PascalCase (`EventStatus`, `RequestStatus`)
- **Relaciones**: camelCase en el modelo (`userRoles`)

### API Endpoints

- **Rutas**: kebab-case (`/api/v1/auth/google-callback`)
- **Métodos HTTP**: RESTful estándar
- **Versión**: `/api/v1/` para todas las rutas
- **Recursos**: Plural (`/users`, `/events`, `/projects`)

### Variables de Entorno

- **Prefijo**: Sin prefijo específico
- **Formato**: UPPER_SNAKE_CASE (`DATABASE_URL`, `GOOGLE_CLIENT_ID`)
- **Archivo**: `.env` (con `.env.example` como template)

### Respuestas de API

- **Estructura consistente**: `ApiResponse` utility
- **Campos**: `success`, `message`, `data`, `status`
- **Códigos HTTP**: Estándar REST
- **Errores**: Mensajes descriptivos en español

## 👤 Persona Ideal

### Desarrollador Senior Node.js/TypeScript

- **Experiencia**: 10+ años con Node.js, TypeScript, Express
- **Arquitectura**: Conocimiento de Clean Architecture y patrones de diseño
- **Base de Datos**: Experiencia con Prisma, MySQL, ORMs
- **Testing**: Jest, testing unitario y de integración
- **DevOps**: Docker, CI/CD, Git workflows
- **Seguridad**: JWT, OAuth, validación de datos, principios de seguridad

### Habilidades Técnicas Requeridas

- **Backend**: APIs REST, middleware, autenticación/autorización
- **Frontend**: Conocimiento básico de React (para entender el contexto)
- **Base de Datos**: Diseño de esquemas, migraciones, optimización
- **Testing**: TDD, mocking, cobertura de código
- **Documentación**: Swagger/OpenAPI, README, documentación técnica

### Conocimiento del Dominio

- **Sistemas de Roles**: Jerarquías, permisos, gestión de usuarios
- **Eventos/Proyectos**: Gestión de contenido, membresías, solicitudes
- **Organizaciones**: Divisiones, clubs, estructuras organizacionales
- **Comunidades**: AAAIMX, contextos académicos/profesionales

## Roles

### Sistema de Roles

El proyecto implementa un sistema de roles jerárquico con 6 niveles:

1. **committee** - Comité Directivo (máximo acceso)
2. **president** - Presidente (máximo acceso)
3. **leader** - Líder (acceso limitado por división/club)
4. **co-leader** - Co-líder (acceso limitado por división/club)
5. **senior member** - Miembro Senior (acceso de lectura/participación)
6. **member** - Miembro (acceso básico)

### Permisos por Rol

- **committee/president**: CRUD completo en toda la aplicación
- **leader/co-leader**: CRUD limitado a su división/club
- **senior member**: Lectura y participación, puede liderar proyectos
- **member**: Lectura y participación básica

### Gestión de Roles

- **President**: Puede editar roles de todos los usuarios
- **Committee**: Puede editar roles excepto president
- **Leader/Co-leader**: Solo usuarios de su división/club
- **Member/Senior Member**: Sin permisos de gestión de roles

## Consideraciones

### Seguridad

- **Autenticación JWT** con refresh tokens
- **Validación de entrada** con Zod schemas
- **Principio de menor privilegio** en roles
- **Logging de seguridad** para operaciones críticas
- **Rate limiting** implementado

### Base de Datos

- **MySQL** como base de datos principal
- **Prisma** como ORM con migraciones
- **UUIDs** como identificadores primarios
- **Timestamps** automáticos (`created_at`, `updated_at`)
- **Soft deletes** donde sea necesario

### Testing

- **Jest** como framework principal
- **Tests unitarios** para casos de uso
- **Mocks** para dependencias externas
- **Cobertura de código** configurada

### Deployment

- **Docker** para containerización
- **Docker Compose** para desarrollo local
- **Variables de entorno** para configuración
- **Health checks** implementados

### Monitoreo y Logging

- **Winston** para logging estructurado
- **Niveles de log**: error, warn, info, debug
- **Contexto de usuario** en logs
- **Métricas de performance** básicas

### Documentación

- **Swagger/OpenAPI** para documentación de API
- **README.md** con instrucciones de setup
- **Business rules** documentadas en `/docs`
- **Comentarios JSDoc** solo cuando aporten valor

### Git y CI/CD

- **Conventional Commits** para mensajes
- **Husky hooks** para calidad de código
- **Branch protection** en main
- **Automated testing** en commits

### Performance

- **Connection pooling** para base de datos
- **Caching** donde sea apropiado
- **Paginación** en endpoints de listado
- **Optimización de queries** con Prisma

### Escalabilidad

- **Arquitectura modular** para fácil extensión
- **Separación de responsabilidades** clara
- **Interfaces bien definidas** para testing
- **Configuración flexible** por ambiente

## 📝 Directivas Específicas

### Para Nuevas Funcionalidades

```
Como desarrollador senior, implementa [funcionalidad] siguiendo:
1. Arquitectura limpia establecida
2. Patrones de código del proyecto
3. Testing completo
4. Documentación actualizada
```

### Para Corrección de Bugs

```
Como desarrollador senior, resuelve [bug] siguiendo:
1. Diagnóstico detallado de la causa
2. Solución mínima e impactante
3. Testing de regresión
4. Verificación de no romper funcionalidad existente
```

### Para Refactoring

```
Como desarrollador senior, refactoriza [código] considerando:
1. Mejora de legibilidad y mantenibilidad
2. Preservación de funcionalidad existente
3. Aplicación de patrones establecidos
4. Testing exhaustivo post-refactoring
```

### Para Optimización

```
Como desarrollador senior, optimiza [componente] enfocándote en:
1. Performance y escalabilidad
2. Uso eficiente de recursos
3. Mejora de experiencia de usuario
4. Monitoreo y métricas
```

### Para Documentación

```
Como desarrollador senior, documenta [componente] incluyendo:
1. Propósito y responsabilidades
2. Ejemplos de uso
3. Consideraciones de implementación
4. Casos edge y limitaciones
```
