/* Drafted template — Carbon Footprint and Climate Policy. */
(function (root) {
  const S = root.SAFE;

  S.tpl('cg-carbon', {
    v: '1.0',
    fields: [
      { k: 'sustainabilityLead', l: 'Sustainability / ESG lead (name and designation)' },
      { k: 'baseYear', l: 'Base year for measuring emissions', d: 'FY 2025-26' },
      { k: 'reductionTarget', l: 'Emission reduction target', t: 'textarea', d: 'reduce Scope 1 and Scope 2 emissions per employee by 30% by FY 2030-31 against the base year' },
      { k: 'netZeroYear', l: 'Net-zero target year (operational emissions)', d: '2040' },
      { k: 'renewableTarget', l: 'Renewable electricity target', d: '50% of electricity from renewable sources by FY 2030-31' },
      { k: 'scope3', l: 'Measure Scope 3 (value chain) emissions?', t: 'select', o: ['yes', 'no'], d: 'yes' },
      { k: 'scope3Categories', l: 'Scope 3 categories to measure first', t: 'textarea', d: 'business travel, employee commuting, purchased goods and services, waste, and upstream transportation' },
      { k: 'flightPolicy', l: 'Travel rule to reduce emissions', t: 'textarea', d: 'video calls are preferred to travel; economy class for flights under 4 hours; rail where the journey is under 6 hours and practical' },
      { k: 'offsetsApproach', l: 'Use of carbon credits / offsets', t: 'select', o: ['only for residual emissions after reductions, using credible certified credits', 'not used for now'], d: 'only for residual emissions after reductions, using credible certified credits' },
      { k: 'brsr', l: 'Is the company required to file a BRSR (listed / top 1,000 by market capitalisation)?', t: 'select', o: ['no', 'yes'], d: 'no' },
      { k: 'reportingFrequency', l: 'Internal reporting of carbon footprint', d: 'every quarter to management and once a year to the Board' },
    ],
    body: `
## Purpose
1.1 {{company.name}} (the "**Company**") recognises that climate change is a material risk to its business, its people and the communities it serves. This policy sets out how the Company measures, reduces and reports its greenhouse gas ("**GHG**") emissions, and how it embeds climate considerations into its decisions.
1.2 The policy supports India's commitment to net-zero emissions by 2070 and the Mission LiFE (Lifestyle for Environment) approach, and is designed to meet the expectations of clients, investors and regulators.

## Scope
2.1 This policy applies to all operations of the Company at all its locations ({{company.offices|list}}), to all employees, and, as described in section 8, to suppliers and business partners.
2.2 It covers all seven GHGs under the Kyoto Protocol, expressed in tonnes of carbon dioxide equivalent ("**tCO2e**").

## Commitments
The Company commits to:
- measure its carbon footprint every year using the GHG Protocol Corporate Standard;
- set and pursue time-bound reduction targets, with the base year of {{baseYear}};
- reduce emissions first, and use carbon credits only as set out in section 7;
- integrate climate risk into business planning, procurement and investment decisions;
- report its progress honestly and avoid any claim that overstates its environmental performance; and
- engage employees, suppliers and clients in reducing emissions.

## Measuring the carbon footprint
4.1 Emissions are measured under the GHG Protocol in three scopes:
| Scope | What it covers | Examples for the Company |
| Scope 1 | Direct emissions from sources the Company owns or controls | Diesel generators, company-owned vehicles, refrigerant leaks from air-conditioning |
| Scope 2 | Indirect emissions from purchased electricity, heat or cooling | Electricity used in offices[[if tag=it]], data centres and servers[[endif]][[if tag=manufacturing]], plants and machinery[[endif]] |
| Scope 3 | All other indirect emissions in the value chain | Business travel, employee commuting, purchased goods and services, waste, logistics |
4.2 Scope 1 and Scope 2 emissions are measured every year. [[if scope3=yes]]Scope 3 emissions are measured starting with: {{scope3Categories}}; further categories are added as data improves.[[else]]Scope 3 emissions will be assessed once Scope 1 and 2 measurement is established.[[endif]]
4.3 Emission factors are taken from recognised sources, such as the Central Electricity Authority's CO2 baseline database for Indian grid electricity and the IPCC or DEFRA factors for fuels and travel. The method, data sources and assumptions are documented so that the results can be checked.
4.4 Data is collected from electricity bills, fuel records, travel bookings, procurement records and waste records, and is kept for at least eight years.

## Targets
5.1 The Company's targets are:
- **Reduction:** {{reductionTarget}};
- **Renewable electricity:** {{renewableTarget}}; and
- **Net zero:** net-zero operational (Scope 1 and 2) emissions by {{netZeroYear}}.
5.2 Targets are reviewed every year and tightened as the Company's measurement improves. The Company will consider aligning its targets with the Science Based Targets initiative.

## Reduction measures
6.1 **Energy:** energy-efficient lighting, equipment and air-conditioning (BEE star-rated where available); switching off equipment and lights outside working hours; energy audits of larger offices; and preferring buildings with green building certification when leasing new premises.
6.2 **Renewable energy:** buying renewable electricity through green tariffs, open access, rooftop solar or renewable energy certificates, where available in the state.
6.3 **Travel:** {{flightPolicy}}.
6.4 **Commuting and fleet:** encouraging public transport, car-pooling and remote work where suitable, and choosing electric or low-emission vehicles when the Company buys or leases vehicles.
6.5 **IT:** extending the life of devices, buying energy-efficient equipment, using cloud providers with renewable energy commitments, and disposing of e-waste only through authorised recyclers under the E-Waste (Management) Rules, 2022.
6.6 **Waste and resources:** reducing single-use plastics in line with the Plastic Waste Management Rules, 2016, segregating waste at source, recycling, and reducing paper through digital processes.
6.7 **Refrigerants:** maintaining air-conditioning to prevent leaks and choosing low global-warming-potential refrigerants when replacing equipment.

## Carbon credits and offsets
7.1 Carbon credits are used {{offsetsApproach}}.
7.2 Where used, credits must be from credible, independently verified programmes, such as the Indian Carbon Market under the Carbon Credit Trading Scheme, 2023, or recognised international standards. They are retired in the Company's name and disclosed separately from emission reductions.
7.3 The Company will not describe itself as "carbon neutral" or "net zero" unless the claim is supported by measured data and disclosed methods.

## Suppliers and partners
8.1 Sustainability is considered when selecting suppliers, alongside price and quality. Key suppliers are asked to share their emissions data and reduction plans.
8.2 Supplier contracts may include requirements on energy efficiency, packaging, waste and reporting of environmental data.

## Employees
9.1 Employees receive awareness training on climate change and on what they can do at work.
9.2 Employees are encouraged to suggest ideas for reducing emissions. Good ideas may be recognised under the Rewards and Recognition policy.

## Reporting and disclosure
10.1 The carbon footprint and progress against targets are reported {{reportingFrequency}}.
[[if brsr=yes]]
10.2 The Company discloses its energy use, Scope 1, 2 and (where required) Scope 3 emissions and related information in its Business Responsibility and Sustainability Report under the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, including the BRSR Core indicators and any assurance required.
[[else]]
10.2 The Company is not currently required to file a Business Responsibility and Sustainability Report. It may publish a voluntary sustainability statement, and will provide emissions data to clients who report on their value chain.
[[endif]]
10.3 Any public environmental claim made by the Company must be accurate, specific and supported by evidence, so that it is not misleading under the Consumer Protection Act, 2019 and the Guidelines for Prevention and Regulation of Greenwashing or Misleading Environmental Claims, 2024.

## Climate risk
The Company identifies physical climate risks (such as flooding, heat and water stress affecting its offices and people) and transition risks (such as regulatory changes, carbon pricing and client expectations), and includes them in its risk management process.

## Responsibility
12.1 {{sustainabilityLead}} is responsible for implementing this policy, maintaining the emissions inventory and reporting progress.
12.2 The Board oversees this policy and reviews progress at least once a year.
`,
  });
})(typeof window !== 'undefined' ? window : globalThis);
