import { useState, useEffect } from 'react'
import { getProjects, deleteProject, getFindings } from '../store/storage.js'
import ProjectForm from './ProjectForm.jsx'

export default function ProjectList({ onOpen }) {
  const [projects, setProjects] = useState([])
  // undefined = closed, null = new, object = edit
  const [formProject, setFormProject] = useState(undefined)

  useEffect(() => { reload() }, [])

  function reload() {
    setProjects(getProjects().sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }

  function handleDelete(e, project) {
    e.stopPropagation()
    if (confirm(`Ta bort "${project.name}" och alla dess fynd? Det går inte att ångra.`)) {
      deleteProject(project.id)
      reload()
    }
  }

  return (
    <div className="pl-root">
      <header className="pl-header">
        <div className="pl-header-inner">
          <div className="pl-logo">
            <span className="pl-logo-icon" aria-hidden="true">♿</span>
            <div>
              <h1 className="pl-title">Tillgänglighetsgranskaren</h1>
              <span className="pl-version">WCAG 2.2 · EAA 2025</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setFormProject(null)}>
            + Nytt projekt
          </button>
        </div>
      </header>

      <main className="pl-main">
        {projects.length === 0 ? (
          <div className="pl-empty">
            <div className="pl-empty-icon" aria-hidden="true">📋</div>
            <h2>Inga projekt ännu</h2>
            <p>Skapa ett nytt granskningsprojekt för att börja dokumentera tillgänglighetsproblem.</p>
            <button className="btn btn-primary" onClick={() => setFormProject(null)}>
              Skapa första projektet
            </button>
          </div>
        ) : (
          <>
            <div className="pl-section-header">
              <span className="pl-section-title">{projects.length} projekt</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setFormProject(null)}>
                + Nytt projekt
              </button>
            </div>
            <div className="pl-grid">
              {projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => onOpen(p)}
                  onEdit={e => { e.stopPropagation(); setFormProject(p) }}
                  onDelete={e => handleDelete(e, p)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {formProject !== undefined && (
        <Modal onClose={() => setFormProject(undefined)}>
          <ProjectForm
            project={formProject}
            onSaved={() => { setFormProject(undefined); reload() }}
            onCancel={() => setFormProject(undefined)}
          />
        </Modal>
      )}
    </div>
  )
}

function ProjectCard({ project, onClick, onEdit, onDelete }) {
  const [stats, setStats] = useState({ total: 0, open: 0, critical: 0 })

  useEffect(() => {
    const findings = getFindings(project.id)
    setStats({
      total: findings.length,
      open: findings.filter(f => f.status === 'open' || f.status === 'in-progress').length,
      critical: findings.filter(f => f.severity === 'critical').length,
    })
  }, [project.id])

  return (
    <article
      className="project-card"
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      tabIndex={0}
      role="button"
      aria-label={`Öppna projekt ${project.name}`}
    >
      <div className="project-card-top">
        <h2 className="project-card-name">{project.name}</h2>
        <span className={`badge ${project.status === 'completed' ? 'badge-neutral' : 'badge-active'}`}>
          {project.status === 'completed' ? 'Avslutad' : 'Aktiv'}
        </span>
      </div>

      <p className="project-card-client">{project.clientName}</p>
      {project.url && <p className="project-card-url">{project.url}</p>}

      <div className="project-card-stats">
        <span className="stat">{stats.total} fynd</span>
        {stats.open > 0 && <span className="stat stat-warn">{stats.open} öppna</span>}
        {stats.critical > 0 && <span className="stat stat-crit">{stats.critical} kritiska</span>}
      </div>

      <div className="project-card-footer">
        <span className="project-card-meta">
          WCAG {project.wcagVersion} {project.conformanceTarget}
          {project.auditor && ` · ${project.auditor}`}
        </span>
        <div className="project-card-actions">
          <button className="btn-link" onClick={onEdit}>Redigera</button>
          <button className="btn-link btn-link-danger" onClick={onDelete}>Ta bort</button>
        </div>
      </div>
    </article>
  )
}

export function Modal({ onClose, children }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Stäng dialog">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
