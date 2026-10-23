/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Opportunity, MarketEvidenceItem, GovernmentScheme } from '../../src/types/index.js';

export const WARANGAL_MANDALS = [
  'Hanamkonda',
  'Warangal (Urban)',
  'Kazipet',
  'Parkal',
  'Narsampet',
  'Wardhannapet',
  'Geesugonda',
  'Sangem',
  'Duggondi',
  'Chennaraopet',
  'Khanapur',
  'Nekkonda',
  'Rayaparthy',
  'Atmakur',
  'Shayampet'
];

export const WARANGAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-chilli-processing',
    slug: 'chilli-turmeric-micro-processing',
    titleEn: 'Chilli & Turmeric Mini-Processing & Packaging Unit',
    titleTe: 'మిర్చి & పసుపు చిన్న తరహా ప్రాసెసింగ్ మరియు ప్యాకింగ్ యూనిట్',
    category: 'food_processing',
    sectorEn: 'Food & Spice Processing (ODOP Warangal)',
    sectorTe: 'ఆహార & మసాలా ప్రాసెసింగ్ (ODOP వరంగల్)',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Vibrant whole red dry chillies being processed into spice powder',
    imageAttribution: 'Unsplash / Pranjall Kumar (Royalty-free)',
    summaryEn: 'Process dried red chillies and turmeric purchased from Enumamula Market or local farmers into hygienic, unadulterated ground spice packets for mandal kirana shops, catering services, and town households.',
    summaryTe: 'ఎనుమాముల వ్యవసాయ మార్కెట్ లేదా స్థానిక రైతుల నుంచి ఎండు మిర్చి, పసుపు కొనుగోలు చేసి శుభ్రమైన ప్యాకెట్లలో ప్యాకింగ్ చేసి స్థానిక కిరాణా దుకాణాలు, క్యాటరింగ్ వ్యాపారులకు విక్రయించే సూక్ష్మ పరిశ్రమ.',
    minCapitalINR: 140000,
    maxCapitalINR: 320000,
    suggestedWorkingCapitalINR: 60000,
    equipmentChecklist: [
      { item: 'Commercial Hammer Mill / Pulverizer (3 HP - 5 HP)', estimatedCostINR: 65000, necessity: 'essential' },
      { item: 'Vibratory Flour/Spice Sieve Cleaner', estimatedCostINR: 22000, necessity: 'essential' },
      { item: 'Continuous Nitrogen/Band Heat Sealer for Pouches', estimatedCostINR: 18000, necessity: 'essential' },
      { item: 'Digital Precision Tabletop Weighing Scale (Govt stamped)', estimatedCostINR: 7500, necessity: 'essential' },
      { item: 'Digital Grain/Spice Moisture Meter', estimatedCostINR: 8500, necessity: 'recommended' },
      { item: 'Stainless Steel Storage Drums (200L x 4)', estimatedCostINR: 14000, necessity: 'recommended' }
    ],
    targetCustomersEn: [
      'Mandal center kirana shops & weekly village shandies (santalu)',
      'Marriage & event caterers in Warangal-Hanamkonda urban belt',
      'Hostels, dhabas, and canteens along NH-163 (Warangal-Bhopalpatnam Highway)',
      'Direct-to-consumer rural households seeking stone-ground, color-free chilli powder'
    ],
    targetCustomersTe: [
      'మండల కేంద్రాల్లోని కిరాణా దుకాణాలు & వారపు సంతలు',
      'వరంగల్-హనుమకొండ పరిసరాల్లోని క్యాటరింగ్ సర్వీసులు',
      'NH-163 జాతీయ రహదారి వెంబడి ఉన్న ధాబాలు, హాస్టళ్లు, క్యాంటీన్లు',
      'కల్తీ లేని స్వచ్ఛమైన కారం పొడిని కోరుకునే స్థానిక గృహిణులు'
    ],
    localWarangalAdvantageEn: 'Warangal is officially designated for Red Chilli under the Central Government’s One District One Product (PMFME) scheme. Enumamula Market Yard in Warangal is one of Asia’s largest chilli trading hubs, guaranteeing continuous access to raw material without middleman transport markups.',
    localWarangalAdvantageTe: 'కేంద్ర ప్రభుత్వ PMFME పథకం కింద వరంగల్ జిల్లాకు ఎండుమిర్చి అధికారిక ODOP పంటగా గుర్తించబడింది. ఆసియాలోనే ప్రసిద్ధ ఎనుమాముల మార్కెట్ యార్డ్ సమీపంలో ఉండటం వల్ల ముడి సరుకు నేరుగా సరసమైన ధరకే లభిస్తుంది.',
    keyRisksEn: [
      'Moisture and aflatoxin risk if chillies are packed before proper solar dehydration (< 10% moisture)',
      'Seasonal price volatility during peak arrivals (Feb-April) versus lean monsoon periods',
      'Irritant dust inhalation requiring protective masks, goggles, and dedicated exhaust ventilation'
    ],
    keyRisksTe: [
      'తేమ శాతం సరిగ్గా లేకపోతే బూజు పట్టే ప్రమాదం (10% లోపు తేమ ఉండాలి)',
      'ఫిబ్రవరి-ఏప్రిల్ సీజన్ ధరల హెచ్చుతగ్గులు',
      'మిర్చి పొడి వల్ల వచ్చే ఘాటుకు మాస్కులు, ఎగ్జాస్ట్ ఫ్యాన్లు ఏర్పాటు చేసుకోవాలి'
    ],
    questionsToInvestigateEn: [
      'What is the current prevailing milling rate per kg at existing flour/spice mills in your mandal?',
      'Does your chosen workshop shed have a stable commercial 3-phase power connection?',
      'Are local grocery store owners willing to buy in 250g/500g branded transparent pouches on cash-on-delivery?'
    ],
    questionsToInvestigateTe: [
      'మీ మండలంలో ప్రస్తుతం కేజీ మిర్చి మర ఆడించడానికి ఎంత రుసుము వసూలు చేస్తున్నారు?',
      'మీ షెడ్డులో 3-ఫేజ్ కరెంట్ కనెక్షన్ ఉందా?',
      'స్థానిక దుకాణదారులు 250గ్రా/500గ్రా ప్యాకెట్లను కొనుగోలు చేయడానికి ఆసక్తిగా ఉన్నారా?'
    ],
    requiredSkills: ['Food handling basics', 'Machine operation', 'Basic bookkeeping', 'Local retail sales'],
    regulatoryRequirements: [
      'FSSAI Basic Registration (Registration fee ₹100/yr for < ₹12 Lakh turnover)',
      'Udyam MSME Registration (Free online at udyamregistration.gov.in)',
      'Gram Panchayat / Municipality Trade NOC',
      'Legal Metrology (Weights & Measures) Verification'
    ],
    applicableSchemes: ['PMFME (35% capital subsidy for ODOP)', 'PMEGP (up to 35% rural subsidy)', 'Mudra Shishu / Kishore'],
    sources: [
      {
        name: 'Ministry of Food Processing Industries (MoFPI) - ODOP Warangal Mapping',
        url: 'https://pmfme.mofpi.gov.in',
        coverage: 'Warangal District, Telangana',
        observationDate: '2023-08-15',
        lastCheckedDate: '2026-02-10'
      },
      {
        name: 'Agriculture Market Committee, Enumamula, Warangal',
        url: 'https://agmarknet.gov.in',
        coverage: 'Enumamula Terminal Yard, Warangal',
        observationDate: '2025-01-20',
        lastCheckedDate: '2026-03-01'
      }
    ],
    verifiedFacts: [
      {
        factEn: 'Warangal District is mapped for Red Chilli under the Ministry of Food Processing Industries (MoFPI) One District One Product (ODOP) scheme, conferring 35% credit-linked capital subsidy.',
        factTe: 'కేంద్ర ఆహార శుద్ధి మంత్రిత్వ శాఖ (MoFPI) ODOP పథకం కింద వరంగల్ జిల్లా ఎండుమిర్చికి ఎంపికైంది, దీని ద్వారా 35% సబ్సిడీ లభిస్తుంది.',
        sourceName: 'MoFPI PMFME Portal',
        sourceUrl: 'https://pmfme.mofpi.gov.in',
        observationDate: '2023-08-15',
        retrievalDate: '2026-02-10',
        geographicCoverage: 'Warangal District'
      },
      {
        factEn: 'Enumamula Market Yard records daily chilli trading volumes of 15,000+ bags during peak harvest (Feb-May), providing direct raw material sourcing.',
        factTe: 'ఎనుమాముల మార్కెట్ యార్డులో పీక్ సీజన్‌లో రోజుకు 15,000 బస్తాల మిర్చి క్రయవిక్రయాలు జరుగుతాయి.',
        sourceName: 'AGMARKNET Enumamula AMC',
        sourceUrl: 'https://agmarknet.gov.in',
        observationDate: '2025-01-20',
        retrievalDate: '2026-03-01',
        geographicCoverage: 'Enumamula Yard, Warangal'
      }
    ],
    engineeringAssumptions: [
      {
        parameter: 'Machine Rated Output',
        assumedValue: '25 - 35 kg dry pods per hour',
        basis: '3 HP Commercial Hammer Mill manufacturer specification',
        formulaOrStandard: 'Throughput = 30 kg/hr @ 240V 3-Phase power'
      },
      {
        parameter: 'Powdering Yield & Wastage',
        assumedValue: '93% powder yield, 7% moisture loss & stem residue',
        basis: 'Standard agricultural processing test metrics for sun-dried Teja pods',
        formulaOrStandard: '100 kg whole pods -> 93 kg packaged powder + 7 kg waste'
      },
      {
        parameter: 'Packaging Material Cost',
        assumedValue: '₹2.80 per laminated printed pouch (250g size)',
        basis: 'Standard wholesale 3-layer food-grade packaging quotes from Secunderabad/Warangal',
        formulaOrStandard: 'Pouch + Sealing + Batch Code Stamping = ₹2.80'
      }
    ],
    missingEvidenceChecklist: [
      {
        itemEn: 'TSSPDCL 3-Phase Transformer Load Sanction in your exact village/ward',
        itemTe: 'మీ గ్రామంలో 3-ఫేజ్ విద్యుత్ లైన్ మరియు ట్రాన్స్‌ఫార్మర్ లోడ్ సామర్థ్యం',
        whyCrucialEn: '3 HP or 5 HP pulverizers will blow single-phase fuses and cannot operate on fluctuating domestic power.',
        whyCrucialTe: '3-ఫేజ్ కరెంట్ లేకపోతే మోటార్ సరిగ్గా నడవదు మరియు కాలిపోయే ప్రమాదం ఉంది.',
        howToVerifyLocallyEn: 'Visit the local TSSPDCL Section Officer or Assistant Engineer (AE) with the shed survey number to verify transformer headroom.',
        howToVerifyLocallyTe: 'స్థానిక విద్యుత్ శాఖ (TSSPDCL) కార్యాలయానికి వెళ్లి ఏఈ (AE) గారిని కలిసి విద్యుత్ లోడ్ వివరాలు తెలుసుకోండి.'
      },
      {
        itemEn: 'Local Kirana Payment Terms (Cash vs 30-Day Credit)',
        itemTe: 'స్థానిక కిరాణా దుకాణదారుల చెల్లింపు నిబంధనలు (నగదు లేదా ఉధారి)',
        whyCrucialEn: 'If rural kirana shops demand 30 days credit before paying, your working capital must support raw pod purchases without cash flow.',
        whyCrucialTe: 'దుకాణదారులు సరుకు అమ్మిన తర్వాతే డబ్బులిస్తామంటే (ఉధారి), మీ వద్ద అదనపు వర్కింగ్ క్యాపిటల్ ఉండాలి.',
        howToVerifyLocallyEn: 'Personally visit 5 kirana owners in your mandal center; ask whether they pay on delivery or require a 15-day rolling credit buffer.',
        howToVerifyLocallyTe: 'మీ మండలంలో కనీసం 5 దుకాణాలను సందర్శించి వారు వెంటనే నగదు చెల్లిస్తారా లేదా ఉధారి కోరతారా అని తెలుసుకోండి.'
      }
    ],
    seasonalityNotesEn: 'High procurement season runs Feb-May when market prices at Enumamula are lowest. Monsoon months (July-Sept) require strict airtight storage to prevent moisture absorption. Winter festive and wedding season (Nov-Jan) drives peak packaged consumption.',
    seasonalityNotesTe: 'ఫిబ్రవరి-మే సీజన్‌లో మార్కెట్ ధరలు తక్కువగా ఉన్నప్పుడు ముడిసరుకు నిల్వ చేసుకోవాలి. వర్షాకాలంలో బూజు పట్టకుండా జాగ్రత్తలు తీసుకోవాలి.',
    monthlySeasonalityMultipliers: [1.15, 1.10, 1.20, 1.20, 1.05, 0.80, 0.80, 0.85, 1.10, 1.15, 1.25, 1.25]
  },
  {
    id: 'opp-desi-poultry',
    slug: 'backyard-desi-poultry-hatchery',
    titleEn: 'Desi Country Chicken (Natukodi) Rearing & Mini-Hatchery',
    titleTe: 'నాటుకోళ్ల పెంపకం మరియు చిన్న తరహా హేచరీ యూనిట్',
    category: 'dairy_livestock',
    sectorEn: 'Dairy & Livestock',
    sectorTe: 'పాడి & పశుపోషణ',
    imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Free-range country chicken in a rural farm yard',
    imageAttribution: 'Unsplash / Eiliv Aceron (Royalty-free)',
    summaryEn: 'Establish a semi-intensive backyard native poultry unit (Aseel/Vanashree/Kadaknath) producing fertile eggs and table birds. Natukodi commands a 2.5x to 3x price premium over broiler chicken in Warangal and Hyderabad markets.',
    summaryTe: 'అసీల్, వనశ్రీ లేదా కడక్‌నాథ్ నాటుకోళ్ల పెంపకం మరియు కోడి పిల్లల ఉత్పత్తి యూనిట్. వరంగల్, హైదరాబాద్ మార్కెట్లలో బ్రాయిలర్ కోళ్ల కంటే నాటుకోళ్లకు 2.5 నుండి 3 రెట్లు అధిక ధర లభిస్తుంది.',
    minCapitalINR: 65000,
    maxCapitalINR: 160000,
    suggestedWorkingCapitalINR: 25000,
    equipmentChecklist: [
      { item: 'Low-cost GI chain-link mesh shed enclosure (300 sq.ft)', estimatedCostINR: 32000, necessity: 'essential' },
      { item: 'Digital Egg Incubator & Hatcher (200 egg capacity with battery backup)', estimatedCostINR: 18000, necessity: 'essential' },
      { item: 'Chick Brooding Lamps & Infrared Heaters', estimatedCostINR: 5000, necessity: 'essential' },
      { item: 'Automatic Bell Drinkers & Feeder Troughs', estimatedCostINR: 4500, necessity: 'essential' },
      { item: 'Vaccine Cold Box & Thermo-flask', estimatedCostINR: 2500, necessity: 'recommended' }
    ],
    targetCustomersEn: [
      'Highway family restaurants & dhabas along Warangal-Hyderabad NH-163',
      'Weekly Sunday shandies (Kazipet, Narsampet, Parkal shandies)',
      'Direct rural customers for festive, family, and religious occasions',
      'Smallholder farmers seeking 1-day or 3-week vaccinated chicks for backyard rearing'
    ],
    targetCustomersTe: [
      'వరంగల్-హైదరాబాద్ హైవే ధాబాలు మరియు రెస్టారెంట్లు',
      'కాజీపేట, నర్సంపేట, పరకాల వారపు ఆదివారం సంతలు',
      'పండుగలు, శుభకార్యాలకు కొనుగోలు చేసే స్థానిక వినియోగదారులు',
      'పెంపకం కోసం కోడి పిల్లలను కొనే చిన్న రైతులు'
    ],
    localWarangalAdvantageEn: 'High demand from urban diners in Warangal-Hanamkonda and transit visitors travelling to Ramappa Temple (UNESCO heritage site) and Laknavaram Lake creates robust year-round demand for authentic native chicken dishes.',
    localWarangalAdvantageTe: 'వరంగల్-హనుమకొండ నగర వాసులు మరియు రామప్ప, లక్నవరం పర్యాటకుల రాకతో నాటుకోడి మాంసానికి ఏడాది పొడవునా స్థిరమైన గిరాకీ ఉంటుంది.',
    keyRisksEn: [
      'High chick mortality without strict adherence to Lasota (Ranikhet) and Gumboro vaccination schedule',
      'Predator attacks (stray dogs, cats, mongooses) if pen fencing is incomplete',
      'Feed cost increases if reliant entirely on commercial grain without supplemental scavenging / azolla cultivation'
    ],
    keyRisksTe: [
      'లసోటా, గంబోరో టీకాలు సమయానికి వేయకపోతే వ్యాధులు వచ్చే ప్రమాదం',
      'సరైన కంచె లేకపోతే వీధి కుక్కలు, పిల్లుల నుండి ముప్పు',
      'అజోల్లా, ఆకుకూరలు లేకుండా కేవలం దాణాపైనే ఆధారపడితే ఖర్చు పెరుగుతుంది'
    ],
    questionsToInvestigateEn: [
      'Is there a local veterinary dispensary (Pasu Vaidyasala) within 5 km for vaccines and deworming medicine?',
      'Do you have safe open shade or orchard land (Mango/Guava/Moringa garden) where birds can forage during the day?',
      'What is the current live-weight price per kg for country chicken in your nearest mandal shandy?'
    ],
    questionsToInvestigateTe: [
      'మీ గ్రామానికి 5 కి.మీ పరిధిలో పశువైద్యశాల అందుబాటులో ఉందా?',
      'కోళ్లు తిరగడానికి తోట లేదా సురక్షితమైన స్థలం ఉందా?',
      'సమీప సంతలో ప్రస్తుతం లైవ్ నాటుకోడి కిలో ధర ఎంత పలుకుతోంది?'
    ],
    requiredSkills: ['Bird handling & brooding', 'Strict vaccination discipline', 'Azolla / green feed management'],
    regulatoryRequirements: [
      'Gram Panchayat residential/agricultural yard NOC',
      'Animal Husbandry Department registration (for commercial flocks > 500 birds)'
    ],
    applicableSchemes: ['National Livestock Mission (NLM rural poultry subsidy)', 'Telangana Vijaya / Animal Husbandry Department programs', 'Mudra Shishu'],
    sources: [
      {
        name: 'PV Narsimha Rao Telangana Veterinary University (PVNRTVU)',
        url: 'https://pvnrtvu.ac.in',
        coverage: 'Telangana State / Warangal Krishi Vigyan Kendra',
        observationDate: '2024-04-10',
        lastCheckedDate: '2026-02-15'
      }
    ],
    verifiedFacts: [
      {
        factEn: 'Telangana Veterinary University field trials demonstrate native crossbred birds (Vanashree/Gramapriya) reach 1.4-1.8 kg in 16-18 weeks on supplemental forage.',
        factTe: 'తెలంగాణ పశువైద్య విశ్వవిద్యాలయ పరిశోధనల ప్రకారం నాటుకోళ్లు 16-18 వారాల్లో 1.4 నుండి 1.8 కేజీల బరువు పెరుగుతాయి.',
        sourceName: 'PVNRTVU Research Station',
        sourceUrl: 'https://pvnrtvu.ac.in',
        observationDate: '2024-04-10',
        retrievalDate: '2026-02-15',
        geographicCoverage: 'Warangal & Northern Telangana'
      }
    ],
    engineeringAssumptions: [
      {
        parameter: 'Feed Conversion & Foraging Ratio',
        assumedValue: '60% scavenging / kitchen waste / azolla + 40% broken rice / maize mash',
        basis: 'Semi-intensive backyard poultry manual recommendations',
        formulaOrStandard: 'Daily supplemental feed: 45 grams mash per adult bird'
      },
      {
        parameter: 'Mortality Buffer',
        assumedValue: '8% to 12% mortality under strict vaccination',
        basis: 'Field data with day-7 Lasota and day-14 Gumboro vaccines',
        formulaOrStandard: 'Flock survivability = 88-92%'
      }
    ],
    missingEvidenceChecklist: [
      {
        itemEn: 'Refrigerated Vaccine Availability at Mandal Pasu Vaidyasala',
        itemTe: 'మండల పశువైద్యశాలలో కోళ్ల టీకాలు (లసోటా/గంబోరో) నిల్వ సదుపాయం',
        whyCrucialEn: 'Ranikhet disease can wipe out an entire flock in 48 hours if vaccines lose potency due to cold chain breakage.',
        whyCrucialTe: 'టీకాలు సమయానికి వేయకపోతే కొక్కెర తెగులు వల్ల కోళ్లన్నీ చనిపోయే ప్రమాదం ఉంది.',
        howToVerifyLocallyEn: 'Inspect the ice-lined refrigerator (ILR) at the mandal veterinary hospital and confirm vaccine stock schedules.',
        howToVerifyLocallyTe: 'మండల పశువైద్యాధికారిని కలిసి కోళ్ల టీకాల లభ్యతను సరిచూసుకోండి.'
      }
    ],
    seasonalityNotesEn: 'Peak demand surges around Sankranti festival (Jan), Dussehra (Oct), and Bonalu (July). Summer heat (April-May) requires wet gunny bags on mesh pens and electrolyte supplementation to prevent dehydration.',
    seasonalityNotesTe: 'సంక్రాంతి, దసరా పండుగలప్పుడు గరిష్ట గిరాకీ ఉంటుంది. వేసవిలో ఎండ తీవ్రత నుండి కోళ్లను కాపాడుకోవాలి.',
    monthlySeasonalityMultipliers: [1.35, 1.15, 1.05, 0.90, 0.85, 0.95, 1.10, 1.05, 1.10, 1.30, 1.10, 1.25]
  },
  {
    id: 'opp-warangal-dhurries',
    slug: 'warangal-handloom-dhurry-value-addition',
    titleEn: 'Warangal GI Dhurry & Cotton Rug Modernization Unit',
    titleTe: 'వరంగల్ భౌగోళిక గుర్తింపు (GI) దర్రీల ఆధునికీకరణ యూనిట్',
    category: 'handloom_crafts',
    sectorEn: 'Handloom & Crafts (Warangal GI)',
    sectorTe: 'చేనేత & చేతివృత్తులు (వరంగల్ GI)',
    imageUrl: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Artisan weaving detailed geometric textile patterns on a traditional loom',
    imageAttribution: 'Unsplash / Jeremy Bishop (Royalty-free)',
    summaryEn: 'Manufacture authentic GI-tagged Warangal cotton dhurries, geometric floor rugs, and yoga mats. Connect traditional weavers in Kothawada/Parkal clusters with contemporary designs and direct exhibition/e-commerce retail.',
    summaryTe: 'భౌగోళిక గుర్తింపు (GI) పొందిన వరంగల్ కాటన్ దర్రీలు, యోగా మ్యాట్లు మరియు డిజైనర్ రగ్గులను నేసి ఆన్‌లైన్ మరియు పట్టణ ఎగ్జిబిషన్ల ద్వారా అధిక లాభంతో విక్రయించే చేనేత యూనిట్.',
    minCapitalINR: 80000,
    maxCapitalINR: 220000,
    suggestedWorkingCapitalINR: 40000,
    equipmentChecklist: [
      { item: 'Traditional Wooden Frame Loom or Pit Loom Refurbishment', estimatedCostINR: 35000, necessity: 'essential' },
      { item: 'Pirn & Bobbin Winding Machine (Motorized mini)', estimatedCostINR: 12000, necessity: 'essential' },
      { item: 'Stainless Steel Azo-free Dyeing Vats & Burners', estimatedCostINR: 16000, necessity: 'recommended' },
      { item: 'Heavy-duty Edge Stitching & Tassel Binding Machine', estimatedCostINR: 18000, necessity: 'essential' },
      { item: 'Packaging and Moisture-proof Storage Racks', estimatedCostINR: 8000, necessity: 'recommended' }
    ],
    targetCustomersEn: [
      'Urban interior decorators & lifestyle stores in Hyderabad & Bengaluru',
      'Yoga centers & wellness retreats requiring eco-friendly 100% cotton mats',
      'State government handicraft emporiums (Lepakshi / Golkonda Crafts)',
      'Tourists visiting Warangal Fort, Thousand Pillar Temple, and Ramappa'
    ],
    targetCustomersTe: [
      'హైదరాబాద్, బెంగళూరు నగరాల్లోని ఇంటీరియర్ డిజైనర్లు & దుకాణాలు',
      'యోగా కేంద్రాలు మరియు పర్యావరణహిత కాటన్ మ్యాట్లను కోరుకునే సంస్థలు',
      'లేపాక్షి, గోల్కొండ తెలంగాణ రాష్ట్ర హస్తకళల ఎంపోరియంలు',
      'వరంగల్ కోట, వేయిస్తంభాల గుడి, రామప్పను సందర్శించే పర్యాటకులు'
    ],
    localWarangalAdvantageEn: 'Warangal Dhurries hold a prestigious registered Geographical Indication (GI Application No. 544, Certificate No. 320, registered on 30 March 2018) recognized globally for intricate geometric patterns and tie-dye (ikat) style weave techniques centered in Kothawada and nearby mandals.',
    localWarangalAdvantageTe: 'వరంగల్ దర్రీలు అధికారిక భౌగోళిక గుర్తింపు (GI Application No. 544, Certificate No. 320) కలిగి ఉన్నాయి. కోతవాడ, పరకాల ప్రాంతాల నైపుణ్యం గల నేత కార్మికులకు ఇది అంతర్జాతీయ గుర్తింపు తెచ్చింది.',
    keyRisksEn: [
      'Competition from cheap synthetic machine-made carpets sold at weekly fairs',
      'Cotton yarn price fluctuations from Coimbatore and local ginning mills',
      'Weaver attrition if wages are not competitive with agricultural daily labor'
    ],
    keyRisksTe: [
      'సింథటిక్ మెషీన్ కార్పెట్ల నుండి చవకైన పోటీ',
      'నూలు ధరలలో హెచ్చుతగ్గులు',
      'నేత కార్మికులకు సరిపడా కూలీ గిట్టుబాటు కాకపోవడం'
    ],
    questionsToInvestigateEn: [
      'Do you have existing relationships with skilled master weavers in Kothawada or Parkal?',
      'Can you register as an authorized user of the Warangal Dhurry GI Certificate through the Weavers Service Centre?',
      'Have you tested sample products on Instagram/WhatsApp business with Hyderabad urban buyers?'
    ],
    questionsToInvestigateTe: [
      'కోతవాడ లేదా పరకాల నేత కార్మికులతో మీకు పరిచయం ఉందా?',
      'వరంగల్ వీవర్స్ సర్వీస్ సెంటర్ ద్వారా అధికారిక GI సర్టిఫికేట్ పొందగలరా?',
      'హైదరాబాద్ కొనుగోలుదారులకు నమూనా డిజైన్లను చూపించారా?'
    ],
    requiredSkills: ['Loom operation & warp setting', 'Color matching & azo-free dyeing', 'Modern digital cataloging'],
    regulatoryRequirements: [
      'Weavers Artisan Card (Pehchan Card from Ministry of Textiles)',
      'GI Authorized User Registration (under GI Act 1999)',
      'Udyam Registration'
    ],
    applicableSchemes: ['National Handloom Development Programme (NHDP)', 'Telangana Chenetha Mitra Scheme', 'Mudra Weaver Card / PMEGP'],
    sources: [
      {
        name: 'Geographical Indications Registry of India - GI Application No. 544, Certificate No. 320 (Warangal Dhurries)',
        url: 'https://ipindia.gov.in',
        coverage: 'Warangal Urban & Rural Clusters',
        observationDate: '2018-03-30',
        lastCheckedDate: '2026-01-10'
      }
    ],
    verifiedFacts: [
      {
        factEn: 'Warangal Dhurries were granted official GI Registration Certificate No. 320 (Application No. 544) under Class 24 & 27 by the Intellectual Property Office of India on 30 March 2018.',
        factTe: 'వరంగల్ కాటన్ దర్రీలకు భారత ప్రభుత్వ మేధో సంపత్తి విభాగం 2018 మార్చి 30న అధికారిక GI రిజిస్ట్రేషన్ సర్టిఫికెట్ నం. 320 (దరఖాస్తు నం. 544) ప్రదానం చేసింది.',
        sourceName: 'GI Registry of India',
        sourceUrl: 'https://ipindia.gov.in',
        observationDate: '2018-03-30',
        retrievalDate: '2026-01-10',
        geographicCoverage: 'Warangal Handloom Clusters'
      }
    ],
    engineeringAssumptions: [
      {
        parameter: 'Weaving Speed & Loom Productivity',
        assumedValue: '1.5 to 2.0 sq. meters per 8-hour shift for 1 skilled weaver',
        basis: 'Weavers Service Centre standard productivity norms for pit loom',
        formulaOrStandard: '1 medium rug (3ft x 5ft) takes 1.5 working days'
      }
    ],
    missingEvidenceChecklist: [
      {
        itemEn: 'GI Authorized User Certificate Status at Warangal Handloom Office',
        itemTe: 'వరంగల్ చేనేత కార్యాలయంలో GI అధికారిక వినియోగదారు సర్టిఫికేట్',
        whyCrucialEn: 'Selling rugs with the official Warangal Dhurry GI tag without an Authorized User number is legally actionable.',
        whyCrucialTe: 'అధికారిక GI నంబర్ లేకుండా లేబుల్ వాడితే చట్టపరమైన సమస్యలు రావచ్చు.',
        howToVerifyLocallyEn: 'Visit Weavers Service Centre or Assistant Director (Handlooms), Warangal, to submit Form GI-3.',
        howToVerifyLocallyTe: 'వరంగల్ చేనేత శాఖ అసిస్టెంట్ డైరెక్టర్ కార్యాలయంలో ఫారం GI-3 దరఖాస్తు చేసుకోవాలి.'
      }
    ],
    seasonalityNotesEn: 'Festive season (Sept to Jan) accounts for nearly 65% of annual craft and rug purchases in Telangana. Lean monsoon months require focusing on inventory build-up.',
    seasonalityNotesTe: 'సెప్టెంబర్ నుండి జనవరి వరకు దసరా, దీపావళి, సంక్రాంతి సీజన్లలో ఎక్కువ అమ్మకాలు జరుగుతాయి.',
    monthlySeasonalityMultipliers: [1.25, 1.05, 0.95, 0.90, 0.85, 0.80, 0.85, 1.00, 1.25, 1.35, 1.30, 1.25]
  },
  {
    id: 'opp-digital-services',
    slug: 'rural-digital-citizen-service-hub',
    titleEn: 'Rural Digital Service & Financial Inclusion Kiosk',
    titleTe: 'గ్రామీణ డిజిటల్ సిటిజన్ సర్వీస్ మరియు బ్యాంకింగ్ కియోస్క్',
    category: 'digital_services',
    sectorEn: 'Digital Services & Financial Inclusion',
    sectorTe: 'డిజిటల్ & పౌర సేవలు',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Young rural entrepreneur using a computer and printer to provide digital documentation services',
    imageAttribution: 'Unsplash / John Schnobrich (Royalty-free)',
    summaryEn: 'Operate an essential digital assistance center offering MeeSeva citizen certificate applications, Aadhaar-enabled Micro-ATM cash withdrawals, farmer scheme verification (Rythu Bharosa / PM-Kisan), and printing services in an underserved village.',
    summaryTe: 'గ్రామ ప్రజలకు అవసరమైన మీసేవ దరఖాస్తులు, ఆధార్ ఆధారిత బ్యాంకింగ్ నగదు విత్‌డ్రా (AePS), రైతు భరోసా స్టేటస్, కలర్ ప్రింటింగ్ మరియు ల్యామినేషన్ సేవలను అందించే డిజిటల్ కేంద్రం.',
    minCapitalINR: 50000,
    maxCapitalINR: 110000,
    suggestedWorkingCapitalINR: 30000,
    equipmentChecklist: [
      { item: 'Desktop PC / Fast Laptop (Core i3 / 8GB RAM / SSD)', estimatedCostINR: 32000, necessity: 'essential' },
      { item: 'Multi-Function Heavy-Duty Color InkTank Printer & Scanner', estimatedCostINR: 17500, necessity: 'essential' },
      { item: 'Biometric RD-certified Fingerprint & Iris Scanner (Mantra/Morpho)', estimatedCostINR: 4200, necessity: 'essential' },
      { item: 'Micro-ATM POS Terminal for debit card transactions', estimatedCostINR: 2800, necessity: 'essential' },
      { item: 'UPS Battery Power Backup (1000VA - 2 hours runtime)', estimatedCostINR: 6500, necessity: 'essential' },
      { item: 'Hot Roller Pouch Laminator & Paper Cutter', estimatedCostINR: 3200, necessity: 'recommended' }
    ],
    targetCustomersEn: [
      'Village elders and women receiving DBT welfare pensions without travelling 15km to bank branches',
      'Farmers seeking land Pahani / ROR-1B copies and crop insurance updates',
      'School and college students applying for admissions, scholarship forms, and hall tickets',
      'Small shopkeepers needing micro-cash deposits and loan EMI payments'
    ],
    targetCustomersTe: [
      'దూరంగా ఉన్న బ్యాంకుకు వెళ్లకుండా గ్రామంలోనే పింఛను నగదు తీసుకునే వృద్ధులు',
      'పహానీ, 1B కాపీలు, పంట బీమా దరఖాస్తులు చేసుకునే స్థానిక రైతులు',
      'స్కాలర్‌షిప్‌లు, ఉద్యోగ దరఖాస్తులు చేసుకునే గ్రామీణ విద్యార్థులు',
      'చిరు వ్యాపారుల రోజువారీ నగదు డిపాజిట్లు'
    ],
    localWarangalAdvantageEn: 'Many interior villages in mandals like Chennaraopet, Khanapur, and Duggondi are 12-20 km away from designated bank branches. Villagers readily pay standard ₹20-₹50 convenience fees to save ₹120 in round-trip bus fare and a full day’s lost wage.',
    localWarangalAdvantageTe: 'చెన్నారావుపేట, ఖానాపూర్, దుగ్గొండి వంటి మండలాల్లోని మారుమూల గ్రామాల్లో బ్యాంకు శాఖలు దూరంగా ఉంటాయి. బస్సు ఛార్జీలు, సమయం ఆదా కావడంతో ప్రజలు గ్రామంలోని సేవలనే ఎంచుకుంటారు.',
    keyRisksEn: [
      'Cash liquidity crunch: requires maintaining ₹20,000-₹50,000 liquid rolling cash for daily AePS withdrawals',
      'Unannounced internet fiber or mobile tower outages in rural pockets',
      'Stringent UIDAI compliance rules against overcharging beyond official statutory caps'
    ],
    keyRisksTe: [
      'ఆధార్ విత్‌డ్రా కోసం రోజువారీ చేతిలో నగదు నిల్వలు (లిక్విడిటీ) ఉండాలి',
      'గ్రామాల్లో ఇంటర్నెట్ నెట్‌వర్క్ సమస్యలు రావడం',
      'ప్రభుత్వ చట్టబద్ధమైన రుసుము కంటే ఎక్కువ వసూలు చేయకూడదు'
    ],
    questionsToInvestigateEn: [
      'Are there already MeeSeva or CSC franchise centers active within 2 km of your target location?',
      'Which mobile network provider (Airtel, Jio, BSNL) has consistent 4G/5G data coverage at your shop premises?',
      'Can you partner with Telangana Grameena Bank (TGGB) or SBI as an official Business Correspondent (BC)?'
    ],
    questionsToInvestigateTe: [
      'మీ గ్రామంలో ఇప్పటికే మీసేవ లేదా CSC కేంద్రాలు ఉన్నాయా?',
      'మీ ప్రాంతంలో ఏ మొబైల్ నెట్‌వర్క్ వేగంగా పనిచేస్తోంది?',
      'తెలంగాణ గ్రామీణ బ్యాంక్ లేదా SBI బిజినెస్ కరస్పాండెంట్ (BC) ఏజెన్సీ పొందగలరా?'
    ],
    requiredSkills: ['Computer literacy & basic typing', 'Telugu & English reading comprehension', 'Cash management'],
    regulatoryRequirements: [
      'CSC VLE ID registration (Free at register.csc.gov.in)',
      'Bank Business Correspondent (BC) certification (IIBF BC Certification exam)',
      'Police Verification Certificate for financial kiosk handling'
    ],
    applicableSchemes: ['Digital India CSC Initiative', 'Mudra Shishu loan for hardware', 'Telangana Academy for Skill and Knowledge (TASK) partner programs'],
    sources: [
      {
        name: 'Common Services Centre (CSC) Special Purpose Vehicle - Ministry of MeitY',
        url: 'https://csc.gov.in',
        coverage: 'Warangal District CSC Network',
        observationDate: '2024-11-10',
        lastCheckedDate: '2026-02-20'
      }
    ],
    verifiedFacts: [
      {
        factEn: 'Over 140 Gram Panchayats in Warangal district rely on banking correspondents for Aadhaar micro-ATM cash payouts under DBT schemes.',
        factTe: 'వరంగల్ జిల్లాలోని 140కి పైగా గ్రామ పంచాయితీల్లో డిబిటి పింఛన్ల చెల్లింపుల కోసం మైక్రో-ఏటీఎంలే ప్రధాన ఆధారం.',
        sourceName: 'CSC e-Governance Services',
        sourceUrl: 'https://csc.gov.in',
        observationDate: '2024-11-10',
        retrievalDate: '2026-02-20',
        geographicCoverage: 'Warangal Rural Mandals'
      }
    ],
    engineeringAssumptions: [
      {
        parameter: 'Average Transaction Margin',
        assumedValue: '₹35 composite margin per transaction (commission + printing/form fees)',
        basis: 'Bank BC commission structure (0.4% up to ₹25 max) plus MeeSeva citizen application convenience fee',
        formulaOrStandard: '750 transactions/month @ ₹35 average = ₹26,250 gross'
      }
    ],
    missingEvidenceChecklist: [
      {
        itemEn: 'Lead Bank BC Agency Allotment in your Gram Panchayat',
        itemTe: 'మీ గ్రామ పంచాయతీలో బ్యాంక్ బిజినెస్ కరస్పాండెంట్ (BC) అనుమతి',
        whyCrucialEn: 'Banks restrict duplicate BC terminal allotments within the same Gram Panchayat boundary.',
        whyCrucialTe: 'ఒకే గ్రామంలో ఇద్దరు బీసీలకు బ్యాంకులు అనుమతి ఇవ్వకపోవచ్చు.',
        howToVerifyLocallyEn: 'Meet the Lead District Manager (LDM) at SBI Subedari, Hanamkonda, or the local Telangana Grameena Bank branch manager.',
        howToVerifyLocallyTe: 'హనుమకొండలోని లీడ్ బ్యాంక్ మేనేజర్ (LDM) లేదా స్థానిక బ్యాంకు మేనేజర్‌ను సంప్రదించండి.'
      }
    ],
    seasonalityNotesEn: 'Peaks during agricultural subsidy disbursement periods (Rythu Bharosa in June & Dec) and student admission seasons (May-July). Low periods occur during peak monsoon transplanting.',
    seasonalityNotesTe: 'రైతు భరోసా చెల్లింపులు (జూన్, డిసెంబర్) మరియు విద్యార్థుల అడ్మిషన్ల సమయంలో ఎక్కువ లావాదేవీలు జరుగుతాయి.',
    monthlySeasonalityMultipliers: [1.10, 1.05, 1.10, 1.00, 1.20, 1.30, 1.15, 0.90, 0.95, 1.05, 1.05, 1.25]
  },
  {
    id: 'opp-cold-press-oil',
    slug: 'cold-pressed-groundnut-sesame-oil-ghani',
    titleEn: 'Cold-Pressed Groundnut & Sesame Oil (Ghani) Mill',
    titleTe: 'వేరుశనగ & నువ్వుల గానుగ నూనె (కోల్డ్ ప్రెస్డ్) తయారీ యూనిట్',
    category: 'food_processing',
    sectorEn: 'Food & Agro Processing',
    sectorTe: 'ఆహార & వ్యవసాయ ప్రాసెసింగ్',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Pure unrefined edible oil in glass bottles next to raw seeds',
    imageAttribution: 'Unsplash / Fulvio Ciccolo (Royalty-free)',
    summaryEn: 'Operate a traditional wooden/steel rotary cold-press oil ghani. Produce pure, zero-chemical groundnut, sesame, and sunflower edible oils. The high-protein oil cake byproduct is in intense demand from local dairy farmers as premium cattle feed.',
    summaryTe: 'కల్తీ లేని సాంప్రదాయ కట్టె గానుగ నూనె తయారీ యూనిట్. వేరుశనగ, నువ్వుల నూనెలను ఉత్పత్తి చేసి పట్టణ వినియోగదారులకు, నూనె చెక్క (పిండి)ని స్థానిక పాడి రైతులకు పశువుల దాణాగా విక్రయించవచ్చు.',
    minCapitalINR: 190000,
    maxCapitalINR: 420000,
    suggestedWorkingCapitalINR: 80000,
    equipmentChecklist: [
      { item: 'Rotary Cold Press Wood Ghani Machine (15-20 kg/batch, 3HP Motor)', estimatedCostINR: 115000, necessity: 'essential' },
      { item: 'Seed Cleaner & Destoner Vibratory Shaker', estimatedCostINR: 34000, necessity: 'recommended' },
      { item: 'Food-Grade Stainless Steel Multi-Plate Oil Filter Press', estimatedCostINR: 28000, necessity: 'essential' },
      { item: 'Stainless Steel Oil Settling & Storage Tanks (500L total)', estimatedCostINR: 22000, necessity: 'essential' },
      { item: 'Semi-Automatic Bottle/Can Filling & Capping Station', estimatedCostINR: 14000, necessity: 'recommended' }
    ],
    targetCustomersEn: [
      'Health-aware families in Hanamkonda, Warangal city, and Kazipet railway colony',
      'Local dairy cattle owners purchasing fresh oil-cake (chenaga pindi / nuvvula chekka)',
      'Traditional sweet makers and rural snack (murukku/boondi) fryers seeking stable frying oil',
      'Direct farm-gate customers bringing their own harvested groundnut for contract expelling'
    ],
    targetCustomersTe: [
      'హనుమకొండ, వరంగల్ నగరాల్లోని ఆరోగ్య స్పృహ కలిగిన కుటుంబాలు',
      'స్వచ్ఛమైన చెక్క (పశువుల దాణా) కోసం వచ్చే స్థానిక పాడి రైతులు',
      'స్వీట్ షాపులు, చిరుతిళ్ల తయారీదారులు',
      'సొంతంగా పండించిన వేరుశనగను ఆడించుకోవడానికి వచ్చే రైతులు'
    ],
    localWarangalAdvantageEn: 'Groundnut and sesame are cultivated in significant volumes across Warangal, Jangaon, and Mahabubabad districts. Being able to extract fresh oil in front of customers establishes instant trust over branded solvent-extracted packaged oils.',
    localWarangalAdvantageTe: 'వరంగల్ పరిసర ప్రాంతాల్లో వేరుశనగ విస్తారంగా సాగవుతుంది. వినియోగదారుల కళ్లెదుటే స్వచ్ఛమైన గానుగ నూనె తీసి ఇవ్వడం ద్వారా నమ్మకం, మంచి ధర లభిస్తాయి.',
    keyRisksEn: [
      'Fluctuations in raw groundnut pod quality and seed oil content (typically 40-45% yield)',
      'Perishability: unrefined oil has a shorter shelf life (4-6 months) and must be stored in dark, cool food-grade containers',
      'High initial working capital tied up in seasonal bulk groundnut seed procurement'
    ],
    keyRisksTe: [
      'విత్తనాల నాణ్యతను బట్టి నూనె శాతం (40-45%) ఆధారపడి ఉంటుంది',
      'రసాయనాలు లేని సహజ నూనె 4-6 నెలల్లో వినియోగించాలి',
      'సీజన్‌లో ముడి విత్తనాలు కొనుగోలు చేయడానికి వర్కింగ్ క్యాపిటల్ అవసరం'
    ],
    questionsToInvestigateEn: [
      'What is the going price for 1 kg of fresh groundnut cake at your local cattle sheds?',
      'Are you willing to offer custom milling services (charging ₹15-₹20/kg milling fee) to create immediate daily cash flow?',
      'Does your workshop location have good roadside visibility and customer parking?'
    ],
    questionsToInvestigateTe: [
      'మీ ప్రాంతంలో పశువుల దాణాగా వేరుశనగ చెక్క కేజీ ఎంత ధర పలుకుతోంది?',
      'రైతుల విత్తనాలను గానుగ ఆడిస్తూ రోజువారీ ఆదాయం పొందడానికి సిద్ధంగా ఉన్నారా?',
      'మీ దుకాణం ప్రజలు సులభంగా వచ్చిపోయే ప్రధాన రహదారిలో ఉందా?'
    ],
    requiredSkills: ['Cold press machinery calibration', 'Seed moisture grading', 'Packaging hygiene', 'Local retail marketing'],
    regulatoryRequirements: [
      'FSSAI Basic / State License',
      'Udyam MSME Registration',
      'Gram Panchayat / Municipal Trade License',
      'Weights and Measures Stamping'
    ],
    applicableSchemes: ['PMFME 35% Credit Linked Subsidy', 'PMEGP Scheme', 'Agriculture Infrastructure Fund (AIF)'],
    sources: [
      {
        name: 'Professor Jayashankar Telangana State Agricultural University (PJTSAU)',
        url: 'https://pjtsau.edu.in',
        coverage: 'Telangana Oilseeds Research & Processing',
        observationDate: '2024-03-12',
        lastCheckedDate: '2026-02-18'
      }
    ],
    verifiedFacts: [
      {
        factEn: 'PJTSAU Oilseeds Research verifies that cold-press rotary wood expelling yields 41-43% pure unheated oil and 55% high-protein cattle cake from grade-A Telangana bold groundnut seeds.',
        factTe: 'PJTSAU పరిశోధన ప్రకారం చెక్క గానుగ ద్వారా వేరుశనగ నుండి 41-43% స్వచ్ఛమైన నూనె మరియు 55% అధిక ప్రోటీన్ గల పశువుల దాణా చెక్క లభిస్తుంది.',
        sourceName: 'PJTSAU Agricultural University',
        sourceUrl: 'https://pjtsau.edu.in',
        observationDate: '2024-03-12',
        retrievalDate: '2026-02-18',
        geographicCoverage: 'Warangal & Central Telangana'
      }
    ],
    engineeringAssumptions: [
      {
        parameter: 'Extraction Yield & Byproduct Realization',
        assumedValue: '100 kg groundnut pod -> 42 kg cold pressed oil + 55 kg high-protein cattle cake',
        basis: 'Standard wood ghani expelling ratio @ 14 rpm cold rotation',
        formulaOrStandard: 'Oil @ ₹280/Litre + Cake @ ₹32/kg covers raw seed cost @ ₹88/kg'
      }
    ],
    missingEvidenceChecklist: [
      {
        itemEn: 'Direct Tie-Up with Local Dairy Cattle Owners for Oil Cake (Pindi)',
        itemTe: 'స్థానిక పాడి రైతులతో నూనె చెక్క (పిండి) కొనుగోలు ఒప్పందం',
        whyCrucialEn: 'The cattle cake byproduct generates 28% of total gross revenue. If unsold, it attracts fungus within 15 days.',
        whyCrucialTe: 'నూనె చెక్క అమ్మకం ద్వారా 28% ఆదాయం వస్తుంది, సకాలంలో అమ్ముడుపోకపోతే బూజు పడుతుంది.',
        howToVerifyLocallyEn: 'Visit local milk collection centers in your mandal; confirm whether dairy farmers are willing to purchase weekly freshly expelled cake.',
        howToVerifyLocallyTe: 'సమీప పాల సేకరణ కేంద్రానికి వెళ్లి రైతులను కలవండి.'
      }
    ],
    seasonalityNotesEn: 'Kharif groundnut harvests arrive in November-December. Post-harvest winter and early summer see peak oil extraction. Monsoon months require climate-controlled seed storage.',
    seasonalityNotesTe: 'నవంబర్-డిసెంబర్ పంట కోతల సమయంలో ముడి విత్తనాలు విరివిగా లభిస్తాయి.',
    monthlySeasonalityMultipliers: [1.25, 1.20, 1.15, 1.05, 0.95, 0.85, 0.80, 0.85, 1.05, 1.15, 1.30, 1.35]
  },
  {
    id: 'opp-two-wheeler-ev-repair',
    slug: 'rural-two-wheeler-ev-service-point',
    titleEn: 'Two-Wheeler & EV Scooter Multi-Brand Rural Service Point',
    titleTe: 'ద్విచక్ర వాహనాలు & ఎలక్ట్రిక్ స్కూటర్ల గ్రామీణ సర్వీస్ సెంటర్',
    category: 'repair_maintenance',
    sectorEn: 'Rural Repair & Mechanics',
    sectorTe: 'గ్రామీణ మెకానిక్ & రిపేర్ సేవలు',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Mechanic servicing a motorcycle engine with specialized pneumatic tools',
    imageAttribution: 'Unsplash / Artem Beliaikin (Royalty-free)',
    summaryEn: 'Equip a modern rural two-wheeler workshop with pneumatic tools, diagnostic multimeters, and electric scooter battery testing capabilities. Over 65% of rural Warangal households now rely on two-wheelers for farm transport and milk delivery.',
    summaryTe: 'కంప్రెషర్, న్యూమాటిక్ టూల్స్ మరియు ఎలక్ట్రిక్ స్కూటర్ బ్యాటరీ టెస్టింగ్ సౌకర్యాలతో కూడిన ఆధునిక మోటార్‌సైకిల్ రిపేర్ షాప్. గ్రామీణ ప్రాంతాల్లో ప్రతి ఇంటికీ ద్విచక్ర వాహనం తప్పనిసరిగా మారింది.',
    minCapitalINR: 75000,
    maxCapitalINR: 175000,
    suggestedWorkingCapitalINR: 35000,
    equipmentChecklist: [
      { item: 'Hydraulic Bike Lifting Platform (Floor mounted)', estimatedCostINR: 28000, necessity: 'essential' },
      { item: 'Air Compressor (2 HP / 100L tank) with Impact Wrench & Tyre Inflator', estimatedCostINR: 24000, necessity: 'essential' },
      { item: 'Digital Multimeter, Battery Load Tester & EV Controller Tester', estimatedCostINR: 7500, necessity: 'essential' },
      { item: 'Comprehensive Hand Tool Set (Ring, Open, Socket Wrenches & Pullers)', estimatedCostINR: 12000, necessity: 'essential' },
      { item: 'Tubeless Tyre Puncture Repair Kit & Bead Breaker', estimatedCostINR: 4500, necessity: 'essential' }
    ],
    targetCustomersEn: [
      'Local farmers using motorbikes to commute between homesteads and agricultural fields',
      'Milk collection agents and delivery personnel covering 40-70 km daily',
      'School/college teachers and commuters travelling across mandal link roads',
      'New owners of low-speed electric scooters lacking local warranty service centers'
    ],
    targetCustomersTe: [
      'రోజూ పొలాలకు, మండల కేంద్రాలకు ప్రయాణించే స్థానిక రైతులు',
      'రోజూ 50-70 కి.మీ తిరిగే పాలు, కూరగాయల డెలివరీ వ్యాపారులు',
      'మండల రోడ్లలో ప్రయాణించే ఉద్యోగులు, విద్యార్థులు',
      'వరంగల్ పట్టణానికి వెళ్లకుండా గ్రామంలోనే ఈవీ స్కూటర్ సర్వీస్ కోరుకునేవారు'
    ],
    localWarangalAdvantageEn: 'Mandal road networks around Parkal, Narsampet, and Wardhannapet have seen a massive surge in EV scooter adoption among rural youth and shop owners. Traditional village roadside puncture shops lack electronic diagnostic tools and battery testing meters.',
    localWarangalAdvantageTe: 'పరకాల, నర్సంపేట మండలాల్లో ఈవీ స్కూటర్ల వాడకం భారీగా పెరిగింది. సాధారణ పంక్చర్ షాపుల్లో ఎలక్ట్రానిక్ టూల్స్ లేకపోవడం వల్ల ఆధునిక వర్క్‌షాప్‌లకు మంచి ఆదరణ ఉంటుంది.',
    keyRisksEn: [
      'Credit risk: rural customers frequently request repairs on credit during pre-harvest lean months',
      'High-voltage safety risks when repairing lithium battery packs without insulated tools',
      'Spare parts inventory lockup if stocking parts for too many obsolete bike models'
    ],
    keyRisksTe: [
      'పంటలు చేతికి వచ్చే వరకు రైతులు అప్పుగా రిపేర్లు చేయాలని కోరడం',
      'ఈవీ లిథియం బ్యాటరీలను జాగ్రత్తగా హ్యాండిల్ చేయకపోతే షార్ట్ సర్క్యూట్ ముప్పు',
      'అన్ని మోడళ్ల స్పేర్ పార్టులను కొని పెట్టుకుంటే పెట్టుబడి నిలిచిపోతుంది'
    ],
    questionsToInvestigateEn: [
      'Do you have at least 1-2 years of hands-on experience servicing four-stroke engines or completed an ITI Motor Mechanic certificate?',
      'Who is the nearest trusted wholesale spare parts distributor in Warangal or Kazipet?',
      'Is there an accessible roadside spot near a petrol bunk or bus stop with steady footfall?'
    ],
    questionsToInvestigateTe: [
      'మోటార్ మెకానిక్‌గా మీకు కనీసం 1-2 ఏళ్ల అనుభవం లేదా ITI సర్టిఫికేట్ ఉందా?',
      'వరంగల్ లేదా కాజీపేటలో హోల్‌సేల్ స్పేర్ పార్ట్స్ సరఫరాదారులతో పరిచయం ఉందా?',
      'పెట్రోల్ బంక్ లేదా బస్టాండ్ సమీపంలో మంచి స్థలం లభిస్తుందా?'
    ],
    requiredSkills: ['IC engine troubleshooting', 'EV electrical circuits & battery testing', 'Customer service'],
    regulatoryRequirements: [
      'Udyam Registration',
      'Panchayat Trade License',
      'Hazardous waste disposal compliance (used engine oil pickup)'
    ],
    applicableSchemes: ['PMEGP Service Sector', 'Mudra Shishu / Kishore Loan', 'Telangana BC Welfare Artisans Support'],
    sources: [
      {
        name: 'Ministry of Skill Development and Entrepreneurship (MSDE) - Automotive Sector Benchmarks',
        url: 'https://msde.gov.in',
        coverage: 'All India / Telangana Rural Clusters',
        observationDate: '2024-05-15',
        lastCheckedDate: '2026-02-12'
      }
    ],
    verifiedFacts: [
      {
        factEn: 'Over 68% of agricultural households in Telangana own a motorized two-wheeler for farm-to-mandi transport according to State Statistical Yearbooks.',
        factTe: 'తెలంగాణ గణాంక నివేదికల ప్రకారం 68% పైగా గ్రామీణ రైతు కుటుంబాలు వ్యవసాయ అవసరాల కోసం ద్విచక్ర వాహనాలను వాడుతున్నాయి.',
        sourceName: 'Telangana State Statistical Abstract',
        sourceUrl: 'https://www.telangana.gov.in',
        observationDate: '2024-05-15',
        retrievalDate: '2026-02-12',
        geographicCoverage: 'Warangal & Telangana Rural'
      }
    ],
    engineeringAssumptions: [
      {
        parameter: 'Labour & Service Fee Structure',
        assumedValue: 'General oil service ₹150, Clutch/Brake overhaul ₹250, Wiring check ₹200 + parts markup (18%)',
        basis: 'Prevailing mandal workshop price survey in Narsampet and Parkal',
        formulaOrStandard: '6 bikes/day average = ₹1,200 labor daily'
      }
    ],
    missingEvidenceChecklist: [
      {
        itemEn: 'Authorized Used Lubricant Engine Oil Disposal Linkage',
        itemTe: 'వాడిన ఇంజిన్ ఆయిల్ రీసైక్లింగ్ సరఫరా ఒప్పందం',
        whyCrucialEn: 'Dumping old oil into open drains is subject to severe pollution control penalties.',
        whyCrucialTe: 'పాత ఆయిల్‌ను డ్రైనేజీల్లో పారబోయడం చట్టరీత్యా నేరం, అధీకృత డీలర్‌కు అప్పగించాలి.',
        howToVerifyLocallyEn: 'Contact authorized waste oil re-refiners in Warangal Industrial Estate to arrange drum pickup.',
        howToVerifyLocallyTe: 'వరంగల్ ఇండస్ట్రియల్ ఎస్టేట్‌లోని అధీకృత ఆయిల్ కలెక్టర్లను సంప్రదించండి.'
      }
    ],
    seasonalityNotesEn: 'Heavy service demand during harvest months (March-May and Nov-Dec) when two-wheelers haul bags of produce. Slower during peak monsoon rains.',
    seasonalityNotesTe: 'పంటలు మార్కెట్‌కు వెళ్లే మార్చి-మే మరియు నవంబర్-డిసెంబర్ నెలల్లో సర్వీసింగ్ గిరాకీ ఎక్కువగా ఉంటుంది.',
    monthlySeasonalityMultipliers: [1.15, 1.10, 1.25, 1.20, 1.10, 0.85, 0.80, 0.85, 1.00, 1.15, 1.25, 1.20]
  }
];

