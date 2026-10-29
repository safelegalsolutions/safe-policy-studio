/**
 * SAFE Policy Studio — Google Apps Script backend.
 *
 * Stores clients, documents and version history in a JSON database on Google Drive,
 * stores letterheads and issued Word files in per-client Drive folders, and sends
 * policy expiry reminders by email.
 *
 * SETUP (once): see README.md. In short: paste this file and appsscript.json into a new
 * Apps Script project, run setup(), copy the API key from the log, then
 * Deploy > New deployment > Web app (Execute as: Me; Who has access: Anyone).
 */

var DEFAULTS = {
  SAFE_TO: 'info@safelegal.org',
  SAFE_CC: 'operations@safelegal.org',
  REMINDER_DAYS_BEFORE: 60,   // start reminding 2 months before expiry
  REMINDER_INTERVAL_DAYS: 7,  // then every week
  SENDER_NAME: 'SAFE Legal Solutions – Policy Studio',
  TZ: 'Asia/Kolkata'
};

// ---------------------------------------------------------------- setup
function setup() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('API_KEY')) props.setProperty('API_KEY', Utilities.getUuid().replace(/-/g, ''));
  var root = getRootFolder_();
  getDbFile_(); // create the database if missing
  // daily reminder job at about 9 a.m. IST
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dailyReminderJob') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('dailyReminderJob').timeBased().everyDays(1).atHour(9).inTimezone(DEFAULTS.TZ).create();
  Logger.log('Root folder: ' + root.getUrl());
  Logger.log('API key (paste into the app settings): ' + props.getProperty('API_KEY'));
}

function getRootFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ROOT_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* recreate */ } }
  var f = DriveApp.createFolder('SAFE Policy Studio');
  props.setProperty('ROOT_FOLDER_ID', f.getId());
  return f;
}

function getDbFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('DB_FILE_ID');
  if (id) { try { return DriveApp.getFileById(id); } catch (e) { /* recreate */ } }
  var empty = { version: 1, clients: [], docs: [], settings: {} };
  var file = getRootFolder_().createFile('policy-studio-db.json', JSON.stringify(empty), 'application/json');
  props.setProperty('DB_FILE_ID', file.getId());
  return file;
}

function readDb_() {
  var db = JSON.parse(getDbFile_().getBlob().getDataAsString('UTF-8'));
  db.clients = db.clients || []; db.docs = db.docs || []; db.settings = db.settings || {}; db.requests = db.requests || [];
  return db;
}

function writeDb_(db) {
  db.version = (db.version || 0) + 1;
  db.savedAt = new Date().toISOString();
  getDbFile_().setContent(JSON.stringify(db));
  // keep a daily backup copy
  var props = PropertiesService.getScriptProperties();
  var today = Utilities.formatDate(new Date(), DEFAULTS.TZ, 'yyyy-MM-dd');
  if (props.getProperty('LAST_BACKUP') !== today) {
    var backups = subFolder_(getRootFolder_(), '_backups');
    backups.createFile('db-' + today + '.json', JSON.stringify(db), 'application/json');
    props.setProperty('LAST_BACKUP', today);
  }
  return db;
}

function subFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function clientFolder_(db, clientId) {
  var c = (db.clients || []).filter(function (x) { return x.id === clientId; })[0];
  var name = c ? (c.name || clientId) : clientId;
  var root = getRootFolder_();
  if (c && c.folderId) { try { return DriveApp.getFolderById(c.folderId); } catch (e) { /* fall through */ } }
  var f = subFolder_(root, name.replace(/[\\/:*?"<>|]/g, '-'));
  if (c) c.folderId = f.getId();
  return f;
}

// ---------------------------------------------------------------- web API
function doGet() {
  return json_({ ok: true, app: 'SAFE Policy Studio backend' });
}

// Long-running AI actions run without holding the database lock; they take the lock only when they write.
var NO_LOCK_ACTIONS = { aiStatus: 1, aiDraft: 1, aiLegalise: 1, aiRecommend: 1, lawWatchRun: 1, lawAnalyse: 1, portalAsk: 1, portalLegalise: 1 };

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { return fn(); } finally { try { lock.releaseLock(); } catch (e) { /* ignore */ } }
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }
  var isPortal = /^portal/.test(String(req.action || ''));
  if (!isPortal) {
    var key = PropertiesService.getScriptProperties().getProperty('API_KEY');
    if (!key || req.key !== key) return json_({ ok: false, error: 'Invalid API key' });
  }
  if (NO_LOCK_ACTIONS[req.action]) {
    try { return json_(isPortal ? handlePortal_(req) : handle_(req)); } catch (err0) { return json_({ ok: false, error: String(err0 && err0.message || err0) }); }
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    return json_(isPortal ? handlePortal_(req) : handle_(req));
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) { /* ignore */ }
  }
}

