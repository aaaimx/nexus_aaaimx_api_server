// Test setup file for Jest
// Set environment variables for testing

// Setup test environment variables
process.env["NODE_ENV"] = "test";
process.env["PORT"] = "8000";
process.env["COMPOSE_PROJECT_NAME"] = "nexus_aaaimx_api_server";
process.env["API_VERSION"] = "1";
process.env["ALLOWED_ORIGINS"] = "http://localhost:3000";
process.env["BASE_URL"] = "http://localhost:8000";
process.env["API_URL"] = "http://localhost:8000/api";
process.env["FRONTEND_URL"] = "http://localhost:3000";

// SMTP Configuration - Use test values to avoid real SMTP calls
process.env["SMTP_HOST"] = "smtp.test.com";
process.env["SMTP_PORT"] = "587";
process.env["SMTP_SECURE"] = "false";
process.env["SMTP_SERVICE"] = "test";
process.env["SMTP_USER"] = "test@test.com";
process.env["SMTP_PASSWORD"] = "test-password";
process.env["SECRET_CODE"] = "test-secret-code";

// Database Configuration - Use in-memory database for tests
process.env["MYSQL_USER"] = "test_user";
process.env["MYSQL_PASSWORD"] = "test_password";
process.env["MYSQL_ROOT_PASS"] = "test_root_password";
process.env["MYSQL_DB"] = "test_db";
process.env["MYSQL_PORT"] = "3306";
process.env["DATABASE_URL"] =
  "mysql://test_user:test_password@localhost:3306/test_db";

// JWT Configuration
process.env["JWT_SECRET"] = "test-jwt-secret";
process.env["JWT_REFRESH_SECRET"] = "test-jwt-refresh-secret";

// Google OAuth Configuration
process.env["GOOGLE_CLIENT_ID"] = "test-google-client-id";
process.env["GOOGLE_CLIENT_SECRET"] = "test-google-client-secret";
process.env["GOOGLE_CALLBACK_URL"] =
  "http://localhost:8000/auth/google/callback";

// Disable external service calls in tests
process.env["DISABLE_EXTERNAL_SERVICES"] = "true";
process.env["DISABLE_EMAIL_SENDING"] = "true";
process.env["DISABLE_GOOGLE_OAUTH"] = "true";
