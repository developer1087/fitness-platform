---
name: setup-feature
description: Set up a new feature branch and basic structure
---

Create a new feature following our project conventions:

## Steps:

1. **Create feature branch**
   ```bash
   git checkout -b feature/$ARGUMENTS
   ```

2. **Create feature directory structure**
   ```bash
   mkdir -p apps/web/src/app/(dashboard)/$ARGUMENTS
   mkdir -p apps/web/src/components/$ARGUMENTS
   mkdir -p apps/mobile/src/screens/$ARGUMENTS
   mkdir -p packages/shared-types/src/$ARGUMENTS
   ```

3. **Create TypeScript interfaces**
   - Add types in `packages/shared-types/src/$ARGUMENTS/types.ts`
   - Export from `packages/shared-types/src/index.ts`

4. **Create web components**
   - Page component: `apps/web/src/app/(dashboard)/$ARGUMENTS/page.tsx`
   - Feature components: `apps/web/src/components/$ARGUMENTS/`
   - Add to navigation if needed

5. **Create mobile screens**
   - Screen component: `apps/mobile/src/screens/$ARGUMENTS/`
   - Add to navigation stack

6. **API endpoints (if needed)**
   - Create: `apps/web/src/app/api/$ARGUMENTS/route.ts`
   - Add database schemas if required

7. **Testing setup**
   - Unit tests: `__tests__/$ARGUMENTS/`
   - Integration tests as needed

8. **Documentation**
   - Update feature list
   - Add component documentation

## Usage:
```bash
claude setup-feature user-profile
claude setup-feature workout-tracking
```

Follow our naming conventions: kebab-case for directories, PascalCase for components.