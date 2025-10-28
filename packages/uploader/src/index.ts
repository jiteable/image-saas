import { Uppy, UppyFile } from '@uppy/core';
import AWSS3, { AwsS3UploadParameters } from '@uppy/aws-s3';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function createUploader(getUploadParameters: (file: UppyFile<{}, {}>) => Promise<AwsS3UploadParameters>) {
  const uppyInstance = new Uppy();
  uppyInstance.use(AWSS3, {
    shouldUseMultipart: false,
    getUploadParameters: getUploadParameters
  })

  return uppyInstance
}