function handle_(req) {
  var db, i;
  switch (req.action) {
    case 'ping':
      return { ok: true, quota: MailApp.getRemainingDailyQuota(), mailErrors: JSON.parse(PropertiesService.getScriptProperties().getProperty('MAIL_ERRORS') || '[]') };
    case 'load':
      db = readDb_();
      db.clients = db.clients.map(function (c) {
        if (!c.portal) return c;
        var copy = JSON.parse(JSON.stringify(c));
        delete copy.portal.pinHash; delete copy.portal.salt;
        return copy;
      });
      delete db.lawSeen;
      if (db.catalog) db.catalogVersion = db.catalog.version;
      delete db.catalog;
      return { ok: true, db: db };
    case 'saveClient':
      db = readDb_();
      var existing = db.clients.filter(function (c) { return c.id === req.client.id; })[0];
      if (existing && existing.portal) req.client.portal = existing.portal; // portal access is changed only through setPortal
      else delete req.client.portal;
      upsert_(db.clients, req.client);
      clientFolder_(db, req.client.id);
      writeDb_(db);
      return { ok: true, client: db.clients.filter(function (c) { return c.id === req.client.id; })[0] };
    case 'deleteClient':
      db = readDb_();
      db.clients = db.clients.filter(function (c) { return c.id !== req.id; });
      db.docs = db.docs.filter(function (d) { return d.clientId !== req.id; });
      db.requests = db.requests.filter(function (r) { return r.clientId !== req.id; });
      writeDb_(db);
      return { ok: true };
    case 'deleteRequest':
      db = readDb_();
      db.requests = db.requests.filter(function (r) { return r.id !== req.id; });
      writeDb_(db);
      return { ok: true };
    case 'saveDoc':
      db = readDb_();
      mergeLawFlags_(db, req.doc);
      upsert_(db.docs, req.doc);
      writeDb_(db);
      return { ok: true, doc: req.doc };
    case 'saveDocs':
      db = readDb_();
      for (i = 0; i < req.docs.length; i++) { mergeLawFlags_(db, req.docs[i]); upsert_(db.docs, req.docs[i]); }
      writeDb_(db);
      return { ok: true };
    case 'deleteDoc':
      db = readDb_();
      db.docs = db.docs.filter(function (d) { return d.id !== req.id; });
      writeDb_(db);
      return { ok: true };
    case 'saveSettings':
      db = readDb_();
      db.settings = req.settings || {};
      writeDb_(db);
      return { ok: true };
    case 'upload':
      db = readDb_();
      var folder = subFolder_(clientFolder_(db, req.clientId), req.folder || 'Files');
      var blob = Utilities.newBlob(Utilities.base64Decode(req.base64), req.mime, req.name);
      var file = folder.createFile(blob);
      writeDb_(db); // stores folderId if new
      return { ok: true, fileId: file.getId(), url: file.getUrl() };
    case 'download':
      var f = DriveApp.getFileById(req.fileId);
      var b = f.getBlob();
      return { ok: true, name: f.getName(), mime: b.getContentType(), base64: Utilities.base64Encode(b.getBytes()) };
    case 'setPortal':
      db = readDb_();
      var pc = db.clients.filter(function (c) { return c.id === req.clientId; })[0];
      if (!pc) return { ok: false, error: 'Client not found' };
      pc.portal = pc.portal || { id: randomToken_().slice(0, 32), createdAt: new Date().toISOString() };
      if (req.pin) {
        if (!/^\d{6,8}$/.test(String(req.pin))) return { ok: false, error: 'The PIN must be 6 to 8 digits.' };
        pc.portal.salt = randomToken_().slice(0, 16);
        pc.portal.pinHash = hashPin_(pc.portal.salt, String(req.pin));
        pc.portal.pinSetAt = new Date().toISOString();
      }
      if (req.newLink) pc.portal.id = randomToken_().slice(0, 32);
      pc.portal.enabled = req.enabled !== false;
      writeDb_(db);
      return { ok: true, portal: { id: pc.portal.id, enabled: pc.portal.enabled, pinSetAt: pc.portal.pinSetAt, createdAt: pc.portal.createdAt } };
    case 'saveRequest':
      db = readDb_();
      upsert_(db.requests, req.request);
      writeDb_(db);
      if (req.notify) notifyClientOfRequest_(db, req.request);
      return { ok: true };
    case 'aiStatus':
      return { ok: true, ai: aiStatus_() };
    case 'setAiKey': {
      var props2 = PropertiesService.getScriptProperties();
      if (req.remove) props2.deleteProperty('CLAUDE_API_KEY');
      else {
        var k2 = String(req.apiKey || '').trim();
        if (!/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k2)) return { ok: false, error: 'That does not look like a Claude API key (it should start with sk-ant-).' };
        props2.setProperty('CLAUDE_API_KEY', k2);
        var test = claude_({ system: 'Reply with the single word OK.', prompt: 'Test', maxTokens: 5, fast: true });
        if (!/ok/i.test(test)) return { ok: false, error: 'The key was saved but the test call did not return the expected answer.' };
        ensureLawWatchTrigger_();
      }
      return { ok: true, ai: aiStatus_() };
    }
    case 'syncCatalog':
      db = readDb_();
      db.catalog = { version: String(req.version || ''), items: (req.items || []).slice(0, 1000) };
      writeDb_(db);
      return { ok: true };
    case 'aiDraft':
      return { ok: true, draft: aiDraft_(req) };
    case 'aiLegalise':
      return { ok: true, text: aiLegalise_(req.text, req.context || {}, 'studio') };
    case 'aiRecommend':
      return { ok: true, items: aiRecommend_(req.profile || {}, req.catalog || []) };
    case 'lawWatchRun':
      return { ok: true, result: lawWatchRun_(!!req.dryRun) };
    case 'lawAnalyse':
      return { ok: true, result: lawAnalyseManual_(req) };
    case 'saveLawUpdate':
      return saveLawUpdate_(req);
    case 'deleteLawUpdate':
      db = readDb_();
      db.lawUpdates = (db.lawUpdates || []).filter(function (u) { return u.id !== req.id; });
      writeDb_(db);
      return { ok: true };
    case 'runReminders':
      return { ok: true, result: runReminders_(req.dryRun === true) };
    case 'testEmail':
      var s = settings_(readDb_());
      MailApp.sendEmail({ to: req.to || s.safeTo, cc: s.safeCc, subject: 'SAFE Policy Studio – test email', htmlBody: '<p>This is a test email from SAFE Policy Studio. Expiry reminders will arrive in this format.</p>', name: s.senderName });
      return { ok: true };
    default:
      return { ok: false, error: 'Unknown action' };
  }
}

/** Keeps law-change flags added on the server that a browser with older data does not know about yet. */
function mergeLawFlags_(db, incoming) {
  var cur = db.docs.filter(function (d) { return d.id === incoming.id; })[0];
  if (!cur || !cur.lawFlags) return;
  var known = {};
  (incoming.lawFlags || []).forEach(function (f) { known[f.updateId] = true; });
  cur.lawFlags.forEach(function (f) { if (!known[f.updateId]) incoming.lawFlags = (incoming.lawFlags || []).concat([f]); });
}

function upsert_(arr, obj) {
  for (var i = 0; i < arr.length; i++) { if (arr[i].id === obj.id) { arr[i] = obj; return; } }
  arr.push(obj);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------- client portal
var PORTAL = { SESSION_SECONDS: 21600, MAX_FAILS: 5, LOCK_SECONDS: 900 };

function randomToken_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''); }

function hashPin_(salt, pin) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + pin, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}

function clip_(v, n) { return String(v == null ? '' : v).slice(0, n); }

function portalClient_(db, session) {
  var cid = session ? CacheService.getScriptCache().get('sess_' + session) : null;
  if (!cid) throw new Error('SESSION_EXPIRED');
  var c = db.clients.filter(function (x) { return x.id === cid; })[0];
  if (!c || !c.portal || !c.portal.enabled) throw new Error('Portal access is not available. Please contact SAFE Legal Solutions.');
  return c;
}

function stageOf_(d) {
  if (d.status === 'Issued') return 'Issued';
  if (d.status === 'Archived') return d.issued ? 'Withdrawn' : 'Cancelled';
  if (d.issued) return 'Issued – revision in progress';
  if (d.status === 'Under review' || d.status === 'Advocate reviewed') return 'Under SAFE review';
  return 'In preparation';
}

