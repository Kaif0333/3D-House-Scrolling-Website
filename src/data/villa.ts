/**
 * Single source of truth for the Villa Horizon experience.
 * Room frame-ranges live here only — the hero overlays, the progress rail and
 * the gallery all read from this file so the timing can never drift apart.
 */

export const SEQUENCE = {
  /** Frames exported from the source walkthrough. */
  totalFrames: 500,
  /** Frames fetched before the curtain lifts. The rest stream in around the playhead. */
  preloadCount: 32,
  /** Scroll distance the hero stays pinned for, as a ScrollTrigger `end` value. */
  scrollLength: "+=500%",
  /** ScrollTrigger id so other components can locate the pin instead of guessing. */
  triggerId: "hero-sequence",
  desktop: { dir: "/seq/d", stride: 1 },
  mobile: { dir: "/seq/m", stride: 2 },
} as const;

export interface RoomZone {
  id: string;
  index: string;
  /** Short label for the progress rail. */
  shortName: string;
  /** Eyebrow shown on the hero card. */
  tag: string;
  title: string;
  description: string;
  specs: string[];
  align: "left" | "right";
  /** Frame the card starts fading in. */
  startFrame: number;
  peakStartFrame: number;
  peakEndFrame: number;
  /** Frame the card has fully faded out. */
  endFrame: number;
  /** Curated still from this zone, used by the gallery. */
  still: string;
}

export const ROOMS: RoomZone[] = [
  {
    id: "entrance",
    index: "01",
    shortName: "Entrance",
    tag: "Architectural Entry",
    title: "Grand Entrance",
    description:
      "A double-height threshold in brushed bronze, architectural concrete and natural basalt — the first held breath of the house.",
    specs: ["Ceiling 6.5m", "Basalt & bronze"],
    align: "left",
    startFrame: 15,
    peakStartFrame: 30,
    peakEndFrame: 65,
    endFrame: 80,
    still: "entrance",
  },
  {
    id: "living",
    index: "02",
    shortName: "Living",
    tag: "Living & Lounge",
    title: "Panoramic Lounge",
    description:
      "Floor-to-ceiling curtain walls dissolve the boundary between room and valley, drawing the landscape inward as light moves through the day.",
    specs: ["South-west aspect", "Triple-glazed Low-E"],
    align: "right",
    startFrame: 95,
    peakStartFrame: 110,
    peakEndFrame: 150,
    endFrame: 165,
    still: "living",
  },
  {
    id: "kitchen",
    index: "03",
    shortName: "Kitchen",
    tag: "Culinary Atelier",
    title: "Gourmet Kitchen",
    description:
      "Handcrafted smoked oak cabinetry set against a monolithic Calacatta island, with a concealed pantry behind the joinery line.",
    specs: ["Calacatta Viola", "Gaggenau Vario"],
    align: "left",
    startFrame: 180,
    peakStartFrame: 195,
    peakEndFrame: 235,
    endFrame: 250,
    still: "kitchen",
  },
  {
    id: "bedroom",
    index: "04",
    shortName: "Suite",
    tag: "Private Sanctuary",
    title: "Master Suite",
    description:
      "Acoustic timber panelling, a bespoke lighting score and a private terrace oriented to catch the last of the sun.",
    specs: ["Smoked oak floors", "32m² terrace"],
    align: "right",
    startFrame: 265,
    peakStartFrame: 280,
    peakEndFrame: 320,
    endFrame: 335,
    still: "suite",
  },
  {
    id: "bathroom",
    index: "05",
    shortName: "Spa",
    tag: "Wellness Spa",
    title: "Spa Bath Suite",
    description:
      "A freestanding stone soaking tub, rain enclosure and radiant travertine underfoot — warmth held in the material itself.",
    specs: ["Monolithic limestone", "Radiant floor"],
    align: "left",
    startFrame: 350,
    peakStartFrame: 365,
    peakEndFrame: 405,
    endFrame: 420,
    still: "spa",
  },
  {
    id: "garden",
    index: "06",
    shortName: "Garden",
    tag: "Botanical Courtyard",
    title: "Zen Garden & Pool",
    description:
      "A secluded courtyard of endemic maples, still water and an open hearth, held between the two wings of the house.",
    specs: ["Endemic maples", "Heated infinity edge"],
    align: "right",
    startFrame: 435,
    peakStartFrame: 450,
    peakEndFrame: 485,
    endFrame: 498,
    still: "pool",
  },
];

