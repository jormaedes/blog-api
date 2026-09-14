# Blog API

A RESTful API for a blog platform built with **Node.js, Express, PostgreSQL, and Prisma**.

This project was developed as a learning project to practice backend development, authentication, authorization, database relationships, and REST API design.

## Features

* JWT authentication
* Role-based authorization (`AUTHOR` / `READER`)
* User management
* Posts CRUD
* Post publishing and unpublishing
* Comments CRUD
* Likes for posts and comments
* Ownership-based authorization
* Cascade deletion for posts, comments, and likes
* PostgreSQL database with Prisma ORM

## Tech Stack

* Node.js
* Express
* PostgreSQL
* Prisma
* JWT
* bcrypt

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
JWT_SECRET="your_jwt_secret"
NUMBER_SECRET=10
ADMIN_ORIGIN="http://localhost:3000"
```

| Variable        | Description                           |
| --------------- | ------------------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string          |
| `JWT_SECRET`    | Secret used to sign JWT tokens        |
| `NUMBER_SECRET` | Number of bcrypt salt rounds          |
| `ADMIN_ORIGIN`  | Allowed origin for the admin frontend |

## API

Base URL:

```text
http://localhost:3300
```

Authenticated endpoints require:

```http
Authorization: Bearer <token>
```

### Authentication

#### `POST /login`

Authenticates a user.

**Request:**

```json
{
  "username": "john",
  "password": "password123"
}
```

**Response `200`:**

```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "username": "john",
    "userType": "AUTHOR"
  }
}
```

**Error `401`:**

```json
{
  "message": "Invalid credentials"
}
```

---

### Users

#### `GET /users`

Returns all users.

**Response `200`:**

```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "username": "john",
    "userType": "AUTHOR"
  }
]
```

#### `GET /users/me`

Returns the authenticated user.

**Response `200`:**

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "username": "john",
  "userType": "AUTHOR"
}
```

#### `PUT /users/:id`

Updates the authenticated user's profile.

**Request:**

```json
{
  "firstname": "John",
  "lastname": "Smith",
  "username": "johnsmith",
  "password": "newpassword"
}
```

