/* SAFE Policy Studio — template engine.
 *
 * TEMPLATE MARKUP (used in assets/js/templates/*.js)
 *   ## Heading            level-1 heading       ### Heading   level-2 heading
 *   - text                bullet                -- text       sub-bullet
 *   | a | b |             table row (first row of a table is the header row)
 *   > text                note (italic, indented)
 *   1.1 text              numbered clause with hanging indent
 *   **bold**              bold text
 *   {{key}}               placeholder: a field of this template, or company.*, doc.*, industry.*
 *   {{key|date}}          filters: date, upper, lower, list, num
 *   [[if COND]] … [[else]] … [[endif]]   conditional block (nestable). COND examples:
 *        tag=insurance | industry=ins-broker | reg=IRDAI | state=Karnataka
 *        headcount>=50 | key | not key | key=yes | key!=no | A && B | A || B
 *   [[pagebreak]]
 * Missing values are printed as a yellow-highlighted [Field label] for the lawyer to complete.
 */
(function (root) {
  const S = (root.SAFE = root.SAFE || {});
  S.TEMPLATES = S.TEMPLATES || {};

  /** Register a drafted template. def = { v: '1.0', fields: [...], body: '...' } */
  S.tpl = (id, def) => { S.TEMPLATES[id] = Object.assign({ v: '1.0', fields: [] }, def); };

  // Client-profile fields, available in every template as company.<key>
  S.COMPANY_FIELDS = [
    { k: 'name', l: 'Legal name of the company', req: true },
    { k: 'short', l: 'Short code for reference numbers (e.g. EIBPL)', req: true },
    { k: 'brand', l: 'Brand / trade name (if different)' },
    { k: 'legalForm', l: 'Legal form', t: 'select', o: ['Private Limited Company', 'Public Limited Company (unlisted)', 'Public Limited Company (listed)', 'One Person Company', 'Limited Liability Partnership', 'Partnership Firm', 'Sole Proprietorship', 'Section 8 Company', 'Society', 'Trust', 'Co-operative Society'], d: 'Private Limited Company' },
    { k: 'cin', l: 'CIN / LLPIN / registration number' },
    { k: 'regAddress', l: 'Registered office address', t: 'textarea' },
    { k: 'offices', l: 'Offices and locations (one per line: City – address)', t: 'textarea' },
    { k: 'states', l: 'States where it employs people (comma-separated)', d: 'Karnataka' },
    { k: 'website', l: 'Website' },
    { k: 'phone', l: 'Phone' },
    { k: 'reminderEmails', l: 'Company email(s) for expiry reminders (comma-separated)', req: true },
    { k: 'contactName', l: 'Client contact person' },
    { k: 'signatoryName', l: 'Authorised signatory name' },
    { k: 'signatoryDesignation', l: 'Authorised signatory designation' },
    { k: 'hrOwner', l: 'HR owner (name and designation)' },
    { k: 'hrEmail', l: 'HR email' },
    { k: 'dpoName', l: 'Data Protection Officer / contact person for data' },
    { k: 'dpoEmail', l: 'Data protection contact email' },
    { k: 'grievanceOfficer', l: 'Grievance Officer (name and designation)' },
    { k: 'grievanceEmail', l: 'Grievance Officer email' },
    { k: 'headcount', l: 'Total headcount', t: 'number' },
    { k: 'headcountWomen', l: 'Number of women employees', t: 'number' },
    { k: 'jurisdiction', l: 'Courts with jurisdiction (city)', d: 'Bengaluru' },
    { k: 'regulators', l: 'Regulators (filled from industry; edit if needed)' },
    { k: 'regNo', l: 'Regulatory licence / registration no. (e.g. IRDAI licence)' },
    { k: 'irdaiRegs', l: 'IRDAI regulations that apply (insurance clients only)', h: 'Leave blank to use: the IRDAI (Insurance Brokers) Regulations, 2018, as amended, and any regulations that replace them. Update when IRDAI notifies new intermediary regulations.' },
  ];

  // Document-control fields on every policy
  S.DOC_FIELDS = [
    { k: 'owner', l: 'Policy owner (function / designation)', d: 'Human Resources' },
    { k: 'approvedBy', l: 'Approved by', d: 'Board of Directors' },
    { k: 'approvalDate', l: 'Approval date', t: 'date' },
    { k: 'effectiveDate', l: 'Effective date', t: 'date' },
    { k: 'expiryDate', l: 'Review / expiry date', t: 'date' },
    { k: 'appliesTo', l: 'Applies to', d: 'All employees, trainees and contract staff' },
    { k: 'classification', l: 'Classification', t: 'select', o: ['Internal', 'Confidential', 'Public'], d: 'Internal' },
  ];

  S.defaultOwner = (item) => ({
    'HR Playbook': 'Human Resources',
    'Data protection (DPDPA)': 'Data Protection Officer',
    'IT and information security': 'Head of IT / Chief Information Security Officer',
    'Corporate governance and compliance': 'Company Secretary / Compliance Officer',
    'Industry-specific': 'Compliance Officer',
  }[item && item.cat] || 'Compliance Officer');

  // Extra fields offered on every document
  const EXTRA_FIELDS = [
    { k: 'additionalClauses', l: 'Additional clauses (optional; uses the same markup)', t: 'textarea', h: 'Added as a final section before the review clause.' },
  ];
  const SKELETON_FIELDS = [
    { k: 'customPurpose', l: 'Purpose of this document', t: 'textarea' },
    { k: 'customBody', l: 'Operative provisions (markup: ## heading, - bullet, 1.1 clause)', t: 'textarea', h: 'This item has no ready template yet. Type or paste the operative clauses here; they will be laid out on the letterhead with document control.' },
  ];

  /** Fields to show for a library item. */
  S.fieldsFor = (itemId) => {
    const t = S.TEMPLATES[itemId];
    if (t) return t.fields.concat(EXTRA_FIELDS);
    return SKELETON_FIELDS.concat(EXTRA_FIELDS);
  };
  S.isDrafted = (itemId) => !!S.TEMPLATES[itemId];

  function skeletonBody(item) {
    const isAgr = item.kind === 'agreement';
    if (isAgr) {
      return [
        'This {{docTitle}} is made on {{doc.effectiveDate|date}} between {{company.name}}, having its registered office at {{company.regAddress}} ("**{{company.brand|default:the Company}}**"), and {{counterpartyName}}, {{counterpartyDescription}} ("**Counterparty**").',
        '## 1. Purpose',
        '{{customPurpose}}',
        '{{customBody}}',
        '## Governing law and jurisdiction',
        'This agreement is governed by the laws of India. The courts at {{company.jurisdiction}} have exclusive jurisdiction.',
        '| For {{company.name}} | For {{counterpartyName}} |',
        '| Signature: ____________________ | Signature: ____________________ |',
        '| Name: {{company.signatoryName}} | Name: {{counterpartySignatory}} |',
        '| Designation: {{company.signatoryDesignation}} | Designation: {{counterpartyDesignation}} |',
        '| Date: | Date: |',
      ].join('\n');
    }
    return [
      '## 1. Purpose',
      '{{customPurpose}}',
      '## 2. Scope',
      'This policy applies to {{doc.appliesTo|lower}} of {{company.name}} at all its locations.',
      '{{customBody}}',
      '## Roles and responsibilities',
      '{{doc.owner}} owns this policy, maintains it and answers questions on it. Managers apply it in their teams. Every person covered by it must read it, acknowledge it and follow it.',
      '## Breach',
      'A breach of this policy may lead to disciplinary action under the Disciplinary Action and Domestic Inquiry Procedure, up to and including termination, without prejudice to any other remedy available in law.',
    ].join('\n');
  }

  function skeletonFields(item) {
    if (item.kind !== 'agreement') return [];
    return [
      { k: 'counterpartyName', l: 'Counterparty name' },
      { k: 'counterpartyDescription', l: 'Counterparty description (entity type, address)', t: 'textarea' },
      { k: 'counterpartySignatory', l: 'Counterparty signatory' },
      { k: 'counterpartyDesignation', l: 'Counterparty signatory designation' },
    ];
  }
  S.fieldsFor = ((orig) => (itemId) => {
    const item = S.itemById(itemId);
    const base = orig(itemId);
    if (!S.TEMPLATES[itemId] && item) return skeletonFields(item).concat(base);
    return base;
  })(S.fieldsFor);

  // ---------------- state laws ----------------
  // Shops and Establishments / holidays laws by state. Figures that vary or change are left
  // as ??highlighted?? text for the advocate to confirm.
  S.STATE_LAWS = {
    'Karnataka': { se: 'Karnataka Shops and Commercial Establishments Act, 1961', hol: 'Karnataka Industrial Employment (National and Festival Holidays) Act, 1963', holNote: 'Compulsory: 26 January, 1 May, 15 August, 2 October and 1 November (Kannada Rajyotsava); other festival holidays ??to be confirmed??' },
    'Telangana': { se: 'Telangana Shops and Establishments Act, 1988', hol: 'Telangana national and festival holidays law ??confirm Act and notification??' },
    'Andhra Pradesh': { se: 'Andhra Pradesh Shops and Establishments Act, 1988', hol: 'Andhra Pradesh national and festival holidays law ??confirm Act and notification??' },
    'Maharashtra': { se: 'Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act, 2017', hol: 'Maharashtra Shops and Establishments Act, 2017 (festival holidays)', holNote: 'National holidays including 1 May (Maharashtra Day) and the paid festival holidays required by the 2017 Act ??confirm number??' },
    'Tamil Nadu': { se: 'Tamil Nadu Shops and Establishments Act, 1947', hol: 'Tamil Nadu Industrial Establishments (National and Festival Holidays) Act, 1958' },
    'Kerala': { se: 'Kerala Shops and Commercial Establishments Act, 1960', hol: 'Kerala Industrial Establishments (National and Festival Holidays) Act, 1958' },
    'Delhi': { se: 'Delhi Shops and Establishments Act, 1954', hol: 'Delhi Shops and Establishments Act, 1954' },
    'Gujarat': { se: 'Gujarat Shops and Establishments (Regulation of Employment and Conditions of Service) Act, 2019', hol: 'Gujarat Shops and Establishments Act, 2019' },
    'West Bengal': { se: 'West Bengal Shops and Establishments Act, 1963', hol: 'West Bengal Shops and Establishments Act, 1963' },
    'Haryana': { se: 'Punjab Shops and Commercial Establishments Act, 1958 (as applicable in Haryana)', hol: 'Haryana national and festival holidays law ??confirm??' },
    'Uttar Pradesh': { se: 'Uttar Pradesh Dookan Aur Vanijya Adhishthan Adhiniyam, 1962', hol: 'Uttar Pradesh Dookan Aur Vanijya Adhishthan Adhiniyam, 1962' },
    'Rajasthan': { se: 'Rajasthan Shops and Commercial Establishments Act, 1958', hol: 'Rajasthan Shops and Commercial Establishments Act, 1958' },
  };
  S.statesOf = (company) => String((company && company.states) || '').split(/,|\n/).map((x) => x.trim()).filter(Boolean);
  S.stateRows = (company, kind) => {
    const states = S.statesOf(company);
    if (!states.length) return '| ??State?? | ??Applicable law?? | ??to be confirmed?? |';
    return states.map((st) => {
      const key = Object.keys(S.STATE_LAWS).find((k) => k.toLowerCase() === st.toLowerCase());
      const law = key ? S.STATE_LAWS[key] : null;
      if (kind === 'holiday') {
        return '| ' + st + ' | ' + (law ? law.hol : '??Holidays law of ' + st + '??') + ' | ' + (law && law.holNote ? law.holNote : '??Compulsory national and festival holidays to be confirmed??') + ' |';
      }
      return '| ' + st + ' | ' + (law ? law.se : '??Shops and Establishments Act of ' + st + '??') + ' | ??Minimum earned, casual and sick leave to be confirmed?? |';
    }).join('\n');
  };

  // ---------------- helpers ----------------
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  S.fmtDate = (iso) => {
    if (!iso) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return iso;
    return `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}`;
  };
  function listJoin(v) {
    const parts = String(v).split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 1) return parts.join('');
    return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
  }
  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  /** Build the rendering context for a document. */
  S.buildContext = (client, doc, item) => {
    const industry = S.industryById(client.industry) || { id: 'other', name: client.industryOther || '', tags: [], reg: [] };
    const company = Object.assign({}, client);
    company.industryName = client.industry === 'other' ? (client.industryOther || 'Other') : industry.name;
    const values = Object.assign({}, doc.values || {});
    const tplDef = S.TEMPLATES[item.id];
    const fields = S.fieldsFor(item.id);
    const labels = {};
    fields.concat(S.COMPANY_FIELDS.map((f) => ({ k: 'company.' + f.k, l: f.l })))
      .concat(S.DOC_FIELDS.map((f) => ({ k: 'doc.' + f.k, l: f.l })))
      .forEach((f) => { labels[f.k] = f.l; });
    // defaults
    const defaulted = new Set();
    fields.forEach((f) => {
      if (values[f.k] !== undefined && values[f.k] !== '') return;
      const d = f.dfn ? f.dfn(company) : f.d;
      if (d === undefined || d === '') return;
      values[f.k] = d;
      defaulted.add(f.k);
    });
    const meta = Object.assign({}, doc.meta || {});
    S.DOC_FIELDS.forEach((f) => { if (!meta[f.k] && f.d) meta[f.k] = f.k === 'owner' ? S.defaultOwner(item) : f.d; });
    meta.ref = doc.ref; meta.version = doc.version; meta.title = item.title;
    return {
      values, company, doc: meta, labels, item, tplDef, defaulted,
      industry: { id: industry.id, name: company.industryName, group: industry.group || '', tags: industry.tags || [], reg: (client.regulators ? String(client.regulators).split(',').map((s) => s.trim()) : industry.reg) || [] },
      docTitle: item.title,
    };
  };

  function lookup(ctx, key) {
    if (key === 'docTitle') return ctx.docTitle;
    if (key.startsWith('company.')) return getPath({ company: ctx.company }, key);
    if (key.startsWith('doc.')) return getPath({ doc: ctx.doc }, key);
    if (key.startsWith('industry.')) return getPath({ industry: ctx.industry }, key);
    return ctx.values[key];
  }

  function condValue(ctx, key) {
    if (key === 'tag') return ctx.industry.tags;
    if (key === 'industry') return [ctx.industry.id];
    if (key === 'reg') return ctx.industry.reg;
    if (key === 'state') return String(ctx.company.states || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (key === 'headcount') return Number(ctx.company.headcount || 0);
    if (key === 'headcountWomen') return Number(ctx.company.headcountWomen || 0);
    return lookup(ctx, key);
  }

  function evalCond(ctx, expr) {
    expr = expr.trim();
    if (expr.includes('||')) return expr.split('||').some((e) => evalCond(ctx, e));
    if (expr.includes('&&')) return expr.split('&&').every((e) => evalCond(ctx, e));
    if (/^not\s+/.test(expr)) return !evalCond(ctx, expr.replace(/^not\s+/, ''));
    const m = /^([\w.]+)\s*(>=|<=|!=|=|>|<)\s*(.+)$/.exec(expr);
    if (!m) {
      const v = condValue(ctx, expr);
      if (Array.isArray(v)) return v.length > 0;
      return !!v && v !== 'no' && v !== 'No' && v !== '0';
    }
    const [, key, op, rhsRaw] = m;
    const v = condValue(ctx, key);
    const rhs = rhsRaw.trim().split('|').map((s) => s.trim().toLowerCase());
    if (op === '=' || op === '!=') {
      const arr = (Array.isArray(v) ? v : [v]).map((x) => String(x == null ? '' : x).toLowerCase());
      const hit = arr.some((x) => rhs.includes(x));
      return op === '=' ? hit : !hit;
    }
    const n = Number(v || 0), r = Number(rhs[0]);
    return op === '>=' ? n >= r : op === '<=' ? n <= r : op === '>' ? n > r : n < r;
  }

  /** Resolve [[if]] blocks; returns array of lines. */
  function resolveConditions(text, ctx) {
    const out = [];
    const stack = [];
    const active = () => stack.every((s) => s.on);
    text.split('\n').forEach((line) => {
      // inline conditions within a single line: [[if X]]a[[else]]b[[endif]]
      if (/\[\[if\s[^\]]+\]\].*\[\[endif\]\]/.test(line)) {
        line = line.replace(/\[\[if\s+([^\]]+)\]\]([\s\S]*?)(?:\[\[else\]\]([\s\S]*?))?\[\[endif\]\]/g,
          (m0, c, a, b) => (evalCond(ctx, c) ? a : (b || '')));
      }
      const t = line.trim();
      let m;
      if ((m = /^\[\[if\s+(.+)\]\]$/.exec(t))) { const parentOn = active(); const c = parentOn && evalCond(ctx, m[1]); stack.push({ on: c, parentOn, done: c }); return; }
      if ((m = /^\[\[elif\s+(.+)\]\]$/.exec(t))) { const s = stack[stack.length - 1]; if (!s) return; if (s.done || !s.parentOn) { s.on = false; } else { s.on = evalCond(ctx, m[1]); s.done = s.on; } return; }
      if (t === '[[else]]') { const s = stack[stack.length - 1]; if (s) { s.on = s.parentOn && !s.done; s.done = true; } return; }
      if (t === '[[endif]]') { stack.pop(); return; }
      if (active()) out.push(line);
    });
    return out;
  }

  /** Inline: placeholders and **bold** -> runs [{text,b,i,hl,br}] */
  function inline(text, ctx, base) {
    base = base || {};
    const runs = [];
    // Track bold across placeholders: pre-split on ** then handle placeholders within segments
    const segs = text.split('**');
    segs.forEach((seg, si) => {
      const bold = si % 2 === 1;
      seg.split(/(\{\{[^}]+\}\}|\?\?[^?]+\?\?)/).forEach((part) => {
        if (!part) return;
        const qm = /^\?\?([^?]+)\?\?$/.exec(part);
        if (qm) { runs.push(Object.assign({}, base, { text: '[' + qm[1] + ']', hl: true, b: base.b || bold })); return; }
        const pm = /^\{\{([^}|]+)(?:\|([^}]+))?\}\}$/.exec(part);
        if (!pm) { runs.push(Object.assign({}, base, { text: part, b: base.b || bold })); return; }
        const key = pm[1].trim();
        const filter = (pm[2] || '').trim();
        let val = lookup(ctx, key);
        let deflt = null;
        if (filter.startsWith('default:')) deflt = filter.slice(8);
        if ((val === undefined || val === null || String(val).trim() === '') && deflt !== null) val = deflt;
        if (val === undefined || val === null || String(val).trim() === '') {
          const label = ctx.labels[key] || key.replace(/^(company|doc)\./, '').replace(/([A-Z])/g, ' $1').toLowerCase();
          runs.push(Object.assign({}, base, { text: '[' + label + ']', hl: true, b: base.b || bold }));
          return;
        }
        val = String(val);
        const conf = ctx.defaulted && ctx.defaulted.has(key) ? { conf: true } : {};
        if (/\?\?[^?]+\?\?/.test(val)) { inline(val.replace(/\n/g, ' '), ctx, Object.assign({}, base, conf, { b: base.b || bold })).forEach((r) => runs.push(r)); return; }
        if (filter === 'date') val = S.fmtDate(val);
        else if (filter === 'upper') val = val.toUpperCase();
        else if (filter === 'lower') val = val.toLowerCase();
        else if (filter === 'list') val = listJoin(val);
        else if (filter === 'num') val = Number(val).toLocaleString('en-IN');
        val.split('\n').forEach((ln, li) => {
          if (li > 0) runs.push({ br: true, text: '' });
          runs.push(Object.assign({}, base, conf, { text: ln, b: base.b || bold }));
        });
      });
    });
    return runs;
  }

  /** Expand multi-line placeholder values that sit alone on a line into separate lines. */
  function expandBlockPlaceholders(lines, ctx) {
    const out = [];
    lines.forEach((line) => {
      const m = /^\s*\{\{(customBody|additionalClauses|customPurpose|[\w.]+Block)\}\}\s*$/.exec(line);
      if (m) {
        const v = lookup(ctx, m[1]);
        if (v && String(v).trim()) { resolveConditions(String(v), ctx).forEach((l) => out.push(l)); return; }
        if (m[1] === 'additionalClauses') return; // optional: drop silently
      }
      out.push(line);
    });
    return out;
  }

  /** Parse lines -> blocks. */
  function toBlocks(lines, ctx) {
    const blocks = [];
    let table = null;
    let noHeader = false;
    const flushTable = () => { if (table) { blocks.push(table); table = null; } };
    lines.forEach((raw) => {
      const line = raw.replace(/\s+$/, '');
      const t = line.trim();
      if (!t) { flushTable(); return; }
      if (t === '[[noheader]]') { flushTable(); noHeader = true; return; }
      if (t.startsWith('|')) {
        const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
        if (cells.every((c) => /^:?-{2,}:?$/.test(c))) return;
        if (!table) { table = { t: 'table', rows: [] }; if (noHeader) { table.header = false; table.shadeFirstCol = true; table.widths = cells.length === 2 ? [0.35, 0.65] : undefined; noHeader = false; } }
        table.rows.push(cells.map((c) => inline(c, ctx)));
        return;
      }
      flushTable();
      let m;
      if (t === '[[pagebreak]]') blocks.push({ t: 'pagebreak' });
      else if ((m = /^####\s+(.*)$/.exec(t))) blocks.push({ t: 'h3', runs: inline(m[1], ctx) });
      else if ((m = /^###\s+(.*)$/.exec(t))) blocks.push({ t: 'h2', runs: inline(m[1], ctx) });
      else if ((m = /^##\s+(.*)$/.exec(t))) blocks.push({ t: 'h1', runs: inline(m[1], ctx) });
      else if ((m = /^--\s+(.*)$/.exec(t)) || (m = /^\s{2,}-\s+(.*)$/.exec(line))) blocks.push({ t: 'bullet', level: 1, runs: inline(m[1], ctx) });
      else if ((m = /^-\s+(.*)$/.exec(t))) blocks.push({ t: 'bullet', level: 0, runs: inline(m[1], ctx) });
      else if ((m = /^>\s?(.*)$/.exec(t))) blocks.push({ t: 'note', runs: inline(m[1], ctx, { i: true }) });
      else if ((m = /^(\d+(?:\.\d+)+)\s+(.*)$/.exec(t))) blocks.push({ t: 'clause', num: m[1], depth: m[1].split('.').length - 1, runs: inline(m[2], ctx) });
      else if ((m = /^\(([a-z]{1,4})\)\s+(.*)$/.exec(t))) blocks.push({ t: 'clause', num: '(' + m[1] + ')', depth: 2, runs: inline(m[2], ctx) });
      else blocks.push({ t: 'p', runs: inline(t, ctx) });
    });
    flushTable();
    return blocks;
  }

  /** Render a document to blocks. */
  S.render = (client, doc) => {
    const item = S.itemById(doc.itemId);
    const ctx = S.buildContext(client, doc, item);
    const def = S.TEMPLATES[item.id];
    let body = def ? def.body : skeletonBody(item);
    body = body.trim() + '\n{{additionalClauses}}';
    if (item.kind === 'policy' && item.cat === 'HR Playbook') {
      body += '\n## Applicable law and transition\nReferences in this policy to the Code on Wages, 2019, the Industrial Relations Code, 2020, the Code on Social Security, 2020 and the Occupational Safety, Health and Working Conditions Code, 2020 (in force from 21 November 2025) include the rules made under them by the Central Government and by each State Government. Where a State has not yet notified its rules under a Code, or a provision has not yet taken effect, the corresponding provisions of the earlier laws and rules continue to apply to the extent they are consistent with the Code. The Shops and Establishments Act of each State where the Company operates continues to apply alongside the Codes. Where any law gives an employee a more favourable right than this policy, that law prevails.';
    }
    if (item.kind === 'policy') {
      body += '\n## Review and amendment\n{{company.name}} will review this policy at least once a year, and earlier if the law or its business changes. {{doc.approvedBy}} approves amendments. The approved version in force is the one on record with {{doc.owner}}; it overrides any earlier version or practice.';
    }
    let lines = resolveConditions(body, ctx);
    lines = expandBlockPlaceholders(lines, ctx);
    const blocks = toBlocks(lines, ctx);
    // number h1 headings that are not already numbered
    let n = 0;
    blocks.forEach((b) => {
      if (b.t === 'clause') {
        // keep clause numbers in step with their section, even when optional sections are switched off
        if (n > 0 && /^\d+(\.\d+)+$/.test(b.num)) b.num = String(n) + b.num.slice(b.num.indexOf('.'));
        return;
      }
      if (b.t !== 'h1') return;
      const first = b.runs[0];
      if (first && /^\d+\.\s/.test(first.text)) { n = parseInt(first.text, 10); return; }
      if (item.kind === 'template') return;
      n += 1;
      b.runs = [{ text: n + '. ' }].concat(b.runs).map((r) => Object.assign({}, r));
    });
    return { item, ctx, blocks, templateVersion: def ? def.v : 'skeleton' };
  };

  /** Count default values not yet confirmed (shown in blue). */
  S.countConfirm = (blocks) => {
    const keys = new Set();
    let c = 0;
    const scan = (runs) => runs.forEach((r) => { if (r.conf && !r.hl) c++; });
    blocks.forEach((b) => { if (b.runs) scan(b.runs); if (b.rows) b.rows.forEach((row) => row.forEach(scan)); });
    void keys;
    return c;
  };

  /** Count unfilled blanks in rendered blocks. */
  S.countBlanks = (blocks) => {
    let c = 0;
    const scan = (runs) => runs.forEach((r) => { if (r.hl) c++; });
    blocks.forEach((b) => {
      if (b.runs) scan(b.runs);
      if (b.rows) b.rows.forEach((row) => row.forEach(scan));
    });
    return c;
  };

  // ---------------- HTML preview ----------------
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const runsHtml = (runs) => runs.map((r) => {
    if (r.br) return '<br>';
    let h = esc(r.text);
    if (r.b) h = '<strong>' + h + '</strong>';
    if (r.i) h = '<em>' + h + '</em>';
    if (r.hl) h = '<mark>' + h + '</mark>';
    else if (r.conf) h = '<mark class="conf" title="SAFE default – confirm or change">' + h + '</mark>';
    return h;
  }).join('');
  S.blocksToHtml = (blocks) => blocks.map((b) => {
    switch (b.t) {
      case 'h1': return '<h3 class="d-h1">' + runsHtml(b.runs) + '</h3>';
      case 'h2': return '<h4 class="d-h2">' + runsHtml(b.runs) + '</h4>';
      case 'h3': return '<h5 class="d-h3">' + runsHtml(b.runs) + '</h5>';
      case 'bullet': return '<p class="d-bullet l' + b.level + '">• ' + runsHtml(b.runs) + '</p>';
      case 'note': return '<p class="d-note">' + runsHtml(b.runs) + '</p>';
      case 'clause': return '<p class="d-clause d' + b.depth + '"><span class="d-num">' + esc(b.num) + '</span><span>' + runsHtml(b.runs) + '</span></p>';
      case 'pagebreak': return '<hr class="d-pb">';
      case 'table': return '<table class="d-table">' + b.rows.map((r, i) => '<tr>' + r.map((c) => (i === 0 ? '<th>' : '<td>') + runsHtml(c) + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</table>';
      default: return '<p>' + runsHtml(b.runs || []) + '</p>';
    }
  }).join('\n');
})(typeof window !== 'undefined' ? window : globalThis);
