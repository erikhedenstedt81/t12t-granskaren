import { useState, useEffect } from 'react'
import { getProject, getFindings, deleteFinding } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import FindingForm from './FindingForm.jsx'

const SEVERITY_LABEL = { critical: 'Kritisk', high: 'Hög', medium: 'Medium', low: 'Låg' }
const STATUS_LABEL   = { open: 'Öppen', 'in-progress': 'Pågår', fixed: 'Åtgärdad', 'wont-fix': 'Åtgärdas ej' }
const SEVERITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 }

const PRINCIPLES_SV = {
  Perceivable:    'Uppfattbar',
  Operable:       'Hanterbar',
  Understandable: 'Begriplig',
  Robust:         'Robust',
}

// Quick-filter chip definitions
const QUICK_FILTERS = [
  { id: 'all',      label: 'Alla' },
  { id: 'critical', label: 'Kritiska' },
  { id: 'open',     label: 'Öppna' },
  { id: 'eaa',      label: 'EAA-kritiska' },
]

function getCriterion(id) { return wcag22.find(c => c.id === id) }

export default function AuditView({ projectId, initialFindingId, onBack, onOpenOverview }) {
  const [project,     setProject]     = useState(null)
  const [findings,    setFindings]    = useState([])
  const [editFinding, setEditFinding] = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [quickFilter, setQuickFilter] = useState('all')
  const [filters,     setFilters]     = useState({ severity: 'all', status: 'all', principle: 'all' })

  function reload() {
    const p = getProject(projectId)
    setProject(p)
    setFindings(
      getFindings(projectId).sort((a, b) =>
        (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0) ||
        b.createdAt.localeCompare(a.createdAt)
      )
    )
  }

  useEffect(() => {
    reload()
  }, [projectId])

  // Pre-select a finding if passed in (from ProjectOverview)
  useEffect(() => {
    if (initialFindingId) {
      const found = getFindings(projectId).find(f => f.id === initialFindingId)
      if (found) { setEditFinding(found); setShowForm(true) }
    }
  }, [initialFindingId])

  function handleNewFinding()        { setEditFinding(null); setShowForm(true) }
  function handleSelectFinding(f)    { setEditFinding(f);    setShowForm(true) }
  function handleSaved()             { reload(); setEditFinding(null); setShowForm(true) }
  function handleNew()               { setEditFinding(null); setShowForm(true) }

  function handleDeleteFinding(e, finding) {
    e.stopPropagation()
    if (confirm(`Ta bort fyndet "${finding.title || 'Namnlöst fynd'}"?`)) {
      deleteFinding(projectId, finding.id)
      if (editFinding?.id === finding.id) { setEditFinding(null); setShowForm(false) }
      reload()
    }
  }

  // Apply quick filter first, then detail filters
  function applyFilters(list) {
    let result = list

    if (quickFilter === 'critical') {
      result = result.filter(f => f.severity === 'critical')
    } else if (quickFilter === 'open') {
      result = result.filter(f => f.status === 'open' || f.status === 'in-progress')
    } else if (quickFilter === 'eaa') {
      result = result.filter(f => {
        if (f.eaaRequirementId) return true
        const c = getCriterion(f.wcagCriterionId)
        return c?.eaaCritical === true
      })
    }

    if (quickFilter === 'all') {
      if (filters.severity  !== 'all') result = result.filter(f => f.severity === filters.severity)
      if (filters.status    !== 'all') result = result.filter(f => f.status   === filters.status)
      if (filters.principle !== 'all') {
        result = result.filter(f => {
          const c = getCriterion(f.wcagCriterionId)
          return c?.principle === filters.principle
        })
      }
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
        {/* Breadcrumb */}
        <nav className="av-breadcrumb" aria-label="Navigering">
          <button className="av-crumb-link" onClick={onBack}>Dashboard</button>
          <span className="av-crumb-sep" aria-hidden="true">›</span>
          {onOpenOverview ? (
            <button
              className="av-crumb-link"
              onClick={() => onOpenOverview(projectId)}
            >
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

          {/* Real-time counter */}
          <div className="av-header-stats" aria-live="polite" aria-atomic="true">
            <span className="av-stat">{stats.total} fynd dokumenterade</span>
            {stats.critical > 0 && (
              <span className="av-stat av-stat-critical">{stats.critical} kritiska</span>
            )}
            {stats.open > 0 && (
              <span className="av-stat av-stat-open">{stats.open} öppna</span>
            )}
            {stats.fixed > 0 && (
              <span className="av-stat">{stats.fixed} åtgärdade</span>
            )}
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

          {/* Quick filter chips */}
          <div className="av-chips" role="group" aria-label="Snabbfilter">
            {QUICK_FILTERS.map(chip => (
              <button
                key={chip.id}
                className={`av-chip ${quickFilter === chip.id ? 'av-chip-active' : ''}`}
                onClick={() => setQuickFilter(chip.id)}
                aria-pressed={quickFilter === chip.id}
              >
                {chip.label}
                {chip.id === 'critical' && stats.critical > 0 && (
                  <span className="av-chip-count">{stats.critical}</span>
                )}
                {chip.id === 'open' && stats.open > 0 && (
                  <span className="av-chip-count">{stats.open}</span>
                )}
              </button>
            ))}
          </div>

          {/* Detail filters (only shown when quick = 'all') */}
          {quickFilter === 'all' && (
            <div className="av-filters" role="search" aria-label="Detaljfilter">
              <div className="av-filter-row">
                <select
                  className="av-filter-select"
                  value={filters.severity}
                  onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
                  aria-label="Filtrera på allvarlighetsgrad"
                >
                  <option value="all">Alla allvarlighetsgr.</option>
                  <option value="critical">Kritisk</option>
                  <option value="high">Hög</option>
                  <option value="medium">Medium</option>
                  <option value="low">Låg</option>
                </select>
                <select
                  className="av-filter-select"
                  value={filters.status}
                  onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                  aria-label="Filtrera på status"
                >
                  <option value="all">Alla statusar</option>
                  <option value="open">Öppen</option>
                  <option value="in-progress">Pågår</option>
                  <option value="fixed">Åtgärdad</option>
                  <option value="wont-fix">Åtgärdas ej</option>
                </select>
              </div>
              <select
                className="av-filter-select"
                value={filters.principle}
                onChange={e => setFilters(f => ({ ...f, principle: e.target.value }))}
                aria-label="Filtrera på WCAG-princip"
              >
                <option value="all">Alla principer</option>
                {Object.entries(PRINCIPLES_SV).map(([key, sv]) => (
                  <option key={key} value={key}>{sv} ({key})</option>
                ))}
              </select>
            </div>
          )}

          <div className="av-findings-list" role="list">
            {filtered.length === 0 ? (
              <p className="av-empty-findings">
                {findings.length === 0
                  ? 'Inga fynd ännu. Klicka "+ Nytt fynd" för att börja.'
                  : 'Inga fynd matchar filtret.'}
              </p>
            ) : (
              filtered.map(finding => (
                <FindingItem
                  key={finding.id}
                  finding={finding}
                  isActive={editFinding?.id === finding.id}
                  onClick={() => handleSelectFinding(finding)}
                  onDelete={e => handleDeleteFinding(e, finding)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Main / Form ── */}
        <main className="av-main" aria-label="Fynd-formulär">
          {showForm ? (
            <FindingForm
              key={editFinding?.id ?? 'new'}
              project={project}
              finding={editFinding}
              onSaved={handleSaved}
              onNew={handleNew}
            />
          ) : (
            <div className="ff-empty">
              <div className="ff-empty-icon" aria-hidden="true">🔍</div>
              <p className="ff-empty-title">Ingen granskning öppen</p>
              <p className="ff-empty-sub">
                Välj ett fynd i listan eller skapa ett nytt för att börja.
              </p>
              <button className="btn btn-primary" onClick={handleNewFinding}>
                + Nytt fynd
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function FindingItem({ finding, isActive, onClick, onDelete }) {
  const criterion = getCriterion(finding.wcagCriterionId)

  return (
    <div
      className={`finding-item ${isActive ? 'finding-item-active' : ''}`}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      tabIndex={0}
      role="listitem"
      aria-label={`Fynd: ${finding.title || 'Namnlöst fynd'}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="finding-item-top">
        <span className="finding-item-criterion">
          {finding.eaaRequirementId ?? finding.wcagCriterionId ?? '—'}
        </span>
        <span className="finding-item-title">{finding.title || 'Namnlöst fynd'}</span>
        <button
          className="finding-item-delete btn-icon"
          onClick={onDelete}
          aria-label={`Ta bort fynd: ${finding.title}`}
          title="Ta bort fynd"
        >
          ×
        </button>
      </div>
      <div className="finding-item-badges">
        <span className={`badge badge-${finding.severity}`}>{SEVERITY_LABEL[finding.severity]}</span>
        <span className={`badge badge-status-${finding.status === 'in-progress' ? 'progress' : finding.status === 'wont-fix' ? 'wontfix' : finding.status}`}>
          {STATUS_LABEL[finding.status]}
        </span>
        {criterion && (
          <span className={`badge badge-level-${criterion.level.toLowerCase()}`}>{criterion.level}</span>
        )}
        {criterion?.eaaCritical && (
          <span className="badge badge-eaa">EAA</span>
        )}
      </div>
    </div>
  )
}
