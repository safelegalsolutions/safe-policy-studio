# SAFE Policy Studio

An internal web app for **SAFE Legal Solutions** to generate policies, policy playbooks and agreements for client companies, on each client's own letterhead, with version control and automatic renewal reminders.

## What it does

- **Clients:** add a client with its industry, offices, states, headcount, signatory, data protection contacts and reminder email(s).
- **Industry selection:** 135 industries in 14 groups, including space science and technology, research and development, aerospace and defence, insurance and financial services. The industry decides which documents are suggested and which clauses appear (for example, IRDAI clauses for an insurance broker, SCOMET clauses for a space company).
- **Library:** 279 documents across the HR Playbook (the full 109-item Ethika list, sections A–O, plus extra letters), data protection and IT, corporate governance, industry-specific policies and agreements. Each is tagged **M** (mandatory by law), **I** (industry or regulator-driven) or **R** (recommended).
  - **47 are fully drafted** (`assets/js/templates/`): all prompts, conditional clauses and cross-references.
  - The rest are **structure-only**: they generate a correctly laid-out document with document control, scope, roles, breach and review clauses, and a box for the operative provisions. Each one becomes fully drafted when its template is added (see "Adding a template").
- **SAFE defaults to confirm:** suggested values (leave days, notice periods, limits) show in blue until accepted or changed. A document cannot be issued while any remain. Use **Accept all defaults** after checking them.
- **State-wise tables:** leave and holiday policies list each state from the company profile with its law; items to confirm are highlighted.
- **Prompts and placeholders:** every document shows only the prompts it needs. Answers are shared across a client's documents, so each detail is typed once. Anything left blank prints as a yellow-highlighted `[placeholder]`.
- **Letterhead:** upload the client's letterhead as a Word file (.docx: header, footer, logo and margins are kept and the content is written into it) or as an image (PNG/JPG: placed edge to edge at the top of each page, with an optional footer image).
- **Word output:** each document downloads as .docx. Headings are bold paragraphs rather than Word heading styles, so Word shows no collapse arrows.
- **Playbook:** compile any set of a client's documents into one Word file with a cover page and contents table.
- **Version control:** Draft → Under review → Advocate reviewed → Issued (v1.0). Revisions become v1.1 (minor) or v2.0 (substantive). The issued version stays in force until the new one is issued. Every issued version is kept with its date, approval, reviewer and Word file. Any edit after review sends the document back to Draft.
- **Renewal reminders:** each issued document has an expiry or review date. From **60 days before expiry**, a reminder email goes out **every week** to the client's reminder email(s) and **info@safelegal.org**, with a copy to **operations@safelegal.org**, until the document is renewed or archived. Reminders for one client are combined into one email. The app also shows a pop-up of renewals due when it opens.

## Client portal and SAFE Inbox

Each client can have its own portal (`portal.html`), which needs the Google backend.

- **Enable it:** open the client, then **Company profile → Client portal → Enable client portal**. The studio shows a private link and a 6-digit PIN, with a ready-made message to send. The PIN is shown only once and is stored only as a hash; use **Reset PIN** if it is lost, **New link + PIN** to invalidate an old link, or **Disable portal** to stop access.
- **What the client can do:** sign in with the PIN, then:
  - tick policies and agreements from the library (filtered to its industry, with M/I/R explained);
  - request a document that isn't listed, describing what it should cover;
  - submit, with name, email, priority and needed-by date;
  - follow each request under **My requests**;
  - download issued Word files and see review / expiry dates under **My documents**.
  Drafts are never shared.
- **What SAFE sees:** each request lands in the **Inbox** (top bar, with a count of new requests), and an email goes to info@safelegal.org with a copy to operations@safelegal.org. The client gets an acknowledgement. Open the request, untick anything you won't take up, add a note, then:
  - **Approve and add as drafts:** library items become drafts, and new requests become custom documents (or map them to a library item);
  - **Decline**, or **Mark in review**.
  The client is emailed about each update and sees your note in the portal.
- **Security:** the portal only returns that client's own data. The PIN is hashed with a salt. Five wrong PINs lock sign-in for 15 minutes. Sessions expire after 6 hours. Downloads are only possible for that client's issued documents. Studio functions still need the API key.

## Files

```
index.html                     the SAFE studio (static; runs on GitHub Pages)
portal.html                    the client portal
assets/js/portal.js            client portal logic
assets/app.css                 styles
assets/js/industries.js        industry list, tags and regulators
assets/js/catalog.js           the document library (sections, items, M/I/R tags)
assets/js/engine.js            template engine (placeholders, conditions, numbering)
assets/js/templates/*.js       fully drafted templates
assets/js/docxgen.js           Word generator (letterhead handling)
assets/js/store.js             storage (this browser, or Google Drive backend)
assets/js/app.js               user interface
apps-script/Code.gs            Google Apps Script backend (Drive storage + reminder emails)
apps-script/appsscript.json    Apps Script manifest
```

## 1. Publish the app on GitHub Pages

