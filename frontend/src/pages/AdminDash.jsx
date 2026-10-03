import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("Overview");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD EVENTS
  // =========================
  const loadEvents = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/events");

      console.log("ADMIN EVENTS:", response.data);

      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // =========================
  // EVENT COUNTS
  // =========================
  const totalEvents = events.length;

  const pendingEvents = events.filter(
    (event) => event.status === "pending"
  );

  const approvedEvents = events.filter(
    (event) => event.status === "approved"
  );

  const rejectedEvents = events.filter(
    (event) => event.status === "rejected"
  );

  // =========================
  // APPROVE EVENT
  // =========================
  const approveEvent = async (eventId) => {
  try {
    await axios.post(
      `/api/admin/events/${eventId}/approve`
    );

    alert("Event approved successfully");

    await loadEvents();
  } catch (error) {
    console.error("Approve event error:", error);

    alert(
      error.response?.data?.message ||
        "Unable to approve event"
    );
  }
};

  // =========================
  // REJECT EVENT
  // =========================
  const rejectEvent = async (eventId) => {
  try {
    await axios.post(
      `/api/admin/events/${eventId}/reject`
    );

    alert("Event rejected successfully");

    await loadEvents();
  } catch (error) {
    console.error("Reject event error:", error);

    alert(
      error.response?.data?.message ||
        "Unable to reject event"
    );
  }
};

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT TIME
  // =========================
  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // FEE DISPLAY
  // =========================
  const displayFee = (event) => {
    const fee = Number(event.price || 0);

    if (fee === 0) {
      return "Free";
    }

    return `₹${fee}`;
  };

  // =========================
  // CAPACITY DISPLAY
  // =========================
  const displayCapacity = (event) => {
    if (
      event.capacity === 0 ||
      event.capacity === null ||
      event.capacity === undefined
    ) {
      return "Open to All";
    }

    return event.capacity;
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#151c27]">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#f0f3ff] border-r border-[#c8c4d5] flex flex-col p-4 z-40">

        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-[#3730a3] flex items-center justify-center text-white">
            <span className="text-lg font-bold">
              CC
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#1f108e]">
              Admin Panel
            </h2>

            <p className="text-xs text-[#464553]">
              Manage Campus Events
            </p>
          </div>

        </div>

        {/* NAVIGATION */}
        <div className="flex-grow space-y-2">

          {/* OVERVIEW */}
          <button
            onClick={() => setActivePage("Overview")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${
              activePage === "Overview"
                ? "bg-[#3730a3] text-white"
                : "text-[#464553] hover:bg-[#dce2f3]"
            }`}
          >
            <span className="text-xl">
              ▦
            </span>

            <span className="font-semibold">
              Overview
            </span>
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => setActivePage("Settings")}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${
              activePage === "Settings"
                ? "bg-[#3730a3] text-white"
                : "text-[#464553] hover:bg-[#dce2f3]"
            }`}
          >
            <span className="text-xl">
              ⚙
            </span>

            <span className="font-semibold">
              Settings
            </span>
          </button>

        </div>

        {/* LOGOUT */}
        <div className="border-t border-[#c8c4d5] pt-4">

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[#464553] hover:bg-[#dce2f3]"
          >
            <span className="text-xl">
              ↪
            </span>

            <span className="font-semibold">
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="ml-64 min-h-screen p-8">

        <div className="max-w-[1280px] mx-auto">

          {/* ==================================================
              OVERVIEW
          ================================================== */}
          {activePage === "Overview" && (
            <>

              {/* PAGE HEADER */}
              <div className="mb-8 border-b border-[#c8c4d5] pb-5">

                <h1 className="text-3xl font-bold text-[#151c27]">
                  Admin Overview
                </h1>

                <p className="mt-1 text-[#464553]">
                  Review and manage campus event requests.
                </p>

              </div>

              {/* =========================
                  STAT CARDS
              ========================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                {/* TOTAL EVENTS */}
                <div className="bg-white rounded-xl border border-[#c8c4d5] p-5 shadow-sm">

                  <p className="text-sm text-[#464553]">
                    Total Events
                  </p>

                  <h2 className="text-3xl font-bold text-[#1f108e] mt-2">
                    {totalEvents}
                  </h2>

                </div>

                {/* PENDING */}
                <div className="bg-white rounded-xl border border-[#c8c4d5] p-5 shadow-sm">

                  <p className="text-sm text-[#464553]">
                    Pending Events
                  </p>

                  <h2 className="text-3xl font-bold text-orange-600 mt-2">
                    {pendingEvents.length}
                  </h2>

                </div>

                {/* APPROVED */}
                <div className="bg-white rounded-xl border border-[#c8c4d5] p-5 shadow-sm">

                  <p className="text-sm text-[#464553]">
                    Approved Events
                  </p>

                  <h2 className="text-3xl font-bold text-green-600 mt-2">
                    {approvedEvents.length}
                  </h2>

                </div>

                {/* REJECTED */}
                <div className="bg-white rounded-xl border border-[#c8c4d5] p-5 shadow-sm">

                  <p className="text-sm text-[#464553]">
                    Rejected Events
                  </p>

                  <h2 className="text-3xl font-bold text-red-600 mt-2">
                    {rejectedEvents.length}
                  </h2>

                </div>

              </div>

              {/* =========================
                  PENDING EVENTS
              ========================= */}
              <div className="bg-white rounded-xl border border-[#c8c4d5] shadow-sm overflow-hidden">

                {/* TABLE HEADER */}
                <div className="p-5 border-b border-[#c8c4d5] flex justify-between items-center">

                  <div>

                    <h2 className="text-xl font-semibold">
                      Pending Event Approvals
                    </h2>

                    <p className="text-sm text-[#464553] mt-1">
                      Review events submitted by organizers.
                    </p>

                  </div>

                  <span className="bg-[#ffdadb] text-[#92002a] px-3 py-1 rounded-full text-sm font-semibold">
                    {pendingEvents.length} Pending
                  </span>

                </div>

                {/* LOADING */}
                {loading ? (
                  <div className="p-10 text-center text-[#464553]">
                    Loading events...
                  </div>
                ) : pendingEvents.length === 0 ? (
                  <div className="p-10 text-center">

                    <div className="text-4xl mb-3">
                      ✓
                    </div>

                    <p className="font-semibold text-lg">
                      No pending events
                    </p>

                    <p className="text-sm text-[#464553] mt-1">
                      All event requests have been reviewed.
                    </p>

                  </div>
                ) : (

                  /* =========================
                     TABLE
                  ========================= */
                  <div className="overflow-x-auto">

                    <table className="w-full text-left">

                      <thead>

                        <tr className="bg-[#f0f3ff] border-b border-[#c8c4d5]">

                          <th className="p-4 text-sm font-semibold">
                            Event Name
                          </th>

                          <th className="p-4 text-sm font-semibold">
                            Organizer
                          </th>

                          <th className="p-4 text-sm font-semibold">
                            Date & Time
                          </th>

                          <th className="p-4 text-sm font-semibold">
                            Category
                          </th>

                          <th className="p-4 text-sm font-semibold">
                            Capacity
                          </th>

                          <th className="p-4 text-sm font-semibold">
                            Fee
                          </th>

                          <th className="p-4 text-sm font-semibold text-right">
                            Actions
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {pendingEvents.map((event) => (

                          <tr
                            key={event._id}
                            className="border-b border-[#c8c4d5] hover:bg-[#f9f9ff]"
                          >

                            {/* EVENT */}
                            <td className="p-4">

                              <div className="font-semibold text-[#1f108e]">
                                {event.title}
                              </div>

                              <div className="text-xs text-[#464553] mt-1">
                                {event.location}
                              </div>

                            </td>

                            {/* ORGANIZER */}
                            <td className="p-4 text-sm">

                              {event.organizer?.name ||
                                "Organizer"}

                            </td>

                            {/* DATE */}
                            <td className="p-4 text-sm">

                              <div>
                                {formatDate(event.date)}
                              </div>

                              <div className="text-xs text-[#464553] mt-1">
                                {formatTime(event.date)}
                              </div>

                            </td>

                            {/* CATEGORY */}
                            <td className="p-4">

                              <span className="px-2 py-1 rounded bg-[#e2dfff] text-[#3730a3] text-xs font-semibold">
                                {event.category}
                              </span>

                            </td>

                            {/* CAPACITY */}
                            <td className="p-4 text-sm font-medium">
                              {displayCapacity(event)}
                            </td>

                            {/* FEE */}
                            <td className="p-4 text-sm font-medium">
                              {displayFee(event)}
                            </td>

                            {/* ACTIONS */}
                            <td className="p-4 text-right">

                              <div className="flex justify-end gap-2">

                                {/* APPROVE */}
                                <button
                                  onClick={() =>
                                    approveEvent(event._id)
                                  }
                                  className="w-9 h-9 rounded-lg bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition flex items-center justify-center font-bold"
                                  title="Approve Event"
                                >
                                  ✓
                                </button>

                                {/* REJECT */}
                                <button
                                  onClick={() =>
                                    rejectEvent(event._id)
                                  }
                                  className="w-9 h-9 rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition flex items-center justify-center font-bold"
                                  title="Reject Event"
                                >
                                  ✕
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </>
          )}

          {/* ==================================================
              SETTINGS
          ================================================== */}
          {activePage === "Settings" && (
            <>

              <div className="border-b border-[#c8c4d5] pb-5 mb-8">

                <h1 className="text-3xl font-bold">
                  Settings
                </h1>

                <p className="mt-1 text-[#464553]">
                  Manage your admin dashboard settings.
                </p>

              </div>

              <div className="bg-white rounded-xl border border-[#c8c4d5] p-6 shadow-sm max-w-3xl">

                <h2 className="text-xl font-semibold mb-6">
                  Dashboard Settings
                </h2>

                <div className="space-y-5">

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Dashboard Name
                    </label>

                    <input
                      type="text"
                      value="Campus Connect Admin Panel"
                      readOnly
                      className="w-full border border-[#c8c4d5] rounded-lg px-4 py-3 bg-[#f9f9ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Role
                    </label>

                    <input
                      type="text"
                      value="Administrator"
                      readOnly
                      className="w-full border border-[#c8c4d5] rounded-lg px-4 py-3 bg-[#f9f9ff]"
                    />
                  </div>

                  <div className="pt-3">

                    <button
                      onClick={() =>
                        alert("Settings saved")
                      }
                      className="bg-[#3730a3] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#1f108e] transition"
                    >
                      Save Settings
                    </button>

                  </div>

                </div>

              </div>

            </>
          )}

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;