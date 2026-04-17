import { useState } from 'react'
import { saveProject } from '../store/storage.js'
import { wcag22 } from '../data/wcag22.js'
import { DIGG_EXTRA_CRITERIA } from '../data/diggManual.js'
import { toast } from './Toast.jsx'

// ─── Question definitions ─────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'video',
    question: 'Förekommer förinspelad video med ljud i tjänsten?',
    hint: 'T.ex. instruktionsvideor, produktdemonstrationer, intervjuer.',
    followUpId: 'videoSilent',
    affects: ['1.2.2', '1.2.3', '1.2.5'],
  },
  {
    id: 'videoSilent',
    question: 'Förekommer video utan ljud (stumfilm)?',
    hint: 'T.ex. animerade GIF-ersättningar, illustrationsfilmer utan tal.',
    isFollowUp: true,
    parentId: 'video',
    affects: [],
  },
  {
    id: 'audio',
    question: 'Förekommer förinspelade ljudklipp (utan video)?',
    hint: 'T.ex. poddar, röstmeddelanden, ljudinspelningar.',
    affects: ['1.2.1'],
  },
  {
    id: 'liveMedia',
    question: 'Förekommer direktsänd video eller ljud?',
    hint: 'T.ex. livesändningar, webbseminarier, direktsänd radio.',
    affects: ['1.2.4'],
  },
  {
    id: 'forms',
    question: 'Förekommer formulär eller inmatningsfält?',
    hint: 'T.ex. kontaktformulär, beställningsformulär, sökfält, registrering.',
    affects: ['1.3.5', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.7', '3.3.8'],
  },
  {
    id: 'tables',
    question: 'Förekommer datatabeller?',
    hint: 'T.ex. prisjämförelser, scheman, statistiktabeller, resultatlistor.',
    affects: [],
  },
  {
    id: 'animation',
    question: 'Förekommer animeringar eller rörligt innehåll?',
    hint: 'T.ex. karuseller, animerade banners, parallaxeffekter, laddningsindikatorer.',
    affects: ['2.2.2', '2.3.1'],
  },
  {
    id: 'autoSound',
    question: 'Spelas ljud upp automatiskt (utan att användaren startar det)?',
    hint: 'T.ex. bakgrundsmusik, videoklipp som startar med ljud vid sidladdning.',
    affects: ['1.4.2'],
  },
  {
    id: 'maps',
    question: 'Förekommer kartor, diagram eller infografik?',
    hint: 'T.ex. Google Maps, SVG-kartor, statistikdiagram, geografiska visualiseringar.',
    affects: ['1.4.11'],
  },
  {
    id: 'touch',
    question: 'Är tjänsten utformad för touchskärmar eller mobila enheter?',
    hint: 'Inkluderar responsiva tjänster som primärt förväntas användas på mobil.',
    affects: ['2.5.1', '2.5.2', '2.5.4', '1.3.4'],
  },
  {
    id: 'dragDrop',
    question: 'Förekommer drag-och-släpp-funktioner?',
    hint: 'T.ex. filuppladdning via drag-och-släpp, sorteringslistor, kanban-brädor.',
    affects: ['2.5.7'],
  },
  {
    id: 'timeouts',
    question: 'Förekommer tidsbegränsade sessioner eller formulär?',
    hint: 'T.ex. sessioner som löper ut vid inaktivitet, tidsbegränsade erbjudanden.',
    affects: ['2.2.1'],
  },
  {
    id: 'auth',
    question: 'Förekommer inloggning eller autentisering?',
    hint: 'T.ex. inloggning med användarnamn/lösenord, BankID, engångskoder.',
    affects: ['3.3.8', '3.3.9'],
  },
  {
    id: 'editor',
    question: 'Är tjänsten ett redigeringsverktyg där användare skapar innehåll?',
    hint: 'T.ex. CMS, bloggsystem, e-postklient, dokumentredigerare.',
    affects: [],
  },
  {
    id: 'rtc',
    question: 'Förekommer tvåvägskommunikation med röst eller video (t.ex. videomöten)?',
    hint: 'T.ex. videosamtal, VoIP, realtidschatt med video.',
    affects: [],
  },
  {
    id: 'support',
    question: 'Har tjänsten en tillhörande supportfunktion eller kundtjänst?',
    hint: 'T.ex. telefonlinje, livechatt, e-postsupport, hjälpcenter.',
    affects: ['12.2.2', '12.2.3', '12.2.4'],
  },
  {
    id: 'docs',
    question: 'Finns det produktdokumentation eller hjälpsidor?',
    hint: 'T.ex. användarguider, API-dokumentation, hjälpartiklar, FAQ.',
    affects: ['12.1.1', '12.1.2'],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveNotApplicable(answers) {
  const naSet = new Set()
  for (const q of QUESTIONS) {
    if (q.isFollowUp) continue
    if (answers[q.id] === false) {
      for (const id of q.affects) naSet.add(id)
    }
  }
  return [...naSet]
}

const ALL_CRITERIA = [...wcag22, ...DIGG_EXTRA_CRITERIA]
function getCriterion(id) { return ALL_CRITERIA.find(c => c.id === id) ?? null }

function getVisibleQuestions(answers) {
  const visible = []
  for (const q of QUESTIONS) {
    if (q.isFollowUp) {
      if (answers[q.parentId] === true) visible.push(q)
    } else {
      visible.push(q)
    }
  }
  return visible
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditSetup({ project, onDone, onCancel }) {
  const [answers, setAnswers] = useState({})
  const [step,    setStep]    = useState(0)

  const visibleQuestions = getVisibleQuestions(answers)
  const total            = visibleQuestions.length
  const isSummary        = step >= total
  const currentQ         = visibleQuestions[step]
  const progress         = Math.round((step / total) * 100)

  function answer(value) {
    const q = visibleQuestions[step]
    setAnswers(prev => ({ ...prev, [q.id]: value }))
    setStep(s => s + 1)
  }

  function goBack() {
    if (step === 0) { onCancel(); return }
    setStep(s => s - 1)
  }

  function handleStart() {
    const notApplicable = deriveNotApplicable(answers)
    const updated = saveProject({
      ...project,
      auditContext: { answers, notApplicable, setupAt: new Date().toISOString() },
    })
    toast('Granskningskontext sparad')
    onDone(updated)
  }

  const notApplicable = deriveNotApplicable(answers)
  const applicable    = wcag22.filter(c => !notApplicable.includes(c.id))

  if (!project) return null

  return (
    <div className="as-root">
      <div className="as-card">

        {/* ── Fixed top: header + progress bar ── */}
        <div className="as-card-top">
          <div className="as-header">
            <button className="as-back-btn" onClick={goBack} aria-label="Gå tillbaka">
              ← Tillbaka
            </button>
            <div className="as-header-text">
              <h1 className="as-title">Guidad granskning</h1>
              <p className="as-subtitle">{project.name} · {project.clientName}</p>
            </div>
          </div>

          {!isSummary && (
            <div
              className="as-progress-wrap"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Fråga ${step + 1} av ${total}`}
            >
              <div className="as-progress-bar">
                <div className="as-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="as-progress-label" aria-hidden="true">{step + 1} / {total}</span>
            </div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="as-body">

          {/* Question step */}
          {!isSummary && currentQ && (
            <div className="as-question-area" key={`q-${step}`}>
              {currentQ.isFollowUp && (
                <p className="as-followup-badge">Följdfråga</p>
              )}
              <p className="as-step-label" aria-hidden="true">Fråga {step + 1} av {total}</p>
              <h2 className="as-question" id="as-question-label">{currentQ.question}</h2>
              {currentQ.hint && (
                <p className="as-hint">{currentQ.hint}</p>
              )}
            </div>
          )}

          {/* Summary */}
          {isSummary && (
            <div className="as-summary">
              <h2 className="as-summary-title">Granskningsmål</h2>
              <p className="as-summary-desc">
                Baserat på dina svar är{' '}
                <strong>{applicable.length} av {wcag22.length} WCAG-kriterier</strong>{' '}
                applicerbara på tjänsten.
                {notApplicable.length > 0 && (
                  <> {notApplicable.length} kriterier markeras automatiskt som N/A.</>
                )}
              </p>

              <div className="as-summary-cols">
                <div className="as-summary-col">
                  <h3 className="as-col-title as-col-yes">
                    Applicerbara <span className="as-col-count">{applicable.length}</span>
                  </h3>
                  <ul className="as-crit-list">
                    {applicable.map(c => (
                      <li key={c.id} className="as-crit-item">
                        <span className="as-crit-id">{c.id}</span>
                        <span className="as-crit-name">{c.nameSwedish}</span>
                        <span className={`badge badge-level-${c.level.toLowerCase()}`}>{c.level}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {notApplicable.length > 0 && (
                  <div className="as-summary-col">
                    <h3 className="as-col-title as-col-no">
                      Ej applicerbara <span className="as-col-count">{notApplicable.length}</span>
                    </h3>
                    <ul className="as-crit-list">
                      {notApplicable.map(id => {
                        const c = getCriterion(id)
                        if (!c) return null
                        const q = QUESTIONS.find(q => q.affects.includes(id))
                        const reason = q
                          ? `Markeras som N/A – ${q.question.toLowerCase().replace('förekommer ', '').replace('?', '')} förekommer ej`
                          : ''
                        return (
                          <li key={id} className="as-crit-item as-crit-na" title={reason}>
                            <span className="as-crit-id">{c.id}</span>
                            <span className="as-crit-name">{c.nameSwedish}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky footer: action buttons ── */}
        <div className="as-footer">
          {!isSummary ? (
            /* Ja / Nej buttons */
            <div className="as-answers" role="group" aria-labelledby="as-question-label">
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
          ) : (
            /* Summary navigation */
            <div className="as-summary-actions">
              <button className="btn btn-secondary" onClick={goBack}>
                ← Ändra svar
              </button>
              <button className="btn btn-primary" onClick={handleStart}>
                Starta granskning med dessa inställningar →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
