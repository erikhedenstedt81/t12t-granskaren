import { useState, useEffect, useMemo } from 'react'
import { getProjects, getFindings, deleteProject } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import ProjectForm from './ProjectForm.jsx'
import { Modal } from './ProjectList.jsx'
import GlobalSearch from './GlobalSearch.jsx'

const SEVERITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 }

export default function Dashboard({ onOpenAudit, onOpenOverview, onOpenAuditByIds, onOpenSettings, onOpenGuidedSetup }) {
  const [projects,    setProjects]    = useState([])
  const [globalStats, setGlobalStats] = useState({ active: 0, open: 0, critical: 0, fixedRecent: 0 })
  const [formProject, setFormProject] = useState(undefined) // undefined=closed, null=new, obj=edit

  function loadAll() {
    const projs = getProjects().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    let open = 0, critical = 0, fixedRecent = 0

    for (const p of projs) {
      const fs = getFindings(p.id)
      open        += fs.filter(f => f.status === 'open' || f.status === 'in-progress').length
      critical    += fs.filter(f => f.severity === 'critical' && f.status !== 'fixed' && f.status !== 'wont-fix').length
      fixedRecent += fs.filter(f => f.status === 'fixed' && f.updatedAt >= cutoff).length
    }

    setProjects(projs)
    setGlobalStats({ active: projs.filter(p => p.status === 'active').length, open, critical, fixedRecent })
  }

  useEffect(() => { loadAll() }, [])

  return (
    <div className="db-root">
      <header className="db-header">
        <div className="db-header-inner">
          <div className="db-logo">
            <span aria-hidden="true" className="db-logo-icon">♿</span>
            <div>
              <h1 className="db-title">Tillgänglighetsgranskaren</h1>
              <span className="db-subtitle">WCAG 2.2 · EAA 2025</span>
            </div>
          </div>
          <div className="db-header-actions">
            <GlobalSearch onNavigate={(projectId, findingId) => onOpenAuditByIds(projectId, findingId)} />
            <button
              className="btn btn-ghost btn-icon"
              onClick={onOpenSettings}
              aria-label="Inställningar"
              title="Inställningar"
            >
              ⚙
            </button>
            <button className="btn btn-primary" onClick={() => setFormProject(null)}>
              + Nytt projekt
            </button>
          </div>
        </div>
      </header>

      <div className="db-main">
        {/* ── Global stats ── */}
        <div className="db-stats" role="list" aria-label="Översiktsstatistik">
          <StatCard role="listitem" label="Aktiva projekt"           value={globalStats.active}      icon="📁" />
          <StatCard role="listitem" label="Öppna fynd"               value={globalStats.open}        icon="🔍" />
          <StatCard role="listitem" label="Kritiska fynd"            value={globalStats.critical}    icon="🚨" accent />
          <StatCard role="listitem" label="Åtgärdade (30 dagar)"    value={globalStats.fixedRecent} icon="✅" positive />
        </div>

        {/* ── Projects ── */}
        {projects.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon" aria-hidden="true">📋</div>
            <h2>Inga projekt ännu</h2>
            <p>Skapa ett granskningsprojekt för att börja dokumentera tillgänglighetsproblem.</p>
            <button className="btn btn-primary" onClick={() => setFormProject(null)}>
              Skapa första projektet
            </button>
          </div>
        ) : (
          <section aria-label="Projekt">
            <div className="db-section-header">
              <h2 className="db-section-title">Projekt</h2>
              <span className="db-section-count">{projects.length} st</span>
            </div>
            <div className="db-grid">
              {projects.map(p => (
                <ProjectDashCard
                  key={p.id}
                  project={p}
                  onAudit={e => { e.stopPropagation(); onOpenAudit(p) }}
                  onOverview={e => { e.stopPropagation(); onOpenOverview(p) }}
                  onGuidedSetup={e => { e.stopPropagation(); onOpenGuidedSetup && onOpenGuidedSetup(p.id) }}
                  onEdit={e => { e.stopPropagation(); setFormProject(p) }}
                  onDelete={e => {
                    e.stopPropagation()
                    if (confirm(`Ta bort "${p.name}" och alla dess fynd?`)) {
                      deleteProject(p.id); loadAll()
                    }
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {formProject !== undefined && (
        <Modal onClose={() => setFormProject(undefined)} label={formProject ? 'Redigera projekt' : 'Nytt projekt'}>
          <ProjectForm
            project={formProject}
            onSaved={saved => {
              setFormProject(undefined)
              if (!formProject && saved && onOpenGuidedSetup) {
                // Nytt projekt → gå direkt till guidad granskning
                onOpenGuidedSetup(saved.id, true)
              } else {
                // Redigering → stanna på dashboarden
                loadAll()
              }
            }}
            onCancel={() => setFormProject(undefined)}
          />
        </Modal>
      )}
    </div>
  )
}

/* ─── StatCard ─────────────────────────────────────────────────────────────── */

function StatCard({ label, value, icon, accent, positive }) {
  return (
    <div className={`db-stat-card ${accent ? 'db-stat-accent' : positive ? 'db-stat-positive' : ''}`}>
      <span className="db-stat-icon" aria-hidden="true">{icon}</span>
      <span className="db-stat-value">{value}</span>
      <span className="db-stat-label">{label}</span>
    </div>
  )
}

/* ─── ProjectDashCard ──────────────────────────────────────────────────────── */

function ProjectDashCard({ project, onAudit, onOverview, onGuidedSetup, onEdit, onDelete }) {
  const findings = useMemo(() => getFindings(project.id), [project.id])

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0 }
    findings.forEach(f => { if (c[f.severity] !== undefined) c[f.severity]++ })
    return c
  }, [findings])

  // Coverage: % of 87 WCAG criteria that appear in any finding
  const criteriaReviewed = useMemo(
    () => new Set(findings.map(f => f.wcagCriterionId).filter(Boolean)).size,
    [findings]
  )
  const coveragePct = Math.round((criteriaReviewed / wcag22.length) * 100)

  const lastUpdated = project.updatedAt
    ? new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short' }).format(new Date(project.updatedAt))
    : '–'

  const openCount = findings.filter(f => f.status === 'open' || f.status === 'in-progress').length

  return (
    <article className="db-project-card" aria-label={project.name}>
      <div className="db-card-top">
        <div className="db-card-info">
          <h3 className="db-card-name">{project.name}</h3>
          <p className="db-card-client">{project.clientName}</p>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="db-card-url"
              onClick={e => e.stopPropagation()}
            >
              {project.url}
            </a>
          )}
        </div>
        <ProgressRing percent={coveragePct} reviewed={criteriaReviewed} />
      </div>

      <SeverityBar counts={counts} total={findings.length} />

      <div className="db-card-meta">
        <span>Senast uppdaterad: {lastUpdated}</span>
        <span>
          <span className={`badge ${project.status === 'completed' ? 'badge-neutral' : 'badge-active'}`}>
            {project.status === 'completed' ? 'Avslutad' : 'Aktiv'}
          </span>
        </span>
        {openCount > 0 && (
          <span className="db-card-open-badge">{openCount} öppna fynd</span>
        )}
      </div>

      <div className="db-card-actions">
        <button className="btn btn-primary btn-sm" onClick={onGuidedSetup}
          title="Starta en guidad granskning med DIGG-metodik">
          Guidad granskning
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onAudit}
          title="Öppna fri granskning – dokumentera fynd manuellt">
          Fri granskning
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onOverview}
          title="Visa projektöversikt, rapport och EAA-status">
          Projektöversikt
        </button>
        <div className="db-card-links">
          <button className="btn-link" onClick={onEdit}>Redigera</button>
          <button className="btn-link btn-link-danger" onClick={onDelete}>Ta bort</button>
        </div>
      </div>
    </article>
  )
}

