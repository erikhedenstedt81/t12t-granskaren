/**
 * vpatDocxExport.js
 * Generates a Word (.docx) VPAT® 2.5 document from VpatEditor data.
 *
 * Uses the `docx` npm package.  Returns a Promise<Blob> via Packer.toBlob().
 * All user-supplied text (remarks, notes, etc.) is treated as plain text.
 *
 * Supports:
 *   vpat.template === 'wcag22'    → WCAG Edition  (principles 1-4)
 *   vpat.template === 'en301549'  → adds EN 301 549 chapters 9-12
 *
 * Languages: 'en' | 'sv'  (controls section headings and standard terms;
 *                           auditor-written remarks are left as-is)
 */

import {
  Document, Packer,
  Paragraph, TextRun, PageBreak,
  Table, TableRow, TableCell,
  HeadingLevel, AlignmentType,
  WidthType, ShadingType, BorderStyle,
  Footer,
  convertMillimetersToTwip,
} from 'docx'

import { wcag22 }          from '../data/wcag22.js'
import { eaaRequirements } from '../data/eaa.js'
import { I18N }            from './vpatHtmlExport.js'

/* ─── Page layout ────────────────────────────────────────────────────────────── */

// A4 width (11906 DXA) minus 25 mm margins each side (2 × 1417 ≈ 2834 DXA)
const PAGE_W = 9072  // usable width in DXA (twentieths of a point)

const COL = {
  // Three-column criteria tables
  criteria:   Math.round(PAGE_W * 0.40), // 3629
  level:      Math.round(PAGE_W * 0.20), // 1814
  remarks:    PAGE_W - Math.round(PAGE_W * 0.40) - Math.round(PAGE_W * 0.20), // remainder

  // Two-column info / standards tables
  label:      Math.round(PAGE_W * 0.30), // 2722
  value:      PAGE_W - Math.round(PAGE_W * 0.30),

  // Two-column terms table
  term:       Math.round(PAGE_W * 0.25), // 2268
  definition: PAGE_W - Math.round(PAGE_W * 0.25),
}

/* ─── Colours (OOXML hex, no #) ─────────────────────────────────────────────── */

const C = {
  // Criteria row backgrounds
  supports:  'E8F5E9',
  partial:   'FFFDE7',
  no:        'FFEBEE',
  na:        'F5F5F5',
  ne:        'FFFFFF',

  // UI elements
  headerBg:  'E8EAED',
  labelBg:   'F0F4F8',
  accent:    '1558B0',
  black:     '111111',
  gray:      '555555',
  muted:     '888888',
  green:     '1B5E20',
  red:       '880E4F',
  amber:     '7A5200',
}

const ROW_BG = {
  'supports':           C.supports,
  'partially-supports': C.partial,
  'does-not-support':   C.no,
  'not-applicable':     C.na,
  'not-evaluated':      C.ne,
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

/** TableCell shading option */
function bg(hex) {
  return { shading: { type: ShadingType.CLEAR, color: 'auto', fill: hex } }
}

/**
 * Convert a plain-text string (with possible \n) into an array of Paragraph
 * objects suitable for use as TableCell children.
 */
function textParas(str, { size = 20, color = C.black, bold = false, italics = false } = {}) {
  const s = str?.trim()
  if (!s) {
    return [new Paragraph({
      children: [new TextRun({ text: '–', size, color: C.muted, italics: true })],
    })]
  }
  return s.split('\n').map(line =>
    new Paragraph({
      children: [new TextRun({ text: line || ' ', size, color, bold, italics })],
    })
  )
}

/** Table header cell */
function th(text, width) {
  return new TableCell({
    ...bg(C.headerBg),
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 19, color: '333333' })],
    })],
  })
}

/** Regular data cell – optional background, flexible children */
function td(children, width, fill = null) {
  return new TableCell({
    ...(fill ? bg(fill) : {}),
    width: { size: width, type: WidthType.DXA },
    children,
  })
}

