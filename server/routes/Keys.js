// DEPENDENCY IMPORTATIONS
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
// const buffer = require('buffer');

dotenv.config();

// ENCRYPTION CONFIGURATION
const algorithm = "aes-256-cbc";
const encKey = process.env.API_ENC_KEY;
const iv = crypto.randomBytes(16);
const encrypt = (text) => {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), content: encrypted.toString("hex") };
};
const decrypt = (text) => {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.content, "hex");
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// GET API FROM DB
router.get("/key/:name", async(req,res,next) => {
    
})