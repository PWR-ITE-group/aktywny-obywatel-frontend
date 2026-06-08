# API Contract for Aktywny Obywatel Frontend

This document outlines the expected API endpoints that the frontend consumes. The backend team should implement these contracts.
test
## Base URL
All endpoints are relative to the base URL configured in `src/config/api.js` (via `VITE_API_URL` environment variable).

## Authentication
The frontend automatically attaches JWT tokens to requests via Axios interceptors:
```javascript
config.headers.Authorization = `Bearer ${token}`;
```

## Endpoints

### Auth
| Endpoint | Method | Description | Request | Success Response |
|----------|--------|-------------|---------|------------------|
| `/api/auth/login` | POST | User login | `{ email, password }` | `{ success: true, data: { email, role, token } }` |
| `/api/auth/register` | POST | User registration | `{ email, password, phoneNumber }` | `{ success: true, data: { verificationToken } }` |
| `/api/auth/verify?token={token}` | POST | Email verification | (token in URL) | `{ success: true }` |
| `/api/auth/request-password-reset` | POST | Request password reset link | `{ email }` | `{ success: true }` |
| `/api/auth/confirm-password-reset?token={token}` | POST | Confirm password reset | `{ newPassword }` | `{ success: true }` |

### Users
| Endpoint | Method | Description | Request | Success Response |
|----------|--------|-------------|---------|------------------|
| `/api/users/profile` | PUT | Update user profile | `{ email, firstName, lastName, phone }` | `{ success: true, data: { updatedUser } }` |
| `/api/users/password` | PUT | Change password | `{ currentPassword, newPassword }` | `{ success: true }` |
| `/api/users/notifications` | PUT | Update notification preferences | `{ channels: { email, push, inApp }, events: { statusChange, authorityReply, weeklyDigest } }` | `{ success: true }` |
| `/api/users/account` | DELETE | Request account deletion | (none) | `{ success: true }` |

### Complaints/Reports
| Endpoint | Method | Description | Request | Success Response |
|----------|--------|-------------|---------|------------------|
| `/api/complaints` | GET | Get all reports (with optional filters) | `?status={}&category={}` | `{ success: true, data: [ { id, title, category, status, lat, lng, description, createdAt } ] }` |
| `/api/complaints/{id}` | GET | Get specific report by ID | (none) | `{ success: true, data: { reportObject } }` |
| `/api/complaints` | POST | Create new report | `{ category, description, priority, location: { lat, lng }, photoCount }` | `{ success: true, data: { createdReport } }` |

### Admin
| Endpoint | Method | Description | Request | Success Response |
|----------|--------|-------------|---------|------------------|
| `/api/admin/*` | Various | Admin-only endpoints (to be defined) | - | - |

## Error Responses
Standard error response format:
```json
{
  "success": false,
  "message": "Error description"
}
```

For validation errors, the backend may return:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["Error message 1", "Error message 2"]
  }
}
```

## Special Handling
- **Password Reset Security**: The frontend always shows success message after password reset request (even if backend returns error) to prevent user enumeration (WNF-14).
- **Token Expiry**: The axios interceptor automatically redirects to login on 401 errors (except for login endpoint).
- **Mock Mode**: Services have a `USE_MOCK` flag that simulates API calls with delays when set to `true`.

## Date Format
Dates should be sent and received in ISO date format (YYYY-MM-DD) for simplicity.

## Photo Uploads
Currently, the frontend only sends `photoCount` to the backend. Actual photo upload implementation would require multipart/form-data endpoints if needed in the future.