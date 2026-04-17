import { useState, useMemo, useRef, useEffect } from 'react'
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm'
import { getFindings } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import { DIGG_EXTRA_CRITERIA } from '../data/diggManual.js'
import { toast } from './Toast.jsx'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import Icon from './Icon.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_MAP = { critical: 1, high: 2, medium: 3, low: 4 }
const SEV_ORDER    = ['critical', 'high', 'medium', 'low']
const SEV_LABEL    = { critical: 'Kritisk', high: 'Hög', medium: 'Medium', low: 'Låg' }
const WORK_ITEM_TYPES = ['Bug', 'Task', 'User Story']
const ALL_CRITERIA    = [...wcag22, ...DIGG_EXTRA_CRITERIA]

function getCriterion(id) { return ALL_CRITERIA.find(c => c.id === id) ?? null }

// ─── HTML description builder ─────────────────────────────────────────────────

function buildHtmlDescription(finding) {
  const crit  = getCriterion(finding.wcagCriterionId)
  const parts = []

  if (finding.description) {
    parts.push(`<b>Problembeskrivning</b><br>${finding.description}`)
  }
  if (finding.suggestedFix) {
    parts.push(`<b>Föreslagen åtgärd</b><br>${finding.suggestedFix}`)
  }
  if (finding.wcagCriterionId) {
    const label = crit
      ? `${finding.wcagCriterionId} – ${crit.nameSwedish}, Nivå ${crit.level}`
      : finding.wcagCriterionId
    parts.push(`<b>WCAG-referens</b><br>${label}`)
  }
  if (finding.affectedUsers) {
    parts.push(`<b>Berörda användare</b><br>${finding.affectedUsers}`)
  }
  if (finding.url) {
    parts.push(`<b>Sida</b><br>${finding.url}`)
  }

  return parts.join('<br><br>')
}

// ─── Patch operations builder ─────────────────────────────────────────────────

function buildPatchOps(finding, { areaPath, iterationPath, workItemType, tags }) {
  const title    = `[WCAG ${finding.wcagCriterionId ?? ''}] ${finding.title ?? 'Fynd'}`
  const priority = PRIORITY_MAP[finding.severity] ?? 3

  const baseTags = ['tillgänglighet', 'wcag']
  if (finding.wcagCriterionId) baseTags.push(finding.wcagCriterionId)
  const userTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const tagStr   = [...new Set([...userTags, ...baseTags])].join('; ')

  const ops = [
    { op: 'add', path: '/fields/System.Title',                   value: title },
    { op: 'add', path: '/fields/System.Description',             value: buildHtmlDescription(finding) },
    { op: 'add', path: '/fields/Microsoft.VSTS.Common.Priority', value: priority },
    { op: 'add', path: '/fields/System.Tags',                    value: tagStr },
  ]

  if (areaPath)      ops.push({ op: 'add', path: '/fields/System.AreaPath',      value: areaPath })
  if (iterationPath) ops.push({ op: 'add', path: '/fields/System.IterationPath', value: iterationPath })
  if (workItemType)  ops.push({ op: 'add', path: '/fields/System.WorkItemType',  value: workItemType })

  return ops
}

// ─── CSV builder ──────────────────────────────────────────────────────────────

function csvEsc(val) { return `"${String(val ?? '').replace(/"/g, '""')}"` }

