const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const CourtRoomBooking = require("../models/courtRoomBooking");
const CourtroomUser = require("../models/CourtroomUser");
const { comparePassword, generateToken } = require("../utils/coutroom/auth");
const CourtroomHistory = require("../models/courtRoomHistory");
const ContactUs = require("../models/contact");
const {
  sendAdminContactUsNotification,
} = require("../utils/coutroom/sendEmail");
const TrailCourtRoomBooking = require("../models/trailCourtRoomBooking");
const TrailCourtroomUser = require("../models/trailCourtRoomUser");
const TrailCourtroomHistory = require("../models/trailCourtRoomHistory");
const TrailBooking = require("../models/trailBookingAllow");
const TrialCourtroomCoupon = require("../models/trialCourtroomCoupon");
const TrailCourtroomUser2 = require("../models/trialCourtroomUser2");
const { COURTROOM_API_ENDPOINT } = process.env;

const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

let storage;
if (process.env.NODE_ENV !== "production") {
  // Google Cloud Storage configuration
  storage = new Storage({
    keyFilename: path.join(
      __dirname + "/voltaic-charter-435107-j5-d041d0de66bf.json"
    ), // Replace with your service account key file path
  });
} else {
  // Google Cloud Storage configuration
  storage = new Storage({
    keyFilename: path.join(
      "/etc/secrets/voltaic-charter-435107-j5-d041d0de66bf.json"
    ), // Replace with your service account key file path
  });
}

console.log(
  path.join(__dirname + "/voltaic-charter-435107-j5-d041d0de66bf.json")
);
console.log("/etc/secrets/voltaic-charter-435107-j5-d041d0de66bf.json");

const bucketName = "ai_courtroom"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

