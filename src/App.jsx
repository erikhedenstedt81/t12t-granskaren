import { useState, useEffect } from 'react'
import Dashboard        from './components/Dashboard.jsx'
import ProjectOverview  from './components/ProjectOverview.jsx'
import AuditView        from './components/AuditView.jsx'
import CustomerReport   from './components/CustomerReport.jsx'
import Settings         from './components/Settings.jsx'
import AuditSetup       from './components/AuditSetup.jsx'
import GuidedAuditView  from './components/GuidedAuditView.jsx'
import { ToastContainer } from './components/Toast.jsx'
import { getProject } from './store/storage.js'

const BASE_TITLE = 'Tillgänglighetsgranskningsverktyg'

export default function App() {
  const [route,        setRoute]        = useState({ view: 'dashboard' })
  const [showSettings, setShowSettings] = useState(false)

  const goToDashboard = () => setRoute({ view: 'dashboard' })

  // ── Dynamic page title ──────────────────────────────────────────────────────
  useEffect(() => {
    let title = BASE_TITLE
    if (['audit', 'overview', 'report', 'setup', 'guided'].includes(route.view)) {
      const project = getProject(route.projectId)
      if (project) {
        const viewLabel = {
          audit:    'Granskning',
          report:   'Rapport',
          overview: 'Projektöversikt',
          setup:    'Guidad granskning – uppstart',
          guided:   'Guidad granskning',
        }[route.view] ?? ''
        const displayName = project.name?.trim() || 'Namnlöst projekt'
        title = `${displayName} – ${viewLabel} | ${BASE_TITLE}`
      }
    }
    document.title = title
  }, [route])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <a href="#main-content" className="skip-link">Hoppa till innehåll</a>

      <main id="main-content">
        {route.view === 'report' && (
          <CustomerReport
            projectId={route.projectId}
            onBack={() => setRoute({ view: 'overview', projectId: route.projectId })}
          />
        )}

        {route.view === 'audit' && (
          <AuditView
            projectId={route.projectId}
            initialFindingId={route.findingId ?? null}
            onBack={goToDashboard}
            onOpenOverview={projectId => setRoute({ view: 'overview', projectId })}
          />
        )}

        {route.view === 'setup' && (
          <AuditSetup
            project={getProject(route.projectId)}
            onDone={project => setRoute({ view: 'guided', projectId: project.id })}
            onCancel={() =>
              route.from === 'dashboard'
                ? goToDashboard()
                : setRoute({ view: 'overview', projectId: route.projectId })
            }
          />
        )}

        {route.view === 'guided' && (
          <GuidedAuditView
            projectId={route.projectId}
            onBack={() => setRoute({ view: 'overview', projectId: route.projectId })}
            onOpenAudit={(projectId, findingId) =>
              setRoute({ view: 'audit', projectId, findingId: findingId ?? null })
            }
            onOpenReport={projectId => setRoute({ view: 'report', projectId })}
          />
        )}

        {route.view === 'overview' && (
          <ProjectOverview
            projectId={route.projectId}
            onBack={goToDashboard}
            onOpenAudit={(projectId, findingId) =>
              setRoute({ view: 'audit', projectId, findingId: findingId ?? null })
            }
            onOpenReport={projectId => setRoute({ view: 'report', projectId })}
            onOpenGuidedSetup={projectId => setRoute({ view: 'setup', projectId })}
            onOpenGuided={projectId => setRoute({ view: 'guided', projectId })}
          />
        )}

        {route.view === 'dashboard' && (
          <Dashboard
            onOpenAudit={project    => setRoute({ view: 'audit',    projectId: project.id })}
            onOpenOverview={project => setRoute({ view: 'overview', projectId: project.id })}
            onOpenAuditByIds={(projectId, findingId) =>
              setRoute({ view: 'audit', projectId, findingId: findingId ?? null })
            }
            onOpenSettings={() => setShowSettings(true)}
            onOpenGuidedSetup={(projectId, fromDashboard) =>
              setRoute({ view: 'setup', projectId, from: fromDashboard ? 'dashboard' : undefined })
            }
          />
        )}
      </main>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      <ToastContainer />
    </>
  )
}
