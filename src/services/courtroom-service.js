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
const { trusted, default: mongoose } = require("mongoose");
const TrailCourtRoomBooking = require("../models/trailCourtRoomBooking");
const TrailCourtroomUser = require("../models/trailCourtRoomUser");
const CourtroomFeedback = require("../models/courtroomFeedback");
const { COURTROOM_API_ENDPOINT } = process.env;

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
    //     `User with phone number ${phoneNumber} or email ${email} cannot book a slot at same time}.`
    //   );
    //   return `User with phone number ${phoneNumber} or email ${email} cannot book a slot at same time}.`;
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
      console.log(`Maximum of 4 courtrooms can be booked at same time}.`);
      return `Maximum of 4 courtrooms can be booked at same time}.`;
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
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`;
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

async function addContactUsQuery(
  firstName,
  lastName,
  email,
  phoneNumber,
  preferredContactMode,
  businessName,
  query,
  from
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
      from,
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
      from,
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
  const newCourtroomUser = new CourtroomUser({
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

async function courtRoomBook(
  name,
  phoneNumber,
  email,
  bookingDate,
  hour,
  recording,
  caseOverview,
  hashedPassword
) {
  console.log("Here is caseOverview", caseOverview);
  try {
    // Find existing booking for the same date and hour
    let booking = await CourtRoomBooking.findOne({
      date: bookingDate,
      hour: hour,
    }).populate("courtroomBookings");

    if (!booking) {
      // Create a new booking if it doesn't exist
      booking = new CourtRoomBooking({
        date: bookingDate,
        hour: hour,
        courtroomBookings: [],
      });
    }

    // Check if the total bookings exceed the limit
    if (booking.courtroomBookings.length >= 6) {
      console.log(`Maximum of 6 courtrooms can be booked at same time}.`);
      return `Maximum of 6 courtrooms can be booked at same time}.`;
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
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`;
    }

    // Create a new courtroom user
    const newCourtroomUser = new CourtroomUser({
      name,
      phoneNumber,
      email,
      recording: recording, // Assuming recording is required and set to true
      caseOverview: "NA",
      password: hashedPassword,
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

async function AdminLoginCourtRoomBook(
  name,
  phoneNumber,
  email,
  bookingDate,
  hour,
  recording,
  caseOverview,
  hashedPassword
) {
  console.log("Here is caseOverview", caseOverview);
  try {
    // Find existing booking for the same date and hour
    let booking = await CourtRoomBooking.findOne({
      date: bookingDate,
      hour: hour,
    }).populate("courtroomBookings");

    if (!booking) {
      // Create a new booking if it doesn't exist
      booking = new CourtRoomBooking({
        date: bookingDate,
        hour: hour,
        courtroomBookings: [],
      });
    }

    // Check if the total bookings exceed the limit
    if (booking.courtroomBookings.length >= 6) {
      console.log(`Maximum of 6 courtrooms can be booked at same time}.`);
      return `Maximum of 6 courtrooms can be booked at same time}.`;
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
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`;
    }

    // Create a new courtroom user
    const newCourtroomUser = new CourtroomUser({
      name,
      phoneNumber,
      email,
      recording: recording, // Assuming recording is required and set to true
      caseOverview: "NA",
      password: hashedPassword,
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

async function courtRoomBookValidation(
  name,
  phoneNumber,
  email,
  bookingDate,
  hour,
  recording,
  caseOverview
) {
  console.log("Here is caseOverview", caseOverview);
  try {
    // Find existing booking for the same date and hour
    let booking = await CourtRoomBooking.findOne({
      date: bookingDate,
      hour: hour,
    }).populate("courtroomBookings");

    if (!booking) {
      // Create a new booking if it doesn't exist
      booking = new CourtRoomBooking({
        date: bookingDate,
        hour: hour,
        courtroomBookings: [],
      });
    }

    // Check if the total bookings exceed the limit
    if (booking.courtroomBookings.length >= 6) {
      console.log(`Maximum of 6 courtrooms can be booked at same time}.`);
      // throw new Error(
      //   `Maximum of 4 courtrooms can be booked at same time}.`
      // );
      return `Maximum of 6 courtrooms can be booked at same time}.`;
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
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`
      );
      // throw new Error(
      //   `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time}.`
      // );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at same time`;
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

    const bookings = await CourtRoomBooking.aggregate([
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

async function loginToCourtRoom(phoneNumber, password) {
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

    // Find existing booking for the current date and hour
    const booking = await CourtRoomBooking.findOne({
      date: currentDate,
      hour: currentHour,
    }).populate("courtroomBookings");

    if (!booking) {
      return "No bookings found for the current time slot.";
    }

    console.log(booking);

    console.log(booking.courtroomBookings.length);

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      console.log(courtroomBooking.phoneNumber, phoneNumber);
      return courtroomBooking.phoneNumber == phoneNumber;
    });

    console.log(userBooking);

    if (!userBooking) {
      return "Invalid phone number";
    }

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
      phoneNumber: userBooking.phoneNumber,
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
      slotTime: booking.hour,
      ...token,
      userId: userId,
      phoneNumber: userBooking.phoneNumber,
    };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function adminLoginValidation(phoneNumber) {
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

    // Find existing booking for the current date and hour
    const booking = await CourtRoomBooking.findOne({
      date: currentDate,
      hour: currentHour,
    }).populate("courtroomBookings");

    if (!booking) {
      return "No bookings found for the current time slot.";
    }

    console.log(booking);

    console.log(booking.courtroomBookings.length);

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      console.log(courtroomBooking.phoneNumber, phoneNumber);
      return courtroomBooking.phoneNumber == phoneNumber;
    });

    console.log(userBooking);

    if (!userBooking) {
      return "Invalid phone number";
    }

    // // Check if the password is correct
    // const isPasswordValid = await comparePassword(
    //   password,
    //   userBooking.password
    // );

    // if (!isPasswordValid) {
    //   return "Invalid phone number or password.";
    // }

    // Generate a JWT token
    const token = generateToken({
      userId: userBooking._id,
      phoneNumber: userBooking.phoneNumber,
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
      slotTime: booking.hour,
      ...token,
      userId: userId,
      phoneNumber: userBooking.phoneNumber,
    };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function AdminLoginToCourtRoom(phoneNumber, password) {
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

    // Find existing booking for the current date and hour
    const booking = await CourtRoomBooking.findOne({
      date: currentDate,
      hour: currentHour,
    }).populate("courtroomBookings");

    if (!booking) {
      return "No bookings found for the current time slot.";
    }

    console.log(booking);

    console.log(booking.courtroomBookings.length);

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      console.log(courtroomBooking.phoneNumber, phoneNumber);
      return courtroomBooking.phoneNumber == phoneNumber;
    });

    console.log(userBooking);

    if (!userBooking) {
      return "Invalid phone number";
    }

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
      phoneNumber: userBooking.phoneNumber,
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
      slotTime: booking.hour,
      ...token,
      userId: userId,
      phoneNumber: userBooking.phoneNumber,
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

