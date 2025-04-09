# Akari Manga Reader - GitHub Copilot Instructions

## Project Overview

Akari is a Next.js application that provides an enhanced manga reading experience for Manganato users, with features like bookmarks, reading history, and a modern UI.

## Development Guidelines

### TypeScript

- Always use TypeScript interfaces and types for all components, functions, and variables
- Create proper type definitions for API responses, component props, and state
- Use explicit return types for functions and React components
- Leverage union and intersection types when appropriate

### Next.js App Router Practices

- Use server components by default, only add "use client" when necessary
- Implement proper error handling and loading states
- Use metadata exports for SEO optimization

### UI Components

- Use shadcn/ui components from `@/components/ui/*` for consistency
- Follow the established styling patterns with Tailwind CSS classes
- Use the cn() utility function from `@/lib/utils` for conditional class names
- Implement proper accessibility attributes on all UI components
- Utilize the toast system from `@/lib/toast` for notifications

### Project-Specific Patterns

- Use the sidebar component system for navigation
- Implement keyboard shortcuts following the existing pattern
