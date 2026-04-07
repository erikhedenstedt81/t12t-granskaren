import { useState } from 'react'
import { saveProject } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import { toast } from './Toast.jsx'

// ─── Question definitions ─────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'video',
    label: 'Innehåller tjänsten förinspelade videofilmer med ljud?',
    hint: 'T.ex. instruktionsvideor, produktdemonstrationer, intervjuer.',
    criteriaIfNo: ['1.2.2', '1.2.3', '1.2.5'],
  },
  {
    id: 'audio',
    label: 'Innehåller tjänsten förinspelat ljud (ljud-only)?',
    hint: 'T.ex. poddar, röstmeddelanden, ljudinspelningar utan video.',
    criteriaIfNo: ['1.2.1'],
  },
  {
    id: 'liveMedia',
    label: 'Innehåller tjänsten direktsänd media (live-streaming)?',
    hint: 'T.ex. livesändningar, direktsänd radio, webbseminarier.',
    criteriaIfNo: ['1.2.4'],
  },
  {
    id: 'forms',
    label: 'Innehåller tjänsten formulär som samlar in information från användaren?',
    hint: 'T.ex. kontaktformulär, beställningsformulär, registrering, inloggning.',
    criteriaIfNo: ['1.3.5', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.7', '3.3.8'],
  },
  {
    id: 'tables',
    label: 'Innehåller tjänsten datatabeller?',
    hint: 'T.ex. prisjämförelser, scheman, statistiktabeller, resultatlistor.',
    criteriaIfNo: [],
  },
  {
    id: 'animation',
    label: 'Innehåller tjänsten animationer eller rörligt/blinkande innehåll?',
    hint: 'T.ex. karuseller, animerade banners, laddningsindikatorer, parallaxeffekter.',
    criteriaIfNo: ['2.2.2', '2.3.1'],
  },
  {
    id: 'autoSound',
    label: 'Spelar tjänsten upp ljud automatiskt (utan användarens åtgärd)?',
    hint: 'T.ex. bakgrundsmusik, videoklipp som startar automatiskt med ljud.',
    criteriaIfNo: ['1.4.2'],
  },
  {
    id: 'maps',
    label: 'Innehåller tjänsten kartor eller geografiska visualiseringar?',
    hint: 'T.ex. Google Maps-inbäddning, SVG-kartor, interaktiva geografiska vyer.',
    criteriaIfNo: [],
  },
  {
    id: 'touch',
    label: 'Är tjänsten primärt avsedd att användas på pekskärm/mobil?',
    hint: 'Inkluderar tjänster som är responsiva och förväntas användas på mobil.',
    criteriaIfNo: ['2.5.1', '2.5.2', '2.5.4', '1.3.4'],
  },
  {
    id: 'dragDrop',
    label: 'Innehåller tjänsten drag-och-släpp-funktioner?',
    hint: 'T.ex. filuppladdning via drag-och-släpp, sorteringslistor, kanban-brädor.',
    criteriaIfNo: ['2.5.7'],
  },
  {
    id: 'timeouts',
    label: 'Har tjänsten tidsgränser för sessioner eller aktiviteter?',
    hint: 'T.ex. session som löper ut efter inaktivitet, tidsbegränsade erbjudanden, examinationer.',
    criteriaIfNo: ['2.2.1'],
  },
  {
    id: 'auth',
    label: 'Kräver tjänsten inloggning eller autentisering?',
    hint: 'T.ex. inloggning med användarnamn/lösenord, BankID, engångskoder.',
    criteriaIfNo: ['3.3.8'],
  },
  {
    id: 'editor',
    label: 'Innehåller tjänsten ett redigeringsverktyg för att skapa innehåll?',
    hint: 'T.ex. CMS-redaktörer, bloggverktyg, e-postklienter, dokumentredigerare.',
    criteriaIfNo: [],
  },
  {
    id: 'rtc',
    label: 'Stöder tjänsten realtidskommunikation (RTC)?',
    hint: 'T.ex. videosamtal, chatt, VoIP, textning i realtid.',
    criteriaIfNo: [],
  },
  {
    id: 'support',
    label: 'Erbjuder tjänsten support eller hjälpfunktioner?',
    hint: 'T.ex. chattbot, FAQ, supporttelefon, hjälpcenter.',
    criteriaIfNo: [],
  },
  {
    id: 'docs',
    label: 'Erbjuder tjänsten dokumentation eller manualer?',
    hint: 'T.ex. användarguider, API-dokumentation, hjälpartiklar.',
    criteriaIfNo: [],
  },
]

// ─── Derives notApplicable list ───────────────────────────────────────────────

