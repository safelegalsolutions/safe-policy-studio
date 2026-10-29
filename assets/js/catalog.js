/* SAFE Policy Studio — document library.
 * Sections hold items: [id, title, tag, industryTags?, kind?, validityMonths?]
 *   tag:  M = mandatory by law, I = industry/regulator-driven, R = recommended
 *   industryTags: null/undefined = all industries; otherwise shown as relevant
 *                 only when the client's industry has one of these tags
 *   kind: 'policy' (default), 'agreement', 'template' (letters and forms)
 * An item is "drafted" when a template with the same id is registered in
 * assets/js/templates/. Undrafted items generate a structured skeleton. */
(function (root) {
  const S = (root.SAFE = root.SAFE || {});
  const INS = ['insurance'];

  const SECTIONS = [
    // ---------------- HR PLAYBOOK ----------------
    { id: 'A', code: 'HR', cat: 'HR Playbook', title: 'A. Foundation and governance', items: [
      ['hr-charter', 'HR Playbook charter: scope, ownership, approval and amendment of policies', 'R'],
      ['hr-code-of-conduct', 'Code of Conduct and Business Ethics', 'R'],
      ['hr-delegation', 'HR delegation of authority (approvals for hiring, pay and exits)', 'R'],
      ['hr-records', 'HR records, personnel files and document retention', 'M'],
      ['hr-acknowledgement', 'Policy acknowledgement and communication procedure', 'R'],
    ] },
    { id: 'B', code: 'HR', cat: 'HR Playbook', title: 'B. Talent acquisition', items: [
      ['hr-recruitment', 'Recruitment and selection', 'R'],
      ['hr-referral', 'Employee referral', 'R'],
      ['hr-bgv', 'Background verification, with DPDP-compliant consent', 'R'],
      ['hr-appointment-docs', 'Offer, appointment and employment documentation', 'M'],
      ['hr-internship', 'Internship and trainee', 'R'],
      ['hr-contract-staff', 'Contract staff, consultants and fixed-term employment', 'M'],
      ['hr-relatives-rehire', 'Hiring of relatives and rehiring former employees', 'R'],
      ['hr-campus', 'Campus hiring', 'R'],
    ] },
    { id: 'C', code: 'HR', cat: 'HR Playbook', title: 'C. Employment terms and onboarding', items: [
      ['hr-onboarding', 'Induction and onboarding', 'R'],
      ['hr-probation', 'Probation and confirmation', 'R'],
      ['hr-grades', 'Grades, designations and job families', 'R'],
      ['hr-working-hours', 'Working hours, shifts, attendance and punctuality', 'M'],
      ['hr-remote', 'Remote and hybrid work', 'R'],
      ['hr-transfer', 'Transfer, relocation and inter-office mobility', 'R'],
      ['hr-ijp', 'Internal job posting', 'R'],
      ['hr-secondment', 'Secondment between group entities', 'R'],
    ] },
    { id: 'D', code: 'HR', cat: 'HR Playbook', title: 'D. Compensation and benefits', items: [
      ['hr-comp-structure', 'Compensation structure and salary bands', 'R'],
      ['hr-payroll', 'Payroll and wage payment (Code on Wages timelines)', 'M'],
      ['hr-increments', 'Annual increments and appraisal-linked pay', 'R'],
      ['hr-sales-incentive', 'Sales incentive and variable pay (designed to avoid mis-selling)', 'I', ['sales', 'insurance', 'bfsi']],
      ['hr-bonus', 'Statutory bonus (Code on Wages)', 'M'],
      ['hr-pf-esi-gratuity', 'Provident Fund, ESI and gratuity (Code on Social Security)', 'M'],
      ['hr-insurance-benefits', 'Group mediclaim, personal accident and term life cover', 'R'],
      ['hr-fbp', 'Flexible benefits plan (FBP) and reimbursements under the new tax regime', 'R'],
      ['hr-salary-advance', 'Salary advance and employee loans', 'R'],
      ['hr-overtime', 'Overtime and compensatory pay', 'M'],
      ['hr-esop', 'Employee stock options (ESOPs)', 'R'],
    ] },
    { id: 'E', code: 'HR', cat: 'HR Playbook', title: 'E. Leave and holidays', items: [
      ['hr-leave', 'Leave policy: earned, casual and sick leave', 'M'],
      ['hr-holidays', 'Holiday calendar (national, festival and state holidays)', 'M'],
      ['hr-maternity', 'Maternity benefit', 'M'],
      ['hr-paternity', 'Paternity, adoption and surrogacy leave', 'R'],
      ['hr-special-leave', 'Bereavement, marriage and special leave', 'R'],
      ['hr-sabbatical', 'Sabbatical and leave without pay', 'R'],
      ['hr-wellness-days', 'Menstrual leave or wellness days', 'R'],
    ] },
    { id: 'F', code: 'HR', cat: 'HR Playbook', title: 'F. Performance, learning and growth', items: [
      ['hr-performance', 'Performance management and appraisal', 'R'],
      ['hr-pip', 'Performance improvement plan (PIP)', 'R'],
      ['hr-promotion', 'Promotion and career progression', 'R'],
      ['hr-rewards', 'Rewards and recognition', 'R'],
      ['hr-training', 'Learning and development, with training cost recovery', 'R'],
      ['ins-irdai-training', 'IRDAI certification, training and continuing education for qualified persons', 'I', INS],
      ['hr-succession', 'Succession planning, including key managerial and regulated roles', 'I', ['insurance', 'bfsi', 'sebi', 'rbi']],
      ['hr-higher-education', 'Higher education sponsorship', 'R'],
    ] },
    { id: 'G', code: 'HR', cat: 'HR Playbook', title: 'G. Workplace conduct and discipline', items: [
      ['hr-posh', 'Prevention of Sexual Harassment (POSH) policy', 'M'],
      ['hr-equal-opportunity', 'Equal opportunity policy (RPwD Act), diversity and inclusion', 'M'],
      ['hr-anti-discrimination', 'Anti-discrimination, anti-bullying and non-sexual harassment', 'R'],
      ['hr-disciplinary', 'Disciplinary action and domestic inquiry procedure', 'M'],
      ['hr-grievance-committee', 'Grievance redressal committee (Industrial Relations Code)', 'M'],
      ['hr-standing-orders', 'Standing orders and service rules', 'M'],
      ['hr-conflict-of-interest', 'Conflict of interest', 'R'],
      ['hr-gifts', 'Gifts, hospitality and anti-bribery', 'R'],
      ['hr-whistleblower', 'Whistleblower and vigil mechanism', 'R'],
      ['hr-moonlighting', 'Moonlighting and outside employment', 'R'],
      ['hr-non-solicitation', 'Non-solicitation and post-employment obligations', 'R'],
      ['hr-relationships', 'Workplace relationships', 'R'],
      ['hr-dress-code', 'Dress code', 'R'],
      ['hr-social-media', 'Social media and public statements', 'R'],
      ['hr-substance', 'Substance abuse', 'R'],
      ['hr-health-safety', 'Workplace health and safety, first aid and fire safety', 'M'],
      ['hr-women-night-work', "Women's safety, night work and transport", 'M'],
      ['hr-workplace-violence', 'Workplace violence and zero tolerance', 'R'],
      ['hr-human-rights', 'Human rights: no child or forced labour', 'R'],
    ] },
    { id: 'H', code: 'HR', cat: 'HR Playbook', title: 'H. IRDAI and insurance-specific conduct', items: [
      ['ins-broking-conduct', 'Code of conduct for broking staff: fair selling and client-first advice', 'I', INS],
      ['ins-rebating', 'Prohibition on rebating and commission sharing (Section 41, Insurance Act)', 'I', INS],
      ['ins-anti-fraud', 'Anti-fraud policy for employees (IRDAI fraud monitoring framework)', 'I', INS],
      ['ins-aml-kyc', 'AML/KYC duties of employees', 'I', ['insurance', 'bfsi']],
      ['ins-fit-proper', 'Fit and proper criteria for the Principal Officer and key persons', 'I', INS],
      ['ins-call-conduct', 'Client confidentiality and conduct on calls, including call recording', 'I', ['insurance', 'bfsi', 'sales']],
      ['ins-records', 'Employee record-keeping duties (IRDAI retention)', 'I', INS],
    ] },
    { id: 'I', code: 'HR', cat: 'HR Playbook', title: 'I. Information, IT and assets', items: [
      ['hr-confidentiality-ip', 'Confidentiality and intellectual property assignment', 'R'],
      ['hr-it-acceptable-use', 'IT acceptable use', 'R'],
      ['ins-infosec', 'Information security duties of employees (IRDAI Information and Cyber Security Guidelines)', 'I', INS],
      ['hr-byod', 'Bring your own device (BYOD) and mobile devices', 'R'],
      ['hr-messaging', 'Email, messaging and WhatsApp usage', 'R'],
      ['hr-monitoring', 'Employee monitoring', 'R'],
      ['hr-assets', 'Company assets: issue and return', 'R'],
      ['hr-ai-tools', 'Use of AI tools by employees', 'R'],
      ['hr-privacy-notice', 'Employee privacy notice (DPDP Act)', 'M'],
    ] },
    { id: 'J', code: 'HR', cat: 'HR Playbook', title: 'J. Travel and expenses', items: [
      ['hr-travel', 'Travel policy, domestic and international', 'R'],
      ['hr-expenses', 'Expense reimbursement', 'R'],
      ['hr-entertainment', 'Client entertainment', 'R'],
      ['hr-mobile-internet', 'Mobile and internet reimbursement', 'R'],
    ] },
    { id: 'K', code: 'HR', cat: 'HR Playbook', title: 'K. Wellbeing and engagement', items: [
      ['hr-wellness', 'Employee wellness and assistance programme (EAP), including mental health', 'R'],
      ['hr-flexible-working', 'Flexible working', 'R'],
      ['hr-creche', 'Crèche and childcare (50 or more employees)', 'M'],
      ['hr-engagement', 'Employee engagement and events', 'R'],
      ['hr-open-door', 'Open door policy and employee feedback', 'R'],
    ] },
    { id: 'L', code: 'HR', cat: 'HR Playbook', title: 'L. Separation', items: [
      ['hr-resignation', 'Resignation and notice period', 'R'],
      ['hr-termination', 'Termination and retrenchment (Industrial Relations Code)', 'M'],
      ['hr-absconding', 'Absconding and job abandonment', 'R'],
      ['hr-exit', 'Exit interview and clearance', 'R'],
      ['hr-fnf', 'Full and final settlement', 'M'],
      ['hr-relieving', 'Relieving and experience letters, with timelines', 'R'],
      ['hr-garden-leave', 'Garden leave', 'R'],
      ['hr-retirement', 'Retirement and superannuation', 'R'],
    ] },
    { id: 'M', code: 'HR', cat: 'HR Playbook', title: 'M. Statutory compliance and administration', items: [
      ['hr-statutory-registers', 'Registrations, registers and returns under labour laws', 'M'],
      ['hr-contract-labour', 'Outsourced and contract labour management', 'M'],
      ['hr-audit-calendar', 'HR audit and compliance calendar', 'R'],
    ] },
    { id: 'N', code: 'HR', cat: 'HR Playbook', title: 'N. Business continuity', items: [
      ['hr-bcp', 'Emergency, pandemic and business continuity procedures for staff', 'R'],
    ] },
    { id: 'O', code: 'HR', cat: 'HR Playbook', title: 'O. Letters and forms', items: [
      ['tpl-confirmation', 'Confirmation, increment and promotion letters', 'R', null, 'template', 0],
      ['tpl-warning', 'Warning letters and show cause notice', 'R', null, 'template', 0],
      ['tpl-chargesheet', 'Charge sheet and inquiry report formats', 'R', null, 'template', 0],
      ['tpl-relieving', 'Relieving and experience letters', 'R', null, 'template', 0],
      ['tpl-fnf-exit', 'Full and final settlement statement and exit checklist', 'R', null, 'template', 0],
      ['tpl-acknowledgement', 'Policy acknowledgement form', 'R', null, 'template', 0],
      ['tpl-offer-letter', 'Offer letter', 'R', null, 'template', 0],
      ['tpl-pip-letter', 'PIP letter and review record', 'R', null, 'template', 0],
      ['tpl-posh-complaint', 'POSH complaint form and IC annual report format', 'M', null, 'template', 0],
      ['tpl-bgv-consent', 'Background verification consent and notice', 'R', null, 'template', 0],
    ] },

    // ---------------- DATA PROTECTION AND IT ----------------
    { id: 'DP', code: 'DP', cat: 'Data protection and IT', title: 'Data protection and privacy (DPDP Act)', items: [
      ['dp-privacy-policy', 'Data Protection and Privacy Policy (DPDP Act 2023 and Rules 2025)', 'M'],
      ['dp-website-notice', 'Website and app privacy notice', 'M'],
      ['dp-consent', 'Consent management and notice procedure', 'M'],
      ['dp-retention', 'Data retention and erasure schedule', 'M'],
      ['dp-breach', 'Personal data breach and cyber incident response plan', 'M'],
      ['dp-rights', 'Data principal rights and grievance redressal procedure', 'M'],
      ['dp-children', "Children's data and verifiable parental consent", 'M', ['children', 'education', 'edtech', 'consumer', 'gaming']],
      ['dp-processor', 'Data processor and vendor management', 'M'],
      ['dp-cookies', 'Cookie policy', 'R', ['it', 'consumer', 'data']],
      ['dp-cross-border', 'Cross-border data transfer', 'R', ['it', 'data', 'export']],
      ['dp-dpia', 'Data protection impact assessment (significant data fiduciary)', 'R', ['data', 'bfsi', 'healthcare']],
    ] },
    { id: 'IT', code: 'IT', cat: 'Data protection and IT', title: 'Information security and technology', items: [
      ['it-infosec', 'Information security policy', 'R'],
      ['it-access', 'Access control and password policy', 'R'],
      ['it-logs', 'Log management and CERT-In compliance (180-day logs, 6-hour reporting)', 'M', ['it', 'data', 'bfsi', 'telecom']],
      ['it-backup', 'Backup and disaster recovery', 'R'],
      ['it-change', 'Change management', 'R', ['it']],
      ['it-sdlc', 'Secure software development', 'R', ['it']],
      ['it-open-source', 'Open source software use', 'R', ['it']],
      ['it-cloud', 'Cloud usage', 'R', ['it', 'data']],
      ['it-vendor-risk', 'Third-party and vendor IT risk', 'R'],
      ['it-ai-governance', 'AI governance and responsible AI', 'R', ['ai', 'it', 'rnd']],
      ['it-asset-mgmt', 'IT asset management and disposal (e-waste)', 'R'],
      ['it-email-retention', 'Email and records archiving', 'R'],
    ] },

    // ---------------- CORPORATE GOVERNANCE ----------------
    { id: 'CG', code: 'CG', cat: 'Corporate governance and compliance', title: 'Corporate governance and compliance', items: [
      ['cg-anti-bribery', 'Anti-bribery and anti-corruption (Prevention of Corruption Act, Section 9)', 'R'],
      ['cg-whistleblower', 'Vigil mechanism (Companies Act, Section 177)', 'M'],
      ['cg-rpt', 'Related party transactions', 'M'],
      ['cg-csr', 'Corporate social responsibility (Companies Act, Section 135)', 'M'],
      ['cg-insider-trading', 'Prevention of insider trading (SEBI PIT Regulations)', 'M', ['sebi']],
      ['cg-doc-preservation', 'Preservation and archival of documents', 'R'],
      ['cg-risk', 'Risk management', 'R'],
      ['cg-dfa', 'Delegation of financial authority', 'R'],
      ['cg-procurement', 'Procurement and vendor selection', 'R'],
      ['cg-vendor-dd', 'Third-party due diligence', 'R'],
      ['cg-board-meetings', 'Board and general meeting procedures', 'R'],
      ['cg-nomination-rem', 'Nomination and remuneration', 'R'],
      ['cg-brand', 'Trademark, brand and logo usage', 'R'],
      ['cg-media', 'Media and external communication', 'R'],
      ['cg-legal-hold', 'Litigation hold and legal notices handling', 'R'],
      ['cg-esg', 'ESG and sustainability', 'R'],
      ['cg-customer-grievance', 'Customer grievance redressal', 'R', ['consumer', 'bfsi', 'insurance', 'retail']],
      ['cg-fema', 'Foreign exchange (FEMA) and overseas transactions', 'R', ['export', 'bfsi']],
      ['cg-tax', 'Tax governance (GST, TDS, transfer pricing)', 'R'],
    ] },

    // ---------------- INDUSTRY-SPECIFIC ----------------
    { id: 'IN-INS', code: 'IN', cat: 'Industry-specific', title: 'Insurance business', items: [
      ['ins-infosec-board', 'Board-approved information and cyber security policy (IRDAI)', 'I', INS],
      ['ins-outsourcing', 'Outsourcing of activities (IRDAI)', 'I', INS],
      ['ins-grievance', 'Policyholder grievance redressal (Bima Bharosa)', 'I', INS],
      ['ins-claims-assist', 'Claims assistance and servicing', 'I', INS],
      ['ins-advertisement', 'Advertisement and disclosure (IRDAI)', 'I', INS],
      ['ins-conflict', 'Conflict of interest in placement of business', 'I', INS],
      ['ins-remuneration', 'Remuneration and rewards from insurers (IRDAI)', 'I', INS],
    ] },
    { id: 'IN-SPACE', code: 'SP', cat: 'Industry-specific', title: 'Space, defence and export control', items: [
      ['space-export-control', 'Export control and SCOMET compliance', 'I', ['export', 'space', 'rnd']],
      ['space-inspace', 'IN-SPACe authorisation and space activity compliance', 'I', ['space']],
      ['space-classified', 'Handling of classified, restricted and government-furnished information', 'I', ['space', 'govt']],
      ['space-tcp', 'Technology control plan, visitor and foreign-national access', 'I', ['space', 'export', 'rnd']],
      ['space-insider-risk', 'Insider risk and personnel security', 'I', ['space', 'govt']],
      ['space-mission-assurance', 'Quality and mission assurance', 'I', ['space']],
      ['space-launch-safety', 'Range, launch and propellant safety', 'I', ['space', 'hazmat']],
      ['space-debris', 'Space debris mitigation and responsible operations', 'I', ['space']],
      ['space-spectrum', 'Spectrum and frequency coordination compliance', 'I', ['space', 'telecom']],
      ['space-geospatial', 'Geospatial data handling (Geospatial Guidelines 2021)', 'I', ['space', 'data']],
      ['space-govt-contracts', 'Government and ISRO contract compliance', 'I', ['space', 'govt']],
    ] },
    { id: 'IN-RND', code: 'RD', cat: 'Industry-specific', title: 'Research and development', items: [
      ['rnd-ip-invention', 'Invention disclosure, IP ownership and patent incentive', 'I', ['rnd']],
      ['rnd-integrity', 'Research integrity and misconduct', 'I', ['rnd', 'academic']],
      ['rnd-publication', 'Publication and pre-publication clearance', 'I', ['rnd']],
      ['rnd-data', 'Research data management and lab notebooks', 'I', ['rnd']],
      ['rnd-lab-safety', 'Laboratory, cleanroom and hazardous materials safety', 'I', ['rnd', 'hazmat']],
      ['rnd-biosafety', 'Biosafety and Institutional Biosafety Committee (IBSC)', 'I', ['biosafety']],
      ['rnd-ethics', 'Human participants research and ethics committee', 'I', ['clinical']],
      ['rnd-animal', 'Animal research ethics (CCSEA)', 'I', ['biosafety', 'clinical']],
      ['rnd-grants', 'Grant and funded-project compliance', 'I', ['rnd']],
      ['rnd-collaboration', 'Collaboration with academic and government institutions', 'I', ['rnd']],
      ['rnd-trade-secrets', 'Trade secret protection', 'I', ['rnd', 'it', 'manufacturing']],
      ['rnd-tax-incentives', 'R&D expenditure, DSIR recognition and tax incentive records', 'R', ['rnd']],
    ] },
    { id: 'IN-BFSI', code: 'FS', cat: 'Industry-specific', title: 'Banking, NBFC and securities', items: [
      ['bfsi-kyc-aml', 'KYC, AML and CFT (PMLA)', 'I', ['bfsi']],
      ['bfsi-fair-practices', 'Fair practices code', 'I', ['rbi']],
      ['bfsi-recovery', 'Recovery agents and collection conduct', 'I', ['collections', 'rbi']],
      ['bfsi-outsourcing', 'Outsourcing of financial services', 'I', ['rbi']],
      ['bfsi-digital-lending', 'Digital lending (RBI Directions)', 'I', ['rbi']],
      ['bfsi-suitability', 'Suitability and investor protection', 'I', ['sebi']],
      ['bfsi-trading-staff', 'Personal trading by employees', 'I', ['sebi']],
    ] },
    { id: 'IN-TECH', code: 'TE', cat: 'Industry-specific', title: 'Technology, media and platforms', items: [
      ['tech-intermediary', 'Intermediary due diligence and grievance officer (IT Rules 2021)', 'I', ['it', 'media']],
      ['tech-terms', 'Platform terms of use and content moderation', 'I', ['it', 'media', 'consumer']],
      ['tech-sla', 'Service levels and customer support', 'R', ['it']],
      ['tech-client-data', 'Client data handling and confidentiality for service delivery', 'I', ['it']],
      ['tech-gig', 'Platform and gig worker engagement (Code on Social Security)', 'I', ['gig']],
    ] },
    { id: 'IN-HEALTH', code: 'HC', cat: 'Industry-specific', title: 'Healthcare and pharma', items: [
      ['hc-patient-confidentiality', 'Patient confidentiality and medical records', 'I', ['healthcare']],
      ['hc-bmw', 'Bio-medical waste management', 'I', ['healthcare', 'hazmat']],
      ['hc-consent', 'Informed consent', 'I', ['healthcare', 'clinical']],
      ['hc-pharmacovigilance', 'Pharmacovigilance', 'I', ['pharma']],
      ['hc-ucpmp', 'Pharmaceutical marketing practices (UCPMP 2024)', 'I', ['pharma']],
      ['hc-gmp', 'Good manufacturing practices (Schedule M)', 'I', ['pharma']],
    ] },
    { id: 'IN-EDU', code: 'ED', cat: 'Industry-specific', title: 'Education and child safety', items: [
      ['edu-child-protection', 'Child protection and safeguarding (POCSO)', 'I', ['children', 'education']],
      ['edu-student-data', 'Student data protection', 'I', ['education']],
      ['edu-anti-ragging', 'Anti-ragging', 'I', ['academic', 'education']],
      ['edu-fee-refund', 'Fee, refund and admissions', 'I', ['education', 'consumer']],
      ['edu-counsellor-conduct', 'Counsellor and adviser conduct', 'I', ['education']],
    ] },
    { id: 'IN-MFG', code: 'MF', cat: 'Industry-specific', title: 'Manufacturing, EHS and construction', items: [
      ['mfg-ehs', 'Environment, health and safety (EHS)', 'I', ['manufacturing', 'hazmat', 'construction']],
      ['mfg-hazardous', 'Hazardous substances and process safety', 'I', ['hazmat']],
      ['mfg-ppe', 'Personal protective equipment', 'I', ['manufacturing', 'construction', 'hazmat']],
      ['mfg-quality', 'Quality management and product recall', 'I', ['manufacturing']],
      ['mfg-waste', 'Waste, e-waste and EPR compliance', 'I', ['manufacturing', 'hazmat']],
      ['mfg-bocw', 'Building and other construction workers welfare', 'I', ['construction']],
      ['mfg-site-safety', 'Construction site safety', 'I', ['construction']],
    ] },
    { id: 'IN-CONS', code: 'CS', cat: 'Industry-specific', title: 'Consumer, retail, food and hospitality', items: [
      ['cons-ecommerce', 'E-commerce compliance (Consumer Protection (E-Commerce) Rules 2020)', 'I', ['consumer', 'retail']],
      ['cons-refund', 'Returns, refunds and cancellations', 'I', ['consumer', 'retail']],
      ['cons-dark-patterns', 'Dark patterns and fair advertising', 'I', ['consumer']],
      ['cons-legal-metrology', 'Legal metrology and packaged commodities', 'I', ['retail', 'manufacturing']],
      ['cons-food-safety', 'Food safety and hygiene (FSSAI)', 'I', ['food']],
      ['cons-guest-safety', 'Guest safety and security', 'I', ['hospitality']],
      ['cons-transport-safety', 'Driver conduct and road safety', 'I', ['transport', 'logistics']],
      ['cons-security-agency', 'Private security guard conduct (PSARA)', 'I', ['security']],
    ] },
    { id: 'IN-NGO', code: 'NG', cat: 'Industry-specific', title: 'Non-profit and associations', items: [
      ['ngo-fcra', 'FCRA compliance', 'I', ['nonprofit']],
      ['ngo-donations', 'Donation acceptance and utilisation', 'I', ['nonprofit']],
      ['ngo-volunteers', 'Volunteer engagement', 'I', ['nonprofit']],
      ['ngo-financial-controls', 'Financial controls and audit', 'I', ['nonprofit']],
    ] },

    // ---------------- AGREEMENTS ----------------
    { id: 'AG-EMP', code: 'AG', cat: 'Agreements', title: 'Employment agreements', items: [
      ['agr-employment', 'Employment agreement', 'R', null, 'agreement', 0],
      ['agr-employee-nda', 'Employee confidentiality and NDA', 'R', null, 'agreement', 0],
      ['agr-ip-assignment', 'Intellectual property assignment deed', 'R', null, 'agreement', 0],
      ['agr-consultant', 'Consultant / retainer agreement', 'R', null, 'agreement', 12],
      ['agr-internship', 'Internship agreement', 'R', null, 'agreement', 0],
      ['agr-fixed-term', 'Fixed-term employment contract', 'R', null, 'agreement', 0],
      ['agr-separation', 'Separation agreement and release', 'R', null, 'agreement', 0],
      ['agr-secondment', 'Secondment agreement', 'R', null, 'agreement', 12],
      ['agr-training-bond', 'Training cost recovery undertaking', 'R', null, 'agreement', 0],
    ] },
    { id: 'AG-COM', code: 'AG', cat: 'Agreements', title: 'Commercial agreements', items: [
      ['agr-mutual-nda', 'Mutual non-disclosure agreement', 'R', null, 'agreement', 24],
      ['agr-oneway-nda', 'One-way non-disclosure agreement', 'R', null, 'agreement', 24],
      ['agr-msa', 'Master services agreement', 'R', null, 'agreement', 12],
      ['agr-sow', 'Statement of work', 'R', null, 'agreement', 12],
      ['agr-dpa', 'Data processing agreement (DPDP Act)', 'M', null, 'agreement', 12],
      ['agr-vendor', 'Vendor / supply agreement', 'R', null, 'agreement', 12],
      ['agr-saas', 'SaaS subscription agreement', 'R', ['it'], 'agreement', 12],
      ['agr-software-licence', 'Software licence agreement', 'R', ['it'], 'agreement', 12],
      ['agr-sla', 'Service level agreement', 'R', null, 'agreement', 12],
      ['agr-distribution', 'Distribution / channel partner agreement', 'R', null, 'agreement', 12],
      ['agr-referral', 'Referral and revenue-share agreement', 'R', null, 'agreement', 12],
      ['agr-reseller', 'Reseller agreement', 'R', null, 'agreement', 12],
      ['agr-agency', 'Agency agreement', 'R', null, 'agreement', 12],
      ['agr-franchise', 'Franchise agreement', 'R', ['retail', 'consumer'], 'agreement', 12],
      ['agr-consultancy-client', 'Consultancy engagement letter (client-facing)', 'R', null, 'agreement', 12],
      ['agr-leave-licence', 'Leave and licence / lease agreement', 'R', null, 'agreement', 11],
      ['agr-coworking', 'Co-working membership agreement', 'R', null, 'agreement', 12],
      ['agr-event', 'Event and sponsorship agreement', 'R', null, 'agreement', 12],
      ['agr-website-terms', 'Website terms of use', 'R', null, 'agreement', 12],
      ['agr-po-terms', 'Purchase order terms and conditions', 'R', null, 'agreement', 12],
      ['agr-mou', 'Memorandum of understanding', 'R', null, 'agreement', 12],
    ] },
    { id: 'AG-CORP', code: 'AG', cat: 'Agreements', title: 'Corporate and investment agreements', items: [
      ['agr-cofounder', 'Co-founder agreement', 'R', null, 'agreement', 0],
      ['agr-sha', "Shareholders' agreement", 'R', null, 'agreement', 0],
      ['agr-ssa', 'Share subscription agreement', 'R', null, 'agreement', 0],
      ['agr-term-sheet', 'Term sheet', 'R', null, 'agreement', 3],
      ['agr-esop-plan', 'ESOP plan and grant letter', 'R', null, 'agreement', 0],
      ['agr-jv', 'Joint venture agreement', 'R', null, 'agreement', 0],
      ['agr-loan', 'Loan agreement', 'R', null, 'agreement', 12],
      ['agr-director-appointment', 'Independent director appointment letter', 'R', null, 'agreement', 12],
    ] },
    { id: 'AG-RND', code: 'AG', cat: 'Agreements', title: 'Research, technology and space agreements', items: [
      ['agr-research-collab', 'Collaborative research agreement', 'I', ['rnd'], 'agreement', 12],
      ['agr-sponsored-research', 'Sponsored research agreement', 'I', ['rnd'], 'agreement', 12],
      ['agr-mta', 'Material transfer agreement', 'I', ['rnd', 'biosafety'], 'agreement', 12],
      ['agr-tech-licence', 'Technology transfer and licence agreement', 'I', ['rnd', 'space'], 'agreement', 12],
      ['agr-teaming', 'Teaming agreement for government programmes', 'I', ['space', 'govt'], 'agreement', 12],
      ['agr-payload', 'Payload hosting / launch services agreement', 'I', ['space'], 'agreement', 12],
      ['agr-eo-data-licence', 'Satellite and earth-observation data licence', 'I', ['space'], 'agreement', 12],
      ['agr-end-user', 'End-user and end-use undertaking (export control)', 'I', ['export'], 'agreement', 12],
      ['agr-clinical-trial', 'Clinical trial agreement', 'I', ['clinical'], 'agreement', 12],
    ] },
    { id: 'AG-IND', code: 'AG', cat: 'Agreements', title: 'Industry agreements', items: [
      ['agr-ins-tob', 'Insurance broker terms of business with client', 'I', INS, 'agreement', 12],
      ['agr-ins-insurer', 'Broker–insurer agreement', 'I', INS, 'agreement', 12],
      ['agr-collection-agency', 'Collection agency agreement', 'I', ['collections'], 'agreement', 12],
      ['agr-student-services', 'Student services agreement', 'I', ['education'], 'agreement', 12],
      ['agr-patient-consent', 'Patient consent and service agreement', 'I', ['healthcare'], 'agreement', 12],
    ] },
  ];

  const ITEMS = [];
  SECTIONS.forEach((sec) => {
    sec.items = sec.items.map(([id, title, tag, ind, kind, validity]) => {
      const it = {
        id, title, tag, section: sec.id, sectionTitle: sec.title, cat: sec.cat, code: sec.code,
        industries: ind || null, kind: kind || 'policy',
        validityMonths: validity === undefined ? 12 : validity,
      };
      ITEMS.push(it);
      return it;
    });
  });

  S.CATEGORIES = [...new Set(SECTIONS.map((s) => s.cat))];
  S.SECTIONS = SECTIONS;
  S.ITEMS = ITEMS;
  S.itemById = (id) => ITEMS.find((i) => i.id === id) || null;

  // Is an item relevant to an industry (by tag overlap)?
  S.isRelevant = (item, industry) => {
    if (!item.industries) return true;
    if (!industry) return false;
    return item.industries.some((t) => industry.tags.includes(t) || industry.id === t);
  };
  S.TAGS = {
    M: { label: 'Mandatory', long: 'Required by law (some subject to headcount or state thresholds)' },
    I: { label: 'Industry', long: 'Industry or regulator-driven' },
    R: { label: 'Recommended', long: 'Recommended good practice' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
