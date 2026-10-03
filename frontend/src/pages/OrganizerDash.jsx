import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

export default function OrganizerDash() {
  const { user, logout } = useAuth();

  const [mine, setMine] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Tech");
  const [description, setDescription] = useState("");

  const [capacityType, setCapacityType] = useState("open");
  const [capacity, setCapacity] = useState("");

  const [registrationFee, setRegistrationFee] = useState("");
  const [poster, setPoster] = useState(null);

  const [activeMenu, setActiveMenu] = useState("Overview");
  const [search, setSearch] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dashboardTheme") === "dark"
  );

  const [toast, setToast] = useState({
    open: false,
    type: "info",
    message: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "dashboardTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const showToast = (type, message) => {
    setToast({
      open: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        open: false,
        type: "info",
        message: "",
      });
    }, 3000);
  };

  useEffect(() => {
    if (!user) return;

    if (user.role === "organizer") {
      loadMyEvents();
    }
  }, [user]);

  async function loadMyEvents() {
    try {
      const res = await axios.get("/api/events", {
        params: {
          organizer: user?._id || user?.id,
        },
      });

      setMine(res.data.events || []);
    } catch (error) {
      console.error("LOAD EVENTS ERROR:", error);

      showToast(
        "error",
        error.response?.data?.message ||
          "Unable to load your events"
      );
    }
  }

  async function loadParticipants(eventId) {
    try {
      const res = await axios.get(
        `/api/registrations/${eventId}/participants`
      );

      setParticipants(res.data.participants || []);
      setSelectedEvent(eventId);
      setActiveMenu("Attendees");
    } catch (error) {
      console.error("LOAD PARTICIPANTS ERROR:", error);

      showToast(
        "error",
        "Unable to load participants"
      );
    }
  }

  /*
   * Convert the stored poster path into a browser URL.
   *
   * Example:
   * /uploads/poster-123.jpg
   *
   * becomes:
   * http://localhost:5050/uploads/poster-123.jpg
   */
  function getPosterUrl(posterUrl) {
    if (!posterUrl) return "";

    if (
      posterUrl.startsWith("http://") ||
      posterUrl.startsWith("https://")
    ) {
      return posterUrl;
    }

    const backendUrl = `${window.location.protocol}//${window.location.hostname}:5050`;

    if (posterUrl.startsWith("/")) {
      return `${backendUrl}${posterUrl}`;
    }

    return `${backendUrl}/${posterUrl}`;
  }

  async function createEvent(e) {
    e.preventDefault();

    /* BASIC VALIDATION */

    if (!title.trim()) {
      showToast("error", "Please enter an event title");
      return;
    }

    if (!date) {
      showToast(
        "error",
        "Please select event date and time"
      );
      return;
    }

    if (!location.trim()) {
      showToast(
        "error",
        "Please enter event location"
      );
      return;
    }

    if (!description.trim()) {
      showToast(
        "error",
        "Please enter event description"
      );
      return;
    }

    /* CAPACITY VALIDATION */

    if (capacityType === "limited") {
      const numericCapacity = Number(capacity);

      if (
        capacity === "" ||
        !Number.isFinite(numericCapacity) ||
        numericCapacity < 1
      ) {
        showToast(
          "error",
          "Please enter a valid event capacity"
        );
        return;
      }
    }

    /* FEE VALIDATION */

    if (
      registrationFee !== "" &&
      (!Number.isFinite(Number(registrationFee)) ||
        Number(registrationFee) < 0)
    ) {
      showToast(
        "error",
        "Please enter a valid registration fee"
      );
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("date", date);
      formData.append("location", location.trim());
      formData.append("category", category);
      formData.append(
        "description",
        description.trim()
      );

      /*
       * CAPACITY
       *
       * Open to All -> "-"
       * Limited -> number
       */

      if (capacityType === "open") {
        formData.append("capacity", "-");
      } else {
        formData.append(
          "capacity",
          String(Number(capacity))
        );
      }

      /*
       * PRICE
       *
       * Empty fee -> "-"
       * Entered fee -> number
       */

      if (registrationFee === "") {
        formData.append("price", "-");
      } else {
        formData.append(
          "price",
          String(Number(registrationFee))
        );
      }

      /* POSTER */

      if (poster) {
        formData.append("poster", poster);
      }

      console.log("========== CREATE EVENT ==========");
      console.log("capacityType:", capacityType);
      console.log(
        "capacity sent:",
        capacityType === "open"
          ? "-"
          : Number(capacity)
      );
      console.log(
        "price sent:",
        registrationFee === ""
          ? "-"
          : Number(registrationFee)
      );
      console.log(
        "poster:",
        poster?.name || "No poster"
      );
      console.log("==================================");

      const response = await axios.post(
        "/api/events",
        formData
      );

      console.log(
        "EVENT CREATED:",
        response.data
      );

      /* RESET FORM */

      setTitle("");
      setDate("");
      setLocation("");
      setCategory("Tech");
      setDescription("");
      setCapacity("");
      setCapacityType("open");
      setRegistrationFee("");
      setPoster(null);

      showToast(
        "success",
        "Event created successfully!"
      );

      await loadMyEvents();

      setActiveMenu("Events");
    } catch (error) {
      console.error(
        "CREATE EVENT ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Unable to create event"
      );
    }
  }

  async function exportCsv(eventId) {
    try {
      const check = await axios.get(
        `/api/registrations/${eventId}/participants`
      );

      const list =
        check.data.participants || [];

      if (!list.length) {
        showToast(
          "error",
          "No participants available for this event"
        );
        return;
      }

      const response = await axios.get(
        `/api/registrations/${eventId}/participants.csv`,
        {
          responseType: "blob",
        }
      );

      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `participants-${eventId}.csv`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      showToast(
        "success",
        "Participants CSV downloaded"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        "Unable to export participants"
      );
    }
  }

  const analytics = useMemo(() => {
    const byStatus = mine.reduce(
      (acc, event) => {
        const status =
          event.status || "unknown";

        acc[status] =
          (acc[status] || 0) + 1;

        return acc;
      },
      {}
    );

    const byCategory = mine.reduce(
      (acc, event) => {
        const eventCategory =
          event.category || "Other";

        acc[eventCategory] =
          (acc[eventCategory] || 0) + 1;

        return acc;
      },
      {}
    );

    const totalCapacity = mine.reduce(
      (sum, event) => {
        if (
          event.capacity === "-" ||
          event.capacity === null ||
          event.capacity === undefined
        ) {
          return sum;
        }

        return sum + Number(event.capacity || 0);
      },
      0
    );

    return {
      byStatus,
      byCategory,
      totalCapacity,
    };
  }, [mine]);

  const filteredEvents = mine.filter(
    (event) =>
      event.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  const pageClass = darkMode
    ? "bg-[#0f172a] text-white"
    : "bg-[#f8f9ff] text-[#151c27]";

  const cardClass = darkMode
    ? "bg-[#172033] border-[#334155]"
    : "bg-white border-[#e1e4ef]";

  const mutedClass = darkMode
    ? "text-slate-400"
    : "text-slate-500";

  const inputClass = darkMode
    ? "bg-[#111827] border-[#334155] text-white placeholder-slate-500"
    : "bg-white border-slate-300 text-[#151c27]";

  const navigation = [
    ["Overview", "dashboard"],
    ["Events", "event"],
    ["Attendees", "group"],
    ["Analytics", "analytics"],
    ["Settings", "settings"],
  ];

  return (
    <div
      className={`min-h-screen ${pageClass}`}
    >
      {toast.open && (
        <div
          className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-xl shadow-xl text-white font-medium ${
            toast.type === "error"
              ? "bg-red-600"
              : toast.type === "success"
              ? "bg-green-600"
              : "bg-blue-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 hidden lg:flex flex-col border-r z-50 ${
          darkMode
            ? "bg-[#111827] border-[#334155]"
            : "bg-white border-[#e1e4ef]"
        }`}
      >
        <div className="px-6 py-7 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#3730a3] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white">
                school
              </span>
            </div>

            <div>
              <h1 className="font-bold text-lg text-[#3730a3]">
                Campus Connect
              </h1>

              <p
                className={`text-xs ${mutedClass}`}
              >
                Organizer Dashboard
              </p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-6 space-y-2 flex-1">
          {navigation.map(
            ([name, icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setActiveMenu(name);

                  if (
                    name === "Attendees" &&
                    !selectedEvent &&
                    mine.length
                  ) {
                    loadParticipants(
                      mine[0]._id
                    );
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  activeMenu === name
                    ? "bg-[#3730a3] text-white shadow-md"
                    : `${mutedClass} hover:bg-[#eef0ff] hover:text-[#3730a3]`
                }`}
              >
                <span className="material-symbols-outlined">
                  {icon}
                </span>

                <span className="font-medium">
                  {name}
                </span>
              </button>
            )
          )}
        </nav>

        <div className="p-4 border-t border-inherit">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#3730a3] text-white flex items-center justify-center font-bold">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="font-semibold truncate">
                {user?.name || "User"}
              </p>

              <p
                className={`text-xs ${mutedClass}`}
              >
                {user?.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${mutedClass} hover:bg-red-50 hover:text-red-600`}
          >
            <span className="material-symbols-outlined">
              logout
            </span>

            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="lg:ml-64 min-h-screen">

        {/* HEADER */}

        <header
          className={`sticky top-0 z-40 border-b backdrop-blur ${
            darkMode
              ? "bg-[#111827]/95 border-[#334155]"
              : "bg-white/95 border-[#e1e4ef]"
          }`}
        >
          <div className="px-5 md:px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                {activeMenu}
              </h2>

              <p
                className={`text-sm mt-1 ${mutedClass}`}
              >
                Welcome back,{" "}
                {user?.name || "Organizer"}.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden md:flex relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search events..."
                  className={`w-60 pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[#3730a3] ${inputClass}`}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setDarkMode(
                    !darkMode
                  )
                }
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                  darkMode
                    ? "border-[#334155] hover:bg-[#1e293b]"
                    : "border-[#e1e4ef] hover:bg-[#f1f3ff]"
                }`}
              >
                <span className="material-symbols-outlined">
                  {darkMode
                    ? "light_mode"
                    : "dark_mode"}
                </span>
              </button>

            </div>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-[1400px] mx-auto">

          {/* ========================= */}
          {/* OVERVIEW */}
          {/* ========================= */}

          {activeMenu === "Overview" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                <div
                  className={`${cardClass} border rounded-2xl p-5 shadow-sm`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p
                        className={`text-sm ${mutedClass}`}
                      >
                        Total Events
                      </p>

                      <h3 className="text-3xl font-bold mt-2">
                        {mine.length}
                      </h3>

                      <p className="text-xs text-green-600 mt-2">
                        Your created events
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-[#3730a3] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        event
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`${cardClass} border rounded-2xl p-5 shadow-sm`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p
                        className={`text-sm ${mutedClass}`}
                      >
                        Total Capacity
                      </p>

                      <h3 className="text-3xl font-bold mt-2">
                        {analytics.totalCapacity}
                      </h3>

                      <p className="text-xs text-blue-600 mt-2">
                        Limited-event seats
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        groups
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`${cardClass} border rounded-2xl p-5 shadow-sm`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p
                        className={`text-sm ${mutedClass}`}
                      >
                        Approved
                      </p>

                      <h3 className="text-3xl font-bold mt-2">
                        {analytics.byStatus?.approved ||
                          0}
                      </h3>

                      <p className="text-xs text-green-600 mt-2">
                        Successfully approved
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`${cardClass} border rounded-2xl p-5 shadow-sm`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p
                        className={`text-sm ${mutedClass}`}
                      >
                        Pending
                      </p>

                      <h3 className="text-3xl font-bold mt-2">
                        {analytics.byStatus?.pending ||
                          0}
                      </h3>

                      <p className="text-xs text-orange-600 mt-2">
                        Awaiting approval
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        pending
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* CREATE EVENT */}

                <div
                  className={`${cardClass} border rounded-2xl p-6 shadow-sm`}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">
                      Create Event
                    </h2>

                    <p
                      className={`text-sm mt-1 ${mutedClass}`}
                    >
                      Add a new campus event.
                    </p>
                  </div>

                  <form
                    onSubmit={createEvent}
                    className="space-y-4"
                  >

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Event Title
                      </label>

                      <input
                        required
                        value={title}
                        onChange={(e) =>
                          setTitle(e.target.value)
                        }
                        placeholder="Enter event title"
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#3730a3] ${inputClass}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Date & Time
                      </label>

                      <input
                        required
                        type="datetime-local"
                        value={date}
                        onChange={(e) =>
                          setDate(e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#3730a3] ${inputClass}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Location
                      </label>

                      <input
                        required
                        value={location}
                        onChange={(e) =>
                          setLocation(e.target.value)
                        }
                        placeholder="Event location"
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#3730a3] ${inputClass}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category
                      </label>

                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl border outline-none ${inputClass}`}
                      >
                        <option value="Tech">
                          Tech
                        </option>

                        <option value="Academic">
                          Academic
                        </option>

                        <option value="Sports">
                          Sports
                        </option>

                        <option value="Cultural">
                          Cultural
                        </option>

                        <option value="Workshop">
                          Workshop
                        </option>

                        <option value="Arts">
                          Arts
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Event Capacity
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <button
                          type="button"
                          onClick={() => {
                            setCapacityType("open");
                            setCapacity("");
                          }}
                          className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                            capacityType === "open"
                              ? "border-[#3730a3] bg-[#eef0ff] text-[#3730a3]"
                              : inputClass
                          }`}
                        >
                          Open to All
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setCapacityType("limited")
                          }
                          className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                            capacityType === "limited"
                              ? "border-[#3730a3] bg-[#eef0ff] text-[#3730a3]"
                              : inputClass
                          }`}
                        >
                          Set Capacity
                        </button>

                      </div>

                      {capacityType === "limited" && (
                        <input
                          required
                          type="number"
                          min="1"
                          value={capacity}
                          onChange={(e) =>
                            setCapacity(e.target.value)
                          }
                          placeholder="Example: 100"
                          className={`w-full mt-3 px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#3730a3] ${inputClass}`}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Registration Fee (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={registrationFee}
                        onChange={(e) =>
                          setRegistrationFee(
                            e.target.value
                          )
                        }
                        placeholder="Leave empty for free event"
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#3730a3] ${inputClass}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>

                      <textarea
                        required
                        value={description}
                        onChange={(e) =>
                          setDescription(
                            e.target.value
                          )
                        }
                        placeholder="Describe your event"
                        rows="4"
                        className={`w-full px-4 py-3 rounded-xl border outline-none resize-none focus:ring-2 focus:ring-[#3730a3] ${inputClass}`}
                      />
                    </div>

                    {/* POSTER UPLOAD */}

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Event Poster
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setPoster(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className={`w-full text-sm ${mutedClass}`}
                      />

                      {/* Selected poster preview */}

                      {poster && (
                        <div className="mt-3">
                          <p
                            className={`text-xs mb-2 ${mutedClass}`}
                          >
                            Selected poster:
                            {" "}
                            {poster.name}
                          </p>

                          <img
                            src={URL.createObjectURL(
                              poster
                            )}
                            alt="Selected event poster"
                            className="w-full h-40 object-cover rounded-xl border"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#3730a3] text-white font-semibold hover:bg-[#2f288e] transition shadow-md"
                    >
                      + Create Event
                    </button>

                  </form>
                </div>

                {/* MY EVENTS */}

                <div
                  className={`${cardClass} border rounded-2xl shadow-sm xl:col-span-2 overflow-hidden`}
                >
                  <div className="p-6 border-b border-inherit flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">
                        My Events
                      </h2>

                      <p
                        className={`text-sm mt-1 ${mutedClass}`}
                      >
                        Manage your created events.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu("Events")
                      }
                      className="px-4 py-2 rounded-xl bg-[#3730a3] text-white text-sm font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="p-6 space-y-4">

                    {filteredEvents
                      .slice(0, 5)
                      .map((event) => (
                        <div
                          key={event._id}
                          className={`border rounded-xl overflow-hidden ${
                            darkMode
                              ? "border-[#334155]"
                              : "border-slate-200"
                          }`}
                        >

                          {/* POSTER */}

                          {event.posterUrl && (
                            <img
                              src={getPosterUrl(
                                event.posterUrl
                              )}
                              alt={event.title}
                              className="w-full h-52 object-cover"
                              onError={(e) => {
                                console.error(
                                  "POSTER LOAD ERROR:",
                                  getPosterUrl(
                                    event.posterUrl
                                  )
                                );

                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          )}

                          <div className="p-4">

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                              <div>

                                <h3 className="font-semibold text-lg">
                                  {event.title}
                                </h3>

                                <p
                                  className={`text-sm mt-1 ${mutedClass}`}
                                >
                                  {event.location}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-3">

                                  <span className="px-3 py-1 rounded-full bg-[#eef0ff] text-[#3730a3] text-xs font-semibold">
                                    {event.category}
                                  </span>

                                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                    Capacity:{" "}
                                    {event.capacity === "-" ||
                                    event.capacity === null ||
                                    event.capacity === undefined
                                      ? "Open to All"
                                      : event.capacity}
                                  </span>

                                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                    {event.price === "-" ||
                                    event.price === null ||
                                    event.price === undefined
                                      ? "Free"
                                      : `₹${event.price}`}
                                  </span>

                                </div>

                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  event.status ===
                                  "approved"
                                    ? "bg-green-100 text-green-700"
                                    : event.status ===
                                      "pending"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {event.status}
                              </span>

                            </div>

                          </div>
                        </div>
                      ))}

                    {filteredEvents.length === 0 && (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined text-5xl text-slate-300">
                          event_busy
                        </span>

                        <p
                          className={`mt-3 ${mutedClass}`}
                        >
                          No events found.
                        </p>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </>
          )}

          {/* ========================= */}
          {/* EVENTS */}
          {/* ========================= */}

          {activeMenu === "Events" && (
            <div
              className={`${cardClass} border rounded-2xl shadow-sm overflow-hidden`}
            >

              <div className="p-6 border-b border-inherit flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold">
                    All My Events
                  </h2>

                  <p
                    className={`text-sm mt-1 ${mutedClass}`}
                  >
                    Manage capacity, fees,
                    participants and event status.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveMenu("Overview")
                  }
                  className="px-4 py-2 rounded-xl bg-[#3730a3] text-white text-sm font-semibold"
                >
                  + Create Event
                </button>

              </div>

              <div className="overflow-x-auto">

                {filteredEvents.length === 0 ? (
                  <div className="p-12 text-center">

                    <span className="material-symbols-outlined text-5xl text-slate-300">
                      event_busy
                    </span>

                    <p
                      className={`mt-3 ${mutedClass}`}
                    >
                      No events found.
                    </p>

                  </div>
                ) : (
                  <table className="w-full">

                    <thead>
                      <tr
                        className={
                          darkMode
                            ? "bg-[#111827]"
                            : "bg-[#f8f9ff]"
                        }
                      >

                        <th className="text-left px-6 py-4 text-xs uppercase">
                          Event
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase">
                          Date
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase">
                          Category
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase">
                          Capacity
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase">
                          Fee
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase">
                          Status
                        </th>

                        <th className="text-right px-6 py-4 text-xs uppercase">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredEvents.map(
                        (event) => (
                          <tr
                            key={event._id}
                            className="border-t border-inherit"
                          >

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                {/* SMALL POSTER */}

                                {event.posterUrl ? (
                                  <img
                                    src={getPosterUrl(
                                      event.posterUrl
                                    )}
                                    alt={event.title}
                                    className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                                    onError={(e) => {
  console.error("Poster failed to load:", e.currentTarget.src);
  e.currentTarget.style.display = "none";
}}
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-slate-400">
                                      image
                                    </span>
                                  </div>
                                )}

                                <div>
                                  <p className="font-semibold">
                                    {event.title}
                                  </p>

                                  <p
                                    className={`text-xs mt-1 ${mutedClass}`}
                                  >
                                    {event.location}
                                  </p>
                                </div>

                              </div>

                            </td>

                            <td
                              className={`px-6 py-4 text-sm ${mutedClass}`}
                            >
                              {event.date
                                ? new Date(
                                    event.date
                                  ).toLocaleString()
                                : "-"}
                            </td>

                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full bg-[#eef0ff] text-[#3730a3] text-xs font-semibold">
                                {event.category}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="font-semibold">
                                {event.capacity === "-" ||
                                event.capacity === null ||
                                event.capacity === undefined
                                  ? "Open to All"
                                  : event.capacity}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              {event.price === "-" ||
                              event.price === null ||
                              event.price === undefined
                                ? "Free"
                                : `₹${event.price}`}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  event.status ===
                                  "approved"
                                    ? "bg-green-100 text-green-700"
                                    : event.status ===
                                      "pending"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {event.status}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    loadParticipants(
                                      event._id
                                    )
                                  }
                                  className="px-3 py-2 rounded-lg bg-[#eef0ff] text-[#3730a3] text-xs font-semibold"
                                >
                                  Attendees
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    exportCsv(
                                      event._id
                                    )
                                  }
                                  className="px-3 py-2 rounded-lg bg-[#3730a3] text-white text-xs font-semibold"
                                >
                                  CSV
                                </button>

                              </div>
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>
                )}

              </div>
            </div>
          )}

          {/* ========================= */}
          {/* ATTENDEES */}
          {/* ========================= */}

          {activeMenu === "Attendees" && (
            <div
              className={`${cardClass} border rounded-2xl p-6 shadow-sm`}
            >

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

                <div>
                  <h2 className="text-2xl font-bold">
                    Attendees
                  </h2>

                  <p
                    className={`text-sm mt-1 ${mutedClass}`}
                  >
                    View participants registered
                    for your events.
                  </p>
                </div>

                {mine.length > 0 && (
                  <select
                    value={selectedEvent}
                    onChange={(e) =>
                      e.target.value &&
                      loadParticipants(
                        e.target.value
                      )
                    }
                    className={`px-4 py-3 rounded-xl border ${inputClass}`}
                  >

                    <option value="">
                      Select Event
                    </option>

                    {mine.map((event) => (
                      <option
                        key={event._id}
                        value={event._id}
                      >
                        {event.title}
                      </option>
                    ))}

                  </select>
                )}

              </div>

              {!selectedEvent ? (
                <div className="text-center py-16">

                  <span className="material-symbols-outlined text-6xl text-slate-300">
                    group
                  </span>

                  <p
                    className={`mt-3 ${mutedClass}`}
                  >
                    Select an event to view
                    attendees.
                  </p>

                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-16">

                  <span className="material-symbols-outlined text-6xl text-slate-300">
                    group_off
                  </span>

                  <p
                    className={`mt-3 ${mutedClass}`}
                  >
                    No participants registered
                    yet.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {participants.map(
                    (participant) => (
                      <div
                        key={participant._id}
                        className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border ${
                          darkMode
                            ? "border-[#334155]"
                            : "border-slate-200"
                        }`}
                      >

                        <div>
                          <p className="font-semibold">
                            {
                              participant
                                .user
                                ?.name
                            }
                          </p>

                          <p
                            className={`text-sm ${mutedClass}`}
                          >
                            {
                              participant
                                .user
                                ?.email
                            }
                          </p>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          {
                            participant.status
                          }
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          )}

          {/* ========================= */}
          {/* ANALYTICS */}
          {/* ========================= */}

          {activeMenu === "Analytics" && (
            <div className="space-y-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Analytics
                </h2>

                <p
                  className={`mt-1 ${mutedClass}`}
                >
                  Overview of your event
                  performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div
                  className={`${cardClass} border rounded-2xl p-6 shadow-sm`}
                >
                  <p
                    className={`text-sm ${mutedClass}`}
                  >
                    Total Events
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {mine.length}
                  </p>
                </div>

                <div
                  className={`${cardClass} border rounded-2xl p-6 shadow-sm`}
                >
                  <p
                    className={`text-sm ${mutedClass}`}
                  >
                    Total Capacity
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {analytics.totalCapacity}
                  </p>
                </div>

                <div
                  className={`${cardClass} border rounded-2xl p-6 shadow-sm`}
                >
                  <p
                    className={`text-sm ${mutedClass}`}
                  >
                    Approved Events
                  </p>

                  <p className="text-4xl font-bold mt-2">
                    {analytics.byStatus?.approved ||
                      0}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div
                  className={`${cardClass} border rounded-2xl p-6 shadow-sm`}
                >
                  <h3 className="text-lg font-bold mb-5">
                    Events by Status
                  </h3>

                  <div className="space-y-4">

                    {Object.entries(
                      analytics.byStatus
                    ).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">
                            {status}
                          </span>

                          <span className="font-bold">
                            {count}
                          </span>
                        </div>
                      )
                    )}

                  </div>
                </div>

                <div
                  className={`${cardClass} border rounded-2xl p-6 shadow-sm`}
                >
                  <h3 className="text-lg font-bold mb-5">
                    Events by Category
                  </h3>

                  <div className="space-y-4">

                    {Object.entries(
                      analytics.byCategory
                    ).map(
                      ([eventCategory, count]) => (
                        <div
                          key={eventCategory}
                          className="flex justify-between items-center"
                        >
                          <span>
                            {eventCategory}
                          </span>

                          <span className="font-bold">
                            {count}
                          </span>
                        </div>
                      )
                    )}

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================= */}
          {/* SETTINGS */}
          {/* ========================= */}

          {activeMenu === "Settings" && (
            <div
              className={`${cardClass} border rounded-2xl p-6 shadow-sm max-w-3xl`}
            >

              <h2 className="text-2xl font-bold">
                Settings
              </h2>

              <p
                className={`mt-1 mb-8 ${mutedClass}`}
              >
                Manage your dashboard preferences.
              </p>

              <div className="space-y-6">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h3 className="font-semibold">
                      Dark Mode
                    </h3>

                    <p
                      className={`text-sm ${mutedClass}`}
                    >
                      Change the appearance of
                      your dashboard.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setDarkMode(!darkMode)
                    }
                    className={`relative w-14 h-7 rounded-full transition ${
                      darkMode
                        ? "bg-[#3730a3]"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
                        darkMode
                          ? "left-8"
                          : "left-1"
                      }`}
                    />
                  </button>

                </div>

                <div className="border-t border-inherit pt-6">

                  <h3 className="font-semibold">
                    Account
                  </h3>

                  <p
                    className={`text-sm mt-1 ${mutedClass}`}
                  >
                    Logged in as{" "}
                    {user?.name}
                  </p>

                  <p
                    className={`text-sm ${mutedClass}`}
                  >
                    Role: {user?.role}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Logout
                </button>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}