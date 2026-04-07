import { useState, useEffect, useMemo } from 'react'
import { getProject, getFindings, getEaaStatus, saveEaaStatus } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import { eaaRequirements } from '../data/eaa.js'
import JiraExport from './JiraExport.jsx'

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const SEVERITY_ORDER  = { critical: 4, high: 3, medium: 2, low: 1 }
const SEVERITY_LABEL  = { critical: 'Kritisk', high: 'Hög', medium: 'Medium', low: 'Låg' }
const STATUS_LABEL    = { open: 'Öppen', 'in-progress': 'Pågår', fixed: 'Åtgärdad', 'wont-fix': 'Åtgärdas ej' }
const PRINCIPLES      = ['Perceivable', 'Operable', 'Understandable', 'Robust']
const PRINCIPLES_SV   = { Perceivable: 'Uppfattbar', Operable: 'Hanterbar', Understandable: 'Begriplig', Robust: 'Robust' }

function getCriterion(id) { return wcag22.find(c => c.id === id) }

/* ─── Root ───────────────────────────────────────────────────────────────────── */

export default function ProjectOverview({ projectId, onBack, onOpenAudit, onOpenReport, onOpenGuidedSetup, onOpenGuided }) {
  const [project,       setProject]       = useState(null)
  const [findings,      setFindings]      = useState([])
  const [tab,           setTab]           = useState('findings')
  const [criterionFilter, setCriterionFilter] = useState(null)
  const [showJira,      setShowJira]      = useState(false)

  function reload() {
    setProject(getProject(projectId))
    setFindings(
      getFindings(projectId).sort(
        (a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
      )
    )
  }

  useEffect(() => { reload() }, [projectId])

  function handleCriterionClick(criterionId) {
    setCriterionFilter(criterionId)
    setTab('findings')
  }

  function clearCriterionFilter() {
    setCriterionFilter(null)
  }

  if (!project) return null

  const openLevelACount = findings.filter(f => {
    const c = getCriterion(f.wcagCriterionId)
    return c?.level === 'A' && (f.status === 'open' || f.status === 'in-progress')
  }).length

  const TABS = [
    { id: 'findings',  label: `Fynd (${findings.length})` },
    { id: 'coverage',  label: 'WCAG-täckning' },
    { id: 'eaa',       label: 'EAA-status' },
  ]

  return (
    <div className="po-root">
      {/* ── Header ── */}
      <header className="po-header">
        <div className="po-header-inner">
          <div className="po-breadcrumb" aria-label="Navigering">
            <button className="po-crumb-link" onClick={onBack}>Dashboard</button>
            <span className="po-crumb-sep" aria-hidden="true">›</span>
            <span className="po-crumb-current">{project.name}</span>
          </div>
          <div className="po-header-right">
            <div>
              <h1 className="po-project-name">{project.name}</h1>
              <p className="po-project-sub">
                {project.clientName}
                {project.url && ` · ${project.url}`}
                {' · '}WCAG {project.wcagVersion} {project.conformanceTarget}
              </p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {onOpenReport && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenReport(projectId)}
                >
                  Visa rapport
                </button>
              )}
              {onOpenGuided && project.auditContext && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenGuided(projectId)}
                >
                  Fortsätt guidad granskning
                </button>
              )}
              {onOpenGuidedSetup && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenGuidedSetup(projectId)}
                >
                  Guidad granskning
                </button>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAudit(projectId, null)}
              >
                Fri granskning
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="po-tabs" role="tablist" aria-label="Projektöversikt">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`po-tab ${tab === t.id ? 'po-tab-active' : ''}`}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="po-content" role="tabpanel">
        {tab === 'findings' && (
          <FindingsTab
            findings={findings}
            criterionFilter={criterionFilter}
            onClearFilter={clearCriterionFilter}
            onOpenFinding={findingId => onOpenAudit(projectId, findingId)}
            onReload={reload}
            onOpenReport={onOpenReport ? () => onOpenReport(projectId) : null}
            onOpenJira={() => setShowJira(true)}
          />
        )}
        {tab === 'coverage' && (
          <CoverageTab
            findings={findings}
            onCriterionClick={handleCriterionClick}
          />
        )}
        {tab === 'eaa' && (
          <EaaTab
            projectId={projectId}
            findings={findings}
            openLevelACount={openLevelACount}
          />
        )}
      </main>

      {showJira && project && (
        <JiraExport project={project} onClose={() => setShowJira(false)} />
      )}
    </div>
  )
}

/* ─── Tab 1: Fynd ─────────────────────────────────────────────────────────── */