1. Create a repository, for example `safe-policy-studio`. A **private** repository is recommended, because the templates are SAFE Legal's drafting work. GitHub Pages on a private repository needs a paid GitHub plan (Pro, Team or Enterprise). On the free plan, the repository and its templates would be public.
2. Upload the contents of this folder to the repository root.
3. In **Settings → Pages**, set the source to the `main` branch, root folder. The app will be at `https://<your-account>.github.io/safe-policy-studio/`.

The app works immediately in **demo mode**, which keeps data in that browser only. Connect the Google backend for shared data, Drive storage and emails.

## 2. Set up the Google backend (data on Drive + reminder emails)

Use the Google account that should own the data and send the emails (for example safelegalsolutions@gmail.com, or a Workspace account on safelegal.org).

1. Go to <https://script.google.com> → **New project**. Name it "SAFE Policy Studio backend".
2. Replace the contents of `Code.gs` with `apps-script/Code.gs` from this repository.
3. Open **Project Settings** → tick "Show appsscript.json manifest file in editor". Replace `appsscript.json` with the one from this repository.
4. In the editor, select the function **`setup`** and click **Run**. Approve the permissions (Drive, sending email, triggers). This:
   - creates a Drive folder **SAFE Policy Studio** with the database file, a folder per client (Letterhead, Issued, Playbooks) and daily backups;
   - creates a daily trigger that sends reminders at about 9 a.m. IST;
   - prints an **API key** in the execution log. Copy it.
5. Click **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and copy the **web app URL**.
6. In the app, open **Settings**, choose **Google Drive backend**, paste the URL and the API key, click **Test connection**, then **Save settings**.
7. If you tried the app in demo mode first, use **Settings → Copy data from this browser to Google Drive**.

Notes:
- Requests are accepted only with the API key. Share it only with SAFE Legal staff who use the app. To change it, delete `API_KEY` under Project Settings → Script properties and run `setup` again.
- Email limits: a free Gmail account can send about 100 emails a day through Apps Script; Google Workspace allows about 1,500. One email goes per client per week, so this is ample.
- To change the addresses, the 60-day window or the weekly interval, use **Settings** in the app.
- After you edit `Code.gs`, use **Deploy → Manage deployments → Edit → New version**, so that the URL stays the same.

## 3. Daily use

1. **+ New client:** name, short code (used in reference numbers such as `EIBPL/HR/POL/001`), reminder email, industry.
2. **Company profile:** complete the details and upload the letterhead. Use **Download a sample page** to check the letterhead.
3. **Add from library:** use "Select mandatory + industry", add or remove items, then **Add**.
4. **Documents:** open each document, fill the prompts (the preview updates as you type), **Save**.
5. **Mark advocate-reviewed**, then **Issue v1.0**. Set the effective and expiry dates. The Word file downloads and, with the Google backend, is saved to the client's `Issued` folder.
6. **Compile playbook** to produce one Word file of all issued documents.
7. **Revise** an issued document to start v1.1 or v2.0. The issued version keeps its reminders until the new version is issued.

## Adding a template

Each template is registered in `assets/js/templates/*.js`:

```js
SAFE.tpl('hr-remote', {            // the id must match the item id in catalog.js
  v: '1.0',
  fields: [                        // prompts shown in the editor
    { k: 'wfhDays', l: 'Work-from-home days allowed per week', t: 'number', d: '2' },
    { k: 'eligibility', l: 'Who is eligible', t: 'textarea' },
  ],
  body: `
## Purpose
This policy sets out how employees of {{company.name}} may work remotely.
## Eligibility
2.1 {{eligibility}}
2.2 Employees may work from home up to {{wfhDays}} days a week.
[[if tag=insurance]]
2.3 Client data must not be accessed on personal devices, in line with IRDAI guidelines.
[[endif]]
`,
});
```

Markup: `## Heading`, `### Sub-heading`, `- bullet`, `-- sub-bullet`, `1.1 clause`, `(a) sub-clause`, `| table | row |`, `[[noheader]]` before a table without a header row, `**bold**`, `[[pagebreak]]`.

Placeholders: `{{field}}`, `{{company.name}}` (any profile field), `{{doc.effectiveDate|date}}`. Filters: `date`, `upper`, `lower`, `list`, `num`, `default:text`.

Conditions: `[[if …]] … [[else]] … [[endif]]`, on its own lines or inside a sentence. Examples: `tag=space`, `industry=ins-broker`, `reg=IRDAI`, `state=Karnataka`, `headcount>=50`, `fieldName=yes`, `not fieldName`, `A && B`, `A || B`.

Section headings are numbered automatically, and clause numbers follow their section even when an optional section is switched off. Add the new file to `index.html` if you create one.

To add an industry, edit `assets/js/industries.js`. To add a library item, edit `assets/js/catalog.js`.

## Legal note

Templates reflect Indian law as understood when drafted (October 2026), including the four Labour Codes, the POSH Act, the DPDP Act 2023 and DPDP Rules 2025, the CERT-In Directions and the IRDAI framework. Several obligations depend on headcount, state law and notifications. Every document must be reviewed by an advocate before issue; the app enforces this step.
