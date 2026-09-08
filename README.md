# Blog API

A RESTful API for a blog platform with role‑based authentication (JWT), full CRUD for posts and comments, and social features (likes). Built as a learning project to practice backend architecture, security, and API design.

---
## Key Features

- User authentication — Sign up and login with JWT tokens (expires in 5 hours).
- Two user roles — AUTHOR and READER (only authors can create/edit/delete posts).
- Posts — Create, read, update, delete; publish/unpublish with a single PATCH.
- Comments — Any authenticated user can comment; comment owners or post authors can delete them.
- Likes — Users can like both posts and comments (unique constraints prevent duplicate likes).
- Validation — Input validation using express-validator with custom error messages.
- CORS — Configurable allowed origins for admin and reader frontends.
- Structured code — Separation of routes, controllers, middlewares, and database logic.

---
## Tech Stack


| **Layer** |	**Tools**|
| ---------|---------|
| Runtime |	Node.js (ES Modules)|
| Framework |	Express|
| Database |	PostgreSQL|
| ORM |	Prisma|
| Auth |	JWT (jsonwebtoken) + bcryptjs|
| Validation |	express-validator|
| Security |	CORS, helmet (optional), bcrypt hashing|
----

## Project Structure

```
blog-api/
├── prisma/
│   └── schema.prisma          # Database models
├── lib/
│   └── prisma.js              # PrismaClient instance
├── middleware/
│   ├── isAuth.js              # JWT verification
│   ├── isAuthor.js            # Role check
│   └── validation.js          # Validation rules & error handler
├── routes/
│   ├── users.js
│   ├── posts.js
│   ├── comments.js            # Nested under /posts/:postId/comments
│   └── commentActionsRouter.js # Standalone /comments routes
├── api.js                     # Main server file
├── .env                       # Environment variables
├── package.json
└── README.md
```
---
## Getting Started

### Clone & Install
```bash
# Clone the repository
git clone https://github.com/jormaedes/blog-api.git
cd blog-api
npm install
```

### Environment Variables
```bash
PORT=3300
DATABASE_URL="postgres://user:password@localhost:5432/blogapi_db"
JWT_SECRET="your-super-secret-key"
NUMBER_SECRET=10                     # salt rounds for bcrypt
ADMIN_ORIGIN="http://localhost:3000" # your admin frontend URL
READER_ORIGIN="http://localhost:3001" # your reader frontend URL
```

To generate a new secret key, run the following command in your terminal:
```node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"```

### Database Setup
1. Ensure PostgreSQL is installed and running.
2. Create a new database:
```sql
CREATE DATABASE blogapi_db;
```
3. Run Prisma migrations to set up the schema:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Start the Server
```bash
npm run dev
```
The server will start at ```http://localhost:3300```

## API Endpoints
All routes return JSON. Protected routes require an ```Authorization: Bearer <token>``` header.
### Auth
|Method	|Endpoint|	Body|	Description|
|--------|---------|-----|------------|
|POST	|/signup|	firstname, lastname, username, password, user_type?	|Create a new user
|POST	|/login|	username, password	|Log in → returns JWT

> ```user_type``` is optional — defaults to ```READER```. Use ```"AUTHOR"``` to create an author.

### Users
|Method	|Endpoint|	Auth required|	Description|
|--------|---------|-----|------------|
|GET	|/users/:id|	✅	|Get user profile (public info)
|PUT	|/users/:id|	✅	|Update own profile (firstname, lastname, password)

### Posts
|Method	|Endpoint|	Auth required|	Description|
|--------|---------|-----|------------|
| GET |	/posts |	Optional |	List all posts (published for readers; all for authors)|
| GET |	/posts/:postId |	Optional |	Get a single post (only if published or author)|
| POST |	/posts |	✅ + AUTHOR |	Create a new post (title, content, published?)|
| PUT |	/posts/:postId |	✅ + AUTHOR |	Update own post (title, content)|
| PATCH |	/posts/:postId/publish |	✅ + AUTHOR |	Toggle published status ({ published: true/false })|
| DELETE |	/posts/:postId |	✅ + AUTHOR |	Delete own post|
| POST |	/posts/:postId/like |	✅ |	Like a post|
| DELETE |	/posts/:postId/like |	✅ |	Unlike a post|

### Comments
**Nested routes** (under a post):

|Method	|Endpoint|	Auth required|	Description|
|--------|---------|-----|------------|
| GET |	/posts/:postId/comments |	❌ |	List all comments of a post
| GET |	/posts/:postId/comments/:commentId |	❌ |	Get a specific comment
| POST |	/posts/:postId/comments |	✅ |	Create a comment on that post

**Standalone routes** (for editing/deleting/liking):
|Method	|Endpoint|	Auth required|	Description|
|--------|---------|-----|------------|
| PUT |	/comments/:commentId |	✅ |	Edit own comment
| DELETE |	/comments/:commentId |	✅ |	Delete own comment or delete any if you are the post author
| POST |	/comments/:commentId/like |	✅ |	Like a comment
| DELETE |	/comments/:commentId/like |	✅ |	Unlike a comment

### Validation Rules
#### Signup
- ```firstname``` — required, trimmed, escaped
- ```lastname``` — required, trimmed, escaped
- ```username``` — required, min 3 chars, trimmed, escaped
- ```password``` — required, min 5 chars

### Login
- ```username``` — required, trimmed, escaped
- ```password``` — required, min 5 chars

If validation fails, the API responds with a 400 status and an array of error messages.

### Testing the API
You can use the provided `testapi.rest` file with VS Code's REST Client extension to test the endpoints. Make sure to replace the base URL and any dynamic IDs as needed.

### Middleware Summary
- ```isAuth``` – Verifies the JWT token; attaches req.user if valid.
- ```isAuthor``` – Ensures the authenticated user has the AUTHOR role.
- ```optionalAuth``` – Tries to verify token but does not fail if absent (used for public post listings).
- ```handleValidationErrors``` – Catches validation errors and sends a formatted response.

### Database Models (Prisma Schema)
- ```User``` — firstName, lastName, username (unique), password (hashed), userType (enum: AUTHOR/READER)
- ```Post``` — title, content, published, timestamp, author (relation to User)
- ```Comment``` — content, timestamp, user, post
- ```PostLike``` — composite unique (userId, postId)
- ```CommentLike``` — composite unique (userId, commentId)

All relationships are properly indexed and use Prisma’s @map for clean SQL naming.

## License
This project is for educational purposes. Feel free to use it as a starting point for your own blog API.

Made with ❤️ as part of [The Odin Project curriculum](https://www.theodinproject.com/) — API project.