function FindingsTab({ findings, criterionFilter, onClearFilter, onOpenFinding, onReload, onOpenReport, onOpenJira }) {
  const [sortCol, setSortCol]       = useState('severity')
  const [sortDir, setSortDir]       = useState('desc')
  const [groupBy,  setGroupBy]      = useState(false)

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const displayed = useMemo(() => {
    let list = criterionFilter
      ? findings.filter(f => f.wcagCriterionId === criterionFilter)
      : findings

    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortCol === 'severity') {
        cmp = (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
      } else if (sortCol === 'criterion') {
        cmp = (a.wcagCriterionId || a.eaaRequirementId || '').localeCompare(b.wcagCriterionId || b.eaaRequirementId || '')
      } else if (sortCol === 'status') {
        cmp = a.status.localeCompare(b.status)
      } else if (sortCol === 'url') {
        cmp = (a.url || '').localeCompare(b.url || '')
      }
      return sortDir === 'asc' ? -cmp : cmp
    })
  }, [findings, criterionFilter, sortCol, sortDir])

  function SortTh({ col, label }) {
    const active   = sortCol === col
    const ariaSort = active ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'
    return (
      <th
        className={`ft-th ft-th-sortable ${active ? 'ft-th-active' : ''}`}
        aria-sort={ariaSort}
      >
        <button className="ft-sort-btn" onClick={() => toggleSort(col)}>
          {label}
          <span className="ft-sort-icon" aria-hidden="true">
            {active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ' ↕'}
          </span>
        </button>
      </th>
    )
  }

  // Group by principle
  const grouped = useMemo(() => {
    if (!groupBy) return null
    const groups = {}
    PRINCIPLES.forEach(p => { groups[p] = [] })
    groups['EAA'] = []
    groups['Övrigt'] = []

    displayed.forEach(f => {
      const c = getCriterion(f.wcagCriterionId)
      if (f.eaaRequirementId) groups['EAA'].push(f)
      else if (c?.principle && groups[c.principle]) groups[c.principle].push(f)
      else groups['Övrigt'].push(f)
    })

    return Object.entries(groups).filter(([, items]) => items.length > 0)
  }, [displayed, groupBy])

  return (
    <div className="ft-root">
      {/* Toolbar */}
      <div className="ft-toolbar">
        <div className="ft-toolbar-left">
          {criterionFilter && (
            <div className="ft-filter-notice">
              Filtrerat på kriterium {criterionFilter}
              <button className="btn-link" onClick={onClearFilter} style={{ marginLeft: 8 }}>
                Rensa filter ×
              </button>
            </div>
          )}
        </div>
        <div className="ft-toolbar-right">
          <label className="check-item" title="Gruppera fynd per WCAG-princip">
            <input
              type="checkbox"
              checked={groupBy}
              onChange={e => setGroupBy(e.target.checked)}
            />
            Gruppera per princip
          </label>
          {onOpenReport && (
            <button className="btn btn-primary btn-sm" onClick={onOpenReport}>
              📄 Generera rapport
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onOpenJira} aria-label="Exportera fynd till Jira">
            Jira-export
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="ft-empty">
          {criterionFilter
            ? `Inga fynd för kriterium ${criterionFilter}.`
            : 'Inga fynd dokumenterade ännu.'}
        </div>
      ) : groupBy && grouped ? (
        grouped.map(([group, items]) => (
          <div key={group} className="ft-group">
            <h3 className="ft-group-title">
              {PRINCIPLES_SV[group] ?? group}
              <span className="ft-group-count">{items.length}</span>
            </h3>
            <FindingsTable rows={items} onOpenFinding={onOpenFinding} />
          </div>
        ))
      ) : (
        <FindingsTable rows={displayed} onOpenFinding={onOpenFinding} SortTh={SortTh} />
      )}
    </div>
  )
}

function FindingsTable({ rows, onOpenFinding, SortTh }) {
  const SimpleTh = ({ label }) => <th className="ft-th">{label}</th>
  const Th = SortTh ?? SimpleTh

  return (
    <div className="ft-table-wrapper">
      <table className="ft-table">
        <thead>
          <tr>
            <Th col="severity" label="Allvarlighet" />
            <Th col="criterion" label="Kriterium" />
            <th className="ft-th">Titel</th>
            <Th col="url" label="Sida" />
            <Th col="status" label="Status" />
            <th className="ft-th ft-th-action">Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(f => <FindingRow key={f.id} finding={f} onEdit={() => onOpenFinding(f.id)} />)}
        </tbody>
      </table>
    </div>
  )
}

