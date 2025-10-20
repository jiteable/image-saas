'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
export default function BackableDialog({ children }: { children: ReactNode }) {

  const router = useRouter()
  return (
    <Dialog open onOpenChange={() => {
      router.back()
    }}>
      {children}
    </Dialog>

  )
}