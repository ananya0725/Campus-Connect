import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import EventTicket from "../components/EventTicket";

const StudentDash = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stores the download function from EventTicket
  const [downloadTicket, setDownloadTicket] = useState(null);

  // Current date and time
  const [currentDateTime, setCurrentDateTime] = useState(
    new Date()
  );

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  // ==========================================================
  // UPDATE CURRENT TIME EVERY MINUTE
  // ==========================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadStudentDashboard = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // Attach token
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // ======================================================
      // LOAD APPROVED EVENTS
      // ======================================================

      try {
        const eventResponse = await axios.get(
          "/api/events?status=approved"
        );

        const eventData =
          eventResponse.data?.events ||
          eventResponse.data ||
          [];

        setEvents(
          Array.isArray(eventData)
            ? eventData
            : []
        );
      } catch (eventError) {
        console.error(
          "Could not load events:",
          eventError
        );

        setEvents([]);
      }

      // ======================================================
      // LOAD MY REGISTRATIONS
      // ======================================================

      try {
        const registrationResponse =
          await axios.get(
            "/api/registrations/me"
          );

        const registrationData =
          registrationResponse.data
            ?.registrations ||
          registrationResponse.data ||
          [];

        setRegisteredEvents(
          Array.isArray(registrationData)
            ? registrationData
            : []
        );
      } catch (registrationError) {
        console.error(
          "Could not load registrations:",
          registrationError.response?.data ||
            registrationError.message
        );

        setRegisteredEvents([]);
      }
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // REMOVE EXPIRED EVENTS
  // ==========================================================

  const upcomingEvents = events.filter((event) => {
    const eventDate =
      event?.date || event?.startDate;

    if (!eventDate) return false;

    return new Date(eventDate) >= currentDateTime;
  });

  const activeRegisteredEvents =
    registeredEvents.filter(
      (registration) => {
        const eventDate =
          registration?.event?.date ||
          registration?.event?.startDate;

        if (!eventDate) return false;

        return (
          new Date(eventDate) >=
          currentDateTime
        );
      }
    );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common[
      "Authorization"
    ];

    navigate("/login");
  };

  // ==========================================================
  // USER NAME
  // ==========================================================

  const getUserName = () => {
    if (!user) return "Student";

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.email?.split("@")[0] ||
      "Student"
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070817] text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-white/60">
            Loading your dashboard...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#070817] text-white relative overflow-hidden">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute -top-48 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[140px]" />

        <div className="absolute top-1/4 -right-48 w-[600px] h-[600px] rounded-full bg-fuchsia-600/15 blur-[140px]" />

        <div className="absolute -bottom-48 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.07)_1px,transparent_1px)] bg-[length:32px_32px]" />

      </div>

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <header className="relative z-20 border-b border-white/10 bg-[#070817]/80 backdrop-blur-xl">

        <nav className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">

          {/* LOGO */}

          <Link
            to="/student-dashboard"
            className="flex items-center gap-3"
          >

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <span className="text-xl">
                🎟️
              </span>
            </div>

            <div>

              <h1 className="text-xl font-bold">
                Campus{" "}
                <span className="text-violet-400">
                  Connect
                </span>
              </h1>

              <p className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-white/35">
                Student Portal
              </p>

            </div>

          </Link>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">

              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-sm font-bold">
                {getUserName()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="text-left">

                <p className="text-sm font-semibold">
                  {getUserName()}
                </p>

                <p className="text-[10px] text-white/35">
                  Student
                </p>

              </div>

            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-semibold transition"
            >
              Logout
            </button>

          </div>

        </nav>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-10">

        {/* ====================================================
            WELCOME
        ==================================================== */}

        <section className="mb-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">

            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />

            Student Dashboard

          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tight">

            Welcome back,{" "}

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              {getUserName()}
            </span>{" "}

            👋

          </h2>

          <p className="mt-3 text-white/45 max-w-2xl">
            Discover events, manage your registrations and keep
            all your Campus Connect tickets in one place.
          </p>

        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* ====================================================
            STATS
        ==================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">

          {/* AVAILABLE */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-white/40">
                  Available Events
                </p>

                <p className="text-3xl font-black mt-2">
                  {upcomingEvents.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">
                🎪
              </div>

            </div>

          </div>

          {/* REGISTERED */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-white/40">
                  Registered Events
                </p>

                <p className="text-3xl font-black mt-2">
                  {activeRegisteredEvents.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-2xl">
                📋
              </div>

            </div>

          </div>

          {/* TICKETS */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-white/40">
                  My Tickets
                </p>

                <p className="text-3xl font-black mt-2">
                  {activeRegisteredEvents.length}
                </p>

              </div>

              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl">
                🎟️
              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <section className="grid md:grid-cols-2 gap-5 mb-12">

          <Link
            to="/home"
            className="group rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/15 to-fuchsia-600/5 p-6 hover:border-violet-400/30 transition"
          >

            <div className="flex items-center gap-5">

              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center text-3xl group-hover:scale-105 transition">
                🎪
              </div>

              <div className="flex-1">

                <h3 className="text-lg font-bold">
                  Explore Events
                </h3>

                <p className="text-sm text-white/40 mt-1">
                  Find exciting events happening on campus.
                </p>

              </div>

              <span className="text-xl text-white/30 group-hover:text-violet-400 group-hover:translate-x-1 transition">
                →
              </span>

            </div>

          </Link>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 to-indigo-600/5 p-6">

            <div className="flex items-center gap-5">

              <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-3xl">
                🎟️
              </div>

              <div>

                <h3 className="text-lg font-bold">
                  My Tickets
                </h3>

                <p className="text-sm text-white/40 mt-1">
                  Your registered event tickets appear below.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            MY REGISTERED EVENTS
        ==================================================== */}

        <section className="mb-12">

          <div className="flex items-center justify-between mb-5">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-violet-400 font-bold">
                Your registrations
              </p>

              <h2 className="text-2xl font-black mt-1">
                My Registered Events
              </h2>

            </div>

            <span className="text-sm text-white/30">
              {activeRegisteredEvents.length} ticket
              {activeRegisteredEvents.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {activeRegisteredEvents.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] text-center py-12">

              <div className="text-5xl mb-4">
                🎟️
              </div>

              <p className="text-white/40">
                You have not registered for any events yet.
              </p>

              <Link
                to="/home"
                className="inline-block mt-5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold hover:opacity-90 transition"
              >
                Explore Events
              </Link>

            </div>

          ) : (

            <div className="space-y-8">

              {activeRegisteredEvents.map(
                (registration) => (

                  <div
                    key={registration._id}
                    className="space-y-4"
                  >

                    {/* REAL TICKET */}

                    <EventTicket
                      registration={registration}
                      user={user}
                      onReady={(downloadFn) =>
                        setDownloadTicket(
                          () => downloadFn
                        )
                      }
                    />

                    {/* DOWNLOAD BUTTON */}

                    <div className="flex justify-center">

                      <button
                        type="button"
                        onClick={() =>
                          downloadTicket?.()
                        }
                        disabled={
                          !downloadTicket
                        }
                        className="px-7 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white font-bold shadow-lg shadow-fuchsia-600/20 hover:scale-[1.02] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >

                        📥 Download Ticket

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ====================================================
            UPCOMING EVENTS
        ==================================================== */}

        <section>

          <div className="flex items-center justify-between mb-5">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-400 font-bold">
                Discover
              </p>

              <h2 className="text-2xl font-black mt-1">
                Upcoming Events
              </h2>

            </div>

          </div>

          {upcomingEvents.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">

              <div className="text-4xl mb-3">
                🎪
              </div>

              <p className="text-white/40">
                No events available right now.
              </p>

            </div>

          ) : (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {upcomingEvents
                .slice(0, 6)
                .map((event, index) => {

                  const eventId =
                    event._id ||
                    event.id ||
                    index;

                  const eventName =
                    event.name ||
                    event.title ||
                    "Campus Event";

                  const eventDate =
                    event.date ||
                    event.startDate;

                  const eventLocation =
                    event.location ||
                    event.venue ||
                    "Campus";

                  const registered =
                    Number(
                      event.registered ||
                        event.registrations ||
                        0
                    );

                  const capacity =
                    Number(
                      event.capacity || 0
                    );

                  const seatsText =
                    capacity > 0
                      ? `${registered} / ${capacity} Seats Filled`
                      : "Open to All";

                  const isFull =
                    capacity > 0 &&
                    registered >= capacity;

                  return (

                    <div
                      key={eventId}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden hover:border-violet-400/30 transition"
                    >

                      {/* EVENT IMAGE */}

                      <div className="h-32 bg-gradient-to-br from-violet-700/30 via-fuchsia-600/20 to-indigo-700/20 flex items-center justify-center">

                        {event.posterUrl ? (

                          <img
                            src={event.posterUrl}
                            alt={eventName}
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <span className="text-5xl">
                            🎪
                          </span>

                        )}

                      </div>

                      {/* EVENT INFO */}

                      <div className="p-5">

                        <h3 className="font-bold text-lg truncate">
                          {eventName}
                        </h3>

                        <div className="space-y-2 mt-4">

                          <p className="text-xs text-white/40">
                            📅{" "}
                            {eventDate
                              ? new Date(
                                  eventDate
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Date TBA"}
                          </p>

                          <p className="text-xs text-white/40 truncate">
                            📍 {eventLocation}
                          </p>

                          <p
                            className={`text-sm mt-2 font-semibold ${
                              isFull
                                ? "text-red-400"
                                : "text-violet-300"
                            }`}
                          >
                            👥 {seatsText}
                          </p>

                        </div>

                        {/* REGISTER BUTTON */}

                        {isFull ? (

                          <button
                            disabled
                            className="mt-4 w-full px-5 py-2 rounded-lg bg-gray-600 text-gray-300 font-semibold cursor-not-allowed"
                          >
                            Event Full
                          </button>

                        ) : (

                          <Link
                            to="/register-event"
                            state={{
                              event,
                            }}
                            className="inline-block mt-4 w-full text-center px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold transition"
                          >
                            Register for Event
                          </Link>

                        )}

                      </div>

                    </div>

                  );
                })}

            </div>

          )}

        </section>

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="relative z-10 border-t border-white/10 mt-12">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 text-center">

          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
            Campus Connect • Discover • Connect • Experience
          </p>

        </div>

      </footer>

    </div>
  );
};

export default StudentDash;