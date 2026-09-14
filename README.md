# Blog API

A RESTful API for a full-featured blog platform, built with Node.js, Express, PostgreSQL, and Prisma.

The API provides JWT-based authentication, role-based authorization, post and comment management, publishing controls, and social interactions through likes.

This project was developed as part of **The Odin Project curriculum** and was also used as the backend for a separate **Blog Admin** frontend.

---

## Overview

The **Blog API** provides the backend infrastructure for a blog platform with two types of users:

* **AUTHOR** — manages posts and has access to author-only operations.
* **READER** — can consume published content and interact with posts and comments.

The API is designed to support multiple clients. The current project includes an administrative frontend, while the same API can also serve a future public blog client.

---

## Features

### Authentication & Authorization

* User registration and login
* JWT-based authentication
* Tokens expire after 5 hours
* Password hashing with bcrypt
* Role-based authorization
* `AUTHOR` and `READER` roles
* Protected routes using JWT middleware
* Optional authentication for public resources
* Author-only operations for post management

### Users

* Get the authenticated user's profile
* List users
* Update personal information
* Update username
* Change password
* Unique username constraint
* Protected user operations

### Posts

* Create posts
* Read posts
* Update posts
* Delete posts
* Publish and unpublish posts
* Author information included in post responses
* Public access to published posts
* Authors can access their unpublished posts
* Post like/unlike functionality
* Like count
* Current user's like state

### Comments

* Create comments
* Read comments
* Edit own comments
* Delete own comments
* Post authors can delete comments from their posts
* Comment author information
* Comment like/unlike functionality
* Like count
* Current user's like state

### Validation & Security

* Request validation with `express-validator`
* Custom validation messages
* JWT authentication
* Password hashing
* CORS configuration
* Optional Helmet security middleware
* Duplicate-like prevention using database constraints
* Proper authorization checks

### Database

* PostgreSQL
* Prisma ORM
* Relational data model
* Composite unique constraints for likes
* Cascading deletion for post-related data
* Prisma migrations

---

## Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Runtime          | Node.js                 |
| Language         | JavaScript (ES Modules) |
| Framework        | Express                 |
| Database         | PostgreSQL              |
| ORM              | Prisma                  |
| Authentication   | JWT (`jsonwebtoken`)    |
| Password Hashing | `bcryptjs`              |
| Validation       | `express-validator`     |
| Security         | CORS, Helmet            |
| Development      | Nodemon                 |
| API Testing      | VS Code REST Client     |

---

## Architecture

The API follows a modular structure separating routing, middleware, authentication, validation, and database access.

```text
blog-api/
├── prisma/
│   └── schema.prisma
├── lib/
│   └── prisma.js
├── middleware/
│   ├── isAuth.js
│   ├── isAuthor.js
│   └── validation.js
├── routes/
│   ├── users.js
│   ├── posts.js
│   ├── comments.js
│   └── commentActionsRouter.js
├── api.js
├── .env
├── package.json
└── README.md
```

### Middleware

| Middleware               | Responsibility                                                     |
| ------------------------ | ------------------------------------------------------------------ |
| `isAuth`                 | Verifies the JWT and attaches the authenticated user to `req.user` |
| `isAuthor`               | Ensures the authenticated user has the `AUTHOR` role               |
| `optionalAuth`           | Attempts authentication without requiring a token                  |
| `handleValidationErrors` | Formats and returns validation errors                              |

Comments use two route groups:

* Nested routes for operations related to a post
* Standalone routes for comment-specific actions such as editing, deleting, and liking

---

# Getting Started

## Requirements

Before running the project, make sure you have:

* Node.js
* npm
* PostgreSQL
* Git

---

## Clone the repository

```bash
git clone https://github.com/jormaedes/blog-api.git
cd blog-api
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3300

DATABASE_URL="postgres://user:password@localhost:5432/blogapi_db"

JWT_SECRET="your-super-secret-key"

NUMBER_SECRET=10

ADMIN_ORIGIN="http://localhost:3000"

READER_ORIGIN="http://localhost:3001"
```

### Generate a JWT secret

You can generate a secure random secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

# Database Setup

Make sure PostgreSQL is running.

Create the database:

```sql
CREATE DATABASE blogapi_db;
```

Run the Prisma migrations:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

For subsequent schema changes, create a new migration instead of modifying the database manually:

```bash
npx prisma migrate dev --name migration_name
```

---

# Running the API

