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
  };
}

/**
 * Filenames that returned HTTP 200 on the Faber Roof media folder.
 * Paths stay relative so r2img() can prefix the public base. Addresses are not printed on the files.
 */
export const JOBS: Job[] = [
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
];

export function jobsForArea(areaSlug: string): Job[] {
  return JOBS.filter((job) => job.areaSlug === areaSlug);
}

export function getJob(slug: string): Job | undefined {
  return JOBS.find((job) => job.slug === slug);
}
