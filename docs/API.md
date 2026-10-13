# CodeFlow REST API Documentation

CodeFlow exposes a standardized, hardened JSON REST API with centralized error handling, rate limiting on critical routes, CSRF/XSS headers via Helmet, and dual authentication support (httpOnly `cf_token` cookie and `Authorization: Bearer <token>` header).

---

## 1. Global Standards & Conventions

### Base URL
- Development: `http://localhost:5001/api`
- Production: `/api` (served by Express alongside static client assets)

### Response Formats

All API endpoints return JSON conforming to the standard wrapper schema.

#### Success Response (HTTP 200 / 201)
```json
{
  "ok": true,
  "data": { ... }
}
```

#### Error Response (HTTP 4xx / 5xx)
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | SERVER_ERROR",
    "message": "Human-readable explanation of error.",
    "details": {}
  }
}
```

### Authentication Architecture
- **JWT in httpOnly Cookie**: Primary browser mechanism. Prevents client-side JavaScript from reading the authentication token (`SameSite=Lax`, `httpOnly=true`).
- **Bearer Token Header**: Secondary mechanism for API clients and automated tests (`Authorization: Bearer <token>`).
- **Guest Fallback**: When unauthenticated, users are treated as Guest students. Read endpoints remain accessible, while mutation routes either save to browser localStorage or require login.

---

## 2. API Endpoints Reference

### Health & System Status

#### `GET /api/health`
Checks server vitality and environment metadata.
- **Access**: Public
- **Response**:
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-10-14T00:15:00.000Z",
    "uptime": 124,
    "environment": "development"
  }
}
```

---

### Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
Creates a new student account.
- **Payload**:
```json
{
  "username": "alice_web",
  "email": "alice@university.edu",
  "password": "Password123!",
  "displayName": "Alice Smith"
}
```
- **Response (201 Created)**:
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "username": "alice_web",
      "email": "alice@university.edu",
      "role": "student",
      "xp": 0,
      "level": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### `POST /api/auth/login`
