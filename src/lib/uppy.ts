import { Uppy } from "@uppy/core";
import AWSS3 from "@uppy/aws-s3";
import { trpcPureClient } from "@/utils/api";

export interface CreateUppyOptions {
  appId?: string;
  onUploadError?: (error: Error) => void;
}

export function createUppyInstance(options: CreateUppyOptions = {}): Uppy {
  const { appId, onUploadError } = options;

  const uppyInstance = new Uppy();

  if (appId) {
    uppyInstance.use(AWSS3, {
      shouldUseMultipart: false,
      async getUploadParameters(file) {
        try {
          const result = await trpcPureClient.file.createPresignedUrl.mutate({
            filename: file.data instanceof File ? file.data.name : "test",
            contentType: file.data.type || "",
            size: file.size ?? 0,
            appId: appId
          });

          return result;
        } catch (err) {
          if (onUploadError) {
            onUploadError(err as Error);
          }
          throw err;
        }
      }
    });
  }

  return uppyInstance;
}