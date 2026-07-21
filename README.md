# ESS Meeting Room Booking System (ESS-MRBS) - Frontend

## Project Description

The ESS Meeting Room Booking System (ESS-MRBS) Frontend is a React-based web application developed for the Ethiopian Statistical Service (ESS). It provides separate interfaces for administrators and registered users. Administrators can manage users, rooms, and meeting schedules, while registered users can view available meeting schedules and book meeting rooms.

---

## Technologies Used

- React.js
- Vite
- JavaScript (ES6)
- HTML5
- CSS3
- Axios
- React Router DOM
- 
---

## Tech Stack

### Frontend
- React.js
- Vite

### API Communication
- Axios

### Routing
- React Router DOM

### API Testing
- Postman

### Development Tools
| Tool | Purpose |
|------|---------|
| Visual Studio Code | Code editor |
| Postman | API testing |
| Git | Version control |
| GitHub | Remote repository |
---

---

## Project Structure

```
frontend/
│
├── public/
├── src/
│   ├── Admin/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── package-lock.json
├── vite.config.js
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/gengetu70-cloud/ESS-MRBS-frontend.git
```

Go to the frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```
Create a .env file

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server

```bash
npm run dev
```

The application will run at:

```
http://localhost:5173
```

---

## Features

### Administrator

- User Management
- Room Management
- Meeting Schedule Management
- Booking Management
- Reports Dashboard

### Registered User

- Login
- View Available Meeting Schedules
- Book Meeting Rooms
- View Booking History
- Profile Management

---

## Developers

Haramaya University Students

- Genet Getu,   => Frontend Developer, Testing and QA
- Halima Siraj, => Frontend Developer, React Component Developer
- Gezu Kotu,    => Frontend Developer, UI/UX Designer


Developed for Ethiopian Statistical Service (ESS)

2026
