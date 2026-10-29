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

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }
  var isPortal = /^portal/.test(String(req.action || ''));
  if (!isPortal) {
    var key = PropertiesService.getScriptProperties().getProperty('API_KEY');
    if (!key || req.key !== key) return json_({ ok: false, error: 'Invalid API key' });
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
      return { ok: true, quota: MailApp.getRemainingDailyQuota() };
    case 'load':
      db = readDb_();
      db.clients = db.clients.map(function (c) {
        if (!c.portal) return c;
        var copy = JSON.parse(JSON.stringify(c));
        delete copy.portal.pinHash; delete copy.portal.salt;
        return copy;
      });
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
      writeDb_(db);
      return { ok: true };
    case 'saveDoc':
      db = readDb_();
      upsert_(db.docs, req.doc);
      writeDb_(db);
      return { ok: true, doc: req.doc };
    case 'saveDocs':
      db = readDb_();
      for (i = 0; i < req.docs.length; i++) upsert_(db.docs, req.docs[i]);
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
    docs: docs.filter(function (d) { return d.status !== 'Archived' || d.issued; }).map(function (d) {
      return {
        id: d.id, itemId: d.itemId, title: d.title, ref: d.ref, stage: stageOf_(d),
        version: d.issued ? d.issued.version : null,
        effectiveDate: d.issued ? d.issued.effectiveDate : null,
        expiryDate: d.issued ? d.issued.expiryDate : null,
        canDownload: !!(d.issued && d.issued.fileId)
      };
    }),
    requests: db.requests.filter(function (r) { return r.clientId === c.id; }).map(function (r) {
      return {
        id: r.id, createdAt: r.createdAt, status: r.status, note: r.note, urgency: r.urgency, neededBy: r.neededBy,
        safeNote: r.safeNote || '', requestedBy: r.requestedBy || {},
        items: (r.items || []).map(function (i) {
          var d = i.docId ? byId[i.docId] : null;
          return { type: i.type, itemId: i.itemId, title: i.title, details: i.details, included: i.included !== false, stage: d ? stageOf_(d) : null };
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
          return { type: 'custom', kind: x.kind === 'agreement' ? 'agreement' : 'policy', title: clip_(x.title, 300), details: clip_(x.details, 4000) };
        }).filter(function (x) { return x.title; });
        if (!items.length && !custom.length) return { ok: false, error: 'Please select at least one document or describe a new one.' };
        var by = req.requestedBy || {};
        var r = {
          id: 'req_' + randomToken_().slice(0, 12), clientId: pc.id, createdAt: new Date().toISOString(), status: 'New',
          items: items.concat(custom), note: clip_(req.note, 4000), urgency: req.urgency === 'Urgent' ? 'Urgent' : 'Normal',
          neededBy: clip_(req.neededBy, 10),
          requestedBy: { name: clip_(by.name, 120), email: clip_(by.email, 160), phone: clip_(by.phone, 40) },
          history: [{ at: new Date().toISOString(), by: 'Client', action: 'Submitted' }]
        };
        db.requests.push(r);
        writeDb_(db);
        notifySafeOfRequest_(db, pc, r);
        return { ok: true, id: r.id, data: portalView_(db, pc) };
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
    '<p><b>Requested by:</b> ' + esc_(r.requestedBy.name) + ' · ' + esc_(r.requestedBy.email) + ' · ' + esc_(r.requestedBy.phone) + '</p>' +
    '<p>Review and approve it in the SAFE Inbox' + (s.appUrl ? ': <a href="' + esc_(s.appUrl) + '">open Policy Studio</a>' : '') + '.</p></div>';
  MailApp.sendEmail({ to: s.safeTo, cc: s.safeCc, replyTo: r.requestedBy.email || s.safeTo, subject: (r.urgency === 'Urgent' ? '[URGENT] ' : '') + 'New policy request – ' + c.name + ' (' + r.items.length + ' items)', htmlBody: html, name: s.senderName });
  var ackTo = r.requestedBy.email || c.reminderEmails;
  if (ackTo) {
    MailApp.sendEmail({ to: ackTo, replyTo: s.safeTo, subject: 'We have received your request – SAFE Legal Solutions', name: s.senderName,
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"><p>Dear ' + esc_(r.requestedBy.name || 'Sir / Madam') + ',</p><p>Thank you. SAFE Legal Solutions has received your request (reference ' + esc_(r.id) + ') for:</p>' + requestItemsHtml_(r) + '<p>We will review it and get back to you. You can follow its progress in your client portal.</p><p>Regards,<br>SAFE Legal Solutions<br>info@safelegal.org | +91 98861 81839 | safelegal.in</p></div>' });
  }
}

function notifyClientOfRequest_(db, r) {
  var s = settings_(db);
  var c = db.clients.filter(function (x) { return x.id === r.clientId; })[0];
  if (!c) return;
  var to = (r.requestedBy && r.requestedBy.email) || c.reminderEmails;
  if (!to) return;
  var included = (r.items || []).filter(function (i) { return i.included !== false; });
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222"><p>Dear ' + esc_((r.requestedBy && r.requestedBy.name) || c.contactName || 'Sir / Madam') + ',</p>' +
    '<p>Your request ' + esc_(r.id) + ' is now <b>' + esc_(r.status) + '</b>.</p>' +
    (r.status === 'Approved' || r.status === 'Completed' ? '<p>Documents included:</p>' + requestItemsHtml_({ items: included }) : '') +
    (r.safeNote ? '<p><b>Note from SAFE Legal:</b> ' + esc_(r.safeNote) + '</p>' : '') +
    '<p>You can follow progress and download issued documents in your client portal.</p><p>Regards,<br>SAFE Legal Solutions<br>info@safelegal.org | +91 98861 81839 | safelegal.in</p></div>';
  MailApp.sendEmail({ to: to, cc: s.safeCc, replyTo: s.safeTo, subject: 'Update on your request – ' + r.status + ' – SAFE Legal Solutions', htmlBody: html, name: s.senderName });
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
    appUrl: s.appUrl || ''
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
    var to = String(client.reminderEmails || '').split(/[,;\s]+/).filter(Boolean);
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
      '<p>Regards,<br>SAFE Legal Solutions<br>info@safelegal.org | +91 98861 81839 | safelegal.in</p>' +
      (s.appUrl ? '<p style="font-size:11px;color:#888">Internal: <a href="' + esc_(s.appUrl) + '">open Policy Studio</a></p>' : '') +
      '</div>';
    if (!dryRun) {
      MailApp.sendEmail({ to: to.join(','), cc: s.safeCc, replyTo: s.safeTo, subject: subject, htmlBody: html, name: s.senderName });
      items.forEach(function (x) {
        x.doc.lastReminderAt = today;
        x.doc.reminderLog = (x.doc.reminderLog || []).concat([{ date: today, daysLeft: x.daysLeft, to: to.join(','), cc: s.safeCc }]).slice(-30);
      });
    }
    sent.push({ client: client.name, to: to, cc: s.safeCc, documents: items.map(function (x) { return x.doc.title + ' (' + x.daysLeft + ' days)'; }) });
  });
  if (!dryRun && sent.length) writeDb_(db);
  return { date: today, emails: sent.length, details: sent };
}
