const {
  ClientService,
  UserService,
  CourtroomService,
  SpecificLawyerCourtroomService,
  CourtroomFreeServices,
  CourtroomPricingService,
} = require("../services");
const { ErrorResponse } = require("../utils/common/");
const { StatusCodes } = require("http-status-codes");
const { verifyToken, checkUserIdValidity } = require("../utils/common/auth");
const AppError = require("../utils/errors/app-error");
const { verifyTokenCR } = require("../utils/coutroom/auth");
const CourtroomFeedback = require("../models/courtroomFeedback");
const CourtroomFreeUser = require("../models/courtroomFreeUser");

async function checkUserAuth(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyToken(token);
    const user = await UserService.getUserById(response.id);
    if (!user) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    req.body.user = user;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function checkClientAuth(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyToken(token);
    const client = await ClientService.getClientById(response.id);
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    req.body.client = client;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function checkCourtroomAuth(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    console.log(token);
    if (!token) {
      throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyTokenCR(token);
    console.log(response);
    const client = await CourtroomPricingService.getClientByPhoneNumber(
      response.phoneNumber
    );
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    console.log(client);
    req.body.courtroomClient = client;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function checkCourtroomPricingAuth(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    console.log(token);
    if (!token) {
      throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyTokenCR(token);
    // console.log(response);
    const client = await CourtroomPricingService.getClientByPhoneNumber(
      response.phoneNumber
    );
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    console.log(client);
    req.body.courtroomClient = client;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function checkSpecificLawyerCourtroomAuth(req, res, next) {
  try {
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const origin = req.headers.origin || req.headers.referer;

    // console.log("Client IP:", clientIp);
    // console.log("Origin:", origin);
    // console.log("Origin:", origin?.toString()?.substring(8));
    const domain = origin?.toString()?.substring(8);
    req.domain = domain;
    req.ip = clientIp;

    const client = await SpecificLawyerCourtroomService.getClientByDomainName(
      domain
    );
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    // console.log(client);
    req.body.courtroomClient = client?.userBooking;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function checkSpecificLawyerCourtroomUserId(req, res, next) {
  try {
    const user_id = req.body?.courtroomClient?.userId;
    console.log(user_id);

    const res = await checkUserIdValidity(user_id);

    if (res === "VM Restarted, Create User ID") {
      console.log("DONE");
      throw new AppError(
        "Please refresh the page",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

async function checkVerifiedLawyer(req, res, next) {
  try {
    const lawyer = await UserService.getUserByPhoneNumber(req.body.phoneNumber);
    if (!lawyer) throw new AppError("No lawyer found", StatusCodes.NOT_FOUND);
    if (!lawyer.verified)
      throw new AppError("Please verify first", StatusCodes.FORBIDDEN);
    req.lawyer = lawyer;
    next();
  } catch (error) {
    return res.status(error.statusCode).json(ErrorResponse({}, error));
  }
}

async function checkRegisteredLawyer(req, res, next) {
  try {
    const lawyer = await UserService.getUserByPhoneNumber(req.body.phoneNumber);
    if (!lawyer || !lawyer.registered)
      throw new AppError(
        "Unauthorized, Please register first",
        StatusCodes.FORBIDDEN
      );
    req.lawyer = lawyer;
    next();
  } catch (error) {
    return res.status(error.statusCode).json(ErrorResponse({}, error));
  }
}

async function checkAmabassador(req, res, next) {
  const ambassador = req.body?.client?.ambassador;
  if (!ambassador)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "User not an ambassador" });
  return next();
}

async function checkFreeUserControllerApi(req, res, next) {
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) {
    throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
  }
  console.log(token);
  const response = verifyToken(token);
  console.log(response);
  const user = await CourtroomFreeUser.findOne({ userId: response.userId });
  console.log(user);
  if (!user) {
    return res.status(401);
  }
  const todaysSlot = new Date(user.todaysSlot);
  const todaysSlotTime =
    todaysSlot.getTime() + todaysSlot.getTimezoneOffset() * 60000;
  const Offset = 0.5 * 60 * 60000;
  const slot = new Date(todaysSlotTime + Offset);
  console.log(slot.getMinutes());
  const currenttime = new Date();
  const utcTime =
    currenttime.getTime() + currenttime.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  const currentItcTime = new Date(utcTime + istOffset);
  const realcurrentItcTime = new Date(
    currentItcTime.getFullYear(),
    currentItcTime.getMonth(),
    currentItcTime.getDay(),
    currentItcTime.getHours(),
    currentItcTime.getMinutes()
  );
  const realslot = new Date(
    slot.getFullYear(),
    slot.getMonth(),
    slot.getDay(),
    slot.getHours(),
    slot.getMinutes()
  );
  console.log(currentItcTime.getMinutes());
  console.log(currentItcTime);
  console.log(slot);

  if (currentItcTime > slot || user.userId != response.userId) {
    console.log("hi");
    return res.sendStatus(401);
  }
  // const ifFreeUserIsValid= await CourtroomFreeServices.ifFreeUserIsValid(response.id, response.userId)
  // if(ifFreeUserIsValid){
  req.body.id = response.id;
  req.body.userId = response.userId;
  next();
  // }
  // else return res.status(401)
}

module.exports = {
  checkUserAuth,
  checkClientAuth,
  checkVerifiedLawyer,
  checkRegisteredLawyer,
  checkAmabassador,
  checkCourtroomAuth,
  checkSpecificLawyerCourtroomAuth,
  checkSpecificLawyerCourtroomUserId,
  checkFreeUserControllerApi,
};
