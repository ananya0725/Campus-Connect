
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

/*
========================================================
CREATE EVENT
========================================================
*/
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      location,
      capacity: rawCapacity,
      price: rawPrice,
    } = req.body;
    console.log("🔥 BACKEND RAW CAPACITY =", rawCapacity);
    /*
    ======================================================
    BASIC VALIDATION
    ======================================================
    */

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event title is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event description is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event category is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Event date is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event location is required",
      });
    }

    /*
    ======================================================
    CAPACITY LOGIC

    "-"     = Open to All
    number  = Limited capacity
    ======================================================
    */

    let capacity = "-";

    if (
      rawCapacity === undefined ||
      rawCapacity === null ||
      rawCapacity === "" ||
      rawCapacity === "-" ||
      rawCapacity === "Open to All"
    ) {
      // Open to All
      capacity = "-";
    } else {
      const numericCapacity = Number(rawCapacity);

      if (
        !Number.isFinite(numericCapacity) ||
        numericCapacity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be greater than 0",
        });
      }

      capacity = numericCapacity;
    }

    /*
    ======================================================
    PRICE LOGIC

    "-"     = Free
    number  = Paid
    ======================================================
    */

    let price = "-";

    if (
      rawPrice === undefined ||
      rawPrice === null ||
      rawPrice === "" ||
      rawPrice === "-" ||
      rawPrice === "Free"
    ) {
      // Free event
      price = "-";
    } else {
      const numericPrice = Number(rawPrice);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be 0 or greater",
        });
      }

      /*
        If the organizer enters 0,
        treat it as a free event.
      */
      if (numericPrice === 0) {
        price = "-";
      } else {
        price = numericPrice;
      }
    }

    /*
    ======================================================
    POSTER
    ======================================================
    */

    let posterUrl = "";

if (req.file) {
  posterUrl = `/uploads/${req.file.filename}`;
}

    /*
    ======================================================
    ORGANIZER
    ======================================================
    */

    const organizerId =
      req.user?._id || req.user?.id;

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Organizer authentication required",
      });
    }

    /*
    ======================================================
    CREATE EVENT
    ======================================================
    */

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      date,
      location: location.trim(),

      /*
        "-" = Open to All
        number = Limited
      */
      capacity,

      /*
        "-" = Free
        number = Paid
      */
      price,

      posterUrl,

      organizer: organizerId,

      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(
      "CREATE EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create event",
    });
  }
};


/*
========================================================
UPDATE EVENT
========================================================
*/
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      category,
      date,
      location,
      capacity: rawCapacity,
      price: rawPrice,
    } = req.body;

    /*
    ======================================================
    FIND EVENT
    ======================================================
    */

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    /*
    ======================================================
    CAPACITY LOGIC

    "-"     = Open to All
    number  = Limited capacity
    ======================================================
    */

    let capacity = event.capacity ?? "-";

    /*
      Only change capacity if frontend
      actually sends it.
    */
    if (rawCapacity !== undefined) {
      if (
        rawCapacity === null ||
        rawCapacity === "" ||
        rawCapacity === "-" ||
        rawCapacity === "Open to All"
      ) {
        capacity = "-";
      } else {
        const numericCapacity =
          Number(rawCapacity);

        if (
          !Number.isFinite(
            numericCapacity
          ) ||
          numericCapacity < 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Capacity must be greater than 0",
          });
        }

        capacity = numericCapacity;
      }
    }

    /*
    ======================================================
    PRICE LOGIC

    "-"     = Free
    number  = Paid
    ======================================================
    */

    let price = event.price ?? "-";

    if (rawPrice !== undefined) {
      if (
        rawPrice === null ||
        rawPrice === "" ||
        rawPrice === "-" ||
        rawPrice === "Free"
      ) {
        price = "-";
      } else {
        const numericPrice =
          Number(rawPrice);

        if (
          !Number.isFinite(
            numericPrice
          ) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Price must be 0 or greater",
          });
        }

        if (numericPrice === 0) {
          price = "-";
        } else {
          price = numericPrice;
        }
      }
    }

    /*
    ======================================================
    UPDATE FIELDS
    ======================================================
    */

    if (title !== undefined) {
      event.title = title.trim();
    }

    if (description !== undefined) {
      event.description =
        description.trim();
    }

    if (category !== undefined) {
      event.category =
        category.trim();
    }

    if (date !== undefined) {
      event.date = date;
    }

    if (location !== undefined) {
      event.location =
        location.trim();
    }

    event.capacity = capacity;
    event.price = price;

    /*
    ======================================================
    POSTER UPDATE
    ======================================================
    */
     if (req.file) {
  event.posterUrl = `/uploads/${req.file.filename}`;
}

    /*
    ======================================================
    SAVE
    ======================================================
    */

    const updatedEvent =
      await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(
      "UPDATE EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update event",
    });
  }
};


/*
========================================================
DELETE EVENT
========================================================
*/
export const deleteEvent = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const event =
      await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete event",
    });
  }
};


/*
========================================================
LIST EVENTS
========================================================
*/
export const listEvents = async (
  req,
  res
) => {
  try {
    const {
      q,
      category,
      status,
      organizer,
    } = req.query;

    const filter = {};

    /*
    SEARCH
    */
    if (q && q.trim()) {
      filter.$or = [
        {
          title: {
            $regex: q.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: q.trim(),
            $options: "i",
          },
        },
        {
          location: {
            $regex: q.trim(),
            $options: "i",
          },
        },
      ];
    }

    /*
    CATEGORY
    */
    if (
      category &&
      category !== "All"
    ) {
      filter.category = category;
    }

    /*
    STATUS
    */
    if (status) {
      filter.status = status;
    }

    /*
    ORGANIZER
    */
    if (organizer) {
      filter.organizer = organizer;
    }

    /*
    GET EVENTS
    */

    const events =
      await Event.find(filter)
        .populate(
          "organizer",
          "name email"
        )
        .sort({
          date: 1,
        })
        .lean();

    /*
    ======================================================
    REGISTRATION COUNTS
    ======================================================
    */

    const eventsWithCounts =
      await Promise.all(
        events.map(
          async (event) => {
            const registrationCount =
              await Registration.countDocuments(
                {
                  event: event._id,
                  status: {
                    $ne: "cancelled",
                  },
                }
              );

            return {
              ...event,

              /*
                Keep "-" for Open to All.
                Keep number for limited events.
              */
              capacity:
                event.capacity ?? "-",

              /*
                Keep "-" for free events.
              */
              price:
                event.price ?? "-",

              registrationCount,
            };
          }
        )
      );

    return res.status(200).json({
      success: true,
      count: eventsWithCounts.length,
      events: eventsWithCounts,
    });
  } catch (error) {
    console.error(
      "LIST EVENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load events",
    });
  }
};


/*
========================================================
GET SINGLE EVENT
========================================================
*/
export const getEvent = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const event =
      await Event.findById(id)
        .populate(
          "organizer",
          "name email"
        )
        .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    /*
    ======================================================
    REGISTRATION COUNT
    ======================================================
    */

    const registrationCount =
      await Registration.countDocuments(
        {
          event: event._id,
          status: {
            $ne: "cancelled",
          },
        }
      );

    return res.status(200).json({
      success: true,

      event: {
        ...event,

        capacity:
          event.capacity ?? "-",

        price:
          event.price ?? "-",

        registrationCount,
      },

      registrations:
        registrationCount,
    });
  } catch (error) {
    console.error(
      "GET EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to get event",
    });
  }
};
