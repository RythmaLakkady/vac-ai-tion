# Firestore Security Audit

## 1. UserTrips
- **Who can read?**: Only the authenticated user whose `uid` matches the `userId` field on the document.
- **Who can create?**: Authenticated users, provided they set `userId` to their own `uid`.
- **Who can update/delete?**: Only the owner (`userId == request.auth.uid`).
- **Anonymous access?**: Denied. Users must be logged in to create or view trips.
- **Cross-user access?**: Denied. A user cannot read or write another user's trips.
- **Ownership Modification?**: Denied, as `update` requires `userId` to match their own `uid`, meaning they can't change it to someone else's without losing access, but strictly they shouldn't change it.

## 2. UserNotes
- **Who can read/write?**: Authenticated user matching `userId`.
- **Anonymous access?**: Denied.
- **Cross-user access?**: Denied.

## 3. UserProfiles
- **Who can read/write?**: Authenticated user whose `uid` matches the document ID (`userId`).
- **Anonymous access?**: Denied.
- **Cross-user access?**: Denied.

## 4. agentJobs
- **Who can read?**: Authenticated user matching `userId` on the job.
- **Who can write?**: Only the Admin SDK (Cloud Functions).
- **Anonymous access?**: Denied.
- **Cross-user access?**: Denied.

## 5. priceSearches
- **Who can read?**: Authenticated user matching `userId`.
- **Who can write?**: Admin SDK only.

## 6. userPreferences
- **Who can read/write?**: Authenticated user matching document ID (`userId`).

## 7. itineraryCache
- **Who can read?**: Any authenticated user (as it's a shared cache of non-sensitive public destination info).
- **Who can write?**: Admin SDK only.

### Conclusion
The new `firestore.rules` securely isolate user data. The global `allow read: if true` has been removed from `UserTrips`, closing the critical privacy loophole.
