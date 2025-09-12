# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 8080)
- **Build production**: `npm run build` 
- **Build development**: `npm run build:dev`
- **Lint**: `npm run lint`
- **Preview**: `npm run preview`

## Project Architecture

This is a React sales dashboard application built with Vite, TypeScript, and modern tooling.

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Firebase (Authentication & Firestore Database)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

### Directory Structure
- `src/components/` - Reusable components including shadcn/ui components in `ui/` subfolder
- `src/pages/` - Page components (Index, Login, Targets, ManualEntry, NotFound)
- `src/services/` - API services (BaseApiService for legacy APIs, FirestoreService for Firebase)
- `src/hooks/` - Custom React hooks (useAuth, useFirebaseAuth for authentication)
- `src/lib/` - Library configurations (firebase.ts for Firebase config)
- `src/utils/` - Utility functions for data processing and validation
- `src/types/` - TypeScript type definitions

### Authentication System
- **Firebase Authentication** with email/password login and user registration
- Role-based access control (admin/editor/tester) stored in Firestore
- Authentication state managed via AuthProvider and useFirebaseAuth hook
- User profile data stored in Firestore `users` collection
- Protected routes require Firebase authentication
- Thai language interface for login/signup forms

### Data Storage
- **Primary**: Firebase Firestore for user data, manual orders, and sales targets
- **Legacy**: BaseApiService for existing API endpoints (https://cflowdev.cigblusolutions.com/api)
- **Collections**: `users`, `manual_orders`, `sales_targets` in Firestore
- **FirestoreService**: Comprehensive service for CRUD operations with Firebase
- Environment variables in `.env` file for Firebase configuration (see `.env.example`)

### Business Logic
- Supports 5 business units: Coil, Unit, M&E, HBPM, MKT
- Target management with monthly/annual input methods and rollover strategies
- Manual order entry system with margin band analysis
- Data filtering and aggregation utilities for sales reporting

### Key Components
- `AuthProvider` - Authentication context provider
- `DashboardHeader` - Main navigation and user selection
- `OrderForm` - Manual order entry form
- `TargetActualChart` - Chart component for target vs actual visualization
- Various filter and input components for dashboard functionality

## Code Style
- ESLint configured with TypeScript rules
- React hooks and refresh plugins enabled
- Unused variables rule disabled
- Use absolute imports with @ alias pointing to src/