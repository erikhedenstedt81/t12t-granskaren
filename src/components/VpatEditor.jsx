import { useState, useRef } from 'react'
import { getProject, getVpat, saveVpat, generateVpatFromFindings, getEaaStatus } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import { buildVpatHtml } from '../report/vpatHtmlExport.js'
import { buildVpatDocx } from '../report/vpatDocxExport.js'
import Icon from './Icon.jsx'
import { toast } from './Toast.jsx'

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const CONFORMANCE_OPTIONS = [
  { value: 'supports',           label: 'Stöds'         },
  { value: 'partially-supports', label: 'Stöds delvis'  },
  { value: 'does-not-support',   label: 'Stöds ej'      },
  { value: 'not-applicable',     label: 'Ej tillämplig' },
  { value: 'not-evaluated',      label: 'Ej utvärderad' },
]

const PRINCIPLES    = ['Perceivable', 'Operable', 'Understandable', 'Robust']
const PRINCIPLES_SV = {
  Perceivable:    'Uppfattbar',
  Operable:       'Hanterbar',
  Understandable: 'Begriplig',
  Robust:         'Robust',
}

function defaultVpat(project) {
  return {
    template:          'wcag22',
    productName:       project?.name ?? '',
    productVersion:    '',
    reportDate:        new Date().toISOString().slice(0, 10),
    contactName:       '',
    contactEmail:      '',
    evaluationMethods: '',
    notes:             '',
    criteria:          {},
  }
}

/* ─── Root ───────────────────────────────────────────────────────────────────── */