export const WARANGAL_MARKET_EVIDENCE: MarketEvidenceItem[] = [
  {
    id: 'evi-enumamula-chilli',
    titleEn: 'Enumamula Market Yard: Red Chilli & Spice Seasonal Arrival Range',
    titleTe: 'ఎనుమాముల వ్యవసాయ మార్కెట్ యార్డ్: మిర్చి సీజనల్ దిగుబడుల నివేదిక',
    category: 'chilli_spices',
    headlineMetric: '15,000+ Bags/Day (Peak Window)',
    metricDescriptionEn: 'Recorded peak post-harvest daily arrival benchmark (12,000 to 18,000 40-kg bags) at Enumamula Agricultural Market Yard between February and May. Off-season monsoon volumes drop below 500 bags/day.',
    metricDescriptionTe: 'ఫిబ్రవరి-మే పీక్ సీజన్‌లో ఎనుమాముల యార్డులో రోజుకు 12,000 నుండి 18,000 బస్తాల మిర్చి దిగుబడి రికార్డవుతుంది. వర్షాకాలంలో ఇది 500 బస్తాల లోపుకు పడిపోతుంది.',
    sourceName: 'Agricultural Market Committee, Enumamula / Agmarknet Daily Commodity Bulletins',
    sourceUrl: 'https://agmarknet.gov.in',
    geographicCoverage: 'Enumamula Terminal Yard, Warangal (Agri Market Committee)',
    observationDate: '2025-03-15',
    retrievalDate: '2026-03-01',
    dataType: 'market_arrival',
    limitationsEn: 'Daily trading volume is intensely seasonal; weather shocks and unseasonal rainfall can reduce peak trading by 30-40%. Farm-gate procurement prices are 10-15% lower than yard auction rates.',
    limitationsTe: 'దిగుబడులు పూర్తిగా కాలానుగుణమైనవి; అకాల వర్షాలు వస్తే దిగుబడి తగ్గుతుంది. తోట వద్ద ధర మార్కెట్ యార్డ్ వేలం ధర కంటే తక్కువగా ఉంటుంది.',
    warangalContextEn: 'Enumamula Terminal Market Yard in Warangal is recognized as one of Asia’s largest single-location spice trading yards. Cultivars include Teja, Wonder Hot, US 341, and local Warangal Chappatta (deep red color, moderate capsaicin).',
    warangalContextTe: 'వరంగల్‌లోని ఎనుమాముల మార్కెట్ యార్డ్ ఆసియాలోనే ప్రసిద్ధి గాంచినది. తేజ, వండర్ హాట్, చపాతా వంటి మేలైన రకాలు ఇక్కడ లభిస్తాయి.'
  },
  {
    id: 'evi-warangal-dhurries-gi',
    titleEn: 'Warangal Dhurries Registered GI Certificate Benchmark',
    titleTe: 'వరంగల్ దర్రీల అధికారిక భౌగోళిక గుర్తింపు (GI) ధ్రువీకరణ వివరాలు',
    category: 'handloom_crafts',
    headlineMetric: 'GI Cert No. 320 (App #544)',
    metricDescriptionEn: 'Granted Registered Geographical Indication certificate No. 320 under Application No. 544 (Class 24 & 27) registered on 30 March 2018 by the Geographical Indications Registry of India, covering traditional hand-woven cotton, jute, and wool dhurries produced in Warangal.',
    metricDescriptionTe: 'భారత ప్రభుత్వ భౌగోళిక గుర్తింపు రిజిస్ట్రీ ద్వారా 2018 మార్చి 30న ప్రదానం చేసిన అధికారిక GI సర్టిఫికెట్ నం. 320 (దరఖాస్తు నం. 544, క్లాస్ 24 & 27).',
    sourceName: 'Controller General of Patents, Designs & Trade Marks (CGPDTM) - GI Registry of India',
    sourceUrl: 'https://ipindia.gov.in',
    geographicCoverage: 'Warangal Urban (Kothawada cluster) and adjacent handloom mandals',
    observationDate: '2018-03-30',
    retrievalDate: '2026-03-01',
    dataType: 'gi_registry',
    limitationsEn: 'Distinguishes granted registration (Cert #320, App #544) from pending regional applications such as Chapata Chilli (App #719). Commercial sale using the GI name legally requires an Authorized User certificate (Form GI-3) issued via the Weavers Service Centre.',
    limitationsTe: 'మంజూరైన GI సర్టిఫికెట్ (నం. 320, దరఖాస్తు #544) వివరాలు ఇవి. అధికారిక లేబుల్ వాడటానికి వీవర్స్ సర్వీస్ సెంటర్ ద్వారా ఆథరైజ్డ్ యూజర్ సర్టిఫికెట్ పొందాలి.',
    warangalContextEn: 'Concentrated in Kothawada (Warangal), over 1,200 active pit looms produce geometric and pictorial carpets. Premium cotton dhurries sell for ₹1,200 to ₹4,500 in urban exhibitions against raw yarn cost of ₹400-₹900.',
    warangalContextTe: 'కోతవాడ కేంద్రంగా 1,200 పైగా మగ్గాలు పనిచేస్తున్నాయి. ఎగ్జిబిషన్లలో ₹1,200 నుండి ₹4,500 వరకు విక్రయించబడుతున్నాయి.'
  },
  {
    id: 'evi-msme-udyam-warangal',
    titleEn: 'Warangal & Hanamkonda Udyam MSME Registered Unit Count',
    titleTe: 'వరంగల్ & హనుమకొండ ఉద్యమ్ నమోదిత ఎంఎస్ఎంఈ వివరాలు',
    category: 'msme_density',
    headlineMetric: '28,416 Units (Combined)',
    metricDescriptionEn: 'Official cumulative count of registered micro and small enterprises recorded on the Ministry of MSME Udyam Portal for Warangal and Hanamkonda districts as of December 31, 2024.',
    metricDescriptionTe: 'కేంద్ర MSME మంత్రిత్వ శాఖ ఉద్యమ్ పోర్టల్ నివేదిక ప్రకారం 2024 డిసెంబర్ 31 నాటికి వరంగల్ & హనుమకొండ జిల్లాల్లో నమోదైన మొత్తం పరిశ్రమల సంఖ్య 28,416.',
    sourceName: 'Ministry of Micro, Small and Medium Enterprises, Govt of India - Udyam Portal',
    sourceUrl: 'https://udyamregistration.gov.in',
    geographicCoverage: 'Warangal & Hanamkonda Districts (Combined post-bifurcation stats)',
    observationDate: '2024-12-31',
    retrievalDate: '2026-02-15',
    dataType: 'official_stat',
    limitationsEn: 'Represents formalized units holding Udyam registrations. Informal village home workshops and seasonal agri-laborers are not reflected in this formal registry.',
    limitationsTe: 'ఈ సంఖ్య అధికారికంగా నమోదైన యూనిట్లదే; గ్రామీణ ప్రాంతాల్లోని చిన్న చిన్న కుటీర పరిశ్రమలు ఇంకా నమోదు కాలేదు.',
    warangalContextEn: 'Over 88% of registrations are categorized as Micro enterprises (< ₹1 Crore investment, < ₹5 Crore turnover), predominantly in agro-processing, kirana retail, and vehicle repair services.',
    warangalContextTe: 'నమోదైన వాటిలో 88% పైగా సూక్ష్మ పరిశ్రమలే ఉన్నాయి, ప్రధానంగా వ్యవసాయ శుద్ధి, కిరాణా మరియు రిపేర్ రంగాల్లో ఉన్నాయి.'
  },
  {
    id: 'evi-vijaya-dairy-network',
    titleEn: 'Telangana State Dairy Incentive (G.O.Ms.No. 40 DBT Benchmark)',
    titleTe: 'తెలంగాణ ప్రభుత్వ విజయ డైరీ ప్రోత్సాహకం (G.O.Ms.No. 40 వివరాలు)',
    category: 'dairy_livestock',
    headlineMetric: '₹4/Litre State DBT',
    metricDescriptionEn: 'Direct Benefit Transfer (DBT) cash incentive authorized under Telangana Animal Husbandry & Dairy Development Dept (G.O.Ms.No. 40) per litre of milk poured to recognized cooperative societies, paid above base fat/SNF price.',
    metricDescriptionTe: 'సహకార సంఘాలకు పోసే ప్రతి లీటరు పాలపై తెలంగాణ పశుసంవర్ధక శాఖ (G.O.Ms.No. 40) ద్వారా రైతుల ఖాతాల్లో నేరుగా జమ చేసే ₹4 ప్రోత్సాహకం.',
    sourceName: 'Telangana Animal Husbandry Dept (G.O.Ms.No. 40) & TSDDCF Vijaya Dairy',
    sourceUrl: 'https://dairy.telangana.gov.in',
    geographicCoverage: 'Warangal Rural, Narsampet, Wardhannapet mandal chilling routes',
    observationDate: '2024-08-01',
    retrievalDate: '2026-02-22',
    dataType: 'policy_benchmark',
    limitationsEn: 'Release of the ₹4 state incentive may experience periodic administrative delays; base procurement price depends strictly on Fat% and SNF% testing at the mandal collection center.',
    limitationsTe: 'ప్రభుత్వ ₹4 ప్రోత్సాహకం జమ కావడంలో అప్పుడప్పుడు ఆలస్యం జరగవచ్చు; పాల ధర వెన్న శాతం (Fat%) మరియు SNF పై ఆధారపడి ఉంటుంది.',
    warangalContextEn: 'Network of bulk milk chilling centers in Narsampet and Wardhannapet provides guaranteed purchase security for small dairy farmers and self-help groups maintaining 2-5 crossbred cows or Murrah buffaloes.',
    warangalContextTe: 'నర్సంపేట, వర్ధన్నపేటలోని పాల శీతలీకరణ కేంద్రాలు 2-5 పాడి పశువులు గల రైతులకు స్థిరమైన మార్కెట్ కల్పిస్తున్నాయి.'
  }
];

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'scheme-pmegp',
    name: 'Prime Minister’s Employment Generation Programme (PMEGP)',
    department: 'Ministry of MSME / KVIC / District Industries Centre (DIC) Warangal',
    portalUrl: 'https://www.kviconline.gov.in/pmegpeportal',
    category: 'central',
    targetBeneficiariesEn: 'Any individual above 18 years, Self-Help Groups (SHGs), and Co-operative societies starting a new micro-enterprise.',
    targetBeneficiariesTe: '18 ఏళ్లు నిండిన గ్రామీణ యువత, మహిళా సంఘాలు (SHG) మరియు సహకార సంఘాలు.',
    subsidyOrAssistanceEn: '35% capital subsidy of project cost for rural beneficiaries (Special category: SC/ST/OBC/Women/Minority); 25% for general category in rural areas.',
    subsidyOrAssistanceTe: 'గ్రామీణ ప్రాంతాల్లో ప్రత్యేక వర్గాలకు (SC/ST/BC/మహిళలు) 35% సబ్సిడీ; సాధారణ వర్గాలకు 25% సబ్సిడీ.',
    maxProjectCostINR: 5000000,
    eligibilityCriteriaEn: [
      'Age minimum 18 years; no income ceiling',
      'For projects above ₹10 Lakhs in manufacturing and ₹5 Lakhs in service, applicant must have passed minimum 8th class',
      'Only for new units; existing units are not eligible'
    ],
    eligibilityCriteriaTe: [
      'కనీస వయస్సు 18 ఏళ్లు; ఎలాంటి ఆదాయ పరిమితి లేదు',
      'ఉత్పత్తి రంగంలో ₹10 లక్షలు, సేవా రంగంలో ₹5 లక్షల పైబడిన ప్రాజెక్టులకు కనీసం 8వ తరగతి ఉత్తీర్ణత ఉండాలి',
      'కొత్తగా ప్రారంభించే యూనిట్లకు మాత్రమే వర్తిస్తుంది'
    ],
    applicationProcedureEn: [
      'Submit online application with DPR (Detailed Project Report) on the KVIC PMEGP official portal',
      'Select Agency: DIC Warangal or KVIB Warangal',
      'Track score card and bank branch sanction'
    ],
    applicationProcedureTe: [
      'KVIC పోర్టల్‌లో ప్రాజెక్ట్ రిపోర్ట్ (DPR) తో ఆన్‌లైన్ దరఖాస్తు సమర్పించాలి',
      'ఏజెన్సీగా DIC వరంగల్ లేదా KVIB ని ఎంచుకోవాలి',
      'బ్యాంకు మంజూరు కోసం సంప్రదించాలి'
    ],
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Caste Certificate (for SC/ST/OBC subsidy slab)',
      'Educational Qualification Certificate (8th Pass or higher)',
      'Detailed Project Report (DPR) with machine quotation',
      'Land lease or ownership proof for shed'
    ],
    localWarangalOffice: 'District Industries Centre (DIC), Near Collectorate, Subedari, Hanamkonda / Warangal. Phone: 0870-2577626',
    lastVerifiedDate: '2026-02-15',
    cautionNoticeEn: 'Warning: Beware of unauthorized middlemen claiming to guarantee PMEGP subsidy approval for commission. PMEGP application is 100% free and online.',
    cautionNoticeTe: 'హెచ్చరిక: PMEGP సబ్సిడీ ఇప్పిస్తామని నమ్మించే దళారులను నమ్మవద్దు. దరఖాస్తు పూర్తిగా ఉచితం.'
  },
  {
    id: 'scheme-pmfme',
    name: 'PM Formalisation of Micro food processing Enterprises (PMFME)',
    department: 'Ministry of Food Processing Industries (MoFPI) / SERP Telangana',
    portalUrl: 'https://pmfme.mofpi.gov.in',
    category: 'central',
    targetBeneficiariesEn: 'Individual micro food processors, FPOs, and Self-Help Group (SHG) members upgrading existing or setting up new food units.',
    targetBeneficiariesTe: 'ఆహార ప్రాసెసింగ్ యూనిట్లు ప్రారంభించే వ్యక్తులు, రైతు ఉత్పత్తిదారుల సంఘాలు (FPO) మరియు మహిళా స్వయం సహాయక సంఘాలు.',
    subsidyOrAssistanceEn: 'Credit-linked capital subsidy @ 35% of eligible project cost, with maximum ceiling of ₹10 Lakh per unit.',
    subsidyOrAssistanceTe: 'ప్రాజెక్ట్ వ్యయంపై 35% క్రెడిట్ లింక్డ్ సబ్సిడీ (గరిష్టంగా ₹10 లక్షల వరకు).',
    maxProjectCostINR: 3000000,
    eligibilityCriteriaEn: [
      'Existing or new micro food processing enterprises',
      'Special priority for Warangal One District One Product (ODOP): Red Chilli processing',
      'Applicant should have ownership / lease rights over workshop premises'
    ],
    eligibilityCriteriaTe: [
      'ఆహార ప్రాసెసింగ్ యూనిట్లు, ముఖ్యంగా వరంగల్ ODOP ఎంపికైన ఎండుమిర్చి సంబంధిత యూనిట్లు',
      'షెడ్డు లేదా వర్క్‌షాప్ స్థలం లీజు లేదా స్వంత హక్కులు ఉండాలి'
    ],
    applicationProcedureEn: [
      'Apply online on the official PMFME portal',
      'Local District Resource Person (DRP) appointed in Warangal assists in DPR preparation free of cost',
      'District Level Committee (DLC) chaired by District Collector verifies and forwards to bank'
    ],
    applicationProcedureTe: [
      'PMFME పోర్టల్‌లో దరఖాస్తు చేసుకోవాలి',
      'వరంగల్ జిల్లా రిసోర్స్ పర్సన్ (DRP) ఉచితంగా DPR తయారీలో సహాయం చేస్తారు',
      'కలెక్టర్ ఆధ్వర్యంలోని కమిటీ ఆమోదం తెలిపి బ్యాంకుకు పంపుతుంది'
    ],
    requiredDocuments: [
      'Aadhaar Card and Bank Account Statement (last 6 months)',
      'FSSAI Registration or undertaking to apply within 6 months',
      'Machinery Quotation with GST number of vendor',
      'Electricity Bill / Commercial load verification'
    ],
    localWarangalOffice: 'District Level PMFME Cell, O/o District Collector / DIC Subedari, Hanamkonda',
    lastVerifiedDate: '2026-02-18',
    cautionNoticeEn: 'Government-appointed District Resource Persons (DRPs) are paid directly by the government; do not pay any private consultancy fees.',
    cautionNoticeTe: 'DRP లకు ప్రభుత్వం గౌరవ వేతనం ఇస్తుంది; వారికి ఎలాంటి వ్యక్తిగత ఫీజులు చెల్లించవద్దు.'
  },
  {
    id: 'scheme-ts-pride',
    name: 'Telangana State Program for Rapid Incubation of Dalit Entrepreneurs (T-PRIDE)',
    department: 'Industries & Commerce Department, Government of Telangana',
    portalUrl: 'https://ipass.telangana.gov.in',
    category: 'state_telangana',
    targetBeneficiariesEn: 'SC and ST entrepreneurs establishing new micro and small industrial/service enterprises in Telangana.',
    targetBeneficiariesTe: 'తెలంగాణలోని దళిత, గిరిజన (SC/ST) వర్గాలకు చెందిన నూతన సూక్ష్మ మరియు చిన్న పరిశ్రమల వ్యవస్థాపకులు.',
    subsidyOrAssistanceEn: '35% investment subsidy on fixed capital investment (additional 5% for women); ₹1.50 per unit power subsidy for 5 years; 100% stamp duty reimbursement.',
    subsidyOrAssistanceTe: 'ఫిక్స్‌డ్ క్యాపిటల్‌పై 35% సబ్సిడీ (మహిళలకు అదనంగా 5%); 5 ఏళ్లపాటు యూనిట్‌కు ₹1.50 విద్యుత్ సబ్సిడీ.',
    maxProjectCostINR: 10000000,
    eligibilityCriteriaEn: [
      'Promoter must belong to Scheduled Caste (SC) or Scheduled Tribe (ST) community',
      'Unit must be located in Telangana State',
      'Applicant must obtain TS-iPASS single window clearance'
    ],
    eligibilityCriteriaTe: [
      'దరఖాస్తుదారుడు తప్పనిసరిగా SC లేదా ST వర్గానికి చెందినవారై ఉండాలి',
      'యూనిట్ తెలంగాణ రాష్ట్రంలో ఏర్పాటు చేయాలి',
      'TS-iPASS ద్వారా అనుమతులు పొందాలి'
    ],
    applicationProcedureEn: [
      'Register enterprise on TS-iPASS single window portal',
      'Submit investment claim after commercial production commencement'
    ],
    applicationProcedureTe: [
      'TS-iPASS పోర్టల్‌లో రిజిస్ట్రేషన్ చేసుకోవాలి',
      'ఉత్పత్తి ప్రారంభమైన తర్వాత రాయితీ క్లెయిమ్ సమర్పించాలి'
    ],
    requiredDocuments: [
      'Caste Certificate issued by Revenue Authority (MeeSeva)',
      'TS-iPASS Approval Certificate',
      'Chartered Accountant certified fixed assets statement',
      'Bank disbursement letter and commercial power bill'
    ],
    localWarangalOffice: 'General Manager, District Industries Centre (DIC), Subedari, Hanamkonda. TS-iPASS Warangal Facilitation Desk',
    lastVerifiedDate: '2026-03-01',
    cautionNoticeEn: 'Subsidies are released post-commencement of commercial production; maintain pristine bank transaction records for all equipment purchases.',
    cautionNoticeTe: 'ఉత్పత్తి ప్రారంభమైన తర్వాతే సబ్సిడీ విడుదల అవుతుంది; అన్ని కొనుగోళ్లకు బ్యాంకు లావాదేవీ రసీదులు భద్రపరుచుకోవాలి.'
  },
  {
    id: 'scheme-mudra',
    name: 'Pradhan Mantri Mudra Yojana (PMMY) - Shishu & Kishore',
    department: 'Department of Financial Services, Ministry of Finance, Govt of India',
    portalUrl: 'https://www.mudra.org.in',
    category: 'bank_credit',
    targetBeneficiariesEn: 'Non-farm micro-enterprises, small shopkeepers, artisans, repair workshops, and service providers.',
    targetBeneficiariesTe: 'వ్యవసాయేతర చిన్న వ్యాపారులు, చేతివృత్తులవారు, కిరాణా దుకాణాలు మరియు రిపేర్ వర్క్‌షాపులు.',
    subsidyOrAssistanceEn: 'Collateral-free bank loans: Shishu (loans up to ₹50,000) and Kishore (loans ₹50,000 to ₹5,00,000) at commercial interest rates with zero processing fee for Shishu.',
    subsidyOrAssistanceTe: 'ఎలాంటి తాకట్టు (కొల్లేటరల్) లేకుండా బ్యాంక్ రుణం: శిశు (₹50,000 వరకు), కిశోర్ (₹50,000 నుండి ₹5 లక్షల వరకు).',
    maxProjectCostINR: 1000000,
    eligibilityCriteriaEn: [
      'Any Indian citizen with a feasible non-farm income generating activity proposal',
      'Clean credit history (no default with existing banks/CIBIL > 650)'
    ],
    eligibilityCriteriaTe: [
      'ఆదాయం తెచ్చిపెట్టే వ్యాపార ప్రతిపాదన గల ఏ భారతీయ పౌరుడైనా అర్హులే',
      'బ్యాంకు డిఫాల్ట్ ఉండకూడదు'
    ],
    applicationProcedureEn: [
      'Apply directly at local bank branch (Telangana Grameena Bank, SBI, Union Bank) or via JanSamarth portal (jansamarth.in)',
      'Submit business estimation and quotation'
    ],
    applicationProcedureTe: [
      'సమీప బ్యాంకు శాఖ లేదా జన్ సమర్థ్ (jansamarth.in) పోర్టల్ ద్వారా దరఖాస్తు చేసుకోవాలి',
      'వ్యాపార అంచనా మరియు కొటేషన్లు సమర్పించాలి'
    ],
    requiredDocuments: [
      'Aadhaar and PAN Card',
      'Proof of business address (Panchayat NOC / Trade license / Electricity bill)',
      'Machinery / inventory purchase quotations',
      'Passport size photos (2)'
    ],
    localWarangalOffice: 'All Scheduled Commercial Banks & Telangana Grameena Bank (TGGB) branches across Warangal District',
    lastVerifiedDate: '2026-02-25',
    cautionNoticeEn: 'Banks are strictly mandated not to demand collateral security or third-party guarantee for loans up to ₹10 Lakh under Mudra. If a branch demands collateral, lodge a grievance with the Lead District Manager (LDM) Warangal.',
    cautionNoticeTe: 'ముద్రా రుణాలకు ఎలాంటి స్థిరాస్తి తాకట్టు లేదా పూచీకత్తు అవసరం లేదు. ఎవరైనా అడిగితే లీడ్ బ్యాంక్ మేనేజర్‌కు ఫిర్యాదు చేయవచ్చు.'
  }
];
