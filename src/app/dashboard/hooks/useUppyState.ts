/* eslint-disable @typescript-eslint/no-explicit-any */
import { Uppy, State } from "@uppy/core"
import { useMemo } from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector"


export function useUppyState<
  TMeta extends Record<string, unknown> = Record<string, unknown>,
  T = State<TMeta, Record<string, never>>
>(
  uppy: Uppy<TMeta, any>,
  selector: (state: State<TMeta, Record<string, never>>) => T
) {
  const store: any = uppy.store

  const subscribe = useMemo(() => store.subscribe.bind(store), [store])
  const getSnapshot = useMemo(() => store.getState.bind(store), [store])

  return useSyncExternalStoreWithSelector(
    subscribe,
    getSnapshot,
    getSnapshot,
    selector
  )
}