/** Spacer paragraph between sections */
function spacer(after = 240) {
  return new Paragraph({ text: '', spacing: { after } })
}

/** Italic note paragraph */
function note(text, color = C.gray) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20, color })],
    spacing: { after: 140 },
  })
}

/* ─── Table builders ─────────────────────────────────────────────────────────── */

function infoTable(vpat, t) {
  const contact = [vpat.contactName, vpat.contactEmail].filter(Boolean).join('\n') || ''
  const rows = [
    [t.fieldProduct,    `${vpat.productName || '–'}${vpat.productVersion ? ' ' + vpat.productVersion : ''}`],
    [t.fieldDate,       vpat.reportDate || '–'],
    [t.fieldContact,    contact],
    [t.fieldNotes,      vpat.notes?.trim() || ''],
    [t.fieldEvalMethods, vpat.evaluationMethods?.trim() || ''],
  ]
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          td([new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })], COL.label, C.labelBg),
          td(textParas(value), COL.value),
        ],
      })
    ),
  })
}

function standardsTable(vpat, t) {
  const isEU = vpat.template === 'en301549'
  const stds = [
    t.wcagStdName,
    ...(isEU ? [t.en301549StdName] : []),
  ]
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [th(t.colStandard, COL.value), th(t.colIncluded, COL.label)],
      }),
      ...stds.map(stdName =>
        new TableRow({
          children: [
            td([new Paragraph({ children: [new TextRun({ text: stdName, size: 20 })] })], COL.value),
            td([new Paragraph({ children: [new TextRun({ text: t.yes, bold: true, color: C.green, size: 20 })] })], COL.label),
          ],
        })
      ),
    ],
  })
}

function termsTable(t) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [th(t.colTerm, COL.term), th(t.colDefinition, COL.definition)],
      }),
      ...Object.entries(t.terms).map(([term, def]) =>
        new TableRow({
          children: [
            td([new Paragraph({ children: [new TextRun({ text: term, bold: true, size: 20 })] })], COL.term, C.labelBg),
            td(textParas(def), COL.definition),
          ],
        })
      ),
    ],
  })
}

function criteriaTable(criteria, vpatCriteria, t, lang) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [th(t.colCriteria, COL.criteria), th(t.colConformance, COL.level), th(t.colRemarks, COL.remarks)],
      }),
      ...criteria.map(c => {
        const entry      = vpatCriteria?.[c.id] ?? {}
        const levelKey   = entry.conformanceLevel ?? 'not-evaluated'
        const fill       = ROW_BG[levelKey]
        const name       = lang === 'sv' ? c.nameSwedish : c.name
        const levelLabel = t.conformance[levelKey] ?? levelKey
        const levelColor = levelKey === 'does-not-support'   ? C.red
                         : levelKey === 'partially-supports' ? C.amber
                         : C.black

        return new TableRow({
          children: [
            td([
              new Paragraph({ children: [
                new TextRun({ text: `${c.id}: `, bold: true, size: 20 }),
                new TextRun({ text: name, size: 20 }),
              ]}),
              new Paragraph({ children: [
                new TextRun({ text: `Level ${c.level}`, size: 17, color: C.muted, italics: true }),
              ]}),
            ], COL.criteria, fill),
            td([new Paragraph({ children: [
              new TextRun({ text: levelLabel, size: 20, bold: levelColor !== C.black, color: levelColor }),
            ]})], COL.level, fill),
            td(textParas(entry.remarks), COL.remarks, fill),
          ],
        })
      }),
    ],
  })
}

