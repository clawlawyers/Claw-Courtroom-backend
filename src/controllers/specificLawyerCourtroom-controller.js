const { sendConfirmationEmail } = require("../utils/coutroom/sendEmail");
const { SpecificLawyerCourtroomService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { COURTROOM_API_ENDPOINT } = process.env;
const path = require("path");
const SpecificLawyerCourtroomUser = require("../models/SpecificLawyerCourtroomUser");
const FormData = require("form-data");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const {
  hashPasswordSpecial,
  generateTokenSpecial,
} = require("../utils/SpecificCourtroom/auth");
const { checkUserIdValidity } = require("../utils/common/auth");
const { v4: uuidv4 } = require("uuid");
const {
  uploadfileToBucker,
} = require("../services/specificLawyerCourtroom-service");
const {
  generateEncryptedKey,
  encryption,
  decryption,
  encryptObject,
} = require("../utils/common/encryptionServices");

async function bookCourtRoom(req, res) {
  try {
    const {
      name,
      phoneNumber,
      email,
      Domain,
      startDate,
      endDate,
      recording,
      totalHours,
      features,
    } = req.body;

    // Input validation (basic example, can be extended as per requirements)
    if (
      !name ||
      !phoneNumber ||
      !email ||
      !Domain ||
      !startDate ||
      !endDate ||
      !recording ||
      !totalHours ||
      !features
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const caseOverview = "";

    const respo = await SpecificLawyerCourtroomService.courtRoomBook(
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
    );

    if (respo) {
      res.status(201).send(respo);
    }

    // await sendConfirmationEmail(
    //   email,
    //   name,
    //   phoneNumber,
    //   password,
    //   totalHours,
    // );

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
    const { phoneNumber } = req.body;

    console.log("body is here ", req.body);

    // Check if required fields are provided
    if (!phoneNumber) {
      return res.status(400).send("Missing required fields.");
    }

    const domain = req.domain;

    const resp = await SpecificLawyerCourtroomUser.findOne({
      phoneNumber: phoneNumber,
      // Domain: domain,
    });

    console.log(resp);

    if (resp) {
      return res
        .status(StatusCodes.OK)
        .json(SuccessResponse({ data: "Can enter" }));
    } else {
      throw new Error("Number is not registred");
    }
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
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

    const bookings = await SpecificLawyerCourtroomService.getBookedData(
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
    const response = await SpecificLawyerCourtroomService.loginToCourtRoom(
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

async function getUserDetails(req, res) {
  const { courtroomClient } = req.body;
  try {
    if (courtroomClient.totalHours <= courtroomClient.totalUsedHours) {
      return res.status(StatusCodes.OK).json(
        SuccessResponse({
          message: "You have exceeded your time limit",
        })
      );
    }
    // console.log(courtroomClient);

    let userId;

    if (!courtroomClient.userId) {
      const userId1 = await registerNewCourtRoomUser();
      const updateUser = await SpecificLawyerCourtroomUser.findByIdAndUpdate(
        courtroomClient._id,
        { userId: userId1.user_id, caseOverview: "NA" },
        { new: true }
      );
      userId = updateUser.userId;
      courtroomClient.userId = userId;
    }

    let getEncKey = courtroomClient.key;

    if (!getEncKey) {
      const getKey = await generateEncryptedKey();
      const updateUser = await SpecificLawyerCourtroomUser.findByIdAndUpdate(
        courtroomClient._id,
        { key: getKey },
        { new: true }
      );

      getEncKey = updateUser.key;
    }

    const resp = await checkUserIdValidity(courtroomClient.userId);

    if (resp === "VM Restarted, Create User ID") {
      const userId1 = await registerNewCourtRoomUser();
      console.log(userId1);
      const updateUser = await SpecificLawyerCourtroomUser.findByIdAndUpdate(
        courtroomClient._id,
        { userId: userId1.user_id, caseOverview: "NA" },
        { new: true }
      );
      userId = updateUser.userId;
    }
    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        username: courtroomClient.name,
        courtroomFeatures: courtroomClient.features,
        userId: courtroomClient.userId,
        phoneNumber: courtroomClient.phoneNumber,
        totalHours: courtroomClient.totalHours,
        totalUsedHours: courtroomClient.totalUsedHours,
        key: getEncKey,
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

async function getusername(req, res) {
  const { courtroomClient } = req.body;
  try {
    // console.log(courtroomClient);

    let userId;

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        username: courtroomClient.name,
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

async function newcase(req, res) {
  const files = req.files; // This will be an array of file objects
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  // console.log(files);

  const { isMultilang } = req.body;

  const { userId } = req.body?.courtroomClient;
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

    // // Find the SpecificLawyerCourtroomUser document by userId
    // const SpecificLawyerCourtroomUser = await SpecificLawyerCourtroomUser.findOne({ userId });

    // if (!SpecificLawyerCourtroomUser) {
    //   return res
    //     .status(StatusCodes.NOT_FOUND)
    //     .json({ error: "User not found" });
    // }

    // console.log(SpecificLawyerCourtroomUser);

    // // Append the case overview to the user's caseOverview array
    // SpecificLawyerCourtroomUser.caseOverview = case_overview.case_overview;

    // console.log(SpecificLawyerCourtroomUser);

    // // Save the updated SpecificLawyerCourtroomUser document
    // await SpecificLawyerCourtroomUser.save();

    // console.log(SpecificLawyerCourtroomUser);

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
    const { userId } = req.body?.courtroomClient;
    let { case_overview } = req.body;

    // Find the SpecificLawyerCourtroomUser document by userId
    const fetchedUser = await SpecificLawyerCourtroomUser.findOne({
      userId: userId,
    });

    if (!fetchedUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // decrypt the caseoverview
    case_overview = await decryption(case_overview, fetchedUser.key);

    // set case overview to ML
    let fetchedOverview = await fetchOverview({
      user_id: userId,
      case_overview,
    });

    // encrypt the caseoverview
    fetchedOverview = await encryption(
      fetchedOverview.case_overview,
      fetchedUser.key
    );

    // send enctyped caseoverview
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

async function fetchOverview({ user_id, case_overview }) {
  try {
    // Dynamically import node-fetch
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/new_case`, {
      method: "POST",
      body: JSON.stringify({ user_id, case_overview }),
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

async function newcase1(req, res) {
  const files = req.files; // This will be an array of file objects
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  // console.log(files);

  const { userId } = req.body?.courtroomClient;
  const { _id } = req.body?.courtroomClient;
  const { key } = req.body?.courtroomClient;
  // const userId = "f497c76b-2894-4636-8d2b-6391bc6bccdc";
  console.log(userId);
  const { isMultilang } = req.body;

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
    );

    let case_overview;

    if (isMultilang) {
      case_overview = await getOverviewMultilang1({
        user_id: userId,
        file: fileNameArray,
        bucket_name: "ai_courtroom",
        folder_name: folderName + "/",
      });
    } else {
      case_overview = await getOverview1({
        user_id: userId,
        file: fileNameArray,
        bucket_name: "ai_courtroom",
        folder_name: folderName + "/",
      });
    }

    console.log(case_overview);

    case_overview.case_overview = await encryption(
      case_overview.case_overview,
      key
    );

    const decryptData = await decryption(case_overview.case_overview, key);

    console.log("decryptData: => ");

    console.log(decryptData);

    return res.status(StatusCodes.OK).json(SuccessResponse({ case_overview }));
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
    const user_id = req.body?.courtroomClient?.userId;

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
  let { case_overview } = req.body;

  const user_id = req.body?.courtroomClient?.userId;

  try {
    // Find the SpecificLawyerCourtroomUser document by userId
    const fetchedUser = await SpecificLawyerCourtroomUser.findOne({
      userId: user_id,
    });

    if (!fetchedUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // Decrypt the case_overview
    case_overview = await decryption(case_overview, fetchedUser.key);

    // set case overview to ML
    const editedArgument = await FetchEdit_Case({ user_id, case_overview });

    // encrypt the case_overview
    editedArgument.case_overview = await encryption(
      editedArgument.case_overview,
      fetchedUser.key
    );

    // Append the case overview to the user's database caseOverview
    fetchedUser.caseOverview = editedArgument.case_overview;

    // Save the updated SpecificLawyerCourtroomUser document
    await fetchedUser.save();

    // send encrypted case overview
    return res.status(StatusCodes.OK).json(SuccessResponse({ editedArgument }));
  } catch (error) {
    console.log(error);
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
  const user_id = req.body?.courtroomClient?.userId;

  console.log(user_id);
  try {
    // Find the SpecificLawyerCourtroomUser document by userId
    const FetchedUser = await SpecificLawyerCourtroomUser.findOne({
      userId: user_id,
    });

    // console.log(FetchedUser);

    if (!FetchedUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // fetched encryped case overview from user db
    let case_overview = FetchedUser.caseOverview;

    // send encryped case overview
    return res.status(StatusCodes.OK).json(SuccessResponse({ case_overview }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function user_arguemnt(req, res) {
  let { argument, argument_index } = req.body;
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;

  try {
    argument = await decryption(argument, key);

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
  let { argument_index, action } = req.body;
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;

  try {
    let lawyerArguemnt = await FetchLawyer_arguemnt({
      user_id,
      argument_index,
      action,
    });

    // encrypt the lawyer arguemnt
    lawyerArguemnt.counter_argument = await encryption(
      lawyerArguemnt.counter_argument,
      key
    );
    lawyerArguemnt.potential_objection = await encryption(
      lawyerArguemnt.potential_objection,
      key
    );

    // send the encrypted lawyer arguemnt
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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;

  try {
    let judgeArguemnt = await FetchJudge_arguemnt({
      user_id,
      argument_index,
      action,
    });

    judgeArguemnt.judgement = await encryption(judgeArguemnt.judgement, key);

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
    const user_id = req.body?.courtroomClient?.userId;
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
    const user_id = req.body?.courtroomClient?.userId;
    const key = req.body?.courtroomClient?.key;
    let { text_input } = req.body;

    // Decrypt the text_input
    text_input = await decryption(text_input, key);

    let relevantCases = await FetchRelevantCasesJudgeLawyer({
      user_id,
      text_input,
    });

    // Encrypt the relevantCases
    relevantCases.relevant_case_law = await encryption(
      relevantCases.relevant_case_law,
      key
    );

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
      `${COURTROOM_API_ENDPOINT}/api/relevant_cases_judge_lawyer`,
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
  const user_id = req.body?.courtroomClient?.userId;
  const favor = req.body.favor;
  try {
    const updateUserFavor = await SpecificLawyerCourtroomUser.findOneAndUpdate(
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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;
  let favor = req.body?.courtroomClient?.userId;
  if (favor === undefined) favor = "";

  try {
    let draft = await FetchGetDraft({ user_id, favor });
    // encrypt the draft
    draft.detailed_draft = await encryption(draft.detailed_draft, key);
    return res.status(StatusCodes.OK).json(SuccessResponse({ draft }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function FetchGetDraft(body) {
  // console.log(body);
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
  const user_id = req.body?.courtroomClient?.userId;

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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;
  try {
    let restDetail = await FetchRestCase({ user_id });

    // encrypt the restDetail
    restDetail.verdict = await encryption(restDetail.verdict, key);

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
  const user_id = req.body?.courtroomClient?.userId;
  const { userId } = req.body;
  try {
    const endCase = await FetchEndCase({ userId });

    // save into database

    const { User_id } = await SpecificLawyerCourtroomService.getClientByUserid(
      userId
    );

    await SpecificLawyerCourtroomService.storeCaseHistory(User_id, endCase);

    return res.status(StatusCodes.OK).json(SuccessResponse({ endCase }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;
  try {
    let hallucinationQuestions = await FetchHallucinationQuestions({
      user_id,
    });

    // encrypt the hallucinationQuestions
    hallucinationQuestions.assistant_questions = await encryption(
      hallucinationQuestions.assistant_questions,
      key
    );

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ hallucinationQuestions }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;

  try {
    let caseHistory = await FetchCaseHistory({ user_id });

    // encrypt the caseHistory

    caseHistory = await encryptObject(caseHistory, encryption, key);

    console.log(caseHistory);
    // save into database or update database with new data if case history is already present in the database
    const { User_id } = await SpecificLawyerCourtroomService.getClientByUserid(
      user_id
    );

    console.log(User_id);

    await SpecificLawyerCourtroomService.storeCaseHistory(User_id, caseHistory);

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
  const user_id = req.body?.courtroomClient?.userId;
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
    doc.text(caseHistory.verdict);

    // Collect the PDF in chunks
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader(
        "Content-disposition",
        `attachment; filename="case_history_${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(pdfBuffer);
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
  const user_id = req.body?.courtroomClient?.userId;

  console.log(user_id);
  try {
    const { User_id } = await SpecificLawyerCourtroomService.getClientByUserid(
      user_id
    );

    if (!User_id) {
      throw new Error("User not found");
    }

    const FetchedCaseHistorys =
      await SpecificLawyerCourtroomService.getSessionCaseHistory(User_id);
    // console.log(FetchedCaseHistorys);

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
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader(
        "Content-disposition",
        `attachment; filename="case_history_${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(pdfBuffer);
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
  const user_id = req.body?.courtroomClient?.userId;
  // const user_id = req.body?.userId;
  try {
    const draft = await FetchGetDraft({ user_id });

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
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader(
        "Content-disposition",
        `attachment; filename="draft_${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(pdfBuffer);
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
  const user_id = req.body?.courtroomClient?.userId;

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
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader(
        "Content-disposition",
        `attachment; filename="draft${user_id}.pdf"`
      );
      res.setHeader("Content-type", "application/pdf");
      res.send(pdfBuffer);
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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;

  try {
    let caseHistory = await FetchCaseHistory({ user_id });

    caseHistory = await encryptObject(caseHistory, encryption, key);

    console.log(caseHistory);

    res.status(StatusCodes.OK).json(SuccessResponse({ caseHistory }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function evidence(req, res) {
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;
  let { action, evidence_text } = req.body;
  try {
    // decrypt the evidence
    evidence_text = await decryption(evidence_text, key);

    let fetchedEvidence = await getEvidence({
      user_id,
      action,
      evidence_text,
    });

    // encrypt the evidence
    fetchedEvidence.Evidence_Relevance = await encryption(
      fetchedEvidence.Evidence_Relevance,
      key
    );

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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;
  let { action, query } = req.body;
  try {
    // decrypt the query
    query = await decryption(query, key);

    const fetchedAskQuery = await fetchAskQuery({
      user_id,
      action,
      query,
    });

    // encrypt the fetchedAskQuery
    fetchedAskQuery.answer = await encryption(fetchedAskQuery.answer, key);

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

    const userId1 = await registerNewCourtRoomUser();
    const updateUser = await SpecificLawyerCourtroomUser.findByIdAndUpdate(
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
  const user_id = req.body?.courtroomClient?.userId;
  const key = req.body?.courtroomClient?.key;

  try {
    const relevantCases = await FetchRelevantCases({ user_id });
    relevantCases.relevant_case_law = await encryption(
      relevantCases.relevant_case_law,
      key
    );
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
      `${COURTROOM_API_ENDPOINT}/api/relevant_case_law`,
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
    const user_id = req.body?.courtroomClient?.userId;
    const key = req.body?.courtroomClient?.key;
    let { testimony_statement } = req.body;

    // decrypt the statement
    testimony_statement = await decryption(testimony_statement, key);

    let testimonyQuestions = await FetchTestimonyQuestions({
      user_id,
      testimony_statement,
    });

    // encrypt the fetched testimonyQuestions

    testimonyQuestions.testimony_questions = await encryption(
      testimonyQuestions.testimony_questions,
      key
    );

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
    const user_id = req.body?.courtroomClient?.userId;
    const key = req.body?.courtroomClient?.key;
    const { action } = req.body;

    const application = await fetchApplication({ user_id, action });

    // encrypt the application
    application.application = await encryption(application.application, key);

    res.status(StatusCodes.OK).json(SuccessResponse({ application }));
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function fetchApplication({ user_id, action }) {
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/api/application`, {
      method: "POST",
      body: JSON.stringify({ user_id, action }),
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
    const user_id = req.body?.courtroomClient?.userId;
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
    const user_id = req.body?.courtroomClient?.userId;
    const key = req.body?.courtroomClient?.key;
    const { folder_id, case_id } = req.body;
    let viewDocument = await FetchViewDocument({ folder_id, case_id });
    // encrypt the fetched viewDocument

    viewDocument.content = await encryption(viewDocument.content, key);

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
  console.log(folder_id, case_id);
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
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch view document");
  }
}

async function sidebarCasesearch(req, res) {
  const user_id = req.body?.courtroomClient?.userId;
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
    const user_id = req.body?.courtroomClient?.userId;
    let favor = req.body?.courtroomClient?.drafteFavor;
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

async function consultant(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userId;
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

async function editApplication(req, res) {
  try {
    const user_id = req.body?.courtroomClient?.userId;
    const key = req.body?.courtroomClient?.key;

    const { query } = req.body;
    const editApplication = await fetchEditApplication({ user_id, query });

    editApplication.application = await encryption(
      editApplication.application,
      key
    );

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

async function AddContactUsQuery(req, res) {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    preferredContactMode,
    businessName,
    query,
  } = req.body;

  try {
    const queryResponse =
      await SpecificLawyerCourtroomService.addContactUsQuery(
        firstName,
        lastName,
        email,
        phoneNumber,
        preferredContactMode,
        businessName,
        query
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
  const user_id = req.body?.courtroomClient?.userId;
  try {
    const caseHistory = await FetchCaseHistory({ user_id });

    // save into database or update database with new data if case history is already present in the database
    const { User_id } = await SpecificLawyerCourtroomService.getClientByUserid(
      user_id
    );

    console.log(User_id);

    await SpecificLawyerCourtroomService.storeCaseHistory(User_id, caseHistory);

    const FetchedCaseHistorys =
      await SpecificLawyerCourtroomService.getSessionCaseHistory(User_id);
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

// storing time =>

let inMemoryEngagementData = {};

const flushInMemoryDataToDatabase = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const Domain in inMemoryEngagementData) {
      const userEngagement = inMemoryEngagementData[Domain];

      // Find the user by phone number
      const user =
        await SpecificLawyerCourtroomService.getClientByDomainWithSession(
          Domain,
          session
        );

      //   console.log(user);

      // if (user) {
      //   if (!user.engagementTime) {
      //     user.engagementTime = {
      //       total: 0,
      //     };
      //   }

      // console.log(user.engagementTime);

      if (user) {
        const totalEngagementTime = userEngagement.total / 3600; // Convert seconds to hours

        await SpecificLawyerCourtroomService.updateClientByDomainWithSession(
          Domain,
          {
            $inc: {
              totalUsedHours: totalEngagementTime,
            },
          },
          session
        );
      } else {
        console.log(`User not found for phone number: ${Domain}`);
      }
    }

    await session.commitTransaction();
    inMemoryEngagementData = {}; // Clear in-memory data after successful write
    console.log("Flushing in-memory");
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    console.error("Error flushing engagement data to database:", error);
  } finally {
    console.log("Finally block executed");
    session.endSession();
  }
};

async function storeTime(req, res) {
  const engagementData = req.body;
  const Domain = req.body?.courtroomClient?.Domain;
  for (let i = 0; i < engagementData.length; i++) {
    engagementData[i].Domain = Domain;
  }
  // console.log(engagementData);

  engagementData?.forEach(({ Domain, engagementTime, timestamp }) => {
    const date = new Date(timestamp); // Convert seconds to milliseconds
    const day = date.toISOString().slice(0, 10);
    // const month = date.toISOString().slice(0, 7);
    // const year = date.getFullYear();

    if (!inMemoryEngagementData[Domain]) {
      inMemoryEngagementData[Domain] = {
        daily: {},
        // monthly: {},
        // yearly: {},
        total: 0,
      };
    }

    inMemoryEngagementData[Domain].daily[day] =
      (inMemoryEngagementData[Domain].daily[day] || 0) + engagementTime;
    inMemoryEngagementData[Domain].total += engagementTime; // Add to total engagement time
  });

  await flushInMemoryDataToDatabase();

  res.status(200).json({ message: "Engagement data received" });
}

// setInterval(flushInMemoryDataToDatabase, 60000); // Flush to database every minute

module.exports = {
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
  getSessionCaseHistory,
  storeTime,
  getusername,
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
  setFavor,
  sidebarCasesearch,
  newcase1,
  draftNextAppeal,
  summary,
  consultant,
  caseSummary,
};
