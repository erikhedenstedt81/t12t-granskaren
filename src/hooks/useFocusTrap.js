import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Traps keyboard focus within `ref.current`.
 * Restores focus to the previously focused element on unmount.
 * Returns a keydown handler to attach to the dialog element.
 */
export function useFocusTrap(ref) {
  const previousFocus = useRef(null)

  useEffect(() => {
    previousFocus.current = document.activeElement

    // Focus first focusable element in dialog
    const focusable = Array.from(ref.current?.querySelectorAll(FOCUSABLE) ?? [])
    if (focusable.length) focusable[0].focus()

    return () => {
      previousFocus.current?.focus()
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return
    const focusable = Array.from(ref.current?.querySelectorAll(FOCUSABLE) ?? [])
    if (!focusable.length) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }

  return handleKeyDown
}