function FindingRow({ finding, onEdit }) {
  const criterion = getCriterion(finding.wcagCriterionId)

  const statusKey = finding.status === 'in-progress' ? 'progress' : finding.status === 'wont-fix' ? 'wontfix' : finding.status

  return (
    <tr
      className="ft-tr"
      onClick={onEdit}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onEdit())}
      tabIndex={0}
      aria-label={`Fynd: ${finding.title || 'Namnlöst fynd'}, allvarlighet ${SEVERITY_LABEL[finding.severity]}, status ${STATUS_LABEL[finding.status]}`}
    >
      <td className="ft-td">
        <span className={`badge badge-${finding.severity}`} aria-label={`Allvarlighetsgrad: ${SEVERITY_LABEL[finding.severity]}`}>
          {SEVERITY_LABEL[finding.severity]}
        </span>
      </td>
      <td className="ft-td ft-td-criterion">
        <span className="ft-criterion-id">
          {finding.eaaRequirementId ?? finding.wcagCriterionId ?? '—'}
        </span>
        {criterion && (
          <span className={`badge badge-level-${criterion.level.toLowerCase()}`} aria-label={`WCAG-nivå ${criterion.level}`}>{criterion.level}</span>
        )}
        {criterion?.eaaCritical && <span className="badge badge-eaa" aria-label="EAA-kritiskt">EAA</span>}
      </td>
      <td className="ft-td ft-td-title">
        <span className="ft-title">{finding.title || 'Namnlöst fynd'}</span>
        {finding.pageTitle && <span className="ft-page-title">{finding.pageTitle}</span>}
      </td>
      <td className="ft-td ft-td-url">
        <span className="ft-url" title={finding.url}>{finding.url || '—'}</span>
      </td>
      <td className="ft-td">
        <span className={`badge badge-status-${statusKey}`} aria-label={`Status: ${STATUS_LABEL[finding.status]}`}>
          {STATUS_LABEL[finding.status]}
        </span>
      </td>
      <td className="ft-td ft-td-action">
        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onEdit() }}>
          Redigera
        </button>
      </td>
    </tr>
  )
}

/* ─── Tab 2: WCAG-täckning ───────────────────────────────────────────────────── */

