export type JobFixRow = {
  pain: string;
  fix: string;
};

export type JobImage = {
  src: string;
  alt: string;
};

export type Job = {
  slug: string;
  title: string;
  serviceLabel: string;
  serviceSlug: string;
  city: string;
  areaSlug: string;
  cover: string;
  coverAlt: string;
  images: JobImage[];
  beforeImage?: string;
  afterImage?: string;
  caption: string;
  summary: string;
  analysis: {
    equipment: string;
    workPerformed: string;
    outcome: string;
  };
  rows: JobFixRow[];
  reviewAuthor?: string;
  /** Shown on the photos when lighting or composition was enhanced. */
  imageNote?: string;
};

function photoJob(input: {
  slug: string;
  title: string;
  serviceLabel: string;
  serviceSlug: string;
  cover: string;
  coverAlt: string;
  story: string;
  rows: JobFixRow[];
  extra?: JobImage[];
  imageNote?: string;
}): Job {
  return {
    slug: input.slug,
    title: input.title,
    serviceLabel: input.serviceLabel,
    serviceSlug: input.serviceSlug,
    city: "",
    areaSlug: "",
    cover: input.cover,
    coverAlt: input.coverAlt,
    images: [{ src: input.cover, alt: input.coverAlt }, ...(input.extra ?? [])],
    caption: input.story,
    summary: input.story,
    analysis: {
      equipment: input.serviceLabel,
      workPerformed: input.story,
      outcome: "Call (810) 360-7385 if you want this kind of roof on your property.",
    },
    rows: input.rows,
    imageNote: input.imageNote,
  };
}

/**
 * Filenames that returned HTTP 200 on the Faber Roof media folder.
 * Paths stay relative so r2img() can prefix the public base. Addresses are not printed on the files.
 */
const AI_TEST_NOTE = "AI-generated test photo";

