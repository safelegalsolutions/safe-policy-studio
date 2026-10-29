/* Drafted templates — data protection, space and R&D, agreements, letters. */
(function (root) {
  const S = root.SAFE;

  S.tpl('dp-privacy-policy', {
    v: '1.0',
    fields: [
      { k: 'roleClientData', l: "Company's role for client / customer data", t: 'select', o: ['Data Fiduciary', 'Data Processor', 'Data Fiduciary for some services and Data Processor for others'], d: 'Data Fiduciary' },
      { k: 'dataCategories', l: 'Main categories of personal data processed', t: 'textarea', d: 'identity and contact details, financial details, transaction records, communications' },
      { k: 'ciso', l: 'Information security owner (CISO / IT head)' },
      { k: 'retentionClient', l: 'Default retention for client data after the relationship ends', d: 'the period required by applicable law and regulators, and otherwise 3 years' },
      { k: 'sdf', l: 'Has the company been notified as a Significant Data Fiduciary?', t: 'select', o: ['no', 'yes'], d: 'no' },
    ],
    body: `
## Purpose
1.1 This policy sets out how {{company.name}} (the "**Company**") protects personal data, in compliance with the Digital Personal Data Protection Act, 2023 (the "**DPDP Act**"), the Digital Personal Data Protection Rules, 2025 (the "**DPDP Rules**"), the Information Technology Act, 2000 and the CERT-In Directions, 2022[[if tag=insurance]], together with the IRDAI regulations and guidelines that apply to the Company[[endif]].
1.2 It applies to all personal data processed by or for the Company, in digital form or in non-digital form that is later digitised, and to every employee, director, consultant and data processor.
1.3 The DPDP Rules were notified on 13 November 2025 and take effect in phases: the provisions on the Data Protection Board applied at once; the provisions on Consent Managers apply from 13 November 2026; and most obligations of Data Fiduciaries (notice, security safeguards, breach intimation, retention, rights of data principals and others) apply from 13 May 2027. The Company adopts this policy now, ahead of those dates, so that it is ready when each obligation applies.

## Roles under the DPDP Act
2.1 For the personal data of its employees, job applicants and its own business contacts, the Company is a **Data Fiduciary**.
2.2 For personal data of its clients' customers or employees that it handles to deliver services, the Company acts as a **{{roleClientData}}**.
[[if roleClientData=Data Processor]]
2.3 As a Data Processor, the Company processes that data only on the documented instructions of the client, under a data processing agreement, and assists the client in meeting its obligations as Data Fiduciary. It does not use that data for its own purposes.
[[endif]]
[[if tag=insurance]]
2.4 Where IRDAI regulations require the Company to retain records of broking business, the Company retains them for the period prescribed (generally 10 years) as a legal obligation, even where it otherwise acts as a Data Processor.
[[endif]]

## Principles
The Company processes personal data:
- only for a lawful purpose, on the basis of valid consent or a legitimate use under section 7 of the DPDP Act;
- only to the extent necessary for the specified purpose;
- accurately, and keeping it up to date where it is used to make decisions;
- with reasonable security safeguards; and
- for no longer than necessary, after which it is erased.

## Personal data processed
The main categories are: {{dataCategories}}. Children's data and data of persons with disabilities are processed only with verifiable consent of the parent or lawful guardian, as required by section 9 of the DPDP Act and the DPDP Rules.

## Notice and consent
5.1 Where the Company relies on consent, it gives a notice that is clear, in plain language and available in English and, on request, in any language in the Eighth Schedule to the Constitution. The notice describes the personal data, the purpose, how to withdraw consent, how to exercise rights and how to complain to the Data Protection Board of India (the "**Board**").
5.2 Consent is free, specific, informed, unconditional and unambiguous, given by a clear affirmative action, and limited to the data needed for the purpose. Withdrawal is as easy as giving consent.
5.3 Records of notices given and consents obtained are kept.

## Rights of data principals
6.1 Data principals may ask for: a summary of their personal data and processing activities; correction, completion, updating and erasure of their data; grievance redressal; and nomination of a person to exercise their rights on death or incapacity.
6.2 Requests are received at {{company.dpoEmail}}, verified, and answered within the period prescribed under the DPDP Rules.

## Security safeguards
7.1 The Company implements reasonable security safeguards, including: encryption, obfuscation or masking where appropriate; access control by role; logging and monitoring of access; backups and business continuity; and contracts requiring equivalent safeguards from processors.
7.2 Logs and personal data needed to detect and investigate breaches are retained for at least one year, as required by the DPDP Rules, and ICT system logs for 180 days in India, as required by the CERT-In Directions.
7.3 {{ciso}} is responsible for information security. The technical and organisational security controls are set out in the Company's separate IT and Information Security Policy, which forms part of these safeguards.

## Personal data breaches and cyber incidents
8.1 Any suspected breach must be reported internally at once under the Personal Data Breach and Cyber Incident Response Plan.
8.2 The Company informs the Board and each affected data principal of a personal data breach without delay, and gives the Board a detailed report within 72 hours of becoming aware of it, or such longer period as the Board allows.
8.3 Cyber incidents of the types listed by CERT-In are reported to CERT-In within six hours of being noticed.
[[if tag=insurance]]
8.4 Cyber incidents are also reported to IRDAI within the timelines in its Information and Cyber Security Guidelines.
[[endif]]

## Data processors
The Company engages data processors only under a written contract that requires them to process data on the Company's instructions, apply reasonable security safeguards, report breaches promptly, assist with data principals' rights, and delete or return data at the end of the contract.

## Retention and erasure
10.1 Personal data is erased when the purpose is no longer served or consent is withdrawn, unless retention is required by law. Client data is retained for {{retentionClient}}.
10.2 Retention periods for employee data are set out in the HR Records and Document Retention policy.

## Transfers outside India
Personal data may be transferred outside India except to countries restricted by the Central Government, subject to any requirements the Government imposes, and with contractual safeguards.

[[if sdf=yes]]
## Significant Data Fiduciary obligations
As a Significant Data Fiduciary, the Company has appointed a Data Protection Officer based in India, appointed an independent data auditor, and carries out a data protection impact assessment and audit every year, as required by section 10 of the DPDP Act and the DPDP Rules.
[[endif]]

## Governance
- Contact for data protection: {{company.dpoName}} ({{company.dpoEmail}}). Grievance Officer: {{company.grievanceOfficer}} ({{company.grievanceEmail}}).
- All employees receive data protection training on joining and every year.
- A breach of this policy is misconduct and may lead to disciplinary action.
`,
  });

  S.tpl('dp-breach', {
    v: '1.0',
    fields: [
      { k: 'irtLead', l: 'Incident response team lead' },
      { k: 'irtMembers', l: 'Incident response team members (one per line)', t: 'textarea', d: 'IT / information security\nLegal (SAFE Legal Solutions)\nHR\nCommunications' },
      { k: 'reportChannel', l: 'Internal reporting channel', d: '' },
    ],
    body: `
## Purpose
This plan sets out how {{company.name}} (the "**Company**") responds to personal data breaches and cyber incidents, so that harm is contained and the Company meets its reporting obligations under the Digital Personal Data Protection Act, 2023 and Rules, 2025 and the CERT-In Directions, 2022[[if tag=insurance]], and the IRDAI Information and Cyber Security Guidelines[[endif]].

## Reporting timelines at a glance
| Who | What | When |
| Any employee | Report the suspected incident internally to {{reportChannel}} | Immediately |
| Company | Report to CERT-In (incidents of the types it lists) | Within 6 hours of noticing |
[[if tag=insurance]]
| Company | Initial report to IRDAI | Within 6 hours |
| Company | Detailed report to IRDAI | Within 24 hours, with updates as directed |
[[endif]]
| Company | Intimation to the Data Protection Board of India | Without delay |
| Company | Detailed report to the Data Protection Board of India | Within 72 hours of becoming aware |
| Company | Intimation to affected data principals | Without delay |

## Incident response team
Lead: {{irtLead}}. Members: {{irtMembers}}.

## Response steps
4.1 **Detect and report:** anyone who notices a possible incident reports it at once, with what they saw and when.
4.2 **Assess:** the team confirms whether an incident or breach has occurred, its nature, the data and systems affected, and the likely harm.
4.3 **Contain:** isolate affected systems, revoke compromised credentials, recall misdirected emails where possible, and preserve evidence and logs.
4.4 **Notify:** make the notifications in the table above. The intimation to data principals describes the breach, its likely consequences, the mitigation measures, safety measures they can take, and a contact person.
4.5 **Remediate:** remove the cause, restore systems from clean backups and confirm the fix.
4.6 **Review:** within 30 days, record the root cause, lessons learned and actions to prevent recurrence.

## Records
Every incident is logged with the timeline of discovery, actions and notifications, and the log is kept for at least the period required by law.

## Testing
The plan is tested through a tabletop exercise at least once a year.
`,
  });

  S.tpl('space-export-control', {
    v: '1.0',
    fields: [
      { k: 'ecOfficer', l: 'Export control officer (name and designation)' },
      { k: 'controlledAreas', l: 'Main controlled products / technologies', t: 'textarea', d: 'spacecraft and launch vehicle subsystems, propulsion, guidance and navigation, related software and technical data' },
    ],
    body: `
## Purpose
{{company.name}} (the "**Company**") handles goods, software and technology that may be controlled for export. This policy makes sure the Company complies with India's export control laws, including the Foreign Trade (Development and Regulation) Act, 1992, the Foreign Trade Policy and the SCOMET list (Special Chemicals, Organisms, Materials, Equipment and Technologies), the Weapons of Mass Destruction and their Delivery Systems (Prohibition of Unlawful Activities) Act, 2005, and any foreign export control laws that apply to items the Company receives.

## What is controlled
2.1 The SCOMET list includes, among other categories, aerospace systems, equipment and related technology (Category 5), and dual-use items and technology (Category 8). The Company's main controlled areas are: {{controlledAreas}}.
2.2 "Export" includes the transfer of technology or software by any means, including email, cloud sharing, file transfer, technical assistance, training or visits, and not only physical shipment.

## Classification
3.1 Every product, component, software and technical data set is classified against the SCOMET list before it is exported, shared outside the Company or shown to a foreign national. Classification is recorded and reviewed when the item changes.
3.2 Items received from foreign suppliers are recorded with any foreign export control classification and re-export conditions attached to them.

## Licences and screening
4.1 No controlled item or technology is exported without the required DGFT authorisation, or other authorisation where applicable.
4.2 Every customer, end-user, consignee and intermediary is screened against Indian and applicable international restricted-party lists before a transaction.
4.3 The Company obtains end-use and end-user certificates where required and watches for red flags such as unusual routing, vague end-use, or reluctance to give end-user information.
4.4 Even if an item is not listed, the Company will not export it if it knows or has reason to believe that it is intended for a weapons of mass destruction programme (the "catch-all" control).

## Technology control
5.1 Controlled technical data is marked, stored in access-controlled repositories, and shared only with authorised persons.
5.2 Access by foreign nationals, including employees, interns and visitors, is approved by {{ecOfficer}} under the Technology Control Plan.
5.3 Controlled technical data is not carried abroad on laptops or devices, or accessed from abroad, without approval.

## Responsibilities and training
6.1 {{ecOfficer}} is the export control officer, approves classifications and licence applications, and keeps records.
6.2 Engineering, sales, procurement, logistics and IT staff receive export control training on joining and every year.

## Records and violations
7.1 Export records, classifications, licences and screening results are kept for at least five years, or longer if required.
7.2 Any suspected violation must be reported immediately to the export control officer. The Company will consider voluntary disclosure to the authorities where appropriate.
`,
  });

  S.tpl('space-inspace', {
    v: '1.0',
    fields: [
      { k: 'spaceActivities', l: 'Space activities the company carries out', t: 'textarea', d: 'satellite design and manufacture; satellite operations; ground station operations' },
      { k: 'authOfficer', l: 'Officer responsible for IN-SPACe authorisations' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") obtains and complies with authorisations for its space activities under the Indian Space Policy, 2023 and the norms, guidelines and procedures issued by the Indian National Space Promotion and Authorisation Centre ("**IN-SPACe**").

## Activities covered
The Company carries out the following space activities: {{spaceActivities}}.

## Authorisation
3.1 Before undertaking any space activity that requires authorisation, such as launching or operating a space object, establishing or operating a ground station, or disseminating certain earth observation data, the Company obtains the authorisation required from IN-SPACe.
3.2 {{authOfficer}} tracks every authorisation, its conditions and validity, and applies for renewal or modification well before expiry.
3.3 Spectrum, frequency and orbital resource requirements are coordinated through the Department of Telecommunications and other authorities, as required.

## Compliance with conditions
The Company complies with all conditions of each authorisation, including on safety, insurance and liability, debris mitigation, data sharing, change of control and reporting of incidents.

## Foreign investment and control
Any investment in, or change of control of, the Company is checked against the foreign direct investment limits and conditions for the space sector, and any approval required is obtained before the transaction completes.

## Interaction with ISRO and government
Use of ISRO or government facilities, data or technology is governed by the relevant agreements, and the Company complies with the confidentiality and security obligations in them.

## Records and review
The Company keeps copies of all applications, authorisations, correspondence and compliance reports. This policy is reviewed whenever the space regulatory framework changes.
`,
  });

  S.tpl('rnd-ip-invention', {
    v: '1.0',
    fields: [
      { k: 'ipCommittee', l: 'IP committee / person who reviews invention disclosures', d: 'the IP Committee' },
      { k: 'disclosureDays', l: 'Days to submit an invention disclosure after conception', t: 'number', d: '30' },
      { k: 'filingReward', l: 'Reward on filing a patent application (₹)', d: '25000' },
      { k: 'grantReward', l: 'Reward on grant of a patent (₹)', d: '50000' },
    ],
    body: `
## Purpose
This policy sets out how inventions and other intellectual property created at {{company.name}} (the "**Company**") are disclosed, owned, protected and rewarded.

## Ownership
2.1 All inventions, designs, software, data, know-how, works and other intellectual property conceived or developed by employees in the course of employment, or using the Company's resources or confidential information, belong to the Company. Employees assign them to the Company under their employment agreement and execute any document needed to perfect the Company's rights.
2.2 Consultants, interns and collaborators assign intellectual property to the Company under their agreements before they start work.
2.3 Intellectual property created under a collaboration, grant or customer contract is owned as that contract provides.

## Invention disclosure
3.1 An employee who conceives an invention submits an invention disclosure form to {{ipCommittee}} within {{disclosureDays}} days.
3.2 Until the Company decides how to protect the invention, it must be kept confidential and must not be published, presented or shared outside the Company.

## Evaluation and protection
4.1 {{ipCommittee}} evaluates each disclosure for patentability, commercial value and strategic fit, and decides whether to file a patent application, keep it as a trade secret, or release it.
4.2 Patent applications are filed under the Patents Act, 1970. Where the invention was made in India, the Company files first in India or obtains a foreign filing licence under section 39 of that Act before filing abroad.

## Rewards
Inventors named in a patent application receive ₹{{filingReward}} on filing and ₹{{grantReward}} on grant, shared equally among co-inventors unless agreed otherwise. Rewards do not create any right to royalties.

## Third-party IP
Employees must not use third-party confidential information, or software and data in breach of licence terms, in the Company's work. Open source software is used under the Open Source policy.
`,
  });

  // ---------------- Agreements ----------------
  S.tpl('agr-mutual-nda', {
    v: '1.0',
    fields: [
      { k: 'counterpartyName', l: 'Counterparty name' },
      { k: 'counterpartyDescription', l: 'Counterparty description (company type, CIN, registered address)', t: 'textarea' },
      { k: 'counterpartySignatory', l: 'Counterparty signatory' },
      { k: 'counterpartyDesignation', l: 'Counterparty signatory designation' },
      { k: 'purpose', l: 'Purpose of disclosure', t: 'textarea', d: 'evaluating and discussing a possible business relationship between the parties' },
      { k: 'termMonths', l: 'Term of the agreement (months)', t: 'number', d: '24' },
      { k: 'survivalYears', l: 'Confidentiality survives for (years after expiry)', t: 'number', d: '3' },
      { k: 'disputeMode', l: 'Dispute resolution', t: 'select', o: ['courts', 'arbitration'], d: 'arbitration' },
    ],
    body: `
This Mutual Non-Disclosure Agreement (the "**Agreement**") is made on {{doc.effectiveDate|date}} (the "**Effective Date**") between:
(a) {{company.name}}, a company incorporated in India with CIN {{company.cin}}, having its registered office at {{company.regAddress}}; and
(b) {{counterpartyName}}, {{counterpartyDescription}},
each a "**Party**" and together the "**Parties**".

## 1. Purpose
The Parties wish to share confidential information with each other for the purpose of {{purpose}} (the "**Purpose**").

## 2. Confidential Information
2.1 "Confidential Information" means all information disclosed by a Party (the "**Discloser**") to the other (the "**Recipient**") in connection with the Purpose, in any form, that is marked confidential or that a reasonable person would treat as confidential, including business plans, financial information, customer data, technology, know-how, software, designs and trade secrets.
2.2 Confidential Information does not include information that the Recipient can show: (a) is or becomes public other than through the Recipient's breach; (b) was lawfully known to it before disclosure without a duty of confidence; (c) is lawfully received from a third party without restriction; or (d) is independently developed without use of the Discloser's information.

## 3. Obligations
3.1 The Recipient shall: (a) use the Confidential Information only for the Purpose; (b) keep it confidential with at least the care it uses for its own confidential information, and no less than reasonable care; and (c) disclose it only to its directors, employees and professional advisers who need to know it for the Purpose and are bound by confidentiality obligations at least as protective as this Agreement.
3.2 The Recipient is responsible for any breach of this Agreement by persons to whom it discloses Confidential Information.
3.3 The Recipient may disclose Confidential Information if required by law, a court or a regulator, after giving the Discloser prompt notice where lawful, and disclosing only what is required.

## 4. Personal data
If Confidential Information includes personal data, each Party shall process it in compliance with the Digital Personal Data Protection Act, 2023 and the rules made under it, only for the Purpose, with reasonable security safeguards, and shall notify the other Party without delay of any personal data breach affecting it.

## 5. No licence or obligation
All Confidential Information remains the property of the Discloser. No licence or other right is granted, except the limited right to use it for the Purpose. Neither Party is obliged to enter into any further transaction.

## 6. Return and destruction
On the Discloser's written request, or at the end of the Purpose, the Recipient shall promptly return or destroy the Confidential Information and confirm this in writing, except copies it must keep by law or in automatic backups, which remain subject to this Agreement.

## 7. Term
This Agreement remains in force for {{termMonths}} months from the Effective Date. The obligations of confidentiality survive for {{survivalYears}} years after its expiry or termination, and for trade secrets, for as long as they remain trade secrets.

## 8. Remedies
The Parties agree that damages may not be an adequate remedy for breach, and the Discloser is entitled to seek injunctive relief and specific performance in addition to any other remedy.

## 9. Governing law and disputes
9.1 This Agreement is governed by the laws of India.
[[if disputeMode=arbitration]]
9.2 Any dispute arising out of or in connection with this Agreement shall be referred to arbitration by a sole arbitrator appointed by mutual agreement, under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be {{company.jurisdiction}}, and the language shall be English. The courts at {{company.jurisdiction}} have exclusive jurisdiction for interim relief and matters relating to the arbitration.
[[else]]
9.2 The courts at {{company.jurisdiction}} have exclusive jurisdiction over any dispute arising out of this Agreement.
[[endif]]

## 10. General
This Agreement is the entire agreement on its subject. It may be amended only in writing signed by both Parties. Neither Party may assign it without the other's consent. It may be signed in counterparts and electronically.

| For {{company.name}} | For {{counterpartyName}} |
| Signature: ______________________ | Signature: ______________________ |
| Name: {{company.signatoryName}} | Name: {{counterpartySignatory}} |
| Designation: {{company.signatoryDesignation}} | Designation: {{counterpartyDesignation}} |
| Date: | Date: |
`,
  });

  S.tpl('agr-dpa', {
    v: '1.0',
    fields: [
      { k: 'companyRole', l: 'Role of this client company', t: 'select', o: ['Data Fiduciary', 'Data Processor'], d: 'Data Fiduciary' },
      { k: 'counterpartyName', l: 'Counterparty name' },
      { k: 'counterpartyDescription', l: 'Counterparty description (company type, CIN, registered address)', t: 'textarea' },
      { k: 'counterpartySignatory', l: 'Counterparty signatory' },
      { k: 'counterpartyDesignation', l: 'Counterparty signatory designation' },
      { k: 'mainAgreement', l: 'Main agreement this DPA supplements', d: 'the Master Services Agreement dated ___' },
      { k: 'processingDescription', l: 'Description of processing (subject matter, data categories, data principals)', t: 'textarea' },
      { k: 'breachHours', l: 'Processor must notify a breach within (hours)', t: 'number', d: '24' },
    ],
    body: `
This Data Processing Agreement (the "**DPA**") is made on {{doc.effectiveDate|date}} between {{company.name}}, having its registered office at {{company.regAddress}}, and {{counterpartyName}}, {{counterpartyDescription}}. It supplements {{mainAgreement}} (the "**Main Agreement**").
[[if companyRole=Data Fiduciary]]
In this DPA, {{company.name}} is the "**Data Fiduciary**" and {{counterpartyName}} is the "**Data Processor**".
[[else]]
In this DPA, {{counterpartyName}} is the "**Data Fiduciary**" and {{company.name}} is the "**Data Processor**".
[[endif]]

## 1. Definitions
Terms such as "personal data", "processing", "data principal", "Data Fiduciary", "Data Processor" and "personal data breach" have the meanings given in the Digital Personal Data Protection Act, 2023 (the "**DPDP Act**").

## 2. Processing details
{{processingDescription}}

## 3. Processor obligations
The Data Processor shall:
3.1 process personal data only on the documented instructions of the Data Fiduciary and for the purposes of the Main Agreement, and inform the Data Fiduciary if an instruction appears to breach the law;
3.2 ensure that persons authorised to process the personal data are bound by confidentiality;
3.3 implement reasonable security safeguards, including encryption, access control, logging and backup, appropriate to the risk;
3.4 not engage a sub-processor without the Data Fiduciary's prior written consent, and impose on any sub-processor obligations no less protective than this DPA;
3.5 notify the Data Fiduciary of any personal data breach without undue delay and in any case within {{breachHours}} hours of becoming aware of it, with the information needed for the Data Fiduciary to meet its reporting obligations under the DPDP Act and the CERT-In Directions;
3.6 assist the Data Fiduciary in responding to requests from data principals and in meeting its obligations under the DPDP Act;
3.7 not transfer personal data outside India except as permitted by the Data Fiduciary and by law;
3.8 retain logs of processing for at least one year or as required by law; and
3.9 at the end of the Main Agreement, or earlier on request, delete or return all personal data and certify this in writing, unless retention is required by law.

## 4. Audit
The Data Processor shall make available the information needed to demonstrate compliance with this DPA and allow audits by the Data Fiduciary or its appointed auditor, on reasonable notice, not more than once a year except after a breach.

## 5. Liability and indemnity
Each party is liable for its breach of this DPA. The Data Processor shall indemnify the Data Fiduciary against penalties, claims and losses arising from the Data Processor's breach of this DPA or of the DPDP Act, subject to the limitation of liability in the Main Agreement, except that the limitation shall not apply to breaches of section 3.5 or wilful misconduct.

## 6. Term and precedence
This DPA continues for as long as the Data Processor processes personal data for the Data Fiduciary. If there is a conflict between this DPA and the Main Agreement on data protection, this DPA prevails.

## 7. Governing law
This DPA is governed by the laws of India, and disputes are resolved as provided in the Main Agreement.

| For {{company.name}} | For {{counterpartyName}} |
| Signature: ______________________ | Signature: ______________________ |
| Name: {{company.signatoryName}} | Name: {{counterpartySignatory}} |
| Designation: {{company.signatoryDesignation}} | Designation: {{counterpartyDesignation}} |
| Date: | Date: |
`,
  });

  // ---------------- Letters and forms ----------------
  S.tpl('tpl-acknowledgement', {
    v: '1.0',
    fields: [
      { k: 'policiesListBlock', l: 'Policies being acknowledged (one per line, starting with "- ")', t: 'textarea', d: '- Code of Conduct and Business Ethics\n- Prevention of Sexual Harassment (POSH) policy\n- Employee privacy notice' },
    ],
    body: `
## Policy acknowledgement form
To: {{company.name}}
I acknowledge that I have received, read and understood the following policies of {{company.name}}:
{{policiesListBlock}}
I agree to comply with these policies and with any amendments communicated to me. I understand that a breach may lead to disciplinary action. I understand that I may ask HR to explain any part of these policies.
[[noheader]]
| Employee name | |
| Employee ID | |
| Designation | |
| Signature | |
| Date | |
`,
  });

  S.tpl('tpl-relieving', {
    v: '1.0',
    fields: [
      { k: 'employeeName', l: 'Employee name' },
      { k: 'employeeId', l: 'Employee ID' },
      { k: 'designation', l: 'Last designation' },
      { k: 'joiningDate', l: 'Date of joining', t: 'date' },
      { k: 'lastDay', l: 'Last working day', t: 'date' },
      { k: 'letterDate', l: 'Date of letter', t: 'date' },
    ],
    body: `
Date: {{letterDate|date}}
To,
{{employeeName}}
Employee ID: {{employeeId}}
## Relieving and experience letter
This is to certify that {{employeeName}} was employed with {{company.name}} from {{joiningDate|date}} to {{lastDay|date}}. At the time of leaving, they held the position of {{designation}}.
{{employeeName}} has been relieved from the services of the Company with effect from the close of working hours on {{lastDay|date}}, on their resignation, which was accepted.
We thank them for their contributions and wish them success in their future endeavours.
The continuing obligations of confidentiality and non-solicitation under the employment agreement remain in force.
For {{company.name}}
Authorised signatory
{{company.signatoryName}}
{{company.signatoryDesignation}}
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
