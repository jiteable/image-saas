/* eslint-disable @typescript-eslint/no-explicit-any */
import { Uppy, UppyFile } from "@uppy/core";
import AWSS3, { AwsS3UploadParameters } from "@uppy/aws-s3";

export function createUploader(
  getUploadParameters: (file: any) => Promise<AwsS3UploadParameters>
) {
  const uppy = new Uppy();
  uppy.use(AWSS3, {
    shouldUseMultipart: false,
    getUploadParameters: getUploadParameters as any,
  });

  return uppy;
}