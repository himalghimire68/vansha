# 🌳 Vansha - Ancestral Relationship Intelligence Platform

> *Private-by-default genealogy and lineage preservation platform for Nepal*

## 🎯 Vision

Vansha empowers Nepali families to build, preserve, and share their ancestral lineage with privacy, elegance, and cultural respect. The platform combines premium UX with sophisticated relationship intelligence to create a living legacy that respects family governance and privacy.

## ✨ Core Features

- **Family Tree Building** - Intuitive genealogical data entry with visual graph representation
- **Ancestral Preservation** - Preserve stories, photos, and historical data for future generations
- **Relationship Intelligence** - AI-powered detection of shared ancestors and cousin calculations
- **Memorial Pages** - Honor deceased family members with biography, timeline, and family stories
- **Privacy by Default** - All family trees private; extended family access requires explicit permissions
- **Approval Workflow** - Ancestor edits require elder/admin approval for data integrity
- **OCR Import** - Extract genealogy from Vanshavali books and scanned documents
- **Event Management** - Coordinate weddings, ceremonies, and family gatherings
- **Uncertain Dates** - Support for historical records with approximate or estimated dates
- **Female Lineage** - Full support for maternal line preservation

## 🏛️ Architecture Philosophy

**Modular Monolith** - Easy to deploy, refactorable to microservices
**Clean Architecture** - Controllers → Services → Repositories → Database
**Domain-Driven Design** - Folder structure mirrors business domains
**Type-Safe** - Strict TypeScript with Zod validation throughout
**Privacy-First** - All data access controlled by granular permissions

## 📊 Tech Stack

### Frontend
- **Next.js 15** - React 19 with server/client components
- **TypeScript** - Strict mode, no `any` types
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Accessible component library
- **React Flow** - Graph visualization for family trees

### Backend
- **NestJS** - Scalable Node.js framework
- **TypeScript** - Strict types everywhere
- **Clean Architecture** - Separation of concerns

### Databases
- **PostgreSQL** - ACID-compliant relational DB for metadata, governance, auth
- **Neo4j** - Graph database for genealogical relationships

### Infrastructure
- **Redis** - Caching and sessions
- **Meilisearch** - Full-text search engine
- **Cloudflare R2** - File storage (S3-compatible)
- **Docker** - Containerization
- **Turborepo** - Monorepo orchestration

### Services
- **Clerk** - Authentication & user management
- **OpenAI** - OCR and AI-powered features

## 📁 Project Structure

```
vansha/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── mobile/           # Flutter app (phase 2)
│   └── api/              # NestJS backend
│       ├── src/
│       │   ├── auth/
│       │   ├── families/
│       │   ├── people/
│       │   ├── relationships/
│       │   ├── approvals/
│       │   ├── notifications/
│       │   └── common/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── shared-types/     # Shared TypeScript interfaces
│   ├── ui/               # Reusable React components
│   ├── graph-engine/     # Neo4j queries & algorithms
│   └── ai-services/      # OpenAI integration
├── scripts/
│   ├── init.sql          # PostgreSQL schema
│   ├── seed.ts           # Test data generation
│   └── deploy.sh         # Deployment automation
├── docker-compose.yml    # Local development stack
├── package.json          # Root monorepo config
├── turbo.json            # Build pipeline config
└── tsconfig.json         # Root TypeScript config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Neo4j 5+

### Setup

```bash
# Clone repository
git clone https://github.com/himalghimire68/vansha.git
cd vansha

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start infrastructure
npm run docker:up

# Run migrations (when ready)
npm run db:migrate

