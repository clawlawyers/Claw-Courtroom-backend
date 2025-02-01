const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, EXPIRES_IN } = require("../../config/server-config");
const moment = require("moment");
const { ErrorResponse } = require(".");

const { COURTROOM_API_ENDPOINT } = process.env;

async function checkUserIdValidity(user_id) {
  try {
    const response = await fetch(`${COURTROOM_API_ENDPOINT}/user_session`, {
      method: "POST",
      body: JSON.stringify({ user_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const resp = await response.text();
      console.log(resp);
      throw new AppError("Python API issue", StatusCodes.UNAUTHORIZED);
    }

    const resp = await response.json();

    console.log(resp.status);

    return resp.status;
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

function checkPassword(originalPassword, encryptedPassword) {
  try {
    return bcrypt.compareSync(originalPassword, encryptedPassword);
  } catch (error) {
    throw error;
  }
}

function createToken(payload) {
  try {
    const expiresIn = moment.duration({ days: parseInt(EXPIRES_IN) });
    const expiresAt = moment().add(expiresIn).valueOf();
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: expiresIn.asSeconds(),
    });
    return { jwt: token, expiresAt };
  } catch (error) {
    throw error;
  }
}

function verifyToken(token) {
  try {
    const res = jwt.verify(token, SECRET_KEY);
    return res;
  } catch (error) {
    throw error;
  }
}

function ResetPasswordCreateToken(payload) {
  try {
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "1h",
    });
    return { jwt: token };
  } catch (error) {
    throw error;
  }
}

function ResetPasswordVerifyToken(token) {
  try {
    const res = jwt.verify(token, SECRET_KEY);
    return res;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  checkPassword,
  createToken,
  verifyToken,
  checkUserIdValidity,
  ResetPasswordCreateToken,
  ResetPasswordVerifyToken,
};
