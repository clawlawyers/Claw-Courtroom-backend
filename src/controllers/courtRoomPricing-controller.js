const {
  hashPassword,
  generateToken,
  generateTokenForCourtroomPricing,
} = require("../utils/coutroom/auth");
const {
  sendConfirmationEmail,
  sendOTP,
} = require("../utils/coutroom/sendEmail");
const CourtroomPricingService = require("../services/courtroomPricing-service");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { COURTROOM_API_ENDPOINT } = process.env;
const path = require("path");
const CourtroomPricingUser = require("../models/courtroomPricingUser");
const FormData = require("form-data");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const {
  uploadfileToBucker,
  uploadfileToBuckerWithProgress,
} = require("../services/specificLawyerCourtroom-service");
const courtroomDiscountCoupon = require("../models/courtroomDiscountCoupon");
const { Storage } = require("@google-cloud/storage");
const courtroomPlan = require("../models/CourtroomPlan");
const CourtroomUserPlan = require("../models/courtroomUserPlan");
const { default: mongoose } = require("mongoose");
const {
  checkUserIdValidity,
  createToken,
  ResetPasswordCreateToken,
} = require("../utils/common/auth");
const ResetPassword = require("../models/resetPassword");

// Require Moment-Timezone, which includes Moment
const moment = require("moment-timezone");

// Force all moments to use Asia/Kolkata
moment.tz.setDefault("Asia/Kolkata");

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

const bucketName = "ai_courtroom"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

