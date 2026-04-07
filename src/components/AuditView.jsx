import { useState, useEffect } from 'react'
import { getProject, getFindings, saveFinding, deleteFinding } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import FindingForm from './FindingForm.jsx'
import { toast } from './Toast.jsx'

const SEVERITY_LABEL  = { critical: 'Kritisk', high: 'Hög', medium: 'Medium', low: 'Låg' }
const STATUS_LABEL    = { open: 'Öppen', 'in-progress': 'Pågår', fixed: 'Åtgärdad', 'wont-fix': 'Åtgärdas ej' }
const SEVERITY_ORDER  = { critical: 4, high: 3, medium: 2, low: 1 }
const AFFECTED_LABELS = { vision: 'Synskadade', motor: 'Motoriska svårigheter', cognitive: 'Kognitiva svårigheter', hearing: 'Hörselskadade', older: 'Äldre användare', all: 'Alla användare' }

const PRINCIPLES_SV = {
  Perceivable:    'Uppfattbar',
  Operable:       'Hanterbar',
  Understandable: 'Begriplig',
  Robust:         'Robust',
}

const QUICK_FILTERS = [
  { id: 'all',      label: 'Alla' },
  { id: 'critical', label: 'Kritiska' },
  { id: 'open',     label: 'Öppna' },
  { id: 'eaa',      label: 'EAA-kritiska' },
]

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Öppen',       cls: 'active-open' },
  { value: 'in-progress', label: 'Pågår',        cls: 'active-progress' },
  { value: 'fixed',       label: 'Åtgärdad',    cls: 'active-fixed' },
  { value: 'wont-fix',    label: 'Åtgärdas ej', cls: 'active-wontfix' },
]

function getCriterion(id) { return wcag22.find(c => c.id === id) }

// Format finding number as F-001 based on creation order
function findingNumber(findings, finding) {
  const idx = findings.findIndex(f => f.id === finding.id)
  return idx === -1 ? 'F-???' : `F-${String(idx + 1).padStart(3, '0')}`
}

