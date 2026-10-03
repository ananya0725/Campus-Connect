import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import { generateQRCodeDataUrl } from "../utils/qrcode.js";
import { sendEmail } from "../utils/email.js";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";

// ==========================
// REGISTER FOR EVENT
// ==========================
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    // Check event
    if (!event || event.status !== "approved") {
      return res.status(400).json({
        message: "Event not available",
      });
    }

    // ==========================
    // CHECK DUPLICATE REGISTRATION
    // ==========================
    const existingRegistration = await Registration.findOne({
      user: req.user.id,
      event: event._id,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You are already registered for this event.",
      });
    }

    // ==========================
    // COUNT CURRENT REGISTRATIONS
    // ==========================
    const currentRegistrations =
      await Registration.countDocuments({
        event: event._id,
        status: { $ne: "cancelled" },
      });

    // ==========================
    // CHECK EVENT CAPACITY
    // ==========================
    if (
      event.capacity !== null &&
      event.capacity !== undefined &&
      currentRegistrations >= event.capacity
    ) {
      return res.status(400).json({
        message:
          "This event is full. No seats are available.",
      });
    }

    // ==========================
    // QR CODE CONTENT
    // ==========================
    const formattedDate = new Date(
      event.date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const qrPayload =
      `Campus Connect\n` +
      `Event: ${event.title}\n` +
      `Date: ${formattedDate}\n` +
      `Venue: ${event.location}`;

    const qrCodeDataUrl =
      await generateQRCodeDataUrl(qrPayload);

    // ==========================
    // CREATE REGISTRATION
    // ==========================
    const reg = await Registration.create({
      user: req.user.id,
      event: event._id,
      qrCodeDataUrl,
    });

    // ==========================
    // GET UPDATED COUNT
    // ==========================
    const updatedCount =
      await Registration.countDocuments({
        event: event._id,
        status: { $ne: "cancelled" },
      });

    // ==========================
    // SEND EMAIL
    // ==========================
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Registered: ${event.title}`,
        html: `
          <p>
            You are successfully registered for
            <strong>${event.title}</strong>.
          </p>

          <p>
            Date: ${formattedDate}
          </p>

          <p>
            Venue: ${event.location}
          </p>
        `,
      });
    } catch (emailError) {
      console.log(
        "Email could not be sent:",
        emailError.message
      );
    }

    // ==========================
    // RESPONSE
    // ==========================
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      registration: reg,
      registeredCount: updatedCount,
    });

  } catch (err) {
    console.error(
      "REGISTER EVENT ERROR:",
      err
    );

    // Handle duplicate registration
    if (err.code === 11000) {
      return res.status(409).json({
        message:
          "You are already registered for this event.",
      });
    }

    return res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================
// MY REGISTRATIONS
// ==========================
export const myRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({
      user: req.user.id,
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      registrations: regs,
    });

  } catch (err) {
    console.error(
      "MY REGISTRATIONS ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================
// PARTICIPANTS
// ==========================
export const participantsForEvent = async (
  req,
  res
) => {
  try {
    const regs = await Registration.find({
      event: req.params.id,
    }).populate(
      "user",
      "name email"
    );

    res.json({
      success: true,
      participants: regs,
    });

  } catch (err) {
    console.error(
      "PARTICIPANTS ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================
// CHECK-IN
// ==========================
export const checkInParticipant = async (
  req,
  res
) => {
  try {
    const reg =
      await Registration.findOneAndUpdate(
        {
          user: req.body.userId,
          event: req.params.id,
        },
        {
          status: "attended",
          checkedInAt: new Date(),
        },
        {
          new: true,
        }
      );

    if (!reg) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    res.json({
      success: true,
      registration: reg,
    });

  } catch (err) {
    console.error(
      "CHECK-IN ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================
// EXPORT PARTICIPANTS CSV
// ==========================
export const exportParticipantsCsv = async (
  req,
  res
) => {
  try {
    const regs =
      await Registration.find({
        event: req.params.id,
      }).populate(
        "user",
        "name email"
      );

    const rows = regs.map((r) => ({
      name: r.user?.name || "",
      email: r.user?.email || "",
      status: r.status,
      registeredAt: r.createdAt,
    }));

    const filePath = path.join(
      process.cwd(),
      `participants-${req.params.id}.csv`
    );

    const csvWriter =
      createObjectCsvWriter({
        path: filePath,

        header: [
          {
            id: "name",
            title: "Name",
          },
          {
            id: "email",
            title: "Email",
          },
          {
            id: "status",
            title: "Status",
          },
          {
            id: "registeredAt",
            title: "Registered At",
          },
        ],
      });

    await csvWriter.writeRecords(rows);

    res.download(filePath);

  } catch (err) {
    console.error(
      "EXPORT CSV ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================
// DELETE / CANCEL REGISTRATION
// ==========================
export const cancelRegistration = async (
  req,
  res
) => {
  try {
    const deleted =
      await Registration.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        message:
          "Registration not found",
      });
    }

    res.json({
      success: true,
      message:
        "Registration deleted successfully",
    });

  } catch (err) {
    console.error(
      "CANCEL REGISTRATION ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};