Authenticates with username or email. Sets httpOnly `cf_token` cookie.
- **Payload**:
```json
{
  "identifier": "alice@university.edu",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "username": "alice_web",
      "role": "student",
      "xp": 125,
      "level": 2
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### `GET /api/auth/me`
Retrieves currently authenticated session user.
- **Access**: Authenticated

#### `POST /api/auth/logout`
Clears authentication cookie and terminates session.
- **Access**: Authenticated

---

### Topics & Curriculum (`/api/topics`)

#### `GET /api/topics`
Lists curriculum topics with progress and category flags (`interactive` vs `catalogue_only`).
- **Access**: Public
- **Sample Item**:
```json
{
  "id": "t_js",
  "slug": "js-basics",
  "title": "JavaScript Fundamentals",
  "category": "core",
  "is_interactive": 1,
  "lesson_count": 5,
  "total_time": "75 min"
}
```

---

### Lessons (`/api/lessons`)

#### `GET /api/lessons`
Lists all syllabus lessons ordered by curriculum sequence.
- **Access**: Public (attaches `is_completed: true/false` if authenticated).

#### `GET /api/lessons/:slug`
Fetches a specific lesson with objectives, theory, runnable examples, and knowledge-check questions.
- **Access**: Public
- **Response Shape**:
```json
{
  "ok": true,
  "data": {
    "id": "les_js_loops",
    "title": "JavaScript For & While Loops",
    "slug": "js-loops",
    "topic_title": "JavaScript Fundamentals",
    "is_interactive": 1,
    "objectives": ["Understand loop iteration", "Avoid infinite loops"],
    "content_markdown": "# Loops in JavaScript...",
    "runnable_code": "for (let i = 0; i < 3; i++) { console.log(i); }",
    "expected_output": "0\n1\n2",
    "common_mistakes": ["Off-by-one errors", "Forgetting counter increment"]
  }
}
```

#### `POST /api/lessons/:id/complete`
Marks a lesson completed and awards XP once via unique event keys.
- **Access**: Public (saves to DB if logged in, awards guest XP locally).

---

### Assessments & Anti-Cheating Protocol (`/api/assessments`)

#### `GET /api/assessments`
Lists formal assessments with time limit and passing threshold.
- **Response**: Questions do **NOT** include answer keys or hidden tests.

#### `GET /api/assessments/:id`
Retrieves assessment paper. Coding questions include **only** visible test cases with expected outputs. Hidden test cases are never returned.

#### `POST /api/assessments/:id/start`
Initializes a timed attempt record in the database.
- **Access**: Authenticated or Guest

#### `POST /api/assessments/:id/submit`
Executes server-side grading protocol.
- **Integrity Protocol for Coding Tasks**:
  1. Frontend sends actual output received from sandboxed Web Worker execution.
  2. Server verifies student results against confidential answer keys stored exclusively in the database.
  3. Server computes partial credit via deep equality normalization (`scoringService.js`).
- **Response**:
```json
{
  "ok": true,
  "data": {
    "score": 92,
    "maxScore": 100,
    "percentage": 92,
    "passed": true,
    "earnedXP": 100,
    "breakdown": [
      {
        "questionId": "aq_2",
        "earned": 40,
        "max": 40,
        "passedTests": 4,
        "totalTests": 4
      }
    ]
  }
}
```

---

### Projects & Version History (`/api/projects`)

#### `GET /api/projects`
Lists student projects.
- **Access**: Authenticated

#### `POST /api/projects`
Creates a project and initial snapshot version (v1).
- **Payload**:
```json
{
  "title": "Interactive Portfolio",
  "description": "My first college project",
  "html": "<div class=\"hero\">...</div>",
  "css": ".hero { padding: 2rem; }",
  "js": "console.log('App ready');"
}
```

#### `PATCH /api/projects/:id`
Updates project code and creates a new immutable version snapshot in `project_versions`.
- **Payload**:
```json
{
  "html": "...",
  "css": "...",
  "js": "...",
  "changeSummary": "Added mobile navigation styles"
}
```

#### `POST /api/projects/:id/rollback`
Restores project code to a previous version number.
- **Payload**:
```json
{
  "versionNumber": 2
}
```

#### `POST /api/projects/:id/duplicate`
Duplicates a project and all files for safe experimentation.

#### `DELETE /api/projects/:id`
Deletes a project and cascaded version records.

---

### Progress, Analytics & Gamification (`/api/progress`)

#### `GET /api/progress/summary`
Calculates lessons completed, total XP, current level, quiz accuracy, and assessment metrics.

#### `GET /api/progress/analytics`
Returns topic accuracy percentages and recorded attempts count.

#### `GET /api/progress/recommendations`
Returns next lesson recommendation along with explainable rule reason (`ruleApplied`).

#### `GET /api/progress/leaderboard`
Returns student leaderboard ordered by authentic XP earned.

---

### Administrator & Educator Panel (`/api/admin`)
*Requires `role: "admin"` in user session.*

#### `GET /api/admin/stats`
Returns system aggregate metrics: total students, completed lessons, quiz pass rate, assessment average score, total projects.

#### `GET /api/admin/users`
Returns enrolled students list with role, level, XP, and join date.

#### `GET /api/admin/lessons`
Returns curriculum module list with live completion counts.

#### `GET /api/admin/questions`
Returns practice questions catalog with difficulty and topic.

#### `POST /api/admin/questions`
Creates a new practice question in the database.
- **Payload**:
```json
{
  "topic_id": "t_dom",
  "type": "coding",
  "title": "Select Elements by Class",
  "prompt": "Write a query selector that targets all .active items",
  "starter_code": "const items = document.querySelectorAll('.active');",
  "difficulty": "Medium",
  "answer": "document.querySelectorAll('.active')"
}
```

#### `GET /api/admin/assessments`
Returns recent student assessment submission logs with scores, timestamps, and pass status.
