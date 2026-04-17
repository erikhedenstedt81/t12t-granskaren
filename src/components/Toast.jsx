import { useState, useEffect, useCallback } from 'react'
import Icon from './Icon.jsx'

// ─── Toast utility ────────────────────────────────────────────────────────────

/**
 * Dispatch a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function toast(message, type = 'success') {
  window.dispatchEvent(
    new CustomEvent('a11y-toast', { detail: { message, type } })
  )
}

// ─── Toast container ──────────────────────────────────────────────────────────

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const remove = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    function handler(e) {
      const { message, type } = e.detail
      const id = `${Date.now()}-${Math.random()}`
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 3000)
    }
    window.addEventListener('a11y-toast', handler)
    return () => window.removeEventListener('a11y-toast', handler)
  }, [remove])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} role="status">
          <span className="toast-icon">
            {t.type === 'error'
              ? <Icon name="close" size="sm" className="icon-danger" />
              : t.type === 'info'
              ? <Icon name="info"  size="sm" className="icon-brand" />
              : <Icon name="check" size="sm" className="icon-success" />}
          </span>
          <span className="toast-message">{t.message}</span>
          <button
            className="toast-close"
            onClick={() => remove(t.id)}
            aria-label="Stäng notis"
          >
            <Icon name="close" size="sm" className="icon-muted" />
          </button>
        </div>
      ))}
    </div>
  )
}
