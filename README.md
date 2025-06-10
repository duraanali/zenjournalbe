# ZenJournal

## API Documentation

**Base URL:**

```
https://zenjournalbe.vercel.app/
```

All endpoints require authentication via a Bearer JWT token in the `Authorization` header unless otherwise specified.

---

### Authentication

#### Register

- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `201 Created` on success
  - `{ "userId": "..." }`
- **Errors:**
  - `400` Missing required fields
  - `409` User already exists
  - `500` Internal server error

#### Login

- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `200 OK` on success
  - ```json
    {
      "user": { "id": "...", "name": "...", "email": "..." },
      "token": "<JWT>"
    }
    ```
  - Sets an HTTP-only cookie `token`
- **Errors:**
  - `400` Missing required fields
  - `401` Authentication failed
  - `500` Internal server error

#### Get Current User

- **GET** `/api/auth/user`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Response:**
  - `200 OK`
  - ```json
    {
      "id": "...",
      "name": "...",
      "email": "...",
      "created_at": 1234567890
    }
    ```
- **Errors:**
  - `401` Authentication required/Invalid token
  - `404` User not found

---

### Journals

#### Get All Journals

- **GET** `/api/journals`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Response:**
  - `200 OK` Array of journal entries
- **Errors:**
  - `401` Authentication required/Invalid token

#### Create Journal

- **POST** `/api/journals`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Body:**
  ```json
  {
    "text": "string",
    "mood": "string",
    "tags": ["string"]
  }
  ```
- **Response:**
  - `201 Created` Journal entry object
- **Errors:**
  - `400` Missing required fields
  - `401` Authentication required/Invalid token

#### Get/Update/Delete Journal by ID

- **GET** `/api/journals/[id]`
- **PUT** `/api/journals/[id]`
- **DELETE** `/api/journals/[id]`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **PUT Body:**
  ```json
  {
    "text": "string",
    "mood": "string",
    "tags": ["string"]
  }
  ```
- **Response:**
  - `200 OK` (GET/PUT) Journal entry object
  - `204 No Content` (DELETE)
- **Errors:**
  - `401` Authentication required/Invalid token
  - `403` Unauthorized (not your journal)
  - `404` Journal not found

---

### Moods

#### Get All Moods

- **GET** `/api/moods`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Response:**
  - `200 OK` Array of mood logs
- **Errors:**
  - `401` Authentication required/Invalid token

#### Create Mood

- **POST** `/api/moods`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Body:**
  ```json
  {
    "mood": "string",
    "note": "string"
  }
  ```
- **Response:**
  - `201 Created` Mood log object
- **Errors:**
  - `400` Missing required fields
  - `401` Authentication required/Invalid token


#### Get/Delete Mood by ID

- **GET** `/api/moods/[id]`
- **DELETE** `/api/moods/[id]`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Response:**
  - `200 OK` (GET) Mood log object
  - `204 No Content` (DELETE)
- **Errors:**
  - `401` Authentication required/Invalid token
  - `403` Unauthorized (not your mood)
  - `404` Mood not found

---

### Insights

#### Weekly Mood Insights

- **GET** `/api/insights/weekly`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Response:**
  - `200 OK`
  - ```json
    {
      "mostCommonMood": "string",
      "daysLogged": 5,
      "moodDistribution": {
        "happy": 2,
        "sad": 1,
        "neutral": 2
      }
    }
    ```
- **Errors:**
  - `401` Authentication required/Invalid token
  - `500` Internal server error

---

## Authentication

All endpoints (except register/login) require a Bearer JWT token:

```
Authorization: Bearer <JWT>
```

The token is returned by the login endpoint and set as an HTTP-only cookie.

---

## Deployment on Vercel

1. **Push your code to GitHub, GitLab, or Bitbucket.**
2. **Go to [Vercel](https://vercel.com/import) and import your repository.**
3. **Set the following environment variables in the Vercel dashboard:**
   - `NEXT_PUBLIC_CONVEX_URL` (from your Convex dashboard)
   - `CONVEX_URL` (same as above, for server-side)
   - `JWT_SECRET` (should match your local/dev secret)
4. **Deploy!**

### Convex Cloud

- Make sure your Convex project is deployed and accessible from the public internet.
- You may need to run `npx convex deploy` to push your Convex functions to the cloud.

### Notes

- All API routes are handled by Next.js and will work on Vercel.
- If you add new environment variables, update them in the Vercel dashboard as well.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
