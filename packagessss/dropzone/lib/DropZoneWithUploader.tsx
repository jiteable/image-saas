/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Uppy,
} from "@uppy/core";
import { Dropzone, DropzoneProps } from "./DropZone";
import { useEffect, useRef } from "preact/hooks";

export function DropzoneWithUploader({
  uploader,
  onFileUploaded,
  ...dropzoneProps
}: {
  uploader: Uppy;
  onFileUploaded: (url: string, file: any) => void;
} & DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const successCallback = (file: any, resp: any) => {
      onFileUploaded(resp.uploadURL!, file!);
    };
    const completeCallback = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    uploader.on("upload-success", successCallback);
    uploader.on("complete", completeCallback);

    return () => {
      uploader.off("upload-success", successCallback);
      uploader.off("complete", completeCallback);
    };
  });

  function onFiles(files: File[]) {
    uploader.addFiles(
      files.map((file) => ({
        data: file,
        name: file.name,
      }))
    );

    uploader.upload();
  }

  return <Dropzone {...dropzoneProps} onFileChosed={onFiles}></Dropzone>;
}