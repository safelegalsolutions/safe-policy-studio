/* SAFE Policy Studio — application. */
(function () {
  const S = window.SAFE;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const todayIso = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const addMonthsIso = (iso, m) => {
    if (!iso || !m) return '';
    const [y, mo, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1 + Number(m), d));
    dt.setUTCDate(dt.getUTCDate() - 1);
    return dt.toISOString().slice(0, 10);
  };
  const daysUntil = (iso) => Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(todayIso() + 'T00:00:00Z')) / 86400000);
  const KIND_CODE = { policy: 'POL', agreement: 'AGR', template: 'FRM' };
  const DEFAULT_REVIEWER = 'Adv. Sandeep Kumar N';

  const st = {
    store: null, db: null, clientId: null, tab: null, docId: null, work: null,
    lib: { q: '', cat: 'All', tags: { M: true, I: true, R: true }, relevantOnly: true, readyOnly: false, selected: new Set() },
    docFilter: 'All', docQ: '', lhCache: {}, busy: false,
  };

  // ---------------------------------------------------------------- utilities
  function toast(msg, kind) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast ' + (kind || ''); t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, kind === 'bad' ? 7000 : 3500);
  }
  function openModal(title, html) { $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html; $('#modal').hidden = false; const f = $('#modalBody input, #modalBody select, #modalBody textarea'); if (f) f.focus(); }
  function closeModal() { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }
  async function run(fn) {
    if (st.busy) { toast('Still working on the previous step – please try again in a moment.'); return; }
    st.busy = true; document.body.style.cursor = 'progress';
    try { await fn(); } catch (e) { console.error(e); toast(e.message || String(e), 'bad'); } finally { st.busy = false; document.body.style.cursor = ''; }
  }
  function saveBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 8000);
  }
  const settings = () => Object.assign({ safeTo: 'info@safelegal.org', safeCc: 'operations@safelegal.org', reminderDaysBefore: 60, reminderIntervalDays: 7, reviewerName: DEFAULT_REVIEWER }, (st.db && st.db.settings) || {});
  const client = () => st.db.clients.find((c) => c.id === st.clientId) || null;
  const clientDocs = (cid) => st.db.docs.filter((d) => d.clientId === (cid || st.clientId));
  const docById = (id) => st.db.docs.find((d) => d.id === id) || null;
  const industryOf = (c) => S.industryById(c && c.industry);
  const fileSafe = (s) => String(s).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();

  function expiryInfo(d) {
    if (!d.issued || !d.issued.expiryDate) return { text: '—', cls: '' };
    const n = daysUntil(d.issued.expiryDate);
    const lim = Number(settings().reminderDaysBefore || 60);
    if (n < 0) return { text: S.fmtDate(d.issued.expiryDate) + ' · expired', cls: 'exp-bad', n };
    if (n <= lim) return { text: S.fmtDate(d.issued.expiryDate) + ' · ' + n + ' days', cls: 'exp-warn', n };
    return { text: S.fmtDate(d.issued.expiryDate), cls: 'exp-ok', n };
  }
  function dueDocs() {
    const lim = Number(settings().reminderDaysBefore || 60);
    return st.db.docs.filter((d) => d.status !== 'Archived' && d.issued && d.issued.expiryDate && daysUntil(d.issued.expiryDate) <= lim)
      .sort((a, b) => a.issued.expiryDate.localeCompare(b.issued.expiryDate));
  }
  const nextMinor = (v) => { const [a, b] = String(v || '1.0').split('.').map(Number); return a + '.' + ((b || 0) + 1); };
  const nextMajor = (v) => { const [a] = String(v || '1.0').split('.').map(Number); return (a + 1) + '.0'; };

  // ---------------------------------------------------------------- boot
  async function boot() {
    st.store = S.makeStore();
    try {
      st.db = await st.store.load();
    } catch (e) {
      console.error(e);
      toast('Could not reach the Google backend: ' + e.message + '. Showing the data in this browser instead; check Settings.', 'bad');
      const c = S.getConnection();
      S.setConnection(Object.assign({}, c, { mode: 'local' }));
      st.store = S.makeStore();
      S.setConnection(c); // keep the Google details so the user can retry from Settings
      st.db = await st.store.load();
    }
    renderAll();
    const due = dueDocs();
    try {
      if (due.length && !sessionStorage.getItem('sps-due-shown')) { sessionStorage.setItem('sps-due-shown', '1'); showReminders(true); }
    } catch (e) { /* ignore */ }
  }

  function renderAll() {
    const g = st.store.mode === 'google';
    const mb = $('#modeBadge');
    mb.textContent = g ? 'Google Drive connected' : 'Demo mode – data in this browser';
    mb.className = 'mode-badge ' + (g ? 'google' : '');
    const n = dueDocs().length;
    const dc = $('#dueCount'); dc.textContent = n; dc.hidden = !n;
    renderSidebar();
    renderMain();
  }

  function renderSidebar() {
    const q = ($('#clientSearch').value || '').toLowerCase();
    const list = st.db.clients.filter((c) => !q || (c.name || '').toLowerCase().includes(q)).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    $('#clientList').innerHTML = list.length ? list.map((c) => {
      const ind = industryOf(c);
      return `<button class="client-item ${c.id === st.clientId ? 'active' : ''}" data-action="open-client" data-id="${c.id}">${esc(c.name || 'Untitled client')}<small>${esc(ind ? ind.name : (c.industryOther || 'Industry not set'))}</small></button>`;
    }).join('') : '<p class="muted small">No clients yet.</p>';
  }

  function renderMain() {
    const m = $('#main');
    if (st.docId && docById(st.docId)) m.innerHTML = viewEditor();
    else if (st.clientId && client()) m.innerHTML = viewClient();
    else m.innerHTML = viewHome();
    if (st.docId) refreshPreview();
    if (st.clientId && !st.docId && st.tab === 'profile') loadLetterheadPreview();
  }

  // ---------------------------------------------------------------- home
  function viewHome() {
    const docs = st.db.docs;
    const issued = docs.filter((d) => d.issued && d.status !== 'Archived').length;
    const due = dueDocs();
    const expired = due.filter((d) => daysUntil(d.issued.expiryDate) < 0).length;
    const drafted = Object.keys(S.TEMPLATES).length;
    return `
      <div class="page-head"><div><div class="eyebrow">Dashboard</div><h1>Policy and agreement studio</h1></div>
      <button class="btn primary" data-action="new-client">+ New client</button></div>
      <div class="stats">
        <div class="stat"><div class="n">${st.db.clients.length}</div><div class="l">Clients</div></div>
        <div class="stat"><div class="n">${docs.length}</div><div class="l">Documents in progress or issued</div></div>
        <div class="stat"><div class="n">${issued}</div><div class="l">In force</div></div>
        <div class="stat warn"><div class="n">${due.length - expired}</div><div class="l">Expiring within ${settings().reminderDaysBefore} days</div></div>
        <div class="stat bad"><div class="n">${expired}</div><div class="l">Expired</div></div>
      </div>
      <div class="card"><div class="spread"><h3>Renewals due</h3><button class="btn small" data-action="open-reminders">Open renewals</button></div>
        ${due.length ? dueTable(due.slice(0, 12)) : '<p class="muted">Nothing is due for renewal in the next ' + settings().reminderDaysBefore + ' days.</p>'}
      </div>
      <div class="card"><h3>How it works</h3>
        <ol class="steps-list">
          <li><b>Add the client</b> with its industry, offices, headcount, reminder email and letterhead (.docx, or an image of the letterhead).</li>
          <li><b>Pick documents</b> from the library of ${S.ITEMS.length} policies, agreements and forms. The industry decides what is suggested; ${drafted} are fully drafted, the rest generate a structured document you complete.</li>
          <li><b>Fill the prompts</b> for each document. Answers are shared across documents, so each detail is typed once. Blanks show in yellow.</li>
          <li><b>Review and issue:</b> an advocate marks each document reviewed before it can be issued as version 1.0. Revisions become 1.1 or 2.0, with the history kept.</li>
          <li><b>Renewals:</b> from ${settings().reminderDaysBefore} days before expiry, a weekly email goes to the client, ${esc(settings().safeTo)} and ${esc(settings().safeCc)} (Google backend).</li>
        </ol>
      </div>`;
  }

  function dueTable(list) {
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Client</th><th>Document</th><th>Ref</th><th>Version</th><th>Expiry</th><th>Last reminder</th><th></th></tr></thead><tbody>${list.map((d) => {
      const c = st.db.clients.find((x) => x.id === d.clientId) || {};
      const e = expiryInfo(d);
      return `<tr><td>${esc(c.name)}</td><td>${esc(d.title)}</td><td>${esc(d.ref)}</td><td>${esc(d.issued.version)}</td><td class="${e.cls}">${e.text}</td><td>${d.lastReminderAt ? S.fmtDate(d.lastReminderAt) : '—'}</td><td><button class="btn small" data-action="open-doc" data-id="${d.id}" data-client="${d.clientId}">Open</button></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  // ---------------------------------------------------------------- client
  function viewClient() {
    const c = client();
    const docs = clientDocs();
    if (!st.tab) st.tab = docs.length ? 'documents' : 'library';
    const ind = industryOf(c);
    const tabs = [['documents', `Documents (${docs.length})`], ['library', 'Add from library'], ['playbook', 'Compile playbook'], ['profile', 'Company profile']];
    let body = '';
    if (st.tab === 'profile') body = viewProfile(c);
    else if (st.tab === 'library') body = viewLibrary(c);
    else if (st.tab === 'playbook') body = viewPlaybook(c);
    else body = viewDocuments(c);
    const missing = [];
    if (!c.industry) missing.push('industry');
    if (!c.letterhead) missing.push('letterhead');
    if (!c.reminderEmails) missing.push('reminder email');
    return `
      <div class="page-head"><div><div class="eyebrow">${esc(ind ? ind.group : 'Client')}</div><h1>${esc(c.name || 'Untitled client')}</h1>
      <div class="muted small">${esc(ind ? ind.name : (c.industryOther || 'Industry not set'))}${c.short ? ' · Ref code ' + esc(c.short) : ''}</div></div></div>
      ${missing.length && st.tab !== 'profile' ? `<div class="notice warn" style="margin-bottom:14px">Complete the company profile: ${missing.join(', ')} missing. <button class="link-btn" data-action="tab" data-tab="profile">Open profile</button></div>` : ''}
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${st.tab === k ? 'active' : ''}" data-action="tab" data-tab="${k}">${l}</button>`).join('')}</div>
      ${body}`;
  }

  function fieldInput(f, value, prefix) {
    const name = (prefix || '') + f.k;
    const v = value === undefined || value === null ? (f.d !== undefined ? f.d : '') : value;
    let input;
    if (f.t === 'textarea') input = `<textarea class="input" data-field="${esc(name)}" rows="3">${esc(v)}</textarea>`;
    else if (f.t === 'select') input = `<select class="input" data-field="${esc(name)}">${f.o.map((o) => `<option ${String(o) === String(v) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    else input = `<input class="input" data-field="${esc(name)}" type="${f.t === 'number' ? 'number' : f.t === 'date' ? 'date' : 'text'}" value="${esc(v)}">`;
    return `<label class="field">${esc(f.l)}${f.req ? ' <span class="req">*</span>' : ''}${input}${f.h ? `<span class="help">${esc(f.h)}</span>` : ''}</label>`;
  }

  function industrySelect(c) {
    return `<label class="field">Industry <span class="req">*</span><select class="input" data-field="industry"><option value="">Select the industry…</option>${S.INDUSTRY_GROUPS.map((g) => `<optgroup label="${esc(g)}">${S.INDUSTRIES.filter((i) => i.group === g).map((i) => `<option value="${i.id}" ${c.industry === i.id ? 'selected' : ''}>${esc(i.name)}</option>`).join('')}</optgroup>`).join('')}</select><span class="help">${S.INDUSTRIES.length} industries in ${S.INDUSTRY_GROUPS.length} groups. The industry decides which policies are suggested and which clauses appear.</span></label>`;
  }

  function viewProfile(c) {
    const lh = c.letterhead;
    const fields = S.COMPANY_FIELDS;
    const ind = industryOf(c);
    return `
      <div class="card" id="profileForm">
        <h3>Company details</h3>
        <div class="grid2">
          ${fields.slice(0, 4).map((f) => fieldInput(f, c[f.k])).join('')}
          ${industrySelect(c)}
          <label class="field" ${c.industry === 'other' ? '' : 'hidden'} id="industryOtherWrap">Describe the industry<input class="input" data-field="industryOther" value="${esc(c.industryOther || '')}"></label>
          ${fields.slice(4).map((f) => (f.t === 'textarea' ? `<div class="span2">${fieldInput(f, c[f.k])}</div>` : fieldInput(f, c[f.k]))).join('')}
        </div>
        ${ind ? `<p class="small muted" style="margin-top:8px">Industry tags: ${ind.tags.map((t) => esc(S.TAG_LABELS[t] || t)).join(', ') || 'none'}.</p>` : ''}
      </div>
      <div class="card">
        <h3>Letterhead and style</h3>
        <p class="muted small">Upload the client's letterhead as a Word file (.docx: its header, footer, logo and margins are kept) or as an image (PNG/JPG: placed full width at the top of each page). All documents are written on it.</p>
        <div class="grid2">
          <div class="dropzone">
            <label class="field">Letterhead (.docx, .png or .jpg)<input type="file" accept=".docx,.png,.jpg,.jpeg" data-upload="letterhead"></label>
            ${lh ? `<p class="small">Current: <b>${esc(lh.name)}</b> (${lh.kind === 'docx' ? 'Word letterhead' : 'image letterhead'})</p>` : '<p class="small muted">No letterhead yet. Documents will have a plain header with the company name.</p>'}
            <div id="lhPreview"></div>
          </div>
          <div class="dropzone">
            <label class="field">Footer image (optional, for image letterheads)<input type="file" accept=".png,.jpg,.jpeg" data-upload="footer"></label>
            ${lh && lh.footer ? `<p class="small">Current: <b>${esc(lh.footer.name)}</b> <button class="link-btn" data-action="remove-footer">Remove</button></p>` : ''}
          </div>
          ${lh && lh.kind === 'docx' ? `<label class="field">Content in the body of the letterhead file<select class="input" data-field="lh.bodyMode">${[['auto', 'Keep only if it has a logo or picture (recommended)'], ['keep', 'Always keep it at the top of page 1'], ['discard', 'Discard it']].map(([v, l]) => `<option value="${v}" ${(lh.bodyMode || 'auto') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
          ${lh && lh.kind === 'image' ? `<label class="field">Image placement<select class="input" data-field="lh.fullBleed"><option value="true" ${lh.fullBleed !== false ? 'selected' : ''}>Full page width (edge to edge)</option><option value="false" ${lh.fullBleed === false ? 'selected' : ''}>Within the page margins</option></select></label>` : ''}
          <label class="field">Body font<input class="input" data-field="font" value="${esc(c.font || 'Calibri')}"></label>
          <label class="field">Heading colour<input class="input" type="color" data-field="accent" value="#${esc((c.accent || '1F3864').replace('#', ''))}"></label>
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn" data-action="test-letterhead">Download a sample page</button>
          ${lh ? '<button class="btn danger small" data-action="remove-letterhead">Remove letterhead</button>' : ''}
        </div>
      </div>
      <div class="row" style="margin-top:16px;justify-content:space-between">
        <button class="btn primary" data-action="save-profile">Save profile</button>
        <button class="btn danger" data-action="delete-client">Delete client</button>
      </div>`;
  }

  async function loadLetterheadPreview() {
    const c = client(); const box = $('#lhPreview');
    if (!c || !box || !c.letterhead || c.letterhead.kind !== 'image') return;
    try {
      const f = await getFileCached(c.letterhead.fileId, c.letterhead.mime);
      const url = URL.createObjectURL(new Blob([f], { type: c.letterhead.mime }));
      box.innerHTML = `<img class="lh-preview" src="${url}" alt="Letterhead preview">`;
    } catch (e) { box.innerHTML = '<p class="small muted">Preview unavailable.</p>'; }
  }

  async function getFileCached(fileId) {
    if (st.lhCache[fileId]) return st.lhCache[fileId];
    const f = await st.store.getFile(fileId);
    st.lhCache[fileId] = f.data;
    return f.data;
  }

  function collectProfile() {
    const c = Object.assign({}, client());
    document.querySelectorAll('#main [data-field]').forEach((el) => {
      const k = el.dataset.field;
      let v = el.value;
      if (k.startsWith('lh.')) {
        if (!c.letterhead) return;
        c.letterhead = Object.assign({}, c.letterhead);
        const kk = k.slice(3);
        c.letterhead[kk] = kk === 'fullBleed' ? v === 'true' : v;
        return;
      }
      if (k === 'accent') v = v.replace('#', '').toUpperCase();
      c[k] = v;
    });
    return c;
  }

  async function saveProfile(silent) {
    const c = collectProfile();
    if (!c.name) throw new Error('Enter the legal name of the company.');
    c.short = (c.short || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    c.updatedAt = new Date().toISOString();
    await st.store.saveClient(c);
    // keep document titles in sync for emails
    if (!silent) toast('Profile saved', 'ok');
    renderAll();
  }

  async function handleUpload(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const c = collectProfile();
    const data = await file.arrayBuffer();
    const isDocx = /\.docx$/i.test(file.name);
    const isImg = /^image\/(png|jpeg)$/.test(file.type) || /\.(png|jpe?g)$/i.test(file.name);
    if (!isDocx && !isImg) throw new Error('Upload a .docx, .png or .jpg file.');
    const mime = isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : (file.type || (/\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg'));
    let width, height;
    if (isImg) {
      const bmp = await createImageBitmap(new Blob([data], { type: mime }));
      width = bmp.width; height = bmp.height;
    }
    if (input.dataset.upload === 'footer' && !isImg) throw new Error('The footer must be an image.');
    const saved = await st.store.putFile({ clientId: c.id, name: file.name, mime, data, folder: 'Letterhead' });
    st.lhCache[saved.fileId] = data;
    if (input.dataset.upload === 'footer') {
      c.letterhead = Object.assign({ kind: 'none', name: 'No letterhead' }, c.letterhead || {}, { footer: { fileId: saved.fileId, name: file.name, mime, width, height } });
    } else {
      const prevFooter = c.letterhead && c.letterhead.footer;
      c.letterhead = { fileId: saved.fileId, name: file.name, mime, kind: isDocx ? 'docx' : 'image', width, height, bodyMode: 'auto', fullBleed: true, footer: isDocx ? undefined : prevFooter };
    }
    await st.store.saveClient(c);
    toast('Letterhead uploaded', 'ok');
    renderAll();
  }

  async function letterheadFor(c) {
    const lh = c.letterhead;
    if (!lh || (!lh.fileId && !(lh.footer && lh.footer.fileId))) return null;
    const out = Object.assign({}, lh);
    if (lh.fileId) out.data = await getFileCached(lh.fileId);
    if (lh.footer && lh.footer.fileId) out.footer = Object.assign({}, lh.footer, { data: await getFileCached(lh.footer.fileId) });
    return out;
  }

  async function buildFor(c, blocks, title) {
    return S.buildDocx(blocks, {
      letterhead: await letterheadFor(c), font: c.font || 'Calibri', accent: c.accent || '1F3864',
      companyName: c.name, title,
    });
  }

  // ---------------------------------------------------------------- library
  function viewLibrary(c) {
    const ind = industryOf(c);
    const L = st.lib;
    const added = new Set(clientDocs().map((d) => d.itemId));
    const q = L.q.toLowerCase();
    const match = (it) => (L.cat === 'All' || it.cat === L.cat) && L.tags[it.tag] && (!q || it.title.toLowerCase().includes(q) || it.sectionTitle.toLowerCase().includes(q))
      && (!L.relevantOnly || S.isRelevant(it, ind)) && (!L.readyOnly || S.isDrafted(it.id));
    const relevantCount = S.ITEMS.filter((it) => S.isRelevant(it, ind)).length;
    let html = `
      <div class="card">
        <div class="lib-toolbar">
          <input class="input" type="search" placeholder="Search ${S.ITEMS.length} policies, agreements and forms" value="${esc(L.q)}" data-lib="q">
          <select class="input" data-lib="cat"><option ${L.cat === 'All' ? 'selected' : ''}>All</option>${S.CATEGORIES.map((k) => `<option ${L.cat === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select>
          <div class="chips">${['M', 'I', 'R'].map((t) => `<button class="chip ${L.tags[t] ? 'on' : ''}" data-action="lib-tag" data-tag="${t}" title="${esc(S.TAGS[t].long)}">${t} · ${S.TAGS[t].label}</button>`).join('')}</div>
        </div>
        <div class="row small">
          <label><input type="checkbox" data-lib="relevantOnly" ${L.relevantOnly ? 'checked' : ''}> Only items relevant to ${esc(ind ? ind.name : 'the industry')} (${relevantCount})</label>
          <label><input type="checkbox" data-lib="readyOnly" ${L.readyOnly ? 'checked' : ''}> Only fully drafted items (${Object.keys(S.TEMPLATES).length})</label>
          <span class="muted">· <span class="tag M">M</span> mandatory by law · <span class="tag I">I</span> industry or regulator-driven · <span class="tag R">R</span> recommended</span>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn small" data-action="lib-select" data-what="M">Select all mandatory</button>
          <button class="btn small" data-action="lib-select" data-what="MI">Select mandatory + industry</button>
          <button class="btn small" data-action="lib-select" data-what="visible">Select all shown</button>
          <button class="btn small ghost" data-action="lib-select" data-what="none">Clear</button>
        </div>
      </div>`;
    S.CATEGORIES.forEach((cat) => {
      const secs = S.SECTIONS.filter((s) => s.cat === cat).map((s) => ({ s, items: s.items.filter(match) })).filter((x) => x.items.length);
      if (!secs.length) return;
      html += `<div class="lib-cat"><h3>${esc(cat)}</h3>`;
      secs.forEach(({ s, items }) => {
        const sel = items.filter((it) => L.selected.has(it.id)).length;
        html += `<details class="lib-sec" ${L.q || secs.length <= 3 || cat === 'HR Playbook' ? 'open' : ''}><summary><span class="sec-title">${esc(s.title)}</span><span class="muted small">${items.length} items${sel ? ' · ' + sel + ' selected' : ''}</span></summary>`;
        items.forEach((it) => {
          const isAdded = added.has(it.id);
          const rel = S.isRelevant(it, ind);
          html += `<label class="lib-item ${rel ? '' : 'irrelevant'}"><input type="checkbox" data-pick="${it.id}" ${isAdded ? 'disabled checked' : L.selected.has(it.id) ? 'checked' : ''}>
            <span>${esc(it.title)}${it.kind !== 'policy' ? ` <span class="muted small">(${it.kind === 'agreement' ? 'agreement' : 'letter / form'})</span>` : ''}</span>
            <span class="meta"><span class="tag ${it.tag}">${it.tag}</span>${S.isDrafted(it.id) ? '<span class="badge ready" title="Fully drafted template">Drafted</span>' : '<span class="badge skeleton" title="Generates a structured document; you add the operative clauses">Structure</span>'}${isAdded ? '<span class="badge added">Added</span>' : ''}</span></label>`;
        });
        html += '</details>';
      });
      html += '</div>';
    });
    html += `<div class="sticky-bar"><span>${L.selected.size} selected</span><button class="btn gold" data-action="lib-add" ${L.selected.size ? '' : 'disabled'}>Add ${L.selected.size || ''} to ${esc(c.name || 'client')}</button></div>`;
    return html;
  }

  function libSelect(what) {
    const c = client(); const ind = industryOf(c);
    const added = new Set(clientDocs().map((d) => d.itemId));
    const L = st.lib;
    if (what === 'none') { L.selected.clear(); return; }
    S.ITEMS.forEach((it) => {
      if (added.has(it.id)) return;
      const rel = S.isRelevant(it, ind);
      if (what === 'M' && it.tag === 'M' && rel) L.selected.add(it.id);
      if (what === 'MI' && (it.tag === 'M' || it.tag === 'I') && rel) L.selected.add(it.id);
    });
    if (what === 'visible') document.querySelectorAll('#main [data-pick]:not(:disabled)').forEach((el) => L.selected.add(el.dataset.pick));
  }

  async function addSelected() {
    const c = Object.assign({}, client());
    if (!c.short) throw new Error('Set the short code for reference numbers in the company profile first.');
    c.serials = Object.assign({}, c.serials || {});
    const now = new Date().toISOString();
    const docs = [];
    const order = S.ITEMS.map((i) => i.id);
    [...st.lib.selected].sort((a, b) => order.indexOf(a) - order.indexOf(b)).forEach((id) => {
      const it = S.itemById(id);
      const key = it.code + '-' + KIND_CODE[it.kind];
      c.serials[key] = (c.serials[key] || 0) + 1;
      const ref = `${c.short}/${it.code}/${KIND_CODE[it.kind]}/${String(c.serials[key]).padStart(3, '0')}`;
      const values = {};
      S.fieldsFor(id).forEach((f) => { if (c.answers && c.answers[f.k] !== undefined) values[f.k] = c.answers[f.k]; });
      docs.push({
        id: S.uid('doc'), clientId: c.id, itemId: id, title: it.title, ref, version: '0.1', status: 'Draft',
        values, meta: { owner: S.defaultOwner(it) }, history: [], createdAt: now, updatedAt: now,
      });
    });
    await st.store.saveClient(c);
    await st.store.saveDocs(docs);
    st.lib.selected.clear();
    st.tab = 'documents';
    toast(docs.length + ' documents added', 'ok');
    renderAll();
  }

  // ---------------------------------------------------------------- documents register
  function viewDocuments(c) {
    const all = clientDocs();
    if (!all.length) return `<div class="card empty"><p>No documents yet for ${esc(c.name)}.</p><button class="btn primary" data-action="tab" data-tab="library">Add from the library</button></div>`;
    const statuses = ['All', 'Draft', 'Under review', 'Advocate reviewed', 'Issued', 'Archived'];
    const q = st.docQ.toLowerCase();
    const order = S.ITEMS.map((i) => i.id);
    const list = all.filter((d) => (st.docFilter === 'All' || d.status === st.docFilter) && (!q || d.title.toLowerCase().includes(q) || (d.ref || '').toLowerCase().includes(q)))
      .sort((a, b) => order.indexOf(a.itemId) - order.indexOf(b.itemId));
    const count = (s) => all.filter((d) => s === 'All' || d.status === s).length;
    return `
      <div class="spread" style="margin-bottom:12px">
        <div class="chips">${statuses.map((s) => `<button class="chip ${st.docFilter === s ? 'on' : ''}" data-action="doc-filter" data-status="${s}">${s} (${count(s)})</button>`).join('')}</div>
        <input class="input" style="max-width:260px" type="search" placeholder="Search documents" value="${esc(st.docQ)}" data-docq>
      </div>
      <div class="card" style="padding:0"><div class="table-wrap"><table class="table"><thead><tr><th>Reference</th><th>Document</th><th></th><th>Version</th><th>Status</th><th>Expiry</th><th></th></tr></thead><tbody>
      ${list.map((d) => {
        const it = S.itemById(d.itemId) || {};
        const e = expiryInfo(d);
        const ver = d.issued && d.status !== 'Issued' && d.status !== 'Archived' ? `${esc(d.issued.version)} in force<br><span class="muted small">v${esc(d.version)} in draft</span>` : esc(d.version);
        return `<tr><td class="small">${esc(d.ref)}</td><td><b>${esc(d.title)}</b><div class="muted small">${esc(it.sectionTitle || '')}</div></td><td><span class="tag ${it.tag}">${it.tag}</span></td><td>${ver}</td><td><span class="status ${esc(d.status)}">${esc(d.status)}</span></td><td class="${e.cls} small">${e.text}</td>
        <td class="row" style="flex-wrap:nowrap"><button class="btn small" data-action="open-doc" data-id="${d.id}">Open</button><button class="btn small ghost" data-action="download-doc" data-id="${d.id}" title="Download Word">⤓</button></td></tr>`;
      }).join('') || '<tr><td colspan="7" class="muted">No documents match.</td></tr>'}
      </tbody></table></div></div>`;
  }

  // ---------------------------------------------------------------- playbook
  function viewPlaybook(c) {
    const docs = clientDocs().filter((d) => d.status !== 'Archived');
    if (!docs.length) return '<div class="card empty"><p>Add documents first.</p></div>';
    const order = S.ITEMS.map((i) => i.id);
    docs.sort((a, b) => order.indexOf(a.itemId) - order.indexOf(b.itemId));
    const hrShare = docs.filter((d) => (S.itemById(d.itemId) || {}).cat === 'HR Playbook').length / docs.length;
    return `
      <div class="card">
        <h3>Compile into one Word document</h3>
        <p class="muted small">Creates a single document on the letterhead with a cover page, a contents table and every selected document, each with its own document control and version history.</p>
        <div class="grid3">
          <label class="field">Title<input class="input" id="pbTitle" value="${hrShare > 0.6 ? 'HR Playbook' : 'Policy Playbook'}"></label>
          <label class="field">Playbook version<input class="input" id="pbVersion" value="1.0"></label>
          <label class="field">Date<input class="input" id="pbDate" type="date" value="${todayIso()}"></label>
        </div>
        <div class="row" style="margin:10px 0">
          <button class="btn small" data-action="pb-select" data-what="issued">Select issued</button>
          <button class="btn small" data-action="pb-select" data-what="all">Select all</button>
          <button class="btn small ghost" data-action="pb-select" data-what="none">Clear</button>
        </div>
        <div style="max-height:420px;overflow:auto;border:1px solid var(--line);border-radius:8px">
        ${docs.map((d) => `<label class="lib-item"><input type="checkbox" data-pb="${d.id}" ${d.status === 'Issued' || !docs.some((x) => x.status === 'Issued') ? 'checked' : ''}><span>${esc(d.title)} <span class="muted small">${esc(d.ref)} · v${esc(d.issued ? d.issued.version : d.version)}</span></span><span class="status ${esc(d.status)}">${esc(d.status)}</span></label>`).join('')}
        </div>
        <div class="row" style="margin-top:14px">
          <button class="btn primary" data-action="pb-generate">Generate playbook (.docx)</button>
          ${st.store.mode === 'google' ? '<label class="small"><input type="checkbox" id="pbDrive" checked> Also save a copy to Google Drive</label>' : ''}
        </div>
        <p class="small muted">Issued documents are compiled as issued. Documents not yet issued carry a draft banner.</p>
      </div>`;
  }

  async function generatePlaybook() {
    const c = client();
    const ids = [...document.querySelectorAll('[data-pb]:checked')].map((el) => el.dataset.pb);
    if (!ids.length) throw new Error('Select at least one document.');
    const order = S.ITEMS.map((i) => i.id);
    const docs = ids.map(docById).filter(Boolean).sort((a, b) => order.indexOf(a.itemId) - order.indexOf(b.itemId)).map(asIssuedView);
    const title = $('#pbTitle').value || 'Policy Playbook';
    const comp = S.composePlaybook(c, docs, { title, version: $('#pbVersion').value || '1.0', date: $('#pbDate').value });
    const blob = await buildFor(c, comp.blocks, title + ' – ' + c.name);
    const name = fileSafe(`${c.short || c.name} ${title} v${$('#pbVersion').value || '1.0'}.docx`);
    saveBlob(blob, name);
    if ($('#pbDrive') && $('#pbDrive').checked) {
      await st.store.putFile({ clientId: c.id, name, mime: blob.type, data: await blob.arrayBuffer(), folder: 'Playbooks' });
      toast('Playbook downloaded and saved to Google Drive', 'ok');
    } else toast(comp.blanks ? `Playbook downloaded – ${comp.blanks} blanks still highlighted` : 'Playbook downloaded', comp.blanks ? '' : 'ok');
  }

  /** For issued documents being revised, compile the version in force. */
  function asIssuedView(d) {
    if (d.issued && d.status !== 'Issued' && d.issued.snapshot) {
      return Object.assign({}, d, { status: 'Issued', version: d.issued.version, values: d.issued.snapshot.values, meta: d.issued.snapshot.meta, customTitle: d.issued.snapshot.customTitle });
    }
    return d;
  }

  // ---------------------------------------------------------------- editor
  function viewEditor() {
    const d = docById(st.docId);
    const c = st.db.clients.find((x) => x.id === d.clientId);
    const it = S.itemById(d.itemId);
    if (!st.work || st.work.id !== d.id) st.work = { id: d.id, values: Object.assign({}, d.values || {}), meta: Object.assign({}, d.meta || {}), customTitle: d.customTitle || '' };
    const w = st.work;
    const fields = S.fieldsFor(d.itemId);
    const docFields = it.kind === 'policy' ? S.DOC_FIELDS : S.DOC_FIELDS.filter((f) => ['effectiveDate', 'expiryDate'].includes(f.k)).map((f) => (f.k === 'effectiveDate' ? Object.assign({}, f, { l: 'Date of document / agreement' }) : Object.assign({}, f, { l: 'Expiry / renewal date (for reminders)' })));
    const steps = ['Draft', 'Under review', 'Advocate reviewed', 'Issued'];
    const actions = [];
    if (d.status === 'Draft') actions.push('<button class="btn" data-action="wf" data-to="Under review">Send for review</button>', '<button class="btn" data-action="wf-reviewed">Mark advocate-reviewed</button>');
    if (d.status === 'Under review') actions.push('<button class="btn" data-action="wf-reviewed">Mark advocate-reviewed</button>', '<button class="btn ghost" data-action="wf" data-to="Draft">Back to draft</button>');
    if (d.status === 'Advocate reviewed') actions.push(`<button class="btn gold" data-action="wf-issue">Issue v${d.issued ? esc(d.version) : '1.0'}</button>`, '<button class="btn ghost" data-action="wf" data-to="Draft">Back to draft</button>');
    if (d.status === 'Issued') actions.push('<button class="btn" data-action="wf-revise">Revise (new version)</button>', '<button class="btn ghost" data-action="wf" data-to="Archived">Archive</button>');
    if (d.status === 'Archived') actions.push('<button class="btn" data-action="wf" data-to="' + (d.issued ? 'Issued' : 'Draft') + '">Restore</button>');
    if (!d.issued && d.status !== 'Issued') actions.push('<button class="btn danger" data-action="delete-doc" style="margin-left:auto">Delete</button>');
    const locked = d.status === 'Issued' || d.status === 'Archived';
    return `
      <div class="page-head">
        <div><button class="link-btn" data-action="back-to-client">← ${esc(c.name)}</button>
          <div class="eyebrow">${esc(it.sectionTitle)} · <span class="tag ${it.tag}">${it.tag}</span> ${S.isDrafted(it.id) ? '' : '· structure only'}</div>
          <h1>${esc(w.customTitle || it.title)}</h1>
          <div class="muted small">${esc(d.ref)} · version ${esc(d.version)}${d.issued && d.status !== 'Issued' ? ' (v' + esc(d.issued.version) + ' in force)' : ''} · <span class="status ${esc(d.status)}">${esc(d.status)}</span>${d.review ? ' · reviewed by ' + esc(d.review.by) + ' on ' + S.fmtDate(d.review.at) : ''}</div>
          <div class="steps" style="margin-top:6px">${steps.map((s, i) => `${i ? '<span class="sep">›</span>' : ''}<span class="${steps.indexOf(d.status) >= i ? 'on' : ''}">${s}</span>`).join('')}</div>
        </div>
        <div class="workflow">
          ${locked ? '' : '<button class="btn primary" data-action="save-doc">Save</button>'}
          <button class="btn" data-action="download-doc" data-id="${d.id}">Download Word</button>
          ${actions.join('')}
        </div>
      </div>
      ${locked ? `<div class="notice info" style="margin-bottom:14px">This version is ${d.status === 'Issued' ? 'issued and locked' : 'archived'}. Use <b>Revise</b> to start a new version; the issued version stays in force until the new one is issued.</div>` : ''}
      <div class="editor">
        <div class="card editor-form" id="docForm">
          <div class="group-title">Document</div>
          <label class="field">Title (change only if the client uses a different name)<input class="input" data-wf="customTitle" value="${esc(w.customTitle)}" placeholder="${esc(it.title)}" ${locked ? 'disabled' : ''}></label>
          ${docFields.map((f) => fieldInput(f, w.meta[f.k], 'meta.')).join('')}
          <div class="group-title">${S.isDrafted(it.id) ? 'Prompts for this document' : 'Content'}</div>
          ${fields.length ? fields.map((f) => fieldInput(f, w.values[f.k], 'val.')).join('') : '<p class="muted small">No extra prompts. Company details come from the profile.</p>'}
          <p class="small muted">Company details (name, address, offices, signatory, data protection contacts) come from the <button class="link-btn" data-action="edit-profile">company profile</button>.</p>
        </div>
        <div>
          <div class="spread small" style="margin-bottom:8px"><span id="blankInfo"></span><span class="muted">Preview – the Word file uses the letterhead</span></div>
          <div class="preview" id="preview"></div>
          ${historyPanel(d)}
        </div>
      </div>`;
  }

  function historyPanel(d) {
    const hist = (d.history || []).slice().reverse();
    const rem = (d.reminderLog || []).slice().reverse();
    return `<div class="card" style="margin-top:16px"><h3>Version history</h3>
      ${hist.length ? `<div class="history-list">${hist.map((h, i) => `<div class="history-item"><div><b>v${esc(h.version)}</b> · ${esc(h.note || '')}<div class="muted small">Effective ${S.fmtDate(h.date)}${h.expiryDate ? ' · expires ' + S.fmtDate(h.expiryDate) : ''} · approved by ${esc(h.approvedBy || '—')} · reviewed by ${esc(h.reviewedBy || '—')}</div></div><button class="btn small" data-action="download-version" data-idx="${hist.length - 1 - i}">Download</button></div>`).join('')}</div>` : '<p class="muted small">Not issued yet. The history starts when version 1.0 is issued.</p>'}
      ${rem.length ? `<h3 style="margin-top:14px">Reminders sent</h3><ul class="small">${rem.map((r) => `<li>${S.fmtDate(r.date)} – ${r.daysLeft < 0 ? 'expired ' + -r.daysLeft + ' days' : r.daysLeft + ' days before expiry'} – to ${esc(r.to)}</li>`).join('')}</ul>` : ''}
    </div>`;
  }

  function workingDoc() {
    const d = docById(st.docId);
    return Object.assign({}, d, { values: st.work.values, meta: st.work.meta, customTitle: st.work.customTitle });
  }

  function blocksToPreview(blocks) {
    return blocks.map((b) => {
      const txt = (b.runs || []).map((r) => esc(r.text)).join('');
      if (b.t === 'title') return `<div class="p-title">${txt}</div>`;
      if (b.t === 'subtitle') return `<div class="p-sub">${txt}</div>`;
      if (b.t === 'banner') return `<div class="p-banner">${txt}</div>`;
      if (b.t === 'spacer') return '<div style="height:8px"></div>';
      if (b.t === 'table' && b.header === false) return S.blocksToHtml([Object.assign({}, b, { rows: [[[]]].concat(b.rows) })]).replace('<tr><th></th></tr>', '');
      return S.blocksToHtml([b]);
    }).join('\n');
  }

  let previewTimer = null;
  function refreshPreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const pv = $('#preview'); if (!pv) return;
      const d = workingDoc(); const c = st.db.clients.find((x) => x.id === d.clientId);
      try {
        const comp = S.composeDocument(c, d);
        pv.innerHTML = blocksToPreview(comp.blocks);
        const bi = $('#blankInfo');
        if (bi) bi.innerHTML = comp.blanks ? `<span class="exp-warn">${comp.blanks} blank${comp.blanks > 1 ? 's' : ''} to complete (highlighted)</span>` : '<span class="exp-ok">No blanks</span>';
      } catch (e) { pv.innerHTML = '<p class="exp-bad">Preview error: ' + esc(e.message) + '</p>'; }
    }, 120);
  }

  async function saveDoc(silent) {
    const d = Object.assign({}, docById(st.docId));
    const w = st.work;
    const changed = JSON.stringify([d.values, d.meta, d.customTitle || '']) !== JSON.stringify([w.values, w.meta, w.customTitle || '']);
    d.values = Object.assign({}, w.values); d.meta = Object.assign({}, w.meta); d.customTitle = w.customTitle || '';
    d.title = d.customTitle || S.itemById(d.itemId).title;
    d.updatedAt = new Date().toISOString();
    if (changed && (d.status === 'Under review' || d.status === 'Advocate reviewed')) {
      d.status = 'Draft'; d.review = null;
      toast('Changes made after review: status set back to Draft', '');
    } else if (!silent) toast('Saved', 'ok');
    await st.store.saveDoc(d);
    // share answers across documents of this client
    const c = Object.assign({}, st.db.clients.find((x) => x.id === d.clientId));
    c.answers = Object.assign({}, c.answers || {});
    Object.keys(d.values).forEach((k) => { if (!/^(custom|additionalClauses)/.test(k)) c.answers[k] = d.values[k]; });
    await st.store.saveClient(c);
    renderAll();
  }

  async function downloadDoc(id) {
    const d = id === st.docId && st.work ? workingDoc() : docById(id);
    const c = st.db.clients.find((x) => x.id === d.clientId);
    const comp = S.composeDocument(c, d);
    const blob = await buildFor(c, comp.blocks, d.title);
    saveBlob(blob, fileSafe(`${d.ref} ${d.customTitle || d.title} v${d.version}.docx`));
    if (comp.blanks) toast(`Downloaded – ${comp.blanks} blanks still highlighted in yellow`);
  }

  async function downloadVersion(idx) {
    const d = docById(st.docId);
    const h = d.history[idx];
    const c = st.db.clients.find((x) => x.id === d.clientId);
    let data, mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (h.fileId) {
      try { const f = await st.store.getFile(h.fileId); data = f.data; } catch (e) { data = null; }
    }
    if (!data) {
      const view = Object.assign({}, d, { status: 'Issued', version: h.version, values: h.values, meta: h.meta, customTitle: h.customTitle, history: d.history.slice(0, idx + 1) });
      const comp = S.composeDocument(c, view);
      data = await (await buildFor(c, comp.blocks, d.title)).arrayBuffer();
    }
    saveBlob(new Blob([data], { type: mime }), fileSafe(`${d.ref} ${h.customTitle || d.title} v${h.version}.docx`));
  }

  // workflow
  async function setStatus(to) {
    await saveDoc(true);
    const d = Object.assign({}, docById(st.docId));
    d.status = to; d.updatedAt = new Date().toISOString();
    if (to === 'Draft') d.review = null;
    await st.store.saveDoc(d);
    toast('Status: ' + to, 'ok');
    renderAll();
  }

  function reviewedDialog() {
    openModal('Mark advocate-reviewed', `
      <p class="muted small">Confirms that an advocate has reviewed this version. It can then be issued. Any later change sends it back to draft.</p>
      <div class="grid2"><label class="field">Reviewed by<input class="input" id="rvBy" value="${esc(settings().reviewerName || DEFAULT_REVIEWER)}"></label>
      <label class="field">Date<input class="input" id="rvAt" type="date" value="${todayIso()}"></label>
      <label class="field span2">Review note (optional)<input class="input" id="rvNote"></label></div>
      <div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="confirm-reviewed">Confirm review</button></div>`);
  }
  async function confirmReviewed() {
    await saveDoc(true);
    const d = Object.assign({}, docById(st.docId));
    d.review = { by: $('#rvBy').value || DEFAULT_REVIEWER, at: $('#rvAt').value || todayIso(), note: $('#rvNote').value };
    d.status = 'Advocate reviewed';
    await st.store.saveDoc(d);
    closeModal(); toast('Marked as reviewed', 'ok'); renderAll();
  }

  function issueDialog() {
    const d = workingDoc();
    const it = S.itemById(d.itemId);
    const c = st.db.clients.find((x) => x.id === d.clientId);
    const comp = S.composeDocument(c, d);
    const ver = d.issued ? d.version : '1.0';
    const eff = d.meta.effectiveDate || todayIso();
    const exp = d.meta.expiryDate || addMonthsIso(eff, it.validityMonths);
    openModal(`Issue version ${ver}`, `
      ${comp.blanks ? `<div class="notice bad" style="margin-bottom:12px">${comp.blanks} blank${comp.blanks > 1 ? 's are' : ' is'} still empty. They will print as highlighted placeholders. Complete them first unless this is intended.</div>` : ''}
      <div class="grid2">
        <label class="field">Version<input class="input" id="isVer" value="${esc(ver)}" readonly></label>
        <label class="field">Effective date<input class="input" id="isEff" type="date" value="${esc(eff)}"></label>
        <label class="field">Expiry / review date<input class="input" id="isExp" type="date" value="${esc(exp)}"><span class="help">Reminders start ${settings().reminderDaysBefore} days before this date${it.validityMonths ? '' : '. Leave blank if it does not expire'}.</span></label>
        <label class="field">Approved by<input class="input" id="isApp" value="${esc(d.meta.approvedBy || (it.kind === 'policy' ? 'Board of Directors' : ''))}"></label>
        <label class="field">Approval date<input class="input" id="isAppDate" type="date" value="${esc(d.meta.approvalDate || eff)}"></label>
        <label class="field">Description of this version<input class="input" id="isNote" value="${esc(d.issued ? (d.revisionNote || '') : 'First issue')}"></label>
      </div>
      <div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn gold" data-action="confirm-issue">Issue and save the Word file</button></div>`);
  }

  async function confirmIssue() {
    await saveDoc(true);
    const d = Object.assign({}, docById(st.docId));
    const c = st.db.clients.find((x) => x.id === d.clientId);
    const ver = $('#isVer').value;
    d.meta = Object.assign({}, d.meta, { effectiveDate: $('#isEff').value, expiryDate: $('#isExp').value, approvedBy: $('#isApp').value, approvalDate: $('#isAppDate').value });
    const entry = {
      version: ver, date: d.meta.effectiveDate, expiryDate: d.meta.expiryDate, note: $('#isNote').value, approvedBy: d.meta.approvedBy,
      reviewedBy: d.review ? d.review.by : '', issuedAt: new Date().toISOString(), values: Object.assign({}, d.values), meta: Object.assign({}, d.meta), customTitle: d.customTitle || '',
      templateVersion: (S.TEMPLATES[d.itemId] || {}).v || 'skeleton',
    };
    d.version = ver; d.status = 'Issued';
    d.history = (d.history || []).concat([entry]);
    const comp = S.composeDocument(c, d);
    const blob = await buildFor(c, comp.blocks, d.title);
    const name = fileSafe(`${d.ref} ${d.customTitle || d.title} v${ver}.docx`);
    if (st.store.mode === 'google') {
      const saved = await st.store.putFile({ clientId: c.id, name, mime: blob.type, data: await blob.arrayBuffer(), folder: 'Issued' });
      entry.fileId = saved.fileId; entry.fileUrl = saved.url;
    }
    d.issued = { version: ver, effectiveDate: d.meta.effectiveDate, expiryDate: d.meta.expiryDate, fileId: entry.fileId || null, snapshot: { values: entry.values, meta: entry.meta, customTitle: entry.customTitle } };
    d.lastReminderAt = null; d.revisionNote = '';
    d.updatedAt = new Date().toISOString();
    await st.store.saveDoc(d);
    st.work = null;
    closeModal();
    saveBlob(blob, name);
    toast(`Version ${ver} issued`, 'ok');
    renderAll();
  }

  function reviseDialog() {
    const d = docById(st.docId);
    openModal('Start a new version', `
      <p class="muted small">Version ${esc(d.version)} stays in force (and keeps its renewal reminders) until the new version is issued.</p>
      <label class="field"><span><input type="radio" name="rvKind" value="minor" checked> Minor change → v${nextMinor(d.version)} <span class="muted">(corrections, names, contact details, changes in law with no discretion)</span></span></label>
      <label class="field"><span><input type="radio" name="rvKind" value="major"> Substantive change → v${nextMajor(d.version)} <span class="muted">(needs fresh approval)</span></span></label>
      <label class="field">What is changing?<input class="input" id="rvChange" placeholder="e.g. Annual review; leave entitlement increased"></label>
      <div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="confirm-revise">Start new version</button></div>`);
  }
  async function confirmRevise() {
    const d = Object.assign({}, docById(st.docId));
    const kind = (document.querySelector('input[name="rvKind"]:checked') || {}).value;
    d.version = kind === 'major' ? nextMajor(d.version) : nextMinor(d.version);
    d.status = 'Draft'; d.review = null; d.revisionNote = $('#rvChange').value || (kind === 'major' ? 'Substantive revision' : 'Minor revision');
    d.meta = Object.assign({}, d.meta, { effectiveDate: '', expiryDate: '', approvalDate: '' });
    d.updatedAt = new Date().toISOString();
    await st.store.saveDoc(d);
    st.work = null; closeModal(); toast('Draft v' + d.version + ' started', 'ok'); renderAll();
  }

  // ---------------------------------------------------------------- reminders
  function showReminders(auto) {
    const due = dueDocs();
    const g = st.store.mode === 'google';
    const s = settings();
    openModal(auto ? `${due.length} document${due.length === 1 ? '' : 's'} due for renewal` : 'Renewals and reminders', `
      <p class="small muted">Documents in force that expire within ${s.reminderDaysBefore} days, or have expired. ${g ? `The Google backend emails each client every ${s.reminderIntervalDays} days at about 9 a.m. IST: to the client's reminder email and ${esc(s.safeTo)}, with a copy to ${esc(s.safeCc)}.` : 'Reminder emails are sent by the Google backend. Connect it in Settings to switch them on.'}</p>
      ${due.length ? dueTable(due) : '<p class="muted">Nothing is due.</p>'}
      <div class="modal-actions">
        ${g ? '<button class="btn" data-action="rem-dry">Preview who will be emailed</button><button class="btn primary" data-action="rem-send">Send due reminders now</button>' : '<button class="btn primary" data-action="open-settings">Connect Google backend</button>'}
      </div><div id="remResult" class="small" style="margin-top:10px"></div>`);
  }
  async function runRem(dry) {
    const r = await st.store.runReminders(dry);
    $('#remResult').innerHTML = r.emails ? `<div class="notice info">${dry ? 'Would send' : 'Sent'} ${r.emails} email${r.emails > 1 ? 's' : ''}:<ul>${r.details.map((x) => `<li><b>${esc(x.client)}</b> → ${esc(x.to.join(', '))} (cc ${esc(x.cc)}): ${esc(x.documents.join('; '))}</li>`).join('')}</ul></div>` : '<div class="notice info">No reminders are due today (each document is reminded once a week).</div>';
    if (!dry) { st.db = await st.store.load(); renderAll(); }
  }

  // ---------------------------------------------------------------- settings
  function showSettings() {
    const con = S.getConnection();
    const s = settings();
    openModal('Settings', `
      <h3>Storage</h3>
      <div class="row" style="margin:6px 0 10px">
        <label><input type="radio" name="mode" value="local" ${con.mode !== 'google' ? 'checked' : ''}> Demo – keep data in this browser</label>
        <label><input type="radio" name="mode" value="google" ${con.mode === 'google' ? 'checked' : ''}> Google Drive backend (needed for emails and team use)</label>
      </div>
      <div class="grid2">
        <label class="field span2">Apps Script web app URL<input class="input" id="setUrl" value="${esc(con.url || '')}" placeholder="https://script.google.com/macros/s/…/exec"></label>
        <label class="field span2">API key (from the setup log)<input class="input" id="setKey" type="password" value="${esc(con.key || '')}"></label>
      </div>
      <div class="row" style="margin-top:8px"><button class="btn small" data-action="test-conn">Test connection</button><span id="connResult" class="small"></span></div>
      <h3 style="margin-top:18px">Reminders</h3>
      <div class="grid2">
        <label class="field">Reminder email (to)<input class="input" id="setTo" value="${esc(s.safeTo)}"></label>
        <label class="field">Copy (cc)<input class="input" id="setCc" value="${esc(s.safeCc)}"></label>
        <label class="field">Start reminding (days before expiry)<input class="input" id="setDays" type="number" value="${esc(s.reminderDaysBefore)}"></label>
        <label class="field">Repeat every (days)<input class="input" id="setInt" type="number" value="${esc(s.reminderIntervalDays)}"></label>
        <label class="field">Default reviewing advocate<input class="input" id="setRev" value="${esc(s.reviewerName)}"></label>
        <label class="field">Address of this app (for links in emails)<input class="input" id="setApp" value="${esc(s.appUrl || location.href.split('#')[0])}"></label>
      </div>
      <p class="small muted">The client's own email is taken from each company profile.</p>
      <h3 style="margin-top:18px">Data</h3>
      <div class="row"><button class="btn small" data-action="export-data">Export backup (.json)</button>
      ${st.store.mode === 'local' ? '<label class="btn small">Import backup<input type="file" accept=".json" data-import hidden></label>' : '<button class="btn small" data-action="migrate">Copy data from this browser to Google Drive</button>'}</div>
      <div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="save-settings">Save settings</button></div>`);
  }

  async function saveSettings() {
    const mode = (document.querySelector('input[name="mode"]:checked') || {}).value || 'local';
    const con = { mode, url: $('#setUrl').value.trim(), key: $('#setKey').value.trim() };
    if (mode === 'google' && (!con.url || !con.key)) throw new Error('Enter the web app URL and API key.');
    const s = { safeTo: $('#setTo').value.trim(), safeCc: $('#setCc').value.trim(), reminderDaysBefore: Number($('#setDays').value || 60), reminderIntervalDays: Number($('#setInt').value || 7), reviewerName: $('#setRev').value.trim(), appUrl: $('#setApp').value.trim(), senderName: 'SAFE Legal Solutions – Policy Studio' };
    const prev = S.getConnection();
    S.setConnection(con);
    if (prev.mode !== con.mode || prev.url !== con.url || prev.key !== con.key) {
      st.store = S.makeStore();
      st.db = await st.store.load();
      st.clientId = null; st.docId = null; st.work = null;
    }
    await st.store.saveSettings(Object.assign({}, st.db.settings || {}, s));
    closeModal(); toast('Settings saved', 'ok'); renderAll();
  }

  async function migrateToGoogle() {
    const ls = (() => { const c = S.getConnection(); S.setConnection({ mode: 'local' }); const s = S.makeStore(); S.setConnection(c); return s; })();
    const ldb = await ls.load();
    if (!ldb.clients.length) throw new Error('There is no data in this browser to copy.');
    let files = 0;
    for (const c0 of ldb.clients) {
      const c = JSON.parse(JSON.stringify(c0));
      await st.store.saveClient(Object.assign({}, c, { letterhead: null }));
      if (c.letterhead) {
        for (const part of [c.letterhead, c.letterhead.footer].filter((p) => p && p.fileId)) {
          const f = await ls.getFile(part.fileId);
          const saved = await st.store.putFile({ clientId: c.id, name: f.name, mime: f.mime, data: f.data, folder: 'Letterhead' });
          part.fileId = saved.fileId; files++;
        }
        await st.store.saveClient(c);
      }
    }
    const docs = ldb.docs.map((d) => Object.assign({}, d, { history: (d.history || []).map((h) => Object.assign({}, h, { fileId: null })), issued: d.issued ? Object.assign({}, d.issued, { fileId: null }) : d.issued }));
    for (let i = 0; i < docs.length; i += 25) await st.store.saveDocs(docs.slice(i, i + 25));
    st.db = await st.store.load();
    closeModal(); toast(`Copied ${ldb.clients.length} clients, ${docs.length} documents and ${files} letterhead files`, 'ok'); renderAll();
  }

  // ---------------------------------------------------------------- new client
  function newClientDialog() {
    openModal('New client', `
      <div class="grid2">
        <label class="field span2">Legal name of the company <span class="req">*</span><input class="input" id="ncName" placeholder="e.g. Ethika Insurance Broking Private Limited"></label>
        <label class="field">Short code for reference numbers <span class="req">*</span><input class="input" id="ncShort" placeholder="e.g. EIBPL"></label>
        <label class="field">Company email(s) for reminders<input class="input" id="ncEmail" placeholder="hr@client.com"></label>
        <div class="span2">${industrySelect({}).replace('data-field="industry"', 'id="ncInd"')}</div>
      </div>
      <div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="create-client">Create client</button></div>`);
    $('#ncName').addEventListener('input', (e) => {
      const sc = $('#ncShort');
      if (sc.dataset.touched) return;
      sc.value = e.target.value.split(/\s+/).filter((w) => w && !/^(and|of|the|&)$/i.test(w)).map((w) => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    });
    $('#ncShort').addEventListener('input', (e) => { e.target.dataset.touched = '1'; });
  }
  async function createClient() {
    const name = $('#ncName').value.trim();
    const short = $('#ncShort').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!name || !short) throw new Error('Enter the company name and short code.');
    const ind = S.industryById($('#ncInd').value);
    const c = { id: S.uid('client'), name, short, industry: $('#ncInd').value, reminderEmails: $('#ncEmail').value.trim(), regulators: ind ? ind.reg.join(', ') : '', jurisdiction: 'Bengaluru', states: 'Karnataka', legalForm: 'Private Limited Company', font: 'Calibri', accent: '1F3864', createdAt: new Date().toISOString() };
    await st.store.saveClient(c);
    closeModal(); st.clientId = c.id; st.docId = null; st.tab = 'profile'; st.lib.selected.clear();
    toast('Client created – complete the profile and upload the letterhead', 'ok'); renderAll();
  }

  // ---------------------------------------------------------------- events
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) { if (e.target.id === 'modal') closeModal(); return; }
    const a = el.dataset.action;
    const H = {
      'go-home': () => { st.clientId = null; st.docId = null; st.work = null; renderAll(); },
      'new-client': newClientDialog,
      'create-client': () => run(createClient),
      'open-client': () => { st.clientId = el.dataset.id; st.docId = null; st.work = null; st.tab = null; st.lib.selected.clear(); renderAll(); $('#main').focus(); },
      'tab': () => { st.tab = el.dataset.tab; st.docId = null; renderAll(); },
      'save-profile': () => run(() => saveProfile()),
      'delete-doc': () => run(async () => {
        const d = docById(st.docId);
        if (!d || d.issued) return;
        if (!confirm(`Delete "${d.customTitle || d.title || 'this document'}" (${d.ref || 'draft'}) from ${client().name}? It has never been issued, so nothing is kept. You can add it again from the library.`)) return;
        await st.store.deleteDoc(d.id); st.docId = null; st.work = null; st.tab = 'documents'; renderAll();
      }),
      'delete-client': () => run(async () => {
        const c = client();
        if (!confirm(`Delete ${c.name} and all its ${clientDocs().length} documents from the studio? Files already on Google Drive are not deleted.`)) return;
        await st.store.deleteClient(c.id); st.clientId = null; renderAll();
      }),
      'remove-letterhead': () => run(async () => { const c = collectProfile(); c.letterhead = null; await st.store.saveClient(c); renderAll(); }),
      'remove-footer': () => run(async () => { const c = collectProfile(); if (c.letterhead) { c.letterhead = Object.assign({}, c.letterhead); delete c.letterhead.footer; } await st.store.saveClient(c); renderAll(); }),
      'test-letterhead': () => run(async () => {
        await saveProfile(true);
        const c = client();
        const sample = { itemId: 'hr-code-of-conduct', ref: (c.short || 'XX') + '/HR/POL/000', version: '0.1', status: 'Draft', values: {}, meta: {} };
        const comp = S.composeDocument(c, sample);
        saveBlob(await buildFor(c, comp.blocks, 'Sample'), fileSafe(`${c.short || 'Sample'} letterhead test.docx`));
      }),
      'edit-profile': () => { st.docId = null; st.work = null; st.tab = 'profile'; renderAll(); },
      'lib-tag': () => { st.lib.tags[el.dataset.tag] = !st.lib.tags[el.dataset.tag]; renderMain(); },
      'lib-select': () => { libSelect(el.dataset.what); renderMain(); },
      'lib-add': () => run(addSelected),
      'doc-filter': () => { st.docFilter = el.dataset.status; renderMain(); },
      'open-doc': () => { if (el.dataset.client) st.clientId = el.dataset.client; closeModal(); st.docId = el.dataset.id; st.work = null; renderAll(); window.scrollTo(0, 0); },
      'back-to-client': () => { st.docId = null; st.work = null; st.tab = 'documents'; renderAll(); },
      'download-doc': () => run(() => downloadDoc(el.dataset.id)),
      'download-version': () => run(() => downloadVersion(Number(el.dataset.idx))),
      'save-doc': () => run(() => saveDoc()),
      'wf': () => run(() => setStatus(el.dataset.to)),
      'wf-reviewed': () => run(async () => { await saveDoc(true); reviewedDialog(); }),
      'confirm-reviewed': () => run(confirmReviewed),
      'wf-issue': () => run(async () => { issueDialog(); }),
      'confirm-issue': () => run(confirmIssue),
      'wf-revise': reviseDialog,
      'confirm-revise': () => run(confirmRevise),
      'pb-select': () => { document.querySelectorAll('[data-pb]').forEach((cb) => { const d = docById(cb.dataset.pb); cb.checked = el.dataset.what === 'all' || (el.dataset.what === 'issued' && d && (d.status === 'Issued' || d.issued)); }); },
      'pb-generate': () => run(generatePlaybook),
      'open-reminders': () => showReminders(false),
      'rem-dry': () => run(() => runRem(true)),
      'rem-send': () => run(() => runRem(false)),
      'open-settings': showSettings,
      'save-settings': () => run(saveSettings),
      'test-conn': () => run(async () => {
        const g = new S.GoogleStore($('#setUrl').value.trim(), $('#setKey').value.trim());
        const r = await g.ping();
        $('#connResult').innerHTML = `<span class="exp-ok">Connected. Email quota left today: ${r.quota}</span>`;
      }),
      'export-data': () => run(async () => { saveBlob(new Blob([await st.store.exportAll()], { type: 'application/json' }), `safe-policy-studio-backup-${todayIso()}.json`); }),
      'migrate': () => run(migrateToGoogle),
      'close-modal': closeModal,
    };
    if (H[a]) { e.preventDefault(); H[a](); }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'clientSearch') { renderSidebar(); return; }
    if (t.dataset.lib === 'q') { st.lib.q = t.value; const pos = t.selectionStart; renderMain(); const n = document.querySelector('[data-lib="q"]'); n.focus(); n.setSelectionRange(pos, pos); return; }
    if (t.hasAttribute('data-docq')) { st.docQ = t.value; const pos = t.selectionStart; renderMain(); const n = document.querySelector('[data-docq]'); n.focus(); n.setSelectionRange(pos, pos); return; }
    if (st.docId && st.work) {
      const f = t.dataset.field;
      if (t.dataset.wf === 'customTitle') { st.work.customTitle = t.value; refreshPreview(); return; }
      if (f && f.startsWith('val.')) { st.work.values[f.slice(4)] = t.value; refreshPreview(); return; }
      if (f && f.startsWith('meta.')) { st.work.meta[f.slice(5)] = t.value; refreshPreview(); }
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.upload) { run(() => handleUpload(t)); return; }
    if (t.hasAttribute('data-import')) {
      run(async () => {
        const f = t.files[0]; if (!f) return;
        const data = JSON.parse(await f.text());
        if (!data.clients || !data.docs) throw new Error('Not a Policy Studio backup file.');
        if (!confirm(`Import ${data.clients.length} clients and ${data.docs.length} documents? This replaces the data in this browser.`)) return;
        st.store.db = data; await st.store._save(); st.db = await st.store.load(); closeModal(); renderAll(); toast('Backup imported', 'ok');
      });
      return;
    }
    if (t.dataset.pick) { if (t.checked) st.lib.selected.add(t.dataset.pick); else st.lib.selected.delete(t.dataset.pick); const bar = $('.sticky-bar'); if (bar) { bar.querySelector('span').textContent = st.lib.selected.size + ' selected'; const b = bar.querySelector('button'); b.disabled = !st.lib.selected.size; b.textContent = `Add ${st.lib.selected.size || ''} to ${client().name}`; } return; }
    if (t.dataset.lib === 'cat') { st.lib.cat = t.value; renderMain(); return; }
    if (t.dataset.lib === 'relevantOnly' || t.dataset.lib === 'readyOnly') { st.lib[t.dataset.lib] = t.checked; renderMain(); return; }
    if (st.clientId && !st.docId && t.dataset.field === 'industry') {
      const ind = S.industryById(t.value);
      const reg = document.querySelector('[data-field="regulators"]');
      if (reg && ind) reg.value = ind.reg.join(', ');
      const ow = $('#industryOtherWrap'); if (ow) ow.hidden = t.value !== 'other';
    }
    if (st.docId && st.work && t.tagName === 'SELECT') {
      const f = t.dataset.field;
      if (f && f.startsWith('val.')) st.work.values[f.slice(4)] = t.value;
      if (f && f.startsWith('meta.')) st.work.meta[f.slice(5)] = t.value;
      refreshPreview();
    }
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
  window.addEventListener('beforeunload', (e) => {
    if (st.docId && st.work) {
      const d = docById(st.docId);
      if (d && JSON.stringify([d.values, d.meta, d.customTitle || '']) !== JSON.stringify([st.work.values, st.work.meta, st.work.customTitle || ''])) { e.preventDefault(); e.returnValue = ''; }
    }
  });

  boot();
})();
