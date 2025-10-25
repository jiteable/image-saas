import { trpcClientReact } from "@/utils/api";
import { Button } from "../ui/button";
import { Trash2, Copy, ZoomIn } from "lucide-react";
import copy from 'copy-to-clipboard';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { useState } from "react";

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-0 shadow-none bg-transparent">
          <DialogTitle className="hidden">Image Preview</DialogTitle>
          <div className="flex items-center justify-center h-[90vh]">
            <img
              src={url}
              alt={name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}