async function getClientByPhoneNumber(phoneNumber) {
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

    // Find existing booking for the current date and hour
    const booking = await CourtRoomBooking.findOne({
      date: currentDate,
      hour: currentHour,
    }).populate("courtroomBookings");

    if (!booking) {
      return "No bookings found for the current time slot.";
    }

    // console.log(booking);

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      return courtroomBooking.phoneNumber == phoneNumber;
    });

    // console.log(userBooking);

    return { userBooking, slotTime: booking.hour };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByUseridForEndCase(userid) {
  try {
    // Get the current date and hour
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
    const courtroomUser = await CourtroomUser.findOne({
      userId: userid,
    });

    if (!courtroomUser) {
      throw Error("No user found!!.");
      // return "No bookings found for the current time slot.";
    }

    const booking = await CourtRoomBooking.findOne({
      courtroomBookings: {
        $elemMatch: {
          $eq: new mongoose.Types.ObjectId(courtroomUser._id), // Fixed here
        },
      },
    });

    if (!booking) {
      throw Error("No booking found for the current user.");
      // return "No bookings found for the current time slot.";
    }

    return { User_id: courtroomUser._id, Booking_id: booking._id };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByUserid(userid) {
  try {
    // Get the current date and hour
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
    const booking = await CourtRoomBooking.findOne({
      date: currentDate,
      hour: currentHour,
    }).populate("courtroomBookings");

    // console.log(booking);

    if (!booking) {
      throw Error("No bookings found for the current time slot.");
      // return "No bookings found for the current time slot.";
    }

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      return courtroomBooking.userId == userid;
    });

    console.log(userBooking);

    return { User_id: userBooking._id, Booking_id: booking };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function storeCaseHistory(userId, slotId, caseHistoryDetails) {
  try {
    const user = await CourtroomUser.findById(userId);

    // Find the courtroom history by userId and slotId
    let courtroomHistory = await CourtroomHistory.findOne({
      userId: userId,
      slot: slotId,
    });

    if (!courtroomHistory) {
      // Create a new courtroom history if it doesn't exist
      courtroomHistory = new CourtroomHistory({
        userId: userId,
        slot: slotId,
        history: [],
        latestCaseHistory: {},
      });
    }

    caseHistoryDetails.caseId = user.caseId;

    console.log(caseHistoryDetails.caseId);

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

async function OverridestoreCaseHistory(userId, slotId, caseHistoryDetails) {
  try {
    const user = await CourtroomUser.findById(userId);

    // Find the courtroom history by userId and slotId
    let courtroomHistory = await CourtroomHistory.findOne({
      userId: userId,
      slot: slotId,
    });

    // if (!courtroomHistory) {
    //   // Create a new courtroom history if it doesn't exist
    //   courtroomHistory = new CourtroomHistory({
    //     userId: userId,
    //     slot: slotId,
    //     history: [],
    //     latestCaseHistory: {},
    //   });
    // }

    const lengthOfHistory = courtroomHistory.history.length;

    caseHistoryDetails.caseId = user.caseId;

    // Append the new case history details to the history array
    courtroomHistory.history[lengthOfHistory - 1] = caseHistoryDetails;
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
    const caseHistory = await CourtroomHistory.findOne({ userId: userId });
    // console.log("Case history retrieved:", caseHistory);
    return caseHistory;
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function setFeedback(_id, rating, feedback) {
  try {
    const setFeedbackData = await CourtroomFeedback.create({
      userId: _id,
      rating: parseInt(rating),
      feedback: feedback,
    });
    return setFeedbackData;
  } catch (error) {
    console.error("Error setting feedback:", error);
    throw new Error("Internal server error.");
  }
}

async function checkFirtVisit(phoneNumber) {
  try {
    const user = await CourtroomUser.findOne({ phoneNumber: phoneNumber });
    if (user) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error checking first visit:", error);
    throw new Error("Internal server error.");
  }
}

async function isNewCaseHistory(userId) {
  try {
    const user = await CourtroomUser.findById(userId);
    const currentCaseId = user.caseId;
    const courtroomHistory = await CourtroomHistory.findOne({ userId: userId });
    if (!courtroomHistory) {
      return false; // inster new case history entry
    }
    const historyCaseId = courtroomHistory?.latestCaseHistory.caseId;
    if (
      currentCaseId === historyCaseId &&
      courtroomHistory &&
      courtroomHistory.history.length > 0
    ) {
      return true; // override case history
    } else {
      return false; // inster new case history entry
    }
  } catch (error) {
    console.error("Error checking new case history:", error);
    throw new Error("Internal server error.");
  }
}

module.exports = {
  courtRoomBook,
  getBookedData,
  loginToCourtRoom,
  getClientByPhoneNumber,
  getClientByUserid,
  storeCaseHistory,
  courtRoomBookValidation,
  getSessionCaseHistory,
  addContactUsQuery,
  adminCourtRoomBook,
  getClientByUseridForEndCase,
  setFeedback,
  AdminLoginCourtRoomBook,
  AdminLoginToCourtRoom,
  adminLoginValidation,
  checkFirtVisit,
  isNewCaseHistory,
  OverridestoreCaseHistory,
};