**Response `200`:**

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "username": "johnsmith",
  "userType": "AUTHOR"
}
```

**Errors:**

```json
{
  "message": "Forbidden"
}
```

```json
{
  "message": "Username already exists"
}
```

---

### Posts

#### `GET /posts`

Returns posts according to the authenticated user's role.

**Response `200`:**

```json
[
  {
    "id": 1,
    "title": "My first post",
    "content": "<p>Hello world!</p>",
    "published": true,
    "timestamp": "2026-09-01T10:00:00.000Z",
    "authorId": 1,
    "author": {
      "username": "john",
      "firstName": "John",
      "lastName": "Doe"
    },
    "likesCount": 5,
    "likedByMe": true
  }
]
```

#### `GET /posts/:postId`

Returns a single post.

**Response `200`:**

```json
{
  "id": 1,
  "title": "My first post",
  "content": "<p>Hello world!</p>",
  "published": true,
  "timestamp": "2026-09-01T10:00:00.000Z",
  "authorId": 1,
  "author": {
    "username": "john",
    "firstName": "John",
    "lastName": "Doe"
  },
  "likesCount": 5,
  "likedByMe": true
}
```

**Error `404`:**

```json
{
  "message": "Post not found"
}
```

#### `POST /posts`

Creates a post. Requires `AUTHOR`.

**Request:**

```json
{
  "title": "My new post",
  "content": "<p>Post content</p>",
  "published": false
}
```

**Response `201`:**

```json
{
  "id": 2,
  "title": "My new post",
  "content": "<p>Post content</p>",
  "published": false,
  "timestamp": "2026-09-01T10:00:00.000Z",
  "authorId": 1
}
```

#### `PUT /posts/:postId`

Updates a post. Requires `AUTHOR`.

**Request:**

```json
{
  "title": "Updated title",
  "content": "<p>Updated content</p>"
}
```

**Response `200`:**

```json
{
  "id": 1,
  "title": "Updated title",
  "content": "<p>Updated content</p>",
  "published": true,
  "timestamp": "2026-09-01T10:00:00.000Z",
  "authorId": 1
}
```

#### `PATCH /posts/:postId/publish`

Publishes or unpublishes a post.

**Request:**

```json
{
  "published": true
}
```

**Response `200`:**

```json
{
  "id": 1,
  "title": "My first post",
  "content": "<p>Hello world!</p>",
  "published": true,
  "timestamp": "2026-09-01T10:00:00.000Z",
  "authorId": 1
}
```

#### `DELETE /posts/:postId`

Deletes a post.

**Response `200`:**

```json
{
  "message": "Post deleted successfully"
}
```

Deleting a post also deletes its comments, comment likes, and post likes.

#### `POST /posts/:postId/like`

Likes a post.

**Response `201`:**

```json
{
  "message": "Post liked successfully"
}
```

#### `DELETE /posts/:postId/like`

Removes the authenticated user's like.

**Response `200`:**

```json
{
  "message": "Post unliked successfully"
}
```

---

### Comments

#### `GET /posts/:postId/comments`

Returns all comments for a post.

**Response `200`:**

```json
[
  {
    "id": 1,
    "content": "Great post!",
    "timestamp": "2026-09-01T11:00:00.000Z",
    "userId": 2,
    "postId": 1,
    "user": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Doe",
      "username": "jane"
    },
    "likesCount": 2,
    "likedByMe": false
  }
]
```

#### `GET /posts/:postId/comments/:commentId`

Returns a single comment.

**Response `200`:**

```json
{
  "id": 1,
  "content": "Great post!",
  "timestamp": "2026-09-01T11:00:00.000Z",
  "userId": 2,
  "postId": 1,
  "user": {
    "id": 2,
    "firstName": "Jane",
    "lastName": "Doe",
    "username": "jane"
  }
}
```

#### `POST /posts/:postId/comments`

Creates a comment.

**Request:**

```json
{
  "content": "Great post!"
}
```

**Response `201`:**

```json
{
  "id": 1,
  "content": "Great post!",
  "timestamp": "2026-09-01T11:00:00.000Z",
  "userId": 2,
  "postId": 1
}
```

#### `PUT /comments/:commentId`

Updates the authenticated user's comment.

**Request:**

```json
{
  "content": "Updated comment"
}
```

**Response `200`:**

```json
{
  "id": 1,
  "content": "Updated comment",
  "timestamp": "2026-09-01T11:00:00.000Z",
  "userId": 2,
  "postId": 1
}
```

#### `DELETE /comments/:commentId`

Deletes a comment.

**Response `200`:**

```json
{
  "message": "Comment deleted successfully"
}
```

#### `POST /comments/:commentId/like`

Likes a comment.

**Response `201`:**

```json
{
  "message": "Comment liked successfully"
}
```

#### `DELETE /comments/:commentId/like`

Removes the authenticated user's like.

**Response `200`:**

```json
{
  "message": "Comment unliked successfully"
}
```

---

## Authorization

The API uses JWT authentication and role-based access control.

* `AUTHOR` users can create, edit, publish, and delete posts.
* `READER` users can access published posts.
* Users can only edit their own profile and comments.
* Post authors can delete comments on their posts.

## Database

The API uses **PostgreSQL** with **Prisma ORM**.

Main models:

* `User`
* `Post`
* `Comment`
* `PostLike`
* `CommentLike`

Post deletion cascades to its comments and associated likes.

## Running Locally

```bash
npm install
```

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3300
```

## Related Projects

* **Blog Admin** — Next.js + TypeScript administration dashboard
  https://github.com/jormaedes/blog-admin

* **Blog Client** — Frontend client for the blog platform
  Coming soon

## Project Goal

This project was created to practice building a RESTful backend with authentication, authorization, relational data, and real-world API features.
