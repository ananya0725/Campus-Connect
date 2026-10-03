import { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function EventTicket({
  registration,
  user,
  onDownload,
  onReady,
}) {
  const ticketRef = useRef(null);

  const event = registration?.event;

  const eventDate = event?.date
    ? new Date(event.date)
    : null;

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) {
      return "Time unavailable";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#090014",
        padding: 20,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("l", "mm", "a4");

      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;

      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      const imgWidth = contentWidth;
      const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

      const x = margin;
      const y =
        margin + (contentHeight - imgHeight) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        x,
        y,
        imgWidth,
        imgHeight
      );

      const fileName = (
        event?.title || "Campus_Connect_Ticket"
      ).replace(/[^a-zA-Z0-9]/g, "_");

      pdf.save(`${fileName}_ticket.pdf`);

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error(
        "Ticket download error:",
        error
      );
    }
  };

  useEffect(() => {
    if (typeof onReady === "function") {
      onReady(downloadTicket);
    }
  }, [registration, onReady]);

  const studentName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Student";

  return (
    <div
      ref={ticketRef}
      className="mx-auto"
      style={{
        width: "980px",
        padding: "18px",
        background:
          "linear-gradient(135deg, #090014, #16002b, #090014)",
      }}
    >
      {/* MAIN TICKET */}
      <div
        className="relative overflow-hidden rounded-[28px] text-white"
        style={{
          minHeight: "400px",
          background:
            "linear-gradient(135deg, #16002f 0%, #3b0764 45%, #170052 100%)",
          boxShadow:
            "0 25px 70px rgba(0,0,0,0.5)",
        }}
      >

        {/* DECORATIVE GLOW */}
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(217,70,239,0.35), transparent 70%)",
          }}
        />

        <div
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)",
          }}
        />

        {/* CONTENT */}
        <div className="relative flex min-h-[400px]">

          {/* =========================
              LEFT MAIN TICKET
          ========================= */}
          <div className="flex-1 p-10">

            {/* HEADER */}
            <div className="flex items-start justify-between">

              <div>
                <div
                  className="text-3xl font-black tracking-wide"
                  style={{
                    textShadow:
                      "0 0 20px rgba(217,70,239,0.4)",
                  }}
                >
                  CAMPUS CONNECT
                </div>

                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-300">
                  Experience • Connect • Participate
                </div>
              </div>

              <div className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-fuchsia-200">
                Event Pass
              </div>

            </div>

            {/* EVENT TITLE */}
            <div className="mt-12">

              <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">
                You are invited to
              </div>

              <h1
                className="max-w-[620px] text-5xl font-black leading-tight"
                style={{
                  textShadow:
                    "0 0 25px rgba(217,70,239,0.25)",
                }}
              >
                {event?.title || "Campus Event"}
              </h1>

              <div className="mt-3 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-200">
                {event?.category || "Campus Event"}
              </div>

            </div>

            {/* EVENT DETAILS */}
            <div className="mt-10 flex gap-10">

              {/* DATE */}
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                  Date
                </div>

                <div className="text-2xl font-extrabold">
                  {formatDate(eventDate)}
                </div>
              </div>

              {/* TIME */}
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                  Time
                </div>

                <div className="text-2xl font-extrabold">
                  {formatTime(eventDate)}
                </div>
              </div>

            </div>

            {/* VENUE */}
            <div className="mt-7">

              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                Venue
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-fuchsia-500/15 text-lg">
                  📍
                </div>

                <div className="text-lg font-semibold">
                  {event?.location ||
                    "Venue unavailable"}
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="absolute bottom-8 left-10 right-10 border-t border-white/10 pt-4">

              <div className="flex items-center justify-between">

                <div className="text-xs text-purple-200">
                  Present this pass at the entrance
                </div>

                <div className="text-xs font-bold tracking-widest text-fuchsia-300">
                  CC • 2026
                </div>

              </div>

            </div>

          </div>


          {/* =========================
              PERFORATION
          ========================= */}
          <div className="relative w-[3px] bg-white/10">

            {/* DOTTED CUT LINE */}
            <div className="absolute inset-y-6 left-0 border-l-2 border-dashed border-fuchsia-300/50" />

            {/* TOP CUT CIRCLE */}
            <div className="absolute -left-[13px] -top-[13px] h-6 w-6 rounded-full bg-[#090014]" />

            {/* BOTTOM CUT CIRCLE */}
            <div className="absolute -bottom-[13px] -left-[13px] h-6 w-6 rounded-full bg-[#090014]" />

          </div>


          {/* =========================
              RIGHT QR SECTION
          ========================= */}
          <div
            className="flex w-[310px] flex-col items-center p-8"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(30,27,75,0.95))",
            }}
          >

            {/* QR HEADER */}
            <div className="text-center">

              <div className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">
                Entry Pass
              </div>

              <div className="mt-1 text-[11px] text-purple-200">
                Scan QR for event details
              </div>

            </div>


            {/* QR */}
            <div
              className="mt-7 rounded-3xl bg-white p-4"
              style={{
                boxShadow:
                  "0 0 35px rgba(217,70,239,0.25)",
              }}
            >
              {registration?.qrCodeDataUrl ? (
                <img
                  src={registration.qrCodeDataUrl}
                  alt="Event QR Code"
                  className="h-44 w-44 object-contain"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center text-center text-xs text-gray-500">
                  QR Code
                  <br />
                  unavailable
                </div>
              )}
            </div>


            {/* SCAN TEXT */}
            <div className="mt-5 text-center">

              <div className="text-sm font-bold">
                Scan to verify
              </div>

              <div className="mt-1 text-[10px] text-purple-300">
                Event name • Date • Venue
              </div>

            </div>


            {/* STUDENT */}
            <div className="mt-7 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-center">

              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                Participant
              </div>

              <div className="mt-2 text-lg font-extrabold">
                {studentName}
              </div>

              <div className="mt-1 text-[10px] text-purple-300">
                Registered Participant
              </div>

            </div>


            {/* FOOTER */}
            <div className="mt-auto text-center">

              <div className="text-xs font-bold text-purple-200">
                CAMPUS CONNECT
              </div>

              <div className="mt-1 text-[9px] text-purple-400">
                Your campus. Your events. Your experience.
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}