function chapter9Table(vpatCriteria, t, lang) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [th(t.colCriteria, COL.criteria), th(t.colConformance, COL.level), th(t.colRemarks, COL.remarks)],
      }),
      ...wcag22.map(c => {
        const entry      = vpatCriteria?.[c.id] ?? {}
        const levelKey   = entry.conformanceLevel ?? 'not-evaluated'
        const fill       = ROW_BG[levelKey]
        const name       = lang === 'sv' ? c.nameSwedish : c.name
        const levelLabel = t.conformance[levelKey] ?? levelKey
        const clause     = `9.${c.id}`

        return new TableRow({
          children: [
            td([
              new Paragraph({ children: [
                new TextRun({ text: `${clause}: `, bold: true, size: 20 }),
                new TextRun({ text: name, size: 20 }),
              ]}),
              new Paragraph({ children: [
                new TextRun({ text: `Level ${c.level}`, size: 17, color: C.muted, italics: true }),
              ]}),
            ], COL.criteria, fill),
            td([new Paragraph({ children: [new TextRun({ text: levelLabel, size: 20 })] })], COL.level, fill),
            td(textParas(entry.remarks), COL.remarks, fill),
          ],
        })
      }),
    ],
  })
}

function chapter12Table(eaaStatus, t) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [th(t.colRequirement, COL.criteria), th(t.colStatus, COL.level), th(t.colRemarks, COL.remarks)],
      }),
      ...eaaRequirements.map(req => {
        const s      = eaaStatus?.[req.id] ?? { checkedItems: [] }
        const done   = s.checkedItems.length
        const total  = req.checkItems.length
        const pct    = total > 0 ? Math.round((done / total) * 100) : 0
        const allOk  = total > 0 && done === total
        const none   = done === 0

        let statusText, fill
        if (allOk)     { statusText = t.statusFulfilled;    fill = C.supports }
        else if (none) { statusText = t.statusNotEvaluated; fill = C.ne }
        else           { statusText = t.statusPartial;      fill = C.partial }

        return new TableRow({
          children: [
            td([
              new Paragraph({ children: [
                new TextRun({ text: `${req.id}: `, bold: true, size: 20 }),
                new TextRun({ text: req.title, size: 20 }),
              ]}),
              new Paragraph({ children: [
                new TextRun({ text: `${pct}% (${done}/${total})`, size: 17, color: C.muted, italics: true }),
              ]}),
            ], COL.criteria, fill),
            td([new Paragraph({ children: [new TextRun({ text: statusText, size: 20 })] })], COL.level, fill),
            td(textParas(s.note), COL.remarks, fill),
          ],
        })
      }),
    ],
  })
}

/* ─── Main export function ───────────────────────────────────────────────────── */

const PRINCIPLES = ['Perceivable', 'Operable', 'Understandable', 'Robust']

/**
 * Build a VPAT® 2.5 Word document.
 *
 * @param {object}      vpat       – VpatEditor data object
 * @param {object}      eaaStatus  – from storage.getEaaStatus(projectId)
 * @param {'en'|'sv'}   lang       – output language
 * @returns {Promise<Blob>}         – .docx blob ready for download
 */
