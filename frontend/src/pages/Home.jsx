import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Events will now come from MongoDB
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  // =========================================================
  // LOAD ONLY ADMIN-APPROVED EVENTS
  // =========================================================

  useEffect(() => {
    const loadApprovedEvents = async () => {
      try {
        setLoadingEvents(true);

        const response = await axios.get(
          "/api/events?status=approved"
        );

        console.log(
          "APPROVED EVENTS FOR HOME:",
          response.data
        );

        setEvents(response.data.events || []);
      } catch (error) {
        console.error(
          "FAILED TO LOAD APPROVED EVENTS:",
          error
        );

        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadApprovedEvents();
  }, []);

  // =========================================================
  // FILTER EVENTS
  // =========================================================

  const filteredEvents = useMemo(() => {
    let result = events;

// Remove events whose date/time has already passed
const now = new Date();

result = result.filter((event) => {
  if (!event.date) return false;

  const eventDate = new Date(event.date);

  return eventDate >= now;
});

// Category filter
if (selectedCategory !== "All") {
  result = result.filter(
    (event) => event.category === selectedCategory
  );
}

    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (event) =>
          event.title?.toLowerCase().includes(search) ||
          event.category?.toLowerCase().includes(search) ||
          event.location?.toLowerCase().includes(search)
      );
    }

    if (!showAllEvents) {
      result = result.slice(0, 4);
    }

    return result;
  }, [
    events,
    selectedCategory,
    searchTerm,
    showAllEvents,
  ]);

  // =========================================================
  // NAVIGATION
  // =========================================================

// =========================================================
// NAVIGATION
// =========================================================

const goToDashboard = () => {
  if (!user) {
    navigate("/login");
    return;
  }

  const role = user.role?.toLowerCase();

  if (role === "admin") {
    navigate("/admin");
  } else if (role === "organizer") {
    navigate("/dashboard");
  } else {
    // Student / customer
    navigate("/student-dashboard");
  }
};

const goToMyEvents = () => {
  if (!user) {
    navigate("/login");
    return;
  }

  const role = user.role?.toLowerCase();

  if (role === "organizer") {
    navigate("/dashboard");
  } else if (role === "admin") {
    navigate("/admin");
  } else {
    navigate("/student-dashboard");
  }
};

const goToProfile = () => {
  if (!user) {
    navigate("/login");
    return;
  }

  const role = user.role?.toLowerCase();

  if (role === "admin") {
    navigate("/admin");
  } else if (role === "organizer") {
    navigate("/dashboard");
  } else {
    navigate("/student-dashboard");
  }
};

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (axios.defaults.headers.common) {
      delete axios.defaults.headers.common.Authorization;
    }

    navigate("/login");
  };

  // =========================================================
  // REGISTER FOR EVENT
  // =========================================================

  const handleRegister = () => {
    if (!selectedEvent) {
      return;
    }

    /*
     * USER NOT LOGGED IN
     */
    if (!token) {
      setSelectedEvent(null);

      navigate("/login", {
        state: {
          from: "/home",
          message: "Please login to register for an event.",
        },
      });

      return;
    }

    /*
     * USER LOGGED IN
     *
     * Send the selected event to registration page.
     */
    navigate("/register-event", {
      state: {
        event: selectedEvent,
      },
    });

    setSelectedEvent(null);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // CATEGORY STYLE
  // =========================================================

  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case "tech":
        return "bg-[#8a0027] text-[#ff8f98]";

      case "cultural":
        return "bg-[#86f2e4] text-[#006f66]";

      case "sports":
        return "bg-[#544fc0] text-white";

      case "workshops":
      case "workshop":
        return "bg-[#3730a3] text-[#a9a7ff]";

      default:
        return "bg-[#e2dfff] text-[#3730a3]";
    }
  };

  // =========================================================
  // POSTER URL
  // =========================================================

  
