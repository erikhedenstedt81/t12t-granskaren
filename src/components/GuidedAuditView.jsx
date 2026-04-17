import { useState, useMemo, useEffect } from 'react'
import {
  getProject, getFindings,
  getGuidedProgress, saveGuidedProgress,
} from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import {
  DIGG_CATEGORIES,
  DIGG_EXTRA_CRITERIA,
  getAuditData,
  getAnyCriterion,
  getApplicableCategories,
  getOrderedCriteriaIds,
} from '../data/diggManual.js'
import FindingForm from './FindingForm.jsx'
import AuditComplete from './AuditComplete.jsx'
import { toast } from './Toast.jsx'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_ICON = {
  passed:  '✓',
  finding: '✗',
  na:      '–',
  null:    '',
}
const STATUS_LABEL = {
  passed:  'Godkänt',
  finding: 'Fynd dokumenterat',
  na:      'Ej applicerbart',
  null:    'Ej granskat',
}

function urlKey(url) {
  return url?.trim() || '__global__'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuidedAuditView({ projectId, onBack, onOpenReport }) {
  const [project,      setProject]      = useState(() => getProject(projectId))
  const [progress,     setProgress]     = useState(() => getGuidedProgress(projectId))
  const [currentId,    setCurrentId]    = useState(null)
  const [currentUrl,   setCurrentUrl]   = useState(() => getProject(projectId)?.url ?? '')
  const [urlInput,     setUrlInput]     = useState('')
  const [editingUrl,   setEditingUrl]   = useState(false)
  const [checkedItems,   setCheckedItems]   = useState({})
  const [showForm,       setShowForm]       = useState(false)
  const [showComplete,   setShowComplete]   = useState(false)

  const answers = project?.auditContext?.answers ?? {}

  // Applicable categories and ordered criteria
  const applicableCategories = useMemo(() => getApplicableCategories(answers), [answers])
  const orderedIds           = useMemo(() => getOrderedCriteriaIds(answers),   [answers])

  // Resolve full criterion object (wcag22 + extra)
  const allCriteria = useMemo(() => [...wcag22, ...DIGG_EXTRA_CRITERIA], [])

  function resolveCriterion(id) {
    return allCriteria.find(c => c.id === id) ?? null
  }

  // Set first criterion on mount
  useEffect(() => {
    if (orderedIds.length > 0 && !currentId) {
      setCurrentId(orderedIds[0])
    }
  }, [orderedIds, currentId])

  // Clear checkboxes when criterion or URL changes
  useEffect(() => { setCheckedItems({}) }, [currentId, currentUrl])

  const criterion = useMemo(() => currentId ? resolveCriterion(currentId) : null, [currentId, allCriteria])
  const auditData = useMemo(() => currentId ? getAuditData(currentId) : null,     [currentId])

  // Per-URL progress
  const urlProgress = useMemo(() => progress[urlKey(currentUrl)] ?? {}, [progress, currentUrl])

  // Overall stats for progress bar
  const reviewedCount = useMemo(() => {
    const up = progress[urlKey(currentUrl)] ?? {}
    return orderedIds.filter(id => up[id] != null).length
  }, [progress, currentUrl, orderedIds])

  const totalCount  = orderedIds.length
  const progressPct = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0
  const isComplete  = totalCount > 0 && reviewedCount === totalCount

  // ── Mutations ────────────────────────────────────────────────────────────────

  function updateProgress(criterionId, status) {
    const key  = urlKey(currentUrl)
    const next = {
      ...progress,
      [key]: { ...(progress[key] ?? {}), [criterionId]: status },
    }
    setProgress(next)
    saveGuidedProgress(projectId, next)
  }

  function goNext() {
    const idx = orderedIds.indexOf(currentId)
    if (idx < orderedIds.length - 1) setCurrentId(orderedIds[idx + 1])
  }

  function goPrev() {
    const idx = orderedIds.indexOf(currentId)
    if (idx > 0) setCurrentId(orderedIds[idx - 1])
  }

  function handlePassed() {
    updateProgress(currentId, 'passed')
    toast('Markerat som godkänt ✓')
    goNext()
  }

  function handleNa() {
    updateProgress(currentId, 'na')
    toast('Markerat som ej applicerbart –')
    goNext()
  }

  function handleFinding() {
    updateProgress(currentId, 'finding')
    setShowForm(true)
  }

  function handleFormSaved() {
    setShowForm(false)
    toast('Fynd sparat')
    goNext()
  }

  function applyUrl() {
    setCurrentUrl(urlInput.trim())
    setEditingUrl(false)
  }

  const currentStatus = urlProgress[currentId] ?? null
  const currentIdx    = orderedIds.indexOf(currentId)

  if (!project) return null

  // ── Avslutningsskärm ─────────────────────────────────────────────────────────
  if (showComplete) {
    return (
      <AuditComplete
        project={project}
        urlProgress={progress[urlKey(currentUrl)] ?? {}}
        orderedIds={orderedIds}
        onContinue={() => setShowComplete(false)}
        onBack={onBack}
        onOpenReport={() => onOpenReport(projectId)}
      />
    )
  }

  return (
    <div className="ga-root">

      {/* ── FindingForm overlay ── */}
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
        <button
          className="ga-back-btn"
          onClick={onBack}
          aria-label="Tillbaka till projektöversikt"
        >
          ← Tillbaka
        </button>
        <div className="ga-topbar-center">
          <span className="ga-topbar-name">{project.name}</span>
          <span className="ga-topbar-sep" aria-hidden="true">·</span>
          <span className="ga-topbar-mode">Guidad granskning</span>
        </div>
        <div
          className="ga-topbar-progress"
          aria-label={`${reviewedCount} av ${totalCount} kriterier granskade`}
        >
          <div
            className="ga-top-prog-bar"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="ga-top-prog-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="ga-topbar-count">
            {reviewedCount}/{totalCount} ({progressPct}%)
          </span>
        </div>

        <button
          className={`ga-complete-btn ${isComplete ? 'ga-complete-btn-ready' : 'ga-complete-btn-dim'}`}
          onClick={() => isComplete && setShowComplete(true)}
          aria-disabled={!isComplete}
          title={!isComplete ? 'Alla kriterier måste vara granskade' : 'Avsluta granskningen'}
        >
          ✓ Avsluta granskning
        </button>
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
              onKeyDown={e => { if (e.key === 'Enter') applyUrl() }}
              autoFocus
              aria-label="Ange URL att granska"
            />
            <button className="btn btn-primary btn-sm" onClick={applyUrl}>OK</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingUrl(false)}>Avbryt</button>
          </div>
        ) : (
          <div className="ga-url-display">
            <code className="ga-url-value">{currentUrl || '(Ingen URL angiven)'}</code>
            <button
              className="btn-link ga-url-change"
              onClick={() => { setUrlInput(currentUrl); setEditingUrl(true) }}
            >
              Ändra
            </button>
          </div>
        )}
      </div>

      {/* ── Body: sidebar + main ── */}
      <div className="ga-body">

        {/* ── Sidebar ── */}
        <nav className="ga-sidebar" aria-label="Kriterielista">
          <div className="ga-sidebar-inner">
            {applicableCategories.map(cat => {
              const catCriteria = cat.criteriaIds
                .map(id => resolveCriterion(id))
                .filter(Boolean)
              if (catCriteria.length === 0) return null
              return (
                <div key={cat.id} className="ga-cat">
                  <h2 className="ga-cat-title">{cat.label}</h2>
                  <ul className="ga-crit-list" role="list">
                    {catCriteria.map(c => {
                      const status    = urlProgress[c.id] ?? null
                      const isCurrent = c.id === currentId
                      return (
                        <li key={`${cat.id}-${c.id}`} role="listitem">
                          <button
                            className={[
                              'ga-crit-btn',
                              isCurrent ? 'ga-crit-active' : '',
                              status ? `ga-crit-${status}` : '',
                            ].join(' ')}
                            onClick={() => setCurrentId(c.id)}
                            aria-current={isCurrent ? 'true' : undefined}
                            aria-label={`${c.id} ${c.nameSwedish} – ${STATUS_LABEL[status ?? 'null']}`}
                          >
                            <span className="ga-crit-id">{c.id}</span>
                            <span className="ga-crit-short">{c.nameSwedish}</span>
                            <span
                              className={`ga-crit-icon ga-icon-${status ?? 'null'}`}
                              aria-hidden="true"
                            >
                              {STATUS_ICON[status ?? 'null']}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </nav>

        {/* ── Main audit card ── */}
        <main className="ga-main" id="ga-main-content" tabIndex={-1}>
          {criterion && auditData ? (
            <div className="ga-card">

              {/* ── Card header ── */}
              <div className="ga-card-header">
                <div className="ga-card-meta">
                  <span className="ga-crit-badge">{criterion.id}</span>
                  {'level' in criterion && (
                    <span className={`badge badge-level-${criterion.level.toLowerCase()}`}>
                      {criterion.level}
                    </span>
                  )}
                  {'eaaCritical' in criterion && criterion.eaaCritical && (
                    <span className="badge ga-eaa-badge">EAA-kritiskt</span>
                  )}
                  <span className="ga-nav-count">
                    {currentIdx + 1} / {totalCount}
                  </span>
                </div>
                <h2 className="ga-card-title">{criterion.nameSwedish}</h2>
                {'description' in criterion && (
                  <p className="ga-card-desc">{criterion.description}</p>
                )}

                {/* Status banner */}
                {currentStatus && (
                  <div
                    className={`ga-status-banner ga-status-${currentStatus}`}
                    role="status"
                    aria-live="polite"
                  >
                    <span aria-hidden="true">{STATUS_ICON[currentStatus]}</span>
                    {' '}Aktuell status: <strong>{STATUS_LABEL[currentStatus]}</strong>
                    <button
                      className="btn-link ga-reset-btn"
                      onClick={() => updateProgress(currentId, null)}
                      aria-label="Återställ status för detta kriterium"
                    >
                      Återställ
                    </button>
                  </div>
                )}
              </div>

              {/* ── Method ── */}
              <section className="ga-section" aria-labelledby={`ga-method-${currentId}`}>
                <h3 className="ga-section-title" id={`ga-method-${currentId}`}>Metod</h3>
                <ol className="ga-method-list">
                  {auditData.method.map((step, i) => (
                    <li key={i} className="ga-method-step">{step}</li>
                  ))}
                </ol>
              </section>

              {/* ── Exceptions ── */}
              {auditData.exceptions.length > 0 && (
                <section className="ga-section ga-exceptions" aria-labelledby={`ga-exc-${currentId}`}>
                  <h3 className="ga-section-title" id={`ga-exc-${currentId}`}>Undantag</h3>
                  <ul className="ga-exc-list">
                    {auditData.exceptions.map((exc, i) => (
                      <li key={i} className="ga-exc-item">{exc}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── Controls / checklist ── */}
              {auditData.controls.length > 0 && (
                <section className="ga-section" aria-labelledby={`ga-ctrl-${currentId}`}>
                  <h3 className="ga-section-title" id={`ga-ctrl-${currentId}`}>Kontroller</h3>
                  <fieldset className="ga-controls-fieldset">
                    <legend className="sr-only">Kontrollpunkter för {criterion.id} – {criterion.nameSwedish}</legend>
                    {auditData.controls.map((ctrl, i) => {
                      const key = `${currentId}--${i}`
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

              {/* ── Action prompt ── */}
              <div className="ga-action-prompt">
                <p className="ga-action-label">Hittade du ett problem?</p>
                <div className="ga-action-btns" role="group" aria-label="Granskningsbeslut">
                  <button
                    className="ga-btn-finding"
                    onClick={handleFinding}
                    aria-label="Ja, dokumentera ett fynd för detta kriterium"
                  >
                    ✗ Ja, dokumentera fynd
                  </button>
                  <button
                    className="ga-btn-pass"
                    onClick={handlePassed}
                    aria-label="Nej, kriteriet är godkänt"
                  >
                    ✓ Nej, godkänt
                  </button>
                  <button
                    className="ga-btn-na"
                    onClick={handleNa}
                    aria-label="Ej applicerbart för denna sida"
                  >
                    – Ej applicerbart för denna sida
                  </button>
                </div>
              </div>

              {/* ── Prev / Next navigation ── */}
              <div className="ga-card-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={goPrev}
                  disabled={currentIdx <= 0}
                  aria-label="Föregående kriterium"
                >
                  ← Föregående
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={goNext}
                  disabled={currentIdx >= totalCount - 1}
                  aria-label="Nästa kriterium"
                >
                  Nästa →
                </button>
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
