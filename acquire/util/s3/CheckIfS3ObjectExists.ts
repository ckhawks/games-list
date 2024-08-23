import { HeadObjectCommand } from "@aws-sdk/client-s3";
import getS3Client from "./GetS3Client";

const s3 = getS3Client();

export async function checkIfKeyExists(bucketName, key) {
  try {
    // Attempt to retrieve metadata for the specified object (key)
    await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    console.log(`The key "${key}" exists in the bucket "${bucketName}".`);
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      console.log(`The key "${key}" does not exist in the bucket "${bucketName}".`);
      return false;
    } else {
      // If an error other than "NotFound" occurred, log it and rethrow
      console.error('An error occurred:', err);
      throw err;
    }
  }
}