Start the development server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3300
```

---

# Authentication

Protected endpoints require:

```http
Authorization: Bearer <token>
```

The login endpoint returns a JWT together with the authenticated user's public information.

Example:

```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "userType": "AUTHOR"
  }
}
```

The token expires after **5 hours**.

---

# API Endpoints

All endpoints return JSON.

Authentication requirements:

* ❌ Public
* ✅ Authenticated user
* ✅ + `AUTHOR` — authenticated author required

---

## Authentication

| Method | Endpoint  | Auth | Description                    |
| ------ | --------- | ---- | ------------------------------ |
| `POST` | `/signup` | ❌    | Create a new user              |
| `POST` | `/login`  | ❌    | Authenticate and receive a JWT |

### Signup

Request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "password": "secret123",
  "userType": "AUTHOR"
}
```

`userType` is optional.

If omitted, the user is created as:

```text
READER
```

---

## Users

| Method | Endpoint     | Auth | Description                          |
| ------ | ------------ | ---- | ------------------------------------ |
| `GET`  | `/users/me`  | ✅    | Get the authenticated user's profile |
| `GET`  | `/users`     | ✅    | List users                           |
| `GET`  | `/users/:id` | ✅    | Get user profile                     |
| `PUT`  | `/users/:id` | ✅    | Update own profile                   |

### `/users/me`

