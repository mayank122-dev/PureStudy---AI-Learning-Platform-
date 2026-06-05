# Security Specifications & Rules Design

## Data Invariants

1. **User Ownership**: A user's personal collections (`notes`, `doubts`, `tasks`, `quizAttempts`, `dailyProgress`, `formulaFavorites`) must strictly belong to the authenticated user ID (`userId`).
2. **Admin Privileges**: Only verified administrator accounts registered under `/admins` or explicitly flagged can write global collections like `/quizzes` or `/notifications`.
3. **No Cross-User Access**: Users can only read, write, update, or delete their own documents. They cannot read or modify other users' documents.
4. **Platform Quizzes**: Global quizzes are read-only (`allow get`, `allow list`) for signed-in users, and writeable only by authorized Administrator accounts.
5. **Universal Announcements**: Notifications are read-only for signed-in users and writeable only by Administrator accounts.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Attempt to write to `/users/alice` while authenticated as `bob`. (Result: Denied)
2. **Interleaved Profile Updates**: Attempt to write another user's progress from a guest session. (Result: Denied)
3. **Ghost Fields Injection**: Sending a payload to a note with extra unvalidated parameters like `isVerifiedAdmin: true`. (Result: Denied)
4. **Relational Query Scraping**: Attempting to query all notes across the platform without limiting queries to the individual path. (Result: Denied)
5. **System Field Escalation**: Trying to manually set `isAdmin: true` during self-onboarding. (Result: Denied)
6. **Immutable Field Tampering**: Modifying the `createdAt` or `userId` values of an existing note or user profile. (Result: Denied)
7. **Junk String ID Attack**: Creating a note or task with a document identifier size exceeding 128 characters or containing unsafe injection strings. (Result: Denied)
8. **Malicious Global Quiz Creation**: A non-admin user trying to POST a modified exam structure to `/quizzes/malicious-quiz`. (Result: Denied)
9. **Malicious Global Notification Posting**: A regular student sending an unverified notification to mass broadcast spam to the platform. (Result: Denied)
10. **Spoofed User Creation**: Attempting to create a user account document where `email` diverges from `request.auth.token.email`. (Result: Denied)
11. **Negative Score Insertion**: Submitting a Quiz Attempt with a negative score or invalid boundary points. (Result: Denied)
12. **Fake System Clock Setting**: Setting custom client-side `createdAt` values that bypass the authoritative server timestamp `request.time`. (Result: Denied)
