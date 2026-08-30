---
name: nestjs-security-best-practices
description: Security best practices for NestJS APIs: DTO validation constraints, injection and DoS prevention, access control, and output sanitization. Use when building, reviewing, or refactoring NestJS endpoints, DTOs, guards, or auth.
metadata:
  author: Amara Liz
---

# NestJS Security Best Practices

This skill outlines security best practices when building, reviewing, or refactoring NestJS APIs. These rules ensure robustness against common attack vectors such as injection, DoS, and improper access control.

## 1. DTO Validation Constraints

Data Transfer Objects (DTOs) act as the first line of defense. Proper constraints prevent malicious inputs and resource exhaustion.

### String Length Limits (DoS Prevention)
Strings without max limits can be used to send excessively large payloads, exhausting server memory or database limits.
- **Rule:** Always attach `@MaxLength()` to strings unless there is a specific reason not to.
- **Example:**
  ```typescript
  @IsString()
  @MaxLength(100) // Define reasonable limits based on database bounds
  name: string;
  ```

### Specific Formatting (XSS & Injection Prevention)
Freeform text should be restricted to expected patterns whenever possible.
- **URLs:** Never validate URLs with just `@IsString()`. Always use `@IsUrl()` to prevent payloads like `javascript:alert(1)`.
  ```typescript
  @IsUrl({}, { message: 'A URL deve ser válida' })
  @MaxLength(2048)
  websiteUrl: string;
  ```
- **Emails:** Use `@IsEmail()`.
- **Enums:** Use `@IsEnum()` for strict allowed values.

## 2. Authentication & Authorization

### Controller Level Checks
- Protect endpoints by applying `@UseGuards(JwtAuthGuard)` and mapping allowed roles with `@Roles()`.
- Use the `@AuthUser()` decorator to retrieve the authenticated user payload safely instead of reading raw request headers.

### Tenancy & Data Isolation (IDOR Prevention)
In multi-tenant or multi-company systems, prevent Insecure Direct Object Reference (IDOR) by strictly querying data scoped to the current user's tenancy.
- **Rule:** Never retrieve or mutate an entity solely by its `id`. Always include `companyId` or `userId` in the `where` clause.
- **Example:**
  ```typescript
  // BAD: Vulnerable to IDOR
  this.prisma.form.findFirst({ where: { id } });

  // GOOD: Isolated to tenant
  this.prisma.form.findFirst({ where: { id, companyId } });
  ```

## 3. Global Pipeline Safety

Ensure the global `ValidationPipe` restricts payloads strictly to defined DTO properties.
- **whitelist:** `true` (Strips properties not present in the DTO)
- **forbidNonWhitelisted:** `true` (Throws an error if extra properties are sent, preventing Mass Assignment)
- **transform:** `true` (Transforms payload primitives to defined class instances/types)

## 4. Secure Database Queries
- Use Prisma's native methods safely. Avoid using raw queries (`$queryRaw`) unless strictly necessary, and if used, pass variables as parameterized values (e.g., `Prisma.sql`), NEVER as interpolated template strings.
