
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    /*
      CAPACITY LOGIC

      "-"     = Open to All
      number  = Limited capacity

      Example:
      capacity: "-"
      capacity: 100
    */
    capacity: {
      type: mongoose.Schema.Types.Mixed,
      default: "-",
    },

    /*
      PRICE LOGIC

      "-"     = Free
      number  = Paid event

      Example:
      price: "-"
      price: 100
    */
    price: {
      type: mongoose.Schema.Types.Mixed,
      default: "-",
    },

    posterUrl: {
      type: String,
      default: "",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
