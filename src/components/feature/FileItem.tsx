import Image from "next/image"
import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";

export function FileItem({ url, name, isImage }: { url: string; name: string; isImage: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenImagePreview = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.url === url) {
        setOpen(true);
      }
    };

    window.addEventListener('openImagePreview', handleOpenImagePreview);

    return () => {
      window.removeEventListener('openImagePreview', handleOpenImagePreview);
    };
  }, [url]);

  return (
    <>
      {isImage ? (
        <img
          src={url}
          alt={name}
          className="max-h-full max-w-full object-contain cursor-pointer"
          onDoubleClick={() => setOpen(true)}
        />
      ) : (
        <Image
          src="/unknown-file-types.png"
          alt="unknown file type"
          width={100}
          height={100}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-0 shadow-none bg-transparent">
          <DialogTitle className="hidden">Image Preview</DialogTitle>
          {isImage && (
            <div className="flex items-center justify-center h-[90vh]">
              <img
                src={url}
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function LocalFileItem({ file }: { file: File }) {
  const isImage = file.type.startsWith("image")

  const url = useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(file)
    }
    return ''
  }, [isImage, file])

  return <FileItem isImage={isImage} url={url} name={file.name}></FileItem>
}

export function RemoteFileItem({ contentType, name, id }: { contentType: string, name: string, id: string }) {
  const isImage = contentType.startsWith("image")

  return <FileItem isImage={isImage} url={`/image/${id}`} name={name}></FileItem>
}