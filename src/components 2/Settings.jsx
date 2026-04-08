import { useState, useRef } from 'react'
import {
  getAuditorProfile, saveAuditorProfile,
  getAppSettings,    saveAppSettings,
  exportAllData,     importAllData, clearAllData,
} from '../store/storage.js'
import { toast } from './Toast.jsx'

export default function Settings({ onClose }) {
  const [profile,  setProfile]  = useState(getAuditorProfile)
  const [settings, setSettings] = useState(getAppSettings)
  const [confirm,  setConfirm]  = useState(false)
  const importRef = useRef(null)

  function handleProfileChange(field, value) {
    setProfile(p => ({ ...p, [field]: value }))
  }

  function saveProfile() {
    saveAuditorProfile(profile)
    toast('Granskarprofil sparad')
  }

  function saveSettings() {
    saveAppSettings(settings)
    toast('Inställningar sparade')
  }

  function handleExport() {
    const json = exportAllData()
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `a11y-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Backup nedladdad')
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        importAllData(ev.target.result)
        toast('Data importerad — ladda om sidan för att se ändringarna', 'info')
      } catch (err) {
        toast(`Import misslyckades: ${err.message}`, 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClear() {
    if (!confirm) { setConfirm(true); return }
    clearAllData()
    toast('All data raderad', 'info')
    setConfirm(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box st-box" role="dialog" aria-modal="true" aria-label="Inställningar">
        <button className="modal-close" onClick={onClose} aria-label="Stäng">×</button>
        <h2 className="pf-title">Inställningar</h2>

        {/* ── Auditor profile ── */}
        <section className="st-section">
          <h3 className="st-section-title">Granskarprofil</h3>
          <p className="st-section-desc">
            Fylls i automatiskt i nya projekt.
          </p>

          <div className="field">
            <label className="field-label" htmlFor="st-name">Namn</label>
            <input
              id="st-name"
              className="input"
              type="text"
              value={profile.name}
              onChange={e => handleProfileChange('name', e.target.value)}
              placeholder="Anna Svensson"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="st-email">E-post</label>
            <input
              id="st-email"
              className="input"
              type="email"
              value={profile.email}
              onChange={e => handleProfileChange('email', e.target.value)}
              placeholder="anna@exempel.se"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="st-company">Företag</label>
            <input
              id="st-company"
              className="input"
              type="text"
              value={profile.company}
              onChange={e => handleProfileChange('company', e.target.value)}
              placeholder="Tillgänglig AB"
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveProfile}>
            Spara profil
          </button>
        </section>

        {/* ── App settings ── */}
        <section className="st-section">
          <h3 className="st-section-title">Standardinställningar</h3>

          <div className="field">
            <label className="field-label" htmlFor="st-lang">Standardspråk för rapporter</label>
            <select
              id="st-lang"
              className="input"
              value={settings.defaultLanguage}
              onChange={e => setSettings(s => ({ ...s, defaultLanguage: e.target.value }))}
              style={{ width: 'auto' }}
            >
              <option value="sv">Svenska</option>
              <option value="en">English</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveSettings}>
            Spara inställningar
          </button>
        </section>

        {/* ── Data management ── */}
        <section className="st-section">
          <h3 className="st-section-title">Datahantering</h3>

          <div className="st-data-actions">
            <div className="st-data-row">
              <div>
                <strong>Exportera backup</strong>
                <p className="st-data-desc">Ladda ned alla projekt och fynd som JSON.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExport}>
                ↓ Exportera JSON
              </button>
            </div>

            <div className="st-data-row">
              <div>
                <strong>Importera backup</strong>
                <p className="st-data-desc">Återställ data från en tidigare exporterad JSON-fil.</p>
              </div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                ↑ Importera JSON
                <input
                  ref={importRef}
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={handleImport}
                />
              </label>
            </div>

            <div className="st-data-row st-data-danger">
              <div>
                <strong>Rensa all data</strong>
                <p className="st-data-desc">Raderar alla projekt, fynd och inställningar permanent.</p>
              </div>
              <button
                className={`btn btn-sm ${confirm ? 'btn-danger' : 'btn-secondary'}`}
                onClick={handleClear}
              >
                {confirm ? 'Bekräfta radering' : 'Rensa allt'}
              </button>
            </div>
            {confirm && (
              <p className="st-confirm-msg" role="alert">
                Klicka igen för att bekräfta — detta går inte att ångra.{' '}
                <button className="btn-link" onClick={() => setConfirm(false)}>Avbryt</button>
              </p>
            )}
          </div>
        </section>

        <div className="pf-actions">
          <button className="btn btn-secondary" onClick={onClose}>Stäng</button>
        </div>
      </div>
    </div>
  )
}