function CoverageTab({ findings, onCriterionClick }) {
  const criterionMap = useMemo(() => {
    const map = {}
    findings.forEach(f => {
      if (!f.wcagCriterionId) return
      if (!map[f.wcagCriterionId]) map[f.wcagCriterionId] = []
      map[f.wcagCriterionId].push(f)
    })
    return map
  }, [findings])

  const covered  = Object.keys(criterionMap).length
  const withOpen = Object.values(criterionMap).filter(fs =>
    fs.some(f => f.status !== 'fixed' && f.status !== 'wont-fix')
  ).length

  return (
    <div className="cov-root">
      <div className="cov-summary">
        <span className="cov-summary-item">
          <strong>{covered}</strong> av {wcag22.length} kriterier granskade
        </span>
        <span className="cov-legend">
          <span className="cov-legend-dot cov-dot-ok" aria-hidden="true" /> Inga öppna fynd
          <span className="cov-legend-dot cov-dot-warn" aria-hidden="true" /> Öppna fynd
          <span className="cov-legend-dot cov-dot-none" aria-hidden="true" /> Ej granskad
        </span>
      </div>

      {PRINCIPLES.map(principle => {
        const criteria = wcag22.filter(c => c.principle === principle)
        const levelGroups = ['A', 'AA', 'AAA']
        return (
          <section key={principle} className="cov-principle">
            <h2 className="cov-principle-title">
              {PRINCIPLES_SV[principle]}
              <span className="cov-principle-sub">{principle}</span>
            </h2>
            {levelGroups.map(level => {
              const items = criteria.filter(c => c.level === level)
              if (!items.length) return null
              return (
                <div key={level} className="cov-level-group">
                  <span className={`cov-level-label badge badge-level-${level.toLowerCase()}`}>{level}</span>
                  <div className="cov-grid">
                    {items.map(c => {
                      const cFindings = criterionMap[c.id] || []
                      const openCount = cFindings.filter(f => f.status !== 'fixed' && f.status !== 'wont-fix').length
                      const hasFindings = cFindings.length > 0

                      let state, stateLabel
                      if (!hasFindings) { state = 'none';  stateLabel = 'Ej granskad' }
                      else if (openCount > 0) { state = 'warn';  stateLabel = `${openCount} öppna fynd` }
                      else { state = 'ok';    stateLabel = 'Inga öppna fynd' }

                      return (
                        <button
                          key={c.id}
                          className={`cov-tile cov-tile-${state} ${openCount > 0 ? 'cov-tile-clickable' : ''}`}
                          onClick={() => openCount > 0 ? onCriterionClick(c.id) : undefined}
                          title={`${c.id} ${c.nameSwedish} · ${stateLabel}`}
                          aria-label={`${c.id} ${c.nameSwedish}: ${stateLabel}`}
                          aria-disabled={openCount === 0 || undefined}
                        >
                          <span className="cov-tile-id">{c.id}</span>
                          <span className="cov-tile-indicator" aria-hidden="true">
                            {state === 'ok'   ? '✓' :
                             state === 'warn' ? openCount :
                             '○'}
                          </span>
                          {c.eaaCritical && (
                            <span className="cov-tile-eaa" aria-label="EAA-kritiskt" title="EAA-kritiskt">E</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}

/* ─── Tab 3: EAA-status ──────────────────────────────────────────────────────── */

function EaaTab({ projectId, findings, openLevelACount }) {
  const [eaaStatus, setEaaStatus] = useState(() => getEaaStatus(projectId))

  function toggleItem(reqId, idx) {
    const current = eaaStatus[reqId] ?? { checkedItems: [], note: '' }
    const checked = current.checkedItems.includes(idx)
      ? current.checkedItems.filter(x => x !== idx)
      : [...current.checkedItems, idx]
    update(reqId, { ...current, checkedItems: checked })
  }

  function setNote(reqId, note) {
    const current = eaaStatus[reqId] ?? { checkedItems: [] }
    update(reqId, { ...current, note })
  }

  function update(reqId, data) {
    const next = { ...eaaStatus, [reqId]: data }
    setEaaStatus(next)
    saveEaaStatus(projectId, next)
  }

  // A requirement is "fulfilled" if ALL its checkItems are checked
  const fulfilledCount = eaaRequirements.filter(req => {
    const s = eaaStatus[req.id]
    return s && req.checkItems.every((_, i) => s.checkedItems.includes(i))
  }).length

  return (
    <div className="eaa-tab-root">
      {/* Summary */}
      <div className="eaa-summary">
        <div className="eaa-summary-score">
          <span className="eaa-summary-value">{fulfilledCount}</span>
          <span className="eaa-summary-total">/ {eaaRequirements.length}</span>
          <span className="eaa-summary-label">EAA-krav uppfyllda</span>
        </div>

        {openLevelACount > 0 && (
          <div className="eaa-warning" role="alert">
            <span className="eaa-warning-icon" aria-hidden="true">⚠️</span>
            <div>
              <strong>OBS: {openLevelACount} nivå A-kriterier har öppna fynd</strong>
              <p>Detta påverkar EAA-efterlevnad direkt. Kriterierna på nivå A är obligatoriska för alla webbplatser inom EAA:s tillämpningsområde.</p>
            </div>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="eaa-reqs">
        {eaaRequirements.map(req => {
          const status   = eaaStatus[req.id] ?? { checkedItems: [], note: '' }
          const allDone  = req.checkItems.every((_, i) => status.checkedItems.includes(i))
          const donePct  = req.checkItems.length > 0
            ? Math.round((status.checkedItems.length / req.checkItems.length) * 100)
            : 0

          return (
            <div key={req.id} className={`eaa-req ${allDone ? 'eaa-req-done' : ''}`}>
              <div className="eaa-req-header">
                <div className="eaa-req-meta">
                  <span className="badge badge-eaa">{req.id}</span>
                  <span className="eaa-req-category">{req.category}</span>
                  <span className="eaa-req-pct">{donePct}%</span>
                </div>
                <h3 className="eaa-req-title">{req.title}</h3>
                <p className="eaa-req-desc">{req.description}</p>
              </div>

              <div className="eaa-req-items">
                {req.checkItems.map((item, i) => (
                  <label key={i} className={`eaa-check-item ${status.checkedItems.includes(i) ? 'eaa-check-done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={status.checkedItems.includes(i)}
                      onChange={() => toggleItem(req.id, i)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div className="eaa-req-note">
                <label htmlFor={`note-${req.id}`} className="field-label">
                  Anteckning
                </label>
                <textarea
                  id={`note-${req.id}`}
                  className="input"
                  rows={2}
                  value={status.note || ''}
                  onChange={e => setNote(req.id, e.target.value)}
                  placeholder="Lägg till kommentar om status, avvikelser eller planerade åtgärder..."
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
