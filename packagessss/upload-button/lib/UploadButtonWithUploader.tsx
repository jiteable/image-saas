import { Uppy } from "@uppy/core"
import { UploadButton, UploadButtonProps } from "./UploadButton";
import { useEffect, useRef } from "react";

export function UploadButtonWithUploader(
  { uploader, onFileUploaded, ...uploadButtonProps }:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { uploader: Uppy, onFileUploaded: (url: string, file: any) => void } & UploadButtonProps) {

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // 检查 uploader 是否存在
    if (!uploader) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const successCallback = (file: any, resp: any) => {
      onFileUploaded(resp.uploadURL!, file)
    }

    const completeCallback = () => {
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }

    uploader.on('upload-success', successCallback)

    uploader.on('complete', completeCallback)

    return () => {
      uploader.off("upload-success", successCallback)
      uploader.off('complete', completeCallback)
    }
  }, [uploader, onFileUploaded])

  function onFiles(files: File | File[]) {
    // 检查 uploader 是否存在
    if (!uploader) {
      console.error("Uploader is not initialized");
      return;
    }

    const filesArray = Array.isArray(files) ? files : [files];

    uploader.addFiles(
      filesArray.map((file) => ({
        name: file.name,
        type: file.type,
        data: file,
        size: file.size,
      }))
    )

    uploader.upload()
  }

  return <UploadButton {...uploadButtonProps} onFileChosed={onFiles} inputRef={inputRef}></UploadButton>
}