export default function VpatEditor({ projectId, onBack }) {
  const project     = getProject(projectId)
  const [vpat,      setVpat]      = useState(() => getVpat(projectId) ?? defaultVpat(project))
  const [saveState, setSaveState] = useState('saved') // 'saving' | 'saved'
  const [exportLang,    setExportLang]    = useState('en')   // 'en' | 'sv'
  const [docxExporting, setDocxExporting] = useState(false)
  const saveTimer = useRef(null)

  const displayName = project?.name?.trim() || 'Namnlöst projekt'

  /* ── Debounced save ────────────────────────────────────────────────────────── */

  function updateVpat(updater) {
    setVpat(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      setSaveState('saving')
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveVpat(projectId, next)
        setSaveState('saved')
      }, 500)
      return next
    })
  }

  function setField(field, value) {
    updateVpat(prev => ({ ...prev, [field]: value }))
  }

  function setCriterionLevel(criterionId, value) {
    updateVpat(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [criterionId]: {
          ...(prev.criteria[criterionId] ?? { remarks: '', remarksAuto: false }),
          conformanceLevel:     value,
          conformanceLevelAuto: false,
        },
      },
    }))
  }

  function setCriterionRemarks(criterionId, value) {
    updateVpat(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [criterionId]: {
          ...(prev.criteria[criterionId] ?? { conformanceLevel: 'not-evaluated', conformanceLevelAuto: false }),
          remarks:     value,
          remarksAuto: false,
        },
      },
    }))
  }

  /* ── Generate from findings ───────────────────────────────────────────────── */

  function handleGenerate() {
    const generated = generateVpatFromFindings(projectId)
    setVpat(generated)
    setSaveState('saved')
    toast('VPAT genererad från fynd ✓')
  }

  /* ── Stats ───────────────────────────────────────────────────────────────── */

  const entries = Object.values(vpat.criteria)
  const stats = {
    supports:             entries.filter(c => c.conformanceLevel === 'supports').length,
    'partially-supports': entries.filter(c => c.conformanceLevel === 'partially-supports').length,
    'does-not-support':   entries.filter(c => c.conformanceLevel === 'does-not-support').length,
    'not-applicable':     entries.filter(c => c.conformanceLevel === 'not-applicable').length,
    'not-evaluated':      entries.filter(c => c.conformanceLevel === 'not-evaluated').length,
  }
  const totalFilled = entries.length

  /* ── Word export ────────────────────────────────────────────────────────── */

  async function handleExportDocx() {
    if (docxExporting) return
    setDocxExporting(true)
    try {
      const eaaStatus = getEaaStatus(projectId)
      const blob      = await buildVpatDocx(vpat, eaaStatus, exportLang)
      const url       = URL.createObjectURL(blob)
      const a         = document.createElement('a')
      const safe      = (vpat.productName || 'vpat').replace(/[^a-zA-Z0-9åäöÅÄÖ\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()
      a.href          = url
      a.download      = `${safe}-VPAT-${vpat.reportDate || new Date().toISOString().slice(0, 10)}.docx`
      a.click()
      URL.revokeObjectURL(url)
      toast('VPAT exporterad som Word (.docx) ✓')
    } catch (err) {
      console.error('VPAT Word export failed:', err)
      toast('Export misslyckades – se konsolen för detaljer')
    } finally {
      setDocxExporting(false)
    }
  }

  /* ── HTML export ────────────────────────────────────────────────────────── */

  function handleExportHtml() {
    const eaaStatus = getEaaStatus(projectId)
    const html      = buildVpatHtml(vpat, eaaStatus, exportLang)
    const blob      = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url       = URL.createObjectURL(blob)
    const a         = document.createElement('a')
    const safe      = (vpat.productName || 'vpat').replace(/[^a-zA-Z0-9åäöÅÄÖ\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()
    a.href          = url
    a.download      = `vpat-${safe}-${vpat.reportDate || new Date().toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast('VPAT exporterad som HTML ✓')
  }

  /* ── Text export ─────────────────────────────────────────────────────────── */

  function handleExportText() {
    const lines = []
    lines.push('VPAT® – Voluntary Product Accessibility Template')
    lines.push('WCAG 2.2 (ISO/IEC 40500)')
    lines.push('')
    lines.push(`Produkt:          ${vpat.productName || '–'}`)
    lines.push(`Version:          ${vpat.productVersion || '–'}`)
    lines.push(`Rapportdatum:     ${vpat.reportDate || '–'}`)
    lines.push(`Kontaktperson:    ${vpat.contactName || '–'}`)
    if (vpat.contactEmail) lines.push(`E-post:           ${vpat.contactEmail}`)
    if (vpat.evaluationMethods?.trim()) {
      lines.push('')
      lines.push('Utvärderingsmetoder:')
      lines.push(vpat.evaluationMethods.trim())
    }
    lines.push('')
    lines.push('─'.repeat(70))
    lines.push('Konformitetstabell – WCAG 2.2')
    lines.push('─'.repeat(70))
    lines.push('')

    for (const principle of PRINCIPLES) {
      const criteria = wcag22.filter(c => c.principle === principle)
      lines.push(`== ${PRINCIPLES_SV[principle]} (${principle}) ==`)
      lines.push('')
      for (const c of criteria) {
        const entry      = vpat.criteria[c.id] ?? {}
        const levelLabel = CONFORMANCE_OPTIONS.find(
          o => o.value === (entry.conformanceLevel ?? 'not-evaluated')
        )?.label ?? '–'
        lines.push(`${c.id}  ${c.nameSwedish}  [Nivå ${c.level}]`)
        lines.push(`  Konformitetsnivå: ${levelLabel}`)
        if (entry.remarks?.trim()) {
          entry.remarks.trim().split('\n').forEach(l => lines.push(`  ${l}`))
        }
        lines.push('')
      }
    }

    if (vpat.notes?.trim()) {
      lines.push('─'.repeat(70))
      lines.push('Ytterligare anmärkningar:')
      lines.push(vpat.notes.trim())
    }

    const blob     = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url      = URL.createObjectURL(blob)
    const a        = document.createElement('a')
    a.href         = url
    a.download     = `vpat-${(vpat.productName || 'rapport').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${vpat.reportDate || 'okand'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast('VPAT exporterad som textfil ✓')
  }

  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div className="vp-root">

      {/* ── Header ── */}
      <header className="vp-header">
        <div className="vp-header-left">
          <button className="vp-back-btn" onClick={onBack} aria-label="Tillbaka till projektöversikt">
            <Icon name="arrow_back" size="sm" /> Tillbaka
          </button>
          <span className="vp-header-sep" aria-hidden="true">·</span>
          <span className="vp-header-project">{displayName}</span>
          <span className="vp-header-sep" aria-hidden="true">·</span>
          <span className="vp-header-title">VPAT-editor</span>
        </div>
        <div className="vp-header-right">
          <span
            className={`vp-save-indicator ${saveState === 'saving' ? 'vp-save-saving' : 'vp-save-saved'}`}
            aria-live="polite"
          >
            {saveState === 'saving'
              ? <><Icon name="sync" size="sm" /> Sparar…</>
              : <><Icon name="check_circle" size="sm" /> Sparat</>}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="vp-body">

        {/* ── Sidebar ── */}
        <aside className="vp-sidebar" aria-label="Produktinformation och åtgärder">
          <div className="vp-sidebar-inner">

            {/* Product info */}
            <section className="vp-sidebar-section">
              <h2 className="vp-sidebar-heading">Produktinformation</h2>

              <div className="vp-field">
                <label className="field-label" htmlFor="vp-productName">Produktnamn</label>
                <input
                  id="vp-productName" className="input" type="text"
                  value={vpat.productName}
                  onChange={e => setField('productName', e.target.value)}
                  placeholder="t.ex. Myndighetsportalen"
                />
              </div>
              <div className="vp-field">
                <label className="field-label" htmlFor="vp-productVersion">Version</label>
                <input
                  id="vp-productVersion" className="input" type="text"
                  value={vpat.productVersion}
                  onChange={e => setField('productVersion', e.target.value)}
                  placeholder="t.ex. 2.1.0"
                />
              </div>
              <div className="vp-field">
                <label className="field-label" htmlFor="vp-reportDate">Rapportdatum</label>
                <input
                  id="vp-reportDate" className="input" type="date"
                  value={vpat.reportDate}
                  onChange={e => setField('reportDate', e.target.value)}
                />
              </div>
              <div className="vp-field">
                <label className="field-label" htmlFor="vp-contactName">Kontaktperson</label>
                <input
                  id="vp-contactName" className="input" type="text"
                  value={vpat.contactName}
                  onChange={e => setField('contactName', e.target.value)}
                  placeholder="Namn"
                />
              </div>
              <div className="vp-field">
                <label className="field-label" htmlFor="vp-contactEmail">E-postadress</label>
                <input
                  id="vp-contactEmail" className="input" type="email"
                  value={vpat.contactEmail}
                  onChange={e => setField('contactEmail', e.target.value)}
                  placeholder="namn@example.com"
                />
              </div>
              <div className="vp-field">
                <label className="field-label" htmlFor="vp-evalMethods">Utvärderingsmetoder</label>
                <textarea
                  id="vp-evalMethods" className="input" rows={3}
                  value={vpat.evaluationMethods}
                  onChange={e => setField('evaluationMethods', e.target.value)}
                  placeholder="Beskriv hur produkten har utvärderats, t.ex. automatiserade tester, manuell granskning, hjälpmedelstestning…"
                />
              </div>
              <div className="vp-field">
                <label className="field-label" htmlFor="vp-notes">Ytterligare anmärkningar</label>
                <textarea
                  id="vp-notes" className="input" rows={3}
                  value={vpat.notes}
                  onChange={e => setField('notes', e.target.value)}
                  placeholder="Övriga kommentarer eller undantag…"
                />
              </div>
            </section>

            {/* Stats */}
            <section className="vp-sidebar-section" aria-labelledby="vp-stats-heading">
              <h2 className="vp-sidebar-heading" id="vp-stats-heading">Statistik</h2>
              <div className="vp-stats-grid" role="list">
                <div className="vp-stat-item vp-stat-supports" role="listitem"
                  aria-label={`${stats.supports} kriterier stöds`}>
                  <span className="vp-stat-val">{stats.supports}</span>
                  <span className="vp-stat-lbl">Stöds</span>
                </div>
                <div className="vp-stat-item vp-stat-partial" role="listitem"
                  aria-label={`${stats['partially-supports']} kriterier stöds delvis`}>
                  <span className="vp-stat-val">{stats['partially-supports']}</span>
                  <span className="vp-stat-lbl">Stöds delvis</span>
                </div>
                <div className="vp-stat-item vp-stat-no" role="listitem"
                  aria-label={`${stats['does-not-support']} kriterier stöds ej`}>
                  <span className="vp-stat-val">{stats['does-not-support']}</span>
                  <span className="vp-stat-lbl">Stöds ej</span>
                </div>
                <div className="vp-stat-item vp-stat-na" role="listitem"
                  aria-label={`${stats['not-applicable']} kriterier ej tillämpliga`}>
                  <span className="vp-stat-val">{stats['not-applicable']}</span>
                  <span className="vp-stat-lbl">Ej tillämplig</span>
                </div>
                <div className="vp-stat-item vp-stat-ne" role="listitem"
                  aria-label={`${stats['not-evaluated']} kriterier ej utvärderade`}>
                  <span className="vp-stat-val">{stats['not-evaluated']}</span>
                  <span className="vp-stat-lbl">Ej utvärderad</span>
                </div>
              </div>
              <p className="vp-stats-note">
                {totalFilled} av {wcag22.length} kriterier ifyllda
              </p>
            </section>

            {/* Template */}
            <section className="vp-sidebar-section" aria-labelledby="vp-template-heading">
              <h2 className="vp-sidebar-heading" id="vp-template-heading">Mall</h2>
              <div className="vp-toggle-group" role="group" aria-label="VPAT-mall">
                <button
                  className={`vp-toggle-btn ${vpat.template === 'wcag22' ? 'vp-toggle-active' : ''}`}
                  onClick={() => setField('template', 'wcag22')}
                  aria-pressed={vpat.template === 'wcag22'}
                >
                  WCAG
                </button>
                <button
                  className={`vp-toggle-btn ${vpat.template === 'en301549' ? 'vp-toggle-active' : ''}`}
                  onClick={() => setField('template', 'en301549')}
                  aria-pressed={vpat.template === 'en301549'}
                >
                  EN 301 549
                </button>
              </div>
              {vpat.template === 'en301549' && (
                <p className="vp-generate-hint" style={{ marginTop: 6 }}>
                  Inkluderar EN 301 549-kapitel 9–12 i HTML-exporten. Kapitel 12 hämtas från projektets EAA-checklista.
                </p>
              )}
            </section>

            {/* Actions */}
            <section className="vp-sidebar-section" aria-labelledby="vp-actions-heading">
              <h2 className="vp-sidebar-heading" id="vp-actions-heading">Generera &amp; exportera</h2>
              <button className="btn btn-primary vp-generate-btn" onClick={handleGenerate}>
                <Icon name="auto_awesome" size="sm" /> Generera från fynd
              </button>
              <p className="vp-generate-hint">
                Fyller i konformitetsnivåer automatiskt baserat på dokumenterade fynd och guidad granskning.
                Befintlig produktinfo bevaras.
              </p>

              {/* Language toggle for export */}
              <div className="vp-export-lang-row">
                <span className="vp-export-lang-label">Exportspråk</span>
                <div className="vp-toggle-group" role="group" aria-label="Exportspråk">
                  <button
                    className={`vp-toggle-btn ${exportLang === 'sv' ? 'vp-toggle-active' : ''}`}
                    onClick={() => setExportLang('sv')}
                    aria-pressed={exportLang === 'sv'}
                  >
                    🇸🇪 Svenska
                  </button>
                  <button
                    className={`vp-toggle-btn ${exportLang === 'en' ? 'vp-toggle-active' : ''}`}
                    onClick={() => setExportLang('en')}
                    aria-pressed={exportLang === 'en'}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary vp-export-btn"
                onClick={handleExportHtml}
              >
                <Icon name="html" size="sm" /> Exportera VPAT (HTML)
              </button>
              <button
                className="btn btn-secondary vp-export-btn"
                onClick={handleExportDocx}
                disabled={docxExporting}
                style={{ marginTop: 6 }}
                aria-busy={docxExporting}
              >
                {docxExporting
                  ? <><Icon name="sync" size="sm" /> Genererar Word…</>
                  : <><Icon name="description" size="sm" /> Exportera VPAT (Word)</>}
              </button>
              <button
                className="btn btn-ghost vp-export-btn"
                onClick={handleExportText}
                style={{ marginTop: 6 }}
              >
                <Icon name="download" size="sm" /> Exportera som text (.txt)
              </button>
            </section>

          </div>
        </aside>

        {/* ── Main criteria table ── */}
        <main className="vp-main" id="vp-main-content">
          <div className="vp-main-intro">
            <h1 className="vp-main-title">VPAT® – WCAG 2.2</h1>
            <p className="vp-main-desc">
              Fyll i konformitetsnivå och eventuella anmärkningar för varje kriterium.
              Använd <strong>Generera från fynd</strong> för att förifyllas automatiskt.
            </p>
            <div className="vp-legend" aria-label="Teckenförklaring konformitetsnivåer">
              {CONFORMANCE_OPTIONS.map(o => (
                <span key={o.value} className={`vp-legend-item vp-legend-${o.value.replace('-', '_')}`}>
                  {o.label}
                </span>
              ))}
            </div>
          </div>

          {PRINCIPLES.map(principle => {
            const criteria = wcag22.filter(c => c.principle === principle)
            return (
              <section
                key={principle}
                className="vp-principle-section"
                aria-labelledby={`vp-principle-${principle}`}
              >
                <h2 className="vp-principle-title" id={`vp-principle-${principle}`}>
                  {PRINCIPLES_SV[principle]}
                  <span className="vp-principle-sub">{principle}</span>
                </h2>

                <div className="vp-table-wrap">
                  <table className="vp-table" aria-label={`${PRINCIPLES_SV[principle]} – WCAG-kriterier`}>
                    <thead>
                      <tr>
                        <th className="vp-th vp-th-id" scope="col">Kriterium</th>
                        <th className="vp-th vp-th-lvl" scope="col">Niv.</th>
                        <th className="vp-th vp-th-name" scope="col">Namn</th>
                        <th className="vp-th vp-th-conform" scope="col">Konformitetsnivå</th>
                        <th className="vp-th vp-th-remarks" scope="col">Anmärkningar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map(c => {
                        const entry = vpat.criteria[c.id] ?? {}
                        const level = entry.conformanceLevel ?? 'not-evaluated'
                        return (
                          <tr key={c.id} className={`vp-tr vp-tr-${level.replace('-', '_')}`}>
                            <td className="vp-td vp-td-id">
                              <span className="vp-crit-id">{c.id}</span>
                              {c.eaaCritical && (
                                <span className="badge badge-eaa vp-eaa-badge" title="EAA-kritiskt" aria-label="EAA-kritiskt">EAA</span>
                              )}
                            </td>
                            <td className="vp-td vp-td-lvl">
                              <span className={`badge badge-level-${c.level.toLowerCase()}`}>{c.level}</span>
                            </td>
                            <td className="vp-td vp-td-name">
                              <span className="vp-crit-name">{c.nameSwedish}</span>
                            </td>
                            <td className="vp-td vp-td-conform">
                              <select
                                className={`vp-level-select vp-select-${level.replace('-', '_')}`}
                                value={level}
                                onChange={e => setCriterionLevel(c.id, e.target.value)}
                                aria-label={`Konformitetsnivå för ${c.id} ${c.nameSwedish}`}
                              >
                                {CONFORMANCE_OPTIONS.map(o => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="vp-td vp-td-remarks">
                              <textarea
                                className={`vp-remarks${entry.remarksAuto ? ' vp-remarks-auto' : ''}`}
                                value={entry.remarks ?? ''}
                                rows={2}
                                onChange={e => setCriterionRemarks(c.id, e.target.value)}
                                placeholder="Anmärkningar, avvikelser, planerade åtgärder…"
                                aria-label={`Anmärkningar för ${c.id} ${c.nameSwedish}`}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          })}
        </main>

      </div>
    </div>
  )
}
