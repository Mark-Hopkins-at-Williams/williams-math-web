import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// Backs the single global Save button in the top bar. Whichever editable
// page is currently mounted registers its own save function (a plain
// async () => {} that throws on failure); list views and other non-editable
// routes never register one, so the button is naturally disabled there.
const SaveContext = createContext(null)

export const SaveProvider = ({ children }) => {
  const [saveFn, setSaveFn] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const registerSave = useCallback((fn) => setSaveFn(() => fn), [])
  const unregister = useCallback(() => {
    setSaveFn(null)
    setDirty(false)
    setStatus('')
  }, [])
  // Clears any prior status too, so a stale "saved"/"save failed" doesn't
  // linger once the page no longer reflects what was actually saved.
  const markDirty = useCallback(() => {
    setDirty(true)
    setStatus('')
  }, [])

  const doSave = useCallback(async () => {
    if (!saveFn) return
    setSaving(true)
    setStatus('')
    try {
      await saveFn()
      setDirty(false)
      setStatus('saved')
    } catch (err) {
      setStatus(`save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }, [saveFn])

  const value = { registerSave, unregister, markDirty, doSave, dirty, saving, status, canSave: !!saveFn }

  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>
}

export const useSaveContext = () => useContext(SaveContext)

// For editable pages: registers once on mount and unregisters on unmount, so
// the top-bar button can't call into an unmounted page after navigating away.
// The registered wrapper reads `saveFn` through a ref that's kept current on
// every render, so it always closes over the latest local state without
// re-registering (and re-rendering the provider) on every render.
export const useRegisterSave = (saveFn) => {
  const ctx = useSaveContext()
  const saveFnRef = useRef(saveFn)
  saveFnRef.current = saveFn

  useEffect(() => {
    ctx.registerSave(() => saveFnRef.current())
    return () => ctx.unregister()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
