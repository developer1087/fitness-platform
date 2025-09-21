---
name: analyze-auth-system
description: Deep dive analysis of the authentication system
---

Analyze the complete authentication system implementation:

1. **Firebase Integration**
   - Use `get-code` to examine Firebase configuration files
   - Map authentication service implementation
   - Document emulator setup and development workflow

2. **React Auth Context**
   - Use `find-direct-connections` on useAuth hook
   - Map context provider implementation
   - Analyze state management patterns

3. **Authentication Flow**
   - Trace login/signup component implementations
   - Map form validation and error handling
   - Document redirect and navigation logic

4. **Security Analysis**
   - Use `nodes-semantic-search` for security-related code
   - Check for proper error handling
   - Validate secure authentication practices

5. **User Management**
   - Examine user profile creation and storage
   - Map Firestore integration for user data
   - Document user roles and permissions

Provide detailed analysis including:
- Authentication flow diagrams
- Security assessment
- Code quality review
- Recommended improvements