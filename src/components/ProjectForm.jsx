import { useState, useRef } from 'react'
import { saveProject, getAuditorProfile } from '../store/storage.js'
import { toast } from './Toast.jsx'
import Icon from './Icon.jsx'

export default function ProjectForm({ project, onSaved, onCancel }) {
  const profile = getAuditorProfile()

  const [form, setForm] = useState({
    name:              project?.name              ?? '',
    clientName:        project?.clientName        ?? '',
    url:               project?.url               ?? '',
    auditor:           project?.auditor           ?? profile.name ?? '',
    startDate:         project?.startDate         ?? new Date().toISOString().slice(0, 10),
    status:            project?.status            ?? 'active',
    conformanceTarget: project?.conformanceTarget ?? 'AA',
  })

  const [errors, setErrors] = useState({})

  const nameRef   = useRef(null)
  const clientRef = useRef(null)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  function validate() {
    const errs = {}
    if (!form.name.trim())       errs.name       = 'Projektnamn är obligatoriskt'
    if (!form.clientName.trim()) errs.clientName  = 'Kundnamn är obligatoriskt'
    return errs
  }

  function submit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Move focus to first field with error
      if (errs.name)       nameRef.current?.focus()
      else if (errs.clientName) clientRef.current?.focus()
      return
    }
    setErrors({})
    const saved = saveProject(project ? { ...project, ...form } : form)
    toast(project ? 'Projekt uppdaterat' : 'Projekt skapat')
    onSaved(saved)
  }

  return (
    <form className="pf-form" onSubmit={submit} noValidate>
      <h2 className="pf-title">{project ? 'Redigera projekt' : 'Nytt projekt'}</h2>

      {/* Projektnamn */}
      <div className="field">
        <label className="field-label" htmlFor="pf-name">
          Projektnamn <span aria-hidden="true">*</span><span className="sr-only">(obligatoriskt)</span>
        </label>
        <input
          id="pf-name"
          ref={nameRef}
          className={`input${errors.name ? ' input-invalid' : ''}`}
          required
          aria-required="true"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'pf-name-err' : undefined}
          value={form.name}
          onChange={e => {
            set('name')(e)
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
          }}
          placeholder="t.ex. Kommunens webbplats 2025"
          autoFocus
        />
        {errors.name && (
          <span id="pf-name-err" className="field-error" role="alert">
            <Icon name="error" size="sm" className="icon-danger" aria-hidden="true" />
            Fel: {errors.name}
          </span>
        )}
      </div>

      {/* Kundnamn */}
      <div className="field">
        <label className="field-label" htmlFor="pf-client">
          Kundnamn <span aria-hidden="true">*</span><span className="sr-only">(obligatoriskt)</span>
        </label>
        <input
          id="pf-client"
          ref={clientRef}
          className={`input${errors.clientName ? ' input-invalid' : ''}`}
          required
          aria-required="true"
          aria-invalid={errors.clientName ? 'true' : undefined}
          aria-describedby={errors.clientName ? 'pf-client-err' : undefined}
          value={form.clientName}
          onChange={e => {
            set('clientName')(e)
            if (errors.clientName) setErrors(prev => ({ ...prev, clientName: undefined }))
          }}
          placeholder="t.ex. Stockholms stad"
        />
        {errors.clientName && (
          <span id="pf-client-err" className="field-error" role="alert">
            <Icon name="error" size="sm" className="icon-danger" aria-hidden="true" />
            Fel: {errors.clientName}
          </span>
        )}
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
