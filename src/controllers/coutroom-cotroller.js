const { hashPassword, generateToken } = require("../utils/coutroom/auth");
const { sendConfirmationEmail } = require("../utils/coutroom/sendEmail");
const { CourtroomService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { COURTROOM_API_ENDPOINT } = process.env;
const path = require("path");
const CourtroomUser = require("../models/CourtroomUser");
const FormData = require("form-data");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const TrailCourtroomUser2 = require("../models/trialCourtroomUser2");
const TrailBooking = require("../models/trailBookingAllow");
const TrialCourtroomCoupon = require("../models/trialCourtroomCoupon");

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

      const respo = await CourtroomService.adminCourtRoomBook(
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

async function bookCourtRoom(req, res) {
  try {
    const { slots, recording, CouponCode } = req.body;
    console.log(req.body);

    // Check if required fields are provided
    if (
      // !name ||
      // !phoneNumber ||
      // !email ||
      // !password ||
      !CouponCode ||
      !slots ||
      !Array.isArray(slots) ||
      slots?.length === 0
    ) {
      console.log(CouponCode, slots?.length);
      return res.status(400).send("Missing required fields.");
    }

    const hashedPassword = await hashPassword(CouponCode);
    // const caseOverview = "";

    for (const slot of slots) {
      const { date, hour } = slot;
      if (!date || hour === undefined) {
        return res.status(400).send("Missing required fields in slot.");
      }

      const bookingDate = new Date(date);

      const respo = await CourtroomService.courtRoomBook(
        // name,
        // phoneNumber,
        // email,
        hashedPassword,
        bookingDate,
        hour,
        CouponCode,
        recording
        // caseOverview
      );

      if (respo) {
        return res.status(400).send(respo);
      }
    }
    // await sendConfirmationEmail(
    //   email,
    //   name,
    //   phoneNumber,
    //   password,
    //   slots,
    //   (amount = slots.length * 100)
    // );

    res.status(201).send("Courtroom slots booked successfully.");
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function bookCourtRoomValidation(req, res) {
  try {
    const { CouponCode, slots, recording } = req.body;

    // Check if required fields are provided
    if (
      // !name ||
      // !phoneNumber ||
      // !email ||
      !CouponCode ||
      !slots ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      return res.status(400).send("Missing required fields.");
    }

    // const hashedPassword = await hashPassword(password);
    // const caseOverview = "";

    console.log(req.body);

    for (const slot of slots) {
      const { date, hour } = slot;
      if (!date || hour === undefined) {
        return res.status(400).send("Missing required fields in slot.");
      }

      const bookingDate = new Date(date);

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

      if (!trailBooking) {
        console.log(
          `User with ${CouponCode}  cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`
        );

        return res.status(StatusCodes.OK).json(
          SuccessResponse({
            data: `User with ${CouponCode}  cannot book a slot at ${hour}:00 on ${bookingDate.toDateString()}.`,
          })
        );
      }

      if (
        trailBooking?.totalSlots - trailBooking?.bookedSlots < slots.length ||
        trailBooking?.totalSlots <= trailBooking?.bookedSlots
      ) {
        console.log(
          `User with ${CouponCode}  cannot have enough number of allowed slot.`
        );
        return res.status(StatusCodes.OK).json(
          SuccessResponse({
            data: `User with ${CouponCode}  cannot have enough number of allowed slot.`,
          })
        );
      }

      console.log("i am here");

      const resp = await CourtroomService.courtRoomBookValidation(
        // name,
        // phoneNumber,
        // email,
        // hashedPassword,
        CouponCode,
        bookingDate,
        hour
        // recording,
        // caseOverview
      );

      console.log(resp);

      if (resp) {
        return res.status(StatusCodes.OK).json(SuccessResponse({ data: resp }));
      }
    }

    console.log("slot can be book");

    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse({ data: "Slot can be book" }));
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

    const bookings = await CourtroomService.getBookedData(today, nextTwoMonths);

    res.status(200).json(bookings);
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function loginToCourtRoom(req, res) {
  const { CouponCode, password } = req.body;
  try {
    if (!CouponCode || !password) {
      return res.status(400).send("Missing required fields.");
    }
    const response = await CourtroomService.loginToCourtRoom(
      CouponCode,
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
    console.log(courtroomClient);
    // Generate a JWT token
    const token = generateToken({
      userId: courtroomClient.userBooking._id,
      phoneNumber: courtroomClient.userBooking.phoneNumber,
    });
    console.log(courtroomClient);

    // console.log(token, courtroomClient);

    // console.log({
    //   ...token,
    //   userId: courtroomClient.userId,
    //   phoneNumber: courtroomClient.phoneNumber,
    // });

    console.log("here");

    return res.status(StatusCodes.OK).json(
      SuccessResponse({
        slotTime: courtroomClient.slotTime,
        ...token,
        userId: courtroomClient.userBooking._id,
        phoneNumber: courtroomClient.userBooking.phoneNumber,
      })
    );
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
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

  // console.log(files);

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

    const case_overview = await getOverview(formData);

    console.log(case_overview);

    // // Find the CourtroomUser document by userId
    // const courtroomUser = await CourtroomUser.findOne({ userId });

    // if (!courtroomUser) {
    //   return res
    //     .status(StatusCodes.NOT_FOUND)
    //     .json({ error: "User not found" });
    // }

    // console.log(courtroomUser);

    // // Append the case overview to the user's caseOverview array
    // courtroomUser.caseOverview = case_overview.case_overview;

    // console.log(courtroomUser);

    // // Save the updated CourtroomUser document
    // await courtroomUser.save();

    // console.log(courtroomUser);

    return res.status(StatusCodes.OK).json(SuccessResponse({ case_overview }));
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
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

async function newCaseText(req, res) {
  try {
    const { userId } = req.body?.courtroomClient?.userBooking;
    const { case_overview } = req.body;
    const fetchedOverview = await fetchOverview({
      user_id: userId,
      case_overview,
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

//     // Find the CourtroomUser document by userId
//     const courtroomUser = await TrailCourtroomUser2.findOne({ userId });

//     if (!courtroomUser) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ error: "User not found" });
//     }

//     console.log(courtroomUser);

//     // Append the case overview to the user's caseOverview array
//     courtroomUser.caseOverview = case_overview.case_overview;

//     console.log(courtroomUser);

//     // Save the updated CourtroomUser document
//     await courtroomUser.save();

//     console.log(courtroomUser);

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

async function edit_case(req, res) {
  const { case_overview } = req.body;

  const user_id = req.body?.courtroomClient?.userBooking?.userId;

  // console.log(req.body, " this is body");
  try {
    const editedArgument = await FetchEdit_Case({ user_id, case_overview });

    // Find the CourtroomUser document by userId
    const courtroomUser = await TrailCourtroomUser2.findOne({
      userId: user_id,
    });

    if (!courtroomUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // Append the case overview to the user's caseOverview array
    courtroomUser.caseOverview = editedArgument.case_overview;

    // console.log(courtroomUser);

    // Save the updated CourtroomUser document
    await courtroomUser.save();

    // console.log(courtroomUser);

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
    // Find the CourtroomUser document by userId
    const courtroomUser = await TrailCourtroomUser2.findOne({
      userId: user_id,
    });

    console.log(courtroomUser);

    if (!courtroomUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // console.log(courtroomUser);

    // Append the case overview to the user's caseOverview array
    const case_overview = courtroomUser.caseOverview;

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

async function getDraft(req, res) {
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const draft = await FetchGetDraft({ user_id });
    return res.status(StatusCodes.OK).json(SuccessResponse({ draft }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
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
  console.log(response);
  return response.json();
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
    const endCase = await FetchEndCase({ userId });

    // save into database

    const { User_id, Booking_id } = await CourtroomService.getClientByUserid(
      userId
    );

    await CourtroomService.storeCaseHistory(User_id, Booking_id, endCase);

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
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  try {
    const hallucinationQuestions = await FetchHallucinationQuestions({
      user_id,
    });
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
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const CouponCode = req.body?.courtroomClient?.userBooking?.CouponCode;
  try {
    const caseHistory = await FetchCaseHistory({ user_id });

    // save into database or update database with new data if case history is already present in the database
    const { User_id, Booking_id } =
      await CourtroomService.getClientByUseridAndCouponCode(
        user_id,
        CouponCode
      );

    // console.log(User_id, Booking_id);

    await CourtroomService.storeCaseHistory(User_id, Booking_id, caseHistory);

    return res.status(StatusCodes.OK).json(SuccessResponse({ caseHistory }));
  } catch (error) {
    console.error(error);
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
  // const user_id = req.body?.courtroomClient?.userBooking?.userId;
  const user_id = req.body?.userId;

  console.log(user_id);
  try {
    const { User_id } = await CourtroomService.getClientByUserid(user_id);

    if (!User_id) {
      throw new Error("User not found");
    }

    const FetchedCaseHistorys = await CourtroomService.getSessionCaseHistory(
      User_id
    );
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
  const user_id = req.body?.courtroomClient?.userBooking?.userId;
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

  const user_id = req.body?.courtroomClient?.userBooking?.userId;

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
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch ask query");
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
    const queryResponse = await CourtroomService.addContactUsQuery(
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

module.exports = {
  bookCourtRoom,
  adminBookCourtRoom,
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
  evidence,
  askQuery,
  relevantCaseLaw,
  newCaseText,
  relevantCasesJudgeLawyer,
};
