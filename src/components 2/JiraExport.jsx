import { useState, useMemo } from 'react'
import { getFindings } from '../store/storage.js'
import { toast } from './Toast.jsx'

// ─── Priority / status maps ───────────────────────────────────────────────────

const PRIORITY_MAP = { critical: 'Blocker', high: 'Major', medium: 'Minor', low: 'Trivial' }
const STATUS_MAP   = { open: 'To Do', 'in-progress': 'In Progress', fixed: 'Done', wontfix: "Won't Fix" }

const SEV_ORDER = ['critical', 'high', 'medium', 'low']

// ─── Jira wiki markup builder ─────────────────────────────────────────────────

function buildWikiDescription(finding) {
  const parts = []
  parts.push(`h2. Problembeskrivning`)
  parts.push(finding.description ?? '')
  if (finding.url) {
    parts.push(`\nh2. Berörd sida`)
    parts.push(finding.url)
  }
  if (finding.wcagCriterionId) {
    parts.push(`\nh2. WCAG-kriterium`)
    parts.push(finding.wcagCriterionId)
  }
  if (finding.stepsToReproduce) {
    parts.push(`\nh2. Reproduktionssteg`)
    parts.push(`{code}`)
    parts.push(finding.stepsToReproduce)
    parts.push(`{code}`)
  }
  if (finding.suggestedFix) {
    parts.push(`\nh2. Föreslagen åtgärd`)
    parts.push(finding.suggestedFix)
  }
  return parts.join('\n')
}

// ─── JSON builder ─────────────────────────────────────────────────────────────

function buildJiraJson(project, findings, projectKey) {
  return findings.map(f => ({
    fields: {
      project:     { key: projectKey.toUpperCase() },
      summary:     `[A11Y] ${f.title ?? f.wcagCriterionId ?? 'Fynd'}`,
      description: buildWikiDescription(f),
      issuetype:   { name: 'Bug' },
      priority:    { name: PRIORITY_MAP[f.severity] ?? 'Minor' },
      labels:      ['accessibility', 'wcag', f.severity],
      status:      { name: STATUS_MAP[f.status] ?? 'To Do' },
    },
  }))
}

// ─── CSV builder ──────────────────────────────────────────────────────────────

function buildCsv(findings, projectKey) {
  const header = ['Project Key', 'Summary', 'Issue Type', 'Priority', 'Status', 'WCAG ID', 'URL', 'Description']
  const rows = findings.map(f => [
    projectKey.toUpperCase(),
    `[A11Y] ${f.title ?? f.wcagCriterionId ?? 'Fynd'}`,
    'Bug',
    PRIORITY_MAP[f.severity] ?? 'Minor',
    STATUS_MAP[f.status] ?? 'To Do',
    f.wcagCriterionId ?? '',
    f.url ?? '',
    (f.description ?? '').replace(/"/g, '""'),
  ])
  return [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JiraExport({ project, onClose }) {
  const allFindings = getFindings(project.id)
  const defaultSelected = new Set(
    allFindings.filter(f => f.severity === 'critical' || f.severity === 'high').map(f => f.id)
  )

  const [selected,    setSelected]    = useState(defaultSelected)
  const [projectKey,  setProjectKey]  = useState('')
  const [format,      setFormat]      = useState('json')  // 'json' | 'csv'

  const sorted = useMemo(
    () => [...allFindings].sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity)),
    [allFindings]
  )

  function toggleAll(checked) {
    setSelected(checked ? new Set(sorted.map(f => f.id)) : new Set())
  }

  function toggle(id, checked) {
    setSelected(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const selectedFindings = sorted.filter(f => selected.has(f.id))

  const output = useMemo(() => {
    if (selectedFindings.length === 0) return ''
    if (format === 'csv') return buildCsv(selectedFindings, projectKey || 'KEY')
    return JSON.stringify(buildJiraJson(project, selectedFindings, projectKey || 'KEY'), null, 2)
  }, [selectedFindings, projectKey, format, project])

  function handleCopy() {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => toast('Kopierat till urklipp'))
  }

  function handleDownload() {
    if (!output) return
    const ext  = format === 'csv' ? 'csv' : 'json'
    const mime = format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json'
    const blob = new Blob([output], { type: mime })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `jira-export-${project.clientName ?? 'projekt'}-${new Date().toISOString().slice(0,10)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast(`${format.toUpperCase()} nedladdad`)
  }

  const allChecked  = sorted.length > 0 && selected.size === sorted.length
  const someChecked = selected.size > 0 && selected.size < sorted.length

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box je-box" role="dialog" aria-modal="true" aria-label="Jira-export">
        <button className="modal-close" onClick={onClose} aria-label="Stäng">×</button>
        <h2 className="pf-title">Jira-export</h2>
        <p className="je-subtitle">{project.clientName} · {project.name}</p>

        {/* Project key */}
        <div className="field">
          <label className="field-label" htmlFor="je-key">Jira-projektnyckel</label>
          <input
            id="je-key"
            className="input"
            type="text"
            placeholder="t.ex. ACC"
            value={projectKey}
            onChange={e => setProjectKey(e.target.value.toUpperCase())}
            maxLength={10}
            style={{ width: 120, textTransform: 'uppercase' }}
          />
        </div>

        {/* Format toggle */}
        <div className="field">
          <span className="field-label">Format</span>
          <div className="cr-lang-btns">
            {['json','csv'].map(f => (
              <button
                key={f}
                type="button"
                className={`cr-lang-btn ${format === f ? 'active' : ''}`}
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Finding list */}
        <div className="field">
          <span className="field-label">
            Välj fynd ({selected.size} av {sorted.length} valda)
          </span>
          <div className="je-finding-list">
            <label className="je-select-all check-item">
              <input
                type="checkbox"
                checked={allChecked}
                ref={el => { if (el) el.indeterminate = someChecked }}
                onChange={e => toggleAll(e.target.checked)}
              />
              <strong>Välj alla</strong>
            </label>
            {sorted.map(f => (
              <label key={f.id} className="check-item je-finding-item">
                <input
                  type="checkbox"
                  checked={selected.has(f.id)}
                  onChange={e => toggle(f.id, e.target.checked)}
                />
                <span className={`badge badge-${f.severity}`}>{f.severity}</span>
                <span className="je-finding-title">{f.title ?? f.wcagCriterionId ?? 'Namnlöst fynd'}</span>
                {f.url && <span className="je-finding-url">{f.url}</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Preview */}
        {output && (
          <div className="field">
            <span className="field-label">Förhandsgranskning</span>
            <pre className="je-preview">{output.slice(0, 1200)}{output.length > 1200 ? '\n…' : ''}</pre>
          </div>
        )}

        {/* Actions */}
        <div className="pf-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Avbryt</button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopy}
            disabled={!output}
          >
            Kopiera
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={!output}
          >
            ↓ Ladda ned {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
