# Campus Connect 🎓

Campus Connect is a web-based campus event management platform designed to simplify the way students discover and register for college events while helping organizers and administrators manage events efficiently.

The platform provides separate functionalities for **Students, Organizers, and Administrators**, with role-based access and event management features.

---

## 📌 Features

### 👨‍🎓 Student

- Student registration and login
- Browse approved campus events
- Search and filter events by category
- View event details
- Register for events
- Prevent duplicate event registrations
- Enforce event participant capacity
- View registration status
- View registered events
- Generate and view event tickets
- QR-based ticket identification
- Download event tickets

### 🧑‍💼 Organizer

- Organizer login
- Create new events
- Manage event information
- View event registration details
- Monitor participant registrations
- Export participant information as CSV
- Manage events through the organizer dashboard

### 👨‍💻 Administrator

- Admin login
- Admin dashboard
- View and manage events
- Approve or reject events
- Manage event records
- Monitor event registrations

---

## 🏷️ Event Categories

Campus Connect supports multiple categories of campus events, including:

- 💻 Tech
- 🛠️ Workshops
- ⚽ Sports
- 🎭 Cultural
- 📚 Other campus activities

Students can use category filters and search to find relevant events easily.

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- JavaScript
- HTML5
- CSS3

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication & Security

- JSON Web Tokens (JWT)
- Role-based authentication and authorization

### Additional Technologies

- Socket.IO
- QR Code Generation
- jsPDF
- html2canvas
- Nodemailer
- CSV Export

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────────┐
                    │          Users           │
                    │                          │
                    │ Student | Organizer      │
                    │         | Admin          │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │        Frontend          │
                    │                          │
                    │ React + Vite + Tailwind  │
                    └────────────┬─────────────┘
                                 │
                           Axios / REST API
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │         Backend          │
                    │                          │
                    │    Node.js + Express     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │         MongoDB          │
                    │        + Mongoose        │
                    └──────────────────────────┘
```

---

## 🔄 Application Workflow

```text
User
  │
  ▼
Signup / Login
  │
  ▼
Role Verification
  │
  ├── Student ──────► Student Dashboard
  │                       │
  │                       ├── Browse Events
  │                       ├── Search / Filter
  │                       ├── Register
  │                       └── View Ticket
  │
  ├── Organizer ────► Organizer Dashboard
  │                       │
  │                       ├── Create Event
  │                       ├── Manage Events
  │                       ├── View Participants
  │                       └── Export Data
  │
  └── Admin ────────► Admin Dashboard
                          │
                          ├── Manage Events
                          ├── Approve / Reject
                          └── Monitor Registrations
```

---

## 📂 Project Structure

```text
Event-management-system-main/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── tailwind.css
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── .env
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   └── .env.example
│
├── .gitignore
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed on your system:

- Node.js and npm
- MongoDB
- Git

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Event-management-system-main
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` folder.

You can use the provided `.env.example` file as a reference:

```bash
cp .env.example .env
```

Add the required environment variables to the `.env` file.

Then start the backend server:

```bash
npm run dev
```

The backend uses **Node.js, Express.js, and MongoDB**.

### 3. Frontend Setup

Open a **new terminal** and navigate to the frontend folder:

```bash
cd Event-management-system-main/frontend
```

Install the required dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

### 4. Environment Variables

The project uses environment variables to store configuration details securely.

The backend contains an `.env.example` file that can be used as a reference when creating the `.env` file.

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5050
```

> **Note:** Do not commit `.env` files, passwords, database credentials, API keys, or other sensitive information to GitHub.

### 5. Run the Application

Run the **backend and frontend in separate terminals**.

**Terminal 1 – Backend:**

```bash
cd Event-management-system-main/backend
npm run dev
```

**Terminal 2 – Frontend:**

```bash
cd Event-management-system-main/frontend
npm run dev
```

After starting the frontend, open the local URL displayed by Vite in your browser.

---

## 🔑 Role-Based Access

Campus Connect uses role-based authentication and authorization.

| Role | Main Access |
|------|-------------|
| Student | Browse events, register, and view tickets |
| Organizer | Create and manage events, view participants, and export data |
| Admin | Approve/manage events and monitor registrations |

Users are redirected to the appropriate dashboard based on their assigned role after authentication.

---

## 🎟️ Event Registration

The registration system includes validation to ensure reliable event management.

When a student registers:

1. The student selects an event.
2. Registration details are submitted.
3. The system checks whether the student is already registered.
4. Event capacity is checked.
5. Registration is created if the event has available capacity.
6. A ticket is generated for the registered event.
7. The student can view the ticket from the Student Dashboard.

---

## 🎫 Digital Event Ticket

Registered students can access their event tickets from the Student Dashboard.

The ticket includes information such as:

- Student name
- Event name
- Event date
- Event venue
- Ticket code
- QR code

The ticket can be downloaded for use during event entry.

---

## 📊 Event Management

Organizers can manage events by providing information such as:

- Event title
- Event category
- Date
- Venue
- Participant limit
- Ticket price
- Event description

Administrators can review submitted events and approve or reject them before they become available to students.

---

## 🔒 Security

The application implements:

- JWT-based authentication
- Protected routes
- Role-based authorization
- Duplicate registration checks
- Event capacity validation
- Environment variables for sensitive configuration
- Server-side validation

---

## 🚀 Future Enhancements

Possible future improvements include:

- Advanced event recommendations
- Push notifications
- Event reminders
- Certificate generation
- Mobile application
- AI-based event recommendations

---

## 🎯 Objectives

The main objectives of Campus Connect are to:

- Provide a centralized platform for campus events
- Simplify event discovery for students
- Make event registration easier
- Reduce manual event-management work
- Help organizers manage participants efficiently
- Provide administrators with better control over campus events
- Provide students with convenient digital event tickets

---

## 📜 License

This project was developed as an academic project for educational purposes.