export interface ConceptFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  /** Numeric target for the count-up. */
  statValue: number;
  /** Decimal places to hold while counting. */
  statPrecision: number;
  statPrefix: string;
  statSuffix: string;
  statLabel: string;
}

export const CONCEPT_FEATURES: ConceptFeature[] = [
  {
    id: "synergy",
    title: "Structural Synergy",
    subtitle: "Harmonising nature and steel",
    description:
      "Every beam and cantilevered deck is engineered to float weightlessly above the terrain, holding an uninterrupted dialogue between interior sanctuary and open land.",
    bullets: [
      "Zero-threshold triple-glazed glass walls",
      "Custom patinated steel cantilevers",
      "Self-stabilising foundation matrix",
    ],
    statValue: 1450,
    statPrecision: 0,
    statPrefix: "",
    statSuffix: " m²",
    statLabel: "Total living surface",
  },
  {
    id: "biophilic",
    title: "Biophilic Integration",
    subtitle: "Living architecture",
    description:
      "Natural stone, endemic flora and flowing water channels wind through the core of the villa, filtering the air and settling the pace of the house.",
    bullets: [
      "Subterranean rainwater recycling",
      "Integrated micro-climate gardens",
      "Acoustic stone waterfall buffers",
    ],
    statValue: 360,
    statPrecision: 0,
    statPrefix: "",
    statSuffix: "°",
    statLabel: "Panoramic sightlines",
  },
  {
    id: "passive",
    title: "Passive Solar Engineering",
    subtitle: "Sustainable precision",
    description:
      "Oriented along the sun's trajectory, deep overhangs invite winter warmth into the plan while holding the interior cool through the summer peak.",
    bullets: [
      "Photovoltaic solar glass shingles",
      "Thermal-mass basalt flooring",
      "Automated climate-tracking louvres",
    ],
    statValue: 100,
    statPrecision: 0,
    statPrefix: "",
    statSuffix: "%",
    statLabel: "Energy neutrality",
  },
];

export interface ResidenceSuite {
  id: string;
  name: string;
  level: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  priceValue: number;
  status: "Available" | "Reserved";
  highlights: string[];
  still: string;
  /** Plan split into discrete segments so it can line-draw in sequence. */
  plan: {
    shell: string;
    partitions: string[];
    fixtures: string[];
    labels: { x: number; y: number; text: string }[];
  };
}

