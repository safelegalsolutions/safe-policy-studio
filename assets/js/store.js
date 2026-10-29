/* SAFE Policy Studio — storage.
 * Two modes:
 *   - "local": everything is kept in this browser (IndexedDB). Good for trying the app; no emails.
 *   - "google": data, letterheads and issued files are kept on Google Drive through the
 *     Apps Script backend (apps-script/Code.gs), which also sends the expiry reminder emails. */
(function (root) {
  const S = (root.SAFE = root.SAFE || {});

  // ---------- small helpers ----------
  S.uid = (p) => (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  S.bufToB64 = (buf) => {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  S.b64ToBuf = (b64) => {
    const s = atob(b64);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out.buffer;
  };

  // ---------- connection settings (kept in this browser only) ----------
  const CONN_KEY = 'safe-policy-studio-connection';
  S.getConnection = () => {
    try { return JSON.parse(localStorage.getItem(CONN_KEY) || '{}'); } catch (e) { return {}; }
  };
  S.setConnection = (c) => { try { localStorage.setItem(CONN_KEY, JSON.stringify(c)); } catch (e) { /* ignore */ } };

  // ---------- IndexedDB key-value ----------
  function idb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('safe-policy-studio', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function kvGet(key) {
    const db = await idb();
    return new Promise((res, rej) => { const r = db.transaction('kv').objectStore('kv').get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  }
  async function kvSet(key, val) {
    const db = await idb();
    return new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(val, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  }

  class LocalStore {
    constructor() { this.mode = 'local'; this.db = null; }
    async load() {
      this.db = (await kvGet('db')) || { clients: [], docs: [], settings: {} };
      this.db.requests = this.db.requests || [];
      this.db.lawUpdates = this.db.lawUpdates || [];
      return this.db;
    }
    async _save() { await kvSet('db', this.db); }
    async saveClient(c) { upsert(this.db.clients, c); await this._save(); return c; }
    async deleteClient(id) { this.db.clients = this.db.clients.filter((c) => c.id !== id); this.db.docs = this.db.docs.filter((d) => d.clientId !== id); this.db.requests = (this.db.requests || []).filter((r) => r.clientId !== id); await this._save(); }
    async saveDoc(d) { upsert(this.db.docs, d); await this._save(); return d; }
    async saveDocs(ds) { ds.forEach((d) => upsert(this.db.docs, d)); await this._save(); }
    async deleteDoc(id) { this.db.docs = this.db.docs.filter((d) => d.id !== id); await this._save(); }
    async saveSettings(s) { this.db.settings = s; await this._save(); }
    async putFile({ name, mime, data }) { const id = S.uid('file'); await kvSet('file:' + id, { name, mime, b64: S.bufToB64(data) }); return { fileId: id }; }
    async getFile(fileId) { const f = await kvGet('file:' + fileId); if (!f) throw new Error('File not found in this browser'); return { name: f.name, mime: f.mime, data: S.b64ToBuf(f.b64) }; }
    async runReminders() { throw new Error('Reminder emails need the Google backend. Connect it in Settings.'); }
    async saveRequest(r) { this.db.requests = this.db.requests || []; upsert(this.db.requests, r); await this._save(); return r; }
    async deleteRequest(id) { this.db.requests = (this.db.requests || []).filter((r) => r.id !== id); await this._save(); }
    async setPortal() { throw new Error('The client portal needs the Google backend. Connect it in Settings first.'); }
    async ai() { throw new Error('AI features need the Google backend. Connect it in Settings first.'); }
    async exportAll() { return JSON.stringify(this.db, null, 2); }
  }

  class GoogleStore {
    constructor(url, key) { this.mode = 'google'; this.url = url; this.key = key; this.db = null; this.fileCache = {}; }
    async call(action, payload) {
      const res = await fetch(this.url, {
        method: 'POST',
        // text/plain avoids a CORS preflight, which Apps Script does not answer
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action, key: this.key }, payload || {})),
        redirect: 'follow',
      });
      if (!res.ok) throw new Error('Backend error ' + res.status);
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'Backend error');
      return out;
    }
    async load() { const r = await this.call('load'); this.db = r.db; this.db.clients = this.db.clients || []; this.db.docs = this.db.docs || []; this.db.settings = this.db.settings || {}; this.db.requests = this.db.requests || []; this.db.lawUpdates = this.db.lawUpdates || []; return this.db; }
    async saveRequest(r, notify) { await this.call('saveRequest', { request: r, notify: !!notify }); upsert(this.db.requests, r); return r; }
    async deleteRequest(id) { await this.call('deleteRequest', { id }); this.db.requests = this.db.requests.filter((r) => r.id !== id); }
    async setPortal(clientId, opts) {
      const r = await this.call('setPortal', Object.assign({ clientId }, opts || {}));
      const c = this.db.clients.find((x) => x.id === clientId);
      if (c) c.portal = r.portal;
      return r.portal;
    }
    async ai(action, payload) { return this.call(action, payload || {}); }
    async saveLawUpdate(u, notifyClients) { const r = await this.call('saveLawUpdate', { update: u, notifyClients: !!notifyClients }); return r; }
    deploymentId() { const m = /\/macros\/s\/([^/]+)\//.exec(this.url); return m ? m[1] : ''; }
    async saveClient(c) { await this.call('saveClient', { client: c }); upsert(this.db.clients, c); return c; }
    async deleteClient(id) { await this.call('deleteClient', { id }); this.db.clients = this.db.clients.filter((c) => c.id !== id); this.db.docs = this.db.docs.filter((d) => d.clientId !== id); this.db.requests = (this.db.requests || []).filter((r) => r.clientId !== id); }
    async saveDoc(d) { await this.call('saveDoc', { doc: d }); upsert(this.db.docs, d); return d; }
    async saveDocs(ds) { await this.call('saveDocs', { docs: ds }); ds.forEach((d) => upsert(this.db.docs, d)); }
    async deleteDoc(id) { await this.call('deleteDoc', { id }); this.db.docs = this.db.docs.filter((d) => d.id !== id); }
    async saveSettings(s) { await this.call('saveSettings', { settings: s }); this.db.settings = s; }
    async putFile({ clientId, name, mime, data, folder }) {
      const r = await this.call('upload', { clientId, name, mime, folder, base64: S.bufToB64(data) });
      this.fileCache[r.fileId] = { name, mime, data };
      return { fileId: r.fileId, url: r.url };
    }
    async getFile(fileId) {
      if (this.fileCache[fileId]) return this.fileCache[fileId];
      const r = await this.call('download', { fileId });
      const f = { name: r.name, mime: r.mime, data: S.b64ToBuf(r.base64) };
      this.fileCache[fileId] = f;
      return f;
    }
    async runReminders(dryRun) { return (await this.call('runReminders', { dryRun: !!dryRun })).result; }
    async testEmail(to) { return this.call('testEmail', { to }); }
    async ping() { return this.call('ping'); }
    async exportAll() { return JSON.stringify(this.db, null, 2); }
  }

  function upsert(arr, obj) {
    const i = arr.findIndex((x) => x.id === obj.id);
    if (i >= 0) arr[i] = obj; else arr.push(obj);
  }

  S.makeStore = () => {
    const c = S.getConnection();
    if (c.mode === 'google' && c.url && c.key) return new GoogleStore(c.url, c.key);
    return new LocalStore();
  };
  S.GoogleStore = GoogleStore;
})(typeof window !== 'undefined' ? window : globalThis);
