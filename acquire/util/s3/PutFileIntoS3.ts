import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import getS3Client from "@/util/s3/GetS3Client";
import { File } from "buffer";

export async function PutFileIntoS3(file: File, key: String) {
  // get s3Client to use for the request
  const s3Client = getS3Client();
  try {
    // set up our parameters
    const uploadParams = {
      Bucket: process.env.MC_AWS_S3_BUCKET, // destination bucket
      Key: key, // what the want the file path to be basically
      Body: await file.arrayBuffer(), // the file itself
      ContentType: file.type, // the type of the file (look up MIME types)
    } as PutObjectCommandInput;

    // create the request and send it with the client
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // return success
    return true;
  } catch (error) {
    // if we had an error, print it out
    console.error("Error uploading file: ", error);

    // return failure
    return false;
  }
}
