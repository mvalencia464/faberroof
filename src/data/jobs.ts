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

const unlabeled = {
  city: "",
  areaSlug: "",
  equipment: "TODO: not stated on the photo.",
  outcome: "TODO: completion details are not stated on the photo.",
  pain: "TODO: the photo has no caption.",
  fix: "Shown as a Faber Roof project photo only.",
};

function photoJob(input: {
  slug: string;
  title: string;
  serviceLabel: string;
  serviceSlug: string;
  cover: string;
  coverAlt: string;
  workPerformed: string;
  extra?: JobImage[];
}): Job {
  return {
    slug: input.slug,
    title: input.title,
    serviceLabel: input.serviceLabel,
    serviceSlug: input.serviceSlug,
    city: unlabeled.city,
    areaSlug: unlabeled.areaSlug,
    cover: input.cover,
    coverAlt: input.coverAlt,
    images: [{ src: input.cover, alt: input.coverAlt }, ...(input.extra ?? [])],
    caption: `${input.coverAlt} The file does not name the address.`,
    summary:
      "This image is published for Faber Roof. TODO: the property address and scope are not labeled on the photo.",
    analysis: {
      equipment: unlabeled.equipment,
      workPerformed: input.workPerformed,
      outcome: unlabeled.outcome,
    },
    rows: [{ pain: unlabeled.pain, fix: unlabeled.fix }],
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
    workPerformed: "The photo shows standing-seam metal panels and skylights on a brick building.",
  }),
  photoJob({
    slug: "two-story-home-shingle-roof",
    title: "Attached homes with shingle roofs",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-two-story-home-shingle-roof.avif",
    coverAlt: "Two-story attached homes with asphalt shingle roofs over the entries.",
    workPerformed: "The photo shows two-story attached homes with asphalt shingles over the entries.",
  }),
  photoJob({
    slug: "dark-architectural-shingles-brick-home",
    title: "Dark architectural shingles on a brick home",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-dark-architectural-shingles-brick-home.avif",
    coverAlt: "Brick house with dark gray architectural shingles and stone accents.",
    workPerformed: "The photo shows dark gray architectural shingles on a brick house with stone accents.",
  }),
  photoJob({
    slug: "lakefront-home-gray-shingle-roof",
    title: "Lakefront home with a gray shingle roof",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-lakefront-home-gray-shingle-roof.avif",
    coverAlt: "House beside the water with gray architectural shingles and a ridge vent.",
    workPerformed: "The photo shows gray architectural shingles and a ridge vent on a house beside the water.",
  }),
  photoJob({
    slug: "duplex-architectural-shingle-replacement",
    title: "Two-garage home with gray shingles",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-duplex-architectural-shingle-replacement.avif",
    coverAlt: "Two-garage home with gray architectural shingles and stone accents.",
    workPerformed: "The photo shows a finished gray architectural shingle roof on a two-garage home.",
  }),
  photoJob({
    slug: "condo-shingle-roof-replacement-finished",
    title: "Attached homes with dark shingles",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-condo-shingle-roof-replacement-finished.avif",
    coverAlt: "Attached homes with dark architectural shingles, stone columns, and white garage doors.",
    workPerformed: "The photo shows dark architectural shingles on attached homes.",
  }),
  photoJob({
    slug: "commercial-shingle-replacement",
    title: "Commercial shingle replacement",
    serviceLabel: "Commercial roofing",
    serviceSlug: "commercial-roofing",
    cover: "faber-roof-crew-commercial-shingle-replacement.avif",
    coverAlt: "Crew tearing off shingles on a retail building, with underlayment and roof vents.",
    workPerformed: "The photo shows a crew on a retail building during a shingle tear-off, with underlayment and roof vents.",
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
    workPerformed: "The photo shows a crew installing shingles on one house. Yellow underlayment is on the roof beside it.",
  }),
  photoJob({
    slug: "new-construction-roof-crane",
    title: "New houses getting shingles",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-new-construction-roof-install-crane.avif",
    coverAlt: "Boom truck loading shingles onto new houses still wrapped in sheathing.",
    workPerformed: "The photo shows a boom truck lifting shingles onto new houses. The walls are still in sheathing.",
  }),
  photoJob({
    slug: "shingle-materials-on-site",
    title: "Gray shingles on a two-story house",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-shingle-replacement-materials-on-site.avif",
    coverAlt: "Finished gray architectural shingles on a two-story house, with plywood and a ladder still in the yard.",
    workPerformed: "The photo shows a finished gray architectural shingle roof. Plywood and a ladder are still in the yard.",
  }),
  photoJob({
    slug: "shingle-bundles-on-house",
    title: "Shingle bundles on a house",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-shingle-roof-ridge-vents-closeup.avif",
    coverAlt:
      "Medium shot of a house with shingle bundles stacked on the roof. The filename says ridge vents; the photo is not a close-up of ridge vents.",
    workPerformed:
      "The filename says ridge vents. The photo is a medium shot of a house with shingle bundles on the roof, not a close-up of ridge vents.",
  }),
];

export function jobsForArea(areaSlug: string): Job[] {
  return JOBS.filter((job) => job.areaSlug === areaSlug);
}

export function getJob(slug: string): Job | undefined {
  return JOBS.find((job) => job.slug === slug);
}
