import { trpcClientReact } from "@/utils/api";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Copy } from "lucide-react";
import copy from 'copy-to-clipboard';
import { toast } from "sonner"
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