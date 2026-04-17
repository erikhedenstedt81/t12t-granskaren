import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { wcag22 } from '../data/wcag22.js'
import { eaaRequirements } from '../data/eaa.js'
import { saveFinding, calculateSeverity } from '../store/storage.js'
import { toast } from './Toast.jsx'
import Icon from './Icon.jsx'

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const STEPS = [
  { id: 1, label: 'Sida' },
  { id: 2, label: 'Kriterium' },
  { id: 3, label: 'Fyndet' },
  { id: 4, label: 'Klassificering' },
  { id: 5, label: 'Screenshot' },
]

const AFFECTED_USERS = [
  { id: 'vision',    label: 'Synskadade' },
  { id: 'motor',     label: 'Motoriska svårigheter' },
  { id: 'cognitive', label: 'Kognitiva svårigheter' },
  { id: 'hearing',   label: 'Hörselskadade' },
  { id: 'older',     label: 'Äldre användare' },
  { id: 'all',       label: 'Alla användare' },
]

const SEVERITY_LABELS = { critical: 'Kritisk', high: 'Hög', medium: 'Medium', low: 'Låg' }
const STATUS_OPTIONS = [
  { value: 'open',        label: 'Öppen',       cls: 'active-open' },
  { value: 'in-progress', label: 'Pågår',        cls: 'active-progress' },
  { value: 'fixed',       label: 'Åtgärdad',    cls: 'active-fixed' },
  { value: 'wont-fix',    label: 'Åtgärdas ej', cls: 'active-wontfix' },
]

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function initForm(finding, project) {
  return {
    url:                 finding?.url                 ?? project?.url ?? '',
    pageTitle:           finding?.pageTitle           ?? '',
    useEaa:              !!finding?.eaaRequirementId,
    wcagCriterionId:     finding?.wcagCriterionId     ?? null,
    eaaRequirementId:    finding?.eaaRequirementId    ?? null,
    title:               finding?.title               ?? '',
    description:         finding?.description         ?? '',
    customerDescription: finding?.customerDescription ?? '',
    suggestedFix:        finding?.suggestedFix        ?? '',
    affectedUsers:       finding?.affectedUsers       ?? [],
    severity:            finding?.severity            ?? 'medium',
    severityAuto:        finding?.severityAuto        ?? true,
    isKeyFlow:           finding?.isKeyFlow           ?? false,
    status:              finding?.status              ?? 'open',
    screenshot:          finding?.screenshot          ?? null,
  }
}

function buildSeverityReason(criterion, isKeyFlow) {
  if (!criterion) return null
  const parts = [`${criterion.level}-kriterium`]
  if (criterion.eaaCritical) parts.push('EAA-koppling')
  if (isKeyFlow) parts.push('nyckelflöde')
  return `Baserat på ${parts.join(', ')}`
}

function isStepDone(step, form) {
  if (step === 1) return form.url.trim() !== '' && form.pageTitle.trim() !== ''
  if (step === 2) return form.wcagCriterionId !== null || form.eaaRequirementId !== null
  if (step === 3) return form.title.trim() !== '' && form.description.trim() !== ''
  if (step === 4) return true
  return true
}

/* ─── Main component ─────────────────────────────────────────────────────────── */

