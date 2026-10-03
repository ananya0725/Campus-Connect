import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Registration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Event initially sent from Home.jsx
  const initialEvent = location.state?.event;

  // Latest event data from backend
  const [event, setEvent] = useState(initialEvent || null);

  const [registered, setRegistered] = useState(
    Number(
      initialEvent?.registered ??
        initialEvent?.registrations ??
        0
    )
  );

  const [loadingEvent, setLoadingEvent] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    studentUsn: "",
    phoneNumber: "",
    transactionId: "",
  });

  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // GET EVENT ID
  // ==========================================================

  const eventId =
    initialEvent?._id ||
    initialEvent?.id;

  // ==========================================================
  // FETCH LATEST EVENT DATA
  // ==========================================================

  useEffect(() => {
    const fetchLatestEvent = async () => {
      if (!eventId) {
        setError(
          "No event selected. Please select an event from the Home page."
        );
        return;
      }

      try {
        setLoadingEvent(true);
        setError("");

        const response = await axios.get(
          `/api/events/${eventId}`
        );

        console.log(
          "LATEST EVENT RESPONSE:",
          response.data
        );

        const latestEvent =
          response.data?.event ||
          response.data;

        const latestRegistered = Number(
          response.data?.registrations ??
            latestEvent?.registered ??
            latestEvent?.registrations ??
            0
        );

        setEvent(latestEvent);
        setRegistered(latestRegistered);

      } catch (err) {
        console.error(
          "FETCH EVENT ERROR:",
          err
        );

        // If fetching fails, continue using Home.jsx data
        setRegistered(
          Number(
            initialEvent?.registered ??
              initialEvent?.registrations ??
              0
          )
        );
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchLatestEvent();
  }, [eventId]);

  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // HANDLE SCREENSHOT
  // ==========================================================

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setScreenshot(null);
      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Payment screenshot must be less than 5MB."
      );

      e.target.value = "";
      setScreenshot(null);
      return;
    }

    setScreenshot(file);
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = () => {
    navigate("/home");
  };

  // ==========================================================
  // SUBMIT REGISTRATION
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event) {
      setError("No event selected.");
      return;
    }

    // ========================================================
    // CHECK CAPACITY BEFORE SUBMIT
    // ========================================================

    const capacity = Number(event.capacity || 0);

    if (
      capacity > 0 &&
      registered >= capacity
    ) {
      setError(
        "This event is full. No seats are available."
      );
      return;
    }

    // ========================================================
    // BASIC VALIDATION
    // ========================================================

    if (!formData.studentName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.studentUsn.trim()) {
      alert("Please enter your USN.");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    // ========================================================
    // PAID EVENT VALIDATION
    // ========================================================

    const fee = Number(
      event.price || 0
    );

    if (fee > 0) {
      if (!formData.transactionId.trim()) {
        alert(
          "Please enter the transaction ID."
        );
        return;
      }

      if (!screenshot) {
        alert(
          "Please upload the payment screenshot."
        );
        return;
      }
    }

    // ========================================================
    // GET TOKEN
    // ========================================================

    try {
      setSubmitting(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          state: {
            from: "/home",
            message:
              "Please login to register for an event.",
          },
        });

        return;
      }

      const currentEventId =
        event._id || event.id;

      if (!currentEventId) {
        setError(
          "Event ID is missing."
        );
        return;
      }

      console.log(
        "REGISTERING EVENT ID:",
        currentEventId
      );

      // ======================================================
      // REGISTER EVENT
      // ======================================================

      const response = await axios.post(
        `/api/registrations/${currentEventId}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "REGISTRATION RESPONSE:",
        response.data
      );

      // ======================================================
      // UPDATE COUNT IMMEDIATELY
      // ======================================================

      if (
        response.data?.registeredCount !==
        undefined
      ) {
        setRegistered(
          Number(
            response.data.registeredCount
          )
        );
      } else {
        setRegistered(
          (prev) => prev + 1
        );
      }

      alert(
        "Registration successful!"
      );

      // ======================================================
      // GO TO STUDENT DASHBOARD
      // ======================================================

      navigate(
        "/student-dashboard"
      );

    } catch (err) {
      console.error(
        "REGISTRATION ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Unable to complete registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // NO EVENT
  // ==========================================================

  if (!event) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-4">

        <div className="bg-white rounded-xl border border-[#c8c4d5] shadow-lg p-8 max-w-lg w-full text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-[#151c27] mb-3">
            No Event Selected
          </h1>

          <p className="text-[#464553] mb-6">
            Please go back to the Home page and select an event to register.
          </p>

          <button
            onClick={() =>
              navigate("/home")
            }
            className="px-6 py-3 bg-[#1f108e] text-white rounded-lg font-semibold hover:bg-[#3730a3] transition"
          >
            Back to Events
          </button>

        </div>

      </div>
    );
  }

  // ==========================================================
  // EVENT INFORMATION
  // ==========================================================

  const fee = Number(
    event.price || 0
  );

  const capacity = Number(
    event.capacity || 0
  );

  const isFull =
    capacity > 0 &&
    registered >= capacity;

  const seatsText =
    capacity > 0
      ? `${registered} / ${capacity} Seats Filled`
      : "Open to All";

  
  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] min-h-screen flex items-center justify-center p-4 md:p-8 font-sans">

      <main className="w-full max-w-2xl mx-auto">

        <div className="bg-white/90 backdrop-blur-md border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-[#f0f3ff] px-6 md:px-8 py-4 border-b border-[#c8c4d5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

            <div className="flex items-center gap-4">

              {/* POSTER */}

              
                
              

              <div>

                <h1 className="text-2xl font-semibold text-[#1f108e]">
                  Event Registration
                </h1>

                <p className="text-sm text-[#464553] mt-1">
                  {event.title}
                </p>

              </div>

            </div>

            {/* =================================================
                SEATS
            ================================================= */}

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                isFull
                  ? "bg-red-100 border-red-200"
                  : "bg-[#8a0027]/10 border-[#8a0027]/20"
              }`}
            >

              <span className="material-symbols-outlined text-sm">
                group
              </span>

              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isFull
                    ? "text-red-700"
                    : "text-[#600019]"
                }`}
              >
                {loadingEvent
                  ? "Checking seats..."
                  : seatsText}
              </span>

            </div>

          </div>

          {/* =================================================
              FULL EVENT WARNING
          ================================================= */}

          {isFull && (
            <div className="mx-6 md:mx-8 mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined">
                  event_busy
                </span>

                <div>

                  <p className="font-semibold">
                    Event Full
                  </p>

                  <p className="text-sm mt-1">
                    All available seats for this event have been filled.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>

            <div className="p-6 md:p-8 space-y-8">

              {/* ERROR */}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* =================================================
                  STUDENT DETAILS
              ================================================= */}

              <section className="space-y-4">

                <h2 className="text-xl font-semibold text-[#151c27] border-b border-[#c8c4d5] pb-2">
                  Student Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* FULL NAME */}

                  <div className="space-y-1">

                    <label
                      htmlFor="studentName"
                      className="text-xs font-medium text-[#464553] block"
                    >
                      Full Name
                    </label>

                    <input
                      id="studentName"
                      name="studentName"
                      type="text"
                      placeholder="Jane Doe"
                      value={
                        formData.studentName
                      }
                      onChange={
                        handleChange
                      }
                      disabled={isFull}
                      className="w-full rounded-md px-3 py-3 text-base bg-white border border-[#d1d5db] focus:border-[#1f108e] focus:ring-2 focus:ring-[#1f108e]/20 focus:outline-none transition disabled:bg-gray-100"
                    />

                  </div>

                  {/* USN */}

                  <div className="space-y-1">

                    <label
                      htmlFor="studentUsn"
                      className="text-xs font-medium text-[#464553] block"
                    >
                      USN (University Seat Number)
                    </label>

                    <input
                      id="studentUsn"
                      name="studentUsn"
                      type="text"
                      placeholder="1XY20CS001"
                      value={
                        formData.studentUsn
                      }
                      onChange={
                        handleChange
                      }
                      disabled={isFull}
                      className="w-full rounded-md px-3 py-3 text-base bg-white border border-[#d1d5db] focus:border-[#1f108e] focus:ring-2 focus:ring-[#1f108e]/20 focus:outline-none transition disabled:bg-gray-100"
                    />

                  </div>

                </div>

                {/* PHONE */}

                <div className="space-y-1 w-full md:w-1/2">

                  <label
                    htmlFor="phoneNumber"
                    className="text-xs font-medium text-[#464553] block"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={
                      formData.phoneNumber
                    }
                    onChange={
                      handleChange
                    }
                    disabled={isFull}
                    className="w-full rounded-md px-3 py-3 text-base bg-white border border-[#d1d5db] focus:border-[#1f108e] focus:ring-2 focus:ring-[#1f108e]/20 focus:outline-none transition disabled:bg-gray-100"
                  />

                </div>

              </section>

              {/* =================================================
                  PAYMENT
              ================================================= */}

              <section className="space-y-4">

                <h2 className="text-xl font-semibold text-[#151c27] border-b border-[#c8c4d5] pb-2">
                  Payment Information
                </h2>

                {/* PAYMENT SUMMARY */}

                <div className="bg-[#f0f3ff] rounded-lg p-4 border border-[#c8c4d5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                  <div>

                    <p className="text-xs font-medium text-[#464553] uppercase tracking-wider">
                      Registration Fee
                    </p>

                    <p className="text-2xl font-semibold text-[#1f108e] mt-1">
                      {fee === 0
                        ? "Free"
                        : `₹${fee}`}
                    </p>

                  </div>

                  {fee > 0 && (
                    <div className="text-left sm:text-right">

                      <p className="text-xs text-[#464553]">
                        Pay via UPI
                      </p>

                      <p className="text-base font-medium text-[#151c27] mt-1 bg-[#e2e8f8] px-3 py-1 rounded inline-block">
                        campusconnect@upi
                      </p>

                    </div>
                  )}

                </div>

                {/* PAID EVENT FIELDS */}

                {fee > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                    {/* TRANSACTION ID */}

                    <div className="space-y-1">

                      <label
                        htmlFor="transactionId"
                        className="text-xs font-medium text-[#464553] block"
                      >
                        Transaction ID
                      </label>

                      <input
                        id="transactionId"
                        name="transactionId"
                        type="text"
                        placeholder="Enter UPI reference ID"
                        value={
                          formData.transactionId
                        }
                        onChange={
                          handleChange
                        }
                        disabled={isFull}
                        className="w-full rounded-md px-3 py-3 text-base bg-white border border-[#d1d5db] focus:border-[#1f108e] focus:ring-2 focus:ring-[#1f108e]/20 focus:outline-none transition disabled:bg-gray-100"
                      />

                    </div>

                    {/* SCREENSHOT */}

                    <div className="space-y-1">

                      <label className="text-xs font-medium text-[#464553] block">
                        Payment Screenshot
                      </label>

                      <label
                        htmlFor="screenshotUpload"
                        className={`border-2 border-dashed border-[#c8c4d5] rounded-md p-4 text-center transition-colors block ${
                          isFull
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-[#f0f3ff] cursor-pointer"
                        }`}
                      >

                        <span className="material-symbols-outlined text-[#777584] mb-2 text-2xl">
                          {screenshot
                            ? "check_circle"
                            : "cloud_upload"}
                        </span>

                        <p
                          className={`text-sm ${
                            screenshot
                              ? "text-[#1f108e] font-medium"
                              : "text-[#464553]"
                          }`}
                        >
                          {screenshot
                            ? screenshot.name
                            : "Click to upload or drag & drop"}
                        </p>

                        <p className="text-[10px] text-[#777584] mt-1">
                          PNG, JPG up to 5MB
                        </p>

                        <input
                          id="screenshotUpload"
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={
                            handleScreenshotChange
                          }
                          disabled={isFull}
                        />

                      </label>

                    </div>

                  </div>
                )}

                {/* FREE EVENT */}

                {fee === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">

                    <div className="flex items-center gap-2">

                      <span className="material-symbols-outlined text-green-600">
                        check_circle
                      </span>

                      <p className="text-sm text-green-700 font-medium">
                        This is a free event. No payment information is required.
                      </p>

                    </div>

                  </div>
                )}

              </section>

              {/* =================================================
                  EVENT INFORMATION
              ================================================= */}

              <section className="space-y-3">

                <h2 className="text-xl font-semibold text-[#151c27] border-b border-[#c8c4d5] pb-2">
                  Event Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#464553]">

                  <div className="flex items-center gap-2">

                    <span className="material-symbols-outlined text-[#1f108e]">
                      calendar_today
                    </span>

                    <span>
                      {event.date
                        ? new Date(
                            event.date
                          ).toLocaleString(
                            "en-IN",
                            {
                              dateStyle:
                                "medium",
                              timeStyle:
                                "short",
                            }
                          )
                        : "Date not available"}
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="material-symbols-outlined text-[#1f108e]">
                      location_on
                    </span>

                    <span>
                      {event.location ||
                        "Location not available"}
                    </span>

                  </div>

                </div>

              </section>

            </div>

            {/* =================================================
                FOOTER ACTIONS
            ================================================= */}

            <div className="bg-[#e7eefe] px-6 md:px-8 py-4 border-t border-[#c8c4d5] flex flex-col-reverse sm:flex-row justify-end gap-2">

              {/* CANCEL */}

              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="text-sm font-semibold text-[#1f108e] bg-transparent border border-transparent hover:bg-[#dce2f3] px-6 py-2.5 rounded-md transition-colors w-full sm:w-auto text-center disabled:opacity-50"
              >
                Cancel
              </button>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingEvent ||
                  isFull
                }
                className="text-sm font-semibold text-white bg-[#1f108e] hover:bg-[#3730a3] shadow-sm px-6 py-2.5 rounded-md transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {isFull ? (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      event_busy
                    </span>

                    Event Full
                  </>
                ) : submitting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>

                    Submitting...
                  </>
                ) : (
                  <>
                    <span>
                      Submit Registration
                    </span>

                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
};

export default Registration;