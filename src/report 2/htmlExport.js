import { wcag22 } from '../data/wcag22.js'
import { eaaRequirements } from '../data/eaa.js'
import { i18n } from './i18n.js'

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

const SEVERITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 }
const STATUS_KEY     = { open: 'open', 'in-progress': 'inProgress', fixed: 'fixed', 'wont-fix': 'wontFix' }

function getCriterion(id) { return wcag22.find(c => c.id === id) }
function esc(str) { return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function fmtDate(iso) {
  if (!iso) return '–'
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'long' }).format(new Date(iso))
}
function findingId(idx) { return `F-${String(idx + 1).padStart(3, '0')}` }

/* ─── Main export function ───────────────────────────────────────────────────── */

/**
 * @param {object} project
 * @param {object[]} findings
 * @param {object} eaaStatus
 * @param {object} settings  { sections, severities, logo, language }
 * @returns {string}  Complete standalone HTML document
 */
export function buildReportHtml(project, findings, eaaStatus, settings) {
  const lang = settings.language ?? 'sv'
  const t    = i18n[lang] ?? i18n.sv

  // Filter by included severities
  const activeSeverities = Object.entries(settings.severities)
    .filter(([, on]) => on).map(([k]) => k)

  const allFindings = findings
    .filter(f => activeSeverities.includes(f.severity))
    .sort((a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0))

  const openFindings = allFindings.filter(f => f.status !== 'fixed' && f.status !== 'wont-fix')
  const criticalOpen = openFindings.filter(f => f.severity === 'critical')
  const highOpen     = openFindings.filter(f => f.severity === 'high')

  // Counts for distribution bar
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  allFindings.forEach(f => { if (counts[f.severity] !== undefined) counts[f.severity]++ })
  const total = allFindings.length

  // EAA compliance determination
  const openLevelA = openFindings.filter(f => {
    const c = getCriterion(f.wcagCriterionId)
    return c?.level === 'A'
  }).length

  let eaaClass, eaaLabel, eaaDesc
  if (criticalOpen.length > 0 || openLevelA > 0) {
    eaaClass = 'eaa-no'
    eaaLabel = t.eaaNo
    eaaDesc  = `${criticalOpen.length + openLevelA} ${t.eaaNoDesc}`
  } else if (highOpen.length > 0) {
    eaaClass = 'eaa-partial'
    eaaLabel = t.eaaPartial
    eaaDesc  = t.eaaPartialDesc
  } else {
    eaaClass = 'eaa-yes'
    eaaLabel = t.eaaYes
    eaaDesc  = t.eaaYesDesc
  }

  // Risk text
  let riskClass, riskText
  if (criticalOpen.length > 0) {
    riskClass = 'risk-critical'
    riskText  = t.riskTextCritical(criticalOpen.length)
  } else if (highOpen.length > 0) {
    riskClass = 'risk-high'
    riskText  = t.riskTextHigh(highOpen.length)
  } else {
    riskClass = 'risk-ok'
    riskText  = t.riskTextOk()
  }

  // Top 3 urgent (critical first, then high)
  const top3 = [...criticalOpen, ...highOpen].slice(0, 3)

  // EAA requirement fulfilled counts
  function eaaReqStatus(req) {
    const s = eaaStatus[req.id] ?? { checkedItems: [], note: '' }
    const done = s.checkedItems.length
    const total = req.checkItems.length
    if (done === total && total > 0) return { label: t.fulfilled, cls: 'eaa-status-ok', ratio: `${done}/${total}` }
    if (done > 0) return { label: t.partial, cls: 'eaa-status-partial', ratio: `${done}/${total}` }
    return { label: t.notChecked, cls: 'eaa-status-none', ratio: `0/${total}` }
  }

  /* ── Inline CSS ──────────────────────────────────────────────────────────── */
  const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1a1a2e;background:#fff}
.container{max-width:880px;margin:0 auto;padding:40px 48px}
.section{margin-bottom:64px}
h2{font-size:1.4rem;font-weight:700;color:#0d1117;margin-bottom:1.2rem;padding-bottom:.5rem;border-bottom:2px solid #e2e8f0}
h3{font-size:1rem;font-weight:600;color:#374151;margin-bottom:.6rem}
p{margin-bottom:.6rem}

/* Cover */
.cover{padding:80px 48px 60px;border-bottom:4px solid #0969da;display:flex;flex-direction:column;gap:8px}
.cover-logo{max-height:72px;max-width:240px;object-fit:contain;margin-bottom:32px}
.cover-placeholder{width:60px;height:60px;background:#e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:32px}
.cover-title{font-size:2.2rem;font-weight:800;letter-spacing:-.02em;color:#0d1117}
.cover-client{font-size:1.3rem;color:#374151;margin-bottom:36px}
.cover-table{border-collapse:collapse;margin-top:8px}
.cover-table td{padding:4px 16px 4px 0;font-size:14px}
.cover-table .cl{color:#6b7280;font-weight:500;padding-right:20px}
.cover-table .cv{color:#111827;font-weight:600}

/* Badges */
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:12px;font-weight:600;line-height:1.6}
.sev-critical{background:#FFEBEE;color:#B71C1C}
.sev-high{background:#FFF3E0;color:#E65100}
.sev-medium{background:#FFFDE7;color:#F57F17}
.sev-low{background:#E8F5E9;color:#2E7D32}
.badge-eaa{background:#EDE9FE;color:#6F42C1}
.badge-a{background:#DAFBE1;color:#2DA44E}
.badge-aa{background:#DBEAFE;color:#0969DA}
.badge-aaa{background:#EDE9FE;color:#6F42C1}

/* EAA status box */
.eaa-status-box{display:inline-flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:8px;margin-bottom:20px;max-width:620px}
.eaa-no{background:#FFEBEE;color:#B71C1C;border-left:4px solid #D32F2F}
.eaa-partial{background:#FFF3E0;color:#E65100;border-left:4px solid #F57C00}
.eaa-yes{background:#E8F5E9;color:#1B5E20;border-left:4px solid #388E3C}
.eaa-status-icon{font-size:20px;flex-shrink:0;margin-top:2px}
.eaa-status-label{font-weight:700;font-size:15px;display:block}
.eaa-status-desc{font-size:13px;margin-top:3px;opacity:.85}

/* Summary grid */
.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
.summary-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px 20px}
.sev-row{display:flex;align-items:center;gap:8px;margin:5px 0}
.sev-row-label{width:54px;font-size:12px;color:#374151;text-align:right}
.sev-row-track{flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden}
.sev-row-fill{height:100%;border-radius:4px}
.fill-critical{background:#D32F2F}
.fill-high{background:#E65100}
.fill-medium{background:#F57F17}
.fill-low{background:#388E3C}
.sev-row-count{font-size:12px;font-weight:700;width:22px;text-align:right;color:#374151}

/* Top 3 */
.urgent-list{list-style:none;display:flex;flex-direction:column;gap:10px}
.urgent-item{display:flex;align-items:flex-start;gap:12px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}
.urgent-num{width:24px;height:24px;background:#ef4444;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px}
.urgent-body{flex:1}
.urgent-title{font-weight:600;font-size:14px;color:#111827}
.urgent-meta{font-size:12px;color:#6b7280;margin-top:2px}

/* Risk box */
.risk-box{padding:14px 18px;border-left:4px solid;border-radius:0 8px 8px 0;font-size:14px;line-height:1.6;margin-top:12px}
.risk-critical{background:#FFEBEE;border-color:#D32F2F;color:#7f1d1d}
.risk-high{background:#FFF3E0;border-color:#F57C00;color:#7c2d12}
.risk-ok{background:#F0FDF4;border-color:#388E3C;color:#14532d}

/* Finding cards */
.finding-card{border:1px solid #e2e8f0;border-radius:10px;padding:24px;margin-bottom:20px}
.finding-card-critical{border-left:4px solid #D32F2F}
.finding-card-high{border-left:4px solid #E65100}
.finding-card-medium{border-left:4px solid #F57C00}
.finding-card-low{border-left:4px solid #388E3C}
.finding-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;gap:12px}
.finding-id{font-family:monospace;font-size:12px;font-weight:700;color:#6b7280;flex-shrink:0}
.finding-badges{display:flex;gap:5px;flex-wrap:wrap;align-items:center}
.finding-title{font-size:16px;font-weight:700;color:#111827;margin:6px 0 4px}
.finding-url{font-size:12px;font-family:monospace;color:#0969da;word-break:break-all}
.finding-field{margin-top:14px}
.field-label{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.field-value{font-size:14px;color:#374151;line-height:1.6}
.field-value.highlight{background:#f8fafc;border-left:3px solid #e2e8f0;padding:8px 12px;border-radius:0 6px 6px 0;font-size:14px}
.finding-screenshot{margin-top:16px}
.finding-screenshot img{max-width:100%;border:1px solid #e2e8f0;border-radius:6px}
.finding-screenshot-label{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px}

/* Tables */
.data-table{width:100%;border-collapse:collapse;font-size:13px;margin-top:12px}
.data-table th{text-align:left;padding:9px 12px;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#374151;cursor:pointer;user-select:none;white-space:nowrap}
.data-table th:hover{background:#eef2f7}
.data-table td{padding:9px 12px;border-bottom:1px solid #f0f0f0;color:#374151;vertical-align:middle}
.data-table tr:hover td{background:#fafafa}
.data-table tr:last-child td{border-bottom:none}
.mono{font-family:monospace;font-size:12px;font-weight:700}
.sort-icon{margin-left:4px;opacity:.4;font-size:10px}
.th-active .sort-icon{opacity:1}

/* EAA table status */
.eaa-status-ok{color:#16a34a;font-weight:600}
.eaa-status-partial{color:#d97706;font-weight:500}
.eaa-status-none{color:#9ca3af}

/* Divider */
.section-divider{border:none;border-top:1px solid #e2e8f0;margin:48px 0}

/* Footer */
.report-footer{margin-top:64px;padding-top:20px;border-top:2px solid #e2e8f0;font-size:12px;color:#9ca3af;text-align:center}

/* Print */
@media print{
  .no-print{display:none!important}
  body{font-size:11pt;color:#000}
  .container{padding:0}
  .cover{padding:60pt 0 40pt;border-bottom-width:2pt}
  .section{margin-bottom:36pt}
  .page-break{page-break-before:always}
  .finding-card{page-break-inside:avoid;border:1pt solid #ccc!important;border-left-width:4pt!important}
  .data-table th{cursor:default;background:#f0f0f0!important}
  a{color:inherit;text-decoration:none}
  .summary-grid{grid-template-columns:1fr 1fr}
}
@page{size:A4;margin:2cm}
`

  /* ── Sortable table script ─────────────────────────────────────────────────── */
  const sortScript = `
<script>
(function(){
  var tables = document.querySelectorAll('.sortable-table');
  tables.forEach(function(table){
    var state = {col: -1, dir: 1};
    var ths = table.querySelectorAll('th[data-col]');
    ths.forEach(function(th, i){
      th.addEventListener('click', function(){
        var col = parseInt(th.getAttribute('data-col'));
        if(state.col === col){ state.dir *= -1; }
        else { state.col = col; state.dir = 1; }
        ths.forEach(function(h){ h.classList.remove('th-active'); h.querySelector('.sort-icon').textContent = ' ↕'; });
        th.classList.add('th-active');
        th.querySelector('.sort-icon').textContent = state.dir === 1 ? ' ↓' : ' ↑';
        var tbody = table.querySelector('tbody');
        var rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort(function(a,b){
          var av = a.querySelectorAll('td')[col]?.textContent.trim() || '';
          var bv = b.querySelectorAll('td')[col]?.textContent.trim() || '';
          return av.localeCompare(bv, undefined, {numeric:true}) * state.dir;
        });
        rows.forEach(function(r){ tbody.appendChild(r); });
      });
    });
  });
})();
<\/script>`

  /* ── Section renderers ──────────────────────────────────────────────────────── */

  function renderCover() {
    if (!settings.sections.cover) return ''
    const logoHtml = settings.logo
      ? `<img class="cover-logo" src="${settings.logo}" alt="Logotyp" />`
      : `<div class="cover-placeholder" aria-hidden="true">♿</div>`
    return `
<div class="cover section">
  ${logoHtml}
  <div class="cover-title">${esc(t.reportTitle)}</div>
  <div class="cover-client">${esc(project.clientName)}</div>
  <table class="cover-table">
    <tr><td class="cl">${esc(t.preparedFor)}</td><td class="cv">${esc(project.clientName)}</td></tr>
    <tr><td class="cl">${esc(t.auditor)}</td><td class="cv">${esc(project.auditor || '–')}</td></tr>
    <tr><td class="cl">${esc(t.date)}</td><td class="cv">${fmtDate(new Date().toISOString())}</td></tr>
    <tr><td class="cl">${esc(t.wcagVersion)}</td><td class="cv">WCAG ${esc(project.wcagVersion || '2.2')}</td></tr>
    <tr><td class="cl">${esc(t.conformanceTarget)}</td><td class="cv">${esc(project.conformanceTarget || 'AA')}</td></tr>
  </table>
</div>`
  }

  function renderSummary() {
    if (!settings.sections.summary) return ''

    // Severity bar rows
    const sevRows = ['critical','high','medium','low'].map(s => {
      const c = counts[s]
      if (!activeSeverities.includes(s) || !c) return ''
      const pct = total > 0 ? Math.round((c / total) * 100) : 0
      return `<div class="sev-row">
        <span class="sev-row-label">${esc(t[s])}</span>
        <div class="sev-row-track"><div class="sev-row-fill fill-${s}" style="width:${pct}%"></div></div>
        <span class="sev-row-count">${c}</span>
      </div>`
    }).join('')

    // Top 3
    const top3Html = top3.length === 0
      ? `<p style="color:#9ca3af;font-size:13px;">${esc(t.noFindings)}</p>`
      : `<ul class="urgent-list">${top3.map((f, i) => {
          const c = getCriterion(f.wcagCriterionId)
          return `<li class="urgent-item">
            <div class="urgent-num">${i + 1}</div>
            <div class="urgent-body">
              <div class="urgent-title">${esc(f.title || '—')}</div>
              <div class="urgent-meta">
                <span class="badge sev-${f.severity}">${esc(t[f.severity])}</span>
                ${c ? `&nbsp;${esc(c.id)} – ${esc(c.nameSwedish)}` : ''}
                ${f.pageTitle ? `&nbsp;·&nbsp;${esc(f.pageTitle)}` : ''}
              </div>
            </div>
          </li>`}).join('')}</ul>`

    return `
<div class="section page-break">
  <h2>${esc(t.sec2)}</h2>

  <h3>${esc(t.eaaStatus)}</h3>
  <div class="eaa-status-box ${eaaClass}">
    <span class="eaa-status-icon">${eaaClass === 'eaa-yes' ? '✅' : eaaClass === 'eaa-partial' ? '⚠️' : '❌'}</span>
    <div>
      <span class="eaa-status-label">${esc(eaaLabel)}</span>
      <span class="eaa-status-desc">${esc(eaaDesc)}</span>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <h3>${esc(t.findingDistrib)}</h3>
      ${sevRows || `<p style="color:#9ca3af;font-size:13px;">${esc(t.noFindings)}</p>`}
    </div>
    <div class="summary-card">
      <h3>${esc(t.riskAssessment)}</h3>
      <div class="risk-box ${riskClass}">${esc(riskText)}</div>
    </div>
  </div>

  <h3>${esc(t.topActions)}</h3>
  ${top3Html}
</div>`
  }

  function renderFindings() {
    if (!settings.sections.findings) return ''
    if (allFindings.length === 0) {
      return `<div class="section page-break"><h2>${esc(t.sec3)}</h2><p style="color:#9ca3af">${esc(t.noFindings)}</p></div>`
    }

    const cards = allFindings.map((f, i) => {
      const c = getCriterion(f.wcagCriterionId)
      const statusKey = STATUS_KEY[f.status] || 'open'
      const wcagRef = c
        ? `${esc(t.criterionLabel)} ${esc(c.id)} – ${esc(c.nameSwedish)}, ${esc(t.level)} ${esc(c.level)}`
        : f.eaaRequirementId ? `EAA ${esc(f.eaaRequirementId)}` : '–'

      const affectedHtml = (f.affectedUsers || []).length > 0
        ? (f.affectedUsers).map(u => `<span class="badge" style="background:#f3f4f6;color:#374151">${esc(t[u] || u)}</span>`).join(' ')
        : '–'

      const screenshotHtml = f.screenshot
        ? `<div class="finding-screenshot"><div class="finding-screenshot-label">${esc(t.screenshot)}</div><img src="${f.screenshot}" alt="${esc(t.screenshot)}" /></div>`
        : ''

      const custDesc = f.customerDescription
        ? `<div class="finding-field"><div class="field-label">${esc(t.customerDesc)}</div><div class="field-value highlight">${esc(f.customerDescription)}</div></div>`
        : ''

      const fixHtml = f.suggestedFix
        ? `<div class="finding-field"><div class="field-label">${esc(t.suggestedFix)}</div><div class="field-value">${esc(f.suggestedFix)}</div></div>`
        : ''

      return `
<div class="finding-card finding-card-${f.severity}">
  <div class="finding-header">
    <div>
      <div class="finding-badges">
        <span class="finding-id">${findingId(i)}</span>
        <span class="badge sev-${f.severity}">${esc(t[f.severity])}</span>
        ${c ? `<span class="badge badge-${c.level.toLowerCase()}">${esc(c.level)}</span>` : ''}
        ${c?.eaaCritical || f.eaaRequirementId ? `<span class="badge badge-eaa">EAA</span>` : ''}
      </div>
      <div class="finding-title">${esc(f.title || '–')}</div>
      ${f.url ? `<div class="finding-url">${esc(f.url)}${f.pageTitle ? ` – ${esc(f.pageTitle)}` : ''}</div>` : ''}
    </div>
    <span class="badge" style="background:#f3f4f6;color:#6b7280;flex-shrink:0">${esc(t[statusKey] || f.status)}</span>
  </div>

  ${custDesc}

  <div class="finding-field">
    <div class="field-label">${esc(t.affectedUsers)}</div>
    <div class="field-value">${affectedHtml}</div>
  </div>

  <div class="finding-field">
    <div class="field-label">${esc(t.wcagRef)}</div>
    <div class="field-value">${wcagRef}</div>
  </div>

  ${fixHtml}
  ${screenshotHtml}
</div>`
    }).join('\n')

    return `<div class="section page-break"><h2>${esc(t.sec3)}</h2>${cards}</div>`
  }

  function renderTechnical() {
    if (!settings.sections.technical) return ''

    const rows = allFindings.map((f, i) => {
      const c = getCriterion(f.wcagCriterionId)
      const statusKey = STATUS_KEY[f.status] || 'open'
      return `<tr>
        <td class="mono">${findingId(i)}</td>
        <td class="mono">${esc(f.wcagCriterionId || f.eaaRequirementId || '–')}</td>
        <td>${c ? esc(c.nameSwedish) : esc(f.eaaRequirementId || '–')}</td>
        <td>${c ? `<span class="badge badge-${c.level.toLowerCase()}">${esc(c.level)}</span>` : '–'}</td>
        <td><span class="badge sev-${f.severity}">${esc(t[f.severity])}</span></td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(f.url)}">${esc(f.url || '–')}</td>
        <td>${esc(t[statusKey] || f.status)}</td>
      </tr>`
    }).join('\n')

    return `
<div class="section page-break">
  <h2>${esc(t.sec4)} – ${esc(t.techTableTitle)}</h2>
  <table class="data-table sortable-table">
    <thead>
      <tr>
        <th data-col="0">${esc(t.colId)}<span class="sort-icon"> ↕</span></th>
        <th data-col="1">${esc(t.colWcag)}<span class="sort-icon"> ↕</span></th>
        <th data-col="2">${esc(t.colCriterion)}<span class="sort-icon"> ↕</span></th>
        <th data-col="3">${esc(t.colLevel)}<span class="sort-icon"> ↕</span></th>
        <th data-col="4">${esc(t.colSeverity)}<span class="sort-icon"> ↕</span></th>
        <th data-col="5">${esc(t.colPage)}<span class="sort-icon"> ↕</span></th>
        <th data-col="6">${esc(t.colStatus)}<span class="sort-icon"> ↕</span></th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>`
  }

  function renderEaa() {
    if (!settings.sections.eaa) return ''

    const rows = eaaRequirements.map(req => {
      const { label, cls, ratio } = eaaReqStatus(req)
      const s = eaaStatus[req.id] ?? {}
      return `<tr>
        <td><strong>${esc(req.id)}</strong> ${esc(req.title)}</td>
        <td>${esc(req.category)}</td>
        <td class="${cls}">${esc(label)}</td>
        <td>${esc(ratio)}</td>
        <td>${esc(s.note || '')}</td>
      </tr>`
    }).join('\n')

    return `
<div class="section page-break">
  <h2>${esc(t.sec5)}</h2>
  <table class="data-table sortable-table">
    <thead>
      <tr>
        <th data-col="0">${esc(t.colRequirement)}<span class="sort-icon"> ↕</span></th>
        <th data-col="1">${esc(t.colCategory)}<span class="sort-icon"> ↕</span></th>
        <th data-col="2">${esc(t.colCompliance)}<span class="sort-icon"> ↕</span></th>
        <th data-col="3">${esc(t.colChecked)}<span class="sort-icon"> ↕</span></th>
        <th data-col="4">${esc(t.colNote)}<span class="sort-icon"> ↕</span></th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>`
  }

  /* ── Assemble document ───────────────────────────────────────────────────── */
  const body = [
    renderCover(),
    renderSummary(),
    renderFindings(),
    renderTechnical(),
    renderEaa(),
  ].filter(Boolean).join('\n<hr class="section-divider">\n')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(t.reportTitle)} – ${esc(project.clientName)}</title>
  <style>${css}</style>
</head>
<body>
<div class="container">
${body}
<footer class="report-footer">
  ${esc(t.generatedBy)} · ${esc(project.name)} · ${fmtDate(new Date().toISOString())}
</footer>
</div>
${sortScript}
</body>
</html>`
}
