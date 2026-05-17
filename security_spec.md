# Security Specification: Jalajala Engineering Portal

## 1. Data Invariants
- **Permits**: Citizens can only see and manage their own permit applications. Admin (Engineering Office) can manage all.
- **Projects**: Publicly readable. Only Admins can create/update.
- **Issue Reports**: Citizens can create reports. They can only see their own reports (if logged in) or reports where they are the author. Admins can manage all.
- **Identification**: All document IDs must be valid alphanumeric strings.
- **Timestamps**: `submissionDate` and `timestamp` must use server time where applicable, but for this MVP we'll validate they are valid numbers.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attempt to create a permit with `applicantId` of another user. (DENIED)
2. **Ghost Field Injection**: Add `isApproved: true` to a new permit application before review. (DENIED)
3. **Budget Poisoning**: Update a project budget to a negative value or a string. (DENIED)
4. **State Shortcutting**: Change a permit status from `PENDING` directly to `APPROVED` by the citizen. (DENIED)
5. **Project Modification**: A non-admin user attempts to change a project location. (DENIED)
6. **Report Scraping**: Authenticated user attempts to list all issue reports without being an owner/admin. (DENIED)
7. **Resource Exhaustion**: Send a 1MB string as a project description. (DENIED)
8. **Orphaned Writes**: Create a permit without a valid type. (DENIED)
9. **Timestamp Manipulation**: Set a past date for `submissionDate` on a new permit. (DENIED)
10. **ID Injection**: Create a report with an ID containing malicious symbols like `../scripts/hack`. (DENIED)
11. **PII Leak**: Access the full private data of another citizen's permit. (DENIED)
12. **Role Elevation**: Attempt to write to a hypothetical `admins` collection. (DENIED)

## 3. Implementation Plan
- Implement `isValidId`, `isSignedIn`, `isAdmin`.
- Implement per-entity validation helpers.
- Use `affectedKeys().hasOnly()` for granular update control.