export const SUITES: ResidenceSuite[] = [
  {
    id: "penthouse",
    name: "The Horizon Penthouse",
    level: "Upper level — Tier 01",
    area: "650 m² / 7,000 sq ft",
    bedrooms: 4,
    bathrooms: 5,
    priceValue: 18500000,
    status: "Available",
    highlights: [
      "360° infinity rooftop pool and terrace",
      "Private glass elevator arrival",
      "Double-sided marble fireplace lounge",
      "Subterranean four-car climate garage",
    ],
    still: "dusk",
    plan: {
      shell: "M 24 24 H 376 V 236 H 24 Z",
      partitions: ["M 150 24 V 236", "M 150 130 H 376", "M 264 130 V 236"],
      fixtures: [
        "M 44 44 H 130 V 110 H 44 Z",
        "M 286 150 H 356 V 216 H 286 Z",
        "M 170 44 H 356 V 110 H 170 Z",
      ],
      labels: [
        { x: 50, y: 210, text: "LOUNGE" },
        { x: 190, y: 82, text: "TERRACE" },
        { x: 176, y: 210, text: "SUITE" },
      ],
    },
  },
  {
    id: "garden",
    name: "The Garden Pavilion",
    level: "Ground level — Tier 02",
    area: "520 m² / 5,600 sq ft",
    bedrooms: 3,
    bathrooms: 4,
    priceValue: 14200000,
    status: "Available",
    highlights: [
      "Direct courtyard and lotus-pool access",
      "Indoor-outdoor dining pavilion",
      "Subterranean wellness spa and sauna",
      "Italian walnut dressing suites",
    ],
    still: "courtyard",
    plan: {
      shell: "M 24 24 H 376 V 236 H 24 Z",
      partitions: ["M 200 24 V 236", "M 24 150 H 200", "M 200 110 H 376"],
      fixtures: [
        "M 44 44 H 180 V 130 H 44 Z",
        "M 220 130 H 356 V 216 H 220 Z",
        "M 220 44 H 356 V 92 H 220 Z",
      ],
      labels: [
        { x: 54, y: 200, text: "PAVILION" },
        { x: 232, y: 176, text: "COURTYARD" },
        { x: 248, y: 74, text: "SPA" },
      ],
    },
  },
  {
    id: "vista",
    name: "The Vista Suite",
    level: "West wing — Tier 03",
    area: "380 m² / 4,100 sq ft",
    bedrooms: 2,
    bathrooms: 3,
    priceValue: 9800000,
    status: "Reserved",
    highlights: [
      "Sunset orientation with glass terrace",
      "Chef's kitchen in smoked oak",
      "Acoustic media lounge and wine vault",
      "Automated climate and shading system",
    ],
    still: "lounge",
    plan: {
      shell: "M 24 24 H 376 V 236 H 24 Z",
      partitions: ["M 120 24 V 236", "M 250 24 V 236", "M 250 140 H 376"],
      fixtures: [
        "M 42 44 H 102 V 216 H 42 Z",
        "M 140 60 H 230 V 200 H 140 Z",
        "M 270 160 H 356 V 216 H 270 Z",
      ],
      labels: [
        { x: 46, y: 232, text: "VAULT" },
        { x: 152, y: 232, text: "MEDIA" },
        { x: 268, y: 128, text: "TERRACE" },
      ],
    },
  },
];

export type AmenityIcon = "water" | "cellar" | "thermal" | "screening" | "arrival";

export interface Amenity {
  id: string;
  category: string;
  title: string;
  description: string;
  /** Grid span on large screens. */
  span: string;
  icon: AmenityIcon;
  /** Curated still used as the card's background layer, when it has one. */
  still?: string;
}

export const AMENITIES: Amenity[] = [
  {
    id: "pool",
    category: "Aquatics",
    title: "Cantilevered Infinity Pool",
    description:
      "A saltwater edge extending twelve metres beyond the cliff line, warmed year-round and lit from beneath through a glass viewing portal.",
    span: "lg:col-span-8",
    icon: "water",
    still: "pool",
  },
  {
    id: "wine",
    category: "Cellar",
    title: "Climate Wine Vault",
    description:
      "Twelve hundred bottles held in dark oak and UV-filtered glass at constant humidity.",
    span: "lg:col-span-4",
    icon: "cellar",
  },
  {
    id: "spa",
    category: "Wellness",
    title: "Thermal Spa & Sauna",
    description:
      "Finnish cedar, a marble cold plunge and heated stone lounges arranged as a single bathing sequence.",
    span: "lg:col-span-4",
    icon: "thermal",
    still: "spa",
  },
  {
    id: "cinema",
    category: "Screening",
    title: "Dolby Atmos Cinema",
    description:
      "Sixteen seats behind acoustic fabric walls, with 4K laser projection and motorised leather recliners.",
    span: "lg:col-span-4",
    icon: "screening",
  },
  {
    id: "arrival",
    category: "Arrival",
    title: "Private Helipad & Garage",
    description:
      "An automated six-car climate garage with rapid EV charging, connected directly to the rooftop pad.",
    span: "lg:col-span-4",
    icon: "arrival",
    still: "approach",
  },
];

export interface Material {
  id: string;
  name: string;
  origin: string;
  application: string;
  description: string;
  /** Still used as the swatch texture. */
  still: string;
  /** Fallback wash if the image is unavailable. */
  tint: string;
}

