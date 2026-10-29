/* Drafted templates — HR Playbook: separation and statutory administration. */
(function (root) {
  const S = root.SAFE;

  S.tpl('hr-resignation', {
    v: '1.0',
    fields: [
      { k: 'noticeConfirmed', l: 'Notice period for confirmed employees (days)', t: 'number', d: '30' },
      { k: 'noticeProbation', l: 'Notice period during probation (days)', t: 'number', d: '15' },
      { k: 'noticeSenior', l: 'Notice period for senior / key roles (days, optional)', d: '' },
      { k: 'acceptanceDays', l: 'Days within which the company acknowledges a resignation', t: 'number', d: '3' },
      { k: 'relievingDays', l: 'Days after the last working day to issue the relieving letter', t: 'number', d: '7' },
    ],
    body: `
## Purpose
This policy sets out how an employee of {{company.name}} (the "**Company**") resigns, how the notice period works, and when relieving documents are issued.

## Notice period
2.1 A confirmed employee must give {{noticeConfirmed}} days' written notice of resignation. During probation, the notice period is {{noticeProbation}} days.
[[if noticeSenior]]
2.2 Employees in senior or key roles, as stated in their appointment letter, must give {{noticeSenior}} days' notice.
[[endif]]
2.3 If the employee's appointment letter or employment agreement states a different notice period, that period applies.

## How to resign
3.1 Resignation must be submitted in writing or by email to the reporting manager, with a copy to HR.
3.2 HR acknowledges the resignation in writing within {{acceptanceDays}} working days and confirms the last working day.
3.3 A resignation may be withdrawn only with the Company's written agreement before the last working day.

## Serving the notice period
4.1 The employee continues to work normally, completes handover and follows all policies during the notice period.
4.2 Leave during the notice period is allowed only with approval, except in a medical emergency. Earned leave is not adjusted against the notice period unless the Company agrees in writing.
4.3 The Company may release the employee before the end of the notice period. It may also, at its discretion, accept payment in lieu of the unserved part of the notice period, calculated on the employee's gross monthly salary, or place the employee on garden leave under the Garden Leave policy.

## Handover and clearance
The employee hands over all work, documents, passwords and Company property, and completes the exit clearance under the Exit Interview and Clearance policy, before the last working day.

## Relieving documents
6.1 The Company issues the relieving letter and experience letter within {{relievingDays}} days of the last working day, once handover is complete.
6.2 Any dispute about recovery of dues or property is pursued separately. The Company does not withhold the relieving letter as a means of recovering money, but may record in it that clearance is pending where that is the case.
6.3 Final dues are settled under the Full and Final Settlement policy.

## Continuing obligations
Confidentiality, intellectual property, non-solicitation and other obligations in the employment agreement continue after the employee leaves, for the periods stated there.
`,
  });

  S.tpl('hr-termination', {
    v: '1.0',
    fields: [
      { k: 'noticeConfirmed', l: 'Notice period for confirmed employees (days)', t: 'number', d: '30' },
      { k: 'terminationAuthority', l: 'Who approves termination', d: 'the Managing Director' },
    ],
    body: `
## Purpose
This policy sets out the grounds and procedure on which {{company.name}} (the "**Company**") may end an employee's employment, including retrenchment under the Industrial Relations Code, 2020 (the "**IR Code**").

## Types of termination
2.1 **For misconduct:** after a domestic inquiry under the Disciplinary Action and Domestic Inquiry Procedure.
2.2 **During probation:** for unsatisfactory performance or conduct, by giving the notice in the appointment letter.
2.3 **Termination simpliciter:** termination of a confirmed employee's employment, not as a punishment, by giving {{noticeConfirmed}} days' notice or wages in lieu, or the notice in the employee's contract, subject to section 2.4.
2.4 **Retrenchment:** termination of a "worker" (as defined in the IR Code) for any reason other than punishment, retirement, non-renewal of a fixed-term contract or continued ill-health, under section 4 of this policy.
2.5 **Expiry of a fixed-term contract**, and **retirement** on superannuation.

## Approval
All terminations, other than expiry of a fixed-term contract and retirement, require the prior written approval of {{terminationAuthority}} and a review by HR to confirm that the right procedure has been followed. Where the employee has raised a POSH complaint, a grievance or a protected disclosure, legal advice is taken before any termination.

## Retrenchment
4.1 A worker who has been in continuous service for at least one year is not retrenched until:
(a) the worker has been given one month's written notice stating the reasons, or wages for the notice period in lieu;
(b) the worker has been paid retrenchment compensation equal to 15 days' average pay for every completed year of continuous service, or any part of a year over six months; and
(c) notice has been given to the appropriate Government or authority in the manner prescribed.
4.2 In addition, the Company contributes an amount equal to 15 days' last drawn wages of each retrenched worker to the Worker Re-skilling Fund under section 83 of the IR Code.
4.3 Unless there are recorded reasons, the last person employed in the category is the first to be retrenched.
4.4 If the Company proposes to re-employ persons within one year of a retrenchment, it gives retrenched workers who offer themselves for re-employment preference over others.
4.5 Where the Company is an industrial establishment of the kind and size covered by Chapter X of the IR Code (factories, mines or plantations with 300 or more workers), prior permission of the appropriate Government is required for lay-off, retrenchment or closure.

## Procedure on termination
5.1 The termination letter states the effective date and, where required, the reasons, and encloses the notice pay and compensation due or states when they will be paid.
5.2 The meeting to communicate termination is held privately, with HR present.
5.3 Wages due are paid within two working days under the Code on Wages, 2019, and other dues under the Full and Final Settlement policy.

## Records
HR keeps the approval, notices, calculations and correspondence for each termination in the personnel file.
`,
  });

  S.tpl('hr-fnf', {
    v: '1.0',
    fields: [
      { k: 'fnfDays', l: 'Days after the last working day to pay the balance of full and final settlement', t: 'number', d: '30' },
      { k: 'fnfOwner', l: 'Who prepares and approves the settlement', d: 'HR and Finance' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") settles an employee's dues when employment ends, in line with the Code on Wages, 2019 (the "**Wage Code**") and the Code on Social Security, 2020.

## Timelines
2.1 **Wages:** all wages due are paid within two working days of the employee's removal, dismissal, retrenchment or resignation, as required by section 17(2) of the Wage Code.
2.2 **Gratuity:** paid within 30 days of it becoming payable.
2.3 **Other amounts** (leave encashment, bonus, reimbursements, incentives due under the scheme) are paid within {{fnfDays}} days of the last working day, after exit clearance.

## What the settlement includes
- salary up to the last working day;
- encashment of earned leave as per the Leave policy;
- statutory bonus for the year, if applicable;
- gratuity, if eligible;
- approved reimbursements and incentives earned under the applicable scheme;
- notice pay where the Company relieves the employee early without notice; and
- any other amount due under the appointment letter.

## Permitted recoveries
Only recoveries permitted by law and agreed in the appointment letter or in writing are made, such as unrecovered advances or loans, notice pay where the employee does not serve notice, the value of unreturned Company property, and training cost recovery under a signed agreement.

## Statement and documents
5.1 {{fnfOwner}} prepares a written settlement statement showing each amount paid and each deduction, and sends it to the employee with the payment.
5.2 The employee also receives: relieving letter and experience letter; Form 16 for the year (when issued); and help with PF transfer or withdrawal.

## Disputes
If the employee disputes the settlement, HR reviews it within 10 working days. Undisputed amounts are not held back while a dispute is resolved.
`,
  });

  S.tpl('hr-statutory-registers', {
    v: '1.0',
    fields: [
      { k: 'complianceOwner', l: 'Person responsible for labour law compliance', d: 'the HR Manager' },
      { k: 'payrollVendor', l: 'Payroll / compliance service provider (if any)', d: '' },
    ],
    body: `
## Purpose
This policy lists the registrations, registers, returns and notices {{company.name}} (the "**Company**") must maintain under labour laws in each state where it operates ({{company.states|list}}), and assigns responsibility for them.

## Responsibility
{{complianceOwner}} is responsible for this policy[[if payrollVendor]], with support from {{payrollVendor}}[[endif]]. The compliance calendar is reviewed every month.

## Registrations
| Registration | Law | Status / number |
| Establishment registration (each office) | State Shops and Establishments Act; registration under the OSH Code where applicable | |
| Provident Fund | Code on Social Security, 2020 / EPF scheme | |
| Employees' State Insurance | Code on Social Security, 2020 / ESI scheme | |
| Professional tax (employer) | State professional tax law | |
| Labour welfare fund | State labour welfare fund law | |
| POSH – SHe-Box | POSH Act, 2013 | |
| Contract labour (principal employer), if 50 or more contract workers | OSH Code, 2020 | |

## Registers and records
The Company maintains, in electronic form where permitted, the registers of: employees; wages and deductions; attendance and working hours; overtime; leave; bonus; accidents; maternity benefit; contract workers (if any); and any other register required by the labour codes or state law.

## Compliance calendar
| Item | Frequency | Due date (subject to notified changes) |
| PF and ESI contributions and returns | Monthly | 15th of the following month |
| TDS on salaries – deposit | Monthly | 7th of the following month (30 April for March) |
| Professional tax | Monthly / as per state law | As per state law |
| TDS returns (Form 24Q) | Quarterly | 31 July, 31 October, 31 January, 31 May |
| Form 16 to employees | Annual | 15 June |
| Labour welfare fund | Annual / half-yearly | As per state law |
| POSH annual report of the IC | Annual | As required by the District Officer, usually by 31 January |
| Statutory bonus payment | Annual | Within 8 months of the close of the accounting year |
| Annual return under the labour codes | Annual | As prescribed |
| Shops and Establishments renewal (where required) | As per state law | As per state law |

## Notices and display
The Company displays at each office: the registration certificate; working hours and weekly off; the holiday list; the POSH notice and IC details; the abstract of the labour laws in the prescribed form; and the contact details of the grievance redressal committee.

## Inspections
During any inspection, HR coordinates with the inspector, provides the records requested and informs management. Inspection reports and replies are kept on file.
`,
  });

  S.tpl('hr-contract-labour', {
    v: '1.0',
    fields: [
      { k: 'contractActivities', l: 'Activities given to contractors', t: 'textarea', d: 'housekeeping, security, pantry, facility maintenance' },
      { k: 'contractCoordinator', l: 'Company representative for contractors' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") engages contractors who deploy their workers at the Company's premises, and how it meets its obligations as principal employer under Chapter XI of the Occupational Safety, Health and Working Conditions Code, 2020 (the "**OSH Code**") and the Code on Wages, 2019.

## Activities given on contract
Contract labour is used for: {{contractActivities}}. Contract labour is not engaged in the Company's core activities, except as permitted under section 57 of the OSH Code.

## Choosing contractors
3.1 Contractors are selected after checking their registrations, licence (where they deploy 50 or more workers), PF and ESI registrations, GST registration, and their record of paying wages on time.
3.2 Each contractor signs a written agreement requiring compliance with labour laws, payment of at least the minimum wage, timely deposit of PF and ESI contributions, maintenance of records, and indemnity in favour of the Company.

## Principal employer obligations
4.1 Where the Company engages 50 or more contract workers on any day, it obtains the registration required of a principal employer and maintains the register of contractors.
4.2 The Company provides contract workers with drinking water, washrooms, first aid and, where required, canteen and rest rooms.
4.3 {{contractCoordinator}} checks every month that each contractor has paid wages on time and deposited PF and ESI contributions, by obtaining copies of wage registers and challans.
4.4 If the contractor fails to pay wages, the Company pays the unpaid wages as required by law and recovers them from the contractor.

## Treatment of contract workers
5.1 Contract workers are covered by the POSH policy, the Health and Safety policy and the Code of Conduct while on the premises.
5.2 Contract workers are supervised by the contractor's supervisors for day-to-day matters, so that the contractor remains their employer.
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
