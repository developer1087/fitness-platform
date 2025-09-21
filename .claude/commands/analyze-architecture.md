---
name: analyze-architecture
description: Complete architectural overview of the fitness platform
---

Perform a comprehensive architectural analysis of our fitness platform:

1. **Repository Structure Analysis**
   - Use `list-graphs` to get repository overview
   - Map the monorepo structure (web app, mobile app, shared packages)
   - Identify key directories and their purposes

2. **Component Architecture**
   - Use `nodes-semantic-search` to find all React components
   - Map component hierarchy and relationships
   - Identify reusable UI components

3. **Authentication System**
   - Use `find-direct-connections` on authentication files
   - Map Firebase auth integration points
   - Document auth flow and user management

4. **Data Flow Analysis**
   - Find API endpoints and database schemas
   - Map data flow between components
   - Identify state management patterns

5. **Documentation Discovery**
   - Use `docs-semantic-search` to find existing documentation
   - Locate setup guides and architecture docs

Provide a complete architectural overview with:
- System diagram
- Component relationships
- Data flow patterns
- Technology stack summary
- Areas for improvement