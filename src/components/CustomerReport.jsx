import { useState, useEffect, useMemo, useRef } from 'react'
import { getProject, getFindings, getEaaStatus } from '../store/storage.js'
import { buildReportHtml } from '../report/htmlExport.js'
import Icon from './Icon.jsx'

/* ─── Default settings ──────────────────────────────────────────────────────── */

const DEFAULT_SETTINGS = {
  sections:   { cover: true, summary: true, findings: true, technical: true, eaa: true },
  severities: { critical: true, high: true, medium: true, low: true },
  logo:       null,
  language:   'sv',
}

const SECTION_LABELS = {
  sv: { cover: 'Försättsblad', summary: 'Sammanfattning', findings: 'Fynd', technical: 'Teknisk bilaga', eaa: 'EAA-status' },
  en: { cover: 'Cover',        summary: 'Executive Summary', findings: 'Findings', technical: 'Technical Annex', eaa: 'EAA Status' },
}
const SEV_LABELS = { sv: { critical:'Kritisk', high:'Hög', medium:'Medium', low:'Låg' }, en: { critical:'Critical', high:'High', medium:'Medium', low:'Low' } }

/* ─── Main component ─────────────────────────────────────────────────────────── */

export default function CustomerReport({ projectId, onBack }) {
  const [project,    setProject]    = useState(null)
  const [findings,   setFindings]   = useState([])
  const [eaaStatus,  setEaaStatus]  = useState({})
  const [settings,   setSettings]   = useState(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    setProject(getProject(projectId))
    setFindings(getFindings(projectId))
    setEaaStatus(getEaaStatus(projectId))
  }, [projectId])

  const html = useMemo(() => {
    if (!project) return ''
    return buildReportHtml(project, findings, eaaStatus, settings)
  }, [project, findings, eaaStatus, settings])

  function exportHtml() {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const safe = (project?.clientName ?? 'rapport').replace(/[^a-zA-Z0-9åäöÅÄÖ\s-]/g, '').trim()
    a.href     = url
    a.download = `tillganglighetsrapport-${safe}-${new Date().toISOString().slice(0,10)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPdf() {
    iframeRef.current?.contentWindow?.print()
  }

  if (!project) return null

  const lang = settings.language

  return (
    <div className="cr-root">
      {/* ── Toolbar ── */}
      <header className="cr-toolbar">
        <div className="cr-toolbar-left">
          <button className="cr-back btn-ghost" onClick={onBack} aria-label="Tillbaka">
            <Icon name="arrow_back" /> Tillbaka
          </button>
          <div className="cr-title-block">
            <span className="cr-title">
              {lang === 'en' ? 'Accessibility Report' : 'Tillgänglighetsrapport'}
            </span>
            <span className="cr-subtitle">{project.clientName} · {project.name}</span>
          </div>
        </div>
        <div className="cr-toolbar-right">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSettings(true)}
          >
            <Icon name="settings" /> {lang === 'en' ? 'Settings' : 'Inställningar'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportHtml}>
            <Icon name="download" /> {lang === 'en' ? 'Export HTML' : 'Exportera HTML'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportPdf}>
            <Icon name="print" /> {lang === 'en' ? 'Print / PDF' : 'Skriv ut / PDF'}
          </button>
        </div>
      </header>

      {/* ── iframe preview ── */}
      <div className="cr-preview">
        <iframe
          ref={iframeRef}
          className="cr-iframe"
          srcDoc={html}
          title={lang === 'en' ? 'Report preview' : 'Förhandsgranskning av rapport'}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* ── Settings modal ── */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
          lang={lang}
        />
      )}
    </div>
  )
}

/* ─── Settings modal ─────────────────────────────────────────────────────────── */

function SettingsModal({ settings, onChange, onClose, lang }) {
  const [draft, setDraft] = useState(settings)
  const sectionLabels  = SECTION_LABELS[lang]  ?? SECTION_LABELS.sv
  const sevLabels      = SEV_LABELS[lang]       ?? SEV_LABELS.sv

  function setSection(key, val) {
    setDraft(d => ({ ...d, sections:   { ...d.sections,   [key]: val } }))
  }
  function setSeverity(key, val) {
    setDraft(d => ({ ...d, severities: { ...d.severities, [key]: val } }))
  }
  function setLang(val) {
    setDraft(d => ({ ...d, language: val }))
  }

  function handleLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setDraft(d => ({ ...d, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setDraft(d => ({ ...d, logo: null }))
  }

  function apply() {
    onChange(draft)
    onClose()
  }

  const L = lang === 'en'

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box cr-settings-box" role="dialog" aria-modal="true" aria-label={L ? 'Report settings' : 'Rapportinställningar'}>
        <button className="modal-close" onClick={onClose} aria-label={L ? 'Close' : 'Stäng'}><Icon name="close" /></button>
        <h2 className="pf-title">{L ? 'Report Settings' : 'Rapportinställningar'}</h2>

        {/* Language */}
        <div className="field">
          <span className="field-label">{L ? 'Language' : 'Språk'}</span>
          <div className="cr-lang-btns">
            {['sv','en'].map(l => (
              <button
                key={l}
                type="button"
                className={`cr-lang-btn ${draft.language === l ? 'active' : ''}`}
                onClick={() => setLang(l)}
                aria-pressed={draft.language === l}
              >
                {l === 'sv' ? '🇸🇪 Svenska' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="field">
          <span className="field-label">{L ? 'Include sections' : 'Inkludera sektioner'}</span>
          <div className="check-group" style={{ flexDirection: 'column', gap: 6 }}>
            {Object.entries(sectionLabels).map(([key, label]) => (
              <label key={key} className="check-item">
                <input
                  type="checkbox"
                  checked={draft.sections[key]}
                  onChange={e => setSection(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Severities */}
        <div className="field">
          <span className="field-label">{L ? 'Include severity levels' : 'Inkludera allvarlighetsgrader'}</span>
          <div className="check-group">
            {Object.entries(sevLabels).map(([key, label]) => (
              <label key={key} className="check-item">
                <input
                  type="checkbox"
                  checked={draft.severities[key]}
                  onChange={e => setSeverity(key, e.target.checked)}
                />
                <span className={`badge badge-${key}`}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="field">
          <span className="field-label">{L ? 'Client logo' : 'Kundlogotyp'}</span>
          {draft.logo ? (
            <div className="cr-logo-preview">
              <img src={draft.logo} alt="Logo" className="cr-logo-img" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={removeLogo}>
                {L ? 'Remove' : 'Ta bort'}
              </button>
            </div>
          ) : (
            <label className="cr-logo-upload">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleLogo}
              />
              <span className="cr-logo-upload-text">
                {L ? 'Click to upload logo (PNG, JPG, SVG)' : 'Klicka för att ladda upp logotyp (PNG, JPG, SVG)'}
              </span>
            </label>
          )}
        </div>

        <div className="pf-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {L ? 'Cancel' : 'Avbryt'}
          </button>
          <button type="button" className="btn btn-primary" onClick={apply}>
            {L ? 'Apply & Preview' : 'Tillämpa och förhandsgranska'}
          </button>
        </div>
      </div>
    </div>
  )
}