function buildCsv(findings, settings) {
  const header = ['ID','Title','Description','Priority','Tags','AreaPath','IterationPath','WorkItemType','URL','WCAGCriterion','Level','Severity']
  const rows = findings.map((f, i) => {
    const crit  = getCriterion(f.wcagCriterionId)
    const num   = String(i + 1).padStart(3, '0')
    const title = `[WCAG ${f.wcagCriterionId ?? ''}] ${f.title ?? 'Fynd'}`
    const baseTags = ['tillgänglighet', 'wcag']
    if (f.wcagCriterionId) baseTags.push(f.wcagCriterionId)
    const userTags = settings.tags ? settings.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    const tagStr   = [...new Set([...userTags, ...baseTags])].join('; ')

    return [
      `wcag-fynd-${num}`,
      title,
      buildHtmlDescription(f),
      PRIORITY_MAP[f.severity] ?? 3,
      tagStr,
      settings.areaPath ?? '',
      settings.iterationPath ?? '',
      settings.workItemType ?? '',
      f.url ?? '',
      f.wcagCriterionId ?? '',
      crit?.level ?? '',
      f.severity ?? '',
    ].map(csvEsc).join(',')
  })
  return [header.map(csvEsc).join(','), ...rows].join('\n')
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AzureExport({ project, onClose }) {
  const allFindings = getFindings(project.id)
  const defaultSelected = new Set(
    allFindings
      .filter(f => f.severity === 'critical' || f.severity === 'high')
      .map(f => f.id)
  )

  const [selected,      setSelected]      = useState(defaultSelected)
  const [areaPath,      setAreaPath]      = useState('')
  const [iterationPath, setIterationPath] = useState('')
  const [workItemType,  setWorkItemType]  = useState('Bug')
  const [tags,          setTags]          = useState('tillgänglighet, wcag')
  const [format,        setFormat]        = useState('zip') // 'zip' | 'csv'

  const dialogRef  = useRef(null)
  const trapKeyDown = useFocusTrap(dialogRef)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const sorted = useMemo(
    () => [...allFindings].sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity)),
    [allFindings]
  )

  const settings = useMemo(
    () => ({ areaPath, iterationPath, workItemType, tags }),
    [areaPath, iterationPath, workItemType, tags]
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

  // Preview: first work item as JSON
  const previewJson = useMemo(() => {
    if (selectedFindings.length === 0) return ''
    return JSON.stringify(buildPatchOps(selectedFindings[0], settings), null, 2)
  }, [selectedFindings, settings])

  // ── Download ZIP ──────────────────────────────────────────────────────────────

  async function handleDownloadZip() {
    if (selectedFindings.length === 0) return
    const zip = new JSZip()
    selectedFindings.forEach((f, i) => {
      const num      = String(i + 1).padStart(3, '0')
      const filename = `wcag-fynd-${num}.json`
      const ops      = buildPatchOps(f, settings)
      zip.file(filename, JSON.stringify(ops, null, 2))
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `azure-export-${project.clientName ?? 'projekt'}-${new Date().toISOString().slice(0, 10)}.zip`
    a.click()
    URL.revokeObjectURL(url)
    toast('ZIP-fil nedladdad')
  }

  // ── Download CSV ──────────────────────────────────────────────────────────────

  function handleDownloadCsv() {
    if (selectedFindings.length === 0) return
    const csv  = buildCsv(selectedFindings, settings)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `azure-export-${project.clientName ?? 'projekt'}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV nedladdad')
  }

  // ── Copy first item JSON ──────────────────────────────────────────────────────

  function handleCopyFirst() {
    if (!previewJson) return
    navigator.clipboard.writeText(previewJson).then(() => toast('JSON kopierat till urklipp'))
  }

  const allChecked  = sorted.length > 0 && selected.size === sorted.length
  const someChecked = selected.size > 0  && selected.size < sorted.length

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="modal-box ae-box"
        role="dialog"
        aria-modal="true"
        aria-label="Azure DevOps-export"
        onKeyDown={trapKeyDown}
      >
        <button className="modal-close" onClick={onClose} aria-label="Stäng">
          <Icon name="close" />
        </button>

        <h2 className="pf-title">Azure DevOps-export</h2>
        <p className="je-subtitle">{project.clientName} · {project.name}</p>

        {/* ── Settings ── */}
        <div className="ae-settings">
          <div className="field">
            <label className="field-label" htmlFor="ae-area">Area Path</label>
            <input
              id="ae-area"
              className="input"
              type="text"
              placeholder='t.ex. MittProjekt\Team A'
              value={areaPath}
              onChange={e => setAreaPath(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ae-iter">Iteration Path</label>
            <input
              id="ae-iter"
              className="input"
              type="text"
              placeholder='t.ex. MittProjekt\Sprint 1'
              value={iterationPath}
              onChange={e => setIterationPath(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ae-type">Work item-typ</label>
            <select
              id="ae-type"
              className="input"
              value={workItemType}
              onChange={e => setWorkItemType(e.target.value)}
            >
              {WORK_ITEM_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ae-tags">Taggar (kommaseparerat)</label>
            <input
              id="ae-tags"
              className="input"
              type="text"
              placeholder='t.ex. tillgänglighet, wcag'
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* ── Priority map (read-only) ── */}
        <div className="field">
          <span className="field-label">Prioritetsmappning</span>
          <table className="ae-prio-table" aria-label="Mappning av allvarlighetsgrad till Azure DevOps-prioritet">
            <thead>
              <tr>
                <th className="ae-prio-th">Allvarlighetsgrad</th>
                <th className="ae-prio-th">Azure DevOps Priority</th>
              </tr>
            </thead>
            <tbody>
              {SEV_ORDER.map(s => (
                <tr key={s}>
                  <td className="ae-prio-td">
                    <span className={`badge badge-${s}`}>{SEV_LABEL[s]}</span>
                  </td>
                  <td className="ae-prio-td ae-prio-value">Priority {PRIORITY_MAP[s]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Finding list ── */}
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
                <span className={`badge badge-${f.severity}`}>{SEV_LABEL[f.severity]}</span>
                <span className="je-finding-title">{f.title ?? f.wcagCriterionId ?? 'Namnlöst fynd'}</span>
                {f.url && <span className="je-finding-url">{f.url}</span>}
              </label>
            ))}
          </div>
        </div>

        {/* ── Preview ── */}
        {previewJson && (
          <div className="field">
            <span className="field-label">
              Förhandsgranskning – första work item (JSON patch operations)
            </span>
            <pre className="je-preview">{previewJson.slice(0, 1200)}{previewJson.length > 1200 ? '\n…' : ''}</pre>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="ae-actions">
          <div className="ae-primary-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadZip}
              disabled={selectedFindings.length === 0}
            >
              <Icon name="folder_zip" /> Ladda ner ZIP (JSON)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadCsv}
              disabled={selectedFindings.length === 0}
            >
              <Icon name="download" /> Ladda ner CSV
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyFirst}
              disabled={!previewJson}
            >
              <Icon name="content_copy" /> Kopiera JSON till urklipp
            </button>
          </div>

          <p className="ae-instructions">
            Importera JSON-filerna via Azure DevOps REST API eller använd CSV-filen för manuell
            import via <em>Boards → Work Items → Import</em>.
          </p>

          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Stäng
          </button>
        </div>

      </div>
    </div>
  )
}
