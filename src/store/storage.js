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
  localStorage.removeItem(guidedProgressKey(id))
  localStorage.removeItem(vpatStorageKey(id))
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
    guidedProgress: Object.fromEntries(
      projects.map(p => [p.id, getGuidedProgress(p.id)])
    ),
    vpat: Object.fromEntries(
      projects.map(p => [p.id, getVpat(p.id)]).filter(([, v]) => v !== null)
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
    if (data.guidedProgress?.[project.id]) {
      localStorage.setItem(guidedProgressKey(project.id), JSON.stringify(data.guidedProgress[project.id]))
    }
    if (data.vpat?.[project.id]) {
      localStorage.setItem(vpatStorageKey(project.id), JSON.stringify(data.vpat[project.id]))
    }
  }
}

export function clearAllData() {
  const projects = getProjects()
  for (const p of projects) {
    localStorage.removeItem(findingsStorageKey(p.id))
    localStorage.removeItem(eaaStorageKey(p.id))
    localStorage.removeItem(guidedProgressKey(p.id))
    localStorage.removeItem(vpatStorageKey(p.id))
  }
  localStorage.removeItem(PROJECTS_KEY)
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem(SETTINGS_KEY)
}

// ─── Guided audit progress ────────────────────────────────────────────────────

function guidedProgressKey(projectId) {
  return `a11y_guided_${projectId}`
}

/**
 * Returns guided progress for a project.
 * Structure: { [url]: { [criterionId]: 'passed'|'finding'|'na'|null } }
 */
export function getGuidedProgress(projectId) {
  const raw = localStorage.getItem(guidedProgressKey(projectId))
  return raw ? JSON.parse(raw) : {}
}

export function saveGuidedProgress(projectId, progress) {
  localStorage.setItem(guidedProgressKey(projectId), JSON.stringify(progress))
}

// ─── VPAT ─────────────────────────────────────────────────────────────────────

function vpatStorageKey(projectId) {
  return `a11y_vpat_${projectId}`
}

export function getVpat(projectId) {
  const raw = localStorage.getItem(vpatStorageKey(projectId))
  return raw ? JSON.parse(raw) : null
}

export function saveVpat(projectId, vpat) {
  localStorage.setItem(vpatStorageKey(projectId), JSON.stringify(vpat))
}

/**
 * Generates a VPAT by reading findings + guided progress for a project.
 * Preserves existing product info fields when regenerating.
 * Overwrites criteria entries.
 */
export function generateVpatFromFindings(projectId) {
  const findings       = getFindings(projectId)
  const project        = getProject(projectId)
  const guidedProgress = getGuidedProgress(projectId)
  const notApplicable  = project?.auditContext?.notApplicable ?? []
  const allUrls        = Object.keys(guidedProgress)

  // Determine per-criterion guided status across all URLs
  function getGuidedStatus(criterionId) {
    for (const url of allUrls) {
      if (guidedProgress[url]?.[criterionId] === 'finding') return 'finding'
    }
    for (const url of allUrls) {
      if (guidedProgress[url]?.[criterionId] === 'passed') return 'passed'
    }
    for (const url of allUrls) {
      if (guidedProgress[url]?.[criterionId] === 'na') return 'na'
    }
    return null
  }

  function buildRemarks(criterionFindings) {
    return criterionFindings.map((f, index) => {
      const parts = []
      const problemText = f.customerDescription || f.description
      if (problemText) parts.push(`Problem: ${problemText}`)
      if (f.suggestedFix) parts.push(`Åtgärd: ${f.suggestedFix}`)
      if (f.url) parts.push(`Sida: ${f.url}`)
      const findingText = parts.join('\n')
      return criterionFindings.length > 1
        ? `Fynd ${index + 1}:\n${findingText}`
        : findingText
    }).join('\n\n')
  }

  const criteria = {}
  for (const c of wcag22) {
    const criterionFindings = findings.filter(
      f => f.wcagCriterionId === c.id && f.status !== 'fixed' && f.status !== 'wont-fix'
    )
    const guidedStatus = getGuidedStatus(c.id)
    const isNA = notApplicable.includes(c.id) || guidedStatus === 'na'

    let conformanceLevel, remarks

    if (criterionFindings.length > 0) {
      const hasCriticalOrHigh = criterionFindings.some(
        f => f.severity === 'critical' || f.severity === 'high'
      )
      conformanceLevel = hasCriticalOrHigh ? 'does-not-support' : 'partially-supports'
      remarks = buildRemarks(criterionFindings)
    } else if (guidedStatus === 'passed') {
      conformanceLevel = 'supports'
      remarks = 'Kriteriet uppfylls utan kända brister.'
    } else if (isNA) {
      conformanceLevel = 'not-applicable'
      remarks = 'Kriteriet är inte relevant för denna produkt eller tjänst.'
    } else {
      conformanceLevel = 'not-evaluated'
      remarks = ''
    }

    criteria[c.id] = {
      conformanceLevel,
      conformanceLevelAuto: true,
      remarks,
      remarksAuto: remarks !== '',
    }
  }

  const existing = getVpat(projectId)
  const today    = new Date().toISOString().slice(0, 10)

  const vpat = {
    template:           existing?.template          ?? 'wcag22',
    productName:        existing?.productName        ?? project?.name        ?? '',
    productVersion:     existing?.productVersion     ?? '',
    reportDate:         existing?.reportDate         ?? today,
    contactName:        existing?.contactName        ?? '',
    contactEmail:       existing?.contactEmail       ?? '',
    evaluationMethods:  existing?.evaluationMethods  ?? '',
    notes:              existing?.notes              ?? '',
    criteria,
  }

  saveVpat(projectId, vpat)
  return vpat
}