/* ─── ProgressRing ─────────────────────────────────────────────────────────── */

function ProgressRing({ percent, reviewed }) {
  const size       = 60
  const stroke     = 5
  const radius     = (size - stroke) / 2
  const circ       = 2 * Math.PI * radius
  const offset     = circ - (percent / 100) * circ
  const color      = percent >= 70 ? 'var(--low)' : percent >= 40 ? 'var(--medium)' : 'var(--high)'

  return (
    <div
      className="progress-ring"
      role="img"
      aria-label={`${percent}% av WCAG-kriterier granskade (${reviewed} av ${wcag22.length})`}
      title={`${reviewed}/${wcag22.length} kriterier täckta`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="progress-ring-label">
        <span className="progress-ring-pct">{percent}%</span>
        <span className="progress-ring-sub">täckt</span>
      </div>
    </div>
  )
}

/* ─── SeverityBar ──────────────────────────────────────────────────────────── */

const SEV_LABEL = { critical: 'Kritisk', high: 'Hög', medium: 'Medium', low: 'Låg' }
const SEV_ORDER = ['critical', 'high', 'medium', 'low']

function SeverityBar({ counts, total }) {
  if (total === 0) {
    return <p className="sev-bar-empty">Inga fynd dokumenterade</p>
  }

  return (
    <div className="sev-bar-chart" aria-label="Fyndfördelning per allvarlighetsgrad">
      {SEV_ORDER.filter(s => counts[s] > 0).map(s => (
        <div key={s} className="sev-bar-row">
          <span className="sev-bar-label">{SEV_LABEL[s]}</span>
          <div className="sev-bar-track" aria-hidden="true">
            <div
              className={`sev-bar-fill sev-bar-fill-${s}`}
              style={{ width: `${(counts[s] / total) * 100}%` }}
            />
          </div>
          <span className="sev-bar-count">{counts[s]}</span>
        </div>
      ))}
    </div>
  )
}
