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

module.exports = {
  generateEncryptedKey,
  decryption,
  encryption,
};
