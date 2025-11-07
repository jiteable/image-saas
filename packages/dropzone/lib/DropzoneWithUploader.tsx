/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Uppy,
} from "@uppy/core";
import { Dropzone, DropzoneProps } from "./Dropzone";
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
  }, [uploader, onFileUploaded]); // 添加依赖数组

  function onFiles(files: File | File[]) {
    const fileArray = Array.isArray(files) ? files : [files];
    uploader.addFiles(
      fileArray.map((file) => ({
        data: file,
        name: file.name,
        type: file.type,
        size: file.size,
      }))
    )

    // 开始上传
    uploader.upload()
  }

  return <Dropzone {...dropzoneProps} onFileChosed={onFiles}></Dropzone>;
}
