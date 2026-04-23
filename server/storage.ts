import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";
import crypto from "crypto";

let _s3: S3Client | null = null;

function getS3(): S3Client {
  if (_s3) return _s3;
  if (!ENV.r2.accessKeyId || !ENV.r2.secretAccessKey || !ENV.r2.endpoint) {
    throw new Error(
      "R2 config missing: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT",
    );
  }
  _s3 = new S3Client({
    region: "auto",
    endpoint: ENV.r2.endpoint,
    credentials: {
      accessKeyId: ENV.r2.accessKeyId,
      secretAccessKey: ENV.r2.secretAccessKey,
    },
  });
  return _s3;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomBytes(4).toString("hex");
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  if (!ENV.r2.bucketName) {
    throw new Error("R2_BUCKET_NAME is not set");
  }

  const key = appendHashSuffix(normalizeKey(relKey));
  const body: Buffer = typeof data === "string" ? Buffer.from(data) : Buffer.isBuffer(data) ? data : Buffer.from(data);

  await getS3().send(
    new PutObjectCommand({
      Bucket: ENV.r2.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return { key, url: `${ENV.r2.publicUrl}/${key}` };
}

export async function storageDelete(key: string): Promise<void> {
  if (!ENV.r2.bucketName) return;
  await getS3().send(
    new DeleteObjectCommand({
      Bucket: ENV.r2.bucketName,
      Key: normalizeKey(key),
    }),
  );
}
