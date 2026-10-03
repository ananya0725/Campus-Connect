
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import OrganizerDash from "./pages/OrganizerDash";
import AdminDash from "./pages/AdminDash";
import Registration from "./pages/registration";
import StudentDash from "./pages/StudentDash";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        {/* ORGANIZER DASHBOARD */}
        <Route
          path="/dashboard"
          element={<OrganizerDash />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={<AdminDash />}
        />

        {/* EVENT REGISTRATION */}
        <Route
          path="/register-event"
          element={<Registration />}
        />

        {/* STUDENT DASHBOARD */}
        <Route
          path="/student-dashboard"
          element={<StudentDash />}
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