export async function buildVpatDocx(vpat, eaaStatus, lang = 'en') {
  const t           = I18N[lang] ?? I18N.en
  const isEU        = vpat.template === 'en301549'
  const productName = vpat.productName?.trim() || '–'

  /* ── Page footer (every page) ── */
  const footer = new Footer({
    children: [new Paragraph({
      children: [new TextRun({ text: t.footer, size: 17, color: C.muted })],
      alignment: AlignmentType.CENTER,
    })],
  })

  const margin = {
    top:    convertMillimetersToTwip(25),
    bottom: convertMillimetersToTwip(25),
    left:   convertMillimetersToTwip(25),
    right:  convertMillimetersToTwip(25),
  }

  /* ── Cover page ── */
  const coverChildren = [
    new Paragraph({
      children: [new TextRun({ text: t.docTitle(productName), bold: true, size: 52, color: C.black })],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: t.edition, italics: true, size: 28, color: '444444' })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Based on VPAT\u00AE Version 2.5', size: 22, color: C.muted })],
      spacing: { after: 560 },
      border: { bottom: { color: C.accent, style: BorderStyle.SINGLE, size: 12 } },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${t.fieldProduct}:  `, bold: true, size: 22 }),
        new TextRun({ text: productName + (vpat.productVersion ? '  ' + vpat.productVersion : ''), size: 22 }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${t.fieldDate}:  `, bold: true, size: 22 }),
        new TextRun({ text: vpat.reportDate || '–', size: 22 }),
      ],
      spacing: { after: 80 },
    }),
    ...(vpat.contactName || vpat.contactEmail ? [
      new Paragraph({
        children: [
          new TextRun({ text: `${t.fieldContact}:  `, bold: true, size: 22 }),
          new TextRun({ text: [vpat.contactName, vpat.contactEmail].filter(Boolean).join('  ·  '), size: 22 }),
        ],
        spacing: { after: 80 },
      }),
    ] : []),
    new Paragraph({ children: [new PageBreak()] }),
  ]

  /* ── Product information ── */
  const productSection = [
    new Paragraph({ text: t.sectionProductInfo, heading: HeadingLevel.HEADING_1 }),
    infoTable(vpat, t),
    spacer(300),
  ]

  /* ── Applicable Standards ── */
  const standardsSection = [
    new Paragraph({ text: t.sectionStandards, heading: HeadingLevel.HEADING_1 }),
    standardsTable(vpat, t),
    spacer(300),
  ]

  /* ── Table of Terms ── */
  const termsSection = [
    new Paragraph({ text: t.sectionTerms, heading: HeadingLevel.HEADING_1 }),
    note(t.termsIntro),
    termsTable(t),
    spacer(300),
  ]

  /* ── WCAG 2.x Report (one sub-table per principle) ── */
  const wcagSection = [
    new Paragraph({ text: t.sectionWcag, heading: HeadingLevel.HEADING_1 }),
    note(t.wcagNote),
    ...PRINCIPLES.flatMap((principle, idx) => [
      new Paragraph({
        text: `${t.tablePrefix} ${idx + 1}: ${t.principles[principle]}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 140 },
      }),
      criteriaTable(wcag22.filter(c => c.principle === principle), vpat.criteria, t, lang),
      spacer(240),
    ]),
  ]

  /* ── EN 301 549 chapters (EU template only) ── */
  const en301549Section = isEU ? [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ text: t.sectionEN301549, heading: HeadingLevel.HEADING_1 }),
    note(t.en301549Intro),

    /* Chapter 9 */
    new Paragraph({ text: t.ch9Title, heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 140 } }),
    note(t.ch9Note),
    chapter9Table(vpat.criteria, t, lang),
    spacer(240),

    /* Chapter 10 */
    new Paragraph({ text: t.ch10Title, heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: t.ch10Note, size: 20, color: C.gray })], spacing: { after: 280 } }),

    /* Chapter 11 */
    new Paragraph({ text: t.ch11Title, heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: t.ch11Note, size: 20, color: C.gray })], spacing: { after: 280 } }),

    /* Chapter 12 */
    new Paragraph({ text: t.ch12Title, heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 140 } }),
    note(t.ch12Note),
    chapter12Table(eaaStatus, t),
    spacer(240),
  ] : []

  /* ── Assemble document ── */
  const doc = new Document({
    creator:     'Tillgänglighetsgranskaren',
    title:       t.docTitle(productName),
    description: t.edition,
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: { bold: true, size: 30, color: C.accent },
          paragraph: { spacing: { before: 400, after: 160 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: { bold: true, size: 24, color: '333333' },
          paragraph: { spacing: { before: 280, after: 120 } },
        },
      ],
    },
    sections: [{
      properties: { page: { margin } },
      footers:    { default: footer },
      children: [
        ...coverChildren,
        ...productSection,
        ...standardsSection,
        ...termsSection,
        ...wcagSection,
        ...en301549Section,
      ],
    }],
  })

  return Packer.toBlob(doc)
}
