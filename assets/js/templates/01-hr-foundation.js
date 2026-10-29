/* Drafted templates — HR Playbook: foundation and hiring. */
(function (root) {
  const S = root.SAFE;

  S.tpl('hr-charter', {
    v: '1.0',
    fields: [
      { k: 'playbookOwner', l: 'Person who owns the HR Playbook', d: 'Head – Human Resources' },
      { k: 'approvingBody', l: 'Body that approves new policies and major changes', d: 'Board of Directors' },
      { k: 'minorChangeAuthority', l: 'Who approves minor changes', d: 'the Managing Director' },
      { k: 'publishLocation', l: 'Where the Playbook is published to employees', d: 'the company intranet and shared HR drive' },
      { k: 'ackDays', l: 'Days within which employees must acknowledge a new policy', t: 'number', d: '7' },
    ],
    body: `
## Purpose
This charter sets out how {{company.name}} (the "**Company**") makes, publishes, applies and changes the policies in its HR Playbook. It makes the Playbook the single written source of the Company's people rules.

## Scope
The Playbook applies to all employees, probationers, trainees, interns and fixed-term staff of the Company at every office and when working remotely. Where a policy also covers consultants or contract staff, it says so.

## Order of precedence
3.1 If there is a conflict, the following prevail in this order: (a) applicable law; (b) the individual's appointment letter or employment agreement, to the extent it is more favourable to the employee; (c) the policy in this Playbook that deals with the specific subject; (d) any other policy, circular or practice.
3.2 Nothing in the Playbook reduces a right or benefit that an employee has under law.
3.3 The Playbook is not a contract of employment. The Company may amend it under section 6 of this charter, subject to applicable law, including any notice of change required under the Industrial Relations Code, 2020.

## Ownership
4.1 {{playbookOwner}} owns the Playbook. The owner keeps the master copy, maintains the version log, coordinates reviews and answers questions on interpretation.
4.2 Each policy names its own policy owner, who is responsible for applying that policy day to day.
4.3 Where a question of interpretation cannot be settled by the owner, it is referred to {{minorChangeAuthority}}, whose decision is final, subject to law.

## Approval of policies
5.1 New policies and substantive changes are approved by the {{approvingBody}}.
5.2 Minor changes are approved by {{minorChangeAuthority}}. A minor change is one that corrects errors, updates names, contact details or forms, or reflects a change in law that leaves the Company no discretion.
5.3 Every approved policy carries a reference number, a version number, an effective date and a review date in its document control table.

## Amendment and version control
6.1 Minor changes increase the version number by 0.1 (for example, 1.0 to 1.1). Substantive changes increase it to the next whole number (for example, 1.1 to 2.0).
6.2 Each change is recorded in the version history at the end of the policy, with the date, a description and the approving authority.
6.3 Superseded versions are archived and retained under the HR Records and Document Retention policy. They are not deleted.

## Communication and acknowledgement
7.1 Policies are published on {{publishLocation}}. New joiners receive the Playbook during induction.
7.2 When a policy is issued or substantively changed, the Company informs employees in writing. Each employee acknowledges it, physically or electronically, within {{ackDays}} days.
7.3 Managers make sure their teams have read and understood the policies that affect them.

## Review
8.1 Each policy is reviewed at least once a year, and earlier if the law, a regulator's direction or the Company's business changes.
8.2 Policies are also reviewed after any dispute, inspection finding or complaint that shows a gap.
8.3 The owner keeps a review calendar listing every policy and its next review date.

## Exceptions
Any exception to a policy must be approved in writing by {{minorChangeAuthority}}, record the reason, and be limited in time. No exception may be made to a provision required by law.
`,
  });

  S.tpl('hr-code-of-conduct', {
    v: '1.0',
    fields: [
      { k: 'ethicsContact', l: 'Ethics contact / compliance officer', d: 'the Head – Human Resources' },
      { k: 'giftLimit', l: 'Gift value limit (₹) above which approval is needed', t: 'number', d: '2000' },
    ],
    body: `
## Purpose
This Code sets the standards of behaviour {{company.name}} (the "**Company**") expects from everyone who works for it. It applies with every other policy in the HR Playbook. Where a specific policy deals with a subject in more detail, that policy also applies.

## Who must follow this Code
This Code applies to all directors, employees, trainees, interns and fixed-term staff. Consultants, contract staff and agents must follow it when they act for the Company, and their contracts will say so.

## Core principles
Everyone covered by this Code must:
- act honestly, fairly and with integrity in all dealings;
- comply with the law and with the Company's policies;
- treat colleagues, clients and the public with dignity and respect;
- protect the Company's confidential information, assets and reputation;
- avoid conflicts of interest, and disclose any that arise; and
- speak up about conduct that breaches this Code.

## Compliance with law
4.1 Employees must comply with all laws that apply to their work, including labour, tax, data protection, anti-corruption and sector laws.
[[if tag=insurance]]
4.2 Employees must comply with the Insurance Act, 1938, the IRDAI regulations and guidelines applicable to {{company.name}} as an insurance intermediary, and the Company's code of conduct for broking staff.
[[endif]]
[[if tag=bfsi && not tag=insurance]]
4.2 Employees must comply with the directions of {{company.regulators}} applicable to the Company and to their role.
[[endif]]
[[if tag=export]]
4.3 Employees must comply with export control laws, including the SCOMET list under the Foreign Trade (Development and Regulation) Act, 1992, and the Company's export control policy.
[[endif]]

## Respect at work
5.1 The Company does not tolerate discrimination, harassment, bullying or violence of any kind. Sexual harassment is dealt with under the POSH policy.
5.2 Decisions on hiring, pay, promotion and exit are made on merit and on legitimate business grounds.

## Conflicts of interest
6.1 Employees must not let personal interests, relationships or outside activities influence their decisions for the Company.
6.2 Any actual or potential conflict must be disclosed in writing to the employee's manager and to {{ethicsContact}} before acting on the matter.

## Gifts, hospitality and bribery
7.1 Employees must not offer, give, ask for or accept any bribe, kickback or improper payment, directly or through anyone else. Facilitation payments are prohibited.
7.2 Gifts and hospitality may be accepted or given only if they are modest, occasional, not in cash or cash equivalents, and not intended to influence a decision. Any gift worth more than ₹{{giftLimit|num}} must be declared and approved in advance.
7.3 Dealings with public officials require extra care. No gift or hospitality may be offered to a public official without prior written approval.

## Confidentiality and data
8.1 Employees must keep the Company's and its clients' confidential information secret, during and after employment, and use it only for the Company's work.
8.2 Personal data must be handled under the Data Protection and Privacy Policy and the Digital Personal Data Protection Act, 2023.

## Company assets and systems
Company assets, money, devices, systems and time must be used for legitimate business purposes and protected from loss, theft and misuse. Employees must follow the IT acceptable use policy.

## Accurate records
Books, records, timesheets, expense claims and reports must be complete, accurate and honest. No one may create false entries or destroy records that must be kept.

## Communication and social media
Only authorised persons may speak for the Company to the media, regulators or the public. Employees must not post confidential information or statements that could harm the Company's reputation.

## Speaking up
12.1 Anyone who suspects a breach of this Code must report it to their manager, to {{ethicsContact}} or through the whistleblower mechanism.
12.2 The Company will not tolerate retaliation against anyone who reports a concern in good faith.

## Breach
A breach of this Code is misconduct and may lead to disciplinary action under the Disciplinary Action and Domestic Inquiry Procedure, up to and including dismissal, and to civil or criminal action where the law allows.

## Acknowledgement
Every person covered by this Code must sign an acknowledgement on joining and whenever the Code is materially changed.
`,
  });

  S.tpl('hr-records', {
    v: '1.0',
    fields: [
      { k: 'hrisName', l: 'HR system or location of personnel files', d: 'the HR drive and HR software' },
      { k: 'retentionAfterExit', l: 'Default retention of personnel files after exit (years)', t: 'number', d: '8' },
      { k: 'payrollRetention', l: 'Retention of payroll and statutory records (years)', t: 'number', d: '8' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") creates, keeps, protects and disposes of employee records, so that it meets its obligations under labour laws, tax laws and the Digital Personal Data Protection Act, 2023 (the "**DPDP Act**").

## Scope
It covers all records about job applicants, employees, former employees, trainees, interns and contract staff, in paper and electronic form, held in {{hrisName}} or anywhere else.

## Personnel file
3.1 The Company keeps one personnel file for each employee. It contains: the application and CV; identity, address and qualification documents; background verification results; the offer and appointment letter or employment agreement; nomination and declaration forms (PF, ESI, gratuity); confirmation, transfer, increment and promotion letters; appraisal records; training and certification records; leave records; disciplinary records; exit and settlement records.
3.2 Medical information, where the Company must hold it, is kept separately from the main file with restricted access.

## Data protection
4.1 The Company processes employee personal data under the Employee Privacy Notice and the Data Protection and Privacy Policy. It collects only what it needs for employment purposes or to comply with law.
4.2 Access to personnel files is limited to HR, the employee's reporting manager (for relevant records only), and others who need it for a legitimate purpose. Access is logged in electronic systems.
4.3 Personnel files are protected by reasonable security safeguards, including access control, encryption of electronic files where practical, and locked storage for paper files.
4.4 Employees may ask to see and correct their personal data under the DPDP Act through {{company.dpoName|default:the HR team}}.

## Statutory registers and records
The Company keeps the registers, records and returns required under the Code on Wages, 2019, the Code on Social Security, 2020, the Occupational Safety, Health and Working Conditions Code, 2020, the Industrial Relations Code, 2020, the applicable state Shops and Establishments Act and tax law, in the form and for the period those laws require. The HR compliance calendar lists them.

## Retention periods
| Record | Retention period |
| Personnel file (after exit) | {{retentionAfterExit}} years from the date of exit, or longer if a claim, dispute or inquiry is pending |
| Payroll, wage, attendance and statutory registers | {{payrollRetention}} years, or the longer period required by the relevant law |
| PF, ESI and gratuity records | As required under the Code on Social Security, 2020 and its schemes |
| Tax records (Form 16, TDS) | As required under the Income-tax law |
| Unsuccessful applicant data | 6 months after the hiring decision, unless the applicant consents to longer |
| POSH complaint and inquiry records | As required by law and the POSH policy, kept confidential |
[[if tag=insurance]]
| Records relating to insurance broking business handled by the employee | 10 years, as required by IRDAI |
[[endif]]

## Disposal
At the end of the retention period, records are securely destroyed or anonymised. Paper is shredded. Electronic records are deleted from live systems and backups in line with the backup cycle. A record of disposal is kept.

## Legal hold
If a claim, complaint, inspection or litigation is pending or expected, the Company suspends destruction of all relevant records until the matter is closed.
`,
  });

  S.tpl('hr-appointment-docs', {
    v: '1.0',
    fields: [
      { k: 'offerValidityDays', l: 'Offer letter validity (days)', t: 'number', d: '7' },
      { k: 'joiningDocsDays', l: 'Days to submit joining documents', t: 'number', d: '7' },
      { k: 'appointmentSignatory', l: 'Who signs offer and appointment letters', d: 'the Head – Human Resources or a Director' },
    ],
    body: `
## Purpose
This policy sets out the documents {{company.name}} (the "**Company**") issues and collects when it hires, so that every employee has written terms that comply with law.

## Offer letter
2.1 Every selected candidate receives a written offer letter stating the designation, place of work, date of joining, total compensation and the main conditions of the offer.
2.2 The offer is valid for {{offerValidityDays}} days unless extended in writing. It is conditional on satisfactory background verification and submission of joining documents.

## Appointment letter
3.1 The Company issues a written appointment letter to every employee on or before joining, as required by section 6(f) of the Occupational Safety, Health and Working Conditions Code, 2020.
3.2 The appointment letter or employment agreement states at least: name and designation; date of joining; place of work; wages and their components; working hours; probation period; leave entitlement; notice period; and reference to the HR Playbook.
3.3 Appointment letters are signed by {{appointmentSignatory}}. The employee signs a copy in acceptance.

## Employment agreement
Where the role requires it, the employee also signs the Company's employment agreement, which covers confidentiality, intellectual property, non-solicitation, data protection and other protective terms. Restrictive covenants after employment must be reasonable and are subject to section 27 of the Indian Contract Act, 1872.

## Joining documents
Within {{joiningDocsDays}} days of joining, the employee submits: proof of identity and address; educational and professional certificates; relieving letters from earlier employers; PAN; bank details; photographs; nomination forms for PF, ESI and gratuity; and signed acknowledgements of the Code of Conduct, POSH policy and Employee Privacy Notice.

## Statutory registration
HR enrols the employee in the Provident Fund and ESI schemes where applicable, records the Universal Account Number (UAN), and updates the statutory registers.

## Changes to terms
Any change to an employee's terms of employment is recorded in a letter signed by an authorised signatory. Where the change is one listed in the Third Schedule of the Industrial Relations Code, 2020, the Company gives notice of change as required by that Code.
`,
  });

  S.tpl('hr-contract-staff', {
    v: '1.0',
    fields: [
      { k: 'maxFixedTermMonths', l: 'Maximum fixed-term contract period (months)', t: 'number', d: '12' },
      { k: 'consultantApprover', l: 'Who approves engagement of consultants', d: 'the Managing Director' },
    ],
    body: `
## Purpose
This policy governs how {{company.name}} (the "**Company**") engages fixed-term employees, consultants and staff supplied by contractors, so that each is engaged on the correct legal basis and their rights are respected.

## Categories
2.1 **Fixed-term employees** are employees hired for a fixed period under a written contract.
2.2 **Consultants** are independent professionals engaged for a defined scope of work under a consultancy agreement. They are not employees.
2.3 **Contract staff** are workers employed by a contractor and deployed at the Company. They remain employees of the contractor.

## Fixed-term employment
3.1 Fixed-term contracts are used only for work that is time-bound, project-based or seasonal. The contract period does not normally exceed {{maxFixedTermMonths}} months, and renewal requires fresh approval.
3.2 Under the Industrial Relations Code, 2020, a fixed-term employee must receive the same hours of work, wages, allowances and other benefits as a permanent employee doing the same or similar work, on a pro-rata basis.
3.3 Under the Code on Social Security, 2020, a fixed-term employee is entitled to gratuity on a pro-rata basis if they render service for one year or more.
3.4 Non-renewal of a fixed-term contract on expiry is not retrenchment.

## Consultants
4.1 Consultants are engaged only with the approval of {{consultantApprover}} and under a written agreement covering scope, fees, term, confidentiality, intellectual property, data protection and termination.
4.2 Consultants are not given employee designations, are not placed on the payroll and do not receive employee benefits. Their invoices are subject to TDS and GST as applicable.
4.3 Managers must not control a consultant's day-to-day work as they would an employee's. Doing so risks the relationship being treated as employment.

## Contract staff
5.1 Contract staff are engaged only through contractors who hold the registrations and licences required under the Occupational Safety, Health and Working Conditions Code, 2020, and the Company follows the Outsourced and Contract Labour Management policy.
5.2 The Company checks each month that the contractor has paid wages and deposited PF and ESI contributions for the contract staff. If the contractor fails to pay, the Company as principal employer may have to pay and recover the amount.

## Data and confidentiality
Every fixed-term employee, consultant and contract worker signs a confidentiality undertaking and receives the Data Protection and Privacy Policy before being given access to Company or client data.
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
