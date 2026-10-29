/* SAFE Client Portal — lets a client company choose policies, request new ones,
 * follow progress and download issued documents. Talks only to the portal actions
 * of the Apps Script backend, which return this client's own data. */
(function () {
  const S = window.SAFE;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : ''; };
  const todayIso = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const daysUntil = (iso) => Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(todayIso() + 'T00:00:00Z')) / 86400000);
  const TAG_TEXT = { M: 'Required by law', I: 'For your industry', R: 'Recommended' };

  const params = new URLSearchParams(location.search);
  const DEPLOYMENT = params.get('d') || '';
  const PORTAL_ID = params.get('p') || '';
  const API = /^[A-Za-z0-9_-]{20,}$/.test(DEPLOYMENT) ? `https://script.google.com/macros/s/${DEPLOYMENT}/exec` : '';
  const SESSION_KEY = 'safe-portal-session-' + PORTAL_ID;

  const st = {
    session: null, data: null, tab: 'choose', busy: false,
    q: '', cat: 'All', relevantOnly: true,
    selected: new Set(), custom: [],
  };

  // ---------------------------------------------------------------- helpers
  function toast(msg, kind) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast ' + (kind || ''); t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, kind === 'bad' ? 7000 : 3500);
  }
  function openModal(title, html) { $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html; $('#modal').hidden = false; }
  function closeModal() { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }
  const ssGet = () => { try { return sessionStorage.getItem(SESSION_KEY); } catch (e) { return null; } };
  const ssSet = (v) => { try { if (v) sessionStorage.setItem(SESSION_KEY, v); else sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ } };

  async function api(action, payload) {
    const res = await fetch(API, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow',
      body: JSON.stringify(Object.assign({ action }, payload || {})),
    });
    if (!res.ok) throw new Error('The portal could not be reached. Please try again.');
    const out = await res.json();
    if (!out.ok) {
      if (out.expired) { st.session = null; st.data = null; ssSet(null); render(); }
      throw new Error(out.error || 'Something went wrong.');
    }
    return out;
  }
  async function run(fn) {
    if (st.busy) return;
    st.busy = true; document.body.style.cursor = 'progress';
    try { await fn(); } catch (e) { toast(e.message || String(e), 'bad'); } finally { st.busy = false; document.body.style.cursor = ''; }
  }

  // ---------------------------------------------------------------- views
  function render() {
    const m = $('#main');
    $('#logoutBtn').hidden = !st.data;
    const cb = $('#clientBadge'); cb.hidden = !st.data; if (st.data) cb.textContent = st.data.client.name;
    if (!API || !PORTAL_ID) { m.innerHTML = `<div class="card login-card"><h2>Client portal</h2><p>Please open the portal using the link sent to you by SAFE Legal Solutions.</p><p class="muted small">If you need a new link, write to <a href="mailto:info@safelegal.org">info@safelegal.org</a>.</p></div>`; return; }
    if (!st.data) { m.innerHTML = viewLogin(); const f = $('#pin'); if (f) f.focus(); return; }
    const d = st.data;
    const openReq = d.requests.filter((r) => r.status === 'New' || r.status === 'In review').length;
    const tabs = [['choose', 'Choose policies'], ['new', '+ Request a new policy'], ['requests', `My requests${d.requests.length ? ' (' + d.requests.length + ')' : ''}`], ['docs', `My documents${d.docs.length ? ' (' + d.docs.length + ')' : ''}`]];
    let body = '';
    if (st.tab === 'new') body = viewNew();
    else if (st.tab === 'requests') body = viewRequests();
    else if (st.tab === 'docs') body = viewDocs();
    else body = viewChoose();
    const basket = st.selected.size + st.custom.length;
    m.innerHTML = `
      <div class="page-head"><div><div class="eyebrow">Welcome</div><h1>${esc(d.client.name)}</h1>
        <div class="muted small">Choose the policies and agreements you need, or ask us for something new. SAFE Legal Solutions reviews every request and prepares the documents for you.${openReq ? ` · <b>${openReq} request${openReq > 1 ? 's' : ''} in progress</b>` : ''}</div></div></div>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${st.tab === k ? 'active' : ''}" data-action="tab" data-tab="${k}">${l}</button>`).join('')}</div>
      ${body}
      ${basket ? `<div class="sticky-bar"><span>${st.selected.size} selected from the library${st.custom.length ? ` · ${st.custom.length} new request${st.custom.length > 1 ? 's' : ''}` : ''}</span><button class="btn gold" data-action="review">Review and submit</button></div>` : ''}`;
  }

  function viewLogin() {
    return `<div class="card login-card">
      <h2>Sign in</h2>
      <p class="muted">Enter the PIN that SAFE Legal Solutions sent you with this link.</p>
      <form data-form="login">
        <label class="field">PIN<input class="input pin-input" id="pin" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]*" required></label>
        <button class="btn primary block" type="submit" style="margin-top:12px">Sign in</button>
      </form>
      <p class="muted small" style="margin-top:14px">Lost your PIN? Write to <a href="mailto:info@safelegal.org">info@safelegal.org</a> and we will reset it.</p>
    </div>`;
  }

  function docForItem(itemId) { return st.data.docs.find((d) => d.itemId === itemId); }
  function pendingForItem(itemId) {
    return st.data.requests.some((r) => (r.status === 'New' || r.status === 'In review') && r.items.some((i) => i.type === 'library' && i.itemId === itemId));
  }

  function viewChoose() {
    const ind = S.industryById(st.data.client.industry);
    const q = st.q.toLowerCase();
    const cats = S.CATEGORIES.filter((c) => c !== 'Custom');
    const match = (it) => it.cat !== 'Custom' && (st.cat === 'All' || it.cat === st.cat) && (!st.relevantOnly || S.isRelevant(it, ind))
      && (!q || (it.title + ' ' + it.sectionTitle + ' ' + it.cat + ' ' + (it.keywords || '')).toLowerCase().includes(q));
    let html = `<div class="card">
      <div class="lib-toolbar" style="grid-template-columns:1.5fr 1fr">
        <input class="input" type="search" placeholder="Search policies and agreements" value="${esc(st.q)}" data-f="q">
        <select class="input" data-f="cat"><option ${st.cat === 'All' ? 'selected' : ''}>All</option>${cats.map((c) => `<option ${st.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      </div>
      <div class="row small"><label><input type="checkbox" data-f="relevantOnly" ${st.relevantOnly ? 'checked' : ''}> Show only documents relevant to ${esc(ind ? ind.name : 'your industry')}</label></div>
      <div class="row small muted" style="margin-top:6px"><span class="tag M">M</span> required by law · <span class="tag I">I</span> for your industry or regulator · <span class="tag R">R</span> recommended good practice</div>
      <div class="row" style="margin-top:10px"><button class="btn small" data-action="pick" data-what="M">Select all required by law</button><button class="btn small" data-action="pick" data-what="MI">Select required + industry</button><button class="btn small ghost" data-action="pick" data-what="none">Clear</button></div>
    </div>
    <div class="request-new-banner">
      <div><b>Can't find the policy or agreement you need?</b><div class="small">Ask SAFE Legal to draft it for you. Your request goes straight to our team.</div></div>
      <button class="btn primary" data-action="new-from-search">+ Request a new policy</button>
    </div>`;
    let shown = 0;
    cats.forEach((cat) => {
      const secs = S.SECTIONS.filter((s) => s.cat === cat).map((s) => ({ s, items: s.items.filter(match) })).filter((x) => x.items.length);
      if (!secs.length) return;
      shown += secs.reduce((n, x) => n + x.items.length, 0);
      html += `<div class="lib-cat"><h3>${esc(cat)}</h3>`;
      secs.forEach(({ s, items }) => {
        const sel = items.filter((it) => st.selected.has(it.id)).length;
        html += `<details class="lib-sec" ${st.q || cat === 'HR Playbook' || secs.length <= 3 ? 'open' : ''}><summary><span class="sec-title">${esc(s.title)}</span><span class="muted small">${items.length}${sel ? ' · ' + sel + ' selected' : ''}</span></summary>`;
        items.forEach((it) => {
          const doc = docForItem(it.id);
          const pend = !doc && pendingForItem(it.id);
          const lock = !!doc || pend;
          html += `<label class="lib-item"><input type="checkbox" data-pick="${it.id}" ${lock ? 'disabled' : ''} ${st.selected.has(it.id) || lock ? 'checked' : ''}>
            <span>${esc(it.title)}${it.kind === 'agreement' ? ' <span class="muted small">(agreement)</span>' : it.kind === 'template' ? ' <span class="muted small">(letter / form)</span>' : ''}</span>
            <span class="meta"><span class="tag ${it.tag}" title="${esc(TAG_TEXT[it.tag])}">${it.tag}</span>${doc ? `<span class="badge added">${esc(doc.stage)}</span>` : pend ? '<span class="badge ready">Requested</span>' : ''}</span></label>`;
        });
        html += '</details>';
      });
      html += '</div>';
    });
    if (!shown) {
      html += `<div class="card empty"><p>No policy or agreement in our library matches${st.q ? ` "<b>${esc(st.q)}</b>"` : ''}.</p>
        <button class="btn primary" data-action="new-from-search">Request ${st.q ? `"${esc(st.q)}"` : 'a new policy'} from SAFE Legal</button></div>`;
    }
    return html;
  }

  function viewNew() {
    return `<div class="card">
      <h3>Request a document that is not in the list</h3>
      <p class="muted small">Tell us what you need. SAFE Legal Solutions will review it and confirm.</p>
      <form data-form="custom">
        <div class="grid2">
          <label class="field span2">Name of the policy or agreement <span class="req">*</span><input class="input" id="cTitle" maxlength="300" required placeholder="e.g. Drone operations safety policy" value="${esc(st.prefill || '')}"></label>
          <label class="field">Type<select class="input" id="cKind"><option value="policy">Policy</option><option value="agreement">Agreement</option></select></label>
          <div></div>
          <label class="field span2">What should it cover? (purpose, who it applies to, any specific points)<textarea class="input" id="cDetails" rows="5" maxlength="4000"></textarea></label>
        </div>
        <button class="btn primary" type="submit" style="margin-top:10px">Add to my request</button>
      </form>
      ${st.custom.length ? `<h3 style="margin-top:18px">New documents in this request</h3><div class="history-list">${st.custom.map((c, i) => `<div class="history-item"><div><b>${esc(c.title)}</b> <span class="muted small">(${esc(c.kind)})</span>${c.details ? `<div class="muted small">${esc(c.details)}</div>` : ''}</div><button class="btn small ghost" data-action="remove-custom" data-i="${i}">Remove</button></div>`).join('')}</div>` : ''}
    </div>`;
  }

  const REQ_LABEL = { New: 'Received', 'In review': 'Under review', Approved: 'Approved – in preparation', Declined: 'Not taken up', Completed: 'Completed' };
  function viewRequests() {
    const list = st.data.requests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!list.length) return '<div class="card empty"><p>You have not made any requests yet.</p><button class="btn primary" data-action="tab" data-tab="choose">Choose policies</button></div>';
    return list.map((r) => `<div class="card">
      <div class="spread"><div><b>Request ${esc(r.id)}</b><div class="muted small">Submitted ${fmtDate(r.createdAt.slice(0, 10))}${r.requestedBy && r.requestedBy.name ? ' by ' + esc(r.requestedBy.name) : ''}${r.urgency === 'Urgent' ? ' · Urgent' : ''}${r.neededBy ? ' · needed by ' + fmtDate(r.neededBy) : ''}</div></div>
      <span class="status req-${esc(r.status.replace(/\s/g, ''))}">${esc(REQ_LABEL[r.status] || r.status)}</span></div>
      ${r.safeNote ? `<div class="notice info" style="margin-top:10px"><b>From SAFE Legal:</b> ${esc(r.safeNote)}</div>` : ''}
      <table class="table" style="margin-top:10px"><tbody>${r.items.map((i) => `<tr><td>${i.type === 'custom' ? '<b>New:</b> ' : ''}${esc(i.title)}</td><td class="small" style="text-align:right">${i.stage ? esc(i.stage) : (!i.included && (r.status === 'Approved' || r.status === 'Completed')) ? '<span class="muted">Not included</span>' : r.status === 'Declined' ? '<span class="muted">Not taken up</span>' : '<span class="muted">Pending</span>'}</td></tr>`).join('')}</tbody></table>
      ${r.note ? `<p class="small muted" style="margin-top:8px">Your note: ${esc(r.note)}</p>` : ''}
    </div>`).join('');
  }

  function viewDocs() {
    const rank = (d) => (d.stage === 'Issued' ? 0 : /^Issued/.test(d.stage) ? 1 : 2);
    const docs = st.data.docs.slice().sort((a, b) => rank(a) - rank(b) || (a.ref || '').localeCompare(b.ref || ''));
    if (!docs.length) return '<div class="card empty"><p>No documents yet. Once SAFE Legal starts preparing your documents, they appear here.</p></div>';
    return `<div class="card" style="padding:0"><div class="table-wrap"><table class="table"><thead><tr><th>Document</th><th>Status</th><th>Version</th><th>Effective</th><th>Review / expiry</th><th></th></tr></thead><tbody>
      ${docs.map((d) => {
        const n = d.expiryDate ? daysUntil(d.expiryDate) : null;
        const exp = d.expiryDate ? `<span class="${n < 0 ? 'exp-bad' : n <= 60 ? 'exp-warn' : ''}">${fmtDate(d.expiryDate)}${n < 0 ? ' · expired' : n <= 60 ? ' · due for renewal' : ''}</span>` : '—';
        return `<tr><td><b>${esc(d.title)}</b><div class="muted small">${esc(d.ref || '')}</div></td><td><span class="status ${d.stage === 'Issued' ? 'Issued' : 'Draft'}">${esc(d.stage)}</span></td><td>${esc(d.version || '—')}</td><td class="small">${d.effectiveDate ? fmtDate(d.effectiveDate) : '—'}</td><td class="small">${exp}</td>
        <td>${d.canDownload ? `<button class="btn small" data-action="download" data-id="${d.id}">Download</button>` : ''}</td></tr>`;
      }).join('')}</tbody></table></div></div>
      <p class="small muted">Documents in preparation are shared once SAFE Legal has reviewed and issued them.</p>`;
  }

  function reviewDialog() {
    const items = [...st.selected].map((id) => S.itemById(id)).filter(Boolean);
    openModal('Review and submit your request', `
      <p class="small muted">SAFE Legal Solutions will review your request and confirm before work starts.</p>
      ${items.length ? `<h3>From the library (${items.length})</h3><ul class="small">${items.map((it) => `<li>${esc(it.title)} <span class="tag ${it.tag}">${it.tag}</span></li>`).join('')}</ul>` : ''}
      ${st.custom.length ? `<h3>New documents (${st.custom.length})</h3><ul class="small">${st.custom.map((c) => `<li>${esc(c.title)} (${esc(c.kind)})</li>`).join('')}</ul>` : ''}
      <form data-form="submit">
        <div class="grid2">
          <label class="field">Your name <span class="req">*</span><input class="input" id="rName" required maxlength="120"></label>
          <label class="field">Your email <span class="req">*</span><input class="input" id="rEmail" type="email" required maxlength="160"></label>
          <label class="field">Phone<input class="input" id="rPhone" maxlength="40"></label>
          <label class="field">Priority<select class="input" id="rUrg"><option>Normal</option><option>Urgent</option></select></label>
          <label class="field">Needed by (optional)<input class="input" id="rBy" type="date" min="${todayIso()}"></label>
          <label class="field span2">Anything else we should know?<textarea class="input" id="rNote" rows="3" maxlength="4000"></textarea></label>
        </div>
        <div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Back</button><button class="btn primary" type="submit">Submit request</button></div>
      </form>`);
    $('#rName').focus();
  }

  async function submitRequest() {
    const out = await api('portalRequest', {
      session: st.session,
      items: [...st.selected].map((id) => ({ itemId: id, title: (S.itemById(id) || {}).title || id })),
      custom: st.custom,
      requestedBy: { name: $('#rName').value.trim(), email: $('#rEmail').value.trim(), phone: $('#rPhone').value.trim() },
      urgency: $('#rUrg').value, neededBy: $('#rBy').value, note: $('#rNote').value.trim(),
    });
    st.data = out.data; st.selected.clear(); st.custom = []; st.tab = 'requests';
    closeModal(); render();
    openModal('Request submitted', `<p>Thank you. Your request <b>${esc(out.id)}</b> has been sent to SAFE Legal Solutions. A confirmation has been emailed to you.</p><p class="muted small">You can follow its progress under <b>My requests</b>.</p><div class="modal-actions"><button class="btn primary" data-action="close-modal">Done</button></div>`);
  }

  // ---------------------------------------------------------------- events
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]'); if (!f) return;
    e.preventDefault();
    const k = f.dataset.form;
    if (k === 'login') run(async () => {
      const pin = $('#pin').value.trim();
      const out = await api('portalLogin', { portalId: PORTAL_ID, pin });
      st.session = out.session; st.data = out.data; ssSet(out.session); render();
    });
    if (k === 'custom') {
      st.custom.push({ title: $('#cTitle').value.trim(), kind: $('#cKind').value, details: $('#cDetails').value.trim() });
      st.prefill = '';
      toast('Added – click "Review and submit" at the bottom to send it to SAFE Legal', 'ok'); render();
    }
    if (k === 'submit') run(submitRequest);
  });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) { if (e.target.id === 'modal') closeModal(); return; }
    const a = el.dataset.action;
    if (a === 'tab') { st.tab = el.dataset.tab; st.prefill = ''; render(); window.scrollTo(0, 0); }
    else if (a === 'new-from-search') { st.tab = 'new'; st.prefill = st.q; render(); window.scrollTo(0, 0); const t = $('#cTitle'); if (t) t.focus(); }
    else if (a === 'close-modal') closeModal();
    else if (a === 'review') reviewDialog();
    else if (a === 'remove-custom') { st.custom.splice(+el.dataset.i, 1); render(); }
    else if (a === 'pick') {
      const ind = S.industryById(st.data.client.industry);
      if (el.dataset.what === 'none') st.selected.clear();
      else S.ITEMS.forEach((it) => {
        if (it.cat === 'Custom' || docForItem(it.id) || pendingForItem(it.id) || !S.isRelevant(it, ind)) return;
        if (it.tag === 'M' || (el.dataset.what === 'MI' && it.tag === 'I')) st.selected.add(it.id);
      });
      render();
    } else if (a === 'logout') run(async () => { try { await api('portalLogout', { session: st.session }); } catch (x) { /* ignore */ } st.session = null; st.data = null; ssSet(null); render(); });
    else if (a === 'download') run(async () => {
      const out = await api('portalDownload', { session: st.session, docId: el.dataset.id });
      const bin = atob(out.base64); const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: out.mime }));
      const link = document.createElement('a'); link.href = url; link.download = out.name; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 8000);
    });
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.f === 'q') { st.q = t.value; const pos = t.selectionStart; render(); const n = document.querySelector('[data-f="q"]'); n.focus(); n.setSelectionRange(pos, pos); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.pick) { if (t.checked) st.selected.add(t.dataset.pick); else st.selected.delete(t.dataset.pick); render(); }
    else if (t.dataset.f === 'cat') { st.cat = t.value; render(); }
    else if (t.dataset.f === 'relevantOnly') { st.relevantOnly = t.checked; render(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

  // ---------------------------------------------------------------- start
  (async () => {
    render();
    const saved = ssGet();
    if (saved && API) {
      try { const out = await api('portalLoad', { session: saved }); st.session = saved; st.data = out.data; render(); } catch (e) { ssSet(null); render(); }
    }
  })();
})();
