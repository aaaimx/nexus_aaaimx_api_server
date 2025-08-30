# Nexus AAAIMX API Server

A modern Node.js API server built with TypeScript, Express, and Clean Architecture principles.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **Clean Architecture** - Well-structured, maintainable codebase
- **ESLint** - Code quality and consistency
- **Jest** - Comprehensive testing framework
- **Husky** - Git hooks for code quality
- **Commitlint** - Conventional commit message validation
- **pnpm** - Fast, disk space efficient package manager
- **Prisma** - Modern database toolkit and ORM
- **MySQL** - Robust relational database
- **Nodemailer** - Email functionality
- **Docker** - Containerized development and deployment

## 📋 Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nexus_aaaimx_api_server
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up Git hooks:

```bash
pnpm run prepare
```

## 🚀 Development

### Available Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm dev`           | Start development server with hot reload |
| `pnpm build`         | Build the project for production         |
| `pnpm start`         | Start production server                  |
| `pnpm test`          | Run tests                                |
| `pnpm test:watch`    | Run tests in watch mode                  |
| `pnpm test:coverage` | Run tests with coverage report           |
| `pnpm lint`          | Run ESLint                               |
| `pnpm lint:fix`      | Fix ESLint issues automatically          |
| `pnpm type-check`    | Run TypeScript type checking             |

### Development Server

Start the development server:

```bash
pnpm dev
```

The server will be available at `http://localhost:3000`

### Testing

```bash
# Run the test suite
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Code Quality

```bash
# Lint your code
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Check TypeScript types
pnpm type-check
```

## 🗄️ Database Management

### Local Development

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create and apply migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Seed database with sample data
pnpm db:seed
```

### Docker Development

When running the application in Docker containers, use these commands to interact with the database:

```bash
# Push schema changes to database
docker exec -it nexus_aaaimx_api_server pnpm prisma db push --schema=src/infrastructure/orm/schema.prisma

# Generate Prisma client
docker exec -it nexus_aaaimx_api_server pnpm prisma generate --schema=src/infrastructure/orm/schema.prisma

# Create and apply migrations
docker exec -it nexus_aaaimx_api_server pnpm prisma migrate dev --schema=src/infrastructure/orm/schema.prisma

# Open Prisma Studio
docker exec -it nexus_aaaimx_api_server pnpm prisma studio --schema=src/infrastructure/orm/schema.prisma

# Seed database with sample data
docker exec -it nexus_aaaimx_api_server pnpm prisma db seed --schema=src/infrastructure/orm/schema.prisma

# Connect to MySQL directly
docker exec -it nexus_aaaimx_mysql_db mysql -u nexus_aaaimx -p nexus_aaaimx_db

# View database logs
docker logs nexus_aaaimx_mysql_db
```

> **Important Note:** When using Docker, the database hostname `db` is only accessible from within the Docker network. Always use the `docker exec` commands above to interact with the database from your local machine.

## 🐳 Docker

### Docker Commands

```bash
# Build and start services
pnpm docker:build

# Start services in development mode
pnpm docker:dev

# Start services with Docker Compose
pnpm docker:compose:up

# Stop Docker Compose services
pnpm docker:compose:down

# View Docker Compose logs
pnpm docker:compose:logs

# Restart services
pnpm docker:compose:restart
```

## 🏗️ Project Structure

```
src/
├── application/          # Application layer (use cases, services)
├── domain/              # Domain layer (entities, repositories)
├── infrastructure/      # Infrastructure layer (external services, ORM)
├── interfaces/          # Interface layer (controllers, routes, DTOs)
├── shared/              # Shared utilities and constants
└── tests/               # Test files
```

## 📝 Git Hooks

This project uses Husky to enforce code quality:

- **pre-commit**: Runs linting and tests before each commit
- **commit-msg**: Validates commit message format using conventional commits

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

Examples:
feat: add user authentication
fix(auth): resolve login validation issue
docs: update API documentation
style: format code according to style guide
refactor: restructure user service
test: add unit tests for auth module
chore: update dependencies
```

## 🔧 Configuration Files

- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest testing configuration
- `.eslintrc.js` - ESLint rules and configuration
- `commitlint.config.js` - Commit message validation rules
- `.husky/` - Git hooks configuration

## 📦 Dependencies

### Production

- `express` - Web framework
- `@prisma/client` - Database ORM
- `mysql` - Database driver
- `nodemailer` - Email functionality
- `winston` - Logging
- `zod` - Schema validation

### Development

- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/express` - Express type definitions
- `eslint` - Code linting
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `husky` - Git hooks
- `commitlint` - Commit message validation
- `tsx` - TypeScript execution for development
