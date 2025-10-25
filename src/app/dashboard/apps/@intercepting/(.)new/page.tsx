import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import CreateApp from '../../new/page'
import BackableDialog from './BackableDialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default function InterceptingCreateApp() {
  return (
    <BackableDialog>
      <DialogContent>
        <VisuallyHidden>
          <DialogTitle>Create App</DialogTitle>
        </VisuallyHidden>
        <CreateApp></CreateApp>
      </DialogContent>
    </BackableDialog>

  )
}