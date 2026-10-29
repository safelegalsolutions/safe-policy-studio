/* Drafted templates — insurance broking (IRDAI-driven). */
(function (root) {
  const S = root.SAFE;
  const IRDAI_REGS = 'the IRDAI regulations applicable to insurance brokers (including the IRDAI (Insurance Brokers) Regulations, 2018, as amended or replaced)';

  S.tpl('ins-broking-conduct', {
    v: '1.0',
    fields: [
      { k: 'principalOfficer', l: 'Principal Officer (name)' },
      { k: 'brokerCategory', l: 'Category of broking licence', t: 'select', o: ['Direct Broker (Life and General)', 'Direct Broker (Life)', 'Direct Broker (General)', 'Reinsurance Broker', 'Composite Broker'], d: 'Direct Broker (Life and General)' },
    ],
    body: `
## Purpose
This code sets the standards of conduct for every person at {{company.name}} (the "**Company**") who deals with clients, prospects or insurers on the Company's broking business. It gives effect to the code of conduct for insurance brokers under ${IRDAI_REGS}, and applies alongside the Company's general Code of Conduct.

## Who it applies to
It applies to the Principal Officer ({{principalOfficer}}), every Broker Qualified Person, and all sales, servicing, claims and support staff, whether permanent, fixed-term or on contract. The Company holds a licence as a {{brokerCategory}} (licence no. {{company.regNo}}).

## Acting in the client's interest
Every employee must:
- act with honesty, integrity, due skill, care and diligence, and in the best interests of the client;
- identify the client's insurance needs before recommending a product, and recommend only products suitable for those needs;
- disclose that the Company acts as a broker, its licence number and category, and, when asked, the remuneration it receives from the insurer for the policy;
- explain the policy's coverage, exclusions, conditions, premium and claim process clearly and accurately;
- obtain multiple quotations where available and present them fairly;
- never recommend a product only because of higher remuneration to the Company or a reward to the employee.

## Prohibited practices
Employees must not:
- misrepresent or conceal any material fact about a policy, an insurer or the Company;
- induce a client to drop an existing policy to take a new one, unless it is in the client's interest and the client has been told the consequences in writing;
- offer or give any rebate of commission or premium, or any inducement, contrary to section 41 of the Insurance Act, 1938;
- sign proposal forms on behalf of clients, or fill in material information without the client's confirmation;
- collect premium in cash beyond what the regulations allow, or keep premium collected for an insurer beyond the time permitted;
- deal with an unlicensed intermediary, or share commission with anyone not permitted to receive it;
- act for an insurer against the client's interest in placing the business; or
- use the client's personal data for any purpose other than the broking service.

## Proposal, placement and servicing
5.1 Every material fact in the proposal form must be confirmed by the client. Employees must explain that non-disclosure can lead to rejection of claims.
5.2 Cover notes, policy documents and endorsements are sent to the client promptly.
5.3 Renewal reminders are sent in good time before the policy expires.

## Claims
Employees assist clients in preparing and submitting claims, follow up with the insurer and keep the client informed. They do not give assurances about the outcome of a claim.

## Grievances
Client complaints are recorded and resolved under the Company's grievance redressal procedure, within the timelines set by IRDAI. Clients are told of their right to approach the Insurance Ombudsman.

## Breach
A breach of this code is serious misconduct under the Disciplinary Action and Domestic Inquiry Procedure and may also be reported to IRDAI where the regulations require.
`,
  });

  S.tpl('ins-rebating', {
    v: '1.0',
    fields: [],
    body: `
## Purpose
This policy prohibits rebating, unauthorised commission sharing and similar inducements by anyone acting for {{company.name}} (the "**Company**"), as required by section 41 of the Insurance Act, 1938 and ${IRDAI_REGS}.

## The prohibition
2.1 No employee, director or person acting for the Company may, directly or indirectly, allow or offer to any person, as an inducement to take out, renew or continue an insurance policy, any rebate of the whole or part of the commission or of the premium shown on the policy.
2.2 No employee may share the Company's commission or remuneration with any person, including a client, an unlicensed intermediary, a referral source or a colleague of the client, except as permitted by IRDAI.
2.3 No employee may accept any payment, gift or reward from an insurer, or from any other person, in connection with the placement of business, other than remuneration permitted to the Company under IRDAI regulations.

## Examples of prohibited conduct
- paying part of a client's premium;
- giving cash, vouchers, gifts or free services to a client linked to buying a policy;
- giving a "referral fee" to a person who is not an IRDAI-registered intermediary; and
- passing a part of incentives received from the Company to clients.

## Consequences
4.1 Under section 41 of the Insurance Act, a person who contravenes this prohibition is liable to a penalty of up to ₹10 lakh.
4.2 Any breach is serious misconduct and will be dealt with under the Disciplinary Action and Domestic Inquiry Procedure, and the Company may report it to IRDAI.

## Reporting
Any employee who becomes aware of rebating or commission sharing must report it to the Principal Officer or through the whistleblower mechanism.
`,
  });

  S.tpl('ins-anti-fraud', {
    v: '1.0',
    fields: [
      { k: 'fraudCommittee', l: 'Fraud monitoring committee / officer', d: 'the Fraud Monitoring Committee chaired by the Principal Officer' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") prevents, detects and reports insurance fraud involving its employees, clients, insurers or third parties, in line with the IRDAI framework on insurance fraud monitoring applicable to intermediaries.

## What is fraud
Insurance fraud is any act or omission intended to obtain a dishonest advantage, or to cause loss, through insurance. It includes:
- **internal fraud:** by employees, such as misappropriating premium, forging documents, creating fictitious policies or clients, or manipulating records;
- **intermediary fraud:** such as misrepresentation, rebating, or submitting false information to insurers; and
- **policyholder or claims fraud:** such as false claims, inflated claims, staged losses or concealment of material facts, where Company staff become aware of them.

## Prevention
3.1 Employees in sensitive roles are subject to background verification and periodic rotation where practical.
3.2 Proposal and claim documents are verified against originals or reliable sources. Premium is collected only through approved channels.
3.3 Access to systems is limited by role and logged.
3.4 Employees receive anti-fraud training on joining and every year.

## Reporting suspected fraud
4.1 Any employee who suspects fraud must report it immediately to {{fraudCommittee}} or through the whistleblower mechanism. Reports may be anonymous.
4.2 The Company protects employees who report in good faith from retaliation.

## Investigation and action
5.1 Each report is logged and investigated promptly by a person independent of the area concerned.
5.2 Where fraud is established, the Company takes disciplinary action, informs the insurer concerned, reports to IRDAI where required, and files a police complaint where appropriate.
5.3 The Company maintains a register of fraud cases and submits fraud returns to IRDAI in the form and within the time prescribed.

## Review
The fraud monitoring arrangements are reviewed every year by the Board or a committee of the Board.
`,
  });

  S.tpl('ins-aml-kyc', {
    v: '1.0',
    fields: [
      { k: 'principalOfficerAml', l: 'Designated / principal officer for AML reporting', d: 'the Principal Officer' },
    ],
    body: `
## Purpose
This policy sets out the duties of employees of {{company.name}} (the "**Company**") under the Prevention of Money-laundering Act, 2002 (the "**PMLA**"), the rules made under it, and the anti-money laundering and counter-terrorist financing guidelines of [[if tag=insurance]]IRDAI[[else]]{{company.regulators}}[[endif]] that apply to the Company.

## Know your customer
2.1 Employees collect and verify the client's identity and address documents, and for entities, documents of the entity and its beneficial owners, as required by the applicable KYC norms before placing business.
2.2 Where the client is a politically exposed person, or the transaction is high-risk, enhanced due diligence is carried out and approved by a senior manager.
2.3 KYC records are kept for the period required by the PMLA and the regulator.

## Red flags
Employees watch for and report:
- premium paid in cash, by third parties or from unconnected accounts;
- reluctance to give KYC documents, or documents that appear forged;
- early surrender or cancellation of policies soon after purchase, especially single-premium policies;
- unusual premium amounts compared with the client's profile; and
- frequent changes of nominee, address or bank details.

## Reporting
4.1 Employees report suspicious transactions to {{principalOfficerAml}} immediately. They must not tell the client that a report has been or may be made ("tipping off").
4.2 The designated officer decides whether to file a suspicious transaction report with the Financial Intelligence Unit – India, and informs the insurer where required.

## Training
All client-facing and operations staff receive AML/KYC training on joining and every year.
`,
  });

  S.tpl('ins-fit-proper', {
    v: '1.0',
    fields: [
      { k: 'fpReviewer', l: 'Who carries out the fit and proper assessment', d: 'the Nomination and Remuneration Committee / Board' },
    ],
    body: `
## Purpose
This policy sets the criteria and process by which {{company.name}} (the "**Company**") assesses whether its directors, Principal Officer and key managerial persons are fit and proper, as required by ${IRDAI_REGS}.

## Persons covered
Directors, the Principal Officer, the Chief Executive Officer (if different), Broker Qualified Persons in key positions, and any other person the regulations treat as a key managerial person.

## Criteria
A person is fit and proper only if they:
- have the qualifications, training and experience required by the regulations for the role;
- have a record of integrity, honesty, fairness and good reputation;
- have not been convicted of an offence involving moral turpitude or economic offences, and are not the subject of pending criminal proceedings of that kind;
- have not been declared insolvent or of unsound mind;
- have not been prohibited or debarred by IRDAI, SEBI, RBI or any other regulator from dealing in securities, insurance or financial services; and
- are not disqualified under the Companies Act, 2013 or the regulations.

## Process
4.1 Before appointment, the person submits a declaration with supporting documents. {{fpReviewer}} assesses them and records its decision.
4.2 The assessment is repeated every year, and whenever there is a material change in the person's circumstances.
4.3 Each person must inform the Company immediately of any event that may affect their fitness and propriety.
4.4 The Company informs IRDAI of appointments and changes of the Principal Officer and key persons within the time prescribed, and obtains any approval required.

## Consequences
If a person ceases to be fit and proper, the Company takes steps to remove them from the role and informs IRDAI as required.
`,
  });

  S.tpl('ins-call-conduct', {
    v: '1.0',
    fields: [
      { k: 'recordingRetention', l: 'Retention period for call recordings', d: 'the period required by IRDAI for the related policy records' },
      { k: 'callingHours', l: 'Permitted calling hours to clients', d: '9:00 a.m. to 9:00 p.m.' },
    ],
    body: `
## Purpose
This policy sets out how employees of {{company.name}} (the "**Company**") protect client information and conduct themselves on calls and digital communication with clients and prospects.

## Confidentiality of client information
2.1 Client information, including personal data, policy details, health information and claims records, is confidential. It is used only for providing the broking service and handled under the Company's Data Protection and Privacy Policy and the Digital Personal Data Protection Act, 2023.
2.2 Employees must not discuss a client's information with anyone except the client, the insurer concerned, or other persons the client has authorised, and must verify the caller's identity before sharing any information.
2.3 Client data must not be stored on personal devices, forwarded to personal email or messaging accounts, or shared on unofficial groups.

## Conduct on calls
3.1 Employees identify themselves and the Company at the start of every call, and state the purpose of the call.
3.2 Calls to clients and prospects are made only between {{callingHours}}, and not to numbers registered on the Do Not Disturb registry for promotional calls, except as the TRAI regulations allow.
3.3 Employees speak politely, give accurate information, never pressure the client, and respect a request not to be called again.

## Call recording
4.1 Sales and service calls made on Company lines are recorded for quality, training, regulatory and dispute resolution purposes. The client is informed at the start of the call that it is being recorded.
4.2 Recordings are kept for {{recordingRetention}}, with access limited to authorised persons, and then securely deleted.
4.3 Recordings may be shared with the insurer, IRDAI, the Insurance Ombudsman or a court where required.

## Breach
A breach of this policy is misconduct and may also be a personal data breach that must be reported under the Data Protection and Privacy Policy.
`,
  });

  S.tpl('ins-records', {
    v: '1.0',
    fields: [
      { k: 'recordsSystem', l: 'System where broking records are maintained', d: "the Company's broking management system" },
      { k: 'retentionYears', l: 'Retention period for broking records (years)', t: 'number', d: '10' },
    ],
    body: `
## Purpose
This policy sets out the record-keeping duties of employees of {{company.name}} (the "**Company**") for its insurance broking business, so that the Company can meet IRDAI's requirements on books of account, records and inspection.

## Records to be kept
For every client and policy, employees record in {{recordsSystem}}:
- KYC documents and the client's needs analysis;
- quotations obtained and the recommendation made;
- the proposal form and client confirmations;
- premium collected and remitted, with dates;
- policy documents, endorsements and renewals;
- claims assistance provided; and
- complaints and their resolution.

## Retention
3.1 These records are retained for at least {{retentionYears}} years, in line with IRDAI's requirements for insurance brokers, or longer if a claim, complaint or dispute is pending.
3.2 Records may be kept in electronic form, with backup and controls that prevent alteration.
3.3 Where personal data in these records is no longer needed for broking or legal purposes after the retention period, it is erased under the Data Protection and Privacy Policy.

## Employee duties
4.1 Employees must create records at the time of the transaction, completely and accurately.
4.2 No record may be altered, back-dated or destroyed, except through the approved correction process with an audit trail.

## Inspection
Records are made available to IRDAI, auditors and authorised persons on request. Employees cooperate fully with any inspection.
`,
  });

  S.tpl('ins-irdai-training', {
    v: '1.0',
    fields: [
      { k: 'trainingCoordinator', l: 'Training coordinator', d: 'the Compliance Officer' },
    ],
    body: `
## Purpose
This policy ensures that the Principal Officer and every Broker Qualified Person at {{company.name}} (the "**Company**") holds and keeps up to date the qualifications, training and certification required by ${IRDAI_REGS}.

## Requirements
2.1 No person may solicit or service insurance business for the Company unless they hold the qualification and certification that IRDAI requires for the role.
2.2 The Principal Officer and Broker Qualified Persons complete the training and pass the examination prescribed by IRDAI before they act in that capacity, and complete the continuing training prescribed before each renewal of the Company's licence.

## Tracking
{{trainingCoordinator}} keeps a register of every qualified person with their certificate number, date of certification and due date for renewal training, and alerts the person and their manager at least 90 days before the due date.

## Other training
All client-facing staff receive training on products, the code of conduct for broking staff, anti-rebating, AML/KYC, data protection and grievance handling on joining and every year.

## Costs
The Company pays the cost of mandatory training and certification. Recovery of training costs, if any, follows the Learning and Development policy and the employee's signed agreement.
`,
  });

  S.tpl('hr-sales-incentive', {
    v: '1.0',
    fields: [
      { k: 'incentivePeriod', l: 'Incentive period', t: 'select', o: ['monthly', 'quarterly', 'half-yearly', 'annual'], d: 'quarterly' },
      { k: 'qualityGate', l: 'Quality conditions for incentive eligibility', t: 'textarea', d: 'no substantiated mis-selling complaint; persistency / renewal ratio of at least 85%; complete documentation' },
      { k: 'clawbackMonths', l: 'Clawback period if the policy is cancelled or found mis-sold (months)', t: 'number', d: '12' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") rewards sales performance while protecting clients. Incentives must never encourage mis-selling[[if tag=insurance]], rebating, or placing business with an insurer because of higher remuneration rather than the client's interest[[endif]].

## Eligibility
2.1 Employees in sales roles named in their appointment or incentive letter are eligible.
2.2 Incentives are calculated {{incentivePeriod}} and paid with the salary of the following month.
2.3 An employee is eligible only if, for the period, the following quality conditions are met: {{qualityGate}}.

## Design principles
3.1 Incentives are based on a balanced scorecard of business volume, quality of sale, client retention and compliance, not on volume alone.
[[if tag=insurance]]
3.2 Incentive rates do not differ by insurer, so that employees have no reason to favour one insurer over another.
3.3 Incentives are not linked to products in a way that would push unsuitable products to clients.
[[endif]]

## Clawback
If, within {{clawbackMonths}} months of the sale, the business is cancelled because of mis-selling or misrepresentation, or found to involve rebating or fraud, the incentive paid on it is recovered from future incentives, subject to law.

## Discretion
The Company may change or withdraw the incentive scheme for future periods by giving notice. Incentives already earned under the scheme are paid.
`,
  });

  S.tpl('hr-succession', {
    v: '1.0',
    fields: [
      { k: 'keyRoles', l: 'Key roles covered', t: 'textarea', d: 'Managing Director, Principal Officer, Chief Financial Officer, Compliance Officer, Head of Operations' },
      { k: 'reviewBody', l: 'Body that reviews the succession plan', d: 'the Board of Directors' },
    ],
    body: `
## Purpose
This policy makes sure that {{company.name}} (the "**Company**") can continue to operate, and to meet its regulatory obligations, if a person in a key role leaves or is unable to work.

## Key roles
The plan covers: {{keyRoles}}.[[if tag=insurance]] The Principal Officer role is critical, because IRDAI regulations require the Company to have a qualified Principal Officer at all times.[[endif]]

## Succession plan
3.1 For each key role, the Company identifies at least one person who could take over in an emergency and one or more persons who could be developed to take over in the longer term.
3.2 Identified successors receive the training, certification and exposure needed for the role[[if tag=insurance]], including IRDAI qualification for the Principal Officer role[[endif]].
3.3 Each key role holder keeps documented handover notes of critical processes, contacts and deadlines.

## Interim arrangements
If a key role falls vacant, the Board appoints an interim holder immediately and informs any regulator within the time required.

## Review
{{reviewBody}} reviews the succession plan every year.
`,
  });

  S.tpl('ins-infosec', {
    v: '1.0',
    fields: [
      { k: 'ciso', l: 'Chief Information Security Officer (name)' },
      { k: 'incidentEmail', l: 'Email / number to report security incidents', d: '' },
    ],
    body: `
## Purpose
This policy sets out the information security duties of every employee of {{company.name}} (the "**Company**"), in support of the Company's board-approved information and cyber security policy under the IRDAI Information and Cyber Security Guidelines, 2023, and the CERT-In Directions of 28 April 2022.

## Employee duties
Every employee must:
- use only Company-approved devices, software and storage for Company and client data;
- protect passwords and use multi-factor authentication where enabled; never share credentials;
- lock their screen when away and keep devices updated;
- not install unapproved software, browser extensions or AI tools that process Company or client data;
- not forward Company or client data to personal email, messaging apps or cloud accounts;
- be alert to phishing and social engineering, and verify unusual requests for payment or data;
- encrypt or password-protect files containing personal data before sending them externally; and
- return all devices and data on leaving.

## Reporting incidents
3.1 Any suspected security incident, including a lost device, phishing click, malware, unauthorised access or data sent to the wrong person, must be reported immediately to {{ciso}} at {{incidentEmail}}.
3.2 The Company must report certain cyber incidents to CERT-In within six hours of noticing them, and to IRDAI within the timelines in its guidelines (including an initial report within six hours and a detailed report within 24 hours). Delay by an employee in reporting can therefore put the Company in breach.
3.3 Personal data breaches are also reported to the Data Protection Board of India and affected persons as required by the Digital Personal Data Protection Act, 2023.

## Monitoring
The Company monitors the use of its systems for security purposes, as described in the Employee Privacy Notice.

## Training
All employees complete information security awareness training on joining and every year, and take part in phishing simulations.

## Breach
A breach of this policy is misconduct under the Disciplinary Action and Domestic Inquiry Procedure.
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
