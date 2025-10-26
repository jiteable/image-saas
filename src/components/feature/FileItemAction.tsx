import { trpcClientReact } from "@/utils/api";
import { Button } from "../ui/button";
import { Trash2, Copy, ZoomIn } from "lucide-react";
import copy from 'copy-to-clipboard';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useRef } from "react";

export function DeleteFile({ fileId, onDeleteSuccess }: { fileId: string, onDeleteSuccess: (file: string) => void }) {

  const { mutate: deleteFile, isPending } = trpcClientReact.file.deleteFile.useMutation({
    onSuccess() {
      onDeleteSuccess(fileId)
    }
  })
  const handleRemoveFile = () => {
    deleteFile(fileId)
    toast('Delete Success')
  }

  return <Button variant="ghost" onClick={handleRemoveFile} disabled={isPending}>
    <Trash2 />
  </Button>
}

export function CopyUrl({ url }: { url: string }) {


  return <Button variant="ghost" onClick={() => {
    copy(url)
    toast('Url Copy Success')
  }}>
    <Copy />
  </Button >
}

export function ViewImage({ url, name }: { url: string, name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <ZoomIn />
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] animate-in zoom-in-90 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={url}
              alt={name}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            <Button
              className="absolute top-1 right-0 bg-black bg-opacity-50 text-white hover:bg-opacity-75"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
}