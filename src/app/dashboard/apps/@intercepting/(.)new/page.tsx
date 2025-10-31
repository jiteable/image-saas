import { DialogContent, DialogTitle } from '@/components/ui/dialog'
import CreateApp from '../../new/page'
import BackableDialog from './BackableDialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default function InterceptingCreateApp() {
  return (
    <BackableDialog>
      <DialogContent className="max-w-md mx-auto my-20 rounded-lg p-0">
        <VisuallyHidden>
          <DialogTitle>Create App</DialogTitle>
        </VisuallyHidden>
        <div className="p-6">
          <CreateApp></CreateApp>
        </div>
      </DialogContent>
    </BackableDialog>

  )
}