const getPosterUrl = (event) => {
  if (!event?.posterUrl) {
    return null;
  }

  const posterPath = event.posterUrl;

  // If backend sends a complete URL,
  // use only its pathname so the request goes
  // through the Vite proxy.
  if (
    posterPath.startsWith("http://") ||
    posterPath.startsWith("https://")
  ) {
    try {
      const url = new URL(posterPath);
      return url.pathname;
    } catch {
      return posterPath;
    }
  }

  // Make sure the poster path starts with /
  return posterPath.startsWith("/")
    ? posterPath
    : `/${posterPath}`;
};

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#151c27] flex flex-col">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#c8c4d5] shadow-sm">

        <div className="max-w-[1280px] h-full mx-auto px-4 md:px-8 flex items-center justify-between">

          {/* LOGO + NAVIGATION */}

          <div className="flex items-center gap-6">

            <Link
              to="/home"
              className="text-2xl font-bold text-[#1f108e] whitespace-nowrap"
            >
              Campus Connect
            </Link>

            <nav className="hidden md:flex items-center gap-4 ml-4">

              <Link
                to="/home"
                className="text-[#1f108e] font-bold border-b-2 border-[#1f108e] pb-1"
              >
                Home
              </Link>

              <button
                onClick={goToDashboard}
                className="text-[#464553] hover:text-[#1f108e] transition-colors"
              >
                Dashboard
              </button>

              

              

            </nav>

          </div>

          {/* SEARCH + AUTH */}

          <div className="hidden md:flex items-center gap-2">

            <div className="relative hidden lg:block">

              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777584]">
                search
              </span>

              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-64 pl-10 pr-4 py-2 bg-[#f0f3ff] border border-[#c8c4d5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1f108e]"
              />

            </div>

            {token ? (
              <>
                <button
                  onClick={goToDashboard}
                  className="px-4 py-2 text-[#1f108e] font-semibold border border-[#1f108e] rounded-md hover:bg-[#f0f3ff] transition-colors"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#1f108e] text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-[#1f108e] font-semibold border border-[#1f108e] rounded-md hover:bg-[#f0f3ff] transition-colors"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="px-4 py-2 bg-[#1f108e] text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
                >
                  Signup
                </Link>
              </>
            )}

          </div>

          {/* MOBILE MENU */}

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden text-[#464553]"
          >
            <span className="material-symbols-outlined">
              {mobileMenu ? "close" : "menu"}
            </span>
          </button>

        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-[#c8c4d5] shadow-lg px-4 py-4 space-y-3">

            <button
              onClick={() => {
                navigate("/home");
                setMobileMenu(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#f0f3ff]"
            >
              🏠 Home
            </button>

            <button
              onClick={() => {
                goToDashboard();
                setMobileMenu(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#f0f3ff]"
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => {
                goToMyEvents();
                setMobileMenu(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#f0f3ff]"
            >
              🎟️ My Events
            </button>

            <button
              onClick={() => {
                goToProfile();
                setMobileMenu(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#f0f3ff]"
            >
              👤 Profile
            </button>

            {!token && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-[#f0f3ff]"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-3 bg-[#1f108e] text-white rounded-lg"
                >
                  Signup
                </Link>
              </>
            )}

            {token && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenu(false);
                }}
                className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            )}

          </div>
        )}

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-grow pt-24 px-4 md:px-8 max-w-[1280px] mx-auto w-full pb-8">

        {/* HERO */}

        <section className="mb-8 text-center md:text-left">

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
            Discover Campus Events
          </h1>

          <p className="text-lg text-[#464553] max-w-2xl leading-7">
            Connect with your university community. Find workshops,
            sports, cultural activities, and academic seminars tailored
            to your interests.
          </p>

        </section>

        {/* SEARCH + FILTERS */}

        <section className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">

          <div className="relative w-full md:w-1/3">

            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777584]">
              search
            </span>

            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#c8c4d5] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#1f108e]"
            />

          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">

            {[
              "All",
              "Workshop",
              "Sports",
              "Cultural",
              "Tech",
            ].map((category) => (

              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedCategory === category
                    ? "bg-[#1f108e] text-white"
                    : "bg-white border border-[#c8c4d5] text-[#464553] hover:bg-[#f0f3ff]"
                }`}
              >
                {category}
              </button>

            ))}

          </div>

        </section>

        {/* SEARCH RESULT */}

        {searchTerm && (
          <div className="mb-5 text-sm text-[#464553]">
            Showing results for{" "}
            <span className="font-semibold text-[#1f108e]">
              "{searchTerm}"
            </span>
          </div>
        )}

        {/* =====================================================
            EVENT GRID
        ===================================================== */}

        {loadingEvents ? (

          <div className="bg-white border border-[#c8c4d5] rounded-xl p-12 text-center">

            <div className="text-xl font-semibold">
              Loading approved events...
            </div>

            <p className="text-[#464553] mt-2">
              Please wait while we load campus events.
            </p>

          </div>

        ) : filteredEvents.length === 0 ? (

          <div className="bg-white border border-[#c8c4d5] rounded-xl p-12 text-center">

            <span className="material-symbols-outlined text-5xl text-[#777584]">
              event_busy
            </span>

            <h3 className="text-xl font-semibold mt-4">
              No approved events found
            </h3>

            <p className="text-[#464553] mt-2">
              There are currently no approved events matching your search.
            </p>

            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
              }}
              className="mt-5 px-5 py-2 bg-[#1f108e] text-white rounded-lg font-semibold"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredEvents.map((event) => (

              <article
                key={event._id}
                className="bg-white rounded-lg border border-[#c8c4d5] overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group"
              >

                {/* IMAGE */}

                <div className="h-48 bg-[#f0f3ff] relative overflow-hidden">

                  {getPosterUrl(event) ? (
                    <img
                      src={getPosterUrl(event)}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#777584]">
                      <span className="material-symbols-outlined text-5xl">
                        event
                      </span>
                    </div>
                  )}

                  <div
                    className={`absolute top-4 left-4 px-2 py-1 rounded text-xs font-semibold ${getCategoryClass(
                      event.category
                    )}`}
                  >
                    {event.category}
                  </div>

                </div>

                {/* CONTENT */}

                <div className="p-4 flex flex-col flex-grow">

                  {/* DATE */}

                  <div className="text-[#1f108e] text-sm font-semibold mb-2 flex items-center gap-1">

                    <span className="material-symbols-outlined text-[16px]">
                      calendar_today
                    </span>

                    {formatDate(event.date)}

                    {formatTime(event.date) && (
                      <>
                        {" • "}
                        {formatTime(event.date)}
                      </>
                    )}

                  </div>

                  {/* TITLE */}

                  <h3 className="text-xl font-semibold text-[#151c27] mb-2">
                    {event.title}
                  </h3>

                  {/* LOCATION */}

                  <div className="flex items-center gap-1 text-sm text-[#464553] mb-4 flex-grow">

                    <span className="material-symbols-outlined text-[16px]">
                      location_on
                    </span>

                    {event.location}

                  </div>

                  {/* BOTTOM */}

                  <div className="mt-auto pt-4 border-t border-[#c8c4d5] flex justify-between items-center">

                    <div className="text-xs text-[#464553]">

                      {event.capacity ? (
                        <>
                          <span className="text-[#1f108e] font-semibold">
                            {event.capacity}
                          </span>{" "}
                          Seats
                        </>
                      ) : (
                        "Open to All"
                      )}

                    </div>

                    <button
                      onClick={() =>
                        setSelectedEvent(event)
                      }
                      className="text-[#1f108e] font-semibold text-sm hover:underline"
                    >
                      View Details
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </section>

        )}

        {/* LOAD MORE */}

        {!loadingEvents &&
          filteredEvents.length > 0 &&
          !searchTerm &&
          selectedCategory === "All" &&
          events.length > 4 && (

            <div className="mt-8 text-center">

              <button
                onClick={() =>
                  setShowAllEvents(!showAllEvents)
                }
                className="px-6 py-3 border border-[#c8c4d5] text-[#1f108e] font-semibold rounded-lg hover:bg-[#f0f3ff] transition-colors"
              >
                {showAllEvents
                  ? "Show Less"
                  : "Load More Events"}
              </button>

            </div>
          )}

      </main>

      {/* =====================================================
          EVENT DETAILS MODAL
      ===================================================== */}

      {selectedEvent && (

        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* IMAGE */}

            <div className="relative h-56">

              {getPosterUrl(selectedEvent) ? (
                <img
                  src={getPosterUrl(selectedEvent)}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-full bg-[#f0f3ff] flex items-center justify-center rounded-t-2xl">
                  <span className="material-symbols-outlined text-6xl text-[#777584]">
                    event
                  </span>
                </div>
              )}

              <button
                onClick={() =>
                  setSelectedEvent(null)
                }
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full text-2xl hover:bg-white"
              >
                ×
              </button>

              <div
                className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${getCategoryClass(
                  selectedEvent.category
                )}`}
              >
                {selectedEvent.category}
              </div>

            </div>

            {/* DETAILS */}

            <div className="p-6">

              <h2 className="text-2xl font-bold text-[#151c27] mb-3">
                {selectedEvent.title}
              </h2>

              <div className="space-y-3 text-[#464553]">

                <div className="flex items-center gap-2">

                  <span className="material-symbols-outlined text-[#1f108e]">
                    calendar_today
                  </span>

                  {formatDate(selectedEvent.date)}

                  {formatTime(selectedEvent.date) && (
                    <>
                      {" • "}
                      {formatTime(selectedEvent.date)}
                    </>
                  )}

                </div>

                <div className="flex items-center gap-2">

                  <span className="material-symbols-outlined text-[#1f108e]">
                    location_on
                  </span>

                  {selectedEvent.location}

                </div>

                <div className="flex items-center gap-2">

                  <span className="material-symbols-outlined text-[#1f108e]">
                    group
                  </span>

                  {selectedEvent.capacity
                    ? `${selectedEvent.capacity} seats`
                    : "Open to All"}

                </div>

                <div className="flex items-center gap-2">

                  <span className="material-symbols-outlined text-[#1f108e]">
                    payments
                  </span>

                  {selectedEvent.price === "-" ||
 Number(selectedEvent.price || 0) === 0
  ? "Free Registration"
  : `₹${selectedEvent.price}`}

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="mt-5">

                <h3 className="font-semibold text-lg mb-2">
                  About this event
                </h3>

                <p className="text-[#464553] leading-7">
                  {selectedEvent.description}
                </p>

              </div>

              {/* BUTTONS */}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={handleRegister}
                  className="flex-1 px-5 py-3 bg-[#1f108e] text-white rounded-lg font-semibold hover:bg-[#3730a3] transition"
                >
                  {token
                    ? "Register for Event"
                    : "Login to Register"}
                </button>

                <button
                  onClick={() =>
                    setSelectedEvent(null)
                  }
                  className="px-5 py-3 border border-[#c8c4d5] text-[#464553] rounded-lg font-semibold hover:bg-[#f0f3ff]"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-white border-t border-[#c8c4d5] w-full py-8 px-4 md:px-8 mt-auto">

        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-sm font-semibold text-[#151c27]">
            Campus Connect
          </div>

          <div className="text-sm text-[#464553] text-center">
            © 2026 Campus Connect. Institutional Trust & Digital Efficiency.
          </div>

          <nav className="flex flex-wrap justify-center gap-4">

            <button
              onClick={() =>
                alert("Campus Connect Privacy Policy")
              }
              className="text-xs text-[#464553] hover:text-[#1f108e]"
            >
              Privacy Policy
            </button>

            <button
              onClick={() =>
                alert("Campus Connect Terms of Service")
              }
              className="text-xs text-[#464553] hover:text-[#1f108e]"
            >
              Terms of Service
            </button>

            <button
              onClick={() =>
                alert("Contact Campus Connect Support")
              }
              className="text-xs text-[#464553] hover:text-[#1f108e]"
            >
              Contact Support
            </button>

            <button
              onClick={() =>
                alert("Thank you for your feedback!")
              }
              className="text-xs text-[#464553] hover:text-[#1f108e]"
            >
              Feedback
            </button>

          </nav>

        </div>

      </footer>

    </div>
  );
}

export default Home;