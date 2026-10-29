/* Drafted templates — HR Playbook: workplace conduct, discipline, safety, privacy. */
(function (root) {
  const S = root.SAFE;

  S.tpl('hr-posh', {
    v: '1.0',
    fields: [
      { k: 'icPresiding', l: 'IC Presiding Officer (senior woman employee) – name and designation' },
      { k: 'icMembers', l: 'IC employee members (one per line: name – designation)', t: 'textarea' },
      { k: 'icExternal', l: 'IC external member – name and organisation' },
      { k: 'icEmail', l: 'IC email for complaints', d: '' },
      { k: 'icTenureYears', l: 'Tenure of IC members (years, max 3)', t: 'number', d: '3' },
      { k: 'genderNeutral', l: 'Also cover complaints by men and persons of other genders under the same process?', t: 'select', o: ['yes', 'no'], d: 'yes' },
      { k: 'sheBox', l: 'SHe-Box registration status', d: 'registered on the SHe-Box portal' },
    ],
    body: `
## Purpose and commitment
1.1 {{company.name}} (the "**Company**") is committed to a workplace free from sexual harassment. This policy is made under the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (the "**POSH Act**") and the rules made under it.
1.2 Sexual harassment is misconduct. The Company will take prompt action on every complaint and will protect complainants and witnesses from retaliation.

## Scope
2.1 This policy covers all women at the workplace, whether employed regularly, temporarily, on contract, as trainees, interns or apprentices, as well as women visitors, clients and customers who are harassed by the Company's personnel.
[[if genderNeutral=yes]]
2.2 As a matter of Company policy, complaints of sexual harassment by men and by persons of any gender are also inquired into by the Internal Committee under the same procedure, as a disciplinary matter under the Company's service rules. The statutory remedies under the POSH Act are available to women.
[[endif]]
2.3 "Workplace" includes the Company's offices ({{company.offices|list}}), any place visited by an employee arising out of or during the course of employment, including transport provided by the Company, off-site events, client sites, and virtual workspaces such as calls, chats and email.

## What is sexual harassment
3.1 Sexual harassment includes any one or more of the following unwelcome acts or behaviour, directly or by implication:
- physical contact and advances;
- a demand or request for sexual favours;
- making sexually coloured remarks;
- showing pornography; or
- any other unwelcome physical, verbal or non-verbal conduct of a sexual nature, including through messages, images, emails or social media.
3.2 The following, when connected with sexual conduct, may also amount to sexual harassment: implied or explicit promise of preferential treatment; implied or explicit threat of detrimental treatment; threat about present or future employment status; interference with work or creating an intimidating, offensive or hostile work environment; and humiliating treatment likely to affect health or safety.

## Internal Committee
4.1 The Company has constituted an Internal Committee (the "**IC**") under section 4 of the POSH Act. Where the Company has more than one office with 10 or more employees, an IC is constituted at each such office or a common IC covers them as permitted.
4.2 The IC consists of:
| Role | Name |
| Presiding Officer | {{icPresiding}} |
| Members (employees) | {{icMembers}} |
| External member | {{icExternal}} |
4.3 At least one-half of the members are women. Members hold office for not more than {{icTenureYears}} years from their nomination.
4.4 Complaints may be sent to the IC at {{icEmail}} or handed to any IC member. The composition and contact details of the IC are displayed at each office.

## Making a complaint
5.1 An aggrieved woman may make a written complaint to the IC within three months of the incident, or of the last incident in a series. The IC may extend this by a further three months if satisfied that circumstances prevented a complaint in time.
5.2 If she cannot make a written complaint, any IC member will give reasonable help to put it in writing. Where she cannot complain because of physical or mental incapacity or death, a complaint may be made on her behalf as allowed by the rules.

## Conciliation
Before starting an inquiry, and only at the request of the aggrieved woman, the IC may try to settle the matter through conciliation. No monetary settlement can be the basis of conciliation. If a settlement is reached, no further inquiry is held, unless its terms are not complied with.

## Inquiry
7.1 The IC sends a copy of the complaint to the respondent within 7 working days. The respondent replies with documents and names of witnesses within 10 working days of receiving it.
7.2 The IC conducts the inquiry following the principles of natural justice. Both parties may produce evidence and witnesses. Legal practitioners may not represent either party at any stage.
7.3 The IC completes the inquiry within 90 days and gives its report to the employer and both parties within 10 days of completing it.
7.4 The IC has the powers of a civil court in the matters listed in section 11(3) of the POSH Act.

## Interim relief
During the inquiry, on a written request by the aggrieved woman, the IC may recommend transferring her or the respondent, granting her leave of up to three months (in addition to her other leave), or restraining the respondent from reporting on her work or writing her performance appraisal.

## Action on the report
9.1 If the allegation is proved, the Company acts on the IC's recommendations within 60 days of receiving the report. Action may include a written apology, warning, reprimand, censure, withholding of promotion or increments, counselling, community service, termination, and deduction from the respondent's wages of compensation payable to the aggrieved woman.
9.2 If the IC finds the complaint false or malicious, or that evidence was forged, it may recommend action against the person responsible. A mere inability to substantiate a complaint or provide adequate proof is not grounds for action against the complainant.

## Appeal
Any person aggrieved by the IC's recommendations, or by non-implementation of them, may appeal to the appellate authority under the applicable service rules or the POSH Act within 90 days of the recommendations.

## Confidentiality
The identity and address of the aggrieved woman, respondent and witnesses, the complaint, the proceedings, the recommendations and the action taken are confidential and must not be published or disclosed, except as allowed by section 16 of the POSH Act. Breach of confidentiality is misconduct and attracts the penalty prescribed under the POSH Act.

## No retaliation
No one may victimise a complainant, witness or IC member for taking part in proceedings under this policy. Retaliation is serious misconduct.

## Employer duties
The Company will:
- provide a safe working environment, including safety from persons coming into contact at the workplace;
- display the penal consequences of sexual harassment and the order constituting the IC at conspicuous places;
- hold awareness workshops for employees and orientation programmes for IC members at regular intervals;
- provide the IC with facilities to deal with complaints and conduct inquiries;
- help the aggrieved woman to file a criminal complaint if she so chooses;
- treat sexual harassment as misconduct under the service rules; and
- monitor timely submission of reports by the IC.

## Annual report and SHe-Box
14.1 The IC prepares an annual report in the prescribed form and submits it to the Company and to the District Officer. The Company includes the number of cases filed and disposed of in its annual report under section 22 of the POSH Act, or informs the District Officer where it does not prepare an annual report.
14.2 The Company is {{sheBox}}.

## Penalty for non-compliance
Under section 26 of the POSH Act, an employer who fails to constitute an IC or to comply with the Act is liable to a fine of up to ₹50,000, with higher penalties and possible cancellation of licence for repeated offences.
`,
  });

  S.tpl('hr-equal-opportunity', {
    v: '1.0',
    fields: [
      { k: 'liaisonOfficer', l: 'Liaison officer for persons with disabilities (name and designation)' },
      { k: 'identifiedPosts', l: 'Posts identified as suitable for persons with disabilities', t: 'textarea', d: 'All office-based roles, subject to reasonable accommodation' },
      { k: 'accessibilityPlan', l: 'Accessibility measures already in place / planned', t: 'textarea', d: 'Step-free access, accessible washrooms, screen-reader compatible systems' },
    ],
    body: `
## Purpose
{{company.name}} (the "**Company**") is an equal opportunity employer. This policy sets out how the Company provides equal opportunity to persons with disabilities, as required by section 21 of the Rights of Persons with Disabilities Act, 2016 (the "**RPwD Act**") and rule 8 of the Rights of Persons with Disabilities Rules, 2017, and how it promotes diversity and inclusion more widely.

## Non-discrimination
2.1 The Company does not discriminate against any person in recruitment, terms of employment, pay, training, promotion, transfer or exit on the basis of disability, gender, gender identity, sexual orientation, religion, caste, race, ethnicity, region, language, age, marital or parental status, HIV status, or any other ground protected by law.
2.2 No employee who acquires a disability during service will be dispensed with or reduced in rank. If they are no longer suited to their post, they will be shifted to another post with the same pay scale and benefits, or kept on a supernumerary post until a suitable post is available or they reach the age of superannuation.

## Posts identified as suitable
{{identifiedPosts}}

## Recruitment and promotion
4.1 Job advertisements state that the Company is an equal opportunity employer and that applications from persons with disabilities are welcome.
4.2 Selection processes are adapted on request, for example by giving extra time, accessible formats or a scribe.
4.3 Promotion is based on merit and is not denied on the ground of disability.

## Reasonable accommodation and facilities
5.1 The Company provides reasonable accommodation, assistive devices and barrier-free access to enable employees with disabilities to perform their work.
5.2 Accessibility measures: {{accessibilityPlan}}.
5.3 Training and skill development opportunities are provided on an equal basis, in accessible formats.

## Liaison officer
{{liaisonOfficer}} is the liaison officer responsible for overseeing the recruitment of persons with disabilities and the provision of facilities and amenities to them.

## Diversity and inclusion
The Company aims for a workforce that reflects the communities it serves, and supports inclusion through fair hiring practices, inclusive benefits, and awareness programmes for managers.

## Grievances
Any employee who believes they have been discriminated against may raise a grievance with the liaison officer or through the grievance redressal mechanism. Complaints of sexual harassment are dealt with under the POSH policy.

## Registration
A copy of this policy is registered with the Chief Commissioner or the State Commissioner for Persons with Disabilities, as required by the RPwD Act and rules, and is displayed on the Company's website where it has one.
`,
  });

  S.tpl('hr-disciplinary', {
    v: '1.0',
    fields: [
      { k: 'disciplinaryAuthority', l: 'Disciplinary authority', d: 'the Managing Director' },
      { k: 'appellateAuthority', l: 'Appellate authority', d: 'the Board of Directors' },
      { k: 'replyDays', l: 'Days to reply to a show cause notice or charge sheet', t: 'number', d: '7' },
      { k: 'appealDays', l: 'Days to file an appeal', t: 'number', d: '15' },
    ],
    body: `
## Purpose
This procedure sets out how {{company.name}} (the "**Company**") deals with misconduct fairly and consistently, following the principles of natural justice and applicable law, including the Industrial Relations Code, 2020 and any standing orders that apply.

## Misconduct
2.1 Misconduct includes, among other things:
- theft, fraud or dishonesty in connection with the Company's business or property;
- wilful insubordination or disobedience of a lawful and reasonable order;
- habitual late attendance or habitual absence without leave, or absence without leave for more than eight consecutive days;
- taking or giving a bribe or any illegal gratification;
- sexual harassment, or any harassment, bullying or discrimination;
- breach of confidentiality, data protection or IT security policies;
- falsifying records, attendance or expense claims;
- drunkenness, disorderly or violent behaviour at the workplace;
- wilful damage to or loss of Company property;
- engaging in a conflicting business or outside employment without permission;
- breach of the Code of Conduct or any other policy; and
- any act subversive of discipline or prejudicial to the interests or reputation of the Company.
[[if tag=insurance]]
- mis-selling, rebating, sharing commission, or any breach of IRDAI regulations or the code of conduct for broking staff;
[[endif]]
2.2 The list is illustrative. Minor lapses may be handled first through counselling or an informal warning.

## Penalties
3.1 **Minor penalties:** written warning; censure; withholding of one increment without cumulative effect; fine to the extent permitted by law.
3.2 **Major penalties:** withholding of increments with cumulative effect; withholding of promotion; demotion; recovery of loss caused to the Company; discharge; dismissal.
3.3 A major penalty is imposed only after a domestic inquiry under section 5, unless the employee admits the misconduct in writing.

## Show cause notice
4.1 When misconduct is reported, the disciplinary authority, {{disciplinaryAuthority}}, may issue a show cause notice setting out the allegations and the evidence, and asking the employee to explain in writing within {{replyDays}} days.
4.2 If the explanation is satisfactory, the matter is closed. If not, or if no reply is received, the authority may impose a minor penalty, or issue a charge sheet if a major penalty is contemplated.

## Domestic inquiry
5.1 **Charge sheet:** the charge sheet sets out each charge clearly, with the facts, dates and documents relied on, and gives {{replyDays}} days for a written reply.
5.2 **Inquiry officer:** if the charges are denied, the authority appoints an impartial inquiry officer, who may be an employee or an external person, and a presenting officer to present the Company's case.
5.3 **Hearing:** the employee is given written notice of each hearing, may inspect the documents relied on, may cross-examine the Company's witnesses, may produce their own witnesses and documents, and may be assisted by a co-employee of their choice.
5.4 **Ex parte:** if the employee does not attend despite notice and without reasonable cause, the inquiry may proceed ex parte.
5.5 **Findings:** the inquiry officer records the proceedings and gives a reasoned report on each charge.
5.6 **Second show cause:** if the authority agrees with findings of guilt and proposes a major penalty, it sends the employee a copy of the report and the proposed penalty, and considers any reply before deciding.
5.7 Allegations of sexual harassment are inquired into by the Internal Committee under the POSH policy, and its report is treated as the inquiry report for this procedure.

## Suspension pending inquiry
6.1 An employee may be suspended pending inquiry if the charges are serious or their presence may affect the inquiry.
6.2 During suspension the employee receives a subsistence allowance as required by law (generally 50% of wages for the first 90 days and 75% thereafter, or the amount set by the applicable standing orders). If the employee is exonerated, the full wages for the suspension period are paid.

## Order and appeal
7.1 The disciplinary authority passes a written, reasoned order and communicates it to the employee.
7.2 The employee may appeal to {{appellateAuthority}} within {{appealDays}} days. The appellate authority may confirm, reduce or set aside the penalty.

## Records
All disciplinary records are kept in the employee's personnel file and treated as confidential.
`,
  });

  S.tpl('hr-grievance-committee', {
    v: '1.0',
    fields: [
      { k: 'grcMembers', l: 'Grievance Redressal Committee members (one per line: name – employer/worker representative)', t: 'textarea' },
      { k: 'informalLevel', l: 'First level for informal grievances', d: 'the reporting manager' },
    ],
    body: `
## Purpose
This policy gives employees of {{company.name}} (the "**Company**") a fair and quick way to resolve grievances about their employment, and sets up the Grievance Redressal Committee required by section 4 of the Industrial Relations Code, 2020 (the "**IR Code**").

## What is a grievance
A grievance is a complaint by an employee about their employment, such as pay, leave, working conditions, transfer, promotion, or treatment by a manager or colleague. Complaints of sexual harassment go to the Internal Committee under the POSH policy. Concerns about fraud or unethical conduct go through the whistleblower mechanism.

## Informal resolution
An employee should first raise the grievance with {{informalLevel}}, who tries to resolve it within seven working days. The employee may go straight to the Committee if the grievance is about the manager.

## Grievance Redressal Committee
4.1 Every establishment of the Company employing 20 or more workers has a Grievance Redressal Committee (the "**Committee**"). [[if headcount>=20]]The Company currently meets this threshold.[[endif]]
4.2 The Committee has an equal number of members representing the employer and the workers, with not more than 10 members in total. The chairperson is chosen from the employer and worker representatives alternately each year. Women workers are represented in proportion to the number of women workers in the establishment, and in any case at least one member is a woman.
4.3 Current members:
{{grcMembers}}

## Procedure
5.1 An aggrieved worker may apply to the Committee in writing within one year from the date the cause of the grievance arose.
5.2 The Committee completes its proceedings within 30 days of receiving the application.
5.3 A worker who is not satisfied with the Committee's decision, or whose grievance is not decided within 30 days, may file an appeal with the employer. The employer decides the appeal within one month and sends a copy of the decision to the worker.
5.4 The worker may also raise an industrial dispute before the conciliation officer, as allowed by the IR Code.

## Protection
No employee will be treated unfairly for raising a grievance in good faith. Grievances are handled confidentially.

## Records
The Committee records each grievance, the hearing and its decision. HR keeps these records.
`,
  });

  S.tpl('hr-standing-orders', {
    v: '1.0',
    fields: [
      { k: 'certStatus', l: 'Status of standing orders under the IR Code', t: 'select', o: ['not yet applicable (below threshold); adopted as service rules', 'model standing orders apply', 'certified standing orders in force'], d: 'not yet applicable (below threshold); adopted as service rules' },
      { k: 'probationMonths', l: 'Probation period (months)', t: 'number', d: '6' },
      { k: 'noticeConfirmed', l: 'Notice period for confirmed employees (days)', t: 'number', d: '30' },
      { k: 'noticeProbation', l: 'Notice period during probation (days)', t: 'number', d: '15' },
      { k: 'retirementAge', l: 'Retirement age', t: 'number', d: '58' },
    ],
    body: `
## Purpose and status
1.1 These service rules set out the conditions of service at {{company.name}} (the "**Company**") on the matters listed in the First Schedule to the Industrial Relations Code, 2020 (the "**IR Code**").
1.2 Under section 28 of the IR Code, standing orders are required in industrial establishments with 300 or more workers. Some state laws apply standing orders at lower thresholds. Status for the Company: {{certStatus}}.
1.3 Where model standing orders or certified standing orders apply, they prevail over these service rules to the extent of any inconsistency.

## Classification of employees
2.1 Employees are classified as permanent, probationer, fixed-term, trainee or apprentice. Each employee's classification is stated in their appointment letter.
2.2 A probationer is on probation for {{probationMonths}} months, which may be extended once by up to the same period with written reasons. On successful completion, the employee is confirmed in writing.

## Working hours, shifts and holidays
Working hours, shifts, weekly offs and holidays are as set out in the Working Hours policy and the Holiday policy, and are displayed at each office.

## Attendance and late coming
Attendance and late coming are governed by the Working Hours policy.

## Leave
Leave and the procedure for applying for it are governed by the Leave policy.

## Payment of wages
Wages are paid as set out in the Payroll policy.

## Termination of employment
7.1 A confirmed employee may resign, or the Company may terminate their employment other than for misconduct, by giving {{noticeConfirmed}} days' written notice or wages in lieu of notice.
7.2 During probation, the notice period is {{noticeProbation}} days.
7.3 Retrenchment, lay-off and closure follow the Termination and Retrenchment policy and Chapters IX and X of the IR Code.
7.4 Employees retire on reaching the age of {{retirementAge}} years.

## Misconduct and disciplinary action
Acts of misconduct, suspension, penalties and the procedure for inquiry are governed by the Disciplinary Action and Domestic Inquiry Procedure.

## Grievances
Grievances are redressed under the Grievance Redressal policy.

## Display
These service rules are displayed in English and in the language understood by the majority of workers at each office.
`,
  });

  S.tpl('hr-health-safety', {
    v: '1.0',
    fields: [
      { k: 'safetyOfficer', l: 'Person responsible for health and safety (name and designation)' },
      { k: 'firstAiders', l: 'Trained first-aiders (one per line)', t: 'textarea' },
      { k: 'drillFrequency', l: 'Fire and evacuation drill frequency', d: 'twice a year' },
      { k: 'healthCheckAge', l: 'Annual health check offered to employees aged (years and above)', t: 'number', d: '40' },
    ],
    body: `
## Purpose
{{company.name}} (the "**Company**") is committed to providing a safe and healthy workplace. This policy sets out how it meets its duties under the Occupational Safety, Health and Working Conditions Code, 2020 (the "**OSH Code**"), state fire safety laws and the building rules that apply to its premises.

## Responsibilities
2.1 The Company provides and maintains a workplace that is, so far as reasonably practicable, safe and without risk to health.
2.2 {{safetyOfficer}} is responsible for coordinating health and safety, keeping records and arranging training.
2.3 Every employee must take reasonable care of their own health and safety and that of others, follow safety instructions, use safety equipment provided, and report hazards, accidents and near misses immediately.

## Workplace facilities
The Company provides at each office clean and safe premises; adequate ventilation, lighting and temperature; safe drinking water; separate, clean washrooms for men and women; and, where required, a rest room and canteen.

## First aid
4.1 First-aid boxes with the prescribed contents are kept at each office and checked monthly.
4.2 Trained first-aiders: {{firstAiders}}.
4.3 Emergency numbers and the nearest hospital details are displayed at each office.

## Fire safety and evacuation
5.1 Fire extinguishers, alarms and emergency lighting are installed and maintained as required by the fire authority and the building management.
5.2 Emergency exits are kept clear and marked. Evacuation plans are displayed on each floor.
5.3 Fire and evacuation drills are held {{drillFrequency}}, and fire wardens are appointed for each floor.

## Health checks
The Company offers a free annual health examination to employees aged {{healthCheckAge}} years and above, or of the age prescribed under the OSH Code, whichever is lower.

## Ergonomics and wellbeing
Workstations are set up to reduce strain. Employees working on screens are encouraged to take short breaks. Mental health support is available under the Employee Wellness policy.

## Accidents and dangerous occurrences
8.1 Every accident, injury or dangerous occurrence must be reported to the safety officer and HR immediately.
8.2 Where an accident causes death or bodily injury, or a dangerous occurrence takes place, the Company sends notice to the authorities as required by section 10 of the OSH Code and the rules.
8.3 Each incident is investigated and corrective action is recorded.

## Visitors and contractors
Visitors are escorted and briefed on emergency procedures. Contractors working on the premises must follow this policy and any additional safety rules for their work.
`,
  });

  S.tpl('hr-women-night-work', {
    v: '1.0',
    fields: [
      { k: 'nightStart', l: 'Night work begins after', d: '7:00 p.m.' },
      { k: 'nightEnd', l: 'Night work ends before', d: '6:00 a.m.' },
      { k: 'transportMode', l: 'Transport arrangement', d: 'company-arranged cab with GPS tracking and pick-up and drop to the residence' },
      { k: 'transportCoordinator', l: 'Transport / security coordinator (name and phone)' },
    ],
    body: `
## Purpose
This policy sets out the safeguards {{company.name}} (the "**Company**") provides so that women employees can work safely at all hours, including night shifts, as permitted by section 43 of the Occupational Safety, Health and Working Conditions Code, 2020 and the applicable state laws.

## Consent
2.1 No woman employee is required to work before {{nightEnd}} or after {{nightStart}} without her written consent. Refusing consent does not affect her employment, pay or career.
2.2 Consent is recorded in writing and may be withdrawn by giving reasonable notice.

## Safety at the workplace
3.1 Women employees working at night work in groups wherever possible, and not fewer than the number required by the applicable state law or permission.
3.2 The workplace is well lit, has CCTV coverage of common areas and entry points, and has security personnel on duty, including a woman security guard where required.
3.3 Separate washrooms and a rest room are available near the work area.

## Transport
4.1 The Company provides {{transportMode}} for women employees whose shifts begin or end during night hours.
4.2 Drivers and vehicles are verified, including police verification of drivers. A security guard accompanies the cab where a woman employee would otherwise be the first to be picked up or the last to be dropped.
4.3 The coordinator, {{transportCoordinator}}, confirms that each employee has reached home safely.

## Complaints
Any incident or concern must be reported immediately to the transport or security coordinator and HR. Complaints of sexual harassment, including during transport, are dealt with by the Internal Committee under the POSH policy.

## Compliance
The Company obtains any permission and complies with any condition imposed by the state government for employing women at night, and maintains the records required.
`,
  });

  S.tpl('hr-privacy-notice', {
    v: '1.0',
    fields: [
      { k: 'hrSystems', l: 'Systems in which employee data is held', d: 'the HR and payroll systems, email and document storage' },
      { k: 'processors', l: 'Third parties who process employee data', t: 'textarea', d: 'payroll processor, background verification agency, insurer and TPA, EPFO and ESIC, banks, auditors, IT service providers' },
      { k: 'monitoring', l: 'Monitoring carried out (if any)', d: 'logs of use of Company devices, email and systems for security purposes, and CCTV at office premises' },
      { k: 'crossBorder', l: 'Is employee data stored outside India?', t: 'select', o: ['no', 'yes'], d: 'no' },
    ],
    body: `
## About this notice
1.1 This notice explains how {{company.name}} (the "**Company**", "**we**") processes the personal data of its employees, trainees, interns and job applicants under the Digital Personal Data Protection Act, 2023 (the "**DPDP Act**") and the Digital Personal Data Protection Rules, 2025.
1.2 For employee data, the Company is a Data Fiduciary.

## Personal data we process
| Category | Examples |
| Identity and contact | Name, photograph, date of birth, address, phone, email, emergency contact |
| Government identifiers | PAN, Aadhaar (only where required by law, such as for EPF/ESI), passport |
| Employment | CV, qualifications, references, background verification results, designation, appraisal, training, disciplinary records |
| Pay and benefits | Salary, bank details, tax declarations, PF/ESI/gratuity details, nominee details, insurance |
| Attendance and systems | Attendance, leave, log-in and usage records of Company systems and devices |
| Health | Medical certificates, fitness and health information where required for leave, insurance or safety |
| Family | Details of dependants and nominees, for benefits |

## Why we process it
We process personal data for employment purposes, which the DPDP Act treats as a legitimate use (section 7(i)), including: recruitment and onboarding; payroll, tax and statutory contributions; benefits and insurance; performance management and training; attendance and leave; workplace safety and security; compliance with labour, tax and sector laws; investigation of misconduct; and protecting the Company from loss or liability. Where we need your consent for any other purpose, we will ask for it separately, and you may withdraw it at any time.

## Who we share it with
We share personal data only as needed with: {{processors}}; and government authorities and regulators where required by law. Our data processors handle your data only on our instructions and under contracts that require appropriate security.
[[if crossBorder=yes]]
Some data is stored or processed outside India, in countries not restricted by the Central Government, with safeguards in our contracts.
[[endif]]

## Monitoring
For security and compliance, the Company carries out the following monitoring: {{monitoring}}. Monitoring is limited to what is necessary and proportionate.

## How long we keep it
We keep personal data for as long as you work with us and after that for the periods set out in the HR Records and Document Retention policy, which reflect legal requirements. Then we delete or anonymise it.

## Security
We protect personal data with reasonable security safeguards, including access control, encryption where appropriate, logging, and training. If a personal data breach occurs, we will inform the Data Protection Board of India and affected persons as required by the DPDP Act and Rules.

## Your rights
Under the DPDP Act you may:
- ask for a summary of your personal data we process and the processing activities;
- ask us to correct, complete, update or erase your personal data, subject to legal retention requirements;
- withdraw consent you have given, without affecting earlier processing;
- nominate a person to exercise your rights in the event of your death or incapacity; and
- raise a grievance with us, and if not satisfied, complain to the Data Protection Board of India.

## Your duties
You must provide accurate information, keep it updated and not register a false or frivolous grievance or complaint.

## Contact
Contact for data protection questions and grievances: {{company.dpoName}}, {{company.dpoEmail}}. We will respond within the period prescribed under the DPDP Rules.
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
