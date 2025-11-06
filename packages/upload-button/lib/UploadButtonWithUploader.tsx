/* eslint-disable @typescript-eslint/no-explicit-any */
import { Uppy } from "@uppy/core"
import { UploadButtonProps, UploadButton } from "./UploadButton";
import { useEffect, useRef } from "preact/hooks";

export function UploadButtonWithUploader({ uploader, onFileUploaded, ...UploadButtonProps }: { uploader: Uppy, onFileUploaded: (url: string, file: any) => void } & UploadButtonProps) {

  const inputRef = useRef<HTMLInputElement | null>(null)


  useEffect(() => {

    const successCallback = (file: any, resp: any) => {
      onFileUploaded(resp.uploadURL!, file)
    }
    const completeCallback = () => {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }

    uploader.on('upload-success', successCallback);
    uploader.on('complete', completeCallback)

    return () => {
      uploader.off('upload-success', successCallback)
      uploader.off("complete", completeCallback)
    }

  })

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



  return <UploadButton {...UploadButtonProps} inputRef={inputRef} onFileChosed={onFiles}></UploadButton>
}