function portalView_(db, c) {
  var s = settings_(db);
  var docs = db.docs.filter(function (d) { return d.clientId === c.id; });
  var byId = {};
  docs.forEach(function (d) { byId[d.id] = d; });
  return {
    client: { name: c.name, industry: c.industry, industryOther: c.industryOther || '', states: c.states || '' },
    contact: { email: s.safeTo },
    features: { ask: !!(s.portalAsk && aiStatus_().configured), wording: !!(s.portalWording && aiStatus_().configured) },
    recommendations: (c.recommendations && c.recommendations.published) ? c.recommendations.items || [] : [],
    docs: docs.filter(function (d) { return d.status !== 'Archived' || d.issued; }).map(function (d) {
      return {
        id: d.id, itemId: d.itemId, title: d.title, ref: d.ref, stage: stageOf_(d),
        version: d.issued ? d.issued.version : null,
        effectiveDate: d.issued ? d.issued.effectiveDate : null,
        expiryDate: d.issued ? d.issued.expiryDate : null,
        canDownload: !!(d.issued && d.issued.fileId),
        lawFlags: (d.lawFlags || []).filter(function (f) { return !f.resolved; }).map(function (f) { return { title: f.title, summary: f.summary, at: f.at }; })
      };
    }),
    requests: db.requests.filter(function (r) { return r.clientId === c.id && !r.clientHidden; }).map(function (r) {
      return {
        id: r.id, createdAt: r.createdAt, status: r.status, note: r.note, urgency: r.urgency, neededBy: r.neededBy,
        safeNote: r.safeNote || '', requestedBy: r.requestedBy || {},
        items: (r.items || []).map(function (i) {
          var d = i.docId ? byId[i.docId] : null;
          return { type: i.type, itemId: i.itemId, title: i.title, details: i.details, included: i.included !== false, stage: d ? stageOf_(d) : (i.docId ? 'Removed by SAFE Legal' : null) };
        })
      };
    })
  };
}

