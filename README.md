# LocalGem API

LocalGem helps you discover hidden gems in your neighbourhood that not many people know about, from cosy little cafes and beautiful natural spots to unique local places that are worth a visit.

This repository contains the backend REST API built with NestJS, TypeORM, JWT auth, and MySQL.

## Features

- **Authentication** with email/password using Passport (local) and JWT (access + refresh tokens)
- **Places CRUD** scoped to the authenticated user
- **MySQL** database with TypeORM entities and repositories
- **Config management** via @nestjs/config and environment variables
- **Testing and linting** via Jest, ESLint, and Prettier

## Tech Stack

- NestJS 11
- TypeScript 5
- TypeORM 0.3.x
- MySQL 8 (via mysql2)
- Passport, @nestjs/jwt, bcrypt

## Architecture

- `src/main.ts`: app bootstrap
- `src/app.module.ts`: global config and database connection, module wiring
- `src/auth`: auth module (strategies, guards, controller, service)
- `src/users`: users module (entity + service)
- `src/places`: places module (entity, controller, service)
- `src/config/configuration.ts`: environment-based config

## Requirements

- Node.js 18+
- npm 9+ (or pnpm/yarn)
- MySQL 8+ running and reachable

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a database in MySQL (default name: `localgem`).

3. Create a `.env` file at the project root and configure variables (see next section). Example:

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=localgem

# JWT
JWT_SECRET=supersecret
JWT_EXPIRES_IN=900           # seconds (15 minutes)
JWT_REFRESH_SECRET=superrefreshsecret
JWT_REFRESH_EXPIRES_IN=604800 # seconds (7 days)
```

4. Run the app in development mode:

```bash
npm run start:dev
```

The API will start on `http://localhost:3000` by default.

## Configuration

Configuration is loaded via `@nestjs/config` from environment variables. Defaults are defined in `src/config/configuration.ts`.

- Database: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- JWT: `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- Server: `PORT`

TypeORM is configured in `AppModule` and uses `synchronize: true` for development (auto schema sync). Do not enable this in production.

## NPM Scripts

- `start`: start the server
- `start:dev`: start with file watching (recommended for dev)
- `start:debug`: start with inspector
- `start:prod`: run the compiled app
- `build`: compile TypeScript to `dist`
- `test`, `test:watch`, `test:cov`, `test:e2e`: run tests
- `lint`: run ESLint
- `format`: run Prettier

## API

Base URL: `http://localhost:3000`

### Auth

- `POST /auth/register`
  - Body: `{ "email": string, "password": string, "name": string }`
  - Creates a user (password is hashed).

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"P@ssw0rd","name":"Alice"}'
```

- `POST /auth/login`
  - Body: `{ "email": string, "password": string }`
  - Returns `{ access_token, refresh_token }`.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"P@ssw0rd"}'
```

- `POST /auth/refresh`
  - Body: `{ "refresh_token": string }`
  - Returns `{ access_token }`.

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<your_refresh_token>"}'
```

### Places (protected)

All endpoints require a Bearer token in the `Authorization` header using the `access_token` from login.

Headers:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

- `GET /places` → list places for the authenticated user.

```bash
curl http://localhost:3000/places \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Query params:

- `tags?=coffee,cozy` → filter places that have ALL specified tag slugs (matched against `Place.tagsSlugs`).

- `GET /places/:id` → get a single place owned by the user.

```bash
curl http://localhost:3000/places/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

- `POST /places` → create a place.
  - Body fields (all optional except `name`, `location`):
    - `name`: string (required)
    - `location`: string (required)
    - `latitude?`: number
    - `longitude?`: number
    - `description?`: string
    - `imageUrl?`: string
    - `tagsSlugs?`: string[] (array of tag slugs, e.g. ["coffee","cozy"]) 
  - Response includes aggregate fields `avgRating` and `reviewsCount` (read-only).

```bash
curl -X POST http://localhost:3000/places \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cafe Gem","location":"123 Main St","latitude":-6.200000,"longitude":106.816666,"description":"Hidden cozy cafe","tagsSlugs":["coffee","cozy"]}'
```

- `PUT /places/:id` → update a place owned by the user.

```bash
curl -X PUT http://localhost:3000/places/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Now my favorite spot","imageUrl":"https://example.com/img.jpg","tagsSlugs":["coffee","brunch"]}'
```


### Reviews (protected)

Endpoints to allow users to review places. Each user may have at most one review per place. On create/update/delete, the place aggregates `avgRating` and `reviewsCount` should be updated accordingly.

- `POST /places/:id/reviews`
  - Body: `{ "rating": number(1-5), "comment?": string }`
  - Creates or replaces the current user's review for the place.

```bash
curl -X POST http://localhost:3000/places/1/reviews \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Amazing vibes and coffee"}'
```

- `GET /places/:id/reviews`
  - Query params: `page?`, `limit?`
  - Returns a paginated list of reviews for the place.

```bash
curl http://localhost:3000/places/1/reviews?page=1&limit=10 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

- `PUT /places/:id/reviews/me`
  - Body: `{ "rating?": number(1-5), "comment?": string }`
  - Updates the current user's review.

```bash
curl -X PUT http://localhost:3000/places/1/reviews/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":4,"comment":"Still good, a bit crowded"}'
```


Response shape (example):

```json
{
  "id": 12,
  "rating": 5,
  "comment": "Amazing vibes and coffee",
  "userId": 3,
  "placeId": 1,
  "createdAt": "2025-10-24T09:00:00.000Z",
  "updatedAt": "2025-10-24T09:00:00.000Z"
}
```

### Tags on Place

Tags are denormalized and stored directly on a place as `tagsSlugs: string[]`.

- Create/update a place with `tagsSlugs` to set tags.
- Filter places by tags with `GET /places?tags=slug1,slug2` (returns places containing ALL slugs).

Example filter:

```bash
curl "http://localhost:3000/places?tags=coffee,cozy" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Data Model

### User

- `id` number (PK)
- `email` string (unique)
- `password` string (hashed)
- `name` string
- `places` one-to-many relationship to `Place`

### Place

- `id` number (PK)
- `name` string
- `location` string
- `latitude?` number
- `longitude?` number
- `description?` string
- `imageUrl?` string
- `avgRating` float (aggregate, read-only)
- `reviewsCount` int (aggregate, read-only)
- `tagsSlugs?` string[] (denormalized list of tag slugs)
- `user` many-to-one relationship to `User`
- `createdAt` Date
- `updatedAt` Date

### Optional: Tag Catalog (not required)

- If you want a global tag catalog for auto-complete/analytics, you can keep a `Tag` table with `{ id, name, slug }` but it is not linked to `Place` by FK. `Place` still stores `tagsSlugs` directly.

### Review

- `id` number (PK)
- `rating` int (1–5)
- `comment?` text
- `user` many-to-one to `User`
- `place` many-to-one to `Place` (unique per user+place)
- `createdAt`, `updatedAt` Date

## Security Notes

- Access tokens signed with `JWT_SECRET` and expire per `JWT_EXPIRES_IN`.
- Refresh tokens signed with `JWT_REFRESH_SECRET` and expire per `JWT_REFRESH_EXPIRES_IN`.
- Use HTTPS and secure cookie/token storage on the client.

## Testing

Run unit tests:

```bash
npm test
```

Coverage:

```bash
npm run test:cov
```

## Linting & Formatting

```bash
npm run lint
npm run format
```

## Production

- Disable TypeORM `synchronize` and use migrations for schema changes.
- Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Build and run:

```bash
npm run build
npm run start:prod
```

## License

See `LICENSE` file.
