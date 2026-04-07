import { wcag22 } from '../data/wcag22.js'

// ─── ID generation ───────────────────────────────────────────────────────────

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Severity calculation ─────────────────────────────────────────────────────

/**
 * Automatically calculates severity based on WCAG criterion and context.
 * @param {object} criterion - A WCAG criterion object from wcag22.js
 * @param {object} context - { isKeyFlow: boolean }
 * @returns {"critical"|"high"|"medium"|"low"}
 */
export function calculateSeverity(criterion, context = {}) {
  const severityOrder = ['low', 'medium', 'high', 'critical']

  let level
  if (criterion.level === 'A') level = 'high'
  else if (criterion.level === 'AA') level = 'medium'
  else level = 'low' // AAA

  let idx = severityOrder.indexOf(level)

  if (criterion.eaaCritical) {
    idx = Math.min(idx + 1, severityOrder.length - 1)
  }

  if (context.isKeyFlow) {
    idx = Math.min(idx + 1, severityOrder.length - 1)
  }

  return severityOrder[idx]
}

// ─── Projects ─────────────────────────────────────────────────────────────────

const PROJECTS_KEY = 'a11y_projects'

export function getProjects() {
  const raw = localStorage.getItem(PROJECTS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) ?? null
}

export function saveProject(project) {
  const projects = getProjects()
  const now = new Date().toISOString()
  const idx = projects.findIndex((p) => p.id === project.id)

  if (idx === -1) {
    // New project
    const newProject = {
      id: generateId(),
      wcagVersion: '2.2',
      conformanceTarget: 'AA',
      status: 'active',
      createdAt: now,
      ...project,
      updatedAt: now,
    }
    projects.push(newProject)
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
    return newProject
  } else {
    // Update existing
    const updated = { ...projects[idx], ...project, updatedAt: now }
    projects[idx] = updated
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
    return updated
  }
}

export function deleteProject(id) {
  const projects = getProjects().filter((p) => p.id !== id)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  localStorage.removeItem(findingsStorageKey(id))
  localStorage.removeItem(eaaStorageKey(id))
}

// ─── Findings ─────────────────────────────────────────────────────────────────

function findingsStorageKey(projectId) {
  return `a11y_findings_${projectId}`
}

export function getFindings(projectId) {
  const raw = localStorage.getItem(findingsStorageKey(projectId))
  return raw ? JSON.parse(raw) : []
}

export function saveFinding(projectId, finding) {
  const findings = getFindings(projectId)
  const now = new Date().toISOString()
  const idx = findings.findIndex((f) => f.id === finding.id)

  if (idx === -1) {
    // New finding – auto-calculate severity if not manually set
    let severity = finding.severity
    let severityAuto = finding.severityAuto ?? true

    if (severityAuto && finding.wcagCriterionId) {
      const criterion = wcag22.find((c) => c.id === finding.wcagCriterionId)
      if (criterion) {
        severity = calculateSeverity(criterion, {
          isKeyFlow: finding.isKeyFlow ?? false,
        })
      }
    }

    const newFinding = {
      id: generateId(),
      eaaRequirementId: null,
      severity: severity ?? 'medium',
      severityAuto,
      status: 'open',
      screenshot: null,
      createdAt: now,
      ...finding,
      projectId,
      updatedAt: now,
    }
    findings.push(newFinding)
    localStorage.setItem(findingsStorageKey(projectId), JSON.stringify(findings))
    return newFinding
  } else {
    // Update existing
    const updated = { ...findings[idx], ...finding, projectId, updatedAt: now }
    findings[idx] = updated
    localStorage.setItem(findingsStorageKey(projectId), JSON.stringify(findings))
    return updated
  }
}

export function deleteFinding(projectId, findingId) {
  const findings = getFindings(projectId).filter((f) => f.id !== findingId)
  localStorage.setItem(findingsStorageKey(projectId), JSON.stringify(findings))
}

// ─── EAA Status ───────────────────────────────────────────────────────────────

function eaaStorageKey(projectId) {
  return `a11y_eaa_${projectId}`
}

export function getEaaStatus(projectId) {
  const raw = localStorage.getItem(eaaStorageKey(projectId))
  return raw ? JSON.parse(raw) : {}
}

export function saveEaaStatus(projectId, status) {
  localStorage.setItem(eaaStorageKey(projectId), JSON.stringify(status))
}

// ─── Auditor profile ──────────────────────────────────────────────────────────

const PROFILE_KEY = 'a11y_auditor_profile'

export function getAuditorProfile() {
  const raw = localStorage.getItem(PROFILE_KEY)
  return raw ? JSON.parse(raw) : { name: '', email: '', company: '' }
}

export function saveAuditorProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// ─── App settings ─────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'a11y_app_settings'

export function getAppSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY)
  return raw ? JSON.parse(raw) : { defaultLanguage: 'sv' }
}

export function saveAppSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// ─── Backup / restore ────────────────────────────────────────────────────────

export function exportAllData() {
  const projects = getProjects()
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    auditorProfile: getAuditorProfile(),
    appSettings: getAppSettings(),
    projects,
    findings: Object.fromEntries(
      projects.map(p => [p.id, getFindings(p.id)])
    ),
    eaaStatus: Object.fromEntries(
      projects.map(p => [p.id, getEaaStatus(p.id)])
    ),
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonString) {
  const data = JSON.parse(jsonString)
  if (!data.version || !Array.isArray(data.projects)) {
    throw new Error('Ogiltig backup-fil')
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.projects))
  if (data.auditorProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.auditorProfile))
  }
  if (data.appSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.appSettings))
  }
  for (const project of data.projects) {
    if (data.findings?.[project.id]) {
      localStorage.setItem(findingsStorageKey(project.id), JSON.stringify(data.findings[project.id]))
    }
    if (data.eaaStatus?.[project.id]) {
      localStorage.setItem(eaaStorageKey(project.id), JSON.stringify(data.eaaStatus[project.id]))
    }
  }
}

export function clearAllData() {
  const projects = getProjects()
  for (const p of projects) {
    localStorage.removeItem(findingsStorageKey(p.id))
    localStorage.removeItem(eaaStorageKey(p.id))
  }
  localStorage.removeItem(PROJECTS_KEY)
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem(SETTINGS_KEY)
}
