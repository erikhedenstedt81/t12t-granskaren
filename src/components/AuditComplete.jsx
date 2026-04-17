import { useEffect, useState } from 'react'
import { getFindings, saveProject } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import { DIGG_EXTRA_CRITERIA } from '../data/diggManual.js'
import JiraExport from './JiraExport.jsx'

const ALL_CRITERIA = [...wcag22, ...DIGG_EXTRA_CRITERIA]

export default function AuditComplete({
  project,
  urlProgress,   // { [criterionId]: 'passed'|'finding'|'na'|null }
  orderedIds,    // ordered list of applicable criterion ids
  onContinue,   // → back to guided audit
  onBack,       // → project overview
  onOpenReport, // → customer report
}) {
  const [showJira, setShowJira] = useState(false)
  const [findings, setFindings] = useState([])

  useEffect(() => {
    // Mark project as completed in localStorage
    saveProject({ ...project, status: 'completed' })
    // Load findings for severity & EAA stats
    setFindings(getFindings(project.id))
  }, [project.id])

  // ── Guided progress stats ────────────────────────────────────────────────────
  const passed  = orderedIds.filter(id => urlProgress[id] === 'passed').length
  const finding = orderedIds.filter(id => urlProgress[id] === 'finding').length
  const na      = orderedIds.filter(id => urlProgress[id] === 'na').length
  const total   = orderedIds.length

  // ── Findings by severity (open findings only) ────────────────────────────────
  const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const f of findings) {
    if (f.status !== 'open') continue
    if (sevCounts[f.severity] !== undefined) sevCounts[f.severity]++
  }

  // ── EAA stats ────────────────────────────────────────────────────────────────
  const eaaCriticalIds = orderedIds.filter(id =>
    ALL_CRITERIA.find(c => c.id === id)?.eaaCritical
  )
  const eaaOpenFindings = findings.filter(f =>
    f.status === 'open' &&
    ALL_CRITERIA.find(c => c.id === f.wcagCriterionId)?.eaaCritical
  )

  const dateStr = new Date().toLocaleDateString('sv-SE')

  return (
    <div className="ac-root">

      {/* ── Jira-export overlay ── */}
      {showJira && (
        <JiraExport project={project} onClose={() => setShowJira(false)} />
      )}

      <div className="ac-card" role="main" aria-labelledby="ac-title">

        {/* ── Header ── */}
        <div className="ac-header">
          <div className="ac-check-icon" aria-hidden="true">✓</div>
          <div>
            <h1 className="ac-title" id="ac-title">Granskning slutförd</h1>
            <p className="ac-meta">
              {project.name}
              {project.clientName ? ` · ${project.clientName}` : ''}
              {' · '}{dateStr}
            </p>
          </div>
        </div>

        <div className="ac-body">

          {/* ── Granskningsresultat ── */}
          <section className="ac-section" aria-labelledby="ac-results-heading">
            <h2 className="ac-section-title" id="ac-results-heading">Granskningsresultat</h2>
            <p className="ac-total">{total} kriterier granskade</p>
            <ul className="ac-stat-list">
              <li className="ac-stat ac-stat-passed">
                <span className="ac-stat-icon" aria-hidden="true">✓</span>
                <span className="ac-stat-label">Godkända</span>
                <span className="ac-stat-count">{passed}</span>
              </li>
              <li className="ac-stat ac-stat-finding">
                <span className="ac-stat-icon" aria-hidden="true">✗</span>
                <span className="ac-stat-label">Fynd dokumenterade</span>
                <span className="ac-stat-count">{finding}</span>
              </li>
              <li className="ac-stat ac-stat-na">
                <span className="ac-stat-icon" aria-hidden="true">–</span>
                <span className="ac-stat-label">Ej applicerbara</span>
                <span className="ac-stat-count">{na}</span>
              </li>
            </ul>
          </section>

          {/* ── Fynd per allvarlighetsgrad ── */}
          <section className="ac-section" aria-labelledby="ac-sev-heading">
            <h2 className="ac-section-title" id="ac-sev-heading">Fynd per allvarlighetsgrad</h2>
            <ul className="ac-sev-list">
              {[
                { key: 'critical', label: 'Kritiska',  dot: '🔴' },
                { key: 'high',     label: 'Höga',      dot: '🟠' },
                { key: 'medium',   label: 'Medium',    dot: '🟡' },
                { key: 'low',      label: 'Låga',      dot: '🟢' },
              ].map(({ key, label, dot }) => (
                <li key={key} className="ac-sev-item">
                  <span className="ac-sev-dot" aria-hidden="true">{dot}</span>
                  <span className="ac-sev-label">{label}</span>
                  <span className="ac-sev-count">{sevCounts[key]}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── EAA-status ── */}
          {eaaCriticalIds.length > 0 && (
            <section className="ac-section" aria-labelledby="ac-eaa-heading">
              <h2 className="ac-section-title" id="ac-eaa-heading">EAA-status</h2>
              <p className="ac-eaa-text">
                {eaaOpenFindings.length === 0
                  ? 'Inga öppna fynd på EAA-kritiska kriterier.'
                  : `${eaaOpenFindings.length} av ${eaaCriticalIds.length} EAA-kritiska kriterier har öppna fynd.`}
              </p>
            </section>
          )}

          {/* ── Åtgärder ── */}
          <section className="ac-section" aria-labelledby="ac-actions-heading">
            <h2 className="ac-section-title" id="ac-actions-heading">Vad vill du göra nu?</h2>
            <div className="ac-actions">
              <button className="btn btn-primary" onClick={onOpenReport}>
                Generera rapport
              </button>
              <button className="btn btn-secondary" onClick={() => setShowJira(true)}>
                Jira-export
              </button>
              <button className="btn btn-secondary" onClick={onBack}>
                Gå till projektöversikt
              </button>
              <button className="btn btn-ghost" onClick={onContinue}>
                ← Fortsätt granska
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
