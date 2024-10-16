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
    console.log(getDecryptedKey);
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
    console.log(getDecryptedKey);
    const decryptedData = await decryptData(data, getDecryptedKey);
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
  const stack = [{ data, decryptedData: {}, parent: null, key: null }];
  const result = {};

  while (stack.length > 0) {
    const { data: currentData, decryptedData, parent, key } = stack.pop();

    for (const currentKey of Object.keys(currentData)) {
      const value = currentData[currentKey];

      if (typeof value === "string") {
        // Decrypt string values
        decryptedData[currentKey] = await decryption(value, encryptedKey);
      } else if (Array.isArray(value)) {
        // Process arrays
        decryptedData[currentKey] = await Promise.all(
          value.map(async (item) =>
            typeof item === "string"
              ? await decryption(item, encryptedKey)
              : item
          )
        );
      } else if (typeof value === "object" && value !== null) {
        // Push nested objects onto the stack
        const newDecryptedData = {};
        decryptedData[currentKey] = newDecryptedData;
        stack.push({
          data: value,
          decryptedData: newDecryptedData,
          parent: decryptedData,
          key: currentKey,
        });
      } else {
        // Copy non-string values
        decryptedData[currentKey] = value;
      }
    }

    // If there's a parent, link the decrypted data to the correct parent key
    if (parent && key) {
      parent[key] = decryptedData;
    }
  }

  // The result will hold the fully decrypted object
  return data;
}

async function decryptArrayOfObjects(dataArray, decryption, encryptedKey) {
  const decryptedArray = [];

  for (let i = 0; i < dataArray.length; i++) {
    const decryptedObject = await decryptObject(
      dataArray[i],
      decryption,
      encryptedKey
    );
    decryptedArray.push(decryptedObject);
  }

  return decryptedArray;
}

async function encryptArrayOfObjects(dataArray, encryption, encryptedKey) {
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
