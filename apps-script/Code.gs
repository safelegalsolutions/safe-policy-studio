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
  db.clients = db.clients || []; db.docs = db.docs || []; db.settings = db.settings || {};
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
  var key = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!key || req.key !== key) return json_({ ok: false, error: 'Invalid API key' });
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    return json_(handle_(req));
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
      return { ok: true, db: db };
    case 'saveClient':
      db = readDb_();
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
