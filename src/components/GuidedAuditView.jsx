import { useState, useMemo, useCallback, useEffect } from 'react'
import { getProject, getFindings, getGuidedProgress, saveGuidedProgress } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import { DIGG_CATEGORIES, DIGG_CRITERIA_ORDER, getAuditData } from '../data/diggManual.js'
import FindingForm from './FindingForm.jsx'
import { toast } from './Toast.jsx'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_ICON  = { passed: '✓', finding: '✗', na: '–', null: '' }
const STATUS_LABEL = { passed: 'Godkänt', finding: 'Fynd', na: 'Ej applicerbart', null: 'Ej granskat' }

function getCriterion(id) {
  return wcag22.find(c => c.id === id) ?? null
}

function getOrderedCriteria(project) {
  const notApplicable = new Set(project.auditContext?.notApplicable ?? [])
  return DIGG_CRITERIA_ORDER
    .map(id => wcag22.find(c => c.id === id))
    .filter(Boolean)
    .filter(c => !notApplicable.has(c.id))
}

function urlKey(url) {
  return url.trim() || '__global__'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuidedAuditView({ projectId, onBack, onOpenAudit }) {
  const [project,        setProject]        = useState(() => getProject(projectId))
  const [progress,       setProgress]       = useState(() => getGuidedProgress(projectId))
  const [currentUrl,     setCurrentUrl]     = useState('')
  const [currentId,      setCurrentId]      = useState(null)
  const [checkedItems,   setCheckedItems]   = useState({})
  const [showForm,       setShowForm]       = useState(false)
  const [urlInput,       setUrlInput]       = useState('')
  const [editingUrl,     setEditingUrl]     = useState(false)

  // Ordered applicable criteria
  const criteria = useMemo(() => getOrderedCriteria(project), [project])

  // Set first criterion as default
  useEffect(() => {
    if (criteria.length > 0 && !currentId) {
      setCurrentId(criteria[0].id)
    }
  }, [criteria, currentId])

  // Reset checkboxes when criterion or URL changes
  useEffect(() => {
    setCheckedItems({})
  }, [currentId, currentUrl])

  const criterion = useMemo(() => currentId ? getCriterion(currentId) : null, [currentId])
  const auditData = useMemo(() => currentId ? getAuditData(currentId) : null, [currentId])

  // Per-URL progress for current URL
  const urlProgress = useMemo(() => {
    return progress[urlKey(currentUrl)] ?? {}
  }, [progress, currentUrl])

  function updateProgress(criterionId, status) {
    const key = urlKey(currentUrl)
    const next = {
      ...progress,
      [key]: { ...(progress[key] ?? {}), [criterionId]: status },
    }
    setProgress(next)
    saveGuidedProgress(projectId, next)
  }

  function handlePassed() {
    updateProgress(currentId, 'passed')
    toast('Markerat som godkänt')
    goNext()
  }

  function handleNa() {
    updateProgress(currentId, 'na')
    toast('Markerat som ej applicerbart')
    goNext()
  }

  function handleFinding() {
    updateProgress(currentId, 'finding')
    setShowForm(true)
  }

  function goNext() {
    const idx = criteria.findIndex(c => c.id === currentId)
    if (idx < criteria.length - 1) {
      setCurrentId(criteria[idx + 1].id)
    }
  }

  function goPrev() {
    const idx = criteria.findIndex(c => c.id === currentId)
    if (idx > 0) {
      setCurrentId(criteria[idx - 1].id)
    }
  }

  const totalCriteria = criteria.length
  const reviewedCount = useMemo(() => {
    const urlProg = progress[urlKey(currentUrl)] ?? {}
    return criteria.filter(c => urlProg[c.id] != null).length
  }, [progress, currentUrl, criteria])
  const progressPct = totalCriteria > 0 ? Math.round((reviewedCount / totalCriteria) * 100) : 0

  function handleFormSaved() {
    setShowForm(false)
    // Reload findings count in future (project stays the same)
    toast('Fynd sparat')
    goNext()
  }

  function applyUrl() {
    setCurrentUrl(urlInput.trim())
    setEditingUrl(false)
  }

  const currentStatus = urlProgress[currentId] ?? null

  if (!project) return null

  return (
    <div className="ga-root">

      {showForm && criterion && (
        <FindingForm
          project={project}
          finding={{ wcagCriterionId: currentId, url: currentUrl || project?.url || '' }}
          onSaved={handleFormSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Top bar ── */}
      <header className="ga-topbar">
        <button className="ga-back-btn" onClick={onBack} aria-label="Tillbaka till projektöversikt">
          ← Tillbaka
        </button>
        <div className="ga-topbar-title">
          <span className="ga-topbar-name">{project.name}</span>
          <span className="ga-topbar-sep" aria-hidden="true">·</span>
          <span className="ga-topbar-mode">Guidad granskning</span>
        </div>
        <div className="ga-topbar-progress" aria-label={`${reviewedCount} av ${totalCriteria} kriterier granskade`}>
          <span className="ga-topbar-pct">{progressPct}%</span>
          <div className="ga-top-prog-bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="ga-top-prog-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="ga-topbar-count">{reviewedCount}/{totalCriteria}</span>
        </div>
      </header>

      {/* ── URL strip ── */}
      <div className="ga-url-strip">
        <span className="ga-url-label">Granskar URL:</span>
        {editingUrl ? (
          <div className="ga-url-edit">
            <input
              className="input ga-url-input"
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://example.com/sida"
              onKeyDown={e => e.key === 'Enter' && applyUrl()}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={applyUrl}>OK</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingUrl(false)}>Avbryt</button>
          </div>
        ) : (
          <div className="ga-url-display">
            <span className="ga-url-value">{currentUrl || '(Ingen URL angiven)'}</span>
            <button className="btn-link ga-url-change" onClick={() => { setUrlInput(currentUrl); setEditingUrl(true) }}>
              Ändra
            </button>
          </div>
        )}
      </div>

      <div className="ga-body">

        {/* ── Left panel: criteria list ── */}
        <nav className="ga-sidebar" aria-label="Kriterielista">
          {DIGG_CATEGORIES.map(cat => {
            const catCriteria = cat.criteriaIds
              .map(id => criteria.find(c => c.id === id))
              .filter(Boolean)
            if (catCriteria.length === 0) return null
            return (
              <div key={cat.id} className="ga-cat">
                <h2 className="ga-cat-title">{cat.label}</h2>
                <ul className="ga-crit-list" role="list">
                  {catCriteria.map(c => {
                    const status = urlProgress[c.id] ?? null
                    const isCurrent = c.id === currentId
                    return (
                      <li key={c.id} className="ga-crit-item" role="listitem">
                        <button
                          className={`ga-crit-btn ${isCurrent ? 'ga-crit-active' : ''} ${status ? `ga-crit-${status}` : ''}`}
                          onClick={() => setCurrentId(c.id)}
                          aria-current={isCurrent ? 'true' : undefined}
                          aria-label={`${c.id} ${c.nameSwedish} – ${STATUS_LABEL[status]}`}
                          title={`${c.id}: ${c.nameSwedish}`}
                        >
                          <span className="ga-crit-id">{c.id}</span>
                          <span className="ga-crit-short">{c.nameSwedish}</span>
                          <span className={`ga-crit-icon ga-icon-${status}`} aria-hidden="true">
                            {STATUS_ICON[status]}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        {/* ── Main audit card ── */}
        <main className="ga-main" id="ga-main-content">
          {criterion && auditData ? (
            <div className="ga-card">

              {/* Card header */}
              <div className="ga-card-header">
                <div className="ga-card-meta">
                  <span className="ga-crit-badge">{criterion.id}</span>
                  <span className={`badge badge-level-${criterion.level.toLowerCase()}`}>{criterion.level}</span>
                  {criterion.eaaCritical && <span className="badge ga-eaa-badge">EAA-kritiskt</span>}
                </div>
                <h2 className="ga-card-title">{criterion.nameSwedish}</h2>
                <p className="ga-card-desc">{criterion.description}</p>
                {currentStatus && (
                  <div className={`ga-status-banner ga-status-${currentStatus}`} role="status">
                    <span aria-hidden="true">{STATUS_ICON[currentStatus]}</span>{' '}
                    Aktuell status: {STATUS_LABEL[currentStatus]}
                    <button className="btn-link ga-reset-btn" onClick={() => updateProgress(currentId, null)}>
                      Återställ
                    </button>
                  </div>
                )}
              </div>

              {/* Method */}
              <section className="ga-section" aria-labelledby="ga-method-title">
                <h3 className="ga-section-title" id="ga-method-title">Testmetod</h3>
                <ol className="ga-method-list">
                  {auditData.method.map((step, i) => (
                    <li key={i} className="ga-method-step">{step}</li>
                  ))}
                </ol>
              </section>

              {/* Exceptions */}
              {auditData.exceptions.length > 0 && (
                <section className="ga-section ga-exceptions" aria-labelledby="ga-exc-title">
                  <h3 className="ga-section-title" id="ga-exc-title">Undantag</h3>
                  <ul className="ga-exc-list">
                    {auditData.exceptions.map((exc, i) => (
                      <li key={i} className="ga-exc-item">{exc}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Controls / checklist */}
              {auditData.controls.length > 0 && (
                <section className="ga-section" aria-labelledby="ga-controls-title">
                  <h3 className="ga-section-title" id="ga-controls-title">Kontrollpunkter</h3>
                  <fieldset className="ga-controls-fieldset">
                    <legend className="sr-only">Kontrollpunkter för {criterion.id}</legend>
                    {auditData.controls.map((ctrl, i) => {
                      const key = `${currentId}-${i}`
                      return (
                        <label key={key} className="ga-control-item">
                          <input
                            type="checkbox"
                            checked={!!checkedItems[key]}
                            onChange={e => setCheckedItems(prev => ({ ...prev, [key]: e.target.checked }))}
                          />
                          <span className="ga-control-text">{ctrl}</span>
                        </label>
                      )
                    })}
                  </fieldset>
                </section>
              )}

              {/* Navigation + action buttons */}
              <div className="ga-card-footer">
                <div className="ga-nav-btns">
                  <button className="btn btn-secondary btn-sm" onClick={goPrev} disabled={criteria.findIndex(c => c.id === currentId) === 0}>
                    ← Föregående
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={goNext} disabled={criteria.findIndex(c => c.id === currentId) === criteria.length - 1}>
                    Nästa →
                  </button>
                </div>
                <div className="ga-action-btns">
                  <button className="btn ga-btn-na" onClick={handleNa}>
                    – Ej applicerbart
                  </button>
                  <button className="btn ga-btn-pass" onClick={handlePassed}>
                    ✓ Godkänt
                  </button>
                  <button className="btn ga-btn-finding" onClick={handleFinding}>
                    ✗ Dokumentera fynd
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="ga-empty">
              <p>Välj ett kriterium i listan till vänster för att börja granska.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}
