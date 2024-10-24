const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const ContactUs = require("../models/contact");
const {
  sendAdminContactUsNotification,
} = require("../utils/coutroom/sendEmail");

const SpecificLawyerCourtroomUser = require("../models/SpecificLawyerCourtroomUser");
const SpecificLawyerCourtroomHistory = require("../models/SpecificLawyerCourtroomHistory");
const {
  comparePasswordSpecial,
  generateTokenSpecial,
} = require("../utils/SpecificCourtroom/auth");

const { COURTROOM_API_ENDPOINT } = process.env;

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

async function courtRoomBook(
  name,
  phoneNumber,
  email,
  Domain,
  startDate,
  endDate,
  recording,
  caseOverview,
  totalHours,
  features
) {
  console.log("Here is caseOverview", caseOverview);
  try {
    const allUserBooking = await SpecificLawyerCourtroomUser.find({});

    // Check if the user with the same mobile number or email already booked a slot at the same hour
    const existingBooking = allUserBooking.find(
      (courtroomBooking) =>
        courtroomBooking.phoneNumber == phoneNumber ||
        courtroomBooking.email == email
    );

    console.log(existingBooking);

    if (existingBooking) {
      console.log(
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom.`;
    }

    // Create a new courtroom user
    const newCourtroomUser = new SpecificLawyerCourtroomUser({
      name,
      phoneNumber,
      email,
      Domain,
      startDate,
      endDate,
      recording,
      totalHours,
      features, // Assuming recording is required and set to true
      caseOverview: "NA",
    });

    console.log(newCourtroomUser);

    // Save the new courtroom user
    const savedCourtroomUser = await newCourtroomUser.save();

    console.log(savedCourtroomUser);

    console.log("Booking saved successfully");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error.", error.message);
  }
}

async function loginToCourtRoom(phoneNumber, password) {
  try {
    // Find existing booking
    const userBooking = await SpecificLawyerCourtroomUser.findOne({
      phoneNumber: phoneNumber,
    });
    if (!userBooking) {
      return "Invalid phone number or password.";
    }

    console.log(userBooking);

    // Check if the password is correct
    const isPasswordValid = await comparePasswordSpecial(
      password,
      userBooking.password
    );

    if (!isPasswordValid) {
      return "Invalid phone number or password.";
    }

    // Generate a JWT token
    const token = generateTokenSpecial({
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
      //   slotTime: booking.hour,
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

async function getClientByDomainName(Domain) {
  try {
    let userBooking;
    if (process.env.NODE_ENV === "production") {
      // Find existing booking for the current date and hour
      userBooking = await SpecificLawyerCourtroomUser.findOne({
        // Domain: "shubham.courtroom.clawlaw.in",
        Domain: Domain,
      });
    } else {
      // Find existing booking for the current date and hour
      userBooking = await SpecificLawyerCourtroomUser.findOne({
        Domain: "shubham.courtroom.clawlaw.in",
        // Domain: Domain,
      });
    }

    // console.log(userBooking);
    if (!userBooking) {
      return "No bookings found for the current time slot.";
    }

    // console.log(userBooking);

    return { userBooking };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByUserid(userid) {
  try {
    // Find existing booking for the current date and hour
    const userBooking = await SpecificLawyerCourtroomUser.findOne({
      userId: userid,
    });

    console.log(userBooking);

    return { User_id: userBooking._id };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function storeCaseHistory(userId, caseHistoryDetails) {
  try {
    const user = await SpecificLawyerCourtroomUser.findById(userId);

    // Find the courtroom history by userId and slotId
    let courtroomHistory = await SpecificLawyerCourtroomHistory.findOne({
      userId: userId,
    });

    if (!courtroomHistory) {
      // Create a new courtroom history if it doesn't exist
      courtroomHistory = new SpecificLawyerCourtroomHistory({
        userId: userId,
        history: [],
        latestCaseHistory: {},
      });
    }

    caseHistoryDetails.caseId = user.caseId;

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

async function OverridestoreCaseHistory(userId, caseHistoryDetails) {
  try {
    const user = await SpecificLawyerCourtroomUser.findById(userId);

    // Find the courtroom history by userId and slotId
    let courtroomHistory = await SpecificLawyerCourtroomHistory.findOne({
      userId: userId,
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
    const caseHistory = await SpecificLawyerCourtroomHistory.findOne({
      userId: userId,
    });
    // console.log("Case history retrieved:", caseHistory);
    return caseHistory;
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// Service to get a client by phone number with a session
async function getClientByDomainWithSession(Domain, session) {
  try {
    const user = await SpecificLawyerCourtroomUser.findOne({
      Domain,
    }).session(session);
    return user;
  } catch (error) {
    console.error(`Error fetching user by phone number ${phoneNumber}:`, error);
    throw error;
  }
}

// Service to update a client by phone number with a session
async function updateClientByDomainWithSession(Domain, updateData, session) {
  try {
    const user = await SpecificLawyerCourtroomUser.findOneAndUpdate(
      { Domain },
      updateData,
      { new: true, session }
    );
    return user;
  } catch (error) {
    console.error(`Error updating user by phone number ${Domain}:`, error);
    throw error;
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
      throw new Error(` ${err.message}`);
    });

    blobStream.on("finish", async () => {
      // After file upload, set the expiration time
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

async function uploadfileToBuckerWithProgress(file, userId) {
  try {
    if (!file) {
      throw new Error("No file uploaded.");
    }

    const filePath = `${userId}/${file.originalname}`;

    // Create a resumable upload session
    const blob = bucket.file(filePath);
    const options = {
      resumable: true,
      contentType: file.mimetype,
    };

    const [uploadResponse] = await blob.createResumableUpload(options);

    // Confirm upload completion before setting expiration
    await blob.save(req.file.buffer);

    // Set expiration after successful upload
    const expirationInDays = 30; // Expiration set for 30 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationInDays);

    // Set file expiration metadata
    await blob.setMetadata({
      metadata: {
        "google-cloud-storage-expiration": expirationDate.toISOString(),
      },
    });

    // Send back the upload session URL to the frontend
    return {
      message: "File uploaded and expiration set successfully.",
      filePath: filePath,
      uploadUrl: uploadResponse, // The resumable upload URL (if needed)
      fileName: file.originalname,
    };
  } catch (error) {
    console.error("Error uploading file to bucket:", error);
    throw new Error("Internal server error.");
  }
}

async function isNewCaseHistory(userId) {
  try {
    const user = await SpecificLawyerCourtroomUser.findById(userId);
    const currentCaseId = user.caseId;
    const courtroomHistory = await SpecificLawyerCourtroomHistory.findOne({
      userId: userId,
    });
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
  loginToCourtRoom,
  getClientByDomainName,
  getClientByUserid,
  storeCaseHistory,
  getSessionCaseHistory,
  addContactUsQuery,
  getClientByDomainWithSession,
  updateClientByDomainWithSession,
  uploadfileToBucker,
  isNewCaseHistory,
  OverridestoreCaseHistory,
  uploadfileToBuckerWithProgress,
};
