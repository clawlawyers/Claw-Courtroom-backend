const { KEY } = process.env;
const crypto = require("crypto");
const CryptoJS = require("crypto-js");

const generateSymmetricKey = async () => {
  return crypto.randomBytes(32).toString("hex"); // 256-bit key
};

const encryptData = (data, symmetricKey) => {
  return CryptoJS.AES.encrypt(data, symmetricKey).toString();
};

// Function to decrypt data
const decryptData = (encryptedData, symmetricKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, symmetricKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

async function generateEncryptedKey() {
  try {
    const genKey = await generateSymmetricKey();
    const fixKey = KEY;
    const encryptedKey = await encryptData(genKey, fixKey);
    return encryptedKey;
  } catch (error) {
    console.error(`Error generating encrypted key:`, error);
    throw error;
  }
}

async function decryptKey(key) {
  try {
    const fixKey = KEY;
    const decryptedKey = await decryptData(key, fixKey);
    return decryptedKey;
  } catch (error) {
    console.error(`Error decrypting key:`, error);
    throw error;
  }
}

async function encryption(data, encryptedKey) {
  try {
    const getDecryptedKey = await decryptKey(encryptedKey);
    const decryptedData = await encryptData(data, getDecryptedKey);
    return decryptedData;
  } catch (error) {
    console.error(`Error encrypting data:`, error);
    throw error;
  }
}

async function decryption(data, encryptedKey) {
  try {
    const getDecryptedKey = await decryptKey(encryptedKey);
    // console.log(getDecryptedKey);
    // console.log(data);
    const decryptedData = await decryptData(data, getDecryptedKey);
    // console.log(decryptedData);
    return decryptedData;
  } catch (error) {
    console.error(`Error decrypting data:`, error);
    throw error;
  }
}

async function encryptObject(data, encryption, encryptedKey) {
  const encryptedData = {};

  // Use for...of to handle async/await properly
  for (const key of Object.keys(data)) {
    // Skip encryption for caseId
    if (key === "caseId" || key === "_id") {
      encryptedData[key] = data[key]; // Just copy the caseId as is
      continue;
    }

    if (typeof data[key] === "string") {
      // Encrypt string values
      encryptedData[key] = await encryption(data[key], encryptedKey);
    } else if (Array.isArray(data[key])) {
      // Encrypt each string inside arrays using Promise.all
      encryptedData[key] = await Promise.all(
        data[key].map(async (item) =>
          typeof item === "string" ? await encryption(item, encryptedKey) : item
        )
      );
    } else if (typeof data[key] === "object" && data[key] !== null) {
      // Recursively encrypt nested objects
      encryptedData[key] = await encryptObject(
        data[key],
        encryption,
        encryptedKey
      );
    } else {
      // For non-string values, just copy them
      encryptedData[key] = data[key];
    }
  }

  return encryptedData;
}

async function decryptObject(data, decryption, encryptedKey) {
  const decryptedData = {};
  // console.log("THIS IS DATA=>>");
  // console.log("Function chal gya");
  // console.log(data);

  // const allowedValues = [
  //   "argument",
  //   "counter_argument",
  //   "judgement",
  //   "potential_objection",
  //   "verdict",
  // ];

  // const filteredKeys = Object.keys(data).filter((key) =>
  //   allowedValues.includes(data[key])
  // );

  // console.log(filteredKeys);

  // console.log(Object.keys(data));

  // Use for...of to handle async/await properly
  for (const key of Object.keys(data)) {
    // Skip decryption for caseId
    if (key === "caseId" || key === "_id") {
      decryptedData[key] = data[key]; // Just copy the caseId as is
      continue;
    }

    if (typeof data[key] === "string") {
      // console.log(key);
      // Decrypt string values
      decryptedData[key] = await decryption(data[key], encryptedKey);
    } else if (Array.isArray(data[key])) {
      // Decrypt each string inside arrays using Promise.all
      decryptedData[key] = await Promise.all(
        data[key].map(async (item) =>
          typeof item === "string" ? await decryption(item, encryptedKey) : item
        )
      );
    } else if (typeof data[key] === "object" && data[key] !== null) {
      // console.log(key);
      // Recursively decrypt nested objects
      decryptedData[key] = await decryptObject(
        data[key],
        decryption,
        encryptedKey
      );
    } else {
      // For non-string values, just copy them
      decryptedData[key] = data[key];
    }
  }
  // console.log(decryptedData);
  return decryptedData;
}

async function decryptArrayOfObjects(
  dataArray,
  decryption,
  decryptObject,
  encryptedKey
) {
  console.log(dataArray.length);
  // Iterate over the array and decrypt each object
  return await Promise.all(
    dataArray.map(async (item) => {
      // console.log(item);
      return await decryptObject(item, decryption, encryptedKey);
    })
  );
}

async function encryptArrayOfObjects(
  dataArray,
  encryption,
  encryptObject,
  encryptedKey
) {
  // Iterate over the array and encrypt each object
  return await Promise.all(
    dataArray.map(async (item) => {
      return await encryptObject(item, encryption, encryptedKey);
    })
  );
}

module.exports = {
  generateEncryptedKey,
  decryption,
  encryption,
  encryptObject,
  decryptObject,
  decryptArrayOfObjects,
  encryptArrayOfObjects,
};