export const MATERIALS: Material[] = [
  {
    id: "marble",
    name: "Calacatta Viola",
    origin: "Carrara, Italy",
    application: "Island & bath suites",
    description:
      "Deep burgundy veining through creamy white quartz, bookmatched across every wet surface in the house.",
    still: "kitchen",
    tint: "#b9ada0",
  },
  {
    id: "oak",
    name: "Smoked Austrian Oak",
    origin: "Salzburg, Austria",
    application: "Acoustic walls & joinery",
    description:
      "Fumed across seventy-two hours to draw out dark chocolate tone and close the grain for durability.",
    still: "corridor",
    tint: "#6b4f36",
  },
  {
    id: "bronze",
    name: "Patinated Bronze",
    origin: "Kyoto, Japan",
    application: "Entry portals & trim",
    description:
      "Hand-rubbed patination that holds a warm metallic reflection under low ambient light.",
    still: "portal",
    tint: "#8c7250",
  },
  {
    id: "basalt",
    name: "Swiss Basalt",
    origin: "Glarus, Switzerland",
    application: "Heated flooring & paving",
    description:
      "High thermal-density volcanic stone, selected for how efficiently it carries radiant underfloor heat.",
    still: "bath",
    tint: "#4a4741",
  },
];

/** Frames chosen for the gallery strip, in narrative order. */
export const GALLERY = [
  { still: "approach", caption: "Arrival court", room: "Approach" },
  { still: "portal", caption: "The bronze portal", room: "Entrance" },
  { still: "living", caption: "Curtain wall, morning", room: "Living" },
  { still: "lounge", caption: "Lounge toward the valley", room: "Living" },
  { still: "kitchen", caption: "Calacatta island", room: "Kitchen" },
  { still: "dining", caption: "Dining under linear light", room: "Kitchen" },
  { still: "corridor", caption: "Oak circulation spine", room: "Suite" },
  { still: "suite", caption: "Master suite terrace", room: "Suite" },
  { still: "spa", caption: "Bathing sequence", room: "Spa" },
  { still: "bath", caption: "Stone soaking tub", room: "Spa" },
  { still: "courtyard", caption: "Interior courtyard", room: "Garden" },
  { still: "dusk", caption: "The house at dusk", room: "Garden" },
];

export const CONTACT = {
  advisorName: "Private Client Office",
  phone: "+41 44 210 98 00",
  phoneHref: "tel:+41442109800",
  email: "concierge@horizonvilla.com",
  emailHref: "mailto:concierge@horizonvilla.com",
  offices: [
    { city: "Zurich", street: "Bahnhofstrasse 42" },
    { city: "Lake Como", street: "Via Bellagio 12" },
    { city: "Aspen", street: "E Cooper Ave 204" },
    { city: "Tokyo", street: "Ginza 6-Chome" },
  ],
  location: {
    place: "Above Lake Como, Lombardy",
    coordinates: "45.9829° N, 9.2585° E",
    proximities: [
      { label: "Como town", value: "14 min" },
      { label: "Milan Malpensa", value: "58 min" },
      { label: "Private airfield", value: "35 min" },
      { label: "St. Moritz", value: "2 hr 10" },
    ],
  },
} as const;

export const PROVENANCE = {
  studio: "Atelier Vermeer",
  architect: "Ines Vermeer",
  role: "Principal architect",
  statement:
    "We did not want a house that sits on the ridge. We wanted one that admits the ridge was there first — so every wall either frames the valley, or gets out of its way.",
  credits: [
    { label: "Architecture", value: "Atelier Vermeer" },
    { label: "Interiors", value: "Studio Maren Holt" },
    { label: "Landscape", value: "Ferrand & Oyama" },
    { label: "Completion", value: "2026" },
  ],
  recognition: [
    "Dezeen Awards — Rural House longlist",
    "AD100 Europe — Featured residence",
    "World Architecture Festival — Shortlist",
  ],
} as const;

/** Suite price formatter shared by the explorer and the inquiry select. */
export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
