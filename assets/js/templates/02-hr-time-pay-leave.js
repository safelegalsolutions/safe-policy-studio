/* Drafted templates — HR Playbook: working time, pay, statutory benefits, leave. */
(function (root) {
  const S = root.SAFE;

  S.tpl('hr-working-hours', {
    v: '1.0',
    fields: [
      { k: 'workDays', l: 'Working days', d: 'Monday to Friday' },
      { k: 'officeHours', l: 'Standard office hours', d: '9:30 a.m. to 6:30 p.m.' },
      { k: 'dailyHours', l: 'Normal working hours per day (excluding breaks)', t: 'number', d: '8' },
      { k: 'weeklyHours', l: 'Maximum working hours per week', t: 'number', d: '48' },
      { k: 'breakMinutes', l: 'Meal / rest break (minutes)', t: 'number', d: '60' },
      { k: 'graceMinutes', l: 'Grace period for late arrival (minutes)', t: 'number', d: '15' },
      { k: 'lateMarksPerMonth', l: 'Late marks per month allowed before a half-day leave is deducted', t: 'number', d: '3' },
      { k: 'attendanceSystem', l: 'Attendance system', d: 'the biometric / HRMS attendance system' },
      { k: 'shiftWork', l: 'Does the company run shifts?', t: 'select', o: ['no', 'yes'], d: 'no' },
    ],
    body: `
## Purpose
This policy sets the working hours, breaks, weekly off and attendance rules of {{company.name}} (the "**Company**"), within the limits of the Occupational Safety, Health and Working Conditions Code, 2020 (the "**OSH Code**") and the Shops and Establishments Act of each state where the Company has an office ({{company.states|list}}).

## Working days and hours
2.1 The normal working days are {{workDays}}. Office hours are {{officeHours}}, which include a break of {{breakMinutes}} minutes.
2.2 No employee will be required to work more than {{dailyHours}} hours in a day or {{weeklyHours}} hours in a week, excluding overtime permitted by law, and the spread-over of a working day will not exceed the limit in the applicable state law.
2.3 No employee will work for more than five hours continuously without a rest interval of at least half an hour.
2.4 Every employee gets at least one full day's weekly holiday. Where an employee is required to work on the weekly holiday, a substituted holiday is given within the period allowed by law.

[[if shiftWork=yes]]
## Shifts
3.1 Shift timings, rotations and rosters are notified in advance and displayed or published to the employees concerned.
3.2 Shifts are rotated so that no employee works night shifts continuously beyond the period allowed by the applicable law, and there is a rest period of at least 12 hours between the end of one shift and the start of the next.
3.3 Women employees work night shifts only with their written consent and with the safeguards in the Women's Safety, Night Work and Transport policy.
[[endif]]

## Attendance
4.1 Employees record attendance through {{attendanceSystem}}. Recording attendance for another person is misconduct.
4.2 Arrival up to {{graceMinutes}} minutes after the start time is allowed as grace. More than {{lateMarksPerMonth}} late arrivals in a calendar month will be adjusted against half a day's leave for each further late arrival.
4.3 An employee who cannot attend must inform their manager before the start of the working day, or as soon as reasonably possible in an emergency.
4.4 Unauthorised absence for more than eight consecutive days is dealt with under the Absconding and Job Abandonment policy.

## Remote and field work
Employees working remotely or in the field record their working time as directed by their manager. The working-hours limits in this policy still apply.

## Overtime
Work beyond the normal hours is done only when the manager asks for it in advance and is paid or compensated under the Overtime and Compensatory Pay policy.

## Records
The Company maintains registers of attendance, working hours, overtime and weekly holidays in the form required by the OSH Code and the applicable state law, and displays the required notice of working hours at each office.
`,
  });

  S.tpl('hr-payroll', {
    v: '1.0',
    fields: [
      { k: 'payDay', l: 'Salary credit date', d: 'the last working day of the month' },
      { k: 'payrollCutoff', l: 'Payroll cut-off date for attendance and inputs', d: 'the 25th of each month' },
      { k: 'payslipMode', l: 'How payslips are issued', d: 'electronically through the HR system' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") calculates and pays wages, so that payment is accurate, on time and compliant with the Code on Wages, 2019 (the "**Wage Code**").

## Wage period and date of payment
2.1 The wage period is one calendar month.
2.2 Salaries are credited to the employee's bank account on {{payDay}}. Under section 17 of the Wage Code, wages are in any case paid before the expiry of the seventh day of the following month.
2.3 Attendance, leave, overtime, reimbursements and other inputs received after {{payrollCutoff}} are processed in the next payroll.

## Payment on exit
When an employee is removed, dismissed, retrenched or resigns, or their employment otherwise ends, all wages due are paid within two working days, as required by section 17(2) of the Wage Code. Other dues are settled under the Full and Final Settlement policy.

## Salary structure and "wages"
4.1 Each employee's salary structure is set out in their appointment letter or a later revision letter.
4.2 For the purposes of the labour codes, "wages" means basic pay, dearness allowance and retaining allowance. If the excluded components (other than those the law treats separately) exceed 50% of total remuneration, the excess is treated as wages for calculating gratuity, PF and other statutory benefits. Salary structures are designed and reviewed with this rule in mind.
4.3 No employee is paid less than the minimum wage notified for their category and state, and wages are not set or paid differently on the basis of gender.

## Deductions
5.1 Only deductions permitted by section 18 of the Wage Code and by tax law are made, such as income tax (TDS), professional tax, the employee's PF and ESI contributions, recovery of advances or loans, deductions for unauthorised absence, and amounts authorised in writing by the employee.
5.2 Total deductions in a wage period do not exceed 50% of wages.

## Payslips
A payslip is issued to every employee for each wage period, {{payslipMode}}, showing gross wages, each deduction and net pay.

## Taxes
The Company deducts income tax at source on the basis of the employee's declared regime and investment declarations, and issues Form 16 within the time prescribed under the income-tax law. Employees must submit proofs by the dates notified by HR.

## Errors and queries
Payroll errors are corrected in the next payroll at the latest. Employees raise queries with the HR/payroll team, who respond within five working days.

## Records
Wage registers and payroll records are kept in the form and for the period required under the Wage Code and the applicable state rules.
`,
  });

  S.tpl('hr-bonus', {
    v: '1.0',
    fields: [
      { k: 'bonusCeiling', l: 'Wage ceiling for bonus eligibility (₹ per month, as notified)', d: '21000' },
      { k: 'calcCeiling', l: 'Wage ceiling for calculating bonus (₹ per month, as notified)', d: '7000 or the applicable minimum wage, whichever is higher' },
      { k: 'bonusRate', l: 'Bonus rate the company pays (%)', d: '8.33' },
      { k: 'accountingYear', l: 'Accounting year', d: '1 April to 31 March' },
    ],
    body: `
## Purpose
This policy sets out how {{company.name}} (the "**Company**") pays statutory bonus under Chapter IV of the Code on Wages, 2019 (the "**Wage Code**").

## Applicability
2.1 The bonus provisions apply to every establishment in which 20 or more persons are employed on any day during an accounting year. [[if headcount>=20]]The Company currently meets this threshold.[[endif]]
2.2 An employee is eligible if their wages do not exceed ₹{{bonusCeiling}} per month (or the ceiling notified by the appropriate Government from time to time) and they have worked for at least 30 days in the accounting year.

## Amount of bonus
3.1 The Company pays a minimum bonus of 8.33% of the wages earned in the accounting year, or ₹100, whichever is higher, even if it has no allocable surplus.
3.2 Where there is allocable surplus, bonus may be paid up to a maximum of 20% of wages.
3.3 For calculating bonus, wages are taken at ₹{{calcCeiling}} per month, even if actual wages are higher.
3.4 For the current year the Company has decided to pay bonus at {{bonusRate}}% of wages.

## Time of payment
The accounting year is {{accountingYear}}. Bonus is paid within eight months from the close of the accounting year, unless an extension is granted by the appropriate Government.

## Disqualification
An employee dismissed for fraud, riotous or violent behaviour on the premises, theft, misappropriation or sabotage of Company property, or conviction for sexual harassment, is not entitled to bonus for that year.

## Adjustments
Customary or interim bonus paid during the year may be adjusted against the statutory bonus. Performance-linked incentives are separate and are not adjusted unless the incentive scheme says so.

## Records
The Company keeps the bonus registers and files the returns required under the Wage Code and the applicable rules.
`,
  });

  S.tpl('hr-pf-esi-gratuity', {
    v: '1.0',
    fields: [
      { k: 'pfWageBase', l: 'PF contribution basis', t: 'select', o: ['actual wages', 'wages up to the statutory ceiling of ₹15,000 per month'], d: 'wages up to the statutory ceiling of ₹15,000 per month' },
      { k: 'esiApplies', l: 'Is the company covered under ESI?', t: 'select', o: ['yes', 'no'], d: 'yes' },
      { k: 'esiCeiling', l: 'ESI wage ceiling (₹ per month, as notified)', d: '21000' },
      { k: 'gratuityInsurer', l: 'Gratuity fund / insurer (if any)', d: '' },
    ],
    body: `
## Purpose
This policy explains the Provident Fund, Employees' State Insurance and gratuity benefits that {{company.name}} (the "**Company**") provides under the Code on Social Security, 2020 (the "**SS Code**") and the schemes made under it.

## Provident Fund
2.1 Every eligible employee is enrolled in the Employees' Provident Fund, Employees' Pension Scheme and Employees' Deposit Linked Insurance Scheme from the date of joining.
2.2 The employee and the Company each contribute 12% of the employee's wages (basic pay and dearness allowance, with the 50% rule in the Payroll policy) calculated on {{pfWageBase}}, or such other rate as is notified.
2.3 The employee's Universal Account Number (UAN) is linked and activated at joining. Previous PF accumulations are transferred on the employee's request.
2.4 Contributions are deposited with the EPFO by the 15th of the following month.

[[if esiApplies=yes]]
## Employees' State Insurance
3.1 Employees whose wages do not exceed ₹{{esiCeiling}} per month (or the ceiling notified from time to time) are covered under ESI.
3.2 The Company contributes 3.25% and the employee 0.75% of wages, or such rates as are notified. Contributions are deposited by the 15th of the following month.
3.3 Covered employees and their families receive medical, sickness, maternity, disablement and dependants' benefits from the ESIC. Employees not covered under ESI are covered under the Company's group health insurance, if any.
[[endif]]

## Gratuity
4.1 Gratuity is payable on termination of employment after at least five years of continuous service, on superannuation, retirement, resignation, death or disablement. The five-year condition does not apply on death or disablement.
4.2 A fixed-term employee is entitled to gratuity on a pro-rata basis on completing one year of service or more.
4.3 Gratuity is calculated at 15 days' wages for every completed year of service, or part of a year over six months, on the basis of the last drawn wages, using the formula: last drawn monthly wages × 15/26 × number of years of service.
4.4 Gratuity is subject to the ceiling notified under the SS Code (currently ₹20,00,000).
4.5 Gratuity is paid within 30 days of it becoming payable. Employees must file a nomination for gratuity on completing one year of service.
[[if gratuityInsurer]]
4.6 The Company funds its gratuity liability through {{gratuityInsurer}}.
[[endif]]

## Employee responsibilities
Employees must provide accurate personal, family and bank details, keep their nominations up to date and inform HR of any change.

## Records and returns
The Company keeps the registers, files the returns and displays the notices required under the SS Code and the schemes.
`,
  });

  S.tpl('hr-overtime', {
    v: '1.0',
    fields: [
      { k: 'otApprover', l: 'Who approves overtime in advance', d: 'the reporting manager' },
      { k: 'otMaxQuarter', l: 'Maximum overtime hours per quarter (as allowed by state law)', d: '125' },
      { k: 'compOffValidity', l: 'Compensatory off must be used within (days)', t: 'number', d: '60' },
      { k: 'managerialGrades', l: 'Grades treated as managerial / supervisory (not paid overtime)', d: 'Manager and above' },
    ],
    body: `
## Purpose
This policy sets out when overtime may be worked and how it is compensated at {{company.name}} (the "**Company**").

## Overtime
2.1 Overtime means work beyond the normal daily or weekly hours in the Working Hours policy.
2.2 Overtime is worked only with the prior approval of {{otApprover}} and with the employee's consent.
2.3 Employees who are "workers" or "employees" entitled to overtime under the Code on Wages, 2019 and the Occupational Safety, Health and Working Conditions Code, 2020 are paid for overtime at twice their ordinary rate of wages.
2.4 Total overtime hours do not exceed {{otMaxQuarter}} hours in a quarter, or the lower limit in the applicable state law.

## Compensatory off
3.1 Employees in {{managerialGrades}} grades are not paid overtime. Where they are required to work on a weekly off or holiday, they receive a compensatory day off.
3.2 Compensatory off must be availed within {{compOffValidity}} days, with the manager's approval, and lapses afterwards. It cannot be encashed.

## Records
Overtime hours and payments are recorded in the overtime register required by law and in the payroll.
`,
  });

  S.tpl('hr-leave', {
    v: '1.0',
    fields: [
      { k: 'leaveYear', l: 'Leave year', d: 'the calendar year (January to December)' },
      { k: 'earnedLeave', l: 'Earned / privilege leave per year (days)', t: 'number', d: '18' },
      { k: 'casualLeave', l: 'Casual leave per year (days)', t: 'number', d: '7' },
      { k: 'sickLeave', l: 'Sick leave per year (days)', t: 'number', d: '12' },
      { k: 'elCarryForward', l: 'Maximum earned leave that can be carried forward (days)', t: 'number', d: '30' },
      { k: 'elEncashment', l: 'Earned leave encashment', t: 'select', o: ['allowed at year end above the carry-forward limit and on separation', 'allowed only on separation'], d: 'allowed at year end above the carry-forward limit and on separation' },
      { k: 'sickCertDays', l: 'Medical certificate required for sick leave of more than (days)', t: 'number', d: '2' },
      { k: 'elNoticeDays', l: 'Notice for planned earned leave (days)', t: 'number', d: '7' },
      { k: 'leaveApprover', l: 'Who approves leave', d: 'the reporting manager' },
    ],
    body: `
## Purpose
This policy sets out the leave available to employees of {{company.name}} (the "**Company**") and how to apply for it. The entitlements meet or exceed the minimums under the Occupational Safety, Health and Working Conditions Code, 2020 (the "**OSH Code**") and the Shops and Establishments Act of each state where the Company has an office ({{company.states|list}}). Where a state law gives more, the state law applies to employees in that state.

## Leave year
The leave year is {{leaveYear}}. Employees joining during the year receive leave on a pro-rata basis.

## Leave entitlement
| Type of leave | Days per year | Key conditions |
| Earned leave | {{earnedLeave}} | Accrues at one day for every 20 days worked; carry forward up to {{elCarryForward}} days |
| Casual leave | {{casualLeave}} | For short, unplanned needs; not carried forward or encashed |
| Sick leave | {{sickLeave}} | Medical certificate for absence of more than {{sickCertDays}} days |
| Maternity, paternity and other leave | As per the relevant policy | See the Maternity Benefit policy and the special leave policies |

## Earned leave
4.1 Under section 32 of the OSH Code, an employee who has worked for 180 days or more in a calendar year is entitled to earned leave with wages at the rate of one day for every 20 days of work in the previous year. The Company's earned leave entitlement above meets this minimum.
4.2 Earned leave may be carried forward up to {{elCarryForward}} days. Encashment is {{elEncashment}}, calculated on the wages used for this purpose under law.
4.3 Planned earned leave must be applied for at least {{elNoticeDays}} days in advance.
4.4 If an employee's request for earned leave is refused, the leave is not lost and is carried forward as required by law.

## Casual leave
Casual leave is for short, unforeseen needs. It is normally taken for not more than three days at a time and cannot be combined with earned leave without approval.

## Sick leave
6.1 Sick leave is taken when the employee is unwell. The employee must inform their manager as early as possible on the first day of absence.
6.2 For absence of more than {{sickCertDays}} days, the employee submits a medical certificate from a registered medical practitioner. The Company may also ask for a fitness certificate before return to work.
6.3 Medical certificates are treated as sensitive personal data and kept confidential.

## Applying for leave
7.1 Leave is applied for through the HR system and approved by {{leaveApprover}}. Leave is not a matter of right except where the law makes it so, and may be refused or rescheduled for business needs, subject to law.
7.2 Absence without approved leave is unauthorised absence. Wages may be deducted for the period, and repeated unauthorised absence is misconduct.
7.3 Holidays and weekly offs falling within a period of leave are not counted as leave, unless the state law provides otherwise.

## Leave on separation
On separation, the balance of earned leave is encashed in the full and final settlement. Leave cannot be adjusted against the notice period without the Company's written approval.

## Records
The Company maintains leave registers in the form required under the OSH Code and the applicable state law.
`,
  });

  S.tpl('hr-holidays', {
    v: '1.0',
    fields: [
      { k: 'holidayYear', l: 'Calendar year', d: '2027' },
      { k: 'totalHolidays', l: 'Total paid holidays per year', t: 'number', d: '10' },
      { k: 'optionalHolidays', l: 'Optional / restricted holidays an employee may choose', t: 'number', d: '2' },
      { k: 'holidayTableBlock', l: 'Holiday list (one per line: | Date | Day | Holiday | Offices |)', t: 'textarea', d: '| 26 January | | Republic Day | All offices |\n| 1 May | | May Day / Labour Day | All offices |\n| 15 August | | Independence Day | All offices |\n| 2 October | | Gandhi Jayanti | All offices |' },
    ],
    body: `
## Purpose
This policy sets out the paid holidays of {{company.name}} (the "**Company**") and how the annual holiday list is fixed, in line with the national and festival holidays laws of each state where the Company has an office ({{company.states|list}}).

## Number of holidays
2.1 Employees are entitled to {{totalHolidays}} paid holidays in each calendar year, including the national holidays of Republic Day (26 January), Labour Day (1 May), Independence Day (15 August) and Gandhi Jayanti (2 October), and festival holidays.
2.2 In addition, employees may choose {{optionalHolidays}} optional holidays from the optional list.
[[if state=Karnataka]]
2.3 For offices in Karnataka, Kannada Rajyotsava (1 November) is also a compulsory paid holiday under the Karnataka Industrial Employment (National and Festival Holidays) Act, 1963.
[[endif]]

## Holiday list for {{holidayYear}}
HR publishes the holiday list for each office before the start of the year, after consulting employees where the state law requires it, and sends any list required to the labour authorities.
| Date | Day | Holiday | Offices |
{{holidayTableBlock}}

## Work on a holiday
An employee required to work on a national or festival holiday receives wages at the rate required by the applicable state law (usually twice the ordinary rate) or a substituted holiday, as that law allows.

## Display
The holiday list is displayed at each office and published on the HR system.
`,
  });

  S.tpl('hr-maternity', {
    v: '1.0',
    fields: [
      { k: 'wfhAfterLeave', l: 'Work-from-home option after maternity leave', d: 'may be agreed between the employee and the Company, where the nature of work allows' },
      { k: 'medicalBonus', l: 'Medical bonus (₹, as notified)', d: '3500' },
      { k: 'extraBenefits', l: 'Additional benefits the company offers (optional)', t: 'textarea' },
    ],
    body: `
## Purpose
This policy sets out the maternity benefits available to women employees of {{company.name}} (the "**Company**") under Chapter VI of the Code on Social Security, 2020 (the "**SS Code**"). The Company informs every woman employee of these benefits in writing and electronically at the time of her appointment.

## Eligibility
A woman employee is entitled to maternity benefit if she has actually worked for the Company for at least 80 days in the 12 months immediately before the date of her expected delivery. Employees covered under ESI receive maternity benefit from the ESIC under the ESI scheme instead.

## Maternity leave
3.1 **Up to two surviving children:** 26 weeks of paid leave, of which not more than 8 weeks may be taken before the expected date of delivery.
3.2 **Two or more surviving children:** 12 weeks of paid leave, of which not more than 6 weeks may be taken before the expected date of delivery.
3.3 **Adoption:** a woman who legally adopts a child below three months of age is entitled to 12 weeks from the date the child is handed over to her.
3.4 **Commissioning mother:** a commissioning mother is entitled to 12 weeks from the date the child is handed over to her.
3.5 **Miscarriage or medical termination of pregnancy:** 6 weeks immediately following the day of miscarriage or termination.
3.6 **Tubectomy:** 2 weeks immediately following the operation.
3.7 **Illness arising out of pregnancy, delivery, premature birth, miscarriage or tubectomy:** up to one additional month, on production of proof.

## Payment
4.1 Maternity benefit is paid at the rate of the average daily wage for the period of actual absence.
4.2 Where the Company does not provide free pre-natal and post-natal care, the employee receives a medical bonus of ₹{{medicalBonus}}, or such amount as is notified.

## Notice and documents
The employee gives written notice of the expected date of delivery and the date from which she will be absent, with a certificate from a registered medical practitioner, as early as possible.

## Return to work
6.1 After maternity leave, work from home {{wfhAfterLeave}}, on terms agreed in writing.
6.2 A woman who returns to work is allowed two nursing breaks a day, in addition to her normal rest interval, until the child is 15 months old.
6.3 She may use the crèche facility under the Crèche and Childcare policy, where it applies.

## Protection
7.1 The Company will not dismiss or discharge a woman during or on account of her maternity leave, or vary her conditions of service to her disadvantage during that period.
7.2 No woman is required to do arduous work, work involving long hours of standing, or work likely to interfere with her pregnancy or the normal development of the foetus, during the 10 weeks before her expected delivery.

[[if extraBenefits]]
## Additional benefits
{{extraBenefits}}
[[endif]]
`,
  });

  S.tpl('hr-creche', {
    v: '1.0',
    fields: [
      { k: 'crecheMode', l: 'How the crèche is provided', t: 'select', o: ['an on-site crèche', 'a tie-up with an empanelled crèche near the office', 'a common crèche facility shared with other establishments'], d: 'a tie-up with an empanelled crèche near the office' },
      { k: 'crecheAge', l: 'Age of children covered', d: 'six months to six years' },
      { k: 'crecheCost', l: 'Cost borne by the company', d: 'the full cost of the crèche facility' },
    ],
    body: `
## Purpose
This policy sets out the crèche facility provided by {{company.name}} (the "**Company**") under section 67 of the Code on Social Security, 2020.

## Applicability
The facility applies to every office where the Company employs 50 or more employees. [[if headcount>=50]]The Company currently meets this threshold.[[else]]At the date of this policy the Company is below the threshold; this policy will apply automatically when the threshold is reached.[[endif]]

## The facility
3.1 The Company provides {{crecheMode}}, within the distance prescribed under the applicable rules.
3.2 The facility is available to employees for children aged {{crecheAge}}. The Company bears {{crecheCost}}.
3.3 The facility meets the standards of safety, hygiene and supervision in the applicable rules and guidelines.

## Visits
A woman employee is allowed four visits a day to the crèche, which include her rest interval.

## Use by all parents
The facility is open to both women and men employees who are parents of eligible children.
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