async function addContactUsQuery(
  firstName,
  lastName,
  email,
  phoneNumber,
  preferredContactMode,
  businessName,
  query
) {
  try {
    // Create a new contact us query
    const newContactUsQuery = new ContactUs({
      firstName,
      lastName,
      email,
      phoneNumber,
      preferredContactMode,
      businessName,
      query,
      queryPushedToEmail: true, // Flag to indicate if the query was pushed to the email
    });

    // Save the new contact us query
    await newContactUsQuery.save();

    await sendAdminContactUsNotification({
      firstName,
      lastName,
      email,
      phoneNumber,
      preferredContactMode,
      businessName,
      query,
    });

    console.log(newContactUsQuery);

    return newContactUsQuery;
  } catch (error) {
    console.log(error.message);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function createCourtRoomUser(
  name,
  phoneNumber,
  email,
  hashedPassword,
  recording,
  caseOverview
) {
  // Create a new courtroom user
  const newCourtroomUser = new TrailCourtroomUser({
    name,
    phoneNumber,
    email,
    password: hashedPassword,
    recording: recording, // Assuming recording is required and set to true
    caseOverview: "NA",
  });

  console.log(newCourtroomUser);

  // Save the new courtroom user
  const savedCourtroomUser = await newCourtroomUser.save();

  console.log(savedCourtroomUser);

  return savedCourtroomUser._id;
}

async function adminCourtRoomBook(
  name,
  phoneNumber,
  email,
  hashedPassword,
  bookingDate,
  hour,
  recording,
  caseOverview
) {
  console.log("Here is caseOverview", caseOverview);
  try {
    // // Check if the booking date and hour fall within the allowed slots
    // const trailBooking = await TrailBooking.findOne({
    //   date: bookingDate,
    //   startSlot: { $lte: hour },
    //   endSlot: { $gte: hour },
    //   phoneNumber: phoneNumber,
    //   email: email,
    // });

    // if (!trailBooking) {
    //   console.log(
    //     `User with phone number ${phoneNumber} or email ${email} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`
    //   );
    //   return `User with phone number ${phoneNumber} or email ${email} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`;
    // }

    // Find existing booking for the same date and hour
    let booking = await TrailCourtRoomBooking.findOne({
      date: bookingDate,
      hour: hour,
    }).populate("courtroomBookings");

    if (!booking) {
      // Create a new booking if it doesn't exist
      booking = new TrailCourtRoomBooking({
        date: bookingDate,
        hour: hour,
        courtroomBookings: [],
      });
    }

    // Check if the total bookings exceed the limit
    if (booking.courtroomBookings.length >= 4) {
      console.log(
        `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // Check if the user with the same mobile number or email already booked a slot at the same hour
    const existingBooking = booking.courtroomBookings.find(
      (courtroomBooking) =>
        courtroomBooking.phoneNumber == phoneNumber ||
        courtroomBooking.email == email
    );

    console.log(existingBooking);

    if (existingBooking) {
      console.log(
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // Create a new courtroom user
    const newCourtroomUser = new TrailCourtroomUser({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
      recording: recording, // Assuming recording is required and set to true
      caseOverview: "NA",
    });

    console.log(newCourtroomUser);

    // Save the new courtroom user
    const savedCourtroomUser = await newCourtroomUser.save();

    console.log(savedCourtroomUser);

    // Add the new booking
    booking.courtroomBookings.push(savedCourtroomUser._id);

    // Save the booking
    await booking.save();
    console.log("Booking saved.");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error.");
  }
}

async function courtRoomBook(
  // name,
  // phoneNumber,
  // email,
  hashedPassword,
  bookingDate,
  hour,
  CouponCode,
  recording
  // caseOverview
) {
  // console.log("Here is caseOverview", caseOverview);
  try {
    console.log(bookingDate);
    // Find a TrailBooking that matches the date and hour for the user
    const trailBooking = await TrialCourtroomCoupon.findOne({
      CouponCode: CouponCode,
      StartDate: { $lte: bookingDate },
      EndDate: { $gte: bookingDate },
      // StartHour: { $lte: hour },
      // EndHour: { $gt: hour },
      // phoneNumber: phoneNumber,
      // email: email,
    });

    console.log(trailBooking);

    if (
      !trailBooking ||
      trailBooking?.totalSlots <= trailBooking?.bookedSlots
    ) {
      console.log(
        `User with CouponCode ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `User with CouponCode ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // Find existing booking for the same date and hour
    let booking = await TrialCourtroomCoupon.findOne({
      CouponCode: CouponCode,
      StartDate: { $lte: bookingDate },
      EndDate: { $gte: bookingDate },
    }).populate("courtroomBookings");

    console.log(booking);

    if (!booking) {
      console.log(
        `User with CouponCode ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `User with CouponCode ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // // Check if the total bookings exceed the limit
    // if (booking.courtroomBookings.length >= 4) {
    //   console.log(
    //     `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`
    //   );
    //   return `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`;
    // }

    // Check if the user with the same mobile number or email already booked a slot at the same hour
    const existingBooking = booking.courtroomBookings.find(
      (courtroomBooking) => {
        return (
          courtroomBooking.hour == hour &&
          new Date(courtroomBooking.date).toISOString() ==
            new Date(bookingDate).toISOString()
        );
      }
    );

    console.log(existingBooking);

    if (existingBooking) {
      console.log(
        `User with CouponCode ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `User with CouponCode ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // Create a new courtroom user
    const newCourtroomUser = new TrailCourtroomUser2({
      CouponCode: CouponCode,
      password: hashedPassword,
      recording: recording, // Assuming recording is required and set to true
      caseOverview: "",
      date: bookingDate,
      hour: hour,
    });

    trailBooking.bookedSlots = trailBooking.bookedSlots + 1;

    console.log(trailBooking);

    await trailBooking.save();

    console.log(newCourtroomUser);

    // Save the new courtroom user
    const savedCourtroomUser = await newCourtroomUser.save();

    console.log(savedCourtroomUser);

    // Add the new booking
    booking.courtroomBookings.push(savedCourtroomUser._id);

    // Save the booking
    await booking.save();
    console.log("Booking saved.");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error.");
  }
}

async function courtRoomBookValidation(
  // name,
  // phoneNumber,
  // email,
  // hashedPassword,
  CouponCode,
  bookingDate,
  hour
  // recording,
  // caseOverview
) {
  // console.log("Here is caseOverview", caseOverview);
  try {
    // Ensure hour is an integer and within valid range
    if (hour < 0 || hour > 23) {
      console.log(`Invalid hour: ${hour}`);
      return `Invalid hour: ${hour}. Hour must be between 0 and 23.`;
    }

    console.log("Checking");

    // Find a TrailBooking that matches the date and hour for the user
    const trailBooking = await TrialCourtroomCoupon.findOne({
      CouponCode: CouponCode,
      StartDate: { $lte: bookingDate },
      EndDate: { $gte: bookingDate },
      // StartHour: { $lte: hour },
      // EndHour: { $gt: hour },
      // phoneNumber: phoneNumber,
      // email: email,
    }).populate("courtroomBookings");

    console.log("Checking");

    console.log(trailBooking);

    if (!trailBooking) {
      console.log(
        `User with ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `User with ${CouponCode} cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // // Find existing booking for the same date and hour
    // let booking = await TrailCourtRoomBooking.findOne({
    //   date: bookingDate,
    //   hour: hour,
    // }).populate("courtroomBookings");

    // if (!booking) {
    //   // Create a new booking if it doesn't exist
    //   booking = new TrailCourtRoomBooking({
    //     date: bookingDate,
    //     hour: hour,
    //     courtroomBookings: [],
    //   });
    // }

    // // Check if the total bookings exceed the limit
    // if (booking.courtroomBookings.length >= 4) {
    //   console.log(
    //     `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`
    //   );
    //   // throw new Error(
    //   //   `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`
    //   // );
    //   return `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`;
    // }

    // Check if the user with the same mobile number or email already booked a slot at the same hour
    const existingBooking = trailBooking.courtroomBookings.find(
      (courtroomBooking) => {
        return (
          courtroomBooking.hour == hour &&
          new Date(courtroomBooking.date).toISOString() ==
            new Date(bookingDate).toISOString()
        );
      }
    );

    console.log(existingBooking);

    if (existingBooking) {
      console.log(
        `User with coupan ${CouponCode} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      // throw new Error(
      //   `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`
      // );
      return `User with coupan ${CouponCode} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getBookedData(startDate, endDate) {
  try {
    // Ensure startDate is at the beginning of the day
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000

    // Ensure endDate includes the end of the day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999); // Include the entire last day of the range

    const bookings = await TrailCourtRoomBooking.aggregate([
      {
        $match: {
          date: { $gte: adjustedStartDate, $lte: adjustedEndDate },
        },
      },
      {
        $unwind: "$courtroomBookings", // Flatten the array to process each booking separately
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            hour: "$hour",
          },
          bookingCount: { $sum: 1 }, // Count each booking
        },
      },
      {
        $sort: { "_id.date": 1, "_id.hour": 1 },
      },
    ]);

    // Log the results to check for anomalies
    console.log("Aggregated bookings:", bookings);

    return bookings;
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error.");
  }
}

async function loginToCourtRoom(CouponCode, password) {
  try {
    let currentDate, currentHour;

    if (process.env.NODE_ENV === "production") {
      // Get current date and time in UTC
      const now = new Date();

      // Convert to milliseconds
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

      // IST offset is +5:30
      const istOffset = 5.5 * 60 * 60000;

      // Create new date object for IST
      const istTime = new Date(utcTime + istOffset);

      currentDate = new Date(
        Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate())
      );
      currentHour = istTime.getHours();
    } else {
      // Get the current date and hour in local time (for development)
      const now = new Date();
      currentDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      );
      currentHour = now.getHours();
    }

    console.log(currentDate, currentHour);

    // const currentDate = "2024-07-30";
    // const currentHour = 14;

    const userBooking1 = await TrailCourtroomUser2.find({
      // date: currentDate,
      // hour: currentHour,
      // CouponCode: CouponCode,
    });

    console.log(userBooking1);

    // Find existing booking for the current date and hour
    const userBooking = await TrailCourtroomUser2.findOne({
      date: currentDate,
      hour: currentHour,
      CouponCode: CouponCode,
    });

    if (!userBooking) {
      console.log("No bookings found for the current time slot.");
      return "No bookings found for the current time slot.";
    }

    console.log(userBooking);

    // // Check if the user with the given phone number is in the booking
    // const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
    //   console.log(courtroomBooking.phoneNumber, phoneNumber);
    //   return courtroomBooking.phoneNumber == phoneNumber;
    // });

    // console.log(userBooking);

    // if (!userBooking) {
    //   return "Invalid phone number or password.";
    // }

    // Check if the password is correct
    const isPasswordValid = await comparePassword(
      password,
      userBooking.password
    );

    if (!isPasswordValid) {
      return "Invalid phone number or password.";
    }

    // Generate a JWT token
    const token = generateToken({
      userId: userBooking._id,
      CouponCode: CouponCode,
    });

    let userId;

    if (!userBooking.userId) {
      const userId1 = await registerNewCourtRoomUser();
      userBooking.userId = userId1.user_id;
      userId = userId1.user_id;
      await userBooking.save();
    } else {
      userId = userBooking.userId;
    }

    // Respond with the token
    return {
      slotTime: userBooking.hour,
      ...token,
      userId: userId,
      CouponCode: CouponCode,
    };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function registerNewCourtRoomUser(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/user_id`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log(response);

  return response.json();
}

async function getClientByIdAndCoupon(_id, CouponCode) {
  try {
    let currentDate, currentHour;

    if (process.env.NODE_ENV === "production") {
      // Get current date and time in UTC
      const now = new Date();

      // Convert to milliseconds
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

      // IST offset is +5:30
      const istOffset = 5.5 * 60 * 60000;

      // Create new date object for IST
      const istTime = new Date(utcTime + istOffset);

      currentDate = new Date(
        Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate())
      );
      currentHour = istTime.getHours();
    } else {
      // Get the current date and hour in local time (for development)
      const now = new Date();
      currentDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      );
      currentHour = now.getHours();
    }

    console.log(currentDate, currentHour);

    // const currentDate = "2024-07-30";
    // const currentHour = 14;
    console.log(CouponCode, _id);

    // Find existing booking for the current date and hour
    const booking = await TrialCourtroomCoupon.findOne({
      CouponCode: CouponCode,
      StartDate: { $lte: currentDate },
      EndDate: { $gte: currentDate },
    }).populate("courtroomBookings");

    if (!booking) {
      return "No bookings found for the current time slot.";
    }

    // console.log(booking);

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      return courtroomBooking._id == _id;
    });

    // console.log(userBooking);

    return { userBooking, slotTime: currentHour };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByUseridAndCouponCode(userid, CouponCode) {
  try {
    let currentDate, currentHour;

    if (process.env.NODE_ENV === "production") {
      // Get current date and time in UTC
      const now = new Date();

      // Convert to milliseconds
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

      // IST offset is +5:30
      const istOffset = 5.5 * 60 * 60000;

      // Create new date object for IST
      const istTime = new Date(utcTime + istOffset);

      currentDate = new Date(
        Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate())
      );
      currentHour = istTime.getHours();
    } else {
      // Get the current date and hour in local time (for development)
      const now = new Date();
      currentDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      );
      currentHour = now.getHours();
    }

    console.log(currentDate, currentHour);

    // Manual Override for Testing
    // const formattedDate = new Date("2024-07-23T00:00:00.000Z");
    // const currentHour = 20;

    // Find existing booking for the current date and hour
    const booking = await TrialCourtroomCoupon.findOne({
      CouponCode: CouponCode,
      StartDate: { $lte: currentDate },
      EndDate: { $gte: currentDate },
    }).populate("courtroomBookings");

    console.log(CouponCode, currentDate);

    console.log(booking);

    if (!booking) {
      throw Error("No bookings found for the current time slot.");
      // return "No bookings found for the current time slot.";
    }

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      return courtroomBooking.userId == userid;
    });

    // console.log(userBooking);

    return { User_id: userBooking._id, Booking_id: booking };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function storeCaseHistory(userId, slotId, caseHistoryDetails) {
  try {
    // Find the courtroom history by userId and slotId
    let courtroomHistory = await TrailCourtroomHistory.findOne({
      userId: userId,
      slot: slotId,
    });

    if (!courtroomHistory) {
      // Create a new courtroom history if it doesn't exist
      courtroomHistory = new TrailCourtroomHistory({
        userId: userId,
        slot: slotId,
        history: [],
        latestCaseHistory: {},
      });
    }

    // Append the new case history details to the history array
    courtroomHistory.history.push(caseHistoryDetails);
    // Set the latest case history
    courtroomHistory.latestCaseHistory = caseHistoryDetails;

    // Save the updated courtroom history
    await courtroomHistory.save();
    console.log("Case history saved.");
    return courtroomHistory;
  } catch (error) {
    console.error("Error saving case history:", error);
    throw new Error("Internal server error.");
  }
}

async function getSessionCaseHistory(userId) {
  try {
    console.log(userId);
    const caseHistory = await TrailCourtroomHistory.findOne({ userId: userId });
    // console.log("Case history retrieved:", caseHistory);
    return caseHistory;
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function uploadfileToBucker(file, userId) {
  try {
    const expirationInDays = 30; // Set the expiration time for 30 days (example)

    if (!file) {
      throw new Error("No file uploaded.");
    }

    const filePath = `${userId}/${file.originalname}`;

    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.log("I am here File not upload");

      throw new Error(` ${err.message}`);
    });

    blobStream.on("finish", async () => {
      // After file upload, set the expiration time
      console.log("I am here File upload");
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationInDays);

      await blob.setMetadata({
        metadata: {
          customTime: expirationDate.toISOString(), // Custom expiration time in ISO format
        },
      });
      console.log("file uploaded successfully");
      return;
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error(`Error updating user by phone number ${phoneNumber}:`, error);
    throw error;
  }
}

module.exports = {
  courtRoomBook,
  adminCourtRoomBook,
  getBookedData,
  loginToCourtRoom,
  getClientByIdAndCoupon,
  getClientByUseridAndCouponCode,
  storeCaseHistory,
  courtRoomBookValidation,
  getSessionCaseHistory,
  addContactUsQuery,
  uploadfileToBucker,
};
