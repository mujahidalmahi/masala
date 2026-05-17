**User:**

<task>Command 'review' (see below for command content) Git commit '51966ea3597fcf4eb96c0dbe965d85dd42430994' (see below for commit info)
</task>

<git_commit hash="51966ea3597fcf4eb96c0dbe965d85dd42430994">
Commit: 51966ea (51966ea3597fcf4eb96c0dbe965d85dd42430994)
Author: Chowdhury Rifat Ahmed
Date: Sat May 16 01:16:03 2026 +0600

Message: docs: add comprehensive authentication system with API documentation and bug report


Files Changed:
API_DOCUMENTATION.md                    | 1004 +++++++++++++++++++
 BUG_REPORT.md                           |  408 ++++++++
 IMPLEMENTATION_SUMMARY.md               |  793 +++++++++++++++
 package-lock.json                       | 1636 ++++++++++++++++++++++++++++++-
 package.json                            |   18 +-
 src/components/layout/Header.tsx        |  207 ++--
 src/components/views/CurriculumView.tsx |   23 +-
 src/components/views/FocusTimer.tsx     |   66 +-
 src/components/views/QuizView.tsx       |    3 +-
 src/index.css                           |   55 ++
 src/services/authService.ts             |  963 ++++++++++++++++++
 src/tests/auth.test.ts                  |  730 ++++++++++++++
 src/types/auth.types.ts                 |  354 +++++++
 src/utils/security.ts                   |  498 ++++++++++
 src/utils/xpCalculator.ts               |   83 ++
 15 files changed, 6728 insertions(+), 113 deletions(-)

Full Changes:

