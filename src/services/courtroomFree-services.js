const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const CourtRoomBooking = require("../models/courtRoomBooking");
const CourtroomUser = require("../models/courtroomPricingUser");
const { comparePassword, generateToken } = require("../utils/coutroom/auth");
const CourtroomHistory = require("../models/courtroomFreeHistory");
const ContactUs = require("../models/contact");
const {
  sendAdminContactUsNotification,
} = require("../utils/coutroom/sendEmail");
const { trusted, default: mongoose } = require("mongoose");
const TrailCourtRoomBooking = require("../models/trailCourtRoomBooking");
const TrailCourtroomUser = require("../models/trailCourtRoomUser");
const CourtroomFeedback = require("../models/courtroomFeedback");
const CourtroomFreeUser = require("../models/courtroomFreeUser");
const CourtroomFreeFeedback = require("../models/courtroomFreeFeedback");
const prisma = require("../config/prisma-client");
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

async function loginToCourtRoom(phoneNumber, name) {
  try {
    const user = await CourtroomFreeUser.findOne({
      phoneNumber: phoneNumber,
    });
    const now = new Date();
    console.log(now);

    // Convert to milliseconds
    var currentTime = new Date();

    var currentOffset = currentTime.getTimezoneOffset();

    var ISTOffset = 330; // IST offset UTC +5:30

    var istTime = new Date(
      currentTime.getTime() + (ISTOffset + currentOffset) * 60000
    );
    console.log(istTime);
    let currentDate = new Date(
      Date.UTC(
        istTime.getFullYear(),
        istTime.getMonth(),
        istTime.getDate(),
        istTime.getHours(),
        istTime.getMinutes()
      )
    );

    const userData = await prisma.user.findFirst({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    console.log(userData);

    const userPrismaData = await prisma.userAllPlan.findFirst({
      where: {
        userId: userData.mongoId,
      },
      include: {
        plan: true,
      },
    });

    console.log(userPrismaData);

    let slotTime;
    if (userPrismaData !== null) {
      slotTime = userPrismaData?.plan?.WarroomTime / 60;
    }

    if (slotTime === null) {
      slotTime = 0.5;
    }

    if (!user) {
      const userId = await registerNewCourtRoomUser();
      const newUser = await CourtroomFreeUser.create({
        phoneNumber: phoneNumber,
        name: name,
        userId: userId.user_id,
        todaysSlot: currentDate,
      });

      const token = generateToken(
        { userId: newUser.userId, id: newUser._id, slotTime },
        slotTime * 60
      );
      token["slot"] = newUser.todaysSlot;
      token["caseOverview"] = newUser.caseOverview;
      return { ...token, userId: newUser.userId, totalTime: slotTime * 60 };
    }

    const todaysSlot = new Date(user.todaysSlot);
    const todaysSlotTime =
      todaysSlot.getTime() + todaysSlot.getTimezoneOffset() * 60000;
    const Offset = slotTime * 60 * 60000;
    let slot = new Date(todaysSlotTime + Offset);
    console.log("SLOT:- ", slot);
    slot = new Date(
      Date.UTC(
        slot.getFullYear(),
        slot.getMonth(),
        slot.getDate(),
        slot.getHours(),
        slot.getMinutes()
      )
    );
    console.log(slot);
    console.log(todaysSlot);
    console.log(todaysSlot.getUTCDate());
    console.log(currentDate);
    console.log(currentDate.getUTCDate());

    if (
      todaysSlot.getUTCDate() < currentDate.getUTCDate() ||
      todaysSlot.getFullYear() < currentDate.getFullYear() ||
      (todaysSlot.getFullYear() == currentDate.getFullYear() &&
        todaysSlot.getMonth() < currentDate.getMonth())
    ) {
      console.log("TODAYSLSOT");

      const update = await CourtroomFreeUser.findOneAndUpdate(
        { userId: user.userId },
        {
          todaysSlot: currentDate,
        },
        {
          new: true,
        }
      );
      const token = generateToken(
        { userId: user.userId, id: user._id, slotTime },
        slotTime * 60
      );
      token["slot"] = currentDate;
      token["caseOverview"] = user.caseOverview;
      return { ...token, userId: update.userId, totalTime: slotTime * 60 };
    } else if (slot > currentDate) {
      console.log("SLOT");

      console.log(slot - currentDate);

      let remainingTime = (slot - currentDate) / 60000; // time in minutes

      const token = generateToken(
        {
          userId: user.userId,
          id: user._id,
          slotTime,
        },
        remainingTime
      );
      token["slot"] = user.todaysSlot;
      token["caseOverview"] = user.caseOverview;
      return { ...token, userId: user.userId, totalTime: slotTime * 60 };
    }

    if (user.name != name) {
      const upadte = await CourtroomFreeUser.findByIdAndUpdate(user._id, {
        name: name,
      });
    }

    return { message: "inavlid session" };
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

  return await response.json();
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
    const courtroomUser = await CourtroomFreeUser.findOne({ userId: userid });

    return { User_id: courtroomUser._id };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByUserid(userid) {
  try {
    const userBooking = await CourtroomFreeUser.findOne({ userId: userid });

    return { User_id: userBooking._id };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function storeCaseHistory(userId, slotId, caseHistoryDetails) {
  try {
    const user = await CourtroomFreeUser.findById(userId);

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
    const user = await CourtroomFreeUser.findById(userId);

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
    console.log("dashajdskja");
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
    const setFeedbackData = await CourtroomFreeFeedback.create({
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
    const user = await CourtroomFreeUser.findById(userId);
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

async function ifFreeUserIsValid(userid, user_id) {
  try {
    console.log("hi");
    const user = await CourtroomFreeUser.find({});
    console.log("hi");
    cosnole.log(user);
    if (!user) {
      return false;
    }
    const todaysSlot = new Date(user.todaysSlot);
    const todaysSlotTime =
      todaysSlot.getTime() + todaysSlot.getTimezoneOffset() * 60000;
    const Offset = 0.5 * 60 * 60000;
    const slot = new Date(todaysSlotTime + Offset);
    const currenttime = new Date.now();
    const utcTime =
      currenttime.getTime() + currenttime.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const currentItcTime = new Date(utcTime + istOffset);
    console.log("hi");
    if (!slot > currentItcTime || !(user.userId != user_id)) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function getFreeCourtroomUserFromMobile(phone) {
  try {
    const user = courtroomFreeUser.findOne({ phoneNumber: phone });
    if (!user) {
      return null;
    }
    return user;
  } catch (e) {
    return null;
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
  getFreeCourtroomUserFromMobile,
  ifFreeUserIsValid,
};
