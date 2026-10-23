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
  pain: string;
  fix: string;
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
    rows: [{ pain: input.pain, fix: input.fix }],
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
    pain: "Another shingle roof on a building that keeps leaking.",
    fix: "Standing-seam metal, after someone looks and writes the estimate.",
  }),
  photoJob({
    slug: "two-story-home-shingle-roof",
    title: "Attached homes with shingle roofs",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-two-story-home-shingle-roof.avif",
    coverAlt: "Two-story attached homes with asphalt shingle roofs over the entries.",
    story: "These attached homes have asphalt shingles over the entries and the main slopes. You get the same kind of roof on a house or a row of homes: old shingles off, new shingles on, price in writing first.",
    pain: "Shared roofs and entry roofs that leak into more than one home.",
    fix: "A look at each slope, then a written estimate for the shingles.",
  }),
  photoJob({
    slug: "dark-architectural-shingles-brick-home",
    title: "Dark architectural shingles on a brick home",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-dark-architectural-shingles-brick-home.avif",
    coverAlt: "Brick house with dark gray architectural shingles and stone accents.",
    story: "Dark gray architectural shingles on a brick house with stone accents. The lines are straight, the ridges are finished, and the roof reads as one system instead of a patchwork.",
    pain: "A brick house with worn shingles that no longer match the rest of the home.",
    fix: "Architectural shingles in a color named on the estimate.",
  }),
  photoJob({
    slug: "lakefront-home-gray-shingle-roof",
    title: "Lakefront home with a gray shingle roof",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-lakefront-home-gray-shingle-roof.avif",
    coverAlt: "House beside the water with gray architectural shingles and a ridge vent.",
    story: "A house on the water with gray architectural shingles and a ridge vent. Lake lots take wind. The roof has to be a full system, not a few replaced tabs.",
    pain: "A lake house whose shingles are open to the wind off the water.",
    fix: "A full shingle roof with ridge ventilation, after a look.",
  }),
  photoJob({
    slug: "duplex-architectural-shingle-replacement",
    title: "Two-garage home with gray shingles",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-duplex-architectural-shingle-replacement.avif",
    coverAlt: "Two-garage home with gray architectural shingles and stone accents.",
    story: "A two-garage home with gray architectural shingles, stone at the garage, and a finished ridge. This is a completed replacement, the kind of roof you get after the old layer comes off.",
    pain: "A wide roof over two garages that is past patching.",
    fix: "Tear-off and new architectural shingles across the whole house.",
  }),
  photoJob({
    slug: "condo-shingle-roof-replacement-finished",
    title: "Attached homes with dark shingles",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-condo-shingle-roof-replacement-finished.avif",
    coverAlt: "Attached homes with dark architectural shingles, stone columns, and white garage doors.",
    story: "Attached homes with dark architectural shingles, stone columns, and white garage doors. Each roof ties into the next, so the flashing and the valleys have to be part of the job, not an afterthought.",
    pain: "A leak that shows up in one unit and starts in the roof you share.",
    fix: "Shingles, valleys, and flashing planned for the whole row.",
  }),
  photoJob({
    slug: "commercial-shingle-replacement",
    title: "Commercial shingle replacement",
    serviceLabel: "Commercial roofing",
    serviceSlug: "commercial-roofing",
    cover: "faber-roof-crew-commercial-shingle-replacement.avif",
    coverAlt: "Crew tearing off shingles on a retail building, with underlayment and roof vents.",
    story: "A retail building during a shingle tear-off. The crew is on the roof, underlayment is down, and the vents stay in the system. You keep the business in mind while the roof comes off and the new one goes on.",
    pain: "A store or restaurant roof that is leaking over the people inside.",
    fix: "Tear-off, underlayment, and new shingles on a schedule you can post.",
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
    pain: "A neighborhood roof that is open to the weather once the old shingles come off.",
    fix: "Underlayment the same day, then shingles, then cleanup.",
  }),
  photoJob({
    slug: "new-construction-roof-crane",
    title: "New houses getting shingles",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-new-construction-roof-install-crane.avif",
    coverAlt: "Boom truck loading shingles onto new houses still wrapped in sheathing.",
    story: "New houses still in sheathing, with a boom truck setting shingles on the roof. If you are building, the roof can go on while the walls are still being closed in.",
    pain: "A new house waiting on shingles while the rest of the build moves.",
    fix: "Shingles loaded to the roof and installed as the house is dried in.",
  }),
  photoJob({
    slug: "shingle-materials-on-site",
    title: "Gray shingles on a two-story house",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-shingle-replacement-materials-on-site.avif",
    coverAlt: "Finished gray architectural shingles on a two-story house, with plywood and a ladder still in the yard.",
    story: "Gray architectural shingles on a two-story house. The roof is on. The last of the job is still in the yard, which is the moment before cleanup. Homeowners have said the place looked like the crew was never there once that step was done.",
    pain: "A two-story roof you cannot patch from a ladder and hope.",
    fix: "A full shingle roof, then the yard cleared.",
  }),
  photoJob({
    slug: "shingle-bundles-on-house",
    title: "Shingle bundles on a house",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-shingle-roof-ridge-vents-closeup.avif",
    coverAlt: "Shingle bundles staged on the roof of a house before the new shingles go down.",
    story: "Shingle bundles are on the roof and underlayment is in the yard. That is the start of a replacement: materials on site, then tear-off, then the new roof. You are not waiting on a truck the morning of the job.",
    pain: "A roof replacement that stalls because the shingles were never staged.",
    fix: "Bundles on the roof, then the install.",
  }),
];

export function jobsForArea(areaSlug: string): Job[] {
  return JOBS.filter((job) => job.areaSlug === areaSlug);
}

export function getJob(slug: string): Job | undefined {
  return JOBS.find((job) => job.slug === slug);
}