async function createNewPlan(req, res) {
  try {
    const { planName, price, features, totalTime, duration } = req.body;

    // Validation: Ensure required fields are present
    if (!planName || !price || !features || !duration || !totalTime) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    // Create a new courtroom plan
    const newPlan = new courtroomPlan({
      planName,
      price,
      features,
      duration,
      totalTime,
    });

    // Save the new plan to the database
    await newPlan.save();

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        message: "Courtroom plan added successfully",
        newPlan,
      })
    );
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function bookCourtRoom(req, res) {
  try {
    const { name, phoneNumber, email, password } = req.body;

    // Check if required fields are provided
    if (!name || !phoneNumber || !email || !password) {
      return res.status(400).send("Missing required fields.");
    }

    const hashedPassword = await hashPassword(password);
    const caseOverview = "NA";

    const respo = await CourtroomPricingService.addNewCourtroomUser(
      name,
      phoneNumber,
      email,
      hashedPassword,
      caseOverview
    );
    // await sendConfirmationEmail(
    //   email,
    //   name,
    //   phoneNumber,
    //   password,
    //   slots,
    //   (amount = slots.length * 100)
    // );

    res
      .status(201)
      .json({ message: "Courtroom slots booked successfully.", respo });
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function adminLoginBookCourtRoom(req, res) {
  try {
    const { name, phoneNumber, email, slots, recording, password } = req.body;

    // Check if required fields are provided
    if (
      !name ||
      !phoneNumber ||
      !email ||
      !slots ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      return res.status(400).send("Missing required fields.");
    }

    const hashedPassword = await hashPassword(password);
    const caseOverview = "";

    for (const slot of slots) {
      const { date, hour } = slot;
      if (!date || hour === undefined) {
        return res.status(400).send("Missing required fields in slot.");
      }

      const bookingDate = new Date(date);

      const respo = await CourtroomPricingService.AdminLoginCourtRoomBook(
        name,
        phoneNumber,
        email,
        bookingDate,
        hour,
        recording,
        caseOverview,
        hashedPassword
      );

      if (respo) {
        return res.status(400).send(respo);
      }
    }
    await sendConfirmationEmail(
      email,
      name,
      phoneNumber,
      password,
      slots,
      (amount = slots.length * 100)
    );

    res.status(201).send("Courtroom slots booked successfully.");
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function adminBookCourtRoom(req, res) {
  try {
    const { name, phoneNumber, email, password, slots, recording } = req.body;

    // Check if required fields are provided
    if (
      !name ||
      !phoneNumber ||
      !email ||
      !password ||
      !slots ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      return res.status(400).send("Missing required fields.");
    }

    const hashedPassword = await hashPassword(password);
    const caseOverview = "";

    for (const slot of slots) {
      const { date, hour } = slot;
      if (!date || hour === undefined) {
        return res.status(400).send("Missing required fields in slot.");
      }

      const bookingDate = new Date(date);

      const respo = await CourtroomPricingService.adminCourtRoomBook(
        name,
        phoneNumber,
        email,
        hashedPassword,
        bookingDate,
        hour,
        recording,
        caseOverview
      );

      if (respo) {
        return res.status(400).send(respo);
      }
    }
    await sendConfirmationEmail(
      email,
      name,
      phoneNumber,
      password,
      slots,
      (amount = slots.length * 100)
    );

    res.status(201).send("Courtroom slots booked successfully.");
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function bookCourtRoomValidation(req, res) {
  try {
    const { phoneNumber, email } = req.body;

    // Check if required fields are provided
    if (!phoneNumber || !email) {
      return res.status(400).send("Missing required fields.");
    }

    const resp = await CourtroomPricingService.courtRoomBookValidation(
      phoneNumber,
      email
    );

    return res.status(StatusCodes.OK).json(SuccessResponse({ data: resp }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getBookedData(req, res) {
  try {
    const today = new Date();
    const nextTwoMonths = new Date();
    nextTwoMonths.setMonth(nextTwoMonths.getMonth() + 2);

    const bookings = await CourtroomPricingService.getBookedData(
      today,
      nextTwoMonths
    );

    res.status(200).json(bookings);
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function loginToCourtRoom(req, res) {
  const { phoneNumber, password } = req.body;
  try {
    if (!phoneNumber || !password) {
      return res.status(400).send("Missing required fields.");
    }
    const response = await CourtroomPricingService.loginToCourtRoom(
      phoneNumber,
      password
    );
    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function adminLoginValidation(req, res) {
  const { phoneNumber, email, bookingDate, hour } = req.body;
  try {
    if (!phoneNumber || !email || !bookingDate || !hour) {
      return res.status(400).send("Missing required fields.");
    }
    // const response = await CourtroomPricingService.adminLoginValidation(phoneNumber);
    let caseOverview;

    const resp = await CourtroomPricingService.courtRoomBookValidation(
      (Wname = "DUMMY"),
      phoneNumber,
      email,
      bookingDate,
      hour,
      (recording = true),
      (caseOverview = "NA")
    );

    console.log(resp);

    if (resp) {
      return res.status(StatusCodes.OK).json(SuccessResponse({ data: resp }));
    }
    res.status(200).json({ message: "SLOT BOOK KRO" });
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function AdminLoginToCourtRoom(req, res) {
  const { phoneNumber, password } = req.body;
  try {
    if (!phoneNumber) {
      return res.status(400).send("Missing required fields.");
    }
    const response = await CourtroomPricingService.AdminLoginToCourtRoom(
      phoneNumber,
      password
    );
    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function registerNewCourtRoomUser(body) {
  try {
    console.log(body);
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/user_id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user ID: ${response.statusText}`);
    }

    console.log(response);

    return response.json();
  } catch (error) {
    console.error("Error fetching user ID", error);
    throw error;
  }
}

async function getUserDetails(req, res) {
  const userBooking = req.body?.courtroomClient?.userBooking;
  // const token = req.headers["authorization"].split(" ")[1];

  try {
    // console.log(userBooking);

    const userPlan = await CourtroomUserPlan.findOne({
      user: userBooking._id,
    }).populate("plan");
    console.log(userPlan);

    if (userPlan?.usedHours >= userPlan?.plan?.totalTime) {
      return res.status(StatusCodes.OK).json(
        SuccessResponse({
          message: "You have exceeded your time limit",
        })
      );
    }
    console.log(userBooking);

    let userId;

    if (!userBooking.userId) {
      const userId1 = await registerNewCourtRoomUser();
      const updateUser = await CourtroomPricingUser.findByIdAndUpdate(
        userBooking._id,
        { userId: userId1.user_id, caseOverview: "NA" },
        { new: true }
      );
      userId = updateUser.userId;
      userBooking.userId = userId;
    }

    const resp = await checkUserIdValidity(userBooking.userId);

    if (resp === "VM Restarted, Create User ID") {
      const userId1 = await registerNewCourtRoomUser();
      console.log(userId1);
      const updateUser = await CourtroomPricingUser.findByIdAndUpdate(
        userBooking._id,
        { userId: userId1.user_id, caseOverview: "NA" },
        { new: true }
      );
      userId = updateUser.userId;
    }

    console.log(userPlan);

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        plan: userPlan,
        // ...token,
        userId: userBooking.userId,
        mongoId: userBooking._id,
        phoneNumber: userBooking.phoneNumber,
      })
    );
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function newcase(req, res) {
  const files = req.files; // This will be an array of file objects
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const { isMultilang } = req.body;

  const { userId } = req.body?.courtroomClient?.userBooking;
  // const userId = "f497c76b-2894-4636-8d2b-6391bc6bccdc";
  console.log(userId);

  try {
    // Rename only the first file and prepare the data object for getOverview
    const formData = new FormData();

    console.log(formData);

    // const fileBody = {};

    // Rename the first file to `file`
    const fileKeys = Object.keys(files);
    fileKeys.forEach((key, index) => {
      const file = files[key][0]; // Get the first file from each key

      if (index === 0) {
        console.log(file.originalname);
        const extension = path.extname(file.originalname);
        const newFilename = `${userId}${extension}`; // Rename the first file

        // Create a renamed file object with buffer data
        const renamedFile = {
          ...file,
          originalname: newFilename,
        };

        formData.append("file", file.buffer, {
          filename: renamedFile.originalname,
          contentType: renamedFile.mimetype,
        });
        // fileBody.file = renamedFile;
      } else {
        formData.append(index === 0 ? "file" : `file${index}`, file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        // fileBody[`file${index + 1}`] = file;
      }
    });

    console.log(formData);

    const case_overview = isMultilang
      ? await getOverviewMultilang(formData)
      : await getOverview(formData);

    console.log(case_overview);

    // // Find the CourtroomPricingUser document by userId
    // const courtroomPricingUser = await CourtroomPricingUser.findOne({ userId });

    // if (!courtroomPricingUser) {
    //   return res
    //     .status(StatusCodes.NOT_FOUND)
    //     .json({ error: "User not found" });
    // }

    // console.log(courtroomPricingUser);

    // // Append the case overview to the user's caseOverview array
    // courtroomPricingUser.caseOverview = case_overview.case_overview;

    // console.log(courtroomPricingUser);

    // // Save the updated CourtroomPricingUser document
    // await courtroomPricingUser.save();

    // console.log(courtroomPricingUser);

    return res.status(StatusCodes.OK).json(SuccessResponse({ case_overview }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getOverview(formData) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${COURTROOM_API_ENDPOINT}/new_case`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(), // Ensure correct headers are set
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error in getOverview:", error);
    // console.error("Error in getOverview:");
    throw error;
  }
}

async function getOverviewMultilang(formData) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/new_case_multilang`,
      {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(), // Ensure correct headers are set
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error in getOverview:", error);
    // console.error("Error in getOverview:");
    throw error;
  }
}

async function newCaseText(req, res) {
  try {
    const { userId } = req.body?.courtroomClient?.userBooking;
    const { case_overview, action } = req.body;
    const fetchedOverview = await fetchOverview({
      user_id: userId,
      case_overview,
      action,
    });
    console.log(fetchedOverview);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ fetchedOverview }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchOverview({ user_id, case_overview, action }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/new_case`, {
      method: "POST",
      body: JSON.stringify({ user_id, case_overview, action }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error in fetchOverview:", error);
    // console.error("Error in fetchOverview:");
    throw error;
  }
}

// async function newcase(req, res) {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const { userId } = req.body?.courtroomClient?.userBooking;

//   console.log(userId);

//   console.log(file);

//   const extension = path.extname(file.originalname); // Extract the file extension
//   const newFilename = `${userId}${extension}`; // Preserve the extension in the new filename

//   // Create a renamed file object with buffer data
//   const renamedFile = {
//     ...file,
//     originalname: newFilename,
//   };

//   console.log(renamedFile);

//   try {
//     const case_overview = await getOverview({ file: renamedFile });

//     console.log(case_overview);

//     // Find the CourtroomPricingUser document by userId
//     const courtroomPricingUser = await CourtroomPricingUser.findOne({ userId });

//     if (!courtroomPricingUser) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ error: "User not found" });
//     }

//     console.log(courtroomPricingUser);

//     // Append the case overview to the user's caseOverview array
//     courtroomPricingUser.caseOverview = case_overview.case_overview;

//     console.log(courtroomPricingUser);

//     // Save the updated CourtroomPricingUser document
//     await courtroomPricingUser.save();

//     console.log(courtroomPricingUser);

//     return res.status(StatusCodes.OK).json(SuccessResponse({ case_overview }));
//   } catch (error) {
//     const errorResponse = ErrorResponse({}, error);
//     return res
//       .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
//       .json(errorResponse);
//   }
// }
// async function getOverview({ file }) {
//   try {
//     // Dynamically import node-fetch
//     const fetch = (await import("node-fetch")).default;

//     const formData = new FormData();
//     formData.append("file", file.buffer, {
//       filename: file.originalname,
//       contentType: file.mimetype,
//     });

//     const response = await fetch(`${COURTROOM_API_ENDPOINT}/new_case`, {
//       method: "POST",
//       body: formData,
//       headers: formData.getHeaders(), // Ensure correct headers are set
//     });

//     if (!response.ok) {
//       const errorText = await response.text(); // Get the error message from the response
//       throw new Error(
//         `HTTP error! status: ${response.status}, message: ${errorText}`
//       );
//     }

//     const responseData = await response.json();
//     return responseData;
//   } catch (error) {
//     console.error("Error in getOverview:", error);
//     throw error;
//   }
// }

async function newcase1(req, res) {
  const files = req.files; // This will be an array of file objects
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  // console.log(files);

  const { userId } = req.body?.courtroomClient?.userBooking;
  const { _id } = req.body?.courtroomClient?.userBooking;
  const { key } = req.body?.courtroomClient?.userBooking;
  // const userId = "f497c76b-2894-4636-8d2b-6391bc6bccdc";
  console.log(userId);
  const { isMultilang, action, language } = req.body;

  try {
    // Rename only the first file and prepare the data object for getOverview
    const formData = new FormData();

    console.log(formData);

    // const fileBody = {};
    fileNameArray = [];
    const folderName = _id.toString();
    console.log(folderName);

    // Rename the first file to `file`
    const fileKeys = Object.keys(files);

    // Using Promise.all to handle asynchronous file uploads
    await Promise.all(
      fileKeys.map(async (key, index) => {
        const file = files[key][0]; // Get the first file from each key

        // Generate a UUID
        const uniqueId = uuidv4();

        console.log(file.originalname);
        const extension = path.extname(file.originalname);
        const newFilename = `${uniqueId}${extension}`; // Rename the first file

        fileNameArray[index] = newFilename;
        // Create a renamed file object with buffer data
        const renamedFile = {
          ...file,
          originalname: newFilename,
        };

        await uploadfileToBucker(renamedFile, folderName);
      })
    ).then(async () => {
      let case_overview;

      if (isMultilang) {
        case_overview = await getOverviewMultilang1({
          user_id: userId,
          file: fileNameArray,
          bucket_name: "ai_courtroom",
          folder_name: folderName + "/",
          action,
          language,
        });
      } else {
        case_overview = await getOverview1({
          user_id: userId,
          file: fileNameArray,
          bucket_name: "ai_courtroom",
          folder_name: folderName + "/",
          action,
        });
      }

      console.log(case_overview);

      return res
        .status(StatusCodes.OK)
        .json(SuccessResponse({ case_overview }));
    });
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function newcase2(req, res) {
  const file = req.file;
  const { _id } = req.body?.courtroomClient?.userBooking;

  const folderName = _id.toString();
  // const folderName = "dummy";

  if (!file) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  try {
    // const userId = "progressBar"; // Assuming you have user authentication
    // const uniqueId = uuidv4();

    // Generate a UUID
    const uniqueId = uuidv4();

    console.log(file.originalname);
    const extension = path.extname(file.originalname);
    const newFilename = `${uniqueId}${extension}`; // Rename the first file

    // Create a renamed file object with buffer data
    const renamedFile = {
      ...file,
      originalname: newFilename,
    };

    // Define the file path in the user's folder
    const filePath = `${folderName}/${newFilename}`;

    // Create a resumable upload session
    const blob = bucket.file(filePath);
    const options = {
      resumable: true,
      contentType: file.mimetype,
      origin: [
        "https://courtroom-dev.netlify.app",
        "https://courtroom.clawlaw.in",
        "http://localhost:3001",
      ],
    };

    const [uploadResponse] = await blob.createResumableUpload(options);
    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        uploadUrl: uploadResponse, // The resumable upload URL that can be used to upload chunks
        filePath: filePath,
        fileName: newFilename,
      })
    );

    // let case_overview;

    // if (isMultilang) {
    //   case_overview = await getOverviewMultilang1({
    //     user_id: userId,
    //     file: fileNameArray,
    //     bucket_name: "ai_courtroom",
    //     folder_name: folderName + "/",
    //   });
    // } else {
    //   case_overview = await getOverview1({
    //     user_id: userId,
    //     file: fileNameArray,
    //     bucket_name: "ai_courtroom",
    //     folder_name: folderName + "/",
    //   });
    // }

    // console.log(case_overview);
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getoverviewFormfilename(req, res) {
  try {
    const { fileNameArray, isMultilang, action, language } = req.body;
    const { userId } = req.body?.courtroomClient?.userBooking;

    const { _id } = req.body?.courtroomClient?.userBooking;

    const folderName = _id.toString();

    let case_overview;

    if (isMultilang) {
      case_overview = await getOverviewMultilang1({
        user_id: userId,
        file: fileNameArray,
        bucket_name: "ai_courtroom",
        folder_name: folderName + "/",
        action: action,
        language,
      });
    } else {
      case_overview = await getOverview1({
        user_id: userId,
        file: fileNameArray,
        bucket_name: "ai_courtroom",
        folder_name: folderName + "/",
        action: action,
      });
    }

    return res.status(StatusCodes.OK).json(SuccessResponse(case_overview));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getOverview1(body) {
  console.log(body);
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${COURTROOM_API_ENDPOINT}/new_case1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error in getOverview:", error);
    // console.error("Error in getOverview:");
    throw error;
  }
}

async function getOverviewMultilang1(body) {
  console.log(body);

  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/new_case_multilang1`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error in getOverview:", error);
    // console.error("Error in getOverview:");
    throw error;
  }
}

async function caseSummary(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;

    const fetchedCaseSummary = await fetchCaseSummary({ user_id });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ fetchedCaseSummary }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchCaseSummary(body) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/case_summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error in fetchCaseSummary:", error);
    throw error;
  }
}

async function edit_case(req, res) {
  const { case_overview } = req.body;

  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  // console.log(req.body, " this is body");
  try {
    const editedArgument = await FetchEdit_Case({ user_id, case_overview });

    // Find the CourtroomPricingUser document by userId
    const courtroomPricingUser = await CourtroomPricingUser.findOne({
      userId: user_id,
    });

    if (!courtroomPricingUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    const uniqueId = uuidv4();

    // Append the case overview to the user's caseOverview array
    courtroomPricingUser.caseOverview = editedArgument.case_overview;
    courtroomPricingUser.caseId = uniqueId;
    // console.log(courtroomPricingUser);

    // Save the updated CourtroomPricingUser document
    await courtroomPricingUser.save();

    // console.log(courtroomPricingUser);

    return res.status(StatusCodes.OK).json(SuccessResponse({ editedArgument }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchEdit_Case(body) {
  // console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/edit_case`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  // console.log(response);
  return response.json();
}

async function getCaseOverview(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  console.log(user_id);
  try {
    // Find the CourtroomPricingUser document by userId
    const courtroomPricingUser = await CourtroomPricingUser.findOne({
      userId: user_id,
    });

    console.log(courtroomPricingUser);

    if (!courtroomPricingUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // console.log(courtroomPricingUser);

    // Append the case overview to the user's caseOverview array
    const case_overview = courtroomPricingUser.caseOverview;

    // console.log(case_overview);
    return res.status(StatusCodes.OK).json(SuccessResponse({ case_overview }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function user_arguemnt(req, res) {
  const { argument, argument_index } = req.body;
  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  try {
    const argumentIndex = await Fetch_argument_index({
      user_id,
      argument,
      argument_index,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse({ argumentIndex }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function Fetch_argument_index(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/user_argument`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log(response);
  return response.json();
}

async function lawyer_arguemnt(req, res) {
  const { argument_index, action } = req.body;
  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  try {
    const lawyerArguemnt = await FetchLawyer_arguemnt({
      user_id,
      argument_index,
      action,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse({ lawyerArguemnt }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchLawyer_arguemnt(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/lawyer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log(response);
  return response.json();
}

async function judge_arguemnt(req, res) {
  const { argument_index, action } = req.body;
  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  try {
    const judgeArguemnt = await FetchJudge_arguemnt({
      user_id,
      argument_index,
      action,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse({ judgeArguemnt }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchJudge_arguemnt(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/judge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log(response);
  return response.json();
}

async function summary(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const summary = await FetchSummary({ user_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ summary }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    console.log(error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchSummary(body) {
  try {
    console.log(body);
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const res = await response.json();
    return res;
    // console.log(res);
    // return res;
  } catch (error) {
    console.error("Network response was not ok:", error);
    throw error;
  }
}

async function relevantCasesJudgeLawyer(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { text_input } = req.body;
    const relevantCases = await FetchRelevantCasesJudgeLawyer({
      user_id,
      text_input,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse({ relevantCases }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    console.log(error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchRelevantCasesJudgeLawyer(body) {
  try {
    console.log(body);
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/relevant_cases_judge_lawyer_updated`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const res = response.json();
    console.log(res);

    return res;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function setFavor(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const favor = req.body.favor;
  try {
    const updateUserFavor = await CourtroomPricingUser.findOneAndUpdate(
      { userId: user_id },
      { drafteFavor: favor }
    );
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ message: "Favor updated", updateUserFavor }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    console.log(error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getDraft(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  let favor = req.body?.courtroomClient?.userBooking?.drafteFavor;
  if (favor === undefined) favor = "";
  try {
    const draft = await FetchGetDraft({ user_id, favor });
    return res.status(StatusCodes.OK).json(SuccessResponse({ draft }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchGetDraft(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/generate_draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    console.log(text);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const resp = await response.json();

  console.log(resp);

  return resp;
}

async function changeState(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  try {
    const changeState = await FetchChangeState({ user_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ changeState }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchChangeState(body) {
  try {
    console.log(body);

    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/change_states`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    console.log("done");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const details = await response.json();

    return details;
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
}

async function restCase(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const restDetail = await FetchRestCase({ user_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ restDetail }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchRestCase(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/rest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log(response);
  return response.json();
}

async function endCase(req, res) {
  // const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const { userId } = req.body;
  try {
    const endCase = await FetchEndCase({ user_id: userId });

    // save into database

    const { User_id } =
      await CourtroomPricingService.getClientByUseridForEndCase(userId);

    const isNewCaseHistoryInDB = await CourtroomPricingService.isNewCaseHistory(
      User_id
    );

    if (isNewCaseHistoryInDB) {
      await CourtroomPricingService.OverridestoreCaseHistory(User_id, endCase);
    } else {
      await CourtroomPricingService.storeCaseHistory(User_id, endCase);
    }

    return res.status(StatusCodes.OK).json(SuccessResponse({ endCase }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchEndCase(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log(response);
  return response.json();
}

async function hallucination_questions(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const hallucinationQuestions = await FetchHallucinationQuestions({
      user_id,
    });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ hallucinationQuestions }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchHallucinationQuestions(body) {
  console.log(body);
  const response = await fetch(
    `${COURTROOM_API_ENDPOINT}/api/hallucination_questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const details = await response.json();
  console.log(details);
  return details;
}

async function CaseHistory(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const caseHistory = await FetchCaseHistory({ user_id });

    // save into database or update database with new data if case history is already present in the database
    const { User_id } = await CourtroomPricingService.getClientByUserid(
      user_id
    );

    const isNewCaseHistoryInDB = await CourtroomPricingService.isNewCaseHistory(
      User_id
    );

    if (isNewCaseHistoryInDB) {
      await CourtroomPricingService.OverridestoreCaseHistory(
        User_id,
        caseHistory
      );
    } else {
      await CourtroomPricingService.storeCaseHistory(User_id, caseHistory);
    }

    return res.status(StatusCodes.OK).json(SuccessResponse({ caseHistory }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchCaseHistory(body) {
  try {
    console.log("Request Body:", body);

    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // console.log("Response Status:", response.status);
    // console.log("Response Headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text(); // Capture error text
      console.log(errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    // console.log("Response Data:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error in FetchCaseHistory:", error);
    throw error;
  }
}

async function downloadCaseHistory(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const response = await axios.get(
    "https://res.cloudinary.com/dumjofgxz/image/upload/v1725968109/gptclaw_l8krlt.png",
    {
      responseType: "arraybuffer",
    }
  );
  const imageBuffer = Buffer.from(response.data, "binary");
  try {
    const caseHistory = await FetchCaseHistory({ user_id });

    const doc = new PDFDocument();
    const regularFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    const boldFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Bold.ttf"
    );

    // Register both regular and bold fonts
    doc.registerFont("NotoSans", regularFontPath);
    doc.registerFont("NotoSans-Bold", boldFontPath);

    doc.font("NotoSans");

    // Define a function to add bold headings
    const addBoldHeading = (heading) => {
      doc.font("NotoSans-Bold").fontSize(14).text(heading, { align: "left" });
      doc.font("NotoSans").fontSize(12);
    };

    // Add the header
    doc
      .font("NotoSans-Bold")
      .fontSize(14)
      .text("Case History", { align: "center" });

    // Iterate through each argument, counter-argument, judgement, and potential objection
    for (let i = 0; i < caseHistory.argument.length; i++) {
      addBoldHeading("Argument:");
      doc.text(caseHistory.argument[i]);
      doc.moveDown();

      addBoldHeading("Counter Argument:");
      doc.text(caseHistory.counter_argument[i]);
      doc.moveDown();

      addBoldHeading("Potential Objection:");
      doc.text(caseHistory.potential_objection[i]);
      doc.moveDown();

      addBoldHeading("Judgement:");
      doc.text(caseHistory.judgement[i]);
      doc.moveDown();
    }

    // Add verdict at the end
    addBoldHeading("Verdict:");
    doc.text(caseHistory.verdict); // Add watermark on the first page
    // Define the watermark function

    // Collect the PDF in chunks
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // Load the generated PDF to add watermark on every page
      const { PDFDocument: LibPDFDocument, rgb } = require("pdf-lib");
      const pdfDoc = await LibPDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const watermarkImage = await pdfDoc.embedPng(imageBuffer);

      const watermarkText = "CONFIDENTIAL";

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const imageWidth = 400; // Adjust size as needed
        const imageHeight =
          (imageWidth / watermarkImage.width) * watermarkImage.height; // Maintain aspect ratio
        const xPosition = (width - imageWidth) / 2;
        const yPosition = (height - imageHeight) / 2;

        page.drawImage(watermarkImage, {
          x: xPosition,
          y: yPosition,
          width: imageWidth,
          height: imageHeight,
          opacity: 0.3, // Adjust opacity as needed
        });
      });

      // Save the final PDF with watermark
      const watermarkedPdfBytes = await pdfDoc.save();
      res.setHeader(
        "Content-disposition",
        `attachment; filename="case_history_${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(watermarkedPdfBytes));
    });

    // End the PDF document
    doc.end();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function downloadSessionCaseHistory(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const response = await axios.get(
    "https://res.cloudinary.com/dumjofgxz/image/upload/v1725968109/gptclaw_l8krlt.png",
    {
      responseType: "arraybuffer",
    }
  );
  const imageBuffer = Buffer.from(response.data, "binary");

  console.log(user_id);
  try {
    const { User_id } = await CourtroomPricingService.getClientByUserid(
      user_id
    );

    if (!User_id) {
      throw new Error("User not found");
    }

    const FetchedCaseHistorys =
      await CourtroomPricingService.getSessionCaseHistory(User_id);
    console.log(FetchedCaseHistorys);

    const caseHistorys = FetchedCaseHistorys.history;

    // console.log(caseHistorys);

    const doc = new PDFDocument();
    const regularFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    const boldFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Bold.ttf"
    );

    // Register both regular and bold fonts
    doc.registerFont("NotoSans", regularFontPath);
    doc.registerFont("NotoSans-Bold", boldFontPath);

    doc.font("NotoSans");

    // Define a function to add bold headings
    const addBoldHeading = (heading) => {
      doc.font("NotoSans-Bold").fontSize(14).text(heading, { align: "left" });
      doc.font("NotoSans").fontSize(12);
    };

    // Add the header
    doc
      .font("NotoSans-Bold")
      .fontSize(18)
      .text("Case Sesion History", { align: "center" });

    let caseCount = 1;

    for (let caseHistory of caseHistorys) {
      // Add the header
      doc
        .font("NotoSans-Bold")
        .fontSize(16)
        .text(`Case ${caseCount}`, { align: "left" });
      doc.moveDown();

      caseCount = caseCount + 1;

      // Iterate through each argument, counter-argument, judgement, and potential objection
      for (let i = 0; i < caseHistory.argument.length; i++) {
        addBoldHeading("Argument:");
        doc.text(caseHistory.argument[i]);
        doc.moveDown();

        addBoldHeading("Counter Argument:");
        doc.text(caseHistory.counter_argument[i]);
        doc.moveDown();

        addBoldHeading("Potential Objection:");
        doc.text(caseHistory.potential_objection[i]);
        doc.moveDown();

        addBoldHeading("Judgement:");
        doc.text(caseHistory.judgement[i]);
        doc.moveDown();
      }

      // Add verdict at the end
      addBoldHeading("Verdict:");
      doc.text(caseHistory.verdict);
    }

    // Collect the PDF in chunks
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // Load the generated PDF to add watermark on every page
      const { PDFDocument: LibPDFDocument, rgb } = require("pdf-lib");
      const pdfDoc = await LibPDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const watermarkImage = await pdfDoc.embedPng(imageBuffer);

      const watermarkText = "CONFIDENTIAL";

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const imageWidth = 400; // Adjust size as needed
        const imageHeight =
          (imageWidth / watermarkImage.width) * watermarkImage.height; // Maintain aspect ratio
        const xPosition = (width - imageWidth) / 2;
        const yPosition = (height - imageHeight) / 2;

        page.drawImage(watermarkImage, {
          x: xPosition,
          y: yPosition,
          width: imageWidth,
          height: imageHeight,
          opacity: 0.3, // Adjust opacity as needed
        });
      });

      // Save the final PDF with watermark
      const watermarkedPdfBytes = await pdfDoc.save();
      res.setHeader(
        "Content-disposition",
        `attachment; filename="session_case_history_${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(watermarkedPdfBytes));

      // const pdfBuffer = Buffer.concat(chunks);
      // res.setHeader(
      //   "Content-disposition",
      //   `attachment; filename="case_history_${user_id}.pdf"`
      // );
      // res.setHeader("Content-type", "application/pdf");
      // res.send(pdfBuffer);
    });

    // End the PDF document
    doc.end();
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

const formatText = (text) => {
  return text
    .replace(/\\n\\n/g, "\n \n")
    .replace(/\\n/g, "\n")
    .replace(/\\/g, " ");
};

async function downloadFirtDraft(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  let favor = req.body?.courtroomClient?.userBooking?.drafteFavor;
  if (favor === undefined) favor = "";
  const response = await axios.get(
    "https://res.cloudinary.com/dumjofgxz/image/upload/v1725968109/gptclaw_l8krlt.png",
    {
      responseType: "arraybuffer",
    }
  );
  const imageBuffer = Buffer.from(response.data, "binary");

  // const user_id = req.body?.userId;x
  try {
    const draft = await FetchGetDraft({ user_id, favor });

    const revelentCaseLaws = await FetchRelevantCases({ user_id });

    const relevant = revelentCaseLaws.relevant_case_law;

    const draftDetail = draft.detailed_draft;

    const formattedRelevantCases = formatText(relevant);

    console.log(formattedRelevantCases);

    // console.log(draftDetail);

    const doc = new PDFDocument();
    const regularFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    const boldFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Bold.ttf"
    );

    // Register both regular and bold fonts
    doc.registerFont("NotoSans", regularFontPath);
    doc.registerFont("NotoSans-Bold", boldFontPath);

    doc.font("NotoSans");

    // Define a function to add bold headings
    const addBoldHeading = (heading) => {
      doc.font("NotoSans-Bold").fontSize(14).text(heading, { align: "left" });
      doc.font("NotoSans").fontSize(12);
    };

    // Add the header
    doc
      .font("NotoSans-Bold")
      .fontSize(14)
      .text("First Draft", { align: "center" });

    doc.moveDown();

    doc.font("NotoSans").fontSize(12);

    doc.text(draftDetail);

    doc.moveDown();

    // Add the header
    doc
      .font("NotoSans-Bold")
      .fontSize(14)
      .text("Relevant Case Law", { align: "center" });

    doc.moveDown();

    doc.font("NotoSans").fontSize(12);

    doc.text(formattedRelevantCases);

    // Collect the PDF in chunks
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // Load the generated PDF to add watermark on every page
      const { PDFDocument: LibPDFDocument, rgb } = require("pdf-lib");
      const pdfDoc = await LibPDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const watermarkImage = await pdfDoc.embedPng(imageBuffer);

      const watermarkText = "CONFIDENTIAL";

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const imageWidth = 400; // Adjust size as needed
        const imageHeight =
          (imageWidth / watermarkImage.width) * watermarkImage.height; // Maintain aspect ratio
        const xPosition = (width - imageWidth) / 2;
        const yPosition = (height - imageHeight) / 2;

        page.drawImage(watermarkImage, {
          x: xPosition,
          y: yPosition,
          width: imageWidth,
          height: imageHeight,
          opacity: 0.3, // Adjust opacity as needed
        });
      });

      // Save the final PDF with watermark
      const watermarkedPdfBytes = await pdfDoc.save();
      res.setHeader(
        "Content-disposition",
        `attachment; filename="session_case_history_${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(watermarkedPdfBytes));

      // const pdfBuffer = Buffer.concat(chunks);
      // res.setHeader(
      //   "Content-disposition",
      //   `attachment; filename="draft_${user_id}.pdf"`
      // );
      // res.setHeader("Content-type", "application/pdf");
      // res.send(pdfBuffer);
    });

    // End the PDF document
    doc.end();
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function download(req, res) {
  const { data, type } = req.body;
  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  const response = await axios.get(
    "https://res.cloudinary.com/dumjofgxz/image/upload/v1725968109/gptclaw_l8krlt.png",
    {
      responseType: "arraybuffer",
    }
  );
  const imageBuffer = Buffer.from(response.data, "binary");

  try {
    //   const draft = await FetchGetDraft({ user_id });

    //   const draftDetail = draft.detailed_draft;

    const doc = new PDFDocument();
    const regularFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    const boldFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Bold.ttf"
    );

    // Register both regular and bold fonts
    doc.registerFont("NotoSans", regularFontPath);
    doc.registerFont("NotoSans-Bold", boldFontPath);

    doc.font("NotoSans");

    // Define a function to add bold headings
    const addBoldHeading = (heading) => {
      doc.font("NotoSans-Bold").fontSize(14).text(heading, { align: "left" });
      doc.font("NotoSans").fontSize(12);
    };

    // Add the header
    doc.font("NotoSans-Bold").fontSize(14).text(type, { align: "center" });

    doc.moveDown();

    doc.font("NotoSans").fontSize(12);

    doc.text(data);

    // Collect the PDF in chunks
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // Load the generated PDF to add watermark on every page
      const { PDFDocument: LibPDFDocument, rgb } = require("pdf-lib");
      const pdfDoc = await LibPDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const watermarkImage = await pdfDoc.embedPng(imageBuffer);

      const watermarkText = "CONFIDENTIAL";

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const imageWidth = 400; // Adjust size as needed
        const imageHeight =
          (imageWidth / watermarkImage.width) * watermarkImage.height; // Maintain aspect ratio
        const xPosition = (width - imageWidth) / 2;
        const yPosition = (height - imageHeight) / 2;

        page.drawImage(watermarkImage, {
          x: xPosition,
          y: yPosition,
          width: imageWidth,
          height: imageHeight,
          opacity: 0.3, // Adjust opacity as needed
        });
      });

      // Save the final PDF with watermark
      const watermarkedPdfBytes = await pdfDoc.save();
      res.setHeader(
        "Content-disposition",
        `attachment; filename="session_case_history_${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(watermarkedPdfBytes));

      //   const pdfBuffer = Buffer.concat(chunks);
      //   res.setHeader(
      //     "Content-disposition",
      //     `attachment; filename="draft${user_id}.pdf"`
      //   );
      //   res.setHeader("Content-type", "application/pdf");
      //   res.send(pdfBuffer);
    });

    // End the PDF document
    doc.end();
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getHistory(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const caseHistory = await FetchCaseHistory({ user_id });

    res.status(StatusCodes.OK).json(SuccessResponse({ caseHistory }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function evidence(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const { action, evidence_text } = req.body;
  try {
    const fetchedEvidence = await getEvidence({
      user_id,
      action,
      evidence_text,
    });
    res.status(StatusCodes.OK).json(SuccessResponse({ fetchedEvidence }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getEvidence(body) {
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/evidence`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch evidence");
  }
}

async function askQuery(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const { action, query } = req.body;
  try {
    const fetchedAskQuery = await fetchAskQuery({
      user_id,
      action,
      query,
    });
    res.status(StatusCodes.OK).json(SuccessResponse({ fetchedAskQuery }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchAskQuery(body) {
  console.log(body);
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/ask_query`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch ask query");
  }
}

async function resetUserId(req, res) {
  const { courtroomClient } = req.body;
  try {
    console.log(courtroomClient);

    let userId;

    const userId1 = await registerNewCourtRoomPricingUser();
    const updateUser =
      await SpecificLawyerCourtroomPricingUser.findByIdAndUpdate(
        courtroomClient._id,
        { userId: userId1.user_id },
        { new: true }
      );
    userId = updateUser.userId;

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        username: courtroomClient.name,
        courtroomFeatures: courtroomClient.features,
        userId: courtroomClient.userId,
        phoneNumber: courtroomClient.phoneNumber,
        totalHours: courtroomClient.totalHours,
        totalUsedHours: courtroomClient.totalUsedHours,
      })
    );
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function relevantCaseLaw(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const relevantCases = await FetchRelevantCases({ user_id });
    res.status(StatusCodes.OK).json(SuccessResponse({ relevantCases }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchRelevantCases({ user_id }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/relevant_case_law_updated`,
      {
        method: "POST",
        body: JSON.stringify({ user_id }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch relevant cases");
  }
}

async function testimonyQuestions(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { testimony_statement } = req.body;
    const testimonyQuestions = await FetchTestimonyQuestions({
      user_id,
      testimony_statement,
    });
    res.status(StatusCodes.OK).json(SuccessResponse({ testimonyQuestions }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchTestimonyQuestions({ user_id, testimony_statement }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/testimony_questions`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, testimony_statement }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch testimony questions");
  }
}

async function application(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { action } = req.body;
    let favor = req.body?.courtroomClient?.userBooking?.drafteFavor;
    if (favor === undefined) favor = "";
    const application = await fetchApplication({ user_id, action, favor });
    res.status(StatusCodes.OK).json(SuccessResponse({ application }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchApplication({ user_id, action, favor }) {
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/application`, {
      method: "POST",
      body: JSON.stringify({ user_id, action, favor }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch application");
  }
}

async function caseSearch(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { query } = req.body;
    const caseSearch = await FetchCaseSearch({ user_id, query });
    res.status(StatusCodes.OK).json(SuccessResponse({ caseSearch }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchCaseSearch({ user_id, query }) {
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/case_search`, {
      method: "POST",
      body: JSON.stringify({ user_id, query }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch case search");
  }
}

async function viewDocument(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { folder_id, case_id } = req.body;
    const viewDocument = await FetchViewDocument({ folder_id, case_id });
    res.status(StatusCodes.OK).json(SuccessResponse({ viewDocument }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchViewDocument({ folder_id, case_id }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/view_document`,
      {
        method: "POST",
        body: JSON.stringify({ folder_id, case_id }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch view document");
  }
}

async function printCaseDetails(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { filename } = req.body;
    const FetchedprintCaseDetails = await FetchPrintCaseDetails({
      user_id,
      filename,
    });
    res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ FetchedprintCaseDetails }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchPrintCaseDetails({ user_id, filename }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/print_case_details`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, filename }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch print case details");
  }
}

async function editApplication(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { query } = req.body;
    const editApplication = await fetchEditApplication({ user_id, query });
    res.status(StatusCodes.OK).json(SuccessResponse({ editApplication }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchEditApplication({ user_id, query }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/edit_application`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, query }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch edit application");
  }
}

async function sidebarCasesearch(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const { context } = req.body;
  try {
    const FetchedSidebarCasesearch = await FetchSidebarCasesearch({
      user_id,
      context,
    });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ FetchedSidebarCasesearch }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchSidebarCasesearch({ user_id, context }) {
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/casesearch`, {
      method: "POST",
      body: JSON.stringify({ user_id, context }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch sidebar case search");
  }
}

async function draftNextAppeal(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    let favor = req.body?.courtroomClient?.userBooking?.drafteFavor;
    if (favor === undefined) favor = "";
    const fetchedDraftNextAppeal = await fetchDraftNextAppeal({
      user_id,
      favor,
    });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ fetchedDraftNextAppeal }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchDraftNextAppeal({ user_id, favor }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/draft_next_appeal`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, favor }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch draft next appeal");
  }
}

async function proApplication(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  let favor = req.body?.courtroomClient?.userBooking?.drafteFavor;
  if (favor === undefined) favor = "";

  const { action } = req.body;
  try {
    const fetchedProApplication = await fetchProApplication({
      user_id,
      favor,
      action,
    });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ fetchedProApplication }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchProApplication({ user_id, favor, action }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/pro_application`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, favor, action }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch pro application");
  }
}

async function editProApplication(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { query } = req.body;
    const editProApplication = await fetchEditProApplication({
      user_id,
      query,
    });
    res.status(StatusCodes.OK).json(SuccessResponse({ editProApplication }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchEditProApplication({ user_id, query }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/edit_pro_application`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, query }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch edit pro application");
  }
}

async function documentEvidence(req, res) {
  const files = req.files; // This will be an array of file objects
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const { userId } = req.body?.courtroomClient?.userBooking;

  try {
    let fileNameArray = [];

    const folderName = "test_long_file";

    // Rename the first file to `file`
    const fileKeys = Object.keys(files);

    // Using Promise.all to handle asynchronous file uploads
    await Promise.all(
      fileKeys.map(async (key, index) => {
        const file = files[key][0]; // Get the first file from each key

        // Generate a UUID
        const uniqueId = uuidv4();

        console.log(file.originalname);
        const extension = path.extname(file.originalname);
        const newFilename = `${uniqueId}${extension}`; // Rename the first file

        fileNameArray[index] = newFilename;
        // Create a renamed file object with buffer data
        const renamedFile = {
          ...file,
          originalname: newFilename,
        };

        await uploadfileToBucker(renamedFile, folderName);
      })
    ).then(async () => {
      let evidence = await fetchDodumentEvidence({
        user_id: userId,
        file: fileNameArray,
        bucket_name: "ai_courtroom",
        folder_name: folderName + "/",
      });

      console.log(evidence);

      return res.status(StatusCodes.OK).json(SuccessResponse({ evidence }));
    });
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchDodumentEvidence({
  user_id,
  file,
  bucket_name,
  folder_name,
}) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/document_evidence`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, file, bucket_name, folder_name }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch document evidence");
  }
}

async function generateHypoDraft(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    let favor = req.body?.courtroomClient?.userBooking?.favor;
    if (favor === undefined) favor = "";

    const fetchedHypoDraft = await fetchHypoDraft({ user_id, favor });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ fetchedHypoDraft }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchHypoDraft({ user_id, favor }) {
  try {
    const response = await fetch(
      `${COURTROOM_API_ENDPOINT}/api/generate_hypo_draft`,
      {
        method: "POST",
        body: JSON.stringify({ user_id, favor }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseText = await response.json(); // Get the error message from the response
    return responseText; // Return the error message from the response
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch hypo draft");
  }
}

async function consultant(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userBooking?.userId;
    const { query } = req.body;
    const fetchedConsultant = await fetchConsultant({ user_id, query });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ fetchedConsultant }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchConsultant({ user_id, query }) {
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/consultant`, {
      method: "POST",
      body: JSON.stringify({ user_id, query }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch consultant");
  }
}

async function verifyCoupon(req, res) {
  try {
    const { couponCode, phoneNumber } = req.body;
    const fetchedCoupon = await courtroomDiscountCoupon.findOne({ couponCode });
    if (!fetchedCoupon) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse({}, "Coupon not found"));
    }

    if (fetchedCoupon && couponCode === "FIRSTVISIT") {
      const isFirstVisit = await CourtroomPricingService.checkFirtVisit(
        phoneNumber
      );

      if (isFirstVisit) {
        return res.status(StatusCodes.OK).json(
          SuccessResponse({
            phoneNumber: phoneNumber,
            couponCode: fetchedCoupon.couponCode,
            discout: fetchedCoupon.discountPercentage,
          })
        );
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(ErrorResponse({}, "This is only for new user"));
      }
    } else {
      return res.status(StatusCodes.OK).json(
        SuccessResponse({
          phoneNumber: phoneNumber,
          couponCode: fetchedCoupon.couponCode,
          discout: fetchedCoupon.discountPercentage,
        })
      );
    }
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function Courtroomfeedback(req, res) {
  try {
    // const _id = req.body?.courtroomClient?.userBooking?._id;
    const { rating, feedback, userId } = req.body;

    const { User_id } =
      await CourtroomPricingService.getClientByUseridForEndCase(userId);

    const SetFeedback = await CourtroomPricingService.setFeedback(
      User_id,
      rating,
      feedback
    );

    return res.status(StatusCodes.OK).json(SuccessResponse({ SetFeedback }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function resetPasswordSendOtp(req, res) {
  try {
    const email = req.body.email;
    const user = await CourtroomPricingService.getUserByEmail(email);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, "User not found"));
    }
    const otp = CourtroomPricingService.generateOTP();
    await sendOTP(email, otp);
    await ResetPassword.create({
      phoneOrEmail: email,
      otp: otp,
    });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ message: "OTP sent" }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function resetPasswordVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const resetPassword = await ResetPassword.findOne({
      phoneOrEmail: email,
      otp: otp,
    });
    if (!resetPassword) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, "Invalid OTP"));
    }
    const token = ResetPasswordCreateToken({ email });
    await resetPassword.deleteOne();
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ message: "OTP verified", token }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function resetPasswordResetPassword(req, res) {
  try {
    const { email, password } = req.body;
    const user = await CourtroomPricingService.getUserByEmail(email);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, "User not found"));
    }
    await CourtroomPricingService.updateUserPassword(email, password);
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ message: "Password reset successfully" }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function AddContactUsQuery(req, res) {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    preferredContactMode,
    businessName,
    query,
    from,
  } = req.body;

  try {
    const queryResponse = await CourtroomPricingService.addContactUsQuery(
      firstName,
      lastName,
      email,
      phoneNumber,
      preferredContactMode,
      businessName,
      query,
      from
    );

    return res.status(StatusCodes.OK).json(SuccessResponse({ queryResponse }));
  } catch (error) {
    // console.error(error.message);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getSessionCaseHistory(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const caseHistory = await FetchCaseHistory({ user_id });

    // save into database or update database with new data if case history is already present in the database
    const { User_id, Booking_id } =
      await CourtroomPricingService.getClientByUserid(user_id);

    console.log(User_id, Booking_id);

    await CourtroomPricingService.storeCaseHistory(
      User_id,
      Booking_id,
      caseHistory
    );

    const FetchedCaseHistorys =
      await CourtroomPricingService.getSessionCaseHistory(User_id);
    console.log(FetchedCaseHistorys);

    const caseHistorys = FetchedCaseHistorys.history;

    res.status(StatusCodes.OK).json(SuccessResponse({ caseHistorys }));
  } catch (error) {
    console.error(error.message);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}
async function getpdf(req, res) {
  const { document } = req.body;
  console.log(document);
  try {
    // Define file path to save PDF
    // const filePath = path.join(__dirname, "Rent_Agreement.pdf");
    // const response = await axios.get(
    //   "https://res.cloudinary.com/dumjofgxz/image/upload/v1725968109/gptclaw_l8krlt.png",
    //   {
    //     responseType: "arraybuffer",
    //   }
    // );
    // console.log(response.data);

    // const imageBuffer = Buffer.from(response.data, "binary");

    console.log("imagepath");
    const regularFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Regular.ttf"
    );
    const boldFontPath = path.join(
      __dirname,
      "..",
      "fonts",
      "NotoSans-Bold.ttf"
    );
    console.log("hjkvh");
    const doc = new PDFDocument();
    doc.registerFont("NotoSans", regularFontPath);
    doc.registerFont("NotoSans-Bold", boldFontPath);

    doc.font("NotoSans");
    console.log("hg");

    // // Pipe the document to a file or to response
    // doc.pipe(fs.createWriteStream(filePath));

    // // Pipe the document to the response (for direct download)
    // doc.pipe(res);
    // doc.opacity(0.5);
    // doc.image(imageBuffer, {
    //   fit: [600, 600],
    //   opacity: 0.1,
    //   align: "center",
    //   valign: "center",
    // });
    // doc.opacity(1);

    // Add content to the PDF
    // doc.fontSize(20).text("RENT AGREEMENT", { align: "center" });

    // doc.moveDown();
    const textLines = document.split("\\n");
    // const textLines = ["asdadasda"];
    console.log(textLines);
    // cosnole.log("hi");
    for (var i = 0; i < textLines.length; i++) {
      doc.text(textLines[i]);
      doc.moveDown();
    }

    // textLines.map((line, i) => {
    //   cosnole.log(line);

    //   doc.text(line);
    //   doc.moveDown(); // Adds space between lines
    // });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      console.log("hi");

      const pdfBuffer = Buffer.concat(chunks);

      // Load the generated PDF to add watermark on every page
      const { PDFDocument: LibPDFDocument, rgb } = require("pdf-lib");
      const pdfDoc = await LibPDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const imagePath = path.join(__dirname, "..", "fonts", "gptclaw.png"); // Update with the correct image path
      console.log("imagepath");
      const imageBuffer = fs.readFileSync(imagePath);
      const watermarkImage = await pdfDoc.embedPng(imageBuffer);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const imageWidth = 400; // Adjust size as needed
        const imageHeight =
          (imageWidth / watermarkImage.width) * watermarkImage.height; // Maintain aspect ratio
        const xPosition = (width - imageWidth) / 2;
        const yPosition = (height - imageHeight) / 2;

        page.drawImage(watermarkImage, {
          x: xPosition,
          y: yPosition,
          width: imageWidth,
          height: imageHeight,
          opacity: 0.3, // Adjust opacity as needed
        });
      });
      console.log("hi");

      // Save the final PDF with watermark
      const watermarkedPdfBytes = await pdfDoc.save();
      res.setHeader("Content-disposition", `attachment; filename="new.pdf"`);
      res.setHeader("Content-type", "application/pdf");
      res.send(Buffer.from(watermarkedPdfBytes));
    });

    doc.end();

    // Set the response headers for download
  } catch (e) {}
}

// storing time =>

async function storeTime(req, res) {
  const { phoneNumber, engagementTime } = req.body;
  console.log(phoneNumber);
  const time = engagementTime / 3600;
  try {
    const { userBooking } =
      await CourtroomPricingService.getClientByPhoneNumber(phoneNumber);
    // console.log(userBooking);
    // Find the CourtroomUserPlan document by userId and planId and increment usedHours by incrementBy
    const updatedPlan = await CourtroomUserPlan.findOneAndUpdate(
      { user: userBooking._id }, // Search criteria
      { $inc: { usedHours: time } }, // Increment the usedHours by the specified value
      { new: true } // Return the updated document
    );

    return res.status(StatusCodes.OK).json(SuccessResponse({ updatedPlan }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getAllPlans(req, res) {
  try {
    return res.send(await courtroomPlan.find({}));
  } catch (e) {}
}

async function addPlanUser(req, res) {
  try {
    const { userId, planId, endDate } = req.body;

    const respo = await CourtroomPricingService.addNewPlan(
      userId,
      planId,
      endDate
    );
    return res.status(StatusCodes.OK).json(SuccessResponse(respo));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function BookCourtroomSlot(req, res) {
  try {
    const { date, time } = req.body;
    const phoneNumber = req.body?.courtroomClient?.userBooking?.phoneNumber;

    const userBooking = req.body?.courtroomClient?.userBooking?.booking;

    const pricingUser = await CourtroomUserPlan.findOne({
      user: req.body?.courtroomClient?.userBooking?._id,
    }).populate("plan");

    if (pricingUser.plan.planName !== "Limited Time Offer") {
      return res.status(200).json({ message: "You are not able to book slot" });
    }

    console.log(userBooking?.date);

    // Now returns current IST date/time
    const now = moment().startOf("day").toISOString();
    const nowHours = moment().toISOString();

    let currentDate = new Date(now);
    let currHous = new Date(nowHours);

    const requireBooking = new Date(date);
    // requireBooking.setHours(0, 0, 0, 0);
    // const currentDate = new Date(currentDate);
    const bookedDate =
      userBooking?.date === undefined ? null : new Date(userBooking?.date);

    console.log(requireBooking);
    console.log(currentDate);
    console.log(bookedDate);

    const requireBookingStr = requireBooking.toISOString().split("T")[0]; // "2025-05-09"
    const currentDateStr = currentDate.toISOString().split("T")[0]; // "2025-05-10"
    const bookedDateStr =
      userBooking?.date === undefined
        ? null
        : bookedDate.toISOString().split("T")[0]; // "2025-05-10"

    if (requireBookingStr === currentDateStr) {
      if (time < currHous.getHours()) {
        return res.status(200).json({ message: "You can't book past time1" });
      }
    }

    if (requireBookingStr < currentDateStr) {
      return res.status(200).json({ message: "You can't book past time" });
    }

    if (bookedDateStr !== null && bookedDateStr === currentDateStr) {
      if (time > currHous.getHours()) {
        return res.status(200).json({ message: "You already booked a slot" });
      }
    }

    if (bookedDateStr !== null && bookedDateStr > currentDateStr) {
      return res.status(200).json({ message: "You already booked a slot" });
    }

    const userPlan = await CourtroomUserPlan.findOne({
      user: req.body?.courtroomClient?.userBooking._id,
    });

    const bookingDate = new Date(date);

    const planEndDate = new Date(userPlan.endData);
    bookingDate.setHours(0, 0, 0, 0); // Set the time to the booking time
    planEndDate.setHours(0, 0, 0, 0); // Set the time to the booking time
    currentDate.setHours(0, 0, 0, 0); // Set the time to the booking time

    if (
      bookingDate.getTime() === currentDate.getTime() &&
      time < currHous.getHours()
    ) {
      return res.status(200).json({ message: "You can't book past time" });
    }

    // Date range validation
    if (
      bookingDate.getTime() >= currentDate.getTime() &&
      bookingDate.getTime() < planEndDate.getTime()
    ) {
      const bookingObj = {
        date: date,
        time: time,
      };
      const updateBooking = await CourtroomPricingUser.findOneAndUpdate(
        { phoneNumber },
        { booking: bookingObj }, // bookingObj should be a single object
        { new: true }
      );

      return res
        .status(201)
        .json({ message: "booking created", updateBooking });
    } else {
      // Handle invalid booking time
      return res.status(400).json({
        message:
          "Booking date must be between today and your plan end date (exclusive).",
      });
    }
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function DeleteCourtroomSlot(req, res) {
  try {
    const phoneNumber = req.body?.courtroomClient?.userBooking?.phoneNumber;

    const deleteSlot = await CourtroomPricingUser.findOneAndUpdate(
      { phoneNumber },
      { $set: { booking: {} } },
      { new: true }
    );
    console.log(deleteSlot);
    return res.status(200).json({ message: "Slot deleted", deleteSlot });
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function enterCourtroom(req, res) {
  try {
    const phoneNumber = req.body?.courtroomClient?.userBooking?.phoneNumber;

    // Now returns current IST date/time
    const now = moment().startOf("day").toISOString();
    const nowHours = moment().toISOString();

    let currentDate = new Date(now);
    let currHous = new Date(nowHours);

    // Query
    const existsBooking1 = await CourtroomPricingUser.findOne({
      phoneNumber,
      "booking.date": currentDate,
      "booking.time": currHous.getHours(),
    });

    console.log(existsBooking1);

    if (existsBooking1) {
      await existsBooking1.save();

      return res
        .status(StatusCodes.OK)
        .json({ message: "you can enter in this slot" });
    } else {
      return res
        .status(StatusCodes.OK)
        .json({ message: "you do not have any slot right now" });
    }
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  storeTime,
  bookCourtRoom,
  getBookedData,
  loginToCourtRoom,
  newcase,
  user_arguemnt,
  lawyer_arguemnt,
  judge_arguemnt,
  getDraft,
  changeState,
  restCase,
  endCase,
  hallucination_questions,
  CaseHistory,
  edit_case,
  getUserDetails,
  getCaseOverview,
  bookCourtRoomValidation,
  downloadCaseHistory,
  downloadSessionCaseHistory,
  getHistory,
  AddContactUsQuery,
  downloadFirtDraft,
  download,
  adminBookCourtRoom,
  getSessionCaseHistory,
  evidence,
  askQuery,
  resetUserId,
  relevantCaseLaw,
  newCaseText,
  relevantCasesJudgeLawyer,
  testimonyQuestions,
  application,
  caseSearch,
  viewDocument,
  editApplication,
  getpdf,
  setFavor,
  sidebarCasesearch,
  draftNextAppeal,
  newcase1,
  newcase2,
  Courtroomfeedback,
  summary,
  consultant,
  caseSummary,
  adminLoginBookCourtRoom,
  AdminLoginToCourtRoom,
  adminLoginValidation,
  verifyCoupon,
  getoverviewFormfilename,
  proApplication,
  editProApplication,
  documentEvidence,
  printCaseDetails,
  generateHypoDraft,
  createNewPlan,
  getAllPlans,
  resetPasswordSendOtp,
  resetPasswordVerifyOtp,
  resetPasswordResetPassword,
  addPlanUser,
  BookCourtroomSlot,
  enterCourtroom,
  DeleteCourtroomSlot,
};
