import Uppy from "@uppy/core";
import { Button } from "../ui/button";
import { Plus } from "lucide-react"
import { useRef } from "react";

export function UploadButton({ uppy }: { uppy: Uppy }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.click()
          }
        }}><Plus /></Button>
      <input
        ref={inputRef}
        id="file-upload"
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            Array.from(e.target.files).forEach((file: File) => {
              // 检查文件是否已经存在
              const existingFiles = uppy.getFiles();
              const isDuplicate = existingFiles.some(existingFile =>
                existingFile.name === file.name &&
                existingFile.size === file.size &&
                existingFile.type === file.type
              );

              // 只有不是重复文件时才添加
              if (!isDuplicate) {
                try {
                  uppy.addFile({
                    name: file.name,
                    type: file.type,
                    data: file,
                  });
                } catch (error) {
                  console.error('添加文件失败:', error);
                }
              }
            })
            e.target.value = ''
          }
        }}
        multiple
        className="fixed left-[-10000px]"
      />
    </>
  )
}