Returns the authenticated user's information:

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "userType": "AUTHOR"
}
```

### Update profile

The authenticated user can update:

* first name
* last name
* username
* password

Example:

```json
{
  "firstname": "John",
  "lastname": "Smith",
  "username": "johnsmith",
  "password": "newpassword"
}
```

A user can only update their own profile.

The API returns:

```text
403 Forbidden
```

when attempting to update another user's account.

Usernames are unique. Attempting to use an existing username returns:

```text
409 Conflict
```

---

# Posts

| Method   | Endpoint                 | Auth       | Description              |
| -------- | ------------------------ | ---------- | ------------------------ |
| `GET`    | `/posts`                 | ❌          | List posts               |
| `GET`    | `/posts/:postId`         | ❌          | Get a single post        |
| `POST`   | `/posts`                 | ✅ + AUTHOR | Create a post            |
| `PUT`    | `/posts/:postId`         | ✅ + AUTHOR | Update a post            |
| `PATCH`  | `/posts/:postId/publish` | ✅ + AUTHOR | Publish/unpublish a post |
| `DELETE` | `/posts/:postId`         | ✅ + AUTHOR | Delete a post            |
| `POST`   | `/posts/:postId/like`    | ✅          | Like a post              |
| `DELETE` | `/posts/:postId/like`    | ✅          | Unlike a post            |

### Post visibility

The API uses the user's authentication state and role to determine which posts can be returned.

#### Unauthenticated users

Can only see:

```text
published posts
```

#### READER users

Can only see:

```text
published posts
```

#### AUTHOR users

Can see:

```text
published posts
+
their unpublished posts
```

This allows the administrative frontend to manage drafts without exposing unpublished content to public users.

---

## Post response

A post response includes author information and social interaction data.

Example:

```json
{
  "id": 1,
  "title": "Building APIs with Express",
  "content": "<p>...</p>",
  "published": true,
  "timestamp": "2026-09-14T10:00:00.000Z",
  "authorId": 1,
  "author": {
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "likesCount": 12,
  "likedByMe": true
}
```

### Like state

`likedByMe` represents whether the currently authenticated user has liked the post.

For unauthenticated requests:

```json
"likedByMe": false
```

---

# Comments

Comments are exposed through both nested and standalone routes.

## Nested routes

| Method | Endpoint                             | Auth | Description            |
| ------ | ------------------------------------ | ---- | ---------------------- |
| `GET`  | `/posts/:postId/comments`            | ❌    | List comments          |
| `GET`  | `/posts/:postId/comments/:commentId` | ❌    | Get a specific comment |
| `POST` | `/posts/:postId/comments`            | ✅    | Create a comment       |

## Standalone routes

| Method   | Endpoint                    | Auth | Description      |
| -------- | --------------------------- | ---- | ---------------- |
| `PUT`    | `/comments/:commentId`      | ✅    | Edit own comment |
| `DELETE` | `/comments/:commentId`      | ✅    | Delete a comment |
| `POST`   | `/comments/:commentId/like` | ✅    | Like a comment   |
| `DELETE` | `/comments/:commentId/like` | ✅    | Unlike a comment |

---

## Comment permissions

An authenticated user can edit their own comments.

A comment can be deleted by:

* the comment owner;
* the author of the post containing the comment.

Other users receive:

```text
403 Forbidden
```

---

## Comment response

Comments include their author information and like information.

Example:

```json
{
  "id": 1,
  "content": "Great article!",
  "timestamp": "2026-09-14T11:00:00.000Z",
  "userId": 2,
  "postId": 1,
  "user": {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Doe",
    "username": "janedoe"
  },
  "likesCount": 4,
  "likedByMe": true
}
```

This allows clients to display the current user's interaction state without having to make a separate request for every like.

---

# Likes

Likes are implemented as separate relational entities:

```text
PostLike
CommentLike
```

A user can only like a post or comment once.

The database enforces this through composite unique constraints:

```prisma
@@unique([userId, postId])
```

and:

```prisma
@@unique([userId, commentId])
```

Attempting to create a duplicate like returns:

```text
409 Conflict
```

Removing a like is idempotent from the API perspective of the resource state, while attempting to remove a non-existent like returns:

```text
404 Not Found
```

---

# Validation

Input validation is handled with `express-validator`.

## Signup

| Field       | Rules                                            |
| ----------- | ------------------------------------------------ |
| `firstname` | Required, trimmed, escaped                       |
| `lastname`  | Required, trimmed, escaped                       |
| `username`  | Required, minimum 3 characters, trimmed, escaped |
| `password`  | Required, minimum 5 characters                   |

## Login

| Field      | Rules                          |
| ---------- | ------------------------------ |
| `username` | Required, trimmed, escaped     |
| `password` | Required, minimum 5 characters |

If validation fails, the API responds with:

```text
400 Bad Request
```

along with the validation errors.

---

# Database Model

The application uses Prisma with PostgreSQL.

The main entities are:

```text
User
 │
 ├── Post
 │    ├── Comment
 │    │    └── CommentLike
 │    │
 │    └── PostLike
 │
 └── Comment
```

### User

```text
id
firstName
lastName
username
password
userType
createdAt
```

`userType` is an enum:

```text
AUTHOR
READER
```

### Post

```text
id
title
content
published
timestamp
authorId
```

### Comment

```text
id
content
timestamp
userId
postId
```

### PostLike

```text
id
userId
postId
```

### CommentLike

```text
id
userId
commentId
```

---

# Cascade Deletes

Post-related data uses cascading deletion where appropriate.

When a post is deleted:

```text
Post
 ├── Comments
 │    └── CommentLikes
 │
 └── PostLikes
```

related comments, comment likes, and post likes are automatically removed by the database relationship configuration.

This prevents orphaned relational data.

---

# CORS

The API supports separate origins for the administrative and public clients.

Environment variables:

```env
ADMIN_ORIGIN="http://localhost:3000"
READER_ORIGIN="http://localhost:3001"
```

This allows the same backend to serve multiple frontend applications while controlling which origins are allowed to communicate with the API.

---

# Error Handling

The API uses HTTP status codes to communicate the result of requests.

Common responses include:

| Status | Meaning                                               |
| ------ | ----------------------------------------------------- |
| `200`  | Successful request                                    |
| `201`  | Resource created                                      |
| `204`  | Successful request with no response body              |
| `400`  | Validation error                                      |
| `401`  | Authentication required / invalid credentials         |
| `403`  | Authenticated but not authorized                      |
| `404`  | Resource not found                                    |
| `409`  | Resource conflict, such as duplicate username or like |
| `500`  | Internal server error                                 |

---

# Testing

The repository includes a `testapi.rest` file for testing endpoints with the **REST Client** extension for VS Code.

Install the REST Client extension, open:

```text
testapi.rest
```

and execute the requests directly from VS Code.

Remember to update dynamic values such as:

* authentication tokens;
* user IDs;
* post IDs;
* comment IDs.

---

# Development

Start the API in development mode:

```bash
npm run dev
```

After modifying the Prisma schema:

```bash
npx prisma migrate dev --name migration_name
npx prisma generate
```

---

# Project Goals

This project was built primarily as a learning project to practice:

* REST API design
* Express.js architecture
* PostgreSQL
* Prisma ORM
* JWT authentication
* Role-based authorization
* Password hashing
* Request validation
* Relational database design
* Database constraints
* Middleware architecture
* Nested REST routes
* Social features
* CORS
* API security
* Connecting a backend API to independent frontend applications

The project evolved from a basic blog API into a backend capable of supporting both an **administrative client** and a future **public blog client**.

---

# Related Frontend

The API is currently consumed by a separate **Blog Admin** application built with:

* Next.js
* TypeScript
* Zustand
* Tailwind CSS
* TinyMCE

The administrative client provides:

* authentication;
* dashboard;
* post management;
* post editor;
* post reading view;
* comments;
* likes;
* user management;
* profile management;
* light/dark themes.

The API itself remains independent of the administrative client so that it can also be consumed by a future public **Blog Client**.

---

# Future Improvements

Possible future improvements include:

* automated API tests;
* pagination for posts and comments;
* more efficient batch queries for like state;
* rate limiting;
* refresh tokens;
* API documentation with OpenAPI/Swagger;
* production deployment;
* improved logging;
* centralized error handling;
* database indexing based on production query patterns.

---

# License

This project is for educational purposes and was developed as part of **The Odin Project** curriculum.

Feel free to use it as a reference or starting point for your own projects.

---

Made with ❤️ as part of [The Odin Project curriculum](https://www.theodinproject.com/).
