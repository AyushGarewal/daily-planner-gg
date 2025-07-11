# Task Management & Productivity Application

## Overview
This is a comprehensive full-stack task management and productivity application built with React/TypeScript frontend, Express backend, and PostgreSQL database. The app features gamification elements, habit tracking, goal management, and wellness logging with a modern, responsive UI using shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui (Radix UI components) with Tailwind CSS
- **State Management**: React hooks with custom hooks for data management
- **Routing**: React Router for client-side navigation
- **Build Tool**: Vite for fast development and building
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple
- **Development**: tsx for TypeScript execution in development

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema validation
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Core Features
1. **Task Management**: Create, edit, complete, and organize tasks with categories and priorities
2. **Habit Tracking**: Daily/weekly recurring habits with streak tracking
3. **Goal Setting**: Long-term goals with milestones and progress tracking
4. **Gamification**: XP system, levels, achievements, trophies, and power-ups
5. **Wellness Tracking**: Mood, sleep, water intake, and calorie tracking
6. **Project Management**: Organize tasks into projects with timelines
7. **Routine Builder**: Create morning/evening routines with habit integration
8. **Challenges**: Custom challenges and habit-linked challenges

### State Management
- **Local Storage**: Extensive use for client-side persistence
- **Custom Hooks**: Dedicated hooks for tasks, achievements, XP system, goals, etc.
- **React Query**: For server state management and caching

### Component Structure
- **Reusable UI**: shadcn/ui components for consistent design
- **Feature Components**: Specialized components for each major feature
- **Form Handling**: Dedicated form components with validation
- **Data Visualization**: Charts for progress tracking and analytics

## Data Flow

### Client-Side Data Flow
1. User interactions trigger custom hooks
2. Hooks update local storage and component state
3. UI components reactively update based on state changes
4. Form submissions validate data before processing

### Gamification System
1. Task completion triggers XP calculations
2. XP changes update user level and progress
3. Achievement system checks for unlocked trophies
4. Power-ups and inventory items are managed through dedicated systems

### Habit & Routine Integration
1. Routines generate daily habit tasks automatically
2. Habit completion contributes to streak tracking
3. Side habits and negative habits operate independently
4. Challenge system integrates with habit performance

## External Dependencies

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components via shadcn/ui
- **PostCSS**: CSS processing with autoprefixer

### Data and Validation
- **Zod**: Schema validation for forms and data
- **date-fns**: Date manipulation and formatting
- **React Hook Form**: Form state management

### Charts and Visualization
- **Recharts**: Chart library for data visualization
- **Lucide React**: Icon library

### Database and Backend
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL hosting
- **Express**: Web server framework

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Module Replacement**: Vite provides fast development feedback
- **TypeScript Checking**: Real-time type checking during development

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Production**: Node.js serves built application

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Development**: Automatic Vite middleware integration
- **Production**: Serves static files from Express

### Storage Strategy
- **Session Data**: PostgreSQL with connect-pg-simple
- **User Data**: Local storage for offline capability
- **Task Persistence**: Combination of local storage and planned database integration

The application is designed to work primarily with client-side storage while maintaining the infrastructure for future server-side data persistence. The modular architecture allows for easy extension and feature additions.