import Uppy from "@uppy/core";

import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUppyState } from "@/app/dashboard/hooks/useUppyState";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react"


export function UploadPreview({ uppy }: { uppy: Uppy }) {

  const files = useUppyState(uppy, s => Object.values(s.files))

  const open = files.length > 0

  const [index, setIndex] = useState(0)

  const file = files[index]

  const isImage = file.data.type.startsWith("image");

  const clear = () => {
    files.map((file) => {
      uppy.removeFile(file.id)
    })
  }

  return file ? (<Dialog open={open} onOpenChange={(flag) => {
    if (flag === false) {
      clear()
    }
  }}>
    <DialogContent onPointerDownOutside={(e) => {
      e.preventDefault()
    }}>
      <DialogTitle>Upload Preview</DialogTitle>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => {
          if (index === 0) {
            setIndex(files.length - 1)
          } else {
            setIndex(index - 1)
          }
        }}>
          <ChevronLeft />
        </Button>
        <div key={file.id} className="w-56 h-56 flex justify-center items-center">
          {isImage ? (
            <img src={URL.createObjectURL(file.data)} alt={file.name} />
          ) : (
            <Image src="/public/unknown-file-types.png" alt="unknow file type" width={100} height={100}></Image>
          )
          }
        </div>
        <Button variant="ghost" onClick={() => {
          if (index === files.length - 1) {
            setIndex(0)
          } else {
            setIndex(index + 1)
          }
        }}>
          <ChevronRight />
        </Button>
      </div>
      <DialogFooter>
        <Button onClick={() => {
          clear()
        }}
          variant="destructive"
        >Deletc This</Button>
        <Button onClick={() => {
          uppy.upload().then(() => {
            files.map(file => {
              uppy.removeFile(file.id)
            })
          })
        }}>Upload All</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  ) : null
}