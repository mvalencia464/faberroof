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
    coverAlt: "Aerial view of a standing-seam metal roof with skylights.",
    workPerformed: "The photo shows a standing-seam metal roof with skylights.",
  }),
  photoJob({
    slug: "two-story-home-shingle-roof",
    title: "Two-story home shingle roof",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-two-story-home-shingle-roof.avif",
    coverAlt: "Two-story home with a completed asphalt shingle roof.",
    workPerformed: "The photo shows a two-story house with asphalt shingles in place.",
  }),
  photoJob({
    slug: "dark-architectural-shingles-brick-home",
    title: "Dark architectural shingles on a brick home",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-dark-architectural-shingles-brick-home.avif",
    coverAlt: "Brick home with dark architectural shingles.",
    workPerformed: "The photo shows dark architectural shingles on a brick house.",
  }),
  photoJob({
    slug: "lakefront-home-gray-shingle-roof",
    title: "Lakefront home with a gray shingle roof",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-lakefront-home-gray-shingle-roof.avif",
    coverAlt: "Lakefront house with a gray asphalt shingle roof.",
    workPerformed: "The photo shows a house beside the water with gray asphalt shingles.",
  }),
  photoJob({
    slug: "duplex-architectural-shingle-replacement",
    title: "Duplex architectural shingle replacement",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-duplex-architectural-shingle-replacement.avif",
    coverAlt: "Duplex with architectural shingles during a roof replacement.",
    workPerformed: "The photo shows a duplex while architectural shingles are being replaced.",
  }),
  photoJob({
    slug: "condo-shingle-roof-replacement-finished",
    title: "Finished condo shingle roof",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-condo-shingle-roof-replacement-finished.avif",
    coverAlt: "Finished shingle roof on a condominium building.",
    workPerformed: "The photo shows a condominium after a shingle roof replacement.",
  }),
  photoJob({
    slug: "commercial-shingle-replacement",
    title: "Commercial shingle replacement",
    serviceLabel: "Commercial roofing",
    serviceSlug: "commercial-roofing",
    cover: "faber-roof-crew-commercial-shingle-replacement.avif",
    coverAlt: "Crew replacing shingles on a commercial building.",
    workPerformed: "The photo shows a crew replacing shingles on a commercial building.",
    extra: [
      {
        src: "faber-roof-new-construction-roof-install-crane.avif",
        alt: "Crane setting roof materials during a new-construction roof install.",
      },
    ],
  }),
  photoJob({
    slug: "neighborhood-reroof",
    title: "Neighborhood home reroof",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-crew-reroofing-neighborhood-homes.avif",
    coverAlt: "Crew reroofing homes along a neighborhood street.",
    workPerformed: "The photo shows a crew reroofing houses in a residential neighborhood.",
  }),
  photoJob({
    slug: "winter-roof-installation",
    title: "Winter roof installation",
    serviceLabel: "Residential roofing",
    serviceSlug: "residential-roofing",
    cover: "faber-roof-crew-winter-roof-installation.avif",
    coverAlt: "Crew installing a roof in winter, with snow on the ground.",
    workPerformed: "The photo shows a crew installing a roof with snow on the ground.",
  }),
  photoJob({
    slug: "new-construction-roof-crane",
    title: "New-construction roof install",
    serviceLabel: "Commercial roofing",
    serviceSlug: "commercial-roofing",
    cover: "faber-roof-new-construction-roof-install-crane.avif",
    coverAlt: "Crane setting roof materials during a new-construction roof install.",
    workPerformed: "The photo shows a crane placing materials for a new-construction roof.",
  }),
  photoJob({
    slug: "shingle-materials-on-site",
    title: "Shingle materials on site",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    cover: "faber-roof-shingle-replacement-materials-on-site.avif",
    coverAlt: "Shingle bundles and roofing materials staged on site for a replacement.",
    workPerformed: "The photo shows shingle bundles and other roofing materials staged at the job.",
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