function deriveNotApplicable(answers) {
  const notApplicable = new Set()
  for (const q of QUESTIONS) {
    if (answers[q.id] === false) {
      for (const id of q.criteriaIfNo) {
        notApplicable.add(id)
      }
    }
  }
  return [...notApplicable]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditSetup({ project, onDone, onCancel }) {
  const [step, setStep]       = useState(0) // 0..QUESTIONS.length = summary
  const [answers, setAnswers] = useState({})

  const total      = QUESTIONS.length
  const isSummary  = step === total
  const question   = QUESTIONS[step]
  const progress   = Math.round((step / total) * 100)

  function answer(value) {
    const q = QUESTIONS[step]
    setAnswers(prev => ({ ...prev, [q.id]: value }))
    setStep(s => s + 1)
  }

  function goBack() {
    if (step === 0) { onCancel(); return }
    setStep(s => s - 1)
  }

  function handleStart() {
    const notApplicable = deriveNotApplicable(answers)
    const updatedProject = saveProject({
      ...project,
      auditContext: { answers, notApplicable, setupAt: new Date().toISOString() },
    })
    toast('Granskningskontext sparad')
    onDone(updatedProject)
  }

  const notApplicable = deriveNotApplicable(answers)
  const applicable    = wcag22.filter(c => !notApplicable.includes(c.id))

  return (
    <div className="as-root">
      <div className="as-card">

        {/* ── Header ── */}
        <div className="as-header">
          <button className="as-back-btn" onClick={goBack} aria-label="Gå tillbaka">
            ← Tillbaka
          </button>
          <div className="as-header-text">
            <h1 className="as-title">Guidad granskning</h1>
            <p className="as-subtitle">{project.name} · {project.clientName}</p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {!isSummary && (
          <div className="as-progress-wrap" aria-label={`Fråga ${step + 1} av ${total}`}>
            <div className="as-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="as-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="as-progress-label">{step + 1} / {total}</span>
          </div>
        )}

        {/* ── Question ── */}
        {!isSummary && (
          <div className="as-question-area" key={step}>
            <p className="as-step-label">Fråga {step + 1} av {total}</p>
            <h2 className="as-question">{question.label}</h2>
            {question.hint && (
              <p className="as-hint">{question.hint}</p>
            )}
            <div className="as-answers" role="group" aria-label="Svarsalternativ">
              <button
                className="as-answer-btn as-yes"
                onClick={() => answer(true)}
                autoFocus
              >
                <span className="as-answer-icon" aria-hidden="true">✓</span>
                Ja
              </button>
              <button
                className="as-answer-btn as-no"
                onClick={() => answer(false)}
              >
                <span className="as-answer-icon" aria-hidden="true">✕</span>
                Nej
              </button>
            </div>
          </div>
        )}

        {/* ── Summary ── */}
        {isSummary && (
          <div className="as-summary">
            <h2 className="as-summary-title">Granskningsmål</h2>
            <p className="as-summary-desc">
              Baserat på dina svar är <strong>{applicable.length} av {wcag22.length} WCAG-kriterier</strong> applicerbara på tjänsten.
              {notApplicable.length > 0 && ` ${notApplicable.length} kriterier är markerade som ej applicerbara.`}
            </p>

            <div className="as-summary-cols">
              <div className="as-summary-col">
                <h3 className="as-col-title as-col-yes">
                  Applicerbara <span className="as-col-count">{applicable.length}</span>
                </h3>
                <ul className="as-crit-list">
                  {applicable.slice(0, 20).map(c => (
                    <li key={c.id} className="as-crit-item">
                      <span className="as-crit-id">{c.id}</span>
                      <span className="as-crit-name">{c.nameSwedish}</span>
                      <span className={`badge badge-level-${c.level.toLowerCase()}`}>{c.level}</span>
                    </li>
                  ))}
                  {applicable.length > 20 && (
                    <li className="as-crit-more">…och {applicable.length - 20} till</li>
                  )}
                </ul>
              </div>

              {notApplicable.length > 0 && (
                <div className="as-summary-col">
                  <h3 className="as-col-title as-col-no">
                    Ej applicerbara <span className="as-col-count">{notApplicable.length}</span>
                  </h3>
                  <ul className="as-crit-list">
                    {notApplicable.map(id => {
                      const c = wcag22.find(x => x.id === id)
                      return c ? (
                        <li key={id} className="as-crit-item as-crit-na">
                          <span className="as-crit-id">{c.id}</span>
                          <span className="as-crit-name">{c.nameSwedish}</span>
                        </li>
                      ) : null
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="as-summary-actions">
              <button className="btn btn-secondary" onClick={goBack}>
                ← Ändra svar
              </button>
              <button className="btn btn-primary" onClick={handleStart}>
                Starta granskning →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
