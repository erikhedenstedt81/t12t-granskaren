import { useState, useEffect, useRef, useCallback } from 'react'
import { getProjects, getFindings } from '../store/storage.js'
import Icon from './Icon.jsx'

/**
 * GlobalSearch — searches all findings across all projects in real time.
 * Props:
 *   onNavigate(projectId, findingId) — called when user selects a result
 */
export default function GlobalSearch({ onNavigate }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])   // [{ project, findings: [...] }]
  const [open,    setOpen]    = useState(false)
  const [active,  setActive]  = useState(-1)   // flat index for keyboard nav
  const inputRef  = useRef(null)
  const listRef   = useRef(null)

  // ── Search logic ────────────────────────────────────────────────────────────

  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q) { setResults([]); setOpen(false); return }

    const projects = getProjects()
    const grouped = []

    for (const project of projects) {
      const findings = getFindings(project.id).filter(f => {
        return (
          f.title?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.url?.toLowerCase().includes(q) ||
          f.wcagCriterionId?.toLowerCase().includes(q)
        )
      })
      if (findings.length > 0) {
        grouped.push({ project, findings })
      }
    }

    setResults(grouped)
    setOpen(grouped.length > 0)
    setActive(-1)
  }, [query])

  // ── Flat list for keyboard navigation ───────────────────────────────────────

  const flat = results.flatMap(g => g.findings.map(f => ({ project: g.project, finding: f })))

  // ── Keyboard handler ─────────────────────────────────────────────────────────

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (active >= 0 && flat[active]) {
        select(flat[active].project.id, flat[active].finding.id)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (active < 0 || !listRef.current) return
    const el = listRef.current.querySelector(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  // ── Select result ────────────────────────────────────────────────────────────

  const select = useCallback((projectId, findingId) => {
    setQuery('')
    setOpen(false)
    onNavigate(projectId, findingId)
  }, [onNavigate])

  // ── Close on outside click ──────────────────────────────────────────────────

  useEffect(() => {
    function handler(e) {
      if (!inputRef.current?.closest('.gs-root')?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Highlight match ──────────────────────────────────────────────────────────

  function highlight(text, q) {
    if (!q || !text) return text ?? ''
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="gs-mark">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  let flatIdx = 0

  return (
    <div className="gs-root" role="search">
      <label htmlFor="gs-input" className="sr-only">Sök fynd</label>
      <div className="gs-input-wrap">
        <span className="gs-icon" aria-hidden="true"><Icon name="search" /></span>
        <input
          id="gs-input"
          ref={inputRef}
          className="gs-input"
          type="search"
          placeholder="Sök fynd, WCAG-ID, URL…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setOpen(true)}
          autoComplete="off"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="gs-listbox"
        />
        {query && (
          <button
            className="gs-clear"
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
            aria-label="Rensa sökning"
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>

      {open && (
        <ul
          id="gs-listbox"
          ref={listRef}
          className="gs-dropdown"
          role="listbox"
          aria-label="Sökresultat"
        >
          {results.map(group => (
            <li key={group.project.id} className="gs-group">
              <div className="gs-group-header">
                {group.project.clientName} · {group.project.name}
              </div>
              <ul role="group">
                {group.findings.map(f => {
                  const idx = flatIdx++
                  return (
                    <li
                      key={f.id}
                      role="option"
                      data-idx={idx}
                      className={`gs-item ${active === idx ? 'gs-item-active' : ''}`}
                      aria-selected={active === idx}
                      onMouseDown={() => select(group.project.id, f.id)}
                      onMouseEnter={() => setActive(idx)}
                    >
                      <span className={`badge badge-${f.severity} gs-badge`}>{f.severity}</span>
                      <span className="gs-item-title">
                        {highlight(f.title ?? f.wcagCriterionId ?? 'Namnlöst fynd', query.trim())}
                      </span>
                      {f.wcagCriterionId && (
                        <span className="gs-item-meta">{f.wcagCriterionId}</span>
                      )}
                      {f.url && (
                        <span className="gs-item-url">{highlight(f.url, query.trim())}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
          {flat.length === 0 && (
            <li className="gs-empty">Inga fynd hittades</li>
          )}
        </ul>
      )}
    </div>
  )
}