export default function FindingForm({ project, finding, onSaved, onNew, onCancel }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => initForm(finding, project))
  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), [])

  // When criterion changes: auto-fill suggestedFix + recalc severity
  useEffect(() => {
    if (!form.useEaa && form.wcagCriterionId && form.severityAuto) {
      const c = wcag22.find(cr => cr.id === form.wcagCriterionId)
      if (c) {
        setForm(f => ({
          ...f,
          suggestedFix: f.suggestedFix || c.suggestedFix,
          severity: calculateSeverity(c, { isKeyFlow: f.isKeyFlow }),
        }))
      }
    }
  }, [form.wcagCriterionId])

  // When isKeyFlow changes, recalc severity if auto
  useEffect(() => {
    if (!form.useEaa && form.wcagCriterionId && form.severityAuto) {
      const c = wcag22.find(cr => cr.id === form.wcagCriterionId)
      if (c) setForm(f => ({ ...f, severity: calculateSeverity(c, { isKeyFlow: f.isKeyFlow }) }))
    }
  }, [form.isKeyFlow])

  // Ctrl+S → save
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  })

  function handleSave() {
    const data = {
      ...finding,
      url:                 form.url,
      pageTitle:           form.pageTitle,
      wcagCriterionId:     form.useEaa ? null : form.wcagCriterionId,
      eaaRequirementId:    form.useEaa ? form.eaaRequirementId : null,
      title:               form.title,
      description:         form.description,
      customerDescription: form.customerDescription,
      suggestedFix:        form.suggestedFix,
      affectedUsers:       form.affectedUsers,
      severity:            form.severity,
      severityAuto:        form.severityAuto,
      isKeyFlow:           form.isKeyFlow,
      status:              form.status,
      screenshot:          form.screenshot,
    }
    saveFinding(project.id, data)
    toast(finding ? 'Fynd uppdaterat' : 'Fynd sparat')
    onSaved()
  }

  function handleNew() {
    setForm(initForm(null, project))
    setStep(1)
    onNew()
  }

  function toggleAffected(id) {
    setForm(f => ({
      ...f,
      affectedUsers: f.affectedUsers.includes(id)
        ? f.affectedUsers.filter(x => x !== id)
        : [...f.affectedUsers, id],
    }))
  }

  function setSeverityManual(val) {
    setForm(f => ({ ...f, severity: val, severityAuto: false }))
  }

  const selectedCriterion = form.wcagCriterionId
    ? wcag22.find(c => c.id === form.wcagCriterionId)
    : null

  const autoSeverity = selectedCriterion
    ? calculateSeverity(selectedCriterion, { isKeyFlow: form.isKeyFlow })
    : null

  const severityReason = buildSeverityReason(selectedCriterion, form.isKeyFlow)

  const canSave = form.title.trim() !== '' && (form.wcagCriterionId || form.eaaRequirementId)

  return (
    <div className="ff-root" aria-label="Fynd-formulär">

      {/* ── Scrollable area ── */}
      <div className="ff-content">
        <div className="ff-card">

          {/* Step tabs — role="tablist" for proper AT announcement */}
          <div className="ff-steps" role="tablist" aria-label="Formulärsteg">
            {STEPS.map(s => {
              const done   = s.id < step && isStepDone(s.id, form)
              const active = s.id === step
              return (
                <button
                  key={s.id}
                  id={`ff-tab-${s.id}`}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`ff-panel-${s.id}`}
                  className={`ff-step-btn ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                  onClick={() => setStep(s.id)}
                  tabIndex={active ? 0 : -1}
                >
                  <span className="ff-step-dot" aria-hidden="true">
                    {done ? <Icon name="check" size="sm" /> : s.id}
                  </span>
                  {s.label}
                  {done && <span className="sr-only"> (klart)</span>}
                </button>
              )
            })}
          </div>

          {/* Form step content — role="tabpanel" */}
          <div
            className="ff-card-body"
            role="tabpanel"
            id={`ff-panel-${step}`}
            aria-labelledby={`ff-tab-${step}`}
          >
            {step === 1 && <Step1 form={form} set={set} />}
            {step === 2 && (
              <Step2 form={form} set={set} selectedCriterion={selectedCriterion} />
            )}
            {step === 3 && (
              <Step3 form={form} set={set} setForm={setForm} toggleAffected={toggleAffected} />
            )}
            {step === 4 && (
              <Step4
                form={form} set={set} setForm={setForm}
                autoSeverity={autoSeverity} severityReason={severityReason}
                setSeverityManual={setSeverityManual}
              />
            )}
            {step === 5 && <Step5 form={form} set={set} />}
          </div>

          {/* Prev / Next — directly below form content */}
          <div className="ff-nav">
            <div className="ff-nav-left">
              {step > 1 && (
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(s => s - 1)}>
                  <Icon name="arrow_back" /> Föregående
                </button>
              )}
            </div>
            <div className="ff-nav-right">
              {step < 5 && (
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(s => s + 1)}>
                  Nästa <Icon name="arrow_forward" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Persistent footer: Save / New ── */}
      <div className="ff-footer">
        <span className="ff-shortcut">
          <kbd>Ctrl</kbd>+<kbd>S</kbd> sparar
        </span>
        {onCancel ? (
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>
            Avbryt
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={handleNew}>
            Nytt fynd
          </button>
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={!canSave}
          title={!canSave ? 'Fyll i titel och välj kriterium' : undefined}
        >
          {finding ? 'Spara ändringar' : 'Spara fynd'}
        </button>
      </div>

    </div>
  )
}

/* ─── Step 1: Sida ────────────────────────────────────────────────────────────── */

function Step1({ form, set }) {
  return (
    <div className="ff-section">
      <h2 className="ff-section-title">Steg 1 – Sida</h2>
      <p className="ff-section-desc">Vilken sida eller vy hittades problemet på?</p>

      <div className="field">
        <label className="field-label" htmlFor="ff-url">URL *</label>
        <input
          id="ff-url"
          className="input"
          type="url"
          value={form.url}
          onChange={e => set('url', e.target.value)}
          placeholder="https://example.com/sidan"
          aria-required="true"
          autoFocus
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="ff-page-title">Sidtitel *</label>
        <input
          id="ff-page-title"
          className="input"
          value={form.pageTitle}
          onChange={e => set('pageTitle', e.target.value)}
          placeholder="t.ex. Startsidan, Inloggningssidan, Produktsida – Skjorta"
          aria-required="true"
        />
      </div>
    </div>
  )
}

/* ─── Step 2: Kriterium ──────────────────────────────────────────────────────── */

function Step2({ form, set, selectedCriterion }) {
  return (
    <div className="ff-section">
      <h2 className="ff-section-title">Steg 2 – Kriterium</h2>

      <div className="ff-mode-toggle">
        <button
          type="button"
          className={`ff-mode-btn ${!form.useEaa ? 'active' : ''}`}
          onClick={() => set('useEaa', false)}
        >
          WCAG 2.2-kriterium
        </button>
        <button
          type="button"
          className={`ff-mode-btn ${form.useEaa ? 'active' : ''}`}
          onClick={() => set('useEaa', true)}
        >
          EAA-krav (ej WCAG)
        </button>
      </div>

      {!form.useEaa ? (
        <div className="field">
          <label className="field-label" htmlFor="ff-wcag-search">
            Sök WCAG-kriterium
          </label>
          <WcagSearch
            value={form.wcagCriterionId}
            onChange={id => set('wcagCriterionId', id)}
          />
          {selectedCriterion && (
            <CriterionHint criterion={selectedCriterion} />
          )}
        </div>
      ) : (
        <div className="field">
          <span className="field-label">Välj EAA-krav</span>
          <EaaList
            value={form.eaaRequirementId}
            onChange={id => set('eaaRequirementId', id)}
          />
        </div>
      )}
    </div>
  )
}

/* ─── Step 3: Fyndet ─────────────────────────────────────────────────────────── */

function Step3({ form, set, setForm, toggleAffected }) {
  return (
    <div className="ff-section">
      <h2 className="ff-section-title">Steg 3 – Fyndet</h2>

      <div className="field">
        <label className="field-label" htmlFor="ff-title">Titel *</label>
        <span id="ff-title-hint" className="field-hint">Kort intern rubrik, t.ex. "Knapp saknar label på betalningssidan"</span>
        <input
          id="ff-title"
          className="input"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Kort beskrivande titel"
          aria-required="true"
          aria-describedby="ff-title-hint"
          autoFocus
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="ff-desc">Beskrivning för expert *</label>
        <span className="field-hint">Exakt vad är problemet? Inkludera element, selektor, kontext.</span>
        <textarea
          id="ff-desc"
          className="input"
          rows={4}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Beskriv problemet tekniskt för ett utvecklarteam..."
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="ff-customer-desc">Kundförklaring</label>
        <span className="field-hint">Utan teknisk jargong – för kunden och slutanvändaren.</span>
        <textarea
          id="ff-customer-desc"
          className="input"
          rows={3}
          value={form.customerDescription}
          onChange={e => set('customerDescription', e.target.value)}
          placeholder="Förklara problemet som om du pratar med en icke-teknisk person..."
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="ff-fix">Föreslagen åtgärd</label>
        <span className="field-hint">Teknisk åtgärd för utvecklare. Förfylls automatiskt om WCAG-kriterium valts.</span>
        <textarea
          id="ff-fix"
          className="input"
          rows={3}
          value={form.suggestedFix}
          onChange={e => set('suggestedFix', e.target.value)}
          placeholder="Hur bör problemet åtgärdas tekniskt?"
        />
      </div>

      <fieldset style={{ border: 'none', padding: 0 }}>
        <legend className="field-label" style={{ marginBottom: 8 }}>Berörda användargrupper</legend>
        <div className="check-group">
          {AFFECTED_USERS.map(u => (
            <label key={u.id} className="check-item">
              <input
                type="checkbox"
                checked={form.affectedUsers.includes(u.id)}
                onChange={() => toggleAffected(u.id)}
              />
              {u.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

/* ─── Step 4: Klassificering ─────────────────────────────────────────────────── */

function Step4({ form, set, autoSeverity, severityReason, setSeverityManual }) {
  const severities = [
    { value: 'critical', label: 'Kritisk', cls: 'active-critical' },
    { value: 'high',     label: 'Hög',     cls: 'active-high' },
    { value: 'medium',   label: 'Medium',  cls: 'active-medium' },
    { value: 'low',      label: 'Låg',     cls: 'active-low' },
  ]

  return (
    <div className="ff-section">
      <h2 className="ff-section-title">Steg 4 – Klassificering</h2>

      {/* Severity */}
      <div className="field">
        <span className="field-label">Allvarlighetsgrad</span>

        {autoSeverity && form.severityAuto && (
          <div className="severity-auto-box" role="status">
            <div>
              <div className="severity-auto-label">Automatiskt förslag</div>
              <div className="severity-auto-value" style={{ color: `var(--${autoSeverity})` }}>
                {SEVERITY_LABELS[autoSeverity].toUpperCase()}
              </div>
            </div>
            {severityReason && (
              <div className="severity-auto-reason">{severityReason}</div>
            )}
          </div>
        )}

        {!form.severityAuto && (
          <p className="field-hint">
            Manuellt satt – automatisk beräkning avstängd.{' '}
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                set('severityAuto', true)
                if (autoSeverity) set('severity', autoSeverity)
              }}
            >
              Återställ automatisk
            </button>
          </p>
        )}

        <div className="severity-buttons" role="group" aria-label="Välj allvarlighetsgrad">
          {severities.map(s => (
            <button
              key={s.value}
              type="button"
              className={`severity-btn ${form.severity === s.value ? s.cls : ''}`}
              onClick={() => setSeverityManual(s.value)}
              aria-pressed={form.severity === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key flow */}
      <div className="toggle-row" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 4 }}>
        <div className="toggle-info">
          <div className="toggle-label">Nyckelflöde</div>
          <div className="toggle-desc">Inloggning, sökning, betalning eller annan kritisk funktion</div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={form.isKeyFlow}
            onChange={e => set('isKeyFlow', e.target.checked)}
          />
          <span className="toggle-track" aria-hidden="true" />
          <span className="sr-only">Markera som nyckelflöde</span>
        </label>
      </div>

      {/* Status */}
      <div className="field">
        <span className="field-label">Status</span>
        <div className="status-buttons" role="group" aria-label="Välj status">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              type="button"
              className={`status-btn ${form.status === s.value ? s.cls : ''}`}
              onClick={() => set('status', s.value)}
              aria-pressed={form.status === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Step 5: Screenshot ─────────────────────────────────────────────────────── */

function Step5({ form, set }) {
  return (
    <div className="ff-section">
      <h2 className="ff-section-title">Steg 5 – Screenshot (valfritt)</h2>
      <p className="ff-section-desc">
        Bifoga en bild som illustrerar problemet. Sparas lokalt i webbläsaren.
      </p>
      <ScreenshotUpload
        value={form.screenshot}
        onChange={val => set('screenshot', val)}
      />
    </div>
  )
}

/* ─── WcagSearch combobox ────────────────────────────────────────────────────── */

function WcagSearch({ value, onChange }) {
  const [query,       setQuery]       = useState('')
  const [open,        setOpen]        = useState(false)
  const [cursor,      setCursor]      = useState(0)
  const containerRef  = useRef(null)
  const listRef       = useRef(null)

  const selected = value ? wcag22.find(c => c.id === value) : null

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return wcag22
    return wcag22.filter(c =>
      c.id.startsWith(q) ||
      c.id.includes(q) ||
      c.nameSwedish.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.principle.toLowerCase().startsWith(q) ||
      c.level.toLowerCase() === q
    )
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.children[cursor]
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [cursor, open])

  function select(criterion) {
    onChange(criterion.id)
    setQuery('')
    setOpen(false)
  }

  function clear(e) {
    e.stopPropagation()
    onChange(null)
    setQuery('')
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { setOpen(true); e.preventDefault() }
      return
    }
    if (e.key === 'ArrowDown') { setCursor(c => Math.min(c + 1, results.length - 1)); e.preventDefault() }
    else if (e.key === 'ArrowUp') { setCursor(c => Math.max(c - 1, 0)); e.preventDefault() }
    else if (e.key === 'Enter') { if (results[cursor]) select(results[cursor]); e.preventDefault() }
    else if (e.key === 'Escape') { setOpen(false); e.preventDefault() }
  }

  return (
    <div className="combobox" ref={containerRef}>
      {selected ? (
        <div className="combobox-selected">
          <span className={`badge badge-level-${selected.level.toLowerCase()}`}>{selected.level}</span>
          <span className="combobox-selected-id">{selected.id}</span>
          <span className="combobox-selected-name">{selected.nameSwedish}</span>
          {selected.eaaCritical && <span className="badge badge-eaa">EAA</span>}
          <button type="button" className="combobox-clear" onClick={clear} aria-label="Ta bort valt kriterium">
            <Icon name="close" size="sm" />
          </button>
        </div>
      ) : (
        <input
          className="input"
          type="text"
          placeholder="Sök: 1.4.3, kontrast, tangentbord, Operable, AA…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setCursor(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="wcag-dropdown"
        />
      )}

      {open && !selected && (
        <div
          id="wcag-dropdown"
          className="combobox-dropdown"
          role="listbox"
          aria-label="WCAG-kriterier"
          ref={listRef}
        >
          {results.length === 0 ? (
            <div className="combobox-empty">Inga kriterier hittades</div>
          ) : results.map((c, i) => (
            <div
              key={c.id}
              role="option"
              aria-selected={i === cursor}
              className={`combobox-item ${i === cursor ? 'combobox-item-active' : ''}`}
              onMouseDown={() => select(c)}
              onMouseEnter={() => setCursor(i)}
            >
              <span className="combobox-item-id">{c.id}</span>
              <span className="combobox-item-name">{c.nameSwedish}</span>
              <div className="combobox-item-badges">
                <span className={`badge badge-level-${c.level.toLowerCase()}`}>{c.level}</span>
                {c.eaaCritical && <span className="badge badge-eaa">EAA</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Criterion hint box ─────────────────────────────────────────────────────── */

function CriterionHint({ criterion }) {
  return (
    <div className="ff-criterion-hint">
      <div className="ff-criterion-hint-name">
        <span className={`badge badge-level-${criterion.level.toLowerCase()}`}>{criterion.level}</span>
        {' '}
        {criterion.id} – {criterion.nameSwedish}
        {criterion.eaaCritical && <span className="badge badge-eaa" style={{ marginLeft: 6 }}>EAA</span>}
      </div>
      <p className="ff-criterion-desc">{criterion.description}</p>
      {criterion.suggestedFix && (
        <p className="ff-criterion-fix">
          <strong>Åtgärd: </strong>{criterion.suggestedFix}
        </p>
      )}
    </div>
  )
}

/* ─── EAA list ───────────────────────────────────────────────────────────────── */

function EaaList({ value, onChange }) {
  return (
    <div className="eaa-list" role="group" aria-label="EAA-krav">
      {eaaRequirements.map(req => (
        <button
          key={req.id}
          type="button"
          aria-pressed={value === req.id}
          className={`eaa-item ${value === req.id ? 'selected' : ''}`}
          onClick={() => onChange(value === req.id ? null : req.id)}
        >
          <div className="eaa-item-header">
            <span className="badge badge-eaa">{req.id}</span>
            <span className="eaa-item-cat">{req.category}</span>
            <span className="eaa-item-title">{req.title}</span>
          </div>
          <p className="eaa-item-desc">{req.description}</p>
        </button>
      ))}
    </div>
  )
}

/* ─── Screenshot upload ──────────────────────────────────────────────────────── */

function ScreenshotUpload({ value, onChange }) {
  const [drag,      setDrag]      = useState(false)
  const [pasteErr,  setPasteErr]  = useState(false)

  // ── Base64 converter (shared by file picker, drag-drop and paste) ───────────
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => { onChange(e.target.result); setPasteErr(false) }
    reader.readAsDataURL(file)
  }

  // ── Paste from clipboard ─────────────────────────────────────────────────────
  useEffect(() => {
    function handlePaste(e) {
      // Ignore paste events that originate inside a text input / textarea
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const items = e.clipboardData?.items
      if (!items) return

      let foundImage = false
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          foundImage = true
          const file = item.getAsFile()
          if (file) handleFile(file)
          break
        }
      }

      if (!foundImage) {
        setPasteErr(true)
        setTimeout(() => setPasteErr(false), 3000)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [onChange])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Detect OS for shortcut hint ──────────────────────────────────────────────
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
  const pasteKey = isMac ? 'Cmd+V' : 'Ctrl+V'

  return (
    <div
      className={`screenshot-zone ${drag ? 'drag-over' : ''} ${value ? 'has-image' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault()
        setDrag(false)
        handleFile(e.dataTransfer.files[0])
      }}
    >
      {value ? (
        <div className="screenshot-preview">
          <img src={value} alt="Screenshot av tillgänglighetsproblemet" className="screenshot-img" />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onChange(null)}
          >
            Ta bort bild
          </button>
        </div>
      ) : (
        <label className="screenshot-label">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={e => handleFile(e.target.files[0])}
          />
          <span className="screenshot-icon" aria-hidden="true"><Icon name="photo_camera" size="lg" /></span>
          <span>
            Dra och släpp, klicka för att välja, eller tryck{' '}
            <kbd className="screenshot-kbd">{pasteKey}</kbd>
          </span>
          {pasteErr
            ? <span className="screenshot-paste-err" role="alert">Urklippet innehåller ingen bild</span>
            : <span className="screenshot-hint">PNG, JPG, WebP, GIF</span>
          }
        </label>
      )}
    </div>
  )
}