# Start development servers
npm run dev
```

App will be available at:
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Neo4j Browser**: http://localhost:7474
- **Meilisearch**: http://localhost:7700

## 📋 Database Schema

### PostgreSQL (Relational)

**Core Tables:**
- `users` - User accounts with Clerk integration
- `families` - Family tree roots
- `family_members` - RBAC with granular permissions
- `people` - Genealogical data with privacy controls
- `approval_requests` - Workflow for ancestor edits
- `media_uploads` - Photos and documents
- `events` - Ceremonies, weddings, gatherings
- `invitations` - Family member invitations
- `audit_logs` - Immutable action trail
- `notifications` - Multi-channel notifications

**Features:**
- ✅ Soft deletes for data recovery
- ✅ Automatic timestamp management
- ✅ 40+ optimized indexes
- ✅ Referential integrity constraints
- ✅ RBAC with 5 roles

### Neo4j (Graph Database)

**Node Types:**
- `Person` - Genealogical individuals
- `Family` - Family tree root
- `User` - System actors (audit trail)

**Relationships:**
- `FATHER_OF` - Paternal connections
- `MOTHER_OF` - Maternal connections
- `MARRIED_TO` - Spousal relationships
- `SIBLING_OF` - Sibling relationships
- `ADOPTED_BY` - Adoption relationships

**Capabilities:**
- O(1) ancestor traversal
- Shortest path for relationship detection
- Shared ancestor identification
- Cousin distance calculation
- Data quality analysis

## 🔐 Privacy & Security

### Privacy by Default
- All family trees are **private** by default
- Logged-in users see **direct family only** (configurable depth)
- Extended family access requires explicit **permissions**
- Living person data protected with visibility controls

### Security
- **RBAC** with 5 roles and granular permissions
- **Rate limiting** on all APIs
- **Audit logs** for compliance
- **Secure file uploads** with signed URLs
- **CSRF & XSS protection**
- **Encrypted sensitive data**

### Approval Workflow
- Ancestor edits create **approval requests**
- Elder/admin must **approve** before changes persist
- Full **audit trail** of approvals
- **Expiring requests** to prevent stale approvals

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev              # Start all apps in parallel

# Building
npm run build            # Build all apps
npm run clean            # Clean all artifacts

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode

# Quality
npm run lint             # Lint all code
npm run type-check       # TypeScript type check
npm run format           # Format code with Prettier

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed test data

# Docker
npm run docker:up        # Start infrastructure
npm run docker:down      # Stop infrastructure
npm run docker:logs      # View logs
```

## 📈 Performance

### Database
- **40+ indexes** on frequently queried columns
- **Partitioning** on large tables (planned)
- **Materialized views** for complex queries
- **Connection pooling** (min:5, max:20)

### Caching
- **Redis** for session & query caching
- **Cache invalidation** on data changes
- **TTL-based expiration**

### API
- **Pagination** on all list endpoints
- **Lazy loading** for graph relationships
- **Query optimization** for Neo4j traversals

## 🚢 Deployment

### Development
```bash
docker-compose up -d
npm run dev
```

### Production (Coming Soon)
- **Vercel** - Frontend hosting
- **Railway** - API hosting
- **Neo4j Aura** - Managed graph database
- **CloudFlare** - CDN and security
- **GitHub Actions** - CI/CD pipeline

## 📚 Documentation

- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - PostgreSQL detailed schema
- [NEO4J_SCHEMA.md](./docs/NEO4J_SCHEMA.md) - Graph design & queries
- [API_ARCHITECTURE.md](./docs/API_ARCHITECTURE.md) - Backend structure
- [FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md) - Frontend design
- [PRIVACY_GUIDELINES.md](./docs/PRIVACY_GUIDELINES.md) - Privacy implementation

## 🎯 Roadmap

### Phase 1 (MVP - Current)
- ✅ Authentication (Clerk)
- ✅ Person CRUD
- ✅ Family tree visualization
- ✅ Relationship checker
- ✅ Search system
- ✅ Memorial pages
- ✅ Privacy & RBAC
- ✅ Approval workflow

### Phase 2
- OCR import with confidence scoring
- Event invitations & RSVPs
- Email/Push notifications
- Timeline visualization

### Phase 3
- Flutter mobile app
- AI-powered family explanations
- Advanced analytics
- Social sharing (family-only)

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

MIT - See [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

Inspired by ancestry.com, MyHeritage, and designed with Nepali cultural sensitivity.

---

**Built with ❤️ for Nepal's families**