diff --git a/API_DOCUMENTATION.md b/API_DOCUMENTATION.md
new file mode 100644
index 0000000..c26616a
--- /dev/null
+++ b/API_DOCUMENTATION.md
@@ -0,0 +1,1004 @@
+# Authentication System API Documentation
+
+**Version:** 1.0.0  
+**Last Updated:** 2026-05-15
+
+---
+
+## Table of Contents
+
+1. [Overview](#overview)
+2. [Authentication Flow](#authentication-flow)
+3. [Security Features](#security-features)
+4. [API Endpoints](#api-endpoints)
+5. [Data Models](#data-models)
+6. [Error Handling](#error-handling)
+7. [Rate Limiting](#rate-limiting)
+8. [Testing](#testing)
+9. [Deployment](#deployment)
+
+---
+
+## Overview
+
+This authentication system provides comprehensive user authentication and authorization with enterprise-grade security features including:
+
+- **Secure Password Hashing** with bcrypt (12 salt rounds)
+- **JWT-based Session Management** with refresh tokens
+- **Two-Factor Authentication** (TOTP, SMS, Email)
+- **Account Lockout** after failed login attempts
+- **Rate Limiting** to prevent brute force attacks
+- **CSRF Protection** for all state-changing operations
+- **Input Validation & Sanitization** to prevent XSS/SQL injection
+- **Role-Based Access Control** (Admin, Moderator, User)
+- **Security Event Logging** for audit trails
+- **Password Reset** with secure tokens
+- **Email Verification** for new accounts
+
+---
+
+## Authentication Flow
+
+### Registration Flow
+
+```
+1. User submits registration form
+   ↓
+2. Validate input data (email, username, password strength)
+   ↓
+3. Check for existing email/username
+   ↓
+4. Hash password with bcrypt + salt
+   ↓
+5. Create user account (status: pending_verification)
+   ↓
+6. Generate email verification token
+   ↓
+7. Send verification email
+   ↓
+8. Return success response
+```
+
+### Login Flow
+
+```
+1. User submits credentials (email/username + password)
+   ↓
+2. Find user by email or username

[...6977 lines omitted...]

+  if (!username || username.trim().length === 0) {
+    return { isValid: false, error: 'Username is required' };
+  }
+
+  if (username.length < 3) {
+    return { isValid: false, error: 'Username must be at least 3 characters long' };
+  }
+
+  if (username.length > 30) {
+    return { isValid: false, error: 'Username must not exceed 30 characters' };
+  }
+
+  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
+    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
+  }
+
+  if (/^[0-9]/.test(username)) {
+    return { isValid: false, error: 'Username cannot start with a number' };
+  }
+
+  return { isValid: true };
+}
+
+/**
+ * Sanitize user input to prevent XSS attacks
+ * @param input - User input string
+ * @returns Sanitized string
+ */
+export function sanitizeInput(input: string): string {
+  if (!input) return '';
+  
+  // Use DOMPurify to sanitize HTML
+  const sanitized = DOMPurify.sanitize(input, {
+    ALLOWED_TAGS: [],
+    ALLOWED_ATTR: [],
+  });
+
+  // Additional sanitization
+  return sanitized
+    .trim()
+    .replace(/[<>]/g, '') // Remove any remaining angle brackets
+    .slice(0, 1000); // Limit length
+}
+
+/**
+ * Sanitize HTML content (for rich text)
+ * @param html - HTML content
+ * @returns Sanitized HTML
+ */
+export function sanitizeHTML(html: string): string {
+  if (!html) return '';
+  
+  return DOMPurify.sanitize(html, {
+    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
+    ALLOWED_ATTR: ['href', 'target', 'rel'],
+  });
+}
+
+/**
+ * Generate a secure random token
+ * @param length - Token length (default: 32)
+ * @returns Random token string
+ */
+export function generateSecureToken(length: number = 32): string {
+  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
+  let token = '';
+  
+  // Use crypto.getRandomValues for secure random generation
+  const randomValues = new Uint8Array(length);
+  crypto.getRandomValues(randomValues);
+  
+  for (let i = 0; i < length; i++) {
+    token += chars[randomValues[i] % chars.length];
+  }
+  
+  return token;
+}
+
+/**
+ * Generate a UUID v4
+ * @returns UUID string
+ */
+export function generateUUID(): string {
+  return uuidv4();
+}
+
+/**
+ * Generate backup codes for 2FA
+ * @param count - Number of codes to generate (default: 10)
+ * @returns Array of backup codes
+ */
+export function generateBackupCodes(count: number = 10): string[] {
+  const codes: string[] = [];
+  
+  for (let i = 0; i < count; i++) {
+    // Generate 8-character alphanumeric code
+    const code = generateSecureToken(8).toUpperCase();
+    // Format as XXXX-XXXX
+    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
+  }
+  
+  return codes;
+}
+
+/**
+ * Hash backup codes for storage
+ * @param codes - Array of backup codes
+ * @returns Promise with array of hashed codes
+ */
+export async function hashBackupCodes(codes: string[]): Promise<string[]> {
+  const hashedCodes = await Promise.all(
+    codes.map(async (code) => {
+      const { hash } = await hashPassword(code, 10);
+      return hash;
+    })
+  );
+  return hashedCodes;
+}
+
+/**
+ * Verify backup code against hashed codes
+ * @param code - Backup code to verify
+ * @param hashedCodes - Array of hashed backup codes
+ * @returns Promise with verification result and used code index
+ */
+export async function verifyBackupCode(
+  code: string,
+  hashedCodes: string[]
+): Promise<{ isValid: boolean; usedIndex?: number }> {
+  for (let i = 0; i < hashedCodes.length; i++) {
+    const isValid = await verifyPassword(code, hashedCodes[i]);
+    if (isValid) {
+      return { isValid: true, usedIndex: i };
+    }
+  }
+  return { isValid: false };
+}
+
+/**
+ * Generate CSRF token
+ * @returns CSRF token
+ */
+export function generateCSRFToken(): string {
+  return generateSecureToken(64);
+}
+
+/**
+ * Validate CSRF token
+ * @param token - Token to validate
+ * @param storedToken - Stored token
+ * @returns Boolean result
+ */
+export function validateCSRFToken(token: string, storedToken: string): boolean {
+  if (!token || !storedToken) return false;
+  return token === storedToken;
+}
+
+/**
+ * Mask email for display
+ * @param email - Email to mask
+ * @returns Masked email
+ */
+export function maskEmail(email: string): string {
+  if (!email || !email.includes('@')) return '***';
+  
+  const [localPart, domain] = email.split('@');
+  const maskedLocal = localPart.length > 2
+    ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
+    : '*'.repeat(localPart.length);
+  
+  return `${maskedLocal}@${domain}`;
+}
+
+/**
+ * Mask phone number for display
+ * @param phone - Phone number to mask
+ * @returns Masked phone number
+ */
+export function maskPhoneNumber(phone: string): string {
+  if (!phone) return '***';
+  
+  const cleaned = phone.replace(/\D/g, '');
+  if (cleaned.length < 4) return '*'.repeat(cleaned.length);
+  
+  return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
+}
+
+/**
+ * Check if IP address is valid
+ * @param ip - IP address to validate
+ * @returns Boolean result
+ */
+export function isValidIP(ip: string): boolean {
+  return validator.isIP(ip);
+}
+
+/**
+ * Rate limit key generator
+ * @param identifier - User identifier (IP or user ID)
+ * @param action - Action being rate limited
+ * @returns Rate limit key
+ */
+export function generateRateLimitKey(identifier: string, action: string): string {
+  return `ratelimit:${action}:${identifier}`;
+}
+
+/**
+ * Validate and sanitize registration data
+ * @param data - Registration data
+ * @returns Validation errors array
+ */
+export function validateRegistrationData(data: {
+  email: string;
+  username: string;
+  password: string;
+  confirmPassword: string;
+  firstName: string;
+  lastName: string;
+}): ValidationError[] {
+  const errors: ValidationError[] = [];
+
+  // Email validation
+  const emailValidation = validateEmail(data.email);
+  if (!emailValidation.isValid) {
+    errors.push({
+      field: 'email',
+      message: emailValidation.error!,
+      code: 'INVALID_EMAIL',
+    });
+  }
+
+  // Username validation
+  const usernameValidation = validateUsername(data.username);
+  if (!usernameValidation.isValid) {
+    errors.push({
+      field: 'username',
+      message: usernameValidation.error!,
+      code: 'INVALID_USERNAME',
+    });
+  }
+
+  // Password validation
+  const passwordStrength = checkPasswordStrength(data.password);
+  if (!passwordStrength.isValid) {
+    errors.push({
+      field: 'password',
+      message: passwordStrength.feedback.join('. '),
+      code: 'WEAK_PASSWORD',
+    });
+  }
+
+  // Password confirmation
+  if (data.password !== data.confirmPassword) {
+    errors.push({
+      field: 'confirmPassword',
+      message: 'Passwords do not match',
+      code: 'PASSWORD_MISMATCH',
+    });
+  }
+
+  // First name validation
+  if (!data.firstName || data.firstName.trim().length === 0) {
+    errors.push({
+      field: 'firstName',
+      message: 'First name is required',
+      code: 'REQUIRED_FIELD',
+    });
+  } else if (data.firstName.length > 50) {
+    errors.push({
+      field: 'firstName',
+      message: 'First name is too long',
+      code: 'FIELD_TOO_LONG',
+    });
+  }
+
+  // Last name validation
+  if (!data.lastName || data.lastName.trim().length === 0) {
+    errors.push({
+      field: 'lastName',
+      message: 'Last name is required',
+      code: 'REQUIRED_FIELD',
+    });
+  } else if (data.lastName.length > 50) {
+    errors.push({
+      field: 'lastName',
+      message: 'Last name is too long',
+      code: 'FIELD_TOO_LONG',
+    });
+  }
+
+  return errors;
+}
+
+/**
+ * Constant-time string comparison to prevent timing attacks
+ * @param a - First string
+ * @param b - Second string
+ * @returns Boolean result
+ */
+export function constantTimeCompare(a: string, b: string): boolean {
+  if (a.length !== b.length) return false;
+  
+  let result = 0;
+  for (let i = 0; i < a.length; i++) {
+    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
+  }
+  
+  return result === 0;
+}
+
+// Made with Bob
diff --git a/src/utils/xpCalculator.ts b/src/utils/xpCalculator.ts
new file mode 100644
index 0000000..9a15c1c
--- /dev/null
+++ b/src/utils/xpCalculator.ts
@@ -0,0 +1,83 @@
+/**
+ * Centralized XP calculation utility
+ * Ensures consistent XP rewards across the application
+ */
+
+export type ActivityType = 'focus' | 'quiz' | 'session';
+
+export interface XPCalculationParams {
+  activityType: ActivityType;
+  duration?: number; // in minutes
+  score?: number; // quiz score (number of correct answers)
+  performanceMetrics?: {
+    accuracy?: number; // percentage
+    difficulty?: 'easy' | 'medium' | 'hard';
+  };
+}
+
+// Base XP rates
+const XP_RATES = {
+  FOCUS_PER_MINUTE: 4,
+  QUIZ_PER_CORRECT: 15,
+  SESSION_BASE: 100,
+} as const;
+
+/**
+ * Calculate XP based on activity type and performance metrics
+ */
+export function calculateXP(params: XPCalculationParams): number {
+  const { activityType, duration = 0, score = 0, performanceMetrics } = params;
+
+  switch (activityType) {
+    case 'focus':
+      // Focus sessions: duration * 4 XP per minute
+      return Math.floor(duration * XP_RATES.FOCUS_PER_MINUTE);
+
+    case 'quiz':
+      // Quiz: score * 15 XP per correct answer
+      let quizXP = score * XP_RATES.QUIZ_PER_CORRECT;
+      
+      // Apply difficulty multiplier if provided
+      if (performanceMetrics?.difficulty) {
+        const difficultyMultiplier = {
+          easy: 1.0,
+          medium: 1.2,
+          hard: 1.5,
+        };
+        quizXP *= difficultyMultiplier[performanceMetrics.difficulty];
+      }
+      
+      return Math.floor(quizXP);
+
+    case 'session':
+      // Study sessions: base XP + duration bonus
+      let sessionXP = XP_RATES.SESSION_BASE + (duration * XP_RATES.FOCUS_PER_MINUTE);
+      
+      // Apply accuracy bonus if provided
+      if (performanceMetrics?.accuracy !== undefined) {
+        const accuracyBonus = (performanceMetrics.accuracy / 100) * 50;
+        sessionXP += accuracyBonus;
+      }
+      
+      return Math.floor(sessionXP);
+
+    default:
+      return 0;
+  }
+}
+
+/**
+ * Get XP rate information for display purposes
+ */
+export function getXPRateInfo(activityType: ActivityType): string {
+  switch (activityType) {
+    case 'focus':
+      return `${XP_RATES.FOCUS_PER_MINUTE} XP per minute`;
+    case 'quiz':
+      return `${XP_RATES.QUIZ_PER_CORRECT} XP per correct answer`;
+    case 'session':
+      return `${XP_RATES.SESSION_BASE} base XP + ${XP_RATES.FOCUS_PER_MINUTE} XP per minute`;
+    default:
+      return 'Unknown activity type';
+  }
+}
</git_commit>


<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:16:58.462Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.00

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>


# Current Workspace Directory (c:/Users/Rifat/Desktop/Masala/masala) Files
.gitignore
API_DOCUMENTATION.md
BUG_REPORT.md
IMPLEMENTATION_SUMMARY.md
index.html
LICENSE
package-lock.json
package.json
README.md
tsconfig.json
vite.config.ts
public/
public/og-image.png
src/
src/App.tsx
src/index.css
src/main.tsx
src/components/
src/components/layout/
src/components/layout/Header.tsx
src/components/layout/Sidebar.tsx
src/components/views/
src/components/views/CurriculumView.tsx
src/components/views/Dashboard.tsx
src/components/views/FocusTimer.tsx
src/components/views/Leaderboard.tsx
src/components/views/NotesView.tsx
src/components/views/PredictionView.tsx
src/components/views/QuizView.tsx
src/components/views/ReportsView.tsx
src/components/views/RoutineView.tsx
src/components/views/SkillTree.tsx
src/components/views/StudyRooms.tsx
src/data/
src/data/curriculum.ts
src/services/
src/services/authService.ts
src/store/
src/store/useStore.ts
src/tests/
src/tests/auth.test.ts
src/types/
src/types/auth.types.ts
src/utils/
src/utils/cn.ts
src/utils/security.ts
src/utils/xpCalculator.ts
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

I'll switch to advanced mode and begin the code review of this commit.

<switch_mode>
<mode_slug>advanced</mode_slug>
<reason>Starting code review workflow as requested</reason>
</switch_mode>

---

**User:**

[switch_mode to 'advanced' because: Starting code review workflow as requested] Result:
Already in 🛠️ Advanced mode.
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:17:04.163Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.05

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

I'll now get the git diff to see all the changes in this commit.

<obtain_git_diff>
</obtain_git_diff>

---

**User:**

[obtain_git_diff({})] Result:
<obtain_git_diff><notice>No changes found in the working directory</notice></obtain_git_diff>
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:17:10.404Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.11

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

Since there are no local changes, I need to review the specific commit. Let me use execute_command to get the diff for that commit.

<execute_command>
<command>git show 51966ea3597fcf4eb96c0dbe965d85dd42430994 --stat</command>
</execute_command>

---

**User:**

[execute_command for 'git show 51966ea3597fcf4eb96c0dbe965d85dd42430994 --stat'] Result:
Command executed in terminal  within working directory 'c:/Users/Rifat/Desktop/Masala/masala'. Exit code: 0
Output:
commit 51966ea3597fcf4eb96c0dbe965d85dd42430994
Author: Chowdhury Rifat Ahmed <chowdhuryrifat113@gmail.com>
Date:   Sat May 16 01:16:03 2026 +0600

    docs: add comprehensive authentication system with API documentation and bug report

 API_DOCUMENTATION.md                    | 1004 +++++++++++++++++++
 BUG_REPORT.md                           |  408 ++++++++
 IMPLEMENTATION_SUMMARY.md               |  793 +++++++++++++++
 package-lock.json                       | 1636 ++++++++++++++++++++++++++++++-
 package.json                            |   18 +-
 src/components/layout/Header.tsx        |  207 ++--
 src/components/views/CurriculumView.tsx |   23 +-
 src/components/views/FocusTimer.tsx     |   66 +-
 src/components/views/QuizView.tsx       |    3 +-
 src/index.css                           |   55 ++
 src/services/authService.ts             |  963 ++++++++++++++++++
 src/tests/auth.test.ts                  |  730 ++++++++++++++
 src/types/auth.types.ts                 |  354 +++++++
 src/utils/security.ts                   |  498 ++++++++++
 src/utils/xpCalculator.ts               |   83 ++
 15 files changed, 6728 insertions(+), 113 deletions(-)

<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:17:25.732Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.17

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

Now let me read the key source files that were changed to understand the implementation. I'll start with the core files.

<read_file>
<args>
  <file>
    <path>src/services/authService.ts</path>
  </file>
  <file>
    <path>src/utils/security.ts</path>
  </file>
  <file>
    <path>src/types/auth.types.ts</path>
  </file>
  <file>
    <path>src/utils/xpCalculator.ts</path>
  </file>
  <file>
    <path>src/components/layout/Header.tsx</path>
  </file>
</args>
</read_file>

---

**User:**

[read_file for 5 files] Result:
<files>
<file><path>src/services/authService.ts</path>
<content lines="1-963">
  1 | /**
  2 |  * Authentication Service
  3 |  * Comprehensive authentication and authorization service with security features
  4 |  */
  5 | 
  6 | import jwt from 'jsonwebtoken';
  7 | import type {
  8 |   AuthUser,
  9 |   RegisterData,
 10 |   LoginCredentials,
 11 |   AuthResponse,
 12 |   Session,
 13 |   TokenPayload,
 14 |   LoginAttempt,
 15 |   PasswordResetRequest,
 16 |   PasswordResetConfirm,
 17 |   PasswordChangeRequest,
 18 |   TwoFactorSetup,
 19 |   TwoFactorVerification,
 20 |   SecurityEvent,
 21 |   LockoutConfig,
 22 |   RateLimitEntry,
 23 | } from '../types/auth.types';
 24 | import {
 25 |   hashPassword,
 26 |   verifyPassword,
 27 |   validateRegistrationData,
 28 |   validateEmail,
 29 |   generateSecureToken,
 30 |   generateUUID,
 31 |   generateBackupCodes,
 32 |   hashBackupCodes,
 33 |   verifyBackupCode,
 34 |   sanitizeInput,
 35 |   generateCSRFToken,
 36 | } from '../utils/security';
 37 | 
 38 | /**
 39 |  * Configuration
 40 |  */
 41 | const JWT_SECRET = process.env.VITE_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
 42 | const JWT_REFRESH_SECRET = process.env.VITE_JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
 43 | const JWT_EXPIRY = '15m'; // Access token expires in 15 minutes
 44 | const JWT_REFRESH_EXPIRY = '7d'; // Refresh token expires in 7 days
 45 | 
 46 | const LOCKOUT_CONFIG: LockoutConfig = {
 47 |   maxAttempts: 5,
 48 |   lockoutDurationMs: 30 * 60 * 1000, // 30 minutes
 49 |   resetAfterMs: 15 * 60 * 1000, // Reset counter after 15 minutes
 50 | };
 51 | 
 52 | /**
 53 |  * In-memory storage (replace with database in production)
 54 |  */
 55 | class AuthStorage {
 56 |   private users: Map<string, AuthUser> = new Map();
 57 |   private sessions: Map<string, Session> = new Map();
 58 |   private loginAttempts: Map<string, LoginAttempt[]> = new Map();
 59 |   private securityEvents: Map<string, SecurityEvent[]> = new Map();
 60 |   private rateLimits: Map<string, RateLimitEntry> = new Map();
 61 |   private csrfTokens: Map<string, string> = new Map();
 62 | 
 63 |   // User operations
 64 |   createUser(user: AuthUser): void {
 65 |     this.users.set(user.id, user);
 66 |   }
 67 | 
 68 |   getUserById(id: string): AuthUser | undefined {
 69 |     return this.users.get(id);
 70 |   }
 71 | 
 72 |   getUserByEmail(email: string): AuthUser | undefined {
 73 |     return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
 74 |   }
 75 | 
 76 |   getUserByUsername(username: string): AuthUser | undefined {
 77 |     return Array.from(this.users.values()).find(u => u.username.toLowerCase() === username.toLowerCase());
 78 |   }
 79 | 
 80 |   updateUser(id: string, updates: Partial<AuthUser>): void {
 81 |     const user = this.users.get(id);
 82 |     if (user) {
 83 |       this.users.set(id, { ...user, ...updates, updatedAt: new Date() });
 84 |     }
 85 |   }
 86 | 
 87 |   getAllUsers(): AuthUser[] {
 88 |     return Array.from(this.users.values());
 89 |   }
 90 | 
 91 |   // Session operations
 92 |   createSession(session: Session): void {
 93 |     this.sessions.set(session.id, session);
 94 |   }
 95 | 
 96 |   getSession(id: string): Session | undefined {
 97 |     return this.sessions.get(id);
 98 |   }
 99 | 
100 |   getSessionByToken(token: string): Session | undefined {
101 |     return Array.from(this.sessions.values()).find(s => s.token === token);
102 |   }
103 | 
104 |   getUserSessions(userId: string): Session[] {
105 |     return Array.from(this.sessions.values()).filter(s => s.userId === userId && s.status === 'active');
106 |   }
107 | 
108 |   updateSession(id: string, updates: Partial<Session>): void {
109 |     const session = this.sessions.get(id);
110 |     if (session) {
111 |       this.sessions.set(id, { ...session, ...updates });
112 |     }
113 |   }
114 | 
115 |   deleteSession(id: string): void {
116 |     this.sessions.delete(id);
117 |   }
118 | 
119 |   // Login attempt operations
120 |   addLoginAttempt(attempt: LoginAttempt): void {
121 |     const key = attempt.emailOrUsername.toLowerCase();
122 |     const attempts = this.loginAttempts.get(key) || [];
123 |     attempts.push(attempt);
124 |     this.loginAttempts.set(key, attempts);
125 |   }
126 | 
127 |   getLoginAttempts(emailOrUsername: string): LoginAttempt[] {
128 |     return this.loginAttempts.get(emailOrUsername.toLowerCase()) || [];
129 |   }
130 | 
131 |   clearLoginAttempts(emailOrUsername: string): void {
132 |     this.loginAttempts.delete(emailOrUsername.toLowerCase());
133 |   }
134 | 
135 |   // Security event operations
136 |   addSecurityEvent(event: SecurityEvent): void {
137 |     const events = this.securityEvents.get(event.userId) || [];
138 |     events.push(event);
139 |     this.securityEvents.set(event.userId, events);
140 |   }
141 | 
142 |   getSecurityEvents(userId: string): SecurityEvent[] {
143 |     return this.securityEvents.get(userId) || [];
144 |   }
145 | 
146 |   // Rate limit operations
147 |   getRateLimit(identifier: string): RateLimitEntry | undefined {
148 |     return this.rateLimits.get(identifier);
149 |   }
150 | 
151 |   setRateLimit(identifier: string, entry: RateLimitEntry): void {
152 |     this.rateLimits.set(identifier, entry);
153 |   }
154 | 
155 |   deleteRateLimit(identifier: string): void {
156 |     this.rateLimits.delete(identifier);
157 |   }
158 | 
159 |   // CSRF token operations
160 |   setCSRFToken(sessionId: string, token: string): void {
161 |     this.csrfTokens.set(sessionId, token);
162 |   }
163 | 
164 |   getCSRFToken(sessionId: string): string | undefined {
165 |     return this.csrfTokens.get(sessionId);
166 |   }
167 | 
168 |   deleteCSRFToken(sessionId: string): void {
169 |     this.csrfTokens.delete(sessionId);
170 |   }
171 | }
172 | 
173 | const storage = new AuthStorage();
174 | 
175 | /**
176 |  * Authentication Service Class
177 |  */
178 | export class AuthService {
179 |   /**
180 |    * Register a new user
181 |    */
182 |   async register(data: RegisterData): Promise<AuthResponse> {
183 |     try {
184 |       // Validate input data
185 |       const errors = validateRegistrationData(data);
186 |       if (errors.length > 0) {
187 |         return {
188 |           success: false,
189 |           message: 'Validation failed',
190 |           errors,
191 |         };
192 |       }
193 | 
194 |       // Check if email already exists
195 |       if (storage.getUserByEmail(data.email)) {
196 |         return {
197 |           success: false,
198 |           message: 'Email already registered',
199 |           errors: [{ field: 'email', message: 'This email is already in use', code: 'EMAIL_EXISTS' }],
200 |         };
201 |       }
202 | 
203 |       // Check if username already exists
204 |       if (storage.getUserByUsername(data.username)) {
205 |         return {
206 |           success: false,
207 |           message: 'Username already taken',
208 |           errors: [{ field: 'username', message: 'This username is already taken', code: 'USERNAME_EXISTS' }],
209 |         };
210 |       }
211 | 
212 |       // Hash password
213 |       const { hash, salt } = await hashPassword(data.password);
214 | 
215 |       // Create user
216 |       const user: AuthUser = {
217 |         id: generateUUID(),
218 |         email: sanitizeInput(data.email.toLowerCase()),
219 |         username: sanitizeInput(data.username),
220 |         passwordHash: hash,
221 |         salt,
222 |         role: 'user',
223 |         status: 'pending_verification',
224 |         firstName: sanitizeInput(data.firstName),
225 |         lastName: sanitizeInput(data.lastName),
226 |         twoFactorEnabled: false,
227 |         twoFactorMethod: 'none',
228 |         failedLoginAttempts: 0,
229 |         lastPasswordChange: new Date(),
230 |         emailVerificationToken: generateSecureToken(),
231 |         emailVerified: false,
232 |         createdAt: new Date(),
233 |         updatedAt: new Date(),
234 |       };
235 | 
236 |       storage.createUser(user);
237 | 
238 |       // Log security event
239 |       this.logSecurityEvent({
240 |         userId: user.id,
241 |         eventType: 'login',
242 |         description: 'User registered successfully',
243 |         ipAddress: 'unknown',
244 |         userAgent: 'unknown',
245 |       });
246 | 
247 |       // Return success (without sensitive data)
248 |       const { passwordHash, salt: userSalt, twoFactorSecret, ...safeUser } = user;
249 | 
250 |       return {
251 |         success: true,
252 |         message: 'Registration successful. Please verify your email.',
253 |         user: safeUser,
254 |       };
255 |     } catch (error) {
256 |       console.error('Registration error:', error);
257 |       return {
258 |         success: false,
259 |         message: 'Registration failed. Please try again.',
260 |       };
261 |     }
262 |   }
263 | 
264 |   /**
265 |    * Login user
266 |    */
267 |   async login(credentials: LoginCredentials, ipAddress: string, userAgent: string): Promise<AuthResponse> {
268 |     try {
269 |       const { emailOrUsername, password, rememberMe, twoFactorCode } = credentials;
270 | 
271 |       // Find user by email or username
272 |       let user = storage.getUserByEmail(emailOrUsername);
273 |       if (!user) {
274 |         user = storage.getUserByUsername(emailOrUsername);
275 |       }
276 | 
277 |       // Log login attempt
278 |       const loginAttempt: LoginAttempt = {
279 |         id: generateUUID(),
280 |         userId: user?.id,
281 |         emailOrUsername: sanitizeInput(emailOrUsername),
282 |         ipAddress,
283 |         userAgent,
284 |         status: 'failed',
285 |         timestamp: new Date(),
286 |       };
287 | 
288 |       if (!user) {
289 |         loginAttempt.failureReason = 'User not found';
290 |         storage.addLoginAttempt(loginAttempt);
291 |         
292 |         return {
293 |           success: false,
294 |           message: 'Invalid credentials',
295 |         };
296 |       }
297 | 
298 |       // Check if account is locked
299 |       if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
300 |         loginAttempt.status = 'blocked';
301 |         loginAttempt.failureReason = 'Account locked';
302 |         storage.addLoginAttempt(loginAttempt);
303 | 
304 |         const minutesRemaining = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
305 |         return {
306 |           success: false,
307 |           message: `Account is locked. Try again in ${minutesRemaining} minutes.`,
308 |         };
309 |       }
310 | 
311 |       // Check if account is suspended
312 |       if (user.status === 'suspended') {
313 |         loginAttempt.status = 'blocked';
314 |         loginAttempt.failureReason = 'Account suspended';
315 |         storage.addLoginAttempt(loginAttempt);
316 | 
317 |         return {
318 |           success: false,
319 |           message: 'Account is suspended. Please contact support.',
320 |         };
321 |       }
322 | 
323 |       // Verify password
324 |       const isPasswordValid = await verifyPassword(password, user.passwordHash);
325 |       if (!isPasswordValid) {
326 |         loginAttempt.failureReason = 'Invalid password';
327 |         storage.addLoginAttempt(loginAttempt);
328 | 
329 |         // Increment failed login attempts
330 |         const failedAttempts = user.failedLoginAttempts + 1;
331 |         const updates: Partial<AuthUser> = { failedLoginAttempts: failedAttempts };
332 | 
333 |         // Lock account if max attempts reached
334 |         if (failedAttempts >= LOCKOUT_CONFIG.maxAttempts) {
335 |           updates.accountLockedUntil = new Date(Date.now() + LOCKOUT_CONFIG.lockoutDurationMs);
336 |           updates.status = 'locked';
337 | 
338 |           this.logSecurityEvent({
339 |             userId: user.id,
340 |             eventType: 'account_locked',
341 |             description: 'Account locked due to multiple failed login attempts',
342 |             ipAddress,
343 |             userAgent,
344 |           });
345 |         }
346 | 
347 |         storage.updateUser(user.id, updates);
348 | 
349 |         return {
350 |           success: false,
351 |           message: 'Invalid credentials',
352 |         };
353 |       }
354 | 
355 |       // Check if 2FA is required
356 |       if (user.twoFactorEnabled && !twoFactorCode) {
357 |         return {
358 |           success: false,
359 |           message: 'Two-factor authentication required',
360 |           requiresTwoFactor: true,
361 |         };
362 |       }
363 | 
364 |       // Verify 2FA code if provided
365 |       if (user.twoFactorEnabled && twoFactorCode) {
366 |         const is2FAValid = await this.verify2FA(user.id, twoFactorCode);
367 |         if (!is2FAValid) {
368 |           loginAttempt.failureReason = 'Invalid 2FA code';
369 |           storage.addLoginAttempt(loginAttempt);
370 | 
371 |           return {
372 |             success: false,
373 |             message: 'Invalid two-factor authentication code',
374 |           };
375 |         }
376 |       }
377 | 
378 |       // Successful login
379 |       loginAttempt.status = 'success';
380 |       storage.addLoginAttempt(loginAttempt);
381 | 
382 |       // Reset failed login attempts
383 |       storage.updateUser(user.id, {
384 |         failedLoginAttempts: 0,
385 |         accountLockedUntil: undefined,
386 |         lastLoginAt: new Date(),
387 |         lastLoginIp: ipAddress,
388 |         status: user.status === 'locked' ? 'active' : user.status,
389 |       });
390 | 
391 |       // Create session
392 |       const session = await this.createSession(user.id, ipAddress, userAgent, rememberMe || false);
393 | 
394 |       // Generate CSRF token
395 |       const csrfToken = generateCSRFToken();
396 |       storage.setCSRFToken(session.id, csrfToken);
397 | 
398 |       // Log security event
399 |       this.logSecurityEvent({
400 |         userId: user.id,
401 |         eventType: 'login',
402 |         description: 'User logged in successfully',
403 |         ipAddress,
404 |         userAgent,
405 |       });
406 | 
407 |       // Return success
408 |       const { passwordHash, salt, twoFactorSecret, ...safeUser } = user;
409 | 
410 |       return {
411 |         success: true,
412 |         message: 'Login successful',
413 |         user: safeUser,
414 |         token: session.token,
415 |         refreshToken: session.refreshToken,
416 |       };
417 |     } catch (error) {
418 |       console.error('Login error:', error);
419 |       return {
420 |         success: false,
421 |         message: 'Login failed. Please try again.',
422 |       };
423 |     }
424 |   }
425 | 
426 |   /**
427 |    * Create a new session
428 |    */
429 |   private async createSession(
430 |     userId: string,
431 |     ipAddress: string,
432 |     userAgent: string,
433 |     rememberMe: boolean
434 |   ): Promise<Session> {
435 |     const sessionId = generateUUID();
436 |     const user = storage.getUserById(userId);
437 | 
438 |     if (!user) {
439 |       throw new Error('User not found');
440 |     }
441 | 
442 |     // Generate JWT tokens
443 |     const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
444 |       userId: user.id,
445 |       email: user.email,
446 |       username: user.username,
447 |       role: user.role,
448 |       sessionId,
449 |     };
450 | 
451 |     const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
452 |     const refreshToken = jwt.sign({ userId: user.id, sessionId }, JWT_REFRESH_SECRET, {
453 |       expiresIn: rememberMe ? '30d' : JWT_REFRESH_EXPIRY,
454 |     });
455 | 
456 |     const session: Session = {
457 |       id: sessionId,
458 |       userId: user.id,
459 |       token,
460 |       refreshToken,
461 |       expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)),
462 |       createdAt: new Date(),
463 |       lastActivityAt: new Date(),
464 |       ipAddress,
465 |       userAgent,
466 |       status: 'active',
467 |       rememberMe,
468 |     };
469 | 
470 |     storage.createSession(session);
471 |     return session;
472 |   }
473 | 
474 |   /**
475 |    * Verify JWT token
476 |    */
477 |   verifyToken(token: string): TokenPayload | null {
478 |     try {
479 |       const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
480 |       
481 |       // Check if session is still active
482 |       const session = storage.getSession(decoded.sessionId);
483 |       if (!session || session.status !== 'active') {
484 |         return null;
485 |       }
486 | 
487 |       // Update last activity
488 |       storage.updateSession(session.id, { lastActivityAt: new Date() });
489 | 
490 |       return decoded;
491 |     } catch (error) {
492 |       return null;
493 |     }
494 |   }
495 | 
496 |   /**
497 |    * Refresh access token
498 |    */
499 |   async refreshToken(refreshToken: string): Promise<AuthResponse> {
500 |     try {
501 |       const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string; sessionId: string };
502 |       
503 |       const session = storage.getSession(decoded.sessionId);
504 |       if (!session || session.status !== 'active' || session.refreshToken !== refreshToken) {
505 |         return {
506 |           success: false,
507 |           message: 'Invalid refresh token',
508 |         };
509 |       }
510 | 
511 |       const user = storage.getUserById(decoded.userId);
512 |       if (!user) {
513 |         return {
514 |           success: false,
515 |           message: 'User not found',
516 |         };
517 |       }
518 | 
519 |       // Generate new access token
520 |       const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
521 |         userId: user.id,
522 |         email: user.email,
523 |         username: user.username,
524 |         role: user.role,
525 |         sessionId: session.id,
526 |       };
527 | 
528 |       const newToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
529 | 
530 |       // Update session
531 |       storage.updateSession(session.id, {
532 |         token: newToken,
533 |         lastActivityAt: new Date(),
534 |       });
535 | 
536 |       return {
537 |         success: true,
538 |         message: 'Token refreshed',
539 |         token: newToken,
540 |       };
541 |     } catch (error) {
542 |       return {
543 |         success: false,
544 |         message: 'Failed to refresh token',
545 |       };
546 |     }
547 |   }
548 | 
549 |   /**
550 |    * Logout user
551 |    */
552 |   async logout(token: string): Promise<AuthResponse> {
553 |     try {
554 |       const session = storage.getSessionByToken(token);
555 |       if (!session) {
556 |         return {
557 |           success: false,
558 |           message: 'Session not found',
559 |         };
560 |       }
561 | 
562 |       // Revoke session
563 |       storage.updateSession(session.id, { status: 'revoked' });
564 | 
565 |       // Delete CSRF token
566 |       storage.deleteCSRFToken(session.id);
567 | 
568 |       // Log security event
569 |       this.logSecurityEvent({
570 |         userId: session.userId,
571 |         eventType: 'logout',
572 |         description: 'User logged out',
573 |         ipAddress: session.ipAddress,
574 |         userAgent: session.userAgent,
575 |       });
576 | 
577 |       return {
578 |         success: true,
579 |         message: 'Logged out successfully',
580 |       };
581 |     } catch (error) {
582 |       return {
583 |         success: false,
584 |         message: 'Logout failed',
585 |       };
586 |     }
587 |   }
588 | 
589 |   /**
590 |    * Request password reset
591 |    */
592 |   async requestPasswordReset(data: PasswordResetRequest): Promise<AuthResponse> {
593 |     try {
594 |       const emailValidation = validateEmail(data.email);
595 |       if (!emailValidation.isValid) {
596 |         return {
597 |           success: false,
598 |           message: emailValidation.error!,
599 |         };
600 |       }
601 | 
602 |       const user = storage.getUserByEmail(data.email);
603 |       
604 |       // Always return success to prevent email enumeration
605 |       if (!user) {
606 |         return {
607 |           success: true,
608 |           message: 'If the email exists, a password reset link has been sent.',
609 |         };
610 |       }
611 | 
612 |       // Generate reset token
613 |       const resetToken = generateSecureToken(64);
614 |       const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
615 | 
616 |       storage.updateUser(user.id, {
617 |         passwordResetToken: resetToken,
618 |         passwordResetExpiry: resetExpiry,
619 |       });
620 | 
621 |       // Log security event
622 |       this.logSecurityEvent({
623 |         userId: user.id,
624 |         eventType: 'password_reset',
625 |         description: 'Password reset requested',
626 |         ipAddress: 'unknown',
627 |         userAgent: 'unknown',
628 |       });
629 | 
630 |       // In production, send email with reset link
631 |       console.log(`Password reset token for ${user.email}: ${resetToken}`);
632 | 
633 |       return {
634 |         success: true,
635 |         message: 'If the email exists, a password reset link has been sent.',
636 |       };
637 |     } catch (error) {
638 |       return {
639 |         success: false,
640 |         message: 'Failed to process password reset request',
641 |       };
642 |     }
643 |   }
644 | 
645 |   /**
646 |    * Confirm password reset
647 |    */
648 |   async confirmPasswordReset(data: PasswordResetConfirm): Promise<AuthResponse> {
649 |     try {
650 |       if (data.newPassword !== data.confirmPassword) {
651 |         return {
652 |           success: false,
653 |           message: 'Passwords do not match',
654 |         };
655 |       }
656 | 
657 |       // Find user by reset token
658 |       const user = storage.getAllUsers().find(
659 |         u => u.passwordResetToken === data.token && 
660 |              u.passwordResetExpiry && 
661 |              u.passwordResetExpiry > new Date()
662 |       );
663 | 
664 |       if (!user) {
665 |         return {
666 |           success: false,
667 |           message: 'Invalid or expired reset token',
668 |         };
669 |       }
670 | 
671 |       // Hash new password
672 |       const { hash, salt } = await hashPassword(data.newPassword);
673 | 
674 |       // Update user
675 |       storage.updateUser(user.id, {
676 |         passwordHash: hash,
677 |         salt,
678 |         passwordResetToken: undefined,
679 |         passwordResetExpiry: undefined,
680 |         lastPasswordChange: new Date(),
681 |         failedLoginAttempts: 0,
682 |         accountLockedUntil: undefined,
683 |       });
684 | 
685 |       // Revoke all sessions
686 |       const userSessions = storage.getUserSessions(user.id);
687 |       userSessions.forEach(session => {
688 |         storage.updateSession(session.id, { status: 'revoked' });
689 |       });
690 | 
691 |       // Log security event
692 |       this.logSecurityEvent({
693 |         userId: user.id,
694 |         eventType: 'password_change',
695 |         description: 'Password reset completed',
696 |         ipAddress: 'unknown',
697 |         userAgent: 'unknown',
698 |       });
699 | 
700 |       return {
701 |         success: true,
702 |         message: 'Password reset successful. Please login with your new password.',
703 |       };
704 |     } catch (error) {
705 |       return {
706 |         success: false,
707 |         message: 'Failed to reset password',
708 |       };
709 |     }
710 |   }
711 | 
712 |   /**
713 |    * Change password
714 |    */
715 |   async changePassword(userId: string, data: PasswordChangeRequest): Promise<AuthResponse> {
716 |     try {
717 |       const user = storage.getUserById(userId);
718 |       if (!user) {
719 |         return {
720 |           success: false,
721 |           message: 'User not found',
722 |         };
723 |       }
724 | 
725 |       // Verify current password
726 |       const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.passwordHash);
727 |       if (!isCurrentPasswordValid) {
728 |         return {
729 |           success: false,
730 |           message: 'Current password is incorrect',
731 |         };
732 |       }
733 | 
734 |       if (data.newPassword !== data.confirmPassword) {
735 |         return {
736 |           success: false,
737 |           message: 'New passwords do not match',
738 |         };
739 |       }
740 | 
741 |       // Hash new password
742 |       const { hash, salt } = await hashPassword(data.newPassword);
743 | 
744 |       // Update user
745 |       storage.updateUser(user.id, {
746 |         passwordHash: hash,
747 |         salt,
748 |         lastPasswordChange: new Date(),
749 |       });
750 | 
751 |       // Log security event
752 |       this.logSecurityEvent({
753 |         userId: user.id,
754 |         eventType: 'password_change',
755 |         description: 'Password changed successfully',
756 |         ipAddress: 'unknown',
757 |         userAgent: 'unknown',
758 |       });
759 | 
760 |       return {
761 |         success: true,
762 |         message: 'Password changed successfully',
763 |       };
764 |     } catch (error) {
765 |       return {
766 |         success: false,
767 |         message: 'Failed to change password',
768 |       };
769 |     }
770 |   }
771 | 
772 |   /**
773 |    * Setup two-factor authentication
774 |    */
775 |   async setup2FA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<TwoFactorSetup | null> {
776 |     try {
777 |       const user = storage.getUserById(userId);
778 |       if (!user) return null;
779 | 
780 |       if (method === 'totp') {
781 |         // Generate TOTP secret
782 |         const secret = generateSecureToken(32);
783 |         const backupCodes = generateBackupCodes();
784 |         const hashedBackupCodes = await hashBackupCodes(backupCodes);
785 | 
786 |         storage.updateUser(userId, {
787 |           twoFactorSecret: secret,
788 |           backupCodes: hashedBackupCodes,
789 |         });
790 | 
791 |         return {
792 |           method: 'totp',
793 |           secret,
794 |           qrCode: `otpauth://totp/StudySprint:${user.email}?secret=${secret}&issuer=StudySprint`,
795 |           backupCodes,
796 |         };
797 |       }
798 | 
799 |       return null;
800 |     } catch (error) {
801 |       return null;
802 |     }
803 |   }
804 | 
805 |   /**
806 |    * Enable two-factor authentication
807 |    */
808 |   async enable2FA(userId: string, code: string): Promise<AuthResponse> {
809 |     try {
810 |       const isValid = await this.verify2FA(userId, code);
811 |       if (!isValid) {
812 |         return {
813 |           success: false,
814 |           message: 'Invalid verification code',
815 |         };
816 |       }
817 | 
818 |       storage.updateUser(userId, {
819 |         twoFactorEnabled: true,
820 |         twoFactorMethod: 'totp',
821 |       });
822 | 
823 |       this.logSecurityEvent({
824 |         userId,
825 |         eventType: 'two_factor_enabled',
826 |         description: 'Two-factor authentication enabled',
827 |         ipAddress: 'unknown',
828 |         userAgent: 'unknown',
829 |       });
830 | 
831 |       return {
832 |         success: true,
833 |         message: 'Two-factor authentication enabled successfully',
834 |       };
835 |     } catch (error) {
836 |       return {
837 |         success: false,
838 |         message: 'Failed to enable two-factor authentication',
839 |       };
840 |     }
841 |   }
842 | 
843 |   /**
844 |    * Verify 2FA code
845 |    */
846 |   private async verify2FA(userId: string, code: string): Promise<boolean> {
847 |     const user = storage.getUserById(userId);
848 |     if (!user || !user.twoFactorSecret) return false;
849 | 
850 |     // In production, use a proper TOTP library like 'otplib'
851 |     // For now, we'll simulate verification
852 |     // This is a placeholder - implement proper TOTP verification
853 |     return code.length === 6 && /^\d+$/.test(code);
854 |   }
855 | 
856 |   /**
857 |    * Disable two-factor authentication
858 |    */
859 |   async disable2FA(userId: string, password: string): Promise<AuthResponse> {
860 |     try {
861 |       const user = storage.getUserById(userId);
862 |       if (!user) {
863 |         return {
864 |           success: false,
865 |           message: 'User not found',
866 |         };
867 |       }
868 | 
869 |       const isPasswordValid = await verifyPassword(password, user.passwordHash);
870 |       if (!isPasswordValid) {
871 |         return {
872 |           success: false,
873 |           message: 'Invalid password',
874 |         };
875 |       }
876 | 
877 |       storage.updateUser(userId, {
878 |         twoFactorEnabled: false,
879 |         twoFactorMethod: 'none',
880 |         twoFactorSecret: undefined,
881 |         backupCodes: undefined,
882 |       });
883 | 
884 |       this.logSecurityEvent({
885 |         userId,
886 |         eventType: 'two_factor_disabled',
887 |         description: 'Two-factor authentication disabled',
888 |         ipAddress: 'unknown',
889 |         userAgent: 'unknown',
890 |       });
891 | 
892 |       return {
893 |         success: true,
894 |         message: 'Two-factor authentication disabled successfully',
895 |       };
896 |     } catch (error) {
897 |       return {
898 |         success: false,
899 |         message: 'Failed to disable two-factor authentication',
900 |       };
901 |     }
902 |   }
903 | 
904 |   /**
905 |    * Log security event
906 |    */
907 |   private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
908 |     const securityEvent: SecurityEvent = {
909 |       id: generateUUID(),
910 |       ...event,
911 |       timestamp: new Date(),
912 |     };
913 |     storage.addSecurityEvent(securityEvent);
914 |   }
915 | 
916 |   /**
917 |    * Get user by ID
918 |    */
919 |   getUserById(id: string): Omit<AuthUser, 'passwordHash' | 'salt' | 'twoFactorSecret'> | null {
920 |     const user = storage.getUserById(id);
921 |     if (!user) return null;
922 | 
923 |     const { passwordHash, salt, twoFactorSecret, ...safeUser } = user;
924 |     return safeUser;
925 |   }
926 | 
927 |   /**
928 |    * Get user sessions
929 |    */
930 |   getUserSessions(userId: string): Session[] {
931 |     return storage.getUserSessions(userId);
932 |   }
933 | 
934 |   /**
935 |    * Revoke session
936 |    */
937 |   revokeSession(sessionId: string): boolean {
938 |     const session = storage.getSession(sessionId);
939 |     if (!session) return false;
940 | 
941 |     storage.updateSession(sessionId, { status: 'revoked' });
942 |     return true;
943 |   }
944 | 
945 |   /**
946 |    * Get login attempts
947 |    */
948 |   getLoginAttempts(emailOrUsername: string): LoginAttempt[] {
949 |     return storage.getLoginAttempts(emailOrUsername);
950 |   }
951 | 
952 |   /**
953 |    * Get security events
954 |    */
955 |   getSecurityEvents(userId: string): SecurityEvent[] {
956 |     return storage.getSecurityEvents(userId);
957 |   }
958 | }
959 | 
960 | // Export singleton instance
961 | export const authService = new AuthService();
962 | 
963 | // Made with Bob
</content>
</file>
<file><path>src/utils/security.ts</path>
<content lines="1-498">
  1 | /**
  2 |  * Security Utilities
  3 |  * Comprehensive security functions for authentication and data protection
  4 |  */
  5 | 
  6 | import bcrypt from 'bcryptjs';
  7 | import { v4 as uuidv4 } from 'uuid';
  8 | import validator from 'validator';
  9 | import DOMPurify from 'dompurify';
 10 | import type { 
 11 |   PasswordRequirements, 
 12 |   PasswordStrength, 
 13 |   ValidationError 
 14 | } from '../types/auth.types';
 15 | 
 16 | /**
 17 |  * Default Password Requirements
 18 |  */
 19 | export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
 20 |   minLength: 8,
 21 |   requireUppercase: true,
 22 |   requireLowercase: true,
 23 |   requireNumbers: true,
 24 |   requireSpecialChars: true,
 25 |   specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
 26 | };
 27 | 
 28 | /**
 29 |  * Hash a password using bcrypt with salt
 30 |  * @param password - Plain text password
 31 |  * @param saltRounds - Number of salt rounds (default: 12)
 32 |  * @returns Promise with hashed password and salt
 33 |  */
 34 | export async function hashPassword(
 35 |   password: string,
 36 |   saltRounds: number = 12
 37 | ): Promise<{ hash: string; salt: string }> {
 38 |   try {
 39 |     const salt = await bcrypt.genSalt(saltRounds);
 40 |     const hash = await bcrypt.hash(password, salt);
 41 |     return { hash, salt };
 42 |   } catch (error) {
 43 |     throw new Error('Failed to hash password');
 44 |   }
 45 | }
 46 | 
 47 | /**
 48 |  * Verify a password against a hash
 49 |  * @param password - Plain text password
 50 |  * @param hash - Hashed password
 51 |  * @returns Promise with boolean result
 52 |  */
 53 | export async function verifyPassword(
 54 |   password: string,
 55 |   hash: string
 56 | ): Promise<boolean> {
 57 |   try {
 58 |     return await bcrypt.compare(password, hash);
 59 |   } catch (error) {
 60 |     return false;
 61 |   }
 62 | }
 63 | 
 64 | /**
 65 |  * Check password strength and requirements
 66 |  * @param password - Password to check
 67 |  * @param requirements - Password requirements (optional)
 68 |  * @returns Password strength result
 69 |  */
 70 | export function checkPasswordStrength(
 71 |   password: string,
 72 |   requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
 73 | ): PasswordStrength {
 74 |   const feedback: string[] = [];
 75 |   let score = 0;
 76 | 
 77 |   // Check minimum length
 78 |   const hasMinLength = password.length >= requirements.minLength;
 79 |   if (!hasMinLength) {
 80 |     feedback.push(`Password must be at least ${requirements.minLength} characters long`);
 81 |   } else {
 82 |     score++;
 83 |   }
 84 | 
 85 |   // Check uppercase
 86 |   const hasUppercase = /[A-Z]/.test(password);
 87 |   if (requirements.requireUppercase && !hasUppercase) {
 88 |     feedback.push('Password must contain at least one uppercase letter');
 89 |   } else if (hasUppercase) {
 90 |     score++;
 91 |   }
 92 | 
 93 |   // Check lowercase
 94 |   const hasLowercase = /[a-z]/.test(password);
 95 |   if (requirements.requireLowercase && !hasLowercase) {
 96 |     feedback.push('Password must contain at least one lowercase letter');
 97 |   } else if (hasLowercase) {
 98 |     score++;
 99 |   }
100 | 
101 |   // Check numbers
102 |   const hasNumbers = /\d/.test(password);
103 |   if (requirements.requireNumbers && !hasNumbers) {
104 |     feedback.push('Password must contain at least one number');
105 |   } else if (hasNumbers) {
106 |     score++;
107 |   }
108 | 
109 |   // Check special characters
110 |   const specialCharsRegex = new RegExp(`[${requirements.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
111 |   const hasSpecialChars = specialCharsRegex.test(password);
112 |   if (requirements.requireSpecialChars && !hasSpecialChars) {
113 |     feedback.push(`Password must contain at least one special character (${requirements.specialChars})`);
114 |   } else if (hasSpecialChars) {
115 |     score++;
116 |   }
117 | 
118 |   // Additional strength checks
119 |   if (password.length >= 12) score++;
120 |   if (password.length >= 16) score++;
121 | 
122 |   // Check for common patterns
123 |   if (/^(.)\1+$/.test(password)) {
124 |     feedback.push('Password should not consist of repeated characters');
125 |     score = Math.max(0, score - 2);
126 |   }
127 | 
128 |   if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
129 |     feedback.push('Password should not contain sequential characters');
130 |     score = Math.max(0, score - 1);
131 |   }
132 | 
133 |   const isValid = 
134 |     hasMinLength &&
135 |     (!requirements.requireUppercase || hasUppercase) &&
136 |     (!requirements.requireLowercase || hasLowercase) &&
137 |     (!requirements.requireNumbers || hasNumbers) &&
138 |     (!requirements.requireSpecialChars || hasSpecialChars);
139 | 
140 |   return {
141 |     score: Math.min(4, score),
142 |     feedback,
143 |     isValid,
144 |     requirements: {
145 |       minLength: hasMinLength,
146 |       hasUppercase,
147 |       hasLowercase,
148 |       hasNumbers,
149 |       hasSpecialChars,
150 |     },
151 |   };
152 | }
153 | 
154 | /**
155 |  * Validate email address
156 |  * @param email - Email to validate
157 |  * @returns Validation result
158 |  */
159 | export function validateEmail(email: string): { isValid: boolean; error?: string } {
160 |   if (!email || email.trim().length === 0) {
161 |     return { isValid: false, error: 'Email is required' };
162 |   }
163 | 
164 |   if (!validator.isEmail(email)) {
165 |     return { isValid: false, error: 'Invalid email format' };
166 |   }
167 | 
168 |   // Additional checks
169 |   const [localPart, domain] = email.split('@');
170 |   
171 |   if (localPart.length > 64) {
172 |     return { isValid: false, error: 'Email local part is too long' };
173 |   }
174 | 
175 |   if (domain.length > 255) {
176 |     return { isValid: false, error: 'Email domain is too long' };
177 |   }
178 | 
179 |   return { isValid: true };
180 | }
181 | 
182 | /**
183 |  * Validate username
184 |  * @param username - Username to validate
185 |  * @returns Validation result
186 |  */
187 | export function validateUsername(username: string): { isValid: boolean; error?: string } {
188 |   if (!username || username.trim().length === 0) {
189 |     return { isValid: false, error: 'Username is required' };
190 |   }
191 | 
192 |   if (username.length < 3) {
193 |     return { isValid: false, error: 'Username must be at least 3 characters long' };
194 |   }
195 | 
196 |   if (username.length > 30) {
197 |     return { isValid: false, error: 'Username must not exceed 30 characters' };
198 |   }
199 | 
200 |   if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
201 |     return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
202 |   }
203 | 
204 |   if (/^[0-9]/.test(username)) {
205 |     return { isValid: false, error: 'Username cannot start with a number' };
206 |   }
207 | 
208 |   return { isValid: true };
209 | }
210 | 
211 | /**
212 |  * Sanitize user input to prevent XSS attacks
213 |  * @param input - User input string
214 |  * @returns Sanitized string
215 |  */
216 | export function sanitizeInput(input: string): string {
217 |   if (!input) return '';
218 |   
219 |   // Use DOMPurify to sanitize HTML
220 |   const sanitized = DOMPurify.sanitize(input, {
221 |     ALLOWED_TAGS: [],
222 |     ALLOWED_ATTR: [],
223 |   });
224 | 
225 |   // Additional sanitization
226 |   return sanitized
227 |     .trim()
228 |     .replace(/[<>]/g, '') // Remove any remaining angle brackets
229 |     .slice(0, 1000); // Limit length
230 | }
231 | 
232 | /**
233 |  * Sanitize HTML content (for rich text)
234 |  * @param html - HTML content
235 |  * @returns Sanitized HTML
236 |  */
237 | export function sanitizeHTML(html: string): string {
238 |   if (!html) return '';
239 |   
240 |   return DOMPurify.sanitize(html, {
241 |     ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
242 |     ALLOWED_ATTR: ['href', 'target', 'rel'],
243 |   });
244 | }
245 | 
246 | /**
247 |  * Generate a secure random token
248 |  * @param length - Token length (default: 32)
249 |  * @returns Random token string
250 |  */
251 | export function generateSecureToken(length: number = 32): string {
252 |   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
253 |   let token = '';
254 |   
255 |   // Use crypto.getRandomValues for secure random generation
256 |   const randomValues = new Uint8Array(length);
257 |   crypto.getRandomValues(randomValues);
258 |   
259 |   for (let i = 0; i < length; i++) {
260 |     token += chars[randomValues[i] % chars.length];
261 |   }
262 |   
263 |   return token;
264 | }
265 | 
266 | /**
267 |  * Generate a UUID v4
268 |  * @returns UUID string
269 |  */
270 | export function generateUUID(): string {
271 |   return uuidv4();
272 | }
273 | 
274 | /**
275 |  * Generate backup codes for 2FA
276 |  * @param count - Number of codes to generate (default: 10)
277 |  * @returns Array of backup codes
278 |  */
279 | export function generateBackupCodes(count: number = 10): string[] {
280 |   const codes: string[] = [];
281 |   
282 |   for (let i = 0; i < count; i++) {
283 |     // Generate 8-character alphanumeric code
284 |     const code = generateSecureToken(8).toUpperCase();
285 |     // Format as XXXX-XXXX
286 |     codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
287 |   }
288 |   
289 |   return codes;
290 | }
291 | 
292 | /**
293 |  * Hash backup codes for storage
294 |  * @param codes - Array of backup codes
295 |  * @returns Promise with array of hashed codes
296 |  */
297 | export async function hashBackupCodes(codes: string[]): Promise<string[]> {
298 |   const hashedCodes = await Promise.all(
299 |     codes.map(async (code) => {
300 |       const { hash } = await hashPassword(code, 10);
301 |       return hash;
302 |     })
303 |   );
304 |   return hashedCodes;
305 | }
306 | 
307 | /**
308 |  * Verify backup code against hashed codes
309 |  * @param code - Backup code to verify
310 |  * @param hashedCodes - Array of hashed backup codes
311 |  * @returns Promise with verification result and used code index
312 |  */
313 | export async function verifyBackupCode(
314 |   code: string,
315 |   hashedCodes: string[]
316 | ): Promise<{ isValid: boolean; usedIndex?: number }> {
317 |   for (let i = 0; i < hashedCodes.length; i++) {
318 |     const isValid = await verifyPassword(code, hashedCodes[i]);
319 |     if (isValid) {
320 |       return { isValid: true, usedIndex: i };
321 |     }
322 |   }
323 |   return { isValid: false };
324 | }
325 | 
326 | /**
327 |  * Generate CSRF token
328 |  * @returns CSRF token
329 |  */
330 | export function generateCSRFToken(): string {
331 |   return generateSecureToken(64);
332 | }
333 | 
334 | /**
335 |  * Validate CSRF token
336 |  * @param token - Token to validate
337 |  * @param storedToken - Stored token
338 |  * @returns Boolean result
339 |  */
340 | export function validateCSRFToken(token: string, storedToken: string): boolean {
341 |   if (!token || !storedToken) return false;
342 |   return token === storedToken;
343 | }
344 | 
345 | /**
346 |  * Mask email for display
347 |  * @param email - Email to mask
348 |  * @returns Masked email
349 |  */
350 | export function maskEmail(email: string): string {
351 |   if (!email || !email.includes('@')) return '***';
352 |   
353 |   const [localPart, domain] = email.split('@');
354 |   const maskedLocal = localPart.length > 2
355 |     ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
356 |     : '*'.repeat(localPart.length);
357 |   
358 |   return `${maskedLocal}@${domain}`;
359 | }
360 | 
361 | /**
362 |  * Mask phone number for display
363 |  * @param phone - Phone number to mask
364 |  * @returns Masked phone number
365 |  */
366 | export function maskPhoneNumber(phone: string): string {
367 |   if (!phone) return '***';
368 |   
369 |   const cleaned = phone.replace(/\D/g, '');
370 |   if (cleaned.length < 4) return '*'.repeat(cleaned.length);
371 |   
372 |   return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
373 | }
374 | 
375 | /**
376 |  * Check if IP address is valid
377 |  * @param ip - IP address to validate
378 |  * @returns Boolean result
379 |  */
380 | export function isValidIP(ip: string): boolean {
381 |   return validator.isIP(ip);
382 | }
383 | 
384 | /**
385 |  * Rate limit key generator
386 |  * @param identifier - User identifier (IP or user ID)
387 |  * @param action - Action being rate limited
388 |  * @returns Rate limit key
389 |  */
390 | export function generateRateLimitKey(identifier: string, action: string): string {
391 |   return `ratelimit:${action}:${identifier}`;
392 | }
393 | 
394 | /**
395 |  * Validate and sanitize registration data
396 |  * @param data - Registration data
397 |  * @returns Validation errors array
398 |  */
399 | export function validateRegistrationData(data: {
400 |   email: string;
401 |   username: string;
402 |   password: string;
403 |   confirmPassword: string;
404 |   firstName: string;
405 |   lastName: string;
406 | }): ValidationError[] {
407 |   const errors: ValidationError[] = [];
408 | 
409 |   // Email validation
410 |   const emailValidation = validateEmail(data.email);
411 |   if (!emailValidation.isValid) {
412 |     errors.push({
413 |       field: 'email',
414 |       message: emailValidation.error!,
415 |       code: 'INVALID_EMAIL',
416 |     });
417 |   }
418 | 
419 |   // Username validation
420 |   const usernameValidation = validateUsername(data.username);
421 |   if (!usernameValidation.isValid) {
422 |     errors.push({
423 |       field: 'username',
424 |       message: usernameValidation.error!,
425 |       code: 'INVALID_USERNAME',
426 |     });
427 |   }
428 | 
429 |   // Password validation
430 |   const passwordStrength = checkPasswordStrength(data.password);
431 |   if (!passwordStrength.isValid) {
432 |     errors.push({
433 |       field: 'password',
434 |       message: passwordStrength.feedback.join('. '),
435 |       code: 'WEAK_PASSWORD',
436 |     });
437 |   }
438 | 
439 |   // Password confirmation
440 |   if (data.password !== data.confirmPassword) {
441 |     errors.push({
442 |       field: 'confirmPassword',
443 |       message: 'Passwords do not match',
444 |       code: 'PASSWORD_MISMATCH',
445 |     });
446 |   }
447 | 
448 |   // First name validation
449 |   if (!data.firstName || data.firstName.trim().length === 0) {
450 |     errors.push({
451 |       field: 'firstName',
452 |       message: 'First name is required',
453 |       code: 'REQUIRED_FIELD',
454 |     });
455 |   } else if (data.firstName.length > 50) {
456 |     errors.push({
457 |       field: 'firstName',
458 |       message: 'First name is too long',
459 |       code: 'FIELD_TOO_LONG',
460 |     });
461 |   }
462 | 
463 |   // Last name validation
464 |   if (!data.lastName || data.lastName.trim().length === 0) {
465 |     errors.push({
466 |       field: 'lastName',
467 |       message: 'Last name is required',
468 |       code: 'REQUIRED_FIELD',
469 |     });
470 |   } else if (data.lastName.length > 50) {
471 |     errors.push({
472 |       field: 'lastName',
473 |       message: 'Last name is too long',
474 |       code: 'FIELD_TOO_LONG',
475 |     });
476 |   }
477 | 
478 |   return errors;
479 | }
480 | 
481 | /**
482 |  * Constant-time string comparison to prevent timing attacks
483 |  * @param a - First string
484 |  * @param b - Second string
485 |  * @returns Boolean result
486 |  */
487 | export function constantTimeCompare(a: string, b: string): boolean {
488 |   if (a.length !== b.length) return false;
489 |   
490 |   let result = 0;
491 |   for (let i = 0; i < a.length; i++) {
492 |     result |= a.charCodeAt(i) ^ b.charCodeAt(i);
493 |   }
494 |   
495 |   return result === 0;
496 | }
497 | 
498 | // Made with Bob
</content>
</file>
<file><path>src/types/auth.types.ts</path>
<content lines="1-354">
  1 | /**
  2 |  * Authentication and Authorization Type Definitions
  3 |  * Comprehensive type system for secure user authentication
  4 |  */
  5 | 
  6 | // User Roles for Role-Based Access Control (RBAC)
  7 | export type UserRole = 'admin' | 'moderator' | 'user';
  8 | 
  9 | // User Status
 10 | export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'locked';
 11 | 
 12 | // Two-Factor Authentication Methods
 13 | export type TwoFactorMethod = 'totp' | 'sms' | 'email' | 'none';
 14 | 
 15 | // Login Attempt Status
 16 | export type LoginAttemptStatus = 'success' | 'failed' | 'blocked';
 17 | 
 18 | // Session Status
 19 | export type SessionStatus = 'active' | 'expired' | 'revoked';
 20 | 
 21 | /**
 22 |  * Core User Interface with Authentication Fields
 23 |  */
 24 | export interface AuthUser {
 25 |   id: string;
 26 |   email: string;
 27 |   username: string;
 28 |   passwordHash: string;
 29 |   salt: string;
 30 |   role: UserRole;
 31 |   status: UserStatus;
 32 |   
 33 |   // Profile Information
 34 |   firstName: string;
 35 |   lastName: string;
 36 |   avatar?: string;
 37 |   
 38 |   // Two-Factor Authentication
 39 |   twoFactorEnabled: boolean;
 40 |   twoFactorMethod: TwoFactorMethod;
 41 |   twoFactorSecret?: string;
 42 |   backupCodes?: string[];
 43 |   
 44 |   // Account Security
 45 |   failedLoginAttempts: number;
 46 |   accountLockedUntil?: Date;
 47 |   lastLoginAt?: Date;
 48 |   lastLoginIp?: string;
 49 |   lastPasswordChange: Date;
 50 |   passwordResetToken?: string;
 51 |   passwordResetExpiry?: Date;
 52 |   emailVerificationToken?: string;
 53 |   emailVerified: boolean;
 54 |   
 55 |   // Timestamps
 56 |   createdAt: Date;
 57 |   updatedAt: Date;
 58 |   deletedAt?: Date;
 59 | }
 60 | 
 61 | /**
 62 |  * User Registration Data
 63 |  */
 64 | export interface RegisterData {
 65 |   email: string;
 66 |   username: string;
 67 |   password: string;
 68 |   confirmPassword: string;
 69 |   firstName: string;
 70 |   lastName: string;
 71 |   agreeToTerms: boolean;
 72 | }
 73 | 
 74 | /**
 75 |  * User Login Credentials
 76 |  */
 77 | export interface LoginCredentials {
 78 |   emailOrUsername: string;
 79 |   password: string;
 80 |   rememberMe?: boolean;
 81 |   twoFactorCode?: string;
 82 | }
 83 | 
 84 | /**
 85 |  * Session Data
 86 |  */
 87 | export interface Session {
 88 |   id: string;
 89 |   userId: string;
 90 |   token: string;
 91 |   refreshToken: string;
 92 |   expiresAt: Date;
 93 |   createdAt: Date;
 94 |   lastActivityAt: Date;
 95 |   ipAddress: string;
 96 |   userAgent: string;
 97 |   status: SessionStatus;
 98 |   rememberMe: boolean;
 99 | }
100 | 
101 | /**
102 |  * JWT Token Payload
103 |  */
104 | export interface TokenPayload {
105 |   userId: string;
106 |   email: string;
107 |   username: string;
108 |   role: UserRole;
109 |   sessionId: string;
110 |   iat: number;
111 |   exp: number;
112 | }
113 | 
114 | /**
115 |  * Login Attempt Log
116 |  */
117 | export interface LoginAttempt {
118 |   id: string;
119 |   userId?: string;
120 |   emailOrUsername: string;
121 |   ipAddress: string;
122 |   userAgent: string;
123 |   status: LoginAttemptStatus;
124 |   failureReason?: string;
125 |   timestamp: Date;
126 |   location?: {
127 |     country?: string;
128 |     city?: string;
129 |     coordinates?: {
130 |       latitude: number;
131 |       longitude: number;
132 |     };
133 |   };
134 | }
135 | 
136 | /**
137 |  * Password Reset Request
138 |  */
139 | export interface PasswordResetRequest {
140 |   email: string;
141 | }
142 | 
143 | /**
144 |  * Password Reset Confirmation
145 |  */
146 | export interface PasswordResetConfirm {
147 |   token: string;
148 |   newPassword: string;
149 |   confirmPassword: string;
150 | }
151 | 
152 | /**
153 |  * Password Change Request
154 |  */
155 | export interface PasswordChangeRequest {
156 |   currentPassword: string;
157 |   newPassword: string;
158 |   confirmPassword: string;
159 | }
160 | 
161 | /**
162 |  * Two-Factor Authentication Setup
163 |  */
164 | export interface TwoFactorSetup {
165 |   method: TwoFactorMethod;
166 |   secret?: string;
167 |   qrCode?: string;
168 |   backupCodes?: string[];
169 | }
170 | 
171 | /**
172 |  * Two-Factor Verification
173 |  */
174 | export interface TwoFactorVerification {
175 |   code: string;
176 |   backupCode?: boolean;
177 | }
178 | 
179 | /**
180 |  * User Profile Update
181 |  */
182 | export interface ProfileUpdateData {
183 |   firstName?: string;
184 |   lastName?: string;
185 |   avatar?: string;
186 |   email?: string;
187 |   username?: string;
188 | }
189 | 
190 | /**
191 |  * Security Event
192 |  */
193 | export interface SecurityEvent {
194 |   id: string;
195 |   userId: string;
196 |   eventType: 'login' | 'logout' | 'password_change' | 'password_reset' | 
197 |               'email_change' | 'two_factor_enabled' | 'two_factor_disabled' |
198 |               'account_locked' | 'account_unlocked' | 'suspicious_activity';
199 |   description: string;
200 |   ipAddress: string;
201 |   userAgent: string;
202 |   metadata?: Record<string, any>;
203 |   timestamp: Date;
204 | }
205 | 
206 | /**
207 |  * Rate Limit Configuration
208 |  */
209 | export interface RateLimitConfig {
210 |   windowMs: number;
211 |   maxAttempts: number;
212 |   blockDurationMs: number;
213 | }
214 | 
215 | /**
216 |  * Rate Limit Entry
217 |  */
218 | export interface RateLimitEntry {
219 |   identifier: string; // IP address or user ID
220 |   attempts: number;
221 |   firstAttemptAt: Date;
222 |   blockedUntil?: Date;
223 | }
224 | 
225 | /**
226 |  * Authentication Response
227 |  */
228 | export interface AuthResponse {
229 |   success: boolean;
230 |   message: string;
231 |   user?: Omit<AuthUser, 'passwordHash' | 'salt' | 'twoFactorSecret'>;
232 |   token?: string;
233 |   refreshToken?: string;
234 |   requiresTwoFactor?: boolean;
235 |   errors?: ValidationError[];
236 | }
237 | 
238 | /**
239 |  * Validation Error
240 |  */
241 | export interface ValidationError {
242 |   field: string;
243 |   message: string;
244 |   code: string;
245 | }
246 | 
247 | /**
248 |  * Password Strength Requirements
249 |  */
250 | export interface PasswordRequirements {
251 |   minLength: number;
252 |   requireUppercase: boolean;
253 |   requireLowercase: boolean;
254 |   requireNumbers: boolean;
255 |   requireSpecialChars: boolean;
256 |   specialChars: string;
257 | }
258 | 
259 | /**
260 |  * Password Strength Result
261 |  */
262 | export interface PasswordStrength {
263 |   score: number; // 0-4
264 |   feedback: string[];
265 |   isValid: boolean;
266 |   requirements: {
267 |     minLength: boolean;
268 |     hasUppercase: boolean;
269 |     hasLowercase: boolean;
270 |     hasNumbers: boolean;
271 |     hasSpecialChars: boolean;
272 |   };
273 | }
274 | 
275 | /**
276 |  * Admin Dashboard Statistics
277 |  */
278 | export interface AdminStats {
279 |   totalUsers: number;
280 |   activeUsers: number;
281 |   suspendedUsers: number;
282 |   lockedAccounts: number;
283 |   todayLogins: number;
284 |   failedLoginsToday: number;
285 |   twoFactorEnabledUsers: number;
286 |   recentSecurityEvents: SecurityEvent[];
287 |   topLoginCountries: Array<{ country: string; count: number }>;
288 | }
289 | 
290 | /**
291 |  * User Management Filters
292 |  */
293 | export interface UserFilters {
294 |   role?: UserRole;
295 |   status?: UserStatus;
296 |   search?: string;
297 |   twoFactorEnabled?: boolean;
298 |   emailVerified?: boolean;
299 |   sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'username';
300 |   sortOrder?: 'asc' | 'desc';
301 |   page?: number;
302 |   limit?: number;
303 | }
304 | 
305 | /**
306 |  * Paginated Response
307 |  */
308 | export interface PaginatedResponse<T> {
309 |   data: T[];
310 |   total: number;
311 |   page: number;
312 |   limit: number;
313 |   totalPages: number;
314 | }
315 | 
316 | /**
317 |  * CAPTCHA Verification
318 |  */
319 | export interface CaptchaVerification {
320 |   token: string;
321 |   action: string;
322 | }
323 | 
324 | /**
325 |  * Email Verification
326 |  */
327 | export interface EmailVerification {
328 |   token: string;
329 | }
330 | 
331 | /**
332 |  * Account Lockout Configuration
333 |  */
334 | export interface LockoutConfig {
335 |   maxAttempts: number;
336 |   lockoutDurationMs: number;
337 |   resetAfterMs: number;
338 | }
339 | 
340 | /**
341 |  * Security Settings
342 |  */
343 | export interface SecuritySettings {
344 |   passwordRequirements: PasswordRequirements;
345 |   sessionTimeout: number;
346 |   refreshTokenExpiry: number;
347 |   lockoutConfig: LockoutConfig;
348 |   rateLimitConfig: RateLimitConfig;
349 |   requireEmailVerification: boolean;
350 |   allowRememberMe: boolean;
351 |   maxActiveSessions: number;
352 | }
353 | 
354 | // Made with Bob
</content>
</file>
<file><path>src/utils/xpCalculator.ts</path>
<content lines="1-83">
 1 | /**
 2 |  * Centralized XP calculation utility
 3 |  * Ensures consistent XP rewards across the application
 4 |  */
 5 | 
 6 | export type ActivityType = 'focus' | 'quiz' | 'session';
 7 | 
 8 | export interface XPCalculationParams {
 9 |   activityType: ActivityType;
10 |   duration?: number; // in minutes
11 |   score?: number; // quiz score (number of correct answers)
12 |   performanceMetrics?: {
13 |     accuracy?: number; // percentage
14 |     difficulty?: 'easy' | 'medium' | 'hard';
15 |   };
16 | }
17 | 
18 | // Base XP rates
19 | const XP_RATES = {
20 |   FOCUS_PER_MINUTE: 4,
21 |   QUIZ_PER_CORRECT: 15,
22 |   SESSION_BASE: 100,
23 | } as const;
24 | 
25 | /**
26 |  * Calculate XP based on activity type and performance metrics
27 |  */
28 | export function calculateXP(params: XPCalculationParams): number {
29 |   const { activityType, duration = 0, score = 0, performanceMetrics } = params;
30 | 
31 |   switch (activityType) {
32 |     case 'focus':
33 |       // Focus sessions: duration * 4 XP per minute
34 |       return Math.floor(duration * XP_RATES.FOCUS_PER_MINUTE);
35 | 
36 |     case 'quiz':
37 |       // Quiz: score * 15 XP per correct answer
38 |       let quizXP = score * XP_RATES.QUIZ_PER_CORRECT;
39 |       
40 |       // Apply difficulty multiplier if provided
41 |       if (performanceMetrics?.difficulty) {
42 |         const difficultyMultiplier = {
43 |           easy: 1.0,
44 |           medium: 1.2,
45 |           hard: 1.5,
46 |         };
47 |         quizXP *= difficultyMultiplier[performanceMetrics.difficulty];
48 |       }
49 |       
50 |       return Math.floor(quizXP);
51 | 
52 |     case 'session':
53 |       // Study sessions: base XP + duration bonus
54 |       let sessionXP = XP_RATES.SESSION_BASE + (duration * XP_RATES.FOCUS_PER_MINUTE);
55 |       
56 |       // Apply accuracy bonus if provided
57 |       if (performanceMetrics?.accuracy !== undefined) {
58 |         const accuracyBonus = (performanceMetrics.accuracy / 100) * 50;
59 |         sessionXP += accuracyBonus;
60 |       }
61 |       
62 |       return Math.floor(sessionXP);
63 | 
64 |     default:
65 |       return 0;
66 |   }
67 | }
68 | 
69 | /**
70 |  * Get XP rate information for display purposes
71 |  */
72 | export function getXPRateInfo(activityType: ActivityType): string {
73 |   switch (activityType) {
74 |     case 'focus':
75 |       return `${XP_RATES.FOCUS_PER_MINUTE} XP per minute`;
76 |     case 'quiz':
77 |       return `${XP_RATES.QUIZ_PER_CORRECT} XP per correct answer`;
78 |     case 'session':
79 |       return `${XP_RATES.SESSION_BASE} base XP + ${XP_RATES.FOCUS_PER_MINUTE} XP per minute`;
80 |     default:
81 |       return 'Unknown activity type';
82 |   }
83 | }
</content>
</file>
<file><path>src/components/layout/Header.tsx</path>
<content lines="1-180">
  1 | import { useMemo, useCallback, memo } from 'react';
  2 | import { motion, AnimatePresence } from 'framer-motion';
  3 | import { Search, Flame, Zap, Star, Bell, Menu } from 'lucide-react';
  4 | import { useStore } from '../../store/useStore';
  5 | import type { View, User } from '../../store/useStore';
  6 | 
  7 | const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
  8 |   dashboard: { title: 'Dashboard', subtitle: 'Your study command center' },
  9 |   focus: { title: 'Focus Timer', subtitle: 'Deep work sessions' },
 10 |   curriculum: { title: 'Curriculum', subtitle: 'Structured learning paths' },
 11 |   quiz: { title: 'Quiz & Exams', subtitle: 'Test your knowledge' },
 12 |   rooms: { title: 'Study Rooms', subtitle: 'Learn together, grow together' },
 13 |   leaderboard: { title: 'Leaderboard', subtitle: 'Compete with top students' },
 14 |   'skill-tree': { title: 'Skill Tree', subtitle: 'Track your mastery progression' },
 15 |   routine: { title: 'My Routine', subtitle: 'AI-generated daily study plan' },
 16 |   prediction: { title: 'Predictions', subtitle: 'AI-powered performance forecast' },
 17 |   reports: { title: 'Reports', subtitle: 'Detailed progress analytics' },
 18 |   notes: { title: 'Notes', subtitle: 'Organize your study materials' },
 19 | };
 20 | 
 21 | interface NotificationConfig {
 22 |   emoji: string;
 23 |   className: string;
 24 | }
 25 | 
 26 | const NOTIFICATION_CONFIG: Record<'xp' | 'level' | 'badge' | 'streak', NotificationConfig> = {
 27 |   xp: { emoji: '⚡', className: 'notification-xp' },
 28 |   level: { emoji: '🌟', className: 'notification-level' },
 29 |   badge: { emoji: '🏆', className: 'notification-badge' },
 30 |   streak: { emoji: '🔥', className: 'notification-streak' },
 31 | };
 32 | 
 33 | interface NotificationItemProps {
 34 |   id: string;
 35 |   message: string;
 36 |   type: 'xp' | 'level' | 'badge' | 'streak';
 37 |   onRemove: (id: string) => void;
 38 | }
 39 | 
 40 | function NotificationItem({ id, message, type, onRemove }: NotificationItemProps) {
 41 |   const config = NOTIFICATION_CONFIG[type];
 42 |   
 43 |   return (
 44 |     <motion.div
 45 |       key={id}
 46 |       initial={{ opacity: 0, x: 100, scale: 0.8 }}
 47 |       animate={{ opacity: 1, x: 0, scale: 1 }}
 48 |       exit={{ opacity: 0, x: 100, scale: 0.8 }}
 49 |       className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl cursor-pointer ${config.className}`}
 50 |       onClick={() => onRemove(id)}
 51 |     >
 52 |       <span className="text-lg">{config.emoji}</span>
 53 |       <span className="text-white text-sm font-medium">{message}</span>
 54 |     </motion.div>
 55 |   );
 56 | }
 57 | 
 58 | const NotificationBadge = memo(({ count }: { count: number }) => {
 59 |   if (count === 0) return null;
 60 |   
 61 |   return (
 62 |     <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
 63 |       {count}
 64 |     </span>
 65 |   );
 66 | });
 67 | 
 68 | const FloatingNotifications = memo(({
 69 |   notifications,
 70 |   onRemove
 71 | }: {
 72 |   notifications: Array<{id: string; message: string; type: 'xp' | 'level' | 'badge' | 'streak'}>;
 73 |   onRemove: (id: string) => void;
 74 | }) => (
 75 |   <div className="fixed top-4 right-4 z-50 space-y-2">
 76 |     <AnimatePresence>
 77 |       {notifications.map((n) => (
 78 |         <NotificationItem
 79 |           key={n.id}
 80 |           id={n.id}
 81 |           message={n.message}
 82 |           type={n.type}
 83 |           onRemove={onRemove}
 84 |         />
 85 |       ))}
 86 |     </AnimatePresence>
 87 |   </div>
 88 | ));
 89 | 
 90 | const UserStats = memo(({ user, notificationCount }: {
 91 |   user: User;
 92 |   notificationCount: number;
 93 | }) => {
 94 |   const xpPercent = useMemo(
 95 |     () => Math.round((user.xp / user.xpToNextLevel) * 100),
 96 |     [user.xp, user.xpToNextLevel]
 97 |   );
 98 | 
 99 |   return (
100 |     <div className="ml-auto flex items-center gap-3">
101 |       {/* Streak */}
102 |       <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg stat-badge-streak">
103 |         <Flame size={14} className="text-orange-400 streak-fire" />
104 |         <span className="text-orange-400 text-sm font-bold">{user.streak}</span>
105 |         <span className="text-orange-500/60 text-xs">day streak</span>
106 |       </div>
107 | 
108 |       {/* XP */}
109 |       <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg stat-badge-xp">
110 |         <Zap size={14} className="text-indigo-400" />
111 |         <div>
112 |           <div className="text-indigo-400 text-xs font-bold">{user.xp.toLocaleString()} XP</div>
113 |           <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
114 |             <div className="xp-bar h-full" style={{ width: `${xpPercent}%` }} />
115 |           </div>
116 |         </div>
117 |       </div>
118 | 
119 |       {/* Level */}
120 |       <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg stat-badge-level">
121 |         <Star size={14} className="text-yellow-400" />
122 |         <span className="text-yellow-400 text-sm font-bold">Lv {user.level}</span>
123 |       </div>
124 | 
125 |       {/* Notifications Bell */}
126 |       <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-white transition-colors notification-button-bg">
127 |         <Bell size={16} />
128 |         <NotificationBadge count={notificationCount} />
129 |       </button>
130 |     </div>
131 |   );
132 | });
133 | 
134 | export default function Header() {
135 |   const { currentView, user, sidebarOpen, setSidebarOpen, notifications, removeNotification } = useStore();
136 |   const { title, subtitle } = VIEW_TITLES[currentView] || { title: 'StudySprint OS', subtitle: '' };
137 |   
138 |   const headerLeft = useMemo(
139 |     () => (sidebarOpen ? '256px' : '72px'),
140 |     [sidebarOpen]
141 |   );
142 | 
143 |   const toggleSidebar = useCallback(() => {
144 |     setSidebarOpen(!sidebarOpen);
145 |   }, [sidebarOpen, setSidebarOpen]);
146 | 
147 |   return (
148 |     <header
149 |       className="fixed top-0 right-0 h-16 z-20 flex items-center px-4 gap-4 header-glass transition-[left] duration-300 ease-in-out"
150 |       style={{ left: headerLeft }}
151 |     >
152 |       <button
153 |         onClick={toggleSidebar}
154 |         className="text-slate-500 hover:text-white transition-colors lg:hidden"
155 |       >
156 |         <Menu size={20} />
157 |       </button>
158 | 
159 |       <div>
160 |         <h1 className="text-white font-display font-bold text-lg leading-tight">{title}</h1>
161 |         <p className="text-slate-500 text-xs">{subtitle}</p>
162 |       </div>
163 | 
164 |       <div className="flex-1 max-w-md mx-4">
165 |         <div className="relative">
166 |           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
167 |           <input
168 |             type="text"
169 |             placeholder="Search topics, chapters, subjects..."
170 |             className="w-full pl-8 pr-4 py-2 text-sm rounded-xl outline-none text-slate-300 placeholder-slate-600 search-input-bg"
171 |           />
172 |         </div>
173 |       </div>
174 | 
175 |       <UserStats user={user} notificationCount={notifications.length} />
176 | 
177 |       <FloatingNotifications notifications={notifications} onRemove={removeNotification} />
178 |     </header>
179 |   );
180 | }
</content>
</file>
</files>
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:17:33.412Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.23

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

I'll continue reading the remaining changed files to complete my review.

<read_file>
<args>
  <file>
    <path>src/components/views/FocusTimer.tsx</path>
  </file>
  <file>
    <path>src/components/views/CurriculumView.tsx</path>
  </file>
  <file>
    <path>src/components/views/QuizView.tsx</path>
  </file>
  <file>
    <path>package.json</path>
  </file>
</args>
</read_file>

---

**User:**

[read_file for 4 files] Result:
<files>
<file><path>src/components/views/FocusTimer.tsx</path>
<content lines="1-412">
  1 | import { useState, useEffect, useRef } from 'react';
  2 | import { motion, AnimatePresence } from 'framer-motion';
  3 | import {
  4 |   Play, Pause, RotateCcw, Settings2, Zap, BookOpen,
  5 |   Coffee, CheckCircle2, X, ChevronDown, Timer, Flame
  6 | } from 'lucide-react';
  7 | import { useStore } from '../../store/useStore';
  8 | import { CURRICULUM } from '../../data/curriculum';
  9 | import { calculateXP } from '../../utils/xpCalculator';
 10 | 
 11 | // Constants for time calculations
 12 | const MILLISECONDS_PER_SECOND = 1000;
 13 | const SECONDS_PER_MINUTE = 60;
 14 | 
 15 | const TIMER_PRESETS = [
 16 |   { label: '25 min', minutes: 25, type: 'pomodoro', desc: 'Classic Pomodoro' },
 17 |   { label: '45 min', minutes: 45, type: 'pomodoro', desc: 'Deep Work' },
 18 |   { label: '60 min', minutes: 60, type: 'pomodoro', desc: 'Power Hour' },
 19 |   { label: '90 min', minutes: 90, type: 'pomodoro', desc: 'Ultradian Rhythm' },
 20 | ];
 21 | 
 22 | const AMBIENT_SOUNDS = [
 23 |   { label: 'Silent', icon: '🔇' },
 24 |   { label: 'Rain', icon: '🌧️' },
 25 |   { label: 'Café', icon: '☕' },
 26 |   { label: 'Forest', icon: '🌲' },
 27 |   { label: 'Ocean', icon: '🌊' },
 28 |   { label: 'Lo-Fi', icon: '🎵' },
 29 | ];
 30 | 
 31 | function formatTime(seconds: number) {
 32 |   const m = Math.floor(seconds / SECONDS_PER_MINUTE);
 33 |   const s = seconds % SECONDS_PER_MINUTE;
 34 |   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
 35 | }
 36 | 
 37 | const SIZE = 280;
 38 | const STROKE = 12;
 39 | const RADIUS = (SIZE - STROKE) / 2;
 40 | const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
 41 | 
 42 | export default function FocusTimer() {
 43 |   const {
 44 |     user, currentSession, setCurrentSession, addSession,
 45 |     pomodoroMinutes, setPomodoroMinutes, addNotification, addXP,
 46 |     selectedSubject, setSelectedSubject, selectedChapter, setSelectedChapter,
 47 |   } = useStore();
 48 | 
 49 |   const [seconds, setSeconds] = useState(pomodoroMinutes * SECONDS_PER_MINUTE);
 50 |   const [isRunning, setIsRunning] = useState(false);
 51 |   const [sessionComplete, setSessionComplete] = useState(false);
 52 |   const [pomodoroCount, setPomodoroCount] = useState(0);
 53 |   const [phase, setPhase] = useState<'focus' | 'break'>('focus');
 54 |   const [selectedSound, setSelectedSound] = useState('Silent');
 55 |   const [showSubjectPicker, setShowSubjectPicker] = useState(false);
 56 |   const [selectedTopicLocal, setSelectedTopicLocal] = useState('');
 57 |   const [notes, setNotes] = useState('');
 58 |   const intervalRef = useRef<number | null>(null);
 59 |   const totalSeconds = pomodoroMinutes * SECONDS_PER_MINUTE;
 60 | 
 61 |   const subject = CURRICULUM[0]?.subjects?.find(s => s.name === selectedSubject) ?? CURRICULUM[0]?.subjects?.[0];
 62 |   const chapter = subject?.chapters?.find(c => c.name === selectedChapter) ?? subject?.chapters?.[0];
 63 | 
 64 |   useEffect(() => {
 65 |     setSeconds(pomodoroMinutes * SECONDS_PER_MINUTE);
 66 |     setIsRunning(false);
 67 |     setSessionComplete(false);
 68 |   }, [pomodoroMinutes]);
 69 | 
 70 |   useEffect(() => {
 71 |     if (isRunning && seconds > 0) {
 72 |       intervalRef.current = window.setInterval(() => {
 73 |         setSeconds(s => {
 74 |           if (s <= 1) {
 75 |             clearInterval(intervalRef.current!);
 76 |             setIsRunning(false);
 77 |             setSessionComplete(true);
 78 |             setPhase('break');
 79 |             setPomodoroCount(p => p + 1);
 80 |             const earnedXP = calculateXP({ activityType: 'focus', duration: pomodoroMinutes });
 81 |             addNotification({ message: `🎉 Session complete! +${earnedXP} XP earned!`, type: 'xp' });
 82 |             addXP(earnedXP);
 83 |             return 0;
 84 |           }
 85 |           return s - 1;
 86 |         });
 87 |       }, MILLISECONDS_PER_SECOND);
 88 |     } else {
 89 |       if (intervalRef.current) {
 90 |         clearInterval(intervalRef.current);
 91 |         intervalRef.current = null;
 92 |       }
 93 |     }
 94 |     return () => {
 95 |       if (intervalRef.current) {
 96 |         clearInterval(intervalRef.current);
 97 |         intervalRef.current = null;
 98 |       }
 99 |     };
100 |   }, [isRunning, seconds]);
101 | 
102 |   // Cleanup on component unmount
103 |   useEffect(() => {
104 |     return () => {
105 |       if (intervalRef.current) {
106 |         clearInterval(intervalRef.current);
107 |         intervalRef.current = null;
108 |       }
109 |     };
110 |   }, []);
111 | 
112 |   const progress = (seconds / totalSeconds);
113 |   const dashOffset = CIRCUMFERENCE * (1 - (1 - progress));
114 | 
115 |   const handleReset = () => {
116 |     setIsRunning(false);
117 |     setSeconds(pomodoroMinutes * SECONDS_PER_MINUTE);
118 |     setSessionComplete(false);
119 |     setPhase('focus');
120 |   };
121 | 
122 |   const handleLogSession = () => {
123 |     const duration = Math.round((totalSeconds - seconds) / SECONDS_PER_MINUTE) || pomodoroMinutes;
124 |     const xpEarned = calculateXP({ activityType: 'focus', duration });
125 |     addSession({
126 |       id: Date.now().toString(),
127 |       subject: selectedSubject,
128 |       chapter: selectedChapter,
129 |       topic: selectedTopicLocal || chapter.topics[0]?.name || 'General Study',
130 |       duration,
131 |       date: new Date().toISOString().split('T')[0],
132 |       xpEarned,
133 |       notes,
134 |     });
135 |     addNotification({ message: `Session logged! +${xpEarned} XP 🎯`, type: 'xp' });
136 |     handleReset();
137 |     setNotes('');
138 |   };
139 | 
140 |   const elapsed = totalSeconds - seconds;
141 |   const elapsedMin = Math.floor(elapsed / SECONDS_PER_MINUTE);
142 | 
143 |   return (
144 |     <div className="max-w-6xl mx-auto">
145 |       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
146 |         {/* Left Panel - Session Setup */}
147 |         <div className="lg:col-span-2 space-y-4">
148 |           <div className="glass-card rounded-2xl p-5">
149 |             <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
150 |               <BookOpen size={16} className="text-indigo-400" /> Session Setup
151 |             </h3>
152 | 
153 |             {/* Subject */}
154 |             <div className="mb-3">
155 |               <label className="text-slate-500 text-xs mb-1.5 block">Subject</label>
156 |               <div className="grid grid-cols-3 gap-2">
157 |                 {CURRICULUM[0].subjects.map(sub => (
158 |                   <button
159 |                     key={sub.id}
160 |                     onClick={() => { setSelectedSubject(sub.name); setSelectedChapter(sub.chapters[0].name); }}
161 |                     className="py-2 px-3 rounded-xl text-sm font-medium transition-all"
162 |                     style={{
163 |                       background: selectedSubject === sub.name ? `${sub.color}20` : 'rgba(30,30,50,0.8)',
164 |                       border: `1px solid ${selectedSubject === sub.name ? sub.color : 'transparent'}`,
165 |                       color: selectedSubject === sub.name ? sub.color : '#64748b',
166 |                     }}
167 |                   >
168 |                     {sub.icon} {sub.name.slice(0, 4)}
169 |                   </button>
170 |                 ))}
171 |               </div>
172 |             </div>
173 | 
174 |             {/* Chapter */}
175 |             <div className="mb-3">
176 |               <label className="text-slate-500 text-xs mb-1.5 block">Chapter</label>
177 |               <select
178 |                 value={selectedChapter}
179 |                 onChange={e => setSelectedChapter(e.target.value)}
180 |                 className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
181 |                 style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
182 |               >
183 |                 {subject.chapters.map(ch => (
184 |                   <option key={ch.id} value={ch.name}>{ch.name}</option>
185 |                 ))}
186 |               </select>
187 |             </div>
188 | 
189 |             {/* Topic */}
190 |             <div className="mb-4">
191 |               <label className="text-slate-500 text-xs mb-1.5 block">Topic</label>
192 |               <select
193 |                 value={selectedTopicLocal}
194 |                 onChange={e => setSelectedTopicLocal(e.target.value)}
195 |                 className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
196 |                 style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
197 |               >
198 |                 <option value="">Select topic...</option>
199 |                 {chapter.topics.map(t => (
200 |                   <option key={t.id} value={t.name}>{t.name}</option>
201 |                 ))}
202 |               </select>
203 |             </div>
204 | 
205 |             {/* Notes */}
206 |             <div>
207 |               <label className="text-slate-500 text-xs mb-1.5 block">Session Notes (optional)</label>
208 |               <textarea
209 |                 value={notes}
210 |                 onChange={e => setNotes(e.target.value)}
211 |                 placeholder="What are you focusing on today?"
212 |                 rows={3}
213 |                 className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none placeholder-slate-700"
214 |                 style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}
215 |               />
216 |             </div>
217 |           </div>
218 | 
219 |           {/* Timer Presets */}
220 |           <div className="glass-card rounded-2xl p-5">
221 |             <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
222 |               <Settings2 size={16} className="text-indigo-400" /> Timer Presets
223 |             </h3>
224 |             <div className="grid grid-cols-2 gap-2">
225 |               {TIMER_PRESETS.map(preset => (
226 |                 <button
227 |                   key={preset.minutes}
228 |                   onClick={() => { setPomodoroMinutes(preset.minutes); setSeconds(preset.minutes * SECONDS_PER_MINUTE); }}
229 |                   className="p-3 rounded-xl text-left transition-all"
230 |                   style={{
231 |                     background: pomodoroMinutes === preset.minutes ? 'rgba(99,102,241,0.2)' : 'rgba(30,30,50,0.6)',
232 |                     border: `1px solid ${pomodoroMinutes === preset.minutes ? '#6366f1' : 'transparent'}`,
233 |                   }}
234 |                 >
235 |                   <div className="text-white font-bold text-sm">{preset.label}</div>
236 |                   <div className="text-slate-500 text-xs">{preset.desc}</div>
237 |                 </button>
238 |               ))}
239 |             </div>
240 |           </div>
241 | 
242 |           {/* Ambient Sound */}
243 |           <div className="glass-card rounded-2xl p-5">
244 |             <h3 className="text-white font-semibold mb-4">Ambient Sound</h3>
245 |             <div className="grid grid-cols-3 gap-2">
246 |               {AMBIENT_SOUNDS.map(sound => (
247 |                 <button
248 |                   key={sound.label}
249 |                   onClick={() => setSelectedSound(sound.label)}
250 |                   className="py-2 px-2 rounded-xl text-center transition-all"
251 |                   style={{
252 |                     background: selectedSound === sound.label ? 'rgba(99,102,241,0.2)' : 'rgba(30,30,50,0.6)',
253 |                     border: `1px solid ${selectedSound === sound.label ? '#6366f1' : 'transparent'}`,
254 |                   }}
255 |                 >
256 |                   <div className="text-lg">{sound.icon}</div>
257 |                   <div className="text-slate-400 text-xs">{sound.label}</div>
258 |                 </button>
259 |               ))}
260 |             </div>
261 |           </div>
262 |         </div>
263 | 
264 |         {/* Center - Timer */}
265 |         <div className="lg:col-span-3 flex flex-col items-center justify-start gap-6">
266 |           <div className="glass-card rounded-2xl p-8 w-full flex flex-col items-center">
267 |             {/* Phase indicator */}
268 |             <div className="flex items-center gap-3 mb-8">
269 |               <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
270 |                 phase === 'focus' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
271 |               }`}>
272 |                 {phase === 'focus' ? <Timer size={14} /> : <Coffee size={14} />}
273 |                 {phase === 'focus' ? 'Focus Session' : 'Break Time'}
274 |               </div>
275 |               {pomodoroCount > 0 && (
276 |                 <div className="flex items-center gap-1">
277 |                   {Array.from({ length: Math.min(pomodoroCount, 4) }).map((_, i) => (
278 |                     <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
279 |                   ))}
280 |                 </div>
281 |               )}
282 |             </div>
283 | 
284 |             {/* Ring Timer */}
285 |             <div className="relative" style={{ width: SIZE, height: SIZE }}>
286 |               <svg width={SIZE} height={SIZE} className="timer-ring absolute inset-0">
287 |                 <circle
288 |                   cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
289 |                   fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth={STROKE}
290 |                 />
291 |                 <motion.circle
292 |                   cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
293 |                   fill="none"
294 |                   stroke={phase === 'focus' ? '#6366f1' : '#22c55e'}
295 |                   strokeWidth={STROKE}
296 |                   strokeLinecap="round"
297 |                   strokeDasharray={CIRCUMFERENCE}
298 |                   strokeDashoffset={dashOffset}
299 |                   className="progress-ring-circle"
300 |                   style={{
301 |                     filter: `drop-shadow(0 0 8px ${phase === 'focus' ? '#6366f1' : '#22c55e'})`,
302 |                   }}
303 |                 />
304 |               </svg>
305 | 
306 |               <div className="absolute inset-0 flex flex-col items-center justify-center">
307 |                 <div className="text-5xl font-display font-black text-white tabular-nums tracking-tight">
308 |                   {formatTime(seconds)}
309 |                 </div>
310 |                 <div className="text-slate-500 text-sm mt-1">
311 |                   {isRunning ? '● Recording' : 'Ready'}
312 |                 </div>
313 |                 {elapsedMin > 0 && (
314 |                   <div className="text-indigo-400 text-xs mt-1">{elapsedMin}m elapsed</div>
315 |                 )}
316 |               </div>
317 | 
318 |               {/* Pulse ring when active */}
319 |               {isRunning && (
320 |                 <div
321 |                   className="absolute inset-0 rounded-full pulse-ring pointer-events-none"
322 |                   style={{ border: '2px solid rgba(99,102,241,0.3)' }}
323 |                 />
324 |               )}
325 |             </div>
326 | 
327 |             {/* Controls */}
328 |             <div className="flex items-center gap-4 mt-8">
329 |               <button
330 |                 onClick={handleReset}
331 |                 className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
332 |                 style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
333 |               >
334 |                 <RotateCcw size={18} />
335 |               </button>
336 | 
337 |               <motion.button
338 |                 whileHover={{ scale: 1.05 }}
339 |                 whileTap={{ scale: 0.95 }}
340 |                 onClick={() => setIsRunning(!isRunning)}
341 |                 className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all"
342 |                 style={{
343 |                   background: isRunning
344 |                     ? 'linear-gradient(135deg, #f59e0b, #d97706)'
345 |                     : 'linear-gradient(135deg, #6366f1, #a855f7)',
346 |                   boxShadow: isRunning
347 |                     ? '0 0 30px rgba(245,158,11,0.4)'
348 |                     : '0 0 30px rgba(99,102,241,0.4)',
349 |                 }}
350 |               >
351 |                 {isRunning ? <Pause size={28} /> : <Play size={28} />}
352 |               </motion.button>
353 | 
354 |               <button
355 |                 onClick={handleLogSession}
356 |                 className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
357 |                 style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
358 |               >
359 |                 <CheckCircle2 size={18} />
360 |               </button>
361 |             </div>
362 | 
363 |             {/* XP Estimate */}
364 |             <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
365 |               <Zap size={14} className="text-indigo-400" />
366 |               <span className="text-slate-400 text-sm">Estimated: <span className="text-indigo-400 font-bold">+{calculateXP({ activityType: 'focus', duration: pomodoroMinutes })} XP</span></span>
367 |               <span className="text-slate-600 text-xs">+ streak bonus</span>
368 |             </div>
369 | 
370 |             <AnimatePresence>
371 |               {sessionComplete && (
372 |                 <motion.div
373 |                   initial={{ opacity: 0, scale: 0.8, y: 20 }}
374 |                   animate={{ opacity: 1, scale: 1, y: 0 }}
375 |                   exit={{ opacity: 0, scale: 0.8 }}
376 |                   className="mt-4 p-4 rounded-2xl text-center w-full"
377 |                   style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
378 |                 >
379 |                   <div className="text-4xl mb-2">🎉</div>
380 |                   <div className="text-green-400 font-bold text-lg">Session Complete!</div>
381 |                   <div className="text-slate-400 text-sm mb-3">+{calculateXP({ activityType: 'focus', duration: pomodoroMinutes })} XP earned · Streak maintained!</div>
382 |                   <button
383 |                     onClick={handleLogSession}
384 |                     className="px-6 py-2 rounded-xl font-semibold text-white text-sm"
385 |                     style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
386 |                   >
387 |                     Log Session & Continue
388 |                   </button>
389 |                 </motion.div>
390 |               )}
391 |             </AnimatePresence>
392 |           </div>
393 | 
394 |           {/* Session Stats */}
395 |           <div className="grid grid-cols-3 gap-4 w-full">
396 |             {[
397 |               { label: 'Today\'s Sessions', value: pomodoroCount, icon: '🍅', color: '#ef4444' },
398 |               { label: 'Focus Streak', value: `${user.streak}d`, icon: '🔥', color: '#f97316' },
399 |               { label: 'XP Today', value: `${calculateXP({ activityType: 'focus', duration: pomodoroCount * pomodoroMinutes })}`, icon: '⚡', color: '#6366f1' },
400 |             ].map(stat => (
401 |               <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
402 |                 <div className="text-2xl mb-1">{stat.icon}</div>
403 |                 <div className="font-display font-bold text-xl" style={{ color: stat.color }}>{stat.value}</div>
404 |                 <div className="text-slate-500 text-xs">{stat.label}</div>
405 |               </div>
406 |             ))}
407 |           </div>
408 |         </div>
409 |       </div>
410 |     </div>
411 |   );
412 | }
</content>
</file>
<file><path>src/components/views/CurriculumView.tsx</path>
<content lines="1-296">
  1 | import { useState, useMemo } from 'react';
  2 | import { motion, AnimatePresence } from 'framer-motion';
  3 | import {
  4 |   BookOpen, ChevronRight, ChevronDown, Lock, CheckCircle2,
  5 |   Clock, Zap, Star, Target, Brain, Play, BarChart3
  6 | } from 'lucide-react';
  7 | import { useStore } from '../../store/useStore';
  8 | import { CURRICULUM } from '../../data/curriculum';
  9 | 
 10 | const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
 11 | 
 12 | function getMasteryColor(mastery: number = 0) {
 13 |   if (mastery >= 80) return '#22c55e';
 14 |   if (mastery >= 60) return '#f59e0b';
 15 |   if (mastery >= 40) return '#6366f1';
 16 |   return '#ef4444';
 17 | }
 18 | 
 19 | function MasteryBadge({ mastery = 0 }: { mastery?: number }) {
 20 |   const label = mastery >= 80 ? 'Mastered' : mastery >= 60 ? 'Proficient' : mastery >= 40 ? 'Learning' : 'Weak';
 21 |   const color = getMasteryColor(mastery);
 22 |   return (
 23 |     <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>
 24 |       {label}
 25 |     </span>
 26 |   );
 27 | }
 28 | 
 29 | export default function CurriculumView() {
 30 |   const { selectedSubject, setSelectedSubject, selectedChapter, setSelectedChapter, setCurrentView, addNotification } = useStore();
 31 |   const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
 32 |   const [selectedBoard] = useState('cbse');
 33 | 
 34 |   const board = CURRICULUM.find(b => b.id === selectedBoard)!;
 35 |   const subject = board.subjects.find(s => s.name === selectedSubject) || board.subjects[0];
 36 | 
 37 |   const totalTopics = useMemo(() =>
 38 |     subject.chapters.reduce((a, ch) => a + ch.topics.length, 0),
 39 |     [subject.chapters]
 40 |   );
 41 |   
 42 |   const masteredTopics = useMemo(() =>
 43 |     subject.chapters.reduce((a, ch) =>
 44 |       a + ch.topics.filter(t => (t.mastery || 0) >= 80).length, 0),
 45 |     [subject.chapters]
 46 |   );
 47 |   
 48 |   const avgMastery = useMemo(() =>
 49 |     Math.round(
 50 |       subject.chapters.reduce((a, ch) =>
 51 |         a + ch.topics.reduce((b, t) => b + (t.mastery || 0), 0), 0) / totalTopics
 52 |     ),
 53 |     [subject.chapters, totalTopics]
 54 |   );
 55 | 
 56 |   const handleStartTopic = (topicName: string) => {
 57 |     setSelectedChapter(expandedChapter || subject.chapters[0].name);
 58 |     setCurrentView('focus');
 59 |     addNotification({ message: `Starting: ${topicName}`, type: 'xp' });
 60 |   };
 61 | 
 62 |   return (
 63 |     <div className="max-w-6xl mx-auto space-y-6">
 64 |       {/* Board + Grade Selector */}
 65 |       <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
 66 |         <div className="flex items-center justify-between flex-wrap gap-4">
 67 |           <div>
 68 |             <h3 className="text-white font-semibold text-lg">Curriculum Structure</h3>
 69 |             <p className="text-slate-500 text-sm">CBSE · Class 12 · India</p>
 70 |           </div>
 71 |           <div className="flex items-center gap-3">
 72 |             <select className="px-3 py-2 rounded-xl text-sm text-white outline-none"
 73 |               style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}>
 74 |               <option>India</option>
 75 |               <option>UK</option>
 76 |               <option>USA</option>
 77 |             </select>
 78 |             <select className="px-3 py-2 rounded-xl text-sm text-white outline-none"
 79 |               style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}>
 80 |               <option>CBSE</option>
 81 |               <option>ICSE</option>
 82 |               <option>State Board</option>
 83 |             </select>
 84 |             <select className="px-3 py-2 rounded-xl text-sm text-white outline-none"
 85 |               style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}>
 86 |               <option>Class 12</option>
 87 |               <option>Class 11</option>
 88 |             </select>
 89 |           </div>
 90 |         </div>
 91 |       </motion.div>
 92 | 
 93 |       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 94 |         {/* Subject Sidebar */}
 95 |         <div className="lg:col-span-1 space-y-3">
 96 |           {board.subjects.map((sub) => {
 97 |             const subTotal = sub.chapters.reduce((a, ch) => a + ch.topics.length, 0);
 98 |             const subMastered = sub.chapters.reduce((a, ch) =>
 99 |               a + ch.topics.filter(t => (t.mastery || 0) >= 80).length, 0);
100 |             const subProgress = Math.round((subMastered / subTotal) * 100);
101 | 
102 |             return (
103 |               <motion.button
104 |                 key={sub.id}
105 |                 whileHover={{ scale: 1.02 }}
106 |                 onClick={() => setSelectedSubject(sub.name)}
107 |                 className="w-full p-4 rounded-2xl text-left transition-all card-hover"
108 |                 style={{
109 |                   background: selectedSubject === sub.name
110 |                     ? `linear-gradient(135deg, ${sub.color}25, ${sub.color}10)`
111 |                     : 'rgba(15,23,42,0.8)',
112 |                   border: `1px solid ${selectedSubject === sub.name ? sub.color : 'rgba(148,163,184,0.08)'}`,
113 |                 }}
114 |               >
115 |                 <div className="flex items-center gap-3 mb-3">
116 |                   <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
117 |                     style={{ background: `${sub.color}20`, color: sub.color }}>
118 |                     {sub.icon}
119 |                   </div>
120 |                   <div>
121 |                     <div className="text-white font-medium text-sm">{sub.name}</div>
122 |                     <div className="text-slate-500 text-xs">{sub.chapters.length} chapters</div>
123 |                   </div>
124 |                 </div>
125 |                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
126 |                   <div className="h-full rounded-full transition-all duration-700"
127 |                     style={{ width: `${subProgress}%`, background: sub.color }} />
128 |                 </div>
129 |                 <div className="flex justify-between mt-1.5">
130 |                   <span className="text-slate-600 text-xs">{subMastered}/{subTotal} topics</span>
131 |                   <span className="text-xs font-medium" style={{ color: sub.color }}>{subProgress}%</span>
132 |                 </div>
133 |               </motion.button>
134 |             );
135 |           })}
136 |         </div>
137 | 
138 |         {/* Chapter + Topic Detail */}
139 |         <div className="lg:col-span-3 space-y-4">
140 |           {/* Subject Overview */}
141 |           <motion.div
142 |             key={subject.id}
143 |             initial={{ opacity: 0 }}
144 |             animate={{ opacity: 1 }}
145 |             className="rounded-2xl p-5"
146 |             style={{
147 |               background: `linear-gradient(135deg, ${subject.color}15 0%, transparent 100%)`,
148 |               border: `1px solid ${subject.color}30`,
149 |             }}
150 |           >
151 |             <div className="flex items-center justify-between flex-wrap gap-4">
152 |               <div>
153 |                 <h2 className="text-white font-display font-bold text-xl">{subject.name}</h2>
154 |                 <p className="text-slate-400 text-sm">{subject.chapters.length} chapters · {totalTopics} topics</p>
155 |               </div>
156 |               <div className="flex items-center gap-6">
157 |                 <div className="text-center">
158 |                   <div className="text-2xl font-display font-bold" style={{ color: subject.color }}>{avgMastery}%</div>
159 |                   <div className="text-slate-500 text-xs">Avg Mastery</div>
160 |                 </div>
161 |                 <div className="text-center">
162 |                   <div className="text-2xl font-display font-bold text-green-400">{masteredTopics}</div>
163 |                   <div className="text-slate-500 text-xs">Mastered</div>
164 |                 </div>
165 |                 <div className="text-center">
166 |                   <div className="text-2xl font-display font-bold text-yellow-400">{totalTopics - masteredTopics}</div>
167 |                   <div className="text-slate-500 text-xs">Remaining</div>
168 |                 </div>
169 |               </div>
170 |             </div>
171 |           </motion.div>
172 | 
173 |           {/* Chapters */}
174 |           <div className="space-y-3">
175 |             {subject.chapters.map((chapter, chIdx) => {
176 |               const chMastery = Math.round(chapter.topics.reduce((a, t) => a + (t.mastery || 0), 0) / chapter.topics.length);
177 |               const isExpanded = expandedChapter === chapter.id;
178 | 
179 |               return (
180 |                 <motion.div
181 |                   key={chapter.id}
182 |                   variants={fadeUp}
183 |                   initial="hidden"
184 |                   animate="show"
185 |                   transition={{ delay: chIdx * 0.05 }}
186 |                   className="glass-card rounded-2xl overflow-hidden"
187 |                 >
188 |                   {/* Chapter Header */}
189 |                   <button
190 |                     className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-all"
191 |                     onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
192 |                   >
193 |                     <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
194 |                       style={{ background: `${subject.color}20`, color: subject.color }}>
195 |                       {chIdx + 1}
196 |                     </div>
197 |                     <div className="flex-1 min-w-0">
198 |                       <div className="text-white font-semibold">{chapter.name}</div>
199 |                       <div className="flex items-center gap-3 mt-1">
200 |                         <span className="text-slate-500 text-xs">{chapter.topics.length} topics</span>
201 |                         <span className="text-slate-500 text-xs flex items-center gap-1">
202 |                           <Clock size={10} /> {chapter.totalHours}h estimated
203 |                         </span>
204 |                         <MasteryBadge mastery={chMastery} />
205 |                       </div>
206 |                     </div>
207 |                     <div className="flex items-center gap-4 flex-shrink-0">
208 |                       <div className="text-right">
209 |                         <div className="text-white font-bold text-sm">{chMastery}%</div>
210 |                         <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden mt-1">
211 |                           <div className="h-full rounded-full"
212 |                             style={{ width: `${chMastery}%`, background: getMasteryColor(chMastery) }} />
213 |                         </div>
214 |                       </div>
215 |                       {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
216 |                     </div>
217 |                   </button>
218 | 
219 |                   {/* Topics */}
220 |                   <AnimatePresence>
221 |                     {isExpanded && (
222 |                       <motion.div
223 |                         initial={{ height: 0, opacity: 0 }}
224 |                         animate={{ height: 'auto', opacity: 1 }}
225 |                         exit={{ height: 0, opacity: 0 }}
226 |                         transition={{ duration: 0.3, ease: 'easeInOut' }}
227 |                         className="overflow-hidden"
228 |                       >
229 |                         <div className="border-t border-slate-800 divide-y divide-slate-800">
230 |                           {chapter.topics.map((topic, tIdx) => (
231 |                             <div key={topic.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-all">
232 |                               <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
233 |                                 style={{ background: (topic.mastery || 0) >= 80 ? 'rgba(34,197,94,0.2)' : 'rgba(30,30,50,0.8)' }}>
234 |                                 {(topic.mastery || 0) >= 80
235 |                                   ? <CheckCircle2 size={14} className="text-green-400" />
236 |                                   : <span className="text-slate-500 text-xs">{tIdx + 1}</span>
237 |                                 }
238 |                               </div>
239 | 
240 |                               <div className="flex-1 min-w-0">
241 |                                 <div className="text-white text-sm font-medium">{topic.name}</div>
242 |                                 <div className="text-slate-500 text-xs mt-0.5">{topic.description}</div>
243 |                                 <div className="flex items-center gap-3 mt-1.5">
244 |                                   <span className={`text-xs px-2 py-0.5 rounded-full ${
245 |                                     topic.difficulty === 'easy' ? 'bg-green-500/15 text-green-400' :
246 |                                     topic.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
247 |                                     'bg-red-500/15 text-red-400'
248 |                                   }`}>
249 |                                     {topic.difficulty}
250 |                                   </span>
251 |                                   <span className="text-slate-600 text-xs flex items-center gap-1">
252 |                                     <Clock size={10} /> {topic.estimatedHours}h
253 |                                   </span>
254 |                                   {topic.mastery && (
255 |                                     <div className="flex items-center gap-1">
256 |                                       <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
257 |                                         <div className="h-full rounded-full"
258 |                                           style={{ width: `${topic.mastery}%`, background: getMasteryColor(topic.mastery) }} />
259 |                                       </div>
260 |                                       <span className="text-xs" style={{ color: getMasteryColor(topic.mastery) }}>{topic.mastery}%</span>
261 |                                     </div>
262 |                                   )}
263 |                                 </div>
264 |                               </div>
265 | 
266 |                               <div className="flex items-center gap-2 flex-shrink-0">
267 |                                 <button
268 |                                   onClick={() => { setCurrentView('quiz'); }}
269 |                                   className="text-xs px-3 py-1.5 rounded-lg transition-all"
270 |                                   style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}
271 |                                 >
272 |                                   <Brain size={12} className="inline mr-1" />Quiz
273 |                                 </button>
274 |                                 <button
275 |                                   onClick={() => handleStartTopic(topic.name)}
276 |                                   className="text-xs px-3 py-1.5 rounded-lg transition-all"
277 |                                   style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
278 |                                 >
279 |                                   <Play size={12} className="inline mr-1" />Study
280 |                                 </button>
281 |                               </div>
282 |                             </div>
283 |                           ))}
284 |                         </div>
285 |                       </motion.div>
286 |                     )}
287 |                   </AnimatePresence>
288 |                 </motion.div>
289 |               );
290 |             })}
291 |           </div>
292 |         </div>
293 |       </div>
294 |     </div>
295 |   );
296 | }
</content>
</file>
<file><path>src/components/views/QuizView.tsx</path>
<content lines="1-379">
  1 | import { useState } from 'react';
  2 | import { motion, AnimatePresence } from 'framer-motion';
  3 | import {
  4 |   HelpCircle, CheckCircle2, XCircle, ChevronRight, ChevronLeft,
  5 |   Zap, RotateCcw, Trophy, Target, Brain, BookOpen, Sparkles,
  6 |   Clock, Star, AlertCircle, Play, BarChart3
  7 | } from 'lucide-react';
  8 | import { useStore } from '../../store/useStore';
  9 | import { QUIZ_QUESTIONS } from '../../data/curriculum';
 10 | import { calculateXP } from '../../utils/xpCalculator';
 11 | 
 12 | const QUIZ_TYPES = [
 13 |   { id: 'mcq', label: 'MCQ Quiz', icon: '🎯', desc: 'Multiple choice questions', color: '#6366f1' },
 14 |   { id: 'mixed', label: 'Mixed Test', icon: '📋', desc: 'All question types', color: '#a855f7' },
 15 |   { id: 'board', label: 'Board Style', icon: '📝', desc: 'Exam-pattern questions', color: '#22d3ee' },
 16 |   { id: 'revision', label: 'Quick Revision', icon: '⚡', desc: 'Fast-paced review', color: '#f59e0b' },
 17 | ];
 18 | 
 19 | function QuizCard({ question, index, total, answer, onAnswer, submitted }: any) {
 20 |   const isCorrect = submitted && answer === question.correctAnswer;
 21 |   const isWrong = submitted && answer !== question.correctAnswer && answer !== undefined;
 22 | 
 23 |   return (
 24 |     <motion.div
 25 |       key={question.id}
 26 |       initial={{ opacity: 0, x: 30 }}
 27 |       animate={{ opacity: 1, x: 0 }}
 28 |       exit={{ opacity: 0, x: -30 }}
 29 |       className="glass-card rounded-2xl p-6"
 30 |     >
 31 |       <div className="flex items-center justify-between mb-4">
 32 |         <div className="flex items-center gap-2">
 33 |           <span className="text-slate-500 text-sm">Question {index + 1} of {total}</span>
 34 |           <span className={`text-xs px-2 py-0.5 rounded-full ${
 35 |             question.difficulty === 'easy' ? 'bg-green-500/15 text-green-400' :
 36 |             question.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
 37 |             'bg-red-500/15 text-red-400'
 38 |           }`}>
 39 |             {question.difficulty}
 40 |           </span>
 41 |         </div>
 42 |         <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{question.topic}</span>
 43 |       </div>
 44 | 
 45 |       <h3 className="text-white font-semibold text-lg mb-6 leading-relaxed">{question.question}</h3>
 46 | 
 47 |       <div className="space-y-3">
 48 |         {question.options?.map((opt: string, idx: number) => {
 49 |           const isSelected = answer === idx;
 50 |           const isCorrectOpt = submitted && idx === question.correctAnswer;
 51 |           const isWrongOpt = submitted && isSelected && idx !== question.correctAnswer;
 52 | 
 53 |           return (
 54 |             <motion.button
 55 |               key={idx}
 56 |               whileHover={!submitted ? { scale: 1.01 } : {}}
 57 |               whileTap={!submitted ? { scale: 0.99 } : {}}
 58 |               onClick={() => !submitted && onAnswer(idx)}
 59 |               className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
 60 |               style={{
 61 |                 background: isCorrectOpt ? 'rgba(34,197,94,0.15)' :
 62 |                   isWrongOpt ? 'rgba(239,68,68,0.15)' :
 63 |                   isSelected ? 'rgba(99,102,241,0.2)' :
 64 |                   'rgba(30,30,50,0.7)',
 65 |                 border: `1px solid ${
 66 |                   isCorrectOpt ? '#22c55e' :
 67 |                   isWrongOpt ? '#ef4444' :
 68 |                   isSelected ? '#6366f1' :
 69 |                   'rgba(148,163,184,0.1)'
 70 |                 }`,
 71 |                 cursor: submitted ? 'default' : 'pointer',
 72 |               }}
 73 |             >
 74 |               <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
 75 |                 style={{
 76 |                   background: isCorrectOpt ? '#22c55e' : isWrongOpt ? '#ef4444' : isSelected ? '#6366f1' : '#1e293b',
 77 |                   color: (isCorrectOpt || isWrongOpt || isSelected) ? 'white' : '#64748b',
 78 |                 }}>
 79 |                 {String.fromCharCode(65 + idx)}
 80 |               </span>
 81 |               <span className={`flex-1 text-sm ${
 82 |                 isCorrectOpt ? 'text-green-300 font-medium' :
 83 |                 isWrongOpt ? 'text-red-300' :
 84 |                 isSelected ? 'text-white font-medium' :
 85 |                 'text-slate-300'
 86 |               }`}>{opt}</span>
 87 |               {isCorrectOpt && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
 88 |               {isWrongOpt && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
 89 |             </motion.button>
 90 |           );
 91 |         })}
 92 |       </div>
 93 | 
 94 |       {submitted && (
 95 |         <motion.div
 96 |           initial={{ opacity: 0, y: 10 }}
 97 |           animate={{ opacity: 1, y: 0 }}
 98 |           className="mt-4 p-4 rounded-xl"
 99 |           style={{
100 |             background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.08)',
101 |             border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
102 |           }}
103 |         >
104 |           <div className={`font-semibold text-sm mb-1 ${isCorrect ? 'text-green-400' : 'text-indigo-400'}`}>
105 |             {isCorrect ? '✅ Correct!' : '💡 Explanation'}
106 |           </div>
107 |           <p className="text-slate-400 text-sm">{question.explanation}</p>
108 |         </motion.div>
109 |       )}
110 |     </motion.div>
111 |   );
112 | }
113 | 
114 | function QuizResults({ score, total, subject, onRetry, onNew }: any) {
115 |   const percent = Math.round((score / total) * 100);
116 |   return (
117 |     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
118 |       <div className="text-6xl mb-4">
119 |         {percent >= 80 ? '🏆' : percent >= 60 ? '⭐' : percent >= 40 ? '📚' : '💪'}
120 |       </div>
121 |       <h2 className="text-white font-display font-bold text-3xl mb-2">
122 |         {percent >= 80 ? 'Excellent!' : percent >= 60 ? 'Good Job!' : percent >= 40 ? 'Keep Going!' : 'Need More Practice'}
123 |       </h2>
124 |       <p className="text-slate-400 mb-6">You scored {score}/{total} ({percent}%)</p>
125 | 
126 |       <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
127 |         {[
128 |           { label: 'Score', value: `${percent}%`, color: percent >= 60 ? '#22c55e' : '#ef4444' },
129 |           { label: 'Correct', value: score, color: '#22c55e' },
130 |           { label: 'XP Earned', value: `+${score * 15}`, color: '#6366f1' },
131 |         ].map(s => (
132 |           <div key={s.label} className="glass-card rounded-xl p-4">
133 |             <div className="font-display font-bold text-xl" style={{ color: s.color }}>{s.value}</div>
134 |             <div className="text-slate-500 text-xs">{s.label}</div>
135 |           </div>
136 |         ))}
137 |       </div>
138 | 
139 |       <div className="flex items-center justify-center gap-3">
140 |         <button onClick={onRetry}
141 |           className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white text-sm"
142 |           style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
143 |           <RotateCcw size={16} /> Retry
144 |         </button>
145 |         <button onClick={onNew}
146 |           className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
147 |           style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
148 |           <Play size={16} /> New Quiz
149 |         </button>
150 |       </div>
151 |     </motion.div>
152 |   );
153 | }
154 | 
155 | export default function QuizView() {
156 |   const { selectedSubject, setSelectedSubject, submitQuiz, addNotification, addXP } = useStore();
157 |   const [quizStarted, setQuizStarted] = useState(false);
158 |   const [currentIdx, setCurrentIdx] = useState(0);
159 |   const [answers, setAnswers] = useState<Record<number, number>>({});
160 |   const [submitted, setSubmitted] = useState(false);
161 |   const [quizComplete, setQuizComplete] = useState(false);
162 |   const [selectedType, setSelectedType] = useState('mcq');
163 |   const [showExplanation, setShowExplanation] = useState(false);
164 | 
165 |   const questions = QUIZ_QUESTIONS[selectedSubject] || QUIZ_QUESTIONS['Mathematics'];
166 |   const current = questions[currentIdx];
167 | 
168 |   const handleAnswer = (idx: number) => {
169 |     setAnswers(prev => ({ ...prev, [currentIdx]: idx }));
170 |   };
171 | 
172 |   const handleNext = () => {
173 |     if (submitted) {
174 |       setSubmitted(false);
175 |       if (currentIdx < questions.length - 1) {
176 |         setCurrentIdx(currentIdx + 1);
177 |       } else {
178 |         const score = questions.filter((q: any, i: number) => answers[i] === q.correctAnswer).length;
179 |         addXP(score * 15);
180 |         addNotification({ message: `Quiz complete! ${score}/${questions.length} correct · +${score * 15} XP`, type: 'xp' });
181 |         setQuizComplete(true);
182 |       }
183 |     } else {
184 |       setSubmitted(true);
185 |     }
186 |   };
187 | 
188 |   const handlePrev = () => {
189 |     if (currentIdx > 0) {
190 |       setCurrentIdx(currentIdx - 1);
191 |       setSubmitted(false);
192 |     }
193 |   };
194 | 
195 |   const handleReset = () => {
196 |     setQuizStarted(false);
197 |     setCurrentIdx(0);
198 |     setAnswers({});
199 |     setSubmitted(false);
200 |     setQuizComplete(false);
201 |   };
202 | 
203 |   const score = questions.filter((q: any, i: number) => answers[i] === q.correctAnswer).length;
204 |   const progress = ((currentIdx + 1) / questions.length) * 100;
205 | 
206 |   return (
207 |     <div className="max-w-4xl mx-auto space-y-6">
208 |       {!quizStarted ? (
209 |         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
210 |           {/* Subject Selector */}
211 |           <div className="glass-card rounded-2xl p-6">
212 |             <h3 className="text-white font-semibold text-lg mb-4">Select Subject</h3>
213 |             <div className="flex gap-3">
214 |               {['Mathematics', 'Physics', 'Chemistry'].map(sub => (
215 |                 <button
216 |                   key={sub}
217 |                   onClick={() => setSelectedSubject(sub)}
218 |                   className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
219 |                   style={{
220 |                     background: selectedSubject === sub ? 'rgba(99,102,241,0.3)' : 'rgba(30,30,50,0.8)',
221 |                     border: `1px solid ${selectedSubject === sub ? '#6366f1' : 'transparent'}`,
222 |                     color: selectedSubject === sub ? '#a5b4fc' : '#64748b',
223 |                   }}
224 |                 >
225 |                   {sub === 'Mathematics' ? '∑' : sub === 'Physics' ? '⚛' : '⚗'} {sub}
226 |                 </button>
227 |               ))}
228 |             </div>
229 |           </div>
230 | 
231 |           {/* Quiz Types */}
232 |           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
233 |             {QUIZ_TYPES.map(type => (
234 |               <motion.button
235 |                 key={type.id}
236 |                 whileHover={{ scale: 1.03 }}
237 |                 whileTap={{ scale: 0.97 }}
238 |                 onClick={() => setSelectedType(type.id)}
239 |                 className="glass-card rounded-2xl p-5 text-center card-hover"
240 |                 style={{
241 |                   border: selectedType === type.id ? `1px solid ${type.color}` : undefined,
242 |                   background: selectedType === type.id ? `${type.color}15` : undefined,
243 |                 }}
244 |               >
245 |                 <div className="text-4xl mb-3">{type.icon}</div>
246 |                 <div className="text-white font-semibold text-sm mb-1">{type.label}</div>
247 |                 <div className="text-slate-500 text-xs">{type.desc}</div>
248 |               </motion.button>
249 |             ))}
250 |           </div>
251 | 
252 |           {/* Practice Stats */}
253 |           <div className="glass-card rounded-2xl p-6">
254 |             <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
255 |               <BarChart3 size={16} className="text-indigo-400" /> Your Quiz Stats
256 |             </h3>
257 |             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
258 |               {[
259 |                 { label: 'Quizzes Taken', value: '24', icon: '📝', color: '#6366f1' },
260 |                 { label: 'Avg Score', value: '72%', icon: '🎯', color: '#22c55e' },
261 |                 { label: 'Best Score', value: '100%', icon: '🏆', color: '#f59e0b' },
262 |                 { label: 'Topics Covered', value: '18', icon: '📚', color: '#a855f7' },
263 |               ].map(s => (
264 |                 <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(30,30,50,0.6)' }}>
265 |                   <div className="text-2xl mb-1">{s.icon}</div>
266 |                   <div className="font-display font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
267 |                   <div className="text-slate-500 text-xs">{s.label}</div>
268 |                 </div>
269 |               ))}
270 |             </div>
271 |           </div>
272 | 
273 |           <div className="flex justify-center">
274 |             <motion.button
275 |               whileHover={{ scale: 1.05 }}
276 |               whileTap={{ scale: 0.95 }}
277 |               onClick={() => setQuizStarted(true)}
278 |               className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg"
279 |               style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
280 |             >
281 |               <Zap size={20} /> Start {selectedType.toUpperCase()} Quiz
282 |             </motion.button>
283 |           </div>
284 |         </motion.div>
285 |       ) : quizComplete ? (
286 |         <div className="glass-card rounded-2xl p-8">
287 |           <QuizResults
288 |             score={score}
289 |             total={questions.length}
290 |             subject={selectedSubject}
291 |             onRetry={() => { setCurrentIdx(0); setAnswers({}); setSubmitted(false); setQuizComplete(false); }}
292 |             onNew={handleReset}
293 |           />
294 |         </div>
295 |       ) : (
296 |         <div className="space-y-4">
297 |           {/* Quiz Header */}
298 |           <div className="glass-card rounded-2xl p-4">
299 |             <div className="flex items-center justify-between mb-2">
300 |               <div className="flex items-center gap-3">
301 |                 <span className="text-slate-500 text-sm">{selectedSubject} · {selectedType.toUpperCase()}</span>
302 |                 <div className="flex items-center gap-1 text-yellow-400 text-sm">
303 |                   <Star size={12} />
304 |                   <span className="font-medium">{calculateXP({ activityType: 'quiz', score })} XP</span>
305 |                 </div>
306 |               </div>
307 |               <button onClick={handleReset} className="text-slate-500 text-xs hover:text-white transition-colors">
308 |                 Exit Quiz
309 |               </button>
310 |             </div>
311 |             <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
312 |               <motion.div
313 |                 className="h-full rounded-full"
314 |                 style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
315 |                 animate={{ width: `${progress}%` }}
316 |                 transition={{ duration: 0.4 }}
317 |               />
318 |             </div>
319 |             <div className="flex justify-between mt-1">
320 |               <span className="text-slate-600 text-xs">{currentIdx + 1} / {questions.length}</span>
321 |               <span className="text-indigo-400 text-xs">{Math.round(progress)}% complete</span>
322 |             </div>
323 |           </div>
324 | 
325 |           <AnimatePresence mode="wait">
326 |             <QuizCard
327 |               key={current.id}
328 |               question={current}
329 |               index={currentIdx}
330 |               total={questions.length}
331 |               answer={answers[currentIdx]}
332 |               onAnswer={handleAnswer}
333 |               submitted={submitted}
334 |             />
335 |           </AnimatePresence>
336 | 
337 |           {/* Navigation */}
338 |           <div className="flex items-center justify-between">
339 |             <button
340 |               onClick={handlePrev}
341 |               disabled={currentIdx === 0}
342 |               className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all disabled:opacity-30"
343 |               style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}
344 |             >
345 |               <ChevronLeft size={16} /> Previous
346 |             </button>
347 | 
348 |             <div className="flex items-center gap-2">
349 |               {questions.map((_: any, i: number) => (
350 |                 <button
351 |                   key={i}
352 |                   onClick={() => { setCurrentIdx(i); setSubmitted(false); }}
353 |                   className="w-2.5 h-2.5 rounded-full transition-all"
354 |                   style={{
355 |                     background: i === currentIdx ? '#6366f1' :
356 |                       answers[i] !== undefined ? '#22c55e' : '#334155',
357 |                   }}
358 |                 />
359 |               ))}
360 |             </div>
361 | 
362 |             <button
363 |               onClick={handleNext}
364 |               disabled={answers[currentIdx] === undefined && !submitted}
365 |               className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
366 |               style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
367 |             >
368 |               {submitted
369 |                 ? (currentIdx === questions.length - 1 ? 'Finish' : 'Next')
370 |                 : 'Check Answer'
371 |               }
372 |               <ChevronRight size={16} />
373 |             </button>
374 |           </div>
375 |         </div>
376 |       )}
377 |     </div>
378 |   );
379 | }
</content>
</file>
<file><path>package.json</path>
<content lines="1-49">
 1 | {
 2 |   "name": "react-vite-tailwind",
 3 |   "private": true,
 4 |   "version": "0.0.0",
 5 |   "type": "module",
 6 |   "scripts": {
 7 |     "dev": "vite",
 8 |     "build": "vite build",
 9 |     "preview": "vite preview"
10 |   },
11 |   "dependencies": {
12 |     "bcryptjs": "^3.0.3",
13 |     "clsx": "2.1.1",
14 |     "cors": "^2.8.6",
15 |     "date-fns": "^4.1.0",
16 |     "dompurify": "^3.4.3",
17 |     "express-rate-limit": "^8.5.2",
18 |     "express-validator": "^7.3.2",
19 |     "framer-motion": "^12.38.0",
20 |     "helmet": "^8.1.0",
21 |     "jsonwebtoken": "^9.0.3",
22 |     "lucide-react": "^1.16.0",
23 |     "react": "19.2.6",
24 |     "react-dom": "19.2.6",
25 |     "recharts": "^3.8.1",
26 |     "tailwind-merge": "3.4.0",
27 |     "uuid": "^14.0.0",
28 |     "validator": "^13.15.35",
29 |     "zustand": "^5.0.13"
30 |   },
31 |   "devDependencies": {
32 |     "@tailwindcss/vite": "4.1.17",
33 |     "@types/bcryptjs": "^2.4.6",
34 |     "@types/dompurify": "^3.0.5",
35 |     "@types/jsonwebtoken": "^9.0.10",
36 |     "@types/node": "22.19.17",
37 |     "@types/react": "19.2.7",
38 |     "@types/react-dom": "19.2.3",
39 |     "@types/uuid": "^10.0.0",
40 |     "@types/validator": "^13.15.10",
41 |     "@vitejs/plugin-react": "5.1.1",
42 |     "@vitest/ui": "^4.1.6",
43 |     "tailwindcss": "4.1.17",
44 |     "typescript": "5.9.3",
45 |     "vite": "7.3.2",
46 |     "vite-plugin-singlefile": "2.3.0",
47 |     "vitest": "^4.1.6"
48 |   }
49 | }
</content>
</file>
</files>
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:17:40.603Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.35

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

Now let me search for how the authentication service and security utilities are being used in the codebase to identify potential issues.

<search_files>
<path>src</path>
<regex>process\.env\.</regex>
<file_pattern>*.ts,*.tsx</file_pattern>
</search_files>

---

**User:**

[search_files for 'process\.env\.' in '*.ts,*.tsx'] Result:
Found 0 results.
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:17:48.253Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.52

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

<search_files>
<path>src</path>
<regex>import.*authService|from.*authService</regex>
<file_pattern>*.ts,*.tsx</file_pattern>
</search_files>

---

**User:**

[search_files for 'import.*authService|from.*authService' in '*.ts,*.tsx'] Result:
Found 0 results.
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:17:54.375Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.69

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

<search_files>
<path>src</path>
<regex>VITE_|JWT_SECRET</regex>
<file_pattern>*.ts,*.tsx</file_pattern>
</search_files>

---

**User:**

[search_files for 'VITE_|JWT_SECRET' in '*.ts,*.tsx'] Result:
Found 0 results.
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:18:00.994Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$0.87

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>

---

**User:**

[list_files for '.'] Result:
.gitignore
API_DOCUMENTATION.md
BUG_REPORT.md
IMPLEMENTATION_SUMMARY.md
index.html
LICENSE
package-lock.json
package.json
README.md
tsconfig.json
vite.config.ts
public/
src/
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:18:07.549Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$1.04

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

<read_file>
<args>
  <file>
    <path>.gitignore</path>
  </file>
</args>
</read_file>

---

**User:**

[read_file for '.gitignore'. Reading multiple files at once is more efficient for the LLM. If other files are relevant to your current task, please read them simultaneously.] Result:
<files>
<file><path>.gitignore</path>
<content lines="1-143">
  1 | # Logs
  2 | logs
  3 | *.log
  4 | npm-debug.log*
  5 | yarn-debug.log*
  6 | yarn-error.log*
  7 | lerna-debug.log*
  8 | 
  9 | # Diagnostic reports (https://nodejs.org/api/report.html)
 10 | report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json
 11 | 
 12 | # Runtime data
 13 | pids
 14 | *.pid
 15 | *.seed
 16 | *.pid.lock
 17 | 
 18 | # Directory for instrumented libs generated by jscoverage/JSCover
 19 | lib-cov
 20 | 
 21 | # Coverage directory used by tools like istanbul
 22 | coverage
 23 | *.lcov
 24 | 
 25 | # nyc test coverage
 26 | .nyc_output
 27 | 
 28 | # Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
 29 | .grunt
 30 | 
 31 | # Bower dependency directory (https://bower.io/)
 32 | bower_components
 33 | 
 34 | # node-waf configuration
 35 | .lock-wscript
 36 | 
 37 | # Compiled binary addons (https://nodejs.org/api/addons.html)
 38 | build/Release
 39 | 
 40 | # Dependency directories
 41 | node_modules/
 42 | jspm_packages/
 43 | 
 44 | # Snowpack dependency directory (https://snowpack.dev/)
 45 | web_modules/
 46 | 
 47 | # TypeScript cache
 48 | *.tsbuildinfo
 49 | 
 50 | # Optional npm cache directory
 51 | .npm
 52 | 
 53 | # Optional eslint cache
 54 | .eslintcache
 55 | 
 56 | # Optional stylelint cache
 57 | .stylelintcache
 58 | 
 59 | # Optional REPL history
 60 | .node_repl_history
 61 | 
 62 | # Output of 'npm pack'
 63 | *.tgz
 64 | 
 65 | # Yarn Integrity file
 66 | .yarn-integrity
 67 | 
 68 | # dotenv environment variable files
 69 | .env
 70 | .env.*
 71 | !.env.example
 72 | 
 73 | # parcel-bundler cache (https://parceljs.org/)
 74 | .cache
 75 | .parcel-cache
 76 | 
 77 | # Next.js build output
 78 | .next
 79 | out
 80 | 
 81 | # Nuxt.js build / generate output
 82 | .nuxt
 83 | dist
 84 | .output
 85 | 
 86 | # Gatsby files
 87 | .cache/
 88 | # Comment in the public line in if your project uses Gatsby and not Next.js
 89 | # https://nextjs.org/blog/next-9-1#public-directory-support
 90 | # public
 91 | 
 92 | # vuepress build output
 93 | .vuepress/dist
 94 | 
 95 | # vuepress v2.x temp directory
 96 | .temp
 97 | 
 98 | # Sveltekit cache directory
 99 | .svelte-kit/
100 | 
101 | # vitepress build output
102 | **/.vitepress/dist
103 | 
104 | # vitepress cache directory
105 | **/.vitepress/cache
106 | 
107 | # Docusaurus cache and generated files
108 | .docusaurus
109 | 
110 | # Serverless directories
111 | .serverless/
112 | 
113 | # FuseBox cache
114 | .fusebox/
115 | 
116 | # DynamoDB Local files
117 | .dynamodb/
118 | 
119 | # Firebase cache directory
120 | .firebase/
121 | 
122 | # TernJS port file
123 | .tern-port
124 | 
125 | # Stores VSCode versions used for testing VSCode extensions
126 | .vscode-test
127 | 
128 | # pnpm
129 | .pnpm-store
130 | 
131 | # yarn v3
132 | .pnp.*
133 | .yarn/*
134 | !.yarn/patches
135 | !.yarn/plugins
136 | !.yarn/releases
137 | !.yarn/sdks
138 | !.yarn/versions
139 | 
140 | # Vite files
141 | vite.config.js.timestamp-*
142 | vite.config.ts.timestamp-*
143 | .vite/
</content>
</file>
</files>
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:18:12.806Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$1.22

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

Now I have enough context to complete my review. Let me submit my findings.

<submit_review_findings>
<issues>
[
  {
    "category": "security",
    "type": "hardcoded-credentials",
    "severity": "critical",
    "title": "Hardcoded JWT secrets in production code",
    "message": "JWT secrets are hardcoded with weak default values. Lines 41-42 use process.env with fallback to hardcoded strings 'your-super-secret-jwt-key-change-in-production' and 'your-super-secret-refresh-key-change-in-production'. These fallback values will be used if environment variables are not set, creating a critical security vulnerability. In a frontend application, process.env.VITE_* variables are exposed in the client bundle, making JWT secrets publicly accessible.",
    "path": "src/services/authService.ts",
    "line": 41,
    "column": 1,
    "endLine": 42,
    "endColumn": 120,
    "suggestion": "Remove JWT secret handling from frontend code entirely. JWT signing and verification should only occur on a secure backend server. If this is meant to be a backend service, ensure it runs server-side only and use proper environment variable validation without fallback defaults.",
    "issueScope": "Multiple Files"
  },
  {
    "category": "security",
    "type": "sensitive-data-logging",
    "severity": "high",
    "title": "Password reset token logged to console",
    "message": "Line 631 logs the password reset token to console: `console.log('Password reset token for ${user.email}: ${resetToken}')`. This sensitive security token should never be logged as it could be exposed in production logs, allowing unauthorized password resets.",
    "path": "src/services/authService.ts",
    "line": 631,
    "column": 7,
    "endLine": 631,
    "endColumn": 75,
    "suggestion": "Remove the console.log statement. In production, send the reset token via email only. For development/testing, use a secure logging mechanism that doesn't expose tokens in plain text.",
    "issueScope": "Single File"
  },
  {
    "category": "functionality",
    "type": "issue-alignment-scoring",
    "severity": "high",
    "title": "Frontend authentication service cannot function properly",
    "message": "The entire authentication service (authService.ts) is implemented in the frontend but requires server-side operations. JWT signing/verification, bcrypt password hashing, and session management cannot work securely in a browser environment. This creates a fundamental architecture issue where the authentication system appears functional but provides no real security.",
    "path": "src/services/authService.ts",
    "line": 1,
    "column": 1,
    "endLine": 963,
    "endColumn": 1,
    "suggestion": "Refactor the authentication system: 1) Move authService.ts to a backend API server, 2) Create a frontend auth client that makes HTTP requests to the backend, 3) Store JWT secrets and perform all cryptographic operations server-side only.",
    "issueScope": "Multiple Files"
  },
  {
    "category": "security",
    "type": "secure-dependency-check",
    "severity": "medium",
    "title": "Server-side dependencies in frontend package.json",
    "message": "Dependencies like 'bcryptjs', 'jsonwebtoken', 'express-rate-limit', 'express-validator', 'helmet', and 'cors' are server-side packages added to a frontend Vite/React application. These packages won't function properly in the browser and increase bundle size unnecessarily. More critically, they suggest an architectural confusion between frontend and backend code.",
    "path": "package.json",
    "line": 12,
    "column": 1,
    "endLine": 20,
    "endColumn": 1,
    "suggestion": "Remove server-side dependencies from package.json. Create a separate backend project with its own package.json for authentication services. Keep only frontend-appropriate dependencies in this project.",
    "issueScope": "Multiple Files"
  },
  {
    "category": "security",
    "type": "input-sanitization-review",
    "severity": "medium",
    "title": "DOMPurify used incorrectly for non-HTML sanitization",
    "message": "Lines 216-229 in security.ts use DOMPurify to sanitize plain text input (usernames, emails, etc.) by stripping all HTML tags. While this prevents XSS, DOMPurify is designed for HTML sanitization. For plain text fields, this is overkill and may have unintended side effects. The additional regex `.replace(/[<>]/g, '')` on line 228 is redundant since DOMPurify with ALLOWED_TAGS: [] already removes all tags.",
    "path": "src/utils/security.ts",
    "line": 216,
    "column": 1,
    "endLine": 230,
    "endColumn": 2,
    "suggestion": "For plain text inputs (usernames, emails), use simple string validation and escaping instead of DOMPurify. Reserve DOMPurify for actual HTML content sanitization (like the sanitizeHTML function). Remove the redundant `.replace(/[<>]/g, '')` on line 228.",
    "issueScope": "Single File"
  },
  {
    "category": "security",
    "type": "hardcoded-credentials",
    "severity": "low",
    "title": "Placeholder 2FA verification always accepts 6-digit codes",
    "message": "Lines 846-854 contain a placeholder TOTP verification that accepts any 6-digit numeric code without actual verification. The comment acknowledges this is a placeholder, but it creates a security vulnerability if deployed. Any 6-digit number (000000-999999) will pass 2FA verification.",
    "path": "src/services/authService.ts",
    "line": 846,
    "column": 1,
    "endLine": 854,
    "endColumn": 4,
    "suggestion": "Implement proper TOTP verification using a library like 'otplib' or remove the 2FA feature entirely until it can be properly implemented. Add a clear runtime warning if this placeholder code is executed.",
    "issueScope": "Single File"
  },
  {
    "category": "functionality",
    "type": "race-condition-warning",
    "severity": "medium",
    "title": "Potential race condition in timer cleanup",
    "message": "Lines 94-110 in FocusTimer.tsx have overlapping useEffect cleanup logic. Both the main timer effect (lines 94-100) and the unmount effect (lines 103-110) clear the same intervalRef. If the component unmounts while the timer is running, both cleanup functions will attempt to clear the interval, though this is relatively harmless due to the null check.",
    "path": "src/components/views/FocusTimer.tsx",
    "line": 94,
    "column": 1,
    "endLine": 110,
    "endColumn": 6,
    "suggestion": "Consolidate cleanup logic into a single useEffect cleanup function. Remove the separate unmount effect (lines 103-110) as the main effect's cleanup already handles this case.",
    "issueScope": "Single File"
  },
  {
    "category": "maintainability",
    "type": "magic-numbers-strings",
    "severity": "low",
    "title": "Magic numbers for XP calculations",
    "message": "Lines 80-82 in FocusTimer.tsx calculate XP using the calculateXP utility, but the notification message hardcodes the XP value again. If XP calculation logic changes in xpCalculator.ts, the notification message could show incorrect values. Similar issue on lines 124, 135, 366, 381.",
    "path": "src/components/views/FocusTimer.tsx",
    "line": 80,
    "column": 1,
    "endLine": 82,
    "endColumn": 1,
    "suggestion": "Store the calculated XP in a variable and reuse it in the notification message to ensure consistency: `const earnedXP = calculateXP({...}); addNotification({message: \\`🎉 Session complete! +${earnedXP} XP earned!\\`, type: 'xp'});`",
    "issueScope": "Single File"
  },
  {
    "category": "maintainability",
    "type": "magic-numbers-strings",
    "severity": "low",
    "title": "Hardcoded XP value in quiz completion",
    "message": "Lines 179-180 in QuizView.tsx calculate XP as `score * 15`, hardcoding the XP-per-correct-answer value. This duplicates the logic from xpCalculator.ts (line 21: QUIZ_PER_CORRECT: 15). If the XP rate changes, both locations must be updated. Similar hardcoding appears on line 131.",
    "path": "src/components/views/QuizView.tsx",
    "line": 179,
    "column": 1,
    "endLine": 180,
    "endColumn": 1,
    "suggestion": "Use the calculateXP utility function consistently: `const earnedXP = calculateXP({ activityType: 'quiz', score });` instead of `score * 15`.",
    "issueScope": "Single File"
  },
  {
    "category": "security",
    "type": "input-sanitization-review",
    "severity": "low",
    "title": "Inconsistent input sanitization in registration",
    "message": "Lines 218-224 in authService.ts sanitize email, username, firstName, and lastName during registration, but the sanitizeInput function (security.ts:216-230) is designed for preventing XSS in HTML contexts. For structured data like emails and usernames, this sanitization may be unnecessary or inappropriate. Email addresses are already validated by the validator library, and usernames have strict regex validation.",
    "path": "src/services/authService.ts",
    "line": 218,
    "column": 1,
    "endLine": 224,
    "endColumn": 1,
    "suggestion": "Remove sanitizeInput calls for email and username since they're already validated with strict rules. Keep sanitization only for firstName and lastName which are free-form text fields that might be displayed in HTML contexts.",
    "issueScope": "Single File"
  }
]
</issues>
</submit_review_findings>

---

**User:**

[submit_review_findings({"issues":"[\n  {\n    \"category\": \"security\",\n    \"type\": \"hardcoded-credentials\",\n    \"severity\": \"critical\",\n    \"title\": \"Hardcoded JWT secrets in production code\",\n    \"message\": \"JWT secrets are hardcoded with weak default values. Lines 41-42 use process.env with fallback to hardcoded strings 'your-super-secret-jwt-key-change-in-production' and 'your-super-secret-refresh-key-change-in-production'. These fallback values will be used if environment variables are not set, creating a critical security vulnerability. In a frontend application, process.env.VITE_* variables are exposed in the client bundle, making JWT secrets publicly accessible.\",\n    \"path\": \"src/services/authService.ts\",\n    \"line\": 41,\n    \"column\": 1,\n    \"endLine\": 42,\n    \"endColumn\": 120,\n    \"suggestion\": \"Remove JWT secret handling from frontend code entirely. JWT signing and verification should only occur on a secure backend server. If this is meant to be a backend service, ensure it runs server-side only and use proper environment variable validation without fallback defaults.\",\n    \"issueScope\": \"Multiple Files\"\n  },\n  {\n    \"category\": \"security\",\n    \"type\": \"sensitive-data-logging\",\n    \"severity\": \"high\",\n    \"title\": \"Password reset token logged to console\",\n    \"message\": \"Line 631 logs the password reset token to console: `console.log('Password reset token for ${user.email}: ${resetToken}')`. This sensitive security token should never be logged as it could be exposed in production logs, allowing unauthorized password resets.\",\n    \"path\": \"src/services/authService.ts\",\n    \"line\": 631,\n    \"column\": 7,\n    \"endLine\": 631,\n    \"endColumn\": 75,\n    \"suggestion\": \"Remove the console.log statement. In production, send the reset token via email only. For development/testing, use a secure logging mechanism that doesn't expose tokens in plain text.\",\n    \"issueScope\": \"Single File\"\n  },\n  {\n    \"category\": \"functionality\",\n    \"type\": \"issue-alignment-scoring\",\n    \"severity\": \"high\",\n    \"title\": \"Frontend authentication service cannot function properly\",\n    \"message\": \"The entire authentication service (authService.ts) is implemented in the frontend but requires server-side operations. JWT signing/verification, bcrypt password hashing, and session management cannot work securely in a browser environment. This creates a fundamental architecture issue where the authentication system appears functional but provides no real security.\",\n    \"path\": \"src/services/authService.ts\",\n    \"line\": 1,\n    \"column\": 1,\n    \"endLine\": 963,\n    \"endColumn\": 1,\n    \"suggestion\": \"Refactor the authentication system: 1) Move authService.ts to a backend API server, 2) Create a frontend auth client that makes HTTP requests to the backend, 3) Store JWT secrets and perform all cryptographic operations server-side only.\",\n    \"issueScope\": \"Multiple Files\"\n  },\n  {\n    \"category\": \"security\",\n    \"type\": \"secure-dependency-check\",\n    \"severity\": \"medium\",\n    \"title\": \"Server-side dependencies in frontend package.json\",\n    \"message\": \"Dependencies like 'bcryptjs', 'jsonwebtoken', 'express-rate-limit', 'express-validator', 'helmet', and 'cors' are server-side packages added to a frontend Vite/React application. These packages won't function properly in the browser and increase bundle size unnecessarily. More critically, they suggest an architectural confusion between frontend and backend code.\",\n    \"path\": \"package.json\",\n    \"line\": 12,\n    \"column\": 1,\n    \"endLine\": 20,\n    \"endColumn\": 1,\n    \"suggestion\": \"Remove server-side dependencies from package.json. Create a separate backend project with its own package.json for authentication services. Keep only frontend-appropriate dependencies in this project.\",\n    \"issueScope\": \"Multiple Files\"\n  },\n  {\n    \"category\": \"security\",\n    \"type\": \"input-sanitization-review\",\n    \"severity\": \"medium\",\n    \"title\": \"DOMPurify used incorrectly for non-HTML sanitization\",\n    \"message\": \"Lines 216-229 in security.ts use DOMPurify to sanitize plain text input (usernames, emails, etc.) by stripping all HTML tags. While this prevents XSS, DOMPurify is designed for HTML sanitization. For plain text fields, this is overkill and may have unintended side effects. The additional regex `.replace(/[<>]/g, '')` on line 228 is redundant since DOMPurify with ALLOWED_TAGS: [] already removes all tags.\",\n    \"path\": \"src/utils/security.ts\",\n    \"line\": 216,\n    \"column\": 1,\n    \"endLine\": 230,\n    \"endColumn\": 2,\n    \"suggestion\": \"For plain text inputs (usernames, emails), use simple string validation and escaping instead of DOMPurify. Reserve DOMPurify for actual HTML content sanitization (like the sanitizeHTML function). Remove the redundant `.replace(/[<>]/g, '')` on line 228.\",\n    \"issueScope\": \"Single File\"\n  },\n  {\n    \"category\": \"security\",\n    \"type\": \"hardcoded-credentials\",\n    \"severity\": \"low\",\n    \"title\": \"Placeholder 2FA verification always accepts 6-digit codes\",\n    \"message\": \"Lines 846-854 contain a placeholder TOTP verification that accepts any 6-digit numeric code without actual verification. The comment acknowledges this is a placeholder, but it creates a security vulnerability if deployed. Any 6-digit number (000000-999999) will pass 2FA verification.\",\n    \"path\": \"src/services/authService.ts\",\n    \"line\": 846,\n    \"column\": 1,\n    \"endLine\": 854,\n    \"endColumn\": 4,\n    \"suggestion\": \"Implement proper TOTP verification using a library like 'otplib' or remove the 2FA feature entirely until it can be properly implemented. Add a clear runtime warning if this placeholder code is executed.\",\n    \"issueScope\": \"Single File\"\n  },\n  {\n    \"category\": \"functionality\",\n    \"type\": \"race-condition-warning\",\n    \"severity\": \"medium\",\n    \"title\": \"Potential race condition in timer cleanup\",\n    \"message\": \"Lines 94-110 in FocusTimer.tsx have overlapping useEffect cleanup logic. Both the main timer effect (lines 94-100) and the unmount effect (lines 103-110) clear the same intervalRef. If the component unmounts while the timer is running, both cleanup functions will attempt to clear the interval, though this is relatively harmless due to the null check.\",\n    \"path\": \"src/components/views/FocusTimer.tsx\",\n    \"line\": 94,\n    \"column\": 1,\n    \"endLine\": 110,\n    \"endColumn\": 6,\n    \"suggestion\": \"Consolidate cleanup logic into a single useEffect cleanup function. Remove the separate unmount effect (lines 103-110) as the main effect's cleanup already handles this case.\",\n    \"issueScope\": \"Single File\"\n  },\n  {\n    \"category\": \"maintainability\",\n    \"type\": \"magic-numbers-strings\",\n    \"severity\": \"low\",\n    \"title\": \"Magic numbers for XP calculations\",\n    \"message\": \"Lines 80-82 in FocusTimer.tsx calculate XP using the calculateXP utility, but the notification message hardcodes the XP value again. If XP calculation logic changes in xpCalculator.ts, the notification message could show incorrect values. Similar issue on lines 124, 135, 366, 381.\",\n    \"path\": \"src/components/views/FocusTimer.tsx\",\n    \"line\": 80,\n    \"column\": 1,\n    \"endLine\": 82,\n    \"endColumn\": 1,\n    \"suggestion\": \"Store the calculated XP in a variable and reuse it in the notification message to ensure consistency: `const earnedXP = calculateXP({...}); addNotification({message: \\\\`🎉 Session complete! +${earnedXP} XP earned!\\\\`, type: 'xp'});`\",\n    \"issueScope\": \"Single File\"\n  },\n  {\n    \"category\": \"maintainability\",\n    \"type\": \"magic-numbers-strings\",\n    \"severity\": \"low\",\n    \"title\": \"Hardcoded XP value in quiz completion\",\n    \"message\": \"Lines 179-180 in QuizView.tsx calculate XP as `score * 15`, hardcoding the XP-per-correct-answer value. This duplicates the logic from xpCalculator.ts (line 21: QUIZ_PER_CORRECT: 15). If the XP rate changes, both locations must be updated. Similar hardcoding appears on line 131.\",\n    \"path\": \"src/components/views/QuizView.tsx\",\n    \"line\": 179,\n    \"column\": 1,\n    \"endLine\": 180,\n    \"endColumn\": 1,\n    \"suggestion\": \"Use the calculateXP utility function consistently: `const earnedXP = calculateXP({ activityType: 'quiz', score });` instead of `score * 15`.\",\n    \"issueScope\": \"Single File\"\n  },\n  {\n    \"category\": \"security\",\n    \"type\": \"input-sanitization-review\",\n    \"severity\": \"low\",\n    \"title\": \"Inconsistent input sanitization in registration\",\n    \"message\": \"Lines 218-224 in authService.ts sanitize email, username, firstName, and lastName during registration, but the sanitizeInput function (security.ts:216-230) is designed for preventing XSS in HTML contexts. For structured data like emails and usernames, this sanitization may be unnecessary or inappropriate. Email addresses are already validated by the validator library, and usernames have strict regex validation.\",\n    \"path\": \"src/services/authService.ts\",\n    \"line\": 218,\n    \"column\": 1,\n    \"endLine\": 224,\n    \"endColumn\": 1,\n    \"suggestion\": \"Remove sanitizeInput calls for email and username since they're already validated with strict rules. Keep sanitization only for firstName and lastName which are free-form text fields that might be displayed in HTML contexts.\",\n    \"issueScope\": \"Single File\"\n  }\n]"})] Result:
**10 Review Issues Created**

critical **Hardcoded JWT secrets in production code** `@issue-security-hardcoded-credentials-src/services/authService.ts-41-1778872787474`
src/services/authService.ts:40-41
security | hardcoded-credentials | critical

high **Password reset token logged to console** `@issue-security-sensitive-data-logging-src/services/authService.ts-631-1778872787474`
src/services/authService.ts:630:6
security | sensitive-data-logging | high

high **Frontend authentication service cannot function properly** `@issue-functionality-issue-alignment-scoring-src/services/authService.ts-1-1778872787474`
src/services/authService.ts:0-962
functionality | issue-alignment-scoring | high

medium **Server-side dependencies in frontend package.json** `@issue-security-secure-dependency-check-package.json-12-1778872787474`
package.json:11-19
security | secure-dependency-check | medium

medium **DOMPurify used incorrectly for non-HTML sanitization** `@issue-security-input-sanitization-review-src/utils/security.ts-216-1778872787474`
src/utils/security.ts:215-229
security | input-sanitization-review | medium

low **Placeholder 2FA verification always accepts 6-digit codes** `@issue-security-hardcoded-credentials-src/services/authService.ts-846-1778872787474`
src/services/authService.ts:845-853
security | hardcoded-credentials | low

medium **Potential race condition in timer cleanup** `@issue-functionality-race-condition-warning-src/components/views/FocusTimer.tsx-94-1778872787474`
src/components/views/FocusTimer.tsx:93-109
functionality | race-condition-warning | medium

low **Magic numbers for XP calculations** `@issue-maintainability-magic-numbers-strings-src/components/views/FocusTimer.tsx-80-1778872787475`
src/components/views/FocusTimer.tsx:79-81
maintainability | magic-numbers-strings | low

low **Hardcoded XP value in quiz completion** `@issue-maintainability-magic-numbers-strings-src/components/views/QuizView.tsx-179-1778872787475`
src/components/views/QuizView.tsx:178-179
maintainability | magic-numbers-strings | low

low **Inconsistent input sanitization in registration** `@issue-security-input-sanitization-review-src/services/authService.ts-218-1778872787475`
src/services/authService.ts:217-223
security | input-sanitization-review | low

All 10 issues have been added to review findings

📋 Review the issues in the Bob findings panel. *Mention its been added to bob findings*
<environment_details>
# VSCode Visible Files
src\components\views\FocusTimer.tsx

# VSCode Open Tabs
src/index.css,src/components/layout/Header.tsx,src/utils/xpCalculator.ts,src/components/views/FocusTimer.tsx,src/components/views/QuizView.tsx,src/store/useStore.ts,BUG_REPORT.md,src/types/auth.types.ts,src/utils/security.ts,src/services/authService.ts,API_DOCUMENTATION.md,src/tests/auth.test.ts,IMPLEMENTATION_SUMMARY.md,tsconfig.json,src/components/views/CurriculumView.tsx

# Actively Running Terminals
## Terminal 1 (Active)
### Working Directory: `c:\Users\Rifat\Desktop\Masala\masala`
### Original command: `npm run dev`

# Current Time
Current time in ISO 8601 UTC format: 2026-05-15T19:19:48.246Z
User time zone: Asia/Dhaka, UTC+6:00

# Current Cost
$1.40

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>advanced</slug>
<name>🛠️ Advanced</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
Code review complete. 10 issues identified and added to Bob findings panel:

**Critical Issues (1):**
- Hardcoded JWT secrets with weak defaults exposed in frontend code

**High Severity (2):**
- Password reset tokens logged to console
- Frontend authentication architecture fundamentally insecure (server-side operations in browser)

**Medium Severity (3):**
- Server-side dependencies in frontend package.json
- DOMPurify misused for plain text sanitization
- Race condition in timer cleanup logic

**Low Severity (4):**
- Placeholder 2FA accepts any 6-digit code
- Inconsistent XP calculation values
- Unnecessary input sanitization for validated fields

The most critical finding is that the entire authentication system is implemented client-side in a React/Vite frontend application, which cannot provide real security. JWT signing, password hashing, and session management must be moved to a secure backend server.

All findings are available in the Bob findings panel with detailed explanations and suggestions.
</result>
</attempt_completion>

