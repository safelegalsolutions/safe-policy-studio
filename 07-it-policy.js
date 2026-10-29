/* Drafted template — IT and Information Security Policy (separate from the Data Protection Policy). */
(function (root) {
  const S = root.SAFE;

  S.tpl('it-infosec', {
    v: '1.0',
    fields: [
      { k: 'itHead', l: 'Head of IT (name and designation)' },
      { k: 'ciso', l: 'Chief Information Security Officer / information security owner (name and designation)' },
      { k: 'itHelpdesk', l: 'IT helpdesk email / number' },
      { k: 'incidentEmail', l: 'Email / number to report security incidents' },
      { k: 'itOutsourced', l: 'Is IT support outsourced to a vendor?', t: 'select', o: ['no', 'yes'], d: 'no' },
      { k: 'itVendor', l: 'IT vendor name (if outsourced)' },
      { k: 'coreSystems', l: 'Core business systems and applications', t: 'textarea', d: 'email and office suite, CRM, accounting and payroll software, document storage' },
      { k: 'cloudServices', l: 'Approved cloud services', t: 'textarea', d: 'the email and office suite, approved file storage, and other services approved by IT' },
      { k: 'passwordLength', l: 'Minimum password length (characters)', t: 'number', d: '12' },
      { k: 'passwordExpiryDays', l: 'Password change frequency (days; 0 = only on suspicion of compromise)', t: 'number', d: '0' },
      { k: 'lockoutAttempts', l: 'Failed log-in attempts before lock-out', t: 'number', d: '5' },
      { k: 'screenLockMinutes', l: 'Automatic screen lock after inactivity (minutes)', t: 'number', d: '5' },
      { k: 'accessReviewMonths', l: 'User access review frequency (months)', t: 'number', d: '6' },
      { k: 'byod', l: 'Personal devices (BYOD) allowed for work?', t: 'select', o: ['yes, for email and approved apps only, with IT enrolment', 'no'], d: 'yes, for email and approved apps only, with IT enrolment' },
      { k: 'backupFrequency', l: 'Backup frequency for critical data', d: 'daily' },
      { k: 'backupTestMonths', l: 'Restore test frequency (months)', t: 'number', d: '6' },
      { k: 'vaptFrequency', l: 'Vulnerability assessment and penetration test (VAPT) frequency', d: 'once a year, and after any major change' },
      { k: 'patchDays', l: 'Critical security patches applied within (days)', t: 'number', d: '14' },
      { k: 'logRetentionDays', l: 'Retention of system logs (days, minimum 180 under CERT-In)', t: 'number', d: '365' },
    ],
    body: `
## Purpose
1.1 This policy sets the rules for using and protecting the information technology systems and information of {{company.name}} (the "**Company**"). Its aim is to keep the Company's systems available, its information confidential and accurate, and its operations compliant with the Information Technology Act, 2000, the rules made under it, and the directions of CERT-In[[if tag=insurance]], together with the IRDAI Information and Cyber Security Guidelines, 2023[[endif]][[if tag=rbi]], together with the IT and cyber security directions of the Reserve Bank of India[[endif]][[if tag=sebi]], together with the SEBI Cybersecurity and Cyber Resilience Framework[[endif]].
1.2 This policy deals with technology and security. The handling of personal data, the rights of data principals and the reporting of personal data breaches are governed by the Company's separate Data Protection and Privacy Policy. Where both apply, both must be followed.

## Scope
2.1 This policy applies to all directors, employees, trainees, interns, consultants, contract staff and vendors who use the Company's systems or information ("**Users**").
2.2 It covers all IT assets: laptops, desktops, mobile phones, servers, network equipment, software, cloud services, email, messaging, storage media and any personal device used for work.

## Roles and responsibilities
| Role | Responsibility |
| Board / management | Approves this policy, provides resources and reviews information security risks at least once a year |
| Head of IT – {{itHead}} | Runs IT operations, asset management, access provisioning, backups and patching |
| Information security owner – {{ciso}} | Owns this policy, assesses risk, monitors security, leads incident response and reports to management |
| Managers | Approve access for their teams and make sure team members follow this policy |
| Users | Use systems responsibly, protect credentials and report incidents immediately |
[[if itOutsourced=yes]]
| IT vendor – {{itVendor}} | Delivers the IT services in its contract, under the controls in section 16 |
[[endif]]

## Information classification
4.1 All information is classified as one of:
- **Public:** approved for release to anyone (for example, the website and published brochures);
- **Internal:** for use within the Company (for example, internal circulars and policies);
- **Confidential:** business, client and employee information whose disclosure could harm the Company or others (for example, contracts, financials, personal data); and
- **Restricted:** the most sensitive information (for example, passwords, encryption keys, board papers, health and financial data of individuals[[if tag=insurance]], policyholder and claims data[[endif]][[if tag=export]], export-controlled technical data[[endif]]).
4.2 Information is handled according to its classification. Confidential and Restricted information is shared only with authorised persons, stored only on approved systems, and encrypted when sent outside the Company.

## Acceptable use
5.1 Company systems are provided for business purposes. Limited personal use is allowed if it does not interfere with work, consume significant resources or breach this policy.
5.2 Users must not:
- share their user ID, password or one-time codes with anyone, including colleagues and IT staff;
- install software, browser extensions or apps that are not approved by IT;
- disable, bypass or tamper with antivirus, encryption, firewall or monitoring tools;
- access, download, store or send unlawful, obscene, defamatory, discriminatory or pirated content;
- use Company systems for any business other than the Company's, or for personal commercial gain;
- forward Company or client information to personal email, personal cloud storage or personal messaging accounts;
- connect unknown USB drives or other storage media to Company devices;
- attempt to access systems or data they are not authorised to access; or
- use the Company's name, email or systems to express personal views in a way that may be taken as the Company's view.
5.3 Users must comply with software licence terms. Unlicensed or pirated software is prohibited.

## Access control
6.1 Access is granted on the principle of least privilege: Users get only the access they need for their role, approved by their manager and set up by IT.
6.2 Each User has a unique ID. Shared or generic accounts are allowed only where unavoidable, with a named owner and IT approval.
6.3 Administrator rights are limited to IT staff who need them and are logged.
6.4 Access is reviewed every {{accessReviewMonths}} months. Access no longer needed is removed.
6.5 Access is changed on the same day as a transfer and removed no later than the last working day when a User leaves.

## Passwords and authentication
7.1 Passwords must be at least {{passwordLength}} characters long, must not be easily guessed, and must not be reused across systems or from personal accounts. Users are encouraged to use passphrases and the password manager provided by IT.
7.2 [[if passwordExpiryDays>0]]Passwords must be changed every {{passwordExpiryDays}} days, and[[else]]Passwords must be changed[[endif]] immediately if there is any suspicion that they have been compromised.
7.3 Accounts lock after {{lockoutAttempts}} failed log-in attempts.
7.4 Multi-factor authentication is mandatory for email, remote access, cloud services, administrator accounts and any system holding Confidential or Restricted information.

## Devices and endpoints
8.1 Company devices must have full-disk encryption, up-to-date antivirus or endpoint protection, a firewall, and automatic screen lock after {{screenLockMinutes}} minutes of inactivity.
8.2 Users must lock their screen when leaving their device, keep devices secure in transit, and never leave them unattended in public places or vehicles.
8.3 Lost or stolen devices must be reported to IT immediately so that they can be locked or wiped remotely.
8.4 Personal devices (BYOD): {{byod}}. Personal devices used for work must have a screen lock, current operating system updates and the Company's mobile management profile, and the Company may wipe Company data from them remotely when needed.
8.5 All devices and data are returned on the last working day under the Company Assets policy.

## Email, messaging and internet
9.1 Company business must be conducted only on Company email and approved messaging tools. Client or Confidential information must not be shared on personal messaging groups.
9.2 Users must be alert to phishing. They must not click links or open attachments from unknown senders, and must verify any request for payment, change of bank details or sensitive data by calling the requester on a known number.
9.3 Emails containing Confidential or Restricted information sent outside the Company must be encrypted or password-protected, with the password sent by a separate channel.
9.4 The Company may filter or block websites and file types that present a security risk.

## Use of AI tools
10.1 Only AI tools approved by IT may be used for work.
10.2 Confidential or Restricted information, including personal data, client information and source code, must not be entered into any AI tool unless the tool has been approved for that class of information under a contract that protects it.
10.3 AI output must be checked by the User for accuracy before it is relied on or sent to anyone.

## Network and remote access
11.1 Remote access to Company systems is allowed only through approved, encrypted connections with multi-factor authentication.
11.2 Users must not connect Company devices to untrusted public Wi-Fi without the approved secure connection.
11.3 The Company's network is segmented, guest Wi-Fi is separated from business systems, and network devices are configured and patched by IT.

## Software, patching and change management
12.1 Operating systems and applications are kept up to date. Critical security patches are applied within {{patchDays}} days of release.
12.2 Changes to core systems ({{coreSystems}}) are planned, tested, approved and recorded before they are made, with a rollback plan.
12.3 Software developed for or by the Company follows secure development practices, and production data is not used for testing unless masked.

## Cloud services
Company information may be stored or processed only in approved cloud services: {{cloudServices}}. New cloud services require a security and contract review by IT before use, including where the data will be stored and how it will be returned or deleted at the end of the service.

## Backup and business continuity
14.1 Critical data and systems are backed up {{backupFrequency}}, with at least one copy kept separately from the live systems so that it cannot be affected by ransomware.
14.2 Restoring from backups is tested every {{backupTestMonths}} months, and the result is recorded.
14.3 The Company maintains a business continuity and disaster recovery plan for its core systems, with recovery time and recovery point objectives, and tests it at least once a year.

## Logging, monitoring and time synchronisation
15.1 Logs of all ICT systems are enabled and retained securely for {{logRetentionDays}} days, and in any case for at least a rolling period of 180 days within India, as required by the CERT-In Directions dated 28 April 2022.
15.2 All systems synchronise their clocks with the Network Time Protocol servers of the National Informatics Centre or the National Physical Laboratory, or with servers traceable to them.
15.3 The Company monitors its systems for security events. Monitoring of Users is limited to what is necessary for security and compliance, and is described in the Employee Privacy Notice.

## Vendors and third parties
16.1 Vendors with access to Company systems or information are assessed for security before engagement and sign contracts that require confidentiality, appropriate security controls, prompt incident reporting, audit rights and return or deletion of data at the end of the contract.
16.2 Vendor access is limited to what is needed, time-bound, logged and removed when no longer required.
[[if tag=insurance]]
16.3 Outsourcing of IT functions follows the Company's outsourcing policy and the IRDAI requirements on outsourcing and on cyber security of third parties.
[[endif]]

## Security testing
A vulnerability assessment and penetration test (VAPT) of internet-facing and core systems is carried out {{vaptFrequency}}. Findings are tracked until they are fixed.

## Incident reporting and response
18.1 Every User must report any actual or suspected security incident immediately to {{incidentEmail}}. Examples are a lost device, a phishing click, malware, unusual system behaviour, unauthorised access, or data sent to the wrong person.
18.2 The information security owner leads the response: contain the incident, preserve evidence, assess the impact, restore systems and record the root cause and lessons learned.
18.3 Cyber incidents of the types listed by CERT-In are reported to CERT-In within **6 hours** of being noticed.
[[if tag=insurance]]
18.4 Cyber incidents are also reported to IRDAI within the timelines in the IRDAI Information and Cyber Security Guidelines, including an initial report within 6 hours and a detailed report within 24 hours.
[[endif]]
18.5 Where an incident involves personal data, the reporting steps in the Data Protection and Privacy Policy are also followed.

## Physical security
Server rooms, network cabinets and storage areas are locked and access is limited to authorised persons. Paper documents containing Confidential or Restricted information are kept locked away and shredded when no longer needed (clean desk).

## Disposal of IT assets
IT assets and storage media are securely wiped or physically destroyed before reuse, sale or disposal. Electronic waste is handed only to authorised recyclers under the E-Waste (Management) Rules, 2022, and a record of disposal is kept.

## Training and awareness
All Users complete information security awareness training on joining and every year, and take part in phishing simulations. Users with privileged access receive additional training.

## Monitoring of compliance and breach
22.1 The information security owner reports to management at least once a year on the state of information security, incidents, audit findings and the action plan.
22.2 A breach of this policy is misconduct and may lead to disciplinary action under the Disciplinary Action and Domestic Inquiry Procedure, without prejudice to civil or criminal action under the Information Technology Act, 2000 or other law.

## Exceptions
Any exception to this policy must be requested in writing, assessed for risk by the information security owner, approved by management, limited in time and recorded.

## Help
For IT support, contact {{itHelpdesk}}. For questions on this policy, contact {{ciso}}.
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