function handlePortal_(req) {
  var db = readDb_();
  var cache = CacheService.getScriptCache();
  try {
    switch (req.action) {
      case 'portalLogin': {
        var pid = clip_(req.portalId, 64);
        var failKey = 'fail_' + pid;
        var fails = Number(cache.get(failKey) || 0);
        if (fails >= PORTAL.MAX_FAILS) return { ok: false, error: 'Too many attempts. Please try again in 15 minutes.' };
        var c = db.clients.filter(function (x) { return x.portal && x.portal.id === pid && x.portal.enabled && x.portal.pinHash; })[0];
        if (!c || hashPin_(c.portal.salt, clip_(req.pin, 12)) !== c.portal.pinHash) {
          cache.put(failKey, String(fails + 1), PORTAL.LOCK_SECONDS);
          return { ok: false, error: 'The link or PIN is not correct.' };
        }
        cache.remove(failKey);
        var token = randomToken_();
        cache.put('sess_' + token, c.id, PORTAL.SESSION_SECONDS);
        return { ok: true, session: token, data: portalView_(db, c) };
      }
      case 'portalLoad':
        return { ok: true, data: portalView_(db, portalClient_(db, req.session)) };
      case 'portalLogout':
        if (req.session) cache.remove('sess_' + req.session);
        return { ok: true };
      case 'portalRequest': {
        var pc = portalClient_(db, req.session);
        var items = (req.items || []).slice(0, 300).map(function (i) {
          return { type: 'library', itemId: clip_(i.itemId, 80), title: clip_(i.title, 300) };
        }).filter(function (i) { return i.itemId; });
        var custom = (req.custom || []).slice(0, 30).map(function (x) {
          return { type: 'custom', kind: x.kind === 'agreement' ? 'agreement' : x.kind === 'question' ? 'question' : 'policy', title: clip_(x.title, 300), details: clip_(x.details, 4000) };
        }).filter(function (x) { return x.title; });
        if (!items.length && !custom.length) return { ok: false, error: 'Please select at least one document or describe a new one.' };
        var by = req.requestedBy || {};
        var r = {
          id: 'req_' + randomToken_().slice(0, 12), clientId: pc.id, createdAt: new Date().toISOString(), status: 'New',
          items: items.concat(custom), note: clip_(req.note, 4000), urgency: req.urgency === 'Urgent' ? 'Urgent' : 'Normal',
          neededBy: /^\d{4}-\d{2}-\d{2}$/.test(String(req.neededBy || '')) ? String(req.neededBy) : '',
          requestedBy: { name: clip_(by.name, 120), email: validEmails_(clip_(by.email, 160))[0] || '', emailEntered: clip_(by.email, 160), phone: clip_(by.phone, 40) },
          history: [{ at: new Date().toISOString(), by: 'Client', action: 'Submitted' }]
        };
        db.requests.push(r);
        writeDb_(db);
        notifySafeOfRequest_(db, pc, r);
        return { ok: true, id: r.id, data: portalView_(db, pc) };
      }
      case 'portalWithdraw': {
        var wc = portalClient_(db, req.session);
        var wr = db.requests.filter(function (x) { return x.id === req.requestId && x.clientId === wc.id && !x.clientHidden; })[0];
        if (!wr) return { ok: false, error: 'This request was not found.' };
        var reason = clip_(req.reason, 2000).trim();
        if (!reason) return { ok: false, error: 'Please tell us why you are deleting this request.' };
        var by = req.withdrawnBy || {};
        wr.previousStatus = wr.status;
        wr.status = 'Withdrawn';
        wr.clientHidden = true;
        wr.withdrawal = { at: new Date().toISOString(), reason: reason, name: clip_(by.name, 120), email: validEmails_(clip_(by.email, 160))[0] || '' };
        wr.history = (wr.history || []).concat([{ at: wr.withdrawal.at, by: 'Client', action: 'Deleted by client: ' + reason }]);
        writeDb_(db);
        notifySafeOfWithdrawal_(db, wc, wr);
        return { ok: true, data: portalView_(db, wc) };
      }
      case 'portalAsk': {
        var ac = portalClient_(db, req.session);
        if (!settings_(db).portalAsk) return { ok: false, error: 'Questions are not switched on for this portal.' };
        if (!PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY')) return { ok: false, error: 'This feature is not available at the moment. Please write to SAFE Legal.' };
        aiRateLimit_(ac.id, 'ask', 40);
        return { ok: true, answer: portalAsk_(db, ac, clip_(req.question, 1000)) };
      }
      case 'portalLegalise': {
        var lc = portalClient_(db, req.session);
        if (!settings_(db).portalWording) return { ok: false, error: 'Wording help is not switched on for this portal.' };
        if (!PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY')) return { ok: false, error: 'This feature is not available at the moment. Please write to SAFE Legal.' };
        aiRateLimit_(lc.id, 'word', 40);
        return { ok: true, text: aiLegalise_(clip_(req.text, 4000), { title: clip_(req.title, 300), kind: req.kind === 'agreement' ? 'agreement' : 'policy', industry: lc.industry }, 'request') };
      }
      case 'portalDownload': {
        var dc = portalClient_(db, req.session);
        var d = db.docs.filter(function (x) { return x.id === req.docId && x.clientId === dc.id; })[0];
        if (!d || !d.issued || !d.issued.fileId) return { ok: false, error: 'This document is not available for download.' };
        var f = DriveApp.getFileById(d.issued.fileId);
        var b = f.getBlob();
        return { ok: true, name: f.getName(), mime: b.getContentType(), base64: Utilities.base64Encode(b.getBytes()) };
      }
      default:
        return { ok: false, error: 'Unknown action' };
    }
  } catch (err) {
    var msg = String(err && err.message || err);
    if (msg === 'SESSION_EXPIRED') return { ok: false, error: 'Your session has expired. Please sign in again.', expired: true };
    return { ok: false, error: msg };
  }
}

function requestItemsHtml_(r) {
  return '<ul>' + (r.items || []).map(function (i) {
    return '<li>' + (i.type === 'custom' ? '<b>New ' + esc_(i.kind || 'policy') + ':</b> ' + esc_(i.title) + (i.details ? '<br><span style="color:#555">' + esc_(i.details) + '</span>' : '') : esc_(i.title)) + '</li>';
  }).join('') + '</ul>';
}

function notifySafeOfRequest_(db, c, r) {
  var s = settings_(db);
  var nLib = r.items.filter(function (i) { return i.type === 'library'; }).length;
  var nNew = r.items.length - nLib;
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">' +
    '<p><b>' + esc_(c.name) + '</b> has submitted a request through the client portal' + (r.urgency === 'Urgent' ? ' <b style="color:#801425">(URGENT)</b>' : '') + '.</p>' +
    '<p>' + nLib + ' document(s) from the library' + (nNew ? ' and ' + nNew + ' new document(s) not in the library' : '') + ':</p>' + requestItemsHtml_(r) +
    (r.note ? '<p><b>Note from client:</b> ' + esc_(r.note) + '</p>' : '') +
    (r.neededBy ? '<p><b>Needed by:</b> ' + fmt_(r.neededBy) + '</p>' : '') +
    '<p><b>Requested by:</b> ' + esc_(r.requestedBy.name) + ' · ' + esc_(r.requestedBy.email || (r.requestedBy.emailEntered ? r.requestedBy.emailEntered + ' (invalid address – no acknowledgement sent)' : '')) + ' · ' + esc_(r.requestedBy.phone) + '</p>' +
    '<p>Review and approve it in the SAFE Inbox' + (s.appUrl ? ': <a href="' + esc_(s.appUrl) + '">open Policy Studio</a>' : '') + '.</p></div>';
  safeMail_({ to: s.safeTo, cc: s.safeCc, replyTo: r.requestedBy.email || s.safeTo, subject: (r.urgency === 'Urgent' ? '[URGENT] ' : '') + 'New policy request – ' + c.name + ' (' + r.items.length + ' items)', htmlBody: html, name: s.senderName });
  var ackTo = r.requestedBy.email || validEmails_(c.reminderEmails).join(',');
  if (ackTo) {
    safeMail_({ to: ackTo, replyTo: s.safeTo, subject: 'We have received your request – SAFE Legal Solutions', name: s.senderName,
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"><p>Dear ' + esc_(r.requestedBy.name || 'Sir / Madam') + ',</p><p>Thank you. SAFE Legal Solutions has received your request (reference ' + esc_(r.id) + ') for:</p>' + requestItemsHtml_(r) + '<p>We will review it and get back to you. You can follow its progress in your client portal.</p><p>Regards,<br>SAFE Legal Solutions<br>info@safelegal.org | +91 98861 81839 | safelegal.in</p></div>' });
  }
}

function notifySafeOfWithdrawal_(db, c, r) {
  var s = settings_(db);
  var w = r.withdrawal || {};
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">' +
    '<p><b>' + esc_(c.name) + '</b> has deleted its request <b>' + esc_(r.id) + '</b> in the client portal.</p>' +
    '<p><b>Status before deletion:</b> ' + esc_(r.previousStatus || '') + '</p>' +
    '<p><b>Reason given:</b> ' + esc_(w.reason) + '</p>' +
    (w.name || w.email ? '<p><b>Deleted by:</b> ' + esc_(w.name) + ' ' + esc_(w.email) + '</p>' : '') +
    '<p>The request covered:</p>' + requestItemsHtml_(r) +
    (r.previousStatus === 'Approved' || r.previousStatus === 'Completed' ? '<p><b>Note:</b> documents were already created from this request. Review them in the studio and delete or archive any that are no longer needed.</p>' : '') +
    '<p>The request is kept in the SAFE Inbox under "Withdrawn"' + (s.appUrl ? ': <a href="' + esc_(s.appUrl) + '">open Policy Studio</a>' : '') + '.</p></div>';
  safeMail_({ to: s.safeTo, cc: s.safeCc, replyTo: w.email || s.safeTo, subject: 'Request deleted by client – ' + c.name + ' (' + r.id + ')', htmlBody: html, name: s.senderName });
  var ackTo = w.email || (r.requestedBy && r.requestedBy.email);
  if (ackTo) {
    safeMail_({ to: ackTo, replyTo: s.safeTo, name: s.senderName, subject: 'Your request has been deleted – SAFE Legal Solutions',
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"><p>Dear ' + esc_(w.name || (r.requestedBy && r.requestedBy.name) || 'Sir / Madam') + ',</p><p>Your request ' + esc_(r.id) + ' has been deleted as you asked, and SAFE Legal Solutions has been informed. Your reason: "' + esc_(w.reason) + '".</p><p>If this was a mistake, please submit a new request in your client portal or write to us at ' + esc_(s.safeTo) + '.</p><p>Regards,<br>SAFE Legal Solutions</p></div>' });
  }
}

function notifyClientOfRequest_(db, r) {
  var s = settings_(db);
  var c = db.clients.filter(function (x) { return x.id === r.clientId; })[0];
  if (!c) return;
  var to = (r.requestedBy && r.requestedBy.email) || validEmails_(c.reminderEmails).join(',');
  if (!to) return;
  var included = (r.items || []).filter(function (i) { return i.included !== false; });
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"><p>Dear ' + esc_((r.requestedBy && r.requestedBy.name) || c.contactName || 'Sir / Madam') + ',</p>' +
    '<p>Your request ' + esc_(r.id) + ' is now <b>' + esc_(r.status) + '</b>.</p>' +
    (r.status === 'Approved' || r.status === 'Completed' ? '<p>Documents included:</p>' + requestItemsHtml_({ items: included }) : '') +
    (r.safeNote ? '<p><b>Note from SAFE Legal:</b> ' + esc_(r.safeNote) + '</p>' : '') +
    '<p>You can follow progress and download issued documents in your client portal.</p><p>Regards,<br>SAFE Legal Solutions<br>info@safelegal.org | +91 98861 81839 | safelegal.in</p></div>';
  safeMail_({ to: to, cc: s.safeCc, replyTo: s.safeTo, subject: 'Update on your request – ' + r.status + ' – SAFE Legal Solutions', htmlBody: html, name: s.senderName });
}

// ---------------------------------------------------------------- reminders
function settings_(db) {
  var s = db.settings || {};
  return {
    safeTo: s.safeTo || DEFAULTS.SAFE_TO,
    safeCc: s.safeCc || DEFAULTS.SAFE_CC,
    daysBefore: Number(s.reminderDaysBefore || DEFAULTS.REMINDER_DAYS_BEFORE),
    interval: Number(s.reminderIntervalDays || DEFAULTS.REMINDER_INTERVAL_DAYS),
    senderName: s.senderName || DEFAULTS.SENDER_NAME,
    appUrl: s.appUrl || '',
    portalAsk: s.portalAsk !== false,
    portalWording: s.portalWording !== false,
    lawWatch: s.lawWatch !== false,
    lawSources: s.lawSources || DEFAULT_LAW_SOURCES,
    modelMain: s.modelMain || 'claude-sonnet-5-5',
    modelFast: s.modelFast || 'claude-haiku-5-5'
  };
}

function dailyReminderJob() {
  var lock = LockService.getScriptLock();
  lock.waitLock(60000);
  try { runReminders_(false); } finally { lock.releaseLock(); }
}

function daysBetween_(fromIso, toIso) {
  var a = new Date(fromIso + 'T00:00:00Z').getTime();
  var b = new Date(toIso + 'T00:00:00Z').getTime();
  return Math.round((b - a) / 86400000);
}

function fmt_(iso) {
  if (!iso) return '';
  var m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var p = iso.split('-');
  return Number(p[2]) + ' ' + m[Number(p[1]) - 1] + ' ' + p[0];
}

/** Returns the valid email addresses in a comma/semicolon/space separated string. */
function validEmails_(str) {
  return String(str || '').split(/[,;\s]+/).map(function (e) { return e.trim(); }).filter(function (e) {
    return /^[^@\s<>"']+@[^@\s<>"']+\.[A-Za-z]{2,}$/.test(e);
  });
}

/** Sends an email without letting a bad address or a used-up quota break the calling action. */
function safeMail_(o) {
  try {
    MailApp.sendEmail(o);
    return true;
  } catch (err) {
    Logger.log('Email not sent to ' + o.to + ': ' + err);
    try {
      var props = PropertiesService.getScriptProperties();
      var log = JSON.parse(props.getProperty('MAIL_ERRORS') || '[]');
      log.push({ at: new Date().toISOString(), to: String(o.to || ''), subject: String(o.subject || ''), error: String(err && err.message || err) });
      props.setProperty('MAIL_ERRORS', JSON.stringify(log.slice(-30)));
    } catch (e2) { /* ignore */ }
    return false;
  }
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Finds documents in force that expire within the window and are due a weekly reminder. */
function runReminders_(dryRun) {
  var db = readDb_();
  var s = settings_(db);
  var today = Utilities.formatDate(new Date(), DEFAULTS.TZ, 'yyyy-MM-dd');
  var byClient = {};
  db.docs.forEach(function (d) {
    if (d.status === 'Archived' || !d.issued || !d.issued.expiryDate) return;
    var daysLeft = daysBetween_(today, d.issued.expiryDate);
    if (daysLeft > s.daysBefore) return;
    if (d.lastReminderAt && daysBetween_(d.lastReminderAt, today) < s.interval) return;
    (byClient[d.clientId] = byClient[d.clientId] || []).push({ doc: d, daysLeft: daysLeft });
  });
  var sent = [];
  Object.keys(byClient).forEach(function (clientId) {
    var client = db.clients.filter(function (c) { return c.id === clientId; })[0];
    if (!client) return;
    var items = byClient[clientId].sort(function (a, b) { return a.daysLeft - b.daysLeft; });
    var to = validEmails_(client.reminderEmails);
    var badClientEmail = !to.length;
    to.push(s.safeTo);
    var anyExpired = items.some(function (x) { return x.daysLeft < 0; });
    var subject = (anyExpired ? 'Action required: policies expired / expiring – ' : 'Reminder: policies due for renewal – ') + client.name;
    var rows = items.map(function (x) {
      var d = x.doc;
      var status = x.daysLeft < 0 ? '<b style="color:#C00000">Expired ' + (-x.daysLeft) + ' days ago</b>' : (x.daysLeft === 0 ? '<b style="color:#C00000">Expires today</b>' : x.daysLeft + ' days left');
      return '<tr><td style="padding:6px;border:1px solid #ccc">' + esc_(d.title) + '</td><td style="padding:6px;border:1px solid #ccc">' + esc_(d.ref) + '</td><td style="padding:6px;border:1px solid #ccc">' + esc_(d.issued.version) + '</td><td style="padding:6px;border:1px solid #ccc">' + fmt_(d.issued.expiryDate) + '</td><td style="padding:6px;border:1px solid #ccc">' + status + '</td></tr>';
    }).join('');
    var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">' +
      '<p>Dear ' + esc_(client.contactName || 'Sir / Madam') + ',</p>' +
      '<p>The following policies and documents of <b>' + esc_(client.name) + '</b> are due for review and renewal. Please let us know if there have been any changes in your business, headcount or locations so that we can update them before the expiry date.</p>' +
      '<table style="border-collapse:collapse;font-size:13px"><tr style="background:#801425;color:#fff"><th style="padding:6px;text-align:left">Document</th><th style="padding:6px;text-align:left">Reference</th><th style="padding:6px;text-align:left">Version</th><th style="padding:6px;text-align:left">Expiry date</th><th style="padding:6px;text-align:left">Status</th></tr>' + rows + '</table>' +
      '<p>You will receive this reminder every week until the documents are renewed.</p>' +
      (badClientEmail ? '<p style="color:#C00000"><b>Note for SAFE:</b> this client has no valid reminder email (' + esc_(client.reminderEmails || 'blank') + '), so only SAFE received this reminder. Please update the company profile.</p>' : '') +
      '<p>Regards,<br>SAFE Legal Solutions<br>info@safelegal.org | +91 98861 81839 | safelegal.in</p>' +
      (s.appUrl ? '<p style="font-size:11px;color:#888">Internal: <a href="' + esc_(s.appUrl) + '">open Policy Studio</a></p>' : '') +
      '</div>';
    var delivered = true;
    if (!dryRun) delivered = safeMail_({ to: to.join(','), cc: s.safeCc, replyTo: s.safeTo, subject: subject, htmlBody: html, name: s.senderName });
    if (!dryRun && delivered) {
      items.forEach(function (x) {
        x.doc.lastReminderAt = today;
        x.doc.reminderLog = (x.doc.reminderLog || []).concat([{ date: today, daysLeft: x.daysLeft, to: to.join(','), cc: s.safeCc }]).slice(-30);
      });
    }
    sent.push({ client: client.name, to: to, cc: s.safeCc, delivered: delivered, clientEmailMissing: badClientEmail, documents: items.map(function (x) { return x.doc.title + ' (' + x.daysLeft + ' days)'; }) });
  });
  if (!dryRun && sent.length) writeDb_(db);
  return { date: today, emails: sent.length, details: sent };
}


// ================================================================ AI ENGINE (Claude API)
// The API key is kept only in Script Properties (CLAUDE_API_KEY). It is never returned to any browser.
// AI output is always a suggestion: drafts land as Draft, law updates wait for SAFE's approval.

var DEFAULT_LAW_SOURCES = [
  'SEBI | https://www.sebi.gov.in/sebirss.xml',
  'PIB (Government press releases) | https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
  'RBI notifications | https://www.rbi.org.in/notifications_rss.xml',
  'RBI press releases | https://www.rbi.org.in/pressreleases_rss.xml'
].join('\n');

var LEGAL_STYLE = 'You are a senior Indian corporate, employment and regulatory lawyer at SAFE Legal Solutions, a law firm in Bengaluru. ' +
  'Write in precise, plain legal English as used by leading Indian law firms. Use Indian spelling. ' +
  'Refer only to Indian laws, rules and regulator directions that you are confident are in force as of your knowledge, including the four Labour Codes (in force from 21 November 2025), the Digital Personal Data Protection Act, 2023 and Rules, 2025, and sector regulators where relevant. ' +
  'Never invent a section number, circular number or case. If you are not sure of a section number, name the law without it. ' +
  'Where a fact, number or name must come from the client, write it as ??short description?? (two question marks on each side) so it is highlighted for completion.';

var MARKUP_RULES = 'Formatting rules (the text is converted to a Word document automatically): ' +
  'Start each section with a line "## Section heading" (do not number headings; numbering is automatic). ' +
  'Write clauses as "1.1 Text", "1.2 Text" (the first number is the section position; it is renumbered automatically). ' +
  'Use "- " for bullet points and "-- " for sub-bullets. Tables are lines like "| Column | Column |" with the first row as the header. ' +
  'Use **bold** sparingly for defined terms. Do not use any other Markdown, HTML or code fences. Do not add a document title, company letterhead, document control table, signature lines for policies, or a "review and amendment" section; these are added automatically.';

function aiStatus_() {
  var key = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  var s = settings_(readDb_());
  return { configured: !!key, keyHint: key ? key.slice(0, 10) + '…' + key.slice(-4) : '', modelMain: s.modelMain, modelFast: s.modelFast, lawWatch: s.lawWatch, portalAsk: s.portalAsk, portalWording: s.portalWording, lastLawWatch: PropertiesService.getScriptProperties().getProperty('LAST_LAW_WATCH') || '' };
}

/** Calls the Claude Messages API and returns the text of the reply. */
function claude_(o) {
  var key = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!key) throw new Error('AI is not set up yet. Add the Claude API key in Settings.');
  var s = settings_(readDb_());
  var body = { model: o.fast ? s.modelFast : s.modelMain, max_tokens: o.maxTokens || 2000, system: o.system, messages: [{ role: 'user', content: o.prompt }] };
  var last = '';
  for (var attempt = 0; attempt < 3; attempt++) {
    var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload: JSON.stringify(body),
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
    });
    var code = res.getResponseCode();
    var text = res.getContentText();
    if (code === 200) {
      var out = JSON.parse(text);
      return (out.content || []).filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; }).join('').trim();
    }
    last = code + ' ' + text.slice(0, 300);
    if (code === 429 || code === 529 || code >= 500) { Utilities.sleep(2000 * (attempt + 1)); continue; }
    break;
  }
  if (/401|authentication/i.test(last)) throw new Error('The Claude API key was rejected. Check it in Settings.');
  if (/credit|billing|balance/i.test(last)) throw new Error('The Claude account has no credit left. Add credit at console.anthropic.com.');
  throw new Error('The AI service did not respond (' + last.slice(0, 120) + '). Please try again.');
}

function parseJson_(text) {
  var t = String(text || '').replace(/```json|```/g, '');
  var a = t.indexOf('['), o = t.indexOf('{');
  var start = a < 0 ? o : (o < 0 ? a : Math.min(a, o));
  if (start < 0) throw new Error('The AI reply could not be read.');
  var open = t.charAt(start), close = open === '[' ? ']' : '}';
  var end = t.lastIndexOf(close);
  return JSON.parse(t.slice(start, end + 1));
}

/** Per-client limit on AI use from the portal (counts reset every 6 hours). */
function aiRateLimit_(clientId, kind, max) {
  var cache = CacheService.getScriptCache();
  var k = 'ai_' + kind + '_' + clientId;
  var n = Number(cache.get(k) || 0);
  if (n >= max) throw new Error('The limit for this feature has been reached for now. Please try again later or write to SAFE Legal.');
  cache.put(k, String(n + 1), 21600);
}

// ---------------------------------------------------------------- drafting
function aiDraft_(req) {
  var isAgr = req.kind === 'agreement';
  var prompt = 'Draft the operative provisions of the following ' + (isAgr ? 'agreement' : 'policy') + ' for an Indian company.\n\n' +
    'Document: ' + clip_(req.title, 300) + '\nLibrary section: ' + clip_(req.section, 200) + '\n' +
    'Company profile: industry ' + clip_(req.industry, 200) + '; legal form ' + clip_(req.legalForm, 100) + '; states of operation ' + clip_(req.states, 300) + '; headcount ' + clip_(req.headcount, 20) + '; regulators ' + clip_(req.regulators, 300) + '.\n' +
    (req.purpose ? 'Purpose given by SAFE: ' + clip_(req.purpose, 2000) + '\n' : '') +
    (req.notes ? 'Points SAFE wants covered or existing text to improve:\n' + clip_(req.notes, 6000) + '\n' : '') +
    '\nWhat to produce:\n' +
    (isAgr
      ? '- Operative clauses of the agreement: definitions, scope / obligations, consideration and payment, term and termination, confidentiality, intellectual property where relevant, data protection (DPDP Act) where personal data is involved, warranties, limitation of liability, indemnity, force majeure, notices, assignment and general provisions. Do NOT include the parties block, governing law, jurisdiction or signature block (added automatically).\n'
      : '- Operative sections of the policy: definitions where useful, the rules, the procedure step by step, timelines, records, and any legal requirements that apply given the industry, states and headcount. Do NOT include sections titled Purpose, Scope, Roles and responsibilities, Breach, or Review (added automatically).\n') +
    '- Then, separately, a one-paragraph purpose statement.\n\n' +
    'Reply in exactly this format:\nPURPOSE:\n<purpose paragraph>\n===BODY===\n<operative provisions in the markup>';
  var out = claude_({ system: LEGAL_STYLE + '\n\n' + MARKUP_RULES, prompt: prompt, maxTokens: 6000 });
  var parts = out.split('===BODY===');
  var purpose = (parts.length > 1 ? parts[0] : '').replace(/^\s*PURPOSE:\s*/i, '').trim();
  var body = (parts.length > 1 ? parts[1] : out).trim();
  return { purpose: purpose, body: body };
}

function aiLegalise_(text, ctx, mode) {
  text = String(text || '').trim();
  if (!text) throw new Error('Type something first.');
  var system = mode === 'request'
    ? LEGAL_STYLE + '\nYou help a client of SAFE Legal Solutions describe the document they need. Rewrite their words as a clear, well-structured instruction to the law firm, using correct legal terminology, keeping every point they made and adding nothing they did not ask for. Plain text with "- " bullets is fine. Reply with the rewritten text only.'
    : LEGAL_STYLE + '\n' + MARKUP_RULES + '\nRewrite the lawyer\'s rough notes as properly drafted clauses for the document named below. Keep the meaning, keep every point, do not add new obligations, and use ??...?? for any missing number, period or name. Reply with the drafted text only.';
  var prompt = 'Document: ' + clip_(ctx.title || '', 300) + ' (' + (ctx.kind || 'policy') + ')' + (ctx.industry ? '; industry: ' + clip_(ctx.industry, 100) : '') + '\n\nText to rewrite:\n' + text;
  return claude_({ system: system, prompt: prompt, maxTokens: 2500 });
}

// ---------------------------------------------------------------- recommendations
function aiRecommend_(profile, catalog) {
  var list = catalog.slice(0, 400).map(function (i) { return i.id + ' | ' + i.title + ' | ' + i.tag; }).join('\n');
  var prompt = 'Company profile:\n' + JSON.stringify(profile).slice(0, 3000) + '\n\nAvailable documents (id | title | tag M=mandatory by law, I=industry/regulator, R=recommended):\n' + list +
    '\n\nChoose the documents this company should have, most important first (at most 30). For each give a one-sentence reason a business owner understands, naming the law or regulator and any threshold that makes it apply (for example headcount or state). Only use ids from the list.\n' +
    'Reply with a JSON array only: [{"id": "...", "priority": "high|medium|low", "reason": "..."}]';
  var arr = parseJson_(claude_({ system: LEGAL_STYLE, prompt: prompt, maxTokens: 4000 }));
  var ids = {};
  catalog.forEach(function (i) { ids[i.id] = true; });
  return (arr || []).filter(function (x) { return x && ids[x.id]; }).map(function (x) {
    return { id: String(x.id), priority: /high|medium|low/.test(x.priority) ? x.priority : 'medium', reason: clip_(x.reason, 400) };
  });
}

// ---------------------------------------------------------------- client Q&A
function portalAsk_(db, c, question) {
  question = String(question || '').trim();
  if (question.length < 5) throw new Error('Please type your question.');
  var docs = db.docs.filter(function (d) { return d.clientId === c.id && d.status === 'Issued' && d.issued && d.issued.textFileId; });
  if (!docs.length) return { text: 'There are no issued policies in your portal yet that I can answer from. Please send your question to SAFE Legal using the button below.', sources: [], answered: false };
  var words = question.toLowerCase().match(/[a-z]{4,}/g) || [];
  var scored = docs.map(function (d) {
    var txt = '';
    try { txt = DriveApp.getFileById(d.issued.textFileId).getBlob().getDataAsString('UTF-8'); } catch (e) { txt = ''; }
    var low = (d.title + ' ' + txt).toLowerCase();
    var score = 0;
    words.forEach(function (w) { if (low.indexOf(w) >= 0) score += (d.title.toLowerCase().indexOf(w) >= 0 ? 5 : 1); });
    return { d: d, txt: txt, score: score };
  }).filter(function (x) { return x.txt; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 4);
  var context = scored.map(function (x) { return '=== ' + x.d.title + ' (' + x.d.ref + ', version ' + x.d.issued.version + ') ===\n' + x.txt.slice(0, 30000); }).join('\n\n');
  var system = 'You answer questions from employees and managers of ' + c.name + ' about the company\'s own issued policies, which are given below. ' +
    'Answer ONLY from those policies, in plain English, in at most 150 words, and name the policy and clause you relied on. ' +
    'If the policies do not answer the question, or the question asks for legal advice or about a specific dispute, say clearly that the policies do not cover it and that the question should be sent to SAFE Legal. Do not guess and do not use outside knowledge. ' +
    'End your reply with a line "ANSWERED: yes" or "ANSWERED: no".';
  var out = claude_({ system: system, prompt: 'Policies:\n' + context + '\n\nQuestion: ' + question, maxTokens: 700 });
  var answered = /ANSWERED:\s*yes/i.test(out);
  return { text: out.replace(/ANSWERED:\s*(yes|no)\s*$/i, '').trim(), sources: scored.map(function (x) { return x.d.title; }), answered: answered };
}

// ---------------------------------------------------------------- law watch
function ensureLawWatchTrigger_() {
  var has = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'dailyLawWatch'; });
  if (!has) ScriptApp.newTrigger('dailyLawWatch').timeBased().everyDays(1).atHour(7).inTimezone(DEFAULTS.TZ).create();
}

function dailyLawWatch() {
  var s = settings_(readDb_());
  if (!s.lawWatch || !PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY')) return;
  lawWatchRun_(false);
}

function strip_(h) {
  return String(h || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

/** Reads RSS or Atom feeds without an XML library (government feeds are often not strictly valid XML). */
function readFeed_(url) {
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (SAFE Policy Studio law watch)' } });
  if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode());
  var xml = res.getContentText();
  var items = [];
  var re = /<(item|entry)[\s>][\s\S]*?<\/\1>/gi, m;
  while ((m = re.exec(xml)) && items.length < 40) {
    var block = m[0];
    var g = function (tag) { var r = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i').exec(block); return r ? strip_(r[1]) : ''; };
    var link = g('link');
    if (!link) { var lm = /<link[^>]*href="([^"]+)"/i.exec(block); link = lm ? lm[1] : ''; }
    items.push({ title: g('title'), link: link, date: g('pubDate') || g('updated') || g('published') || g('dc:date'), description: g('description') || g('summary') || g('content') });
  }
  return items;
}

function lawWatchRun_(dryRun) {
  var db = readDb_();
  var s = settings_(db);
  var seen = {};
  (db.lawSeen || []).forEach(function (k) { seen[k] = true; });
  var sources = String(s.lawSources || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  var fresh = [], status = [];
  var cutoff = Date.now() - 14 * 86400000;
  sources.forEach(function (line) {
    var parts = line.split('|');
    var name = parts.length > 1 ? parts[0].trim() : line;
    var url = (parts.length > 1 ? parts.slice(1).join('|') : line).trim();
    try {
      var items = readFeed_(url);
      var added = 0;
      items.forEach(function (it) {
        var k = it.link || (name + ':' + it.title);
        if (!it.title || seen[k]) return;
        var t = Date.parse(it.date);
        if (!isNaN(t) && t < cutoff) { seen[k] = true; return; }
        seen[k] = true;
        fresh.push({ source: name, title: it.title, link: it.link, date: it.date, description: it.description.slice(0, 600), key: k });
        added++;
      });
      status.push({ source: name, ok: true, items: items.length, new: added });
    } catch (e) {
      status.push({ source: name, ok: false, error: String(e.message || e).slice(0, 100) });
    }
  });
  fresh = fresh.slice(0, 40);
  var updates = fresh.length ? analyseLawItems_(db, fresh) : [];
  if (!dryRun) {
    withLock_(function () {
      var db2 = readDb_();
      db2.lawUpdates = (db2.lawUpdates || []).concat(updates);
      var seenList = Object.keys(seen);
      db2.lawSeen = seenList.slice(-3000);
      writeDb_(db2);
    });
    PropertiesService.getScriptProperties().setProperty('LAST_LAW_WATCH', new Date().toISOString());
    if (updates.length) {
      safeMail_({ to: s.safeTo, cc: s.safeCc, name: s.senderName, subject: 'Law watch: ' + updates.length + ' change(s) to review',
        htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px"><p>The daily law watch found ' + updates.length + ' item(s) that may affect client policies:</p><ul>' +
          updates.map(function (u) { return '<li><b>' + esc_(u.title) + '</b> (' + esc_(u.source) + ', ' + esc_(u.urgency) + ')<br>' + esc_(u.summary) + '</li>'; }).join('') +
          '</ul><p>Review and approve them under <b>Law updates</b> in Policy Studio' + (s.appUrl ? ': <a href="' + esc_(s.appUrl) + '">open</a>' : '') + '. Nothing is shown to clients until you approve.</p></div>' });
    }
  }
  return { checked: fresh.length, relevant: updates.length, sources: status, updates: dryRun ? updates : undefined };
}

function catalogLines_(db) {
  var items = (db.catalog && db.catalog.items) || [];
  return items.map(function (i) { return i.id + ' | ' + i.title; }).join('\n');
}

function analyseLawItems_(db, fresh) {
  var prompt = 'Below are new publications from Indian government and regulator sources. For each, decide whether it changes or affects any company policy, agreement or employer/compliance obligation in India (labour and employment, data protection and IT, corporate governance, insurance, banking, securities, tax affecting employees, environment, sector rules, space, export control and similar). Ignore events, speeches, appointments, statistics, tenders and anything that does not change obligations.\n\n' +
    'Library of documents SAFE prepares (id | title):\n' + catalogLines_(db) + '\n\nPublications:\n' +
    fresh.map(function (f, i) { return '[' + i + '] ' + f.source + ' | ' + f.date + ' | ' + f.title + ' | ' + f.description; }).join('\n') +
    '\n\nReply with a JSON array containing ONLY the relevant publications: [{"index": 0, "title": "short title", "summary": "2-3 plain-English sentences on what changed and for whom", "action": "what companies must do, if anything", "effectiveDate": "YYYY-MM-DD or empty", "urgency": "high|medium|low", "affectedItemIds": ["ids from the library"], "industries": ["e.g. all, insurance, banking, IT"]}]. Reply [] if none are relevant.';
  var arr = [];
  try { arr = parseJson_(claude_({ system: LEGAL_STYLE, prompt: prompt, maxTokens: 4000, fast: true })); } catch (e) { Logger.log('Law analysis failed: ' + e); arr = []; }
  var ids = {};
  ((db.catalog && db.catalog.items) || []).forEach(function (i) { ids[i.id] = i.title; });
  return (arr || []).filter(function (x) { return x && fresh[x.index]; }).map(function (x) {
    var f = fresh[x.index];
    return lawUpdateFrom_(x, f.source, f.link, f.date, ids);
  });
}

function lawUpdateFrom_(x, source, link, date, ids) {
  return {
    id: 'law_' + randomToken_().slice(0, 12), createdAt: new Date().toISOString(), status: 'New', source: source || 'Manual', link: link || '', publishedAt: date || '',
    title: clip_(x.title, 300), summary: clip_(x.summary, 1500), action: clip_(x.action, 1500), effectiveDate: /^\d{4}-\d{2}-\d{2}$/.test(x.effectiveDate || '') ? x.effectiveDate : '',
    urgency: /high|medium|low/.test(x.urgency) ? x.urgency : 'medium',
    affectedItemIds: (x.affectedItemIds || []).filter(function (id) { return ids[id]; }).slice(0, 40),
    industries: (x.industries || []).slice(0, 10).map(function (v) { return clip_(v, 40); })
  };
}

function lawAnalyseManual_(req) {
  var db = readDb_();
  var text = clip_(req.text, 30000).trim();
  if (text.length < 40) throw new Error('Paste the text of the circular, notification or judgment (at least a few lines).');
  var prompt = 'A lawyer at SAFE Legal pasted the following Indian law change (circular, notification, amendment or judgment):\n\n' + text +
    '\n\nLibrary of documents SAFE prepares (id | title):\n' + catalogLines_(db) +
    '\n\nReply with a JSON object: {"title": "short title", "summary": "2-4 plain-English sentences on what changed and for whom", "action": "what companies must do, and by when", "effectiveDate": "YYYY-MM-DD or empty", "urgency": "high|medium|low", "affectedItemIds": ["ids from the library whose text may need to change"], "industries": ["all" or sectors]}';
  var x = parseJson_(claude_({ system: LEGAL_STYLE, prompt: prompt, maxTokens: 2500 }));
  var ids = {};
  ((db.catalog && db.catalog.items) || []).forEach(function (i) { ids[i.id] = i.title; });
  var u = lawUpdateFrom_(x, clip_(req.source, 120) || 'Added by SAFE', clip_(req.link, 500), clip_(req.date, 40), ids);
  withLock_(function () { var db2 = readDb_(); db2.lawUpdates = (db2.lawUpdates || []).concat([u]); writeDb_(db2); });
  return u;
}

/** Approve / dismiss a law update. Approving flags affected documents of all clients and can notify clients. */
function saveLawUpdate_(req) {
  var db = readDb_();
  var u = req.update;
  var old = (db.lawUpdates || []).filter(function (x) { return x.id === u.id; })[0];
  if (!old) return { ok: false, error: 'Law update not found' };
  var flagged = 0, clientsHit = {};
  if (u.status === 'Approved' && old.status !== 'Approved') {
    var ids = {};
    (u.affectedItemIds || []).forEach(function (id) { ids[id] = true; });
    db.docs.forEach(function (d) {
      if (!ids[d.itemId] || d.status === 'Archived') return;
      d.lawFlags = (d.lawFlags || []).filter(function (f) { return f.updateId !== u.id; });
      d.lawFlags.push({ updateId: u.id, title: u.title, summary: u.summary, action: u.action, at: new Date().toISOString(), resolved: false });
      flagged++;
      clientsHit[d.clientId] = (clientsHit[d.clientId] || []).concat([d.title]);
    });
    u.approvedAt = new Date().toISOString();
    u.flaggedDocs = flagged;
    u.flaggedClients = Object.keys(clientsHit).length;
  }
  upsert_(db.lawUpdates, u);
  writeDb_(db);
  if (req.notifyClients && u.status === 'Approved') {
    var s = settings_(db);
    Object.keys(clientsHit).forEach(function (cid) {
      var c = db.clients.filter(function (x) { return x.id === cid; })[0];
      var to = c ? validEmails_(c.reminderEmails).join(',') : '';
      if (!to) return;
      safeMail_({ to: to, cc: s.safeCc, replyTo: s.safeTo, name: s.senderName, subject: 'Change in law affecting your policies – ' + u.title,
        htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"><p>Dear ' + esc_(c.contactName || 'Sir / Madam') + ',</p><p>A recent change in law may affect the following policies of <b>' + esc_(c.name) + '</b>:</p><ul>' +
          clientsHit[cid].map(function (t) { return '<li>' + esc_(t) + '</li>'; }).join('') + '</ul><p><b>' + esc_(u.title) + '</b><br>' + esc_(u.summary) + '</p>' +
          (u.action ? '<p><b>What it means:</b> ' + esc_(u.action) + '</p>' : '') +
          '<p>SAFE Legal Solutions is reviewing these policies and will share updated versions where needed. You can see the status in your client portal.</p><p>Regards,<br>SAFE Legal Solutions</p></div>' });
    });
  }
  return { ok: true, flagged: flagged, clients: Object.keys(clientsHit).length };
}
