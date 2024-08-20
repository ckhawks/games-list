import getS3Client from "@/util/s3/GetS3Client";
import { GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// TODO switch this to use like a short slug for resource id's instead of full uuid because its ugly

export async function GET(
  request: Request,
  { params }: { params: { s3Key: string } }
) {
  if (params.s3Key === null) {
    return new NextResponse("Please provide an id.", { status: 404 });
  }

  try {
    const s3Client = getS3Client();
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.MC_AWS_S3_BUCKET,
      Key: params.s3Key,
    } as GetObjectCommandInput);

    const data = await s3Client.send(getObjectCommand);

    return new NextResponse(data.Body as unknown as Buffer, {
      status: 200,
      headers: {
        "Content-Type": data.ContentType!,
        "Cache-Control": "public, max-age=31536000, immutable", // optional, for caching
      },
    });
  } catch (error) {
    console.error("Error fetching image from S3: ", error);
    return new NextResponse("Image not found", { status: 404 });
  }
}