export default function AuditView({ projectId, initialFindingId, onBack, onOpenOverview }) {
  const [project,     setProject]     = useState(null)
  const [findings,    setFindings]    = useState([])
  const [selected,    setSelected]    = useState(null)   // current finding
  const [viewMode,    setViewMode]    = useState(null)   // null | 'summary' | 'form'
  const [quickFilter, setQuickFilter] = useState('all')
  const [filters,     setFilters]     = useState({ severity: 'all', status: 'all', principle: 'all' })

  function reload(keepSelectedId) {
    const p = getProject(projectId)
    setProject(p)
    const sorted = getFindings(projectId).sort((a, b) =>
      (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0) ||
      b.createdAt.localeCompare(a.createdAt)
    )
    setFindings(sorted)
    // Re-sync selected finding after save/status change
    if (keepSelectedId) {
      const updated = sorted.find(f => f.id === keepSelectedId)
      if (updated) setSelected(updated)
    }
  }

  useEffect(() => { reload() }, [projectId])

  useEffect(() => {
    if (initialFindingId) {
      const found = getFindings(projectId).find(f => f.id === initialFindingId)
      if (found) { setSelected(found); setViewMode('summary') }
    }
  }, [initialFindingId])

  function handleNewFinding()       { setSelected(null);   setViewMode('form') }
  function handleSelectFinding(f)   { setSelected(f);      setViewMode('summary') }
  function handleOpenEdit()         { setViewMode('form') }

  function handleSaved() {
    reload(selected?.id)
    // After saving a new finding, stay in form for quick follow-up
    // After editing existing, go back to summary
    if (selected) {
      setViewMode('summary')
    }
  }

  function handleNew() { setSelected(null); setViewMode('form') }

  function handleDeleteFinding(finding) {
    if (confirm(`Ta bort fyndet "${finding.title || 'Namnlöst fynd'}"?`)) {
      deleteFinding(projectId, finding.id)
      if (selected?.id === finding.id) { setSelected(null); setViewMode(null) }
      reload()
    }
  }

  function handleStatusChange(finding, newStatus) {
    saveFinding(projectId, { ...finding, status: newStatus })
    toast(`Status ändrad: ${STATUS_LABEL[newStatus]}`)
    reload(finding.id)
  }

  function applyFilters(list) {
    let result = list
    if (quickFilter === 'critical') result = result.filter(f => f.severity === 'critical')
    else if (quickFilter === 'open') result = result.filter(f => f.status === 'open' || f.status === 'in-progress')
    else if (quickFilter === 'eaa') result = result.filter(f => {
      if (f.eaaRequirementId) return true
      return getCriterion(f.wcagCriterionId)?.eaaCritical === true
    })

    if (quickFilter === 'all') {
      if (filters.severity  !== 'all') result = result.filter(f => f.severity === filters.severity)
      if (filters.status    !== 'all') result = result.filter(f => f.status   === filters.status)
      if (filters.principle !== 'all') result = result.filter(f => getCriterion(f.wcagCriterionId)?.principle === filters.principle)
    }
    return result
  }

  const filtered = applyFilters(findings)
  const stats = {
    total:    findings.length,
    open:     findings.filter(f => f.status === 'open').length,
    critical: findings.filter(f => f.severity === 'critical').length,
    fixed:    findings.filter(f => f.status === 'fixed').length,
  }

  if (!project) return null

  return (
    <div className="av-root">
      {/* ── Header ── */}
      <header className="av-header">
        <nav className="av-breadcrumb" aria-label="Navigering">
          <button className="av-crumb-link" onClick={onBack}>Dashboard</button>
          <span className="av-crumb-sep" aria-hidden="true">›</span>
          {onOpenOverview ? (
            <button className="av-crumb-link" onClick={() => onOpenOverview(projectId)}>
              {project.name}
            </button>
          ) : (
            <span className="av-crumb-text">{project.name}</span>
          )}
          <span className="av-crumb-sep" aria-hidden="true">›</span>
          <span className="av-crumb-current">Granskning</span>
        </nav>

        <div className="av-header-row2">
          <div className="av-header-info">
            <div className="av-project-name">{project.name}</div>
            <div className="av-project-sub">
              {project.clientName}
              {project.url && ` · ${project.url}`}
              {' · '}WCAG {project.wcagVersion} {project.conformanceTarget}
            </div>
          </div>
          <div className="av-header-stats" aria-live="polite" aria-atomic="true">
            <span className="av-stat">{stats.total} fynd dokumenterade</span>
            {stats.critical > 0 && <span className="av-stat av-stat-critical">{stats.critical} kritiska</span>}
            {stats.open > 0     && <span className="av-stat av-stat-open">{stats.open} öppna</span>}
            {stats.fixed > 0    && <span className="av-stat">{stats.fixed} åtgärdade</span>}
          </div>
        </div>
      </header>

      <div className="av-body">
        {/* ── Sidebar ── */}
        <aside className="av-sidebar" aria-label="Fynd">
          <div className="av-sidebar-header">
            <span className="av-sidebar-title">
              {filtered.length !== findings.length
                ? `${filtered.length} av ${findings.length}`
                : `${findings.length} fynd`}
            </span>
            <button className="btn btn-primary btn-sm" onClick={handleNewFinding}>
              + Nytt fynd
            </button>
          </div>

          <div className="av-chips" role="group" aria-label="Snabbfilter">
            {QUICK_FILTERS.map(chip => (
              <button
                key={chip.id}
                className={`av-chip ${quickFilter === chip.id ? 'av-chip-active' : ''}`}
                onClick={() => setQuickFilter(chip.id)}
                aria-pressed={quickFilter === chip.id}
              >
                {chip.label}
                {chip.id === 'critical' && stats.critical > 0 && <span className="av-chip-count">{stats.critical}</span>}
                {chip.id === 'open'     && stats.open > 0     && <span className="av-chip-count">{stats.open}</span>}
              </button>
            ))}
          </div>

          {quickFilter === 'all' && (
            <div className="av-filters" role="search" aria-label="Detaljfilter">
              <div className="av-filter-row">
                <select className="av-filter-select" value={filters.severity}
                  onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
                  aria-label="Filtrera på allvarlighetsgrad">
                  <option value="all">Alla allvarlighetsgr.</option>
                  <option value="critical">Kritisk</option>
                  <option value="high">Hög</option>
                  <option value="medium">Medium</option>
                  <option value="low">Låg</option>
                </select>
                <select className="av-filter-select" value={filters.status}
                  onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                  aria-label="Filtrera på status">
                  <option value="all">Alla statusar</option>
                  <option value="open">Öppen</option>
                  <option value="in-progress">Pågår</option>
                  <option value="fixed">Åtgärdad</option>
                  <option value="wont-fix">Åtgärdas ej</option>
                </select>
              </div>
              <select className="av-filter-select" value={filters.principle}
                onChange={e => setFilters(f => ({ ...f, principle: e.target.value }))}
                aria-label="Filtrera på WCAG-princip">
                <option value="all">Alla principer</option>
                {Object.entries(PRINCIPLES_SV).map(([key, sv]) => (
                  <option key={key} value={key}>{sv} ({key})</option>
                ))}
              </select>
            </div>
          )}

          <ul className="av-findings-list" aria-label="Fynd">
            {filtered.length === 0 ? (
              <li className="av-empty-findings">
                {findings.length === 0
                  ? 'Inga fynd ännu. Klicka "+ Nytt fynd" för att börja.'
                  : 'Inga fynd matchar filtret.'}
              </li>
            ) : (
              filtered.map(finding => (
                <FindingItem
                  key={finding.id}
                  finding={finding}
                  findingNum={findingNumber(findings, finding)}
                  isActive={selected?.id === finding.id}
                  onClick={() => handleSelectFinding(finding)}
                />
              ))
            )}
          </ul>
        </aside>

        {/* ── Main panel ── */}
        <main className="av-main" aria-label={viewMode === 'form' ? 'Fynd-formulär' : 'Fynd-sammanfattning'}>
          {viewMode === 'form' ? (
            <FindingForm
              key={selected?.id ?? 'new'}
              project={project}
              finding={selected}
              onSaved={handleSaved}
              onNew={handleNew}
            />
          ) : viewMode === 'summary' && selected ? (
            <FindingSummary
              finding={selected}
              findingNum={findingNumber(findings, selected)}
              projectId={projectId}
              onEdit={handleOpenEdit}
              onDelete={() => handleDeleteFinding(selected)}
              onStatusChange={newStatus => handleStatusChange(selected, newStatus)}
            />
          ) : (
            <div className="ff-empty">
              <div className="ff-empty-icon" aria-hidden="true">🔍</div>
              <p className="ff-empty-title">Ingen granskning öppen</p>
              <p className="ff-empty-sub">Välj ett fynd i listan eller skapa ett nytt för att börja.</p>
              <button className="btn btn-primary" onClick={handleNewFinding}>+ Nytt fynd</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ─── FindingItem (sidebar card) ─────────────────────────────────────────────── */

function FindingItem({ finding, findingNum, isActive, onClick }) {
  const criterion = getCriterion(finding.wcagCriterionId)
  const statusKey = finding.status === 'in-progress' ? 'progress' : finding.status === 'wont-fix' ? 'wontfix' : finding.status

  return (
    <li>
      <button
        className={`finding-item ${isActive ? 'finding-item-active' : ''}`}
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={`${findingNum}: ${finding.title || 'Namnlöst fynd'}, allvarlighet ${SEVERITY_LABEL[finding.severity]}, status ${STATUS_LABEL[finding.status]}`}
        type="button"
      >
        <div className="finding-item-top">
          <span className="finding-item-num" aria-hidden="true">{findingNum}</span>
          <span className="finding-item-title" aria-hidden="true">{finding.title || 'Namnlöst fynd'}</span>
        </div>
        {finding.url && (
          <span className="finding-item-url" aria-hidden="true">{finding.url}</span>
        )}
        <div className="finding-item-badges" aria-hidden="true">
          <span className={`badge badge-${finding.severity}`}>{SEVERITY_LABEL[finding.severity]}</span>
          <span className={`badge badge-status-${statusKey}`}>{STATUS_LABEL[finding.status]}</span>
          {criterion && (
            <span className={`badge badge-level-${criterion.level.toLowerCase()}`}>{criterion.level}</span>
          )}
          {criterion?.eaaCritical && <span className="badge badge-eaa">EAA</span>}
        </div>
      </button>
    </li>
  )
}

/* ─── FindingSummary (right panel read view) ─────────────────────────────────── */

function FindingSummary({ finding, findingNum, onEdit, onDelete, onStatusChange }) {
  const criterion = getCriterion(finding.wcagCriterionId)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="fs-root">
      {/* ── Header ── */}
      <div className="fs-header">
        <div className="fs-id-row">
          <span className="fs-id">{findingNum}</span>
          {criterion && (
            <span className="fs-criterion">
              {finding.wcagCriterionId}
              <span className={`badge badge-level-${criterion.level.toLowerCase()}`} style={{ marginLeft: 6 }}>{criterion.level}</span>
              {criterion.eaaCritical && <span className="badge badge-eaa" style={{ marginLeft: 4 }}>EAA</span>}
            </span>
          )}
          {finding.eaaRequirementId && !criterion && (
            <span className="fs-criterion">
              {finding.eaaRequirementId}
              <span className="badge badge-eaa" style={{ marginLeft: 6 }}>EAA</span>
            </span>
          )}
          <span className={`badge badge-${finding.severity} fs-sev-badge`}>{SEVERITY_LABEL[finding.severity]}</span>
        </div>
        <h1 className="fs-title">{finding.title || 'Namnlöst fynd'}</h1>
        {finding.url && (
          <a className="fs-url" href={finding.url} target="_blank" rel="noreferrer">
            {finding.pageTitle ? `${finding.pageTitle} · ` : ''}{finding.url}
          </a>
        )}
      </div>

      {/* ── Quick status picker ── */}
      <div className="fs-status-section">
        <span className="fs-section-label">Status</span>
        <div className="fs-status-row" role="group" aria-label="Ändra status">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`status-btn ${finding.status === opt.value ? opt.cls : ''}`}
              onClick={() => finding.status !== opt.value && onStatusChange(opt.value)}
              aria-pressed={finding.status === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="fs-body">
        {finding.customerDescription && (
          <div className="fs-field">
            <span className="fs-field-label">Kundförklaring</span>
            <p className="fs-field-value">{finding.customerDescription}</p>
          </div>
        )}

        {finding.description && (
          <div className="fs-field">
            <span className="fs-field-label">Teknisk beskrivning</span>
            <p className="fs-field-value fs-field-mono">{finding.description}</p>
          </div>
        )}

        {finding.suggestedFix && (
          <div className="fs-field">
            <span className="fs-field-label">Föreslagen åtgärd</span>
            <p className="fs-field-value">{finding.suggestedFix}</p>
          </div>
        )}

        {finding.affectedUsers?.length > 0 && (
          <div className="fs-field">
            <span className="fs-field-label">Berörda användare</span>
            <div className="fs-tags">
              {finding.affectedUsers.map(u => (
                <span key={u} className="fs-tag">{AFFECTED_LABELS[u] ?? u}</span>
              ))}
            </div>
          </div>
        )}

        {finding.screenshot && (
          <div className="fs-field">
            <span className="fs-field-label">Screenshot</span>
            <img
              src={finding.screenshot}
              alt={`Screenshot för fynd: ${finding.title || 'Namnlöst fynd'}`}
              className="fs-screenshot"
            />
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="fs-actions">
        {confirmDelete ? (
          <>
            <span className="fs-confirm-text">Bekräfta borttagning?</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>Avbryt</button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>Ta bort</button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm fs-delete-btn" onClick={() => setConfirmDelete(true)}>
              Ta bort fynd
            </button>
            <button className="btn btn-primary btn-sm" onClick={onEdit}>
              Redigera fynd →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
