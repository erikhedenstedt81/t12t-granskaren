import { useState } from 'react'
import { saveProject, getAuditorProfile } from '../store/storage.js'
import { toast } from './Toast.jsx'

export default function ProjectForm({ project, onSaved, onCancel }) {
  const profile = getAuditorProfile()

  const [form, setForm] = useState({
    name:               project?.name               ?? '',
    clientName:         project?.clientName         ?? '',
    url:                project?.url                ?? '',
    auditor:            project?.auditor            ?? profile.name ?? '',
    startDate:          project?.startDate          ?? new Date().toISOString().slice(0, 10),
    status:             project?.status             ?? 'active',
    conformanceTarget:  project?.conformanceTarget  ?? 'AA',
  })

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    const saved = saveProject(project ? { ...project, ...form } : form)
    toast(project ? 'Projekt uppdaterat' : 'Projekt skapat')
    onSaved(saved)
  }

  return (
    <form className="pf-form" onSubmit={submit} noValidate>
      <h2 className="pf-title">{project ? 'Redigera projekt' : 'Nytt projekt'}</h2>

      <div className="field">
        <label className="field-label" htmlFor="pf-name">Projektnamn <span aria-hidden="true">*</span><span className="sr-only">(obligatoriskt)</span></label>
        <input
          id="pf-name"
          className="input"
          required
          aria-required="true"
          value={form.name}
          onChange={set('name')}
          placeholder="t.ex. Kommunens webbplats 2025"
          autoFocus
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="pf-client">Kundnamn <span aria-hidden="true">*</span><span className="sr-only">(obligatoriskt)</span></label>
        <input
          id="pf-client"
          className="input"
          required
          aria-required="true"
          value={form.clientName}
          onChange={set('clientName')}
          placeholder="t.ex. Stockholms stad"
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="pf-url">Webbplats-URL</label>
        <input
          id="pf-url"
          className="input"
          type="url"
          value={form.url}
          onChange={set('url')}
          placeholder="https://example.com"
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="pf-auditor">Ansvarig granskare</label>
        <input
          id="pf-auditor"
          className="input"
          value={form.auditor}
          onChange={set('auditor')}
          placeholder="Ditt namn"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="pf-date">Startdatum</label>
          <input
            id="pf-date"
            className="input"
            type="date"
            value={form.startDate}
            onChange={set('startDate')}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="pf-target">Konformitetsmål</label>
          <select id="pf-target" className="input" value={form.conformanceTarget} onChange={set('conformanceTarget')}>
            <option value="A">Nivå A</option>
            <option value="AA">Nivå AA</option>
            <option value="AAA">Nivå AAA</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="pf-status">Status</label>
          <select id="pf-status" className="input" value={form.status} onChange={set('status')}>
            <option value="active">Aktiv</option>
            <option value="completed">Avslutad</option>
          </select>
        </div>
      </div>

      <div className="pf-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Avbryt</button>
        <button type="submit" className="btn btn-primary">
          {project ? 'Spara ändringar' : 'Skapa projekt'}
        </button>
      </div>
    </form>
  )
}
