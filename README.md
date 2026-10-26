# Doc on Go — Medical Web App

A full-stack medical web app built as a capstone project. Patients can create
an account, manage a health profile, book appointments, and upload medical
documents (PDF, Word, or images) for a preliminary AI-powered analysis.

> **Disclaimer:** the AI analysis is preliminary only and is not a substitute
> for professional medical advice. Always consult a doctor.

## Features

- **Accounts & profiles** — signup/login with JWT auth, health profile
  (age, height, weight, blood type, allergies, chronic conditions, medical
  history, emergency contact)
- **Appointment booking** — date-picker booking flow
- **Document upload & analysis** — PDF/Word text extraction and image
  analysis via OpenAI, returning a preliminary report
- **Symptom diagnosis** — preliminary diagnosis from described symptoms
- **Doctor lookup** — find doctors by condition/specialty
- **Contact form** — messages saved to the database and emailed

## Tech stack

- **Frontend:** React 19 (Create React App), React Router, Axios
- **Backend:** Express, MySQL (`mysql2`), Multer uploads, OpenAI API,
  JWT auth, Nodemailer
- **Tests:** Jest + React Testing Library, Cypress end-to-end

## Project structure

```text
src/            React frontend (pages, components, styles, images, video)
public/         Static assets served with the frontend
backend/
  server.js     Express API (auth, profile, documents, diagnosis, doctors, contact)
  __tests__/    Backend Jest tests
cypress/        Cypress support files and fixtures
```

## Getting started

### Prerequisites

- Node.js
- MySQL running locally

### Backend

```bash
cd backend
npm install
cp ../.env.example .env   # then fill in your own values (see below)
node server.js            # runs on http://localhost:3001
```

The backend expects a MySQL database with `users`, `documents`, `doctors`,
and `contact_messages` tables (see `backend/server.js` for the columns used).

### Frontend

```bash
npm install
npm start                 # runs on http://localhost:3000
```

The frontend proxies API calls to `http://localhost:3001` (see `proxy` in
`package.json`).

## Environment variables

All secrets live in `backend/.env` — never in code. See `.env.example`:

| Variable            | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `OPENAI_API_KEY`    | OpenAI API key for diagnosis features     |
| `DB_HOST`           | MySQL host (default `localhost`)          |
| `DB_USER`           | MySQL user (default `root`)               |
| `DB_PASSWORD`       | MySQL password                            |
| `DB_NAME`           | MySQL database (default `docongo_users`) |
| `JWT_SECRET`        | Secret for signing login tokens           |
| `EMAIL_USER`        | Gmail address for the contact form        |
| `EMAIL_APP_PASSWORD`| Gmail App Password for the contact form   |

## Scripts

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `npm start`          | Start the frontend in dev mode        |
| `npm run build`      | Production build into `build/`        |
| `npm test`           | Frontend Jest tests                   |
| `npm run cypress:run`| Cypress end-to-end tests              |
| `node server.js`     | Start the backend (from `backend/`)   |
| `npm test` (backend) | Backend Jest tests (from `backend/`)  |
