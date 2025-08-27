#!/usr/bin/env node

/**
 * Script to generate comprehensive Copilot instructions for the Parroquia Management System
 * Usage: node generate-copilot-instructions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const copilotInstructionsContent = `# Parroquia Management System - AI Development Guide

## 🏗️ Architecture Overview

This is a **Parish Management System** built with Node.js/Express, PostgreSQL, and comprehensive Swagger documentation. The system manages family surveys, deceased records, geographic catalogs, and parish member data.

### Key Components
- **API Server**: Express.js with JWT authentication, CORS, and Helmet security
- **Database**: PostgreSQL with Sequelize ORM and complex model associations  
- **Documentation**: Auto-generated Swagger UI at \`/api-docs\`
- **Deployment**: Docker Compose with production/development environments

## 📁 Project Structure

\`\`\`
src/
├── app.js                    # Main Express application with route registration
├── models/                   # Sequelize models with associations
│   ├── index.js             # Model exports and basic associations
│   ├── catalog/             # Geographic and catalog entities
│   └── main/                # Core business models (.cjs files)
├── controllers/             # Request handlers by feature
├── services/                # Business logic layer
├── routes/                  # Express route definitions with Swagger docs
│   └── catalog/             # Geographic data CRUD operations
├── middlewares/             # Auth, error handling, validation
└── config/                  # Database, Swagger, environment config
\`\`\`

## 🚀 Development Workflow

### Starting the Application
\`\`\`bash
npm run dev                  # Development with nodemon
npm run dev:https           # HTTPS development mode
npm start                   # Production mode
\`\`\`

### Database Operations
\`\`\`bash
npm run db:sync:complete    # Sync all models (use alter/force params)
npm run db:seed:config      # Load catalog data (departments, municipalities)
npm run admin:create        # Create admin user interactively
\`\`\`

### Docker Deployment
\`\`\`bash
docker-compose up -d        # Start all services
./deploy.sh                 # Full production deployment script
\`\`\`

## 🔑 Critical Patterns

### Model Associations
- **Complex relationships**: Person → Family → Geographic location chain
- **Associations disabled**: Many associations commented out in \`models/index.js\` to prevent circular dependency errors
- **Mixed module types**: Main models use CommonJS (.cjs), others use ES6 modules

### Authentication Flow
- **JWT + Refresh tokens**: Stored in httpOnly cookies and Authorization headers
- **Route protection**: Most \`/api/catalog/*\` routes require authentication
- **Login endpoint**: \`POST /api/auth/login\` with email/password

### API Response Format
\`\`\`javascript
// Standard success response
{
  exito: true,
  mensaje: "Operation successful", 
  datos: [...],
  total: 10
}

// Error response  
{
  status: "error",
  message: "Descriptive error message",
  code: "ERROR_CODE"
}
\`\`\`

### Service Layer Pattern
- **Controllers** handle HTTP concerns, delegate to **Services**
- **Services** contain business logic, database queries
- **Direct SQL queries** used when Sequelize associations cause issues

## 📊 Key Features

### Family Consultation Services (\`familiasConsultasService.js\`)
- Comprehensive person data queries (mothers/fathers with full profile info)
- Automatic deceased person exclusion via \`DifuntosFamilia\` table
- Flexible filtering with optional parameters

### Geographic Catalog System
- Hierarchical: Departments → Municipalities → Parishes → Sectors → Veredas
- CRUD operations with pagination, search, and statistics endpoints
- Bulk import capabilities for geographic data

### Swagger Documentation
- **Auto-generated** from JSDoc comments in route files
- **Custom schemas** defined in \`src/config/swagger.js\`
- **Interactive testing** available at \`/api-docs\`

## 🔧 Environment Configuration

### Required Environment Variables
\`\`\`bash
# Database
DB_HOST=postgres              # Docker service name
DB_USER=parroquia_user
DB_PASSWORD=<secure_password>
DB_NAME=parroquia_db

# Authentication
JWT_SECRET=<32+ character secret>
JWT_REFRESH_SECRET=<different secret>

# Email (SMTP configuration)
SMTP_HOST=smtp.gmail.com
SMTP_USER=<email>
SMTP_PASS=<app_password>
\`\`\`

### Development vs Production
- **Development**: Uses \`alter: false\` for database sync
- **Production**: Skips automatic database sync for safety
- **HTTPS mode**: Available via \`--https\` flag or \`USE_HTTPS=true\`

## 🐛 Common Debugging Steps

### Database Issues
1. Check connection: \`npm run db:check\`
2. Sync models: \`npm run db:sync:complete alter\`
3. Verify associations in \`models/index.js\` (many are commented out)

### Authentication Problems
1. Verify JWT secrets are set in environment
2. Check token expiration times
3. Use \`/api/auth/refresh\` for token renewal

### Route Registration Issues
1. Check route mounting in \`src/app.js\` lines 196-204
2. Verify Swagger tags match between routes and config
3. Use \`VERBOSE_LOGGING=true\` for detailed route listing

## 🚢 Deployment Context

### Production Server: \`206.62.139.11:3000\`
- Automated CI/CD via Jenkins pipeline
- Docker Compose with PostgreSQL and API services
- Health checks at \`/api/health\`
- External access configured for all interfaces (\`0.0.0.0\`)

### Key Production Commands
\`\`\`bash
docker-compose logs -f api          # Monitor application logs
docker-compose exec api npm run db:migrate  # Run database migrations
ssh ubuntu@206.62.139.11           # Server access
\`\`\`

## 💡 Development Tips

### When Adding New Endpoints
1. Create route in appropriate \`routes/\` subfolder
2. Add Swagger documentation with proper tags
3. Implement controller → service → model pattern
4. Test with authentication headers in Swagger UI

### When Modifying Models
1. Be cautious with associations in \`models/index.js\`
2. Use \`npm run db:sync:complete alter\` for schema changes
3. Consider impact on existing services that query the model

### When Working with Family Data
- Always exclude deceased persons using \`DifuntosFamilia\` table
- Return comprehensive person information (20+ fields)
- Use direct SQL queries if Sequelize associations fail

This system emphasizes **data completeness** (returning full person profiles), **geographic flexibility** (complex location hierarchies), and **production stability** (careful association management to prevent circular dependencies).`;

function generateCopilotInstructions() {
  console.log('🚀 Generating Copilot instructions...');
  
  const outputDir = path.join(__dirname, '.github');
  const outputFile = path.join(outputDir, 'copilot-instructions.md');
  
  try {
    // Create .github directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('📁 Created .github directory');
    }
    
    // Write the instructions file
    fs.writeFileSync(outputFile, copilotInstructionsContent, 'utf8');
    
    console.log('✅ Successfully generated Copilot instructions!');
    console.log(`📄 File created at: ${outputFile}`);
    console.log(`📊 File size: ${Math.round(copilotInstructionsContent.length / 1024 * 100) / 100} KB`);
    console.log(`📝 Content includes:`);
    console.log('   • Architecture overview and project structure');
    console.log('   • Development workflows and commands');
    console.log('   • Critical patterns and conventions');
    console.log('   • Environment configuration');
    console.log('   • Debugging steps and deployment context');
    console.log('   • Development tips and best practices');
    
  } catch (error) {
    console.error('❌ Error generating Copilot instructions:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateCopilotInstructions();