export const JOBS: Job[] = [
  photoJob({
    slug: "ai-test-apartment-flat-roofs",
    title: "Apartment flat roofs",
    serviceLabel: "Commercial flat roofing",
    serviceSlug: "commercial-flat-roofing",
    cover: "/images/ai-flat-roofs/flat-roof-apartment-complex.jpg",
    coverAlt: "AI-generated test photo of brick apartment buildings with white flat roofs.",
    story:
      "Test image of white flat roofs across a brick apartment community, with HVAC units on the roofs. This is not a completed Faber Roof job.",
    imageNote: AI_TEST_NOTE,
    rows: [
      { pain: "A property manager with a lot of low-slope roofs.", fix: "One look at the list, then a written bid for the buildings that cannot wait." },
      { pain: "Patching the same flat roofs year after year.", fix: "A membrane system named after someone has been on the roof." },
      { pain: "A 4-person crew that walks away from a complex.", fix: "A crew sized for the volume, up to 20 workers when the job needs it." },
      { pain: "No photo on the site that shows a flat roof.", fix: "This card is an AI test so the page can be judged before real job photos replace it." },
    ],
    extra: [
      {
        src: "/images/ai-flat-roofs/flat-roof-hero-tpo-aerial.jpg",
        alt: "AI-generated test photo of a white TPO roof with HVAC units on a brick commercial building.",
      },
      {
        src: "/images/ai-flat-roofs/flat-roof-tpo-seams.jpg",
        alt: "AI-generated test photo of a TPO seam, vent boot, and HVAC curb flashing.",
      },
    ],
  }),
  photoJob({
    slug: "ai-test-tpo-seam-weld",
    title: "TPO seam weld",
    serviceLabel: "TPO roofing",
    serviceSlug: "tpo-roofing",
    cover: "/images/ai-flat-roofs/flat-roof-tpo-crew.jpg",
    coverAlt: "AI-generated test photo of two roofers heat-welding a white TPO seam.",
    story:
      "Test image of a hot-air weld on a white TPO seam, with a roller following the nozzle. This is not a completed Faber Roof job.",
    imageNote: AI_TEST_NOTE,
    rows: [
      { pain: "A flat roof that needs a membrane, not another shingle layer.", fix: "A TPO roof scoped after someone is on the building." },
      { pain: "Seams that were glued and opened up.", fix: "Heat-welded overlaps, then a roller on the seam." },
      { pain: "Curbs and vents left out of the bid.", fix: "Flashing at HVAC curbs and pipes called out in the scope." },
      { pain: "No crew photo that matches a TPO job.", fix: "This card is an AI test so the page can be judged before real job photos replace it." },
    ],
  }),
  photoJob({
    slug: "standing-seam-metal-roof",
    title: "Standing-seam metal roof",
    serviceLabel: "Metal roofing",
    serviceSlug: "metal-roofing",
    cover: "faber-roof-standing-seam-metal-roof-aerial.avif",
    coverAlt: "Aerial view of a standing-seam metal roof with skylights on a brick building.",
    story: "This brick building in Metro Detroit has a standing-seam metal roof and skylights. The panels run the slope and shed water at the raised seams. Ask for the same system if your building should not take another shingle roof.",
    rows: [
      { pain: "Another shingle roof on a building that keeps leaking.", fix: "Standing-seam metal, after someone looks and writes the estimate." },
      { pain: "Fasteners sitting in the weather on an old screw-down panel.", fix: "Raised seams, so the water sheds at the lock instead of at a screw." },
      { pain: "Skylights that leak every time the roof is patched around them.", fix: "Skylights flashed into the panels, or called out if one is already done." },
      { pain: "A building that should not take a third layer of shingles.", fix: "One metal roof on the estimate, not another shingle cycle." },
    ],
  }),
  photoJob({
    slug: "modern-farmhouse-shingle-roof",
    title: "Modern farmhouse roof",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "modern-farmhouse-drone-view.avif",
    coverAlt: "Drone view of a white modern farmhouse with gray architectural shingles, side gables, and a center dormer.",
    story: "A white farmhouse with gray architectural shingles across the main roof, the side gables, and the dormer. The lines stay straight where the wings meet. The roof work is the job.",
    imageNote: "Lighting and composition enhanced with AI",
    rows: [
      { pain: "A long house whose gables have to read as one roof.", fix: "Architectural shingles across the main roof, the wings, and the dormer." },
      { pain: "Valleys where the side wings meet the center.", fix: "Valleys cut with the new shingles, not cement over an old joint." },
      { pain: "A metal porch roof dying into the shingle field.", fix: "The shingles stopped clean at the porch so the two roofs stay separate." },
      { pain: "Ridges that wander on a house this long.", fix: "Finished ridges so the roof reads straight from the road." },
    ],
    extra: [
      {
        src: "modern-farmhouse-exterior-with-detailed-roofing.avif",
        alt: "Front of a white farmhouse with gray architectural shingles, gables, and a metal porch roof.",
      },
      {
        src: "modern-white-farmhouse-exterior.avif",
        alt: "White farmhouse exterior with a dark architectural shingle roof and finished gables.",
      },
    ],
  }),
  photoJob({
    slug: "two-story-home-shingle-roof",
    title: "Attached homes with shingle roofs",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-two-story-home-shingle-roof.avif",
    coverAlt: "Two-story attached homes with asphalt shingle roofs over the entries.",
    story: "These attached homes have asphalt shingles over the entries and the main slopes. You get the same kind of roof on a house or a row of homes: old shingles off, new shingles on, price in writing first.",
    rows: [
      { pain: "Shared roofs and entry roofs that leak into more than one home.", fix: "A look at each slope, then a written estimate for the shingles." },
      { pain: "Water at the wall where two homes meet.", fix: "Step flashing checked where the roofs tie together." },
      { pain: "A patch on one entry that fails the next rain.", fix: "The entry roof and the main slope scoped together." },
      { pain: "No one sure which unit owns the leak.", fix: "The whole roof looked at before anyone names a price." },
    ],
  }),
  photoJob({
    slug: "dark-architectural-shingles-brick-home",
    title: "Dark architectural shingles on a brick home",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-dark-architectural-shingles-brick-home.avif",
    coverAlt: "Brick house with dark gray architectural shingles and stone accents.",
    story: "Dark gray architectural shingles on a brick house with stone accents. The lines are straight, the ridges are finished, and the roof reads as one system instead of a patchwork.",
    rows: [
      { pain: "A brick house with worn shingles that no longer match the rest of the home.", fix: "Architectural shingles in a color named on the estimate." },
      { pain: "Curled tabs and granules in the gutters.", fix: "Tear-off, then a new layer that lies flat." },
      { pain: "Ridges pieced together from old repairs.", fix: "A finished ridge so the roof reads as one system." },
      { pain: "A color picked from a photo that does not match the brick.", fix: "The color written down before the shingles are ordered." },
    ],
  }),
  photoJob({
    slug: "lakefront-home-gray-shingle-roof",
    title: "Lakefront home with a gray shingle roof",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-lakefront-home-gray-shingle-roof.avif",
    coverAlt: "House beside the water with gray architectural shingles and a ridge vent.",
    story: "A house on the water with gray architectural shingles and a ridge vent. Lake lots take wind. The roof has to be a full system, not a few replaced tabs.",
    rows: [
      { pain: "A lake house whose shingles are open to the wind off the water.", fix: "A full shingle roof, not a few replaced tabs." },
      { pain: "An attic that stays hot because the ridge never vents.", fix: "Ridge ventilation included with the new roof." },
      { pain: "Lifted edges on the side that faces the water.", fix: "Underlayment and new shingles on the slopes that take the wind." },
      { pain: "A repair that blows off the next storm.", fix: "The field replaced after someone has been on the roof." },
    ],
  }),
  photoJob({
    slug: "duplex-architectural-shingle-replacement",
    title: "Two-garage home with gray shingles",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-duplex-architectural-shingle-replacement.avif",
    coverAlt: "Two-garage home with gray architectural shingles and stone accents.",
    story: "A two-garage home with gray architectural shingles, stone at the garage, and a finished ridge. This is a completed replacement, the kind of roof you get after the old layer comes off.",
    rows: [
      { pain: "A wide roof over two garages that is past patching.", fix: "Tear-off and new architectural shingles across the whole house." },
      { pain: "A soft feel underfoot on the garage slope.", fix: "Deck checked, and bad plywood named on the estimate." },
      { pain: "Valleys full of granules.", fix: "New valleys with the shingles, not a smear of roof cement." },
      { pain: "Two shingle colors left from old repairs.", fix: "One product and one color for the house and both garages." },
    ],
  }),
  photoJob({
    slug: "condo-shingle-roof-replacement-finished",
    title: "Attached homes with dark shingles",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-condo-shingle-roof-replacement-finished.avif",
    coverAlt: "Attached homes with dark architectural shingles, stone columns, and white garage doors.",
    story: "Attached homes with dark architectural shingles, stone columns, and white garage doors. Each roof ties into the next, so the flashing and the valleys have to be part of the job, not an afterthought.",
    rows: [
      { pain: "A leak that shows up in one unit and starts in the roof you share.", fix: "Shingles, valleys, and flashing planned for the whole row." },
      { pain: "Water at a stone column where the roof dies into the wall.", fix: "Wall flashing redone with the new shingles." },
      { pain: "Each home patched on a different day.", fix: "One scope so the roofs match when the job is done." },
      { pain: "Ice backing up at a shared eave.", fix: "The eave looked at before anyone says the whole roof is finished." },
    ],
  }),
  photoJob({
    slug: "commercial-shingle-replacement",
    title: "Commercial shingle replacement",
    serviceLabel: "Commercial roofing",
    serviceSlug: "commercial-roofing",
    cover: "faber-roof-crew-commercial-shingle-replacement.avif",
    coverAlt: "Crew tearing off shingles on a retail building, with underlayment and roof vents.",
    story: "A retail building during a shingle tear-off. The crew is on the roof, underlayment is down, and the vents stay in the system. You keep the business in mind while the roof comes off and the new one goes on.",
    rows: [
      { pain: "A store or restaurant roof that is leaking over the people inside.", fix: "Tear-off, underlayment, and new shingles on a schedule you can post." },
      { pain: "The business cannot close for a week.", fix: "The date planned so the roof is not left open overnight." },
      { pain: "Vents pulled off and never put back.", fix: "Vents stay in the system with the new shingles." },
      { pain: "A price given from the parking lot.", fix: "Someone on the roof, then a written scope." },
    ],
    extra: [
      {
        src: "faber-roof-standing-seam-metal-roof-aerial.avif",
        alt: "Aerial view of a standing-seam metal roof with skylights on a brick building.",
      },
    ],
  }),
  photoJob({
    slug: "neighborhood-reroof",
    title: "Neighborhood home reroof",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-crew-reroofing-neighborhood-homes.avif",
    coverAlt: "Crew installing shingles on a house, with yellow underlayment on the roof next door.",
    story: "A crew installing shingles on a house in a neighborhood. Underlayment is down on the slope beside them so the deck is not left open. This is how a street of homes gets reroofed without a guess from the curb.",
    rows: [
      { pain: "A neighborhood roof that is open to the weather once the old shingles come off.", fix: "Underlayment the same day, then shingles." },
      { pain: "The deck left bare if the crew runs out of daylight.", fix: "The open slope covered before anyone leaves." },
      { pain: "A price copied from the house next door.", fix: "A written estimate for this roof, after a look." },
      { pain: "Nails and tear-off left in the yard.", fix: "Cleanup when the crew leaves. Homeowners have said it looked like they were never there." },
    ],
  }),
  photoJob({
    slug: "shingle-materials-on-site",
    title: "Gray shingles on a two-story house",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-shingle-replacement-materials-on-site.avif",
    coverAlt: "Finished gray architectural shingles on a two-story house, with plywood and a ladder still in the yard.",
    story: "Gray architectural shingles on a two-story house. The roof is on. The last of the job is still in the yard, which is the moment before cleanup. Homeowners have said the place looked like the crew was never there once that step was done.",
    rows: [
      { pain: "A two-story roof you cannot patch from a ladder and hope.", fix: "A full shingle roof, with the crew on the roof." },
      { pain: "Plywood and a ladder still in the yard when the shingles are on.", fix: "Cleanup is part of the job, not a favor at the end." },
      { pain: "A steep slope nobody wants to walk.", fix: "The estimate comes after someone has been up there." },
      { pain: "A ridge that was never capped right.", fix: "The ridge finished with the new shingles." },
    ],
  }),
  photoJob({
    slug: "shingle-bundles-on-house",
    title: "Shingle bundles on a house",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-shingle-roof-ridge-vents-closeup.avif",
    coverAlt: "Shingle bundles staged on the roof of a house before the new shingles go down.",
    story: "Shingle bundles are on the roof and underlayment is in the yard. That is the start of a replacement: materials on site, then tear-off, then the new roof. You are not waiting on a truck the morning of the job.",
    rows: [
      { pain: "A roof replacement that stalls because the shingles were never staged.", fix: "Bundles on the roof before the install." },
      { pain: "A truck that shows up empty the morning of tear-off.", fix: "Materials on site so the deck is not left open waiting." },
      { pain: "Underlayment still in the yard and no plan for the day.", fix: "Underlayment down, then shingles, in that order." },
      { pain: "You do not know which product is on the truck.", fix: "The product and color were named on the estimate before the bundles arrived." },
    ],
  }),
  photoJob({
    slug: "house-construction-site-with-lift",
    title: "Roof deck with a boom lift on site",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "house-construction-site-with-lift.avif",
    coverAlt:
      "Two-story home under construction with Carter house wrap, plywood on the roof, and an orange telehandler reaching a second-floor balcony where a worker stands.",
    story:
      "A new two-story home with plywood on the roof and Carter wrap on the walls. An orange telehandler reaches the upper balcony so the crew can work the steep lines without guessing from the ground. This is the kind of access you want before shingles go on.",
    rows: [
      { pain: "A tall gable nobody can reach safely from a ladder.", fix: "Lift access planned so the deck and edges get looked at before shingles." },
      { pain: "House wrap on but no one on the roof yet.", fix: "Deck sheathed first, then underlayment and shingles in order." },
      { pain: "Materials piled in the mud with no plan.", fix: "Lumber staged while the lift is on site for the upper work." },
      { pain: "You do not know when the roof will actually start.", fix: "A written schedule after someone has seen the slopes." },
    ],
  }),
  photoJob({
    slug: "modern-farmhouse-exterior-architecture",
    title: "Modern farmhouse with charcoal shingles",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "modern-farmhouse-exterior-architecture.avif",
    coverAlt:
      "Modern farmhouse at dusk with white siding, tan brick, black window trim, and a dark charcoal architectural shingle roof across multiple front gables.",
    story:
      "A modern farmhouse with white siding, tan brick at the base, and charcoal architectural shingles on every gable. The roof lines read clean from the street: matching ridges, black metal accents at the entries, and one shingle color across the wings.",
    imageNote: "Lighting and composition enhanced with AI",
    rows: [
      { pain: "A farmhouse design that needs the roof to match the architecture.", fix: "Charcoal architectural shingles across the main roof and the gables." },
      { pain: "Brick and siding that clash with a random shingle color.", fix: "A color picked to sit with the white siding and tan brick." },
      { pain: "Small gables that look patched next to a new main roof.", fix: "One product and one color for the whole front elevation." },
      { pain: "Metal porch roofs that do not line up with the shingle field.", fix: "Black metal accents planned where the roof meets the entries." },
    ],
  }),
  photoJob({
    slug: "residential-house-construction-site",
    title: "Plywood deck before shingles go on",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "residential-house-construction-site.avif",
    coverAlt:
      "Residential build with Carter-wrapped walls, plywood roof decking, and two orange telehandlers on a dirt lot while a worker stands at a front gable peak.",
    story:
      "A two-story house with plywood on the roof and Carter wrap on the walls. Two telehandlers sit on the lot while a worker is at the front gable peak. The deck is ready for underlayment and shingles — the step where you want a crew that shows up with a plan, not a patch later.",
    rows: [
      { pain: "Plywood sitting open after a rain because no one covered it.", fix: "Underlayment scheduled as soon as the deck is dry." },
      { pain: "A complex roofline with no one on the peaks.", fix: "Crew on the ridges before shingles lock the valleys." },
      { pain: "Equipment on site but the roof still waiting.", fix: "Materials and lifts lined up so tear-off and install stay on one schedule." },
      { pain: "A builder or homeowner unsure the roofer will return.", fix: "Written scope and dates before the first sheet of plywood is covered." },
    ],
  }),
  photoJob({
    slug: "house-construction-framing-and-roof-trusses",
    title: "Roof trusses going up",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "house-construction-framing-and-roof-trusses.avif",
    coverAlt:
      "Large home under construction with Carter house wrap, open and sheathed roof trusses, workers on the roof, and a crane setting a truss section.",
    story:
      "A big residential roof with trusses still open on one side and plywood on the other. Workers are on the peaks while a crane sets the next truss bay. When the framing is this complex, you want the roofing scope written before sheathing turns into shingles.",
    rows: [
      { pain: "A cut-up roofline with trusses that do not match the plan.", fix: "Someone on the structure before sheathing hides bad layout." },
      { pain: "Crane day scheduled but the valleys were never marked.", fix: "Valleys and ridges mapped while trusses are still visible." },
      { pain: "Half the roof sheathed and half open when weather moves in.", fix: "A sequence that covers open framing before the crew leaves." },
      { pain: "A builder waiting on a roofer who only quotes from photos.", fix: "A site look, then a written estimate for the full roof." },
    ],
  }),
  photoJob({
    slug: "house-under-construction-with-stone-veneer",
    title: "Stone ranch with a dark shingle roof",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "house-under-construction-with-stone-veneer.avif",
    coverAlt:
      "Single-story stone-veneer house under construction with a dark gray shingled roof, twin front gables, scaffolding at the entry, and plastic over the arched doorway.",
    story:
      "A single-story home with light stone veneer and a dark gray architectural shingle roof across two front gables. Scaffolding sits at the arched entry while windows are still wrapped. The roof is on early so the stone and trim can finish dry underneath.",
    rows: [
      { pain: "Stone and trim getting wet because the roof was left for last.", fix: "Shingles on before the long exterior punch list." },
      { pain: "Two front gables that need to match from the street.", fix: "One shingle color across both peaks, named on the estimate." },
      { pain: "A dark roof that fights the stone color.", fix: "Gray shingles chosen to sit with the light stone, not against it." },
      { pain: "Scaffolding at the entry with no plan for wall flashing.", fix: "Step flashing at the stone tied into the shingle system." },
    ],
  }),
];

export function jobsForArea(areaSlug: string): Job[] {
  return JOBS.filter((job) => job.areaSlug === areaSlug);
}

export function getJob(slug: string): Job | undefined {
  return JOBS.find((job) => job.slug === slug);
}
