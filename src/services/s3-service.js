const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_S3_BUCKET_NAME } = require("../config/server-config");
const AppError = require("../utils/errors/app-error");

const { StatusCodes } = require('http-status-codes')

const s3 = new S3Client(
    {
        apiVersion: "2006-03-01",
        credentials: {
            accessKeyId: AWS_ACCESS_KEY,
            secretAccessKey: AWS_SECRET_KEY,
        },
        region: AWS_REGION,
    }
);

async function uploadFile(file, fileName) {
    try {
        const res = await s3.send(new PutObjectCommand({ Bucket: AWS_S3_BUCKET_NAME, Key: fileName, Body: file }));
        return res;
    } catch (error) {
        console.log(error);
        return new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    uploadFile
}