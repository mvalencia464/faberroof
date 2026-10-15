export type JobFixRow = {
  pain: string;
  fix: string;
};

export type Job = {
  slug: string;
  title: string;
  serviceLabel: string;
  serviceSlug: string;
  city: string;
  areaSlug: string;
  cover: string;
  images: string[];
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

/**
 * Photos that returned HTTP 200 on media.stokeleads.com/faberroof/.
 * The public bucket listing is not available. Job addresses are not printed on the files.
 */
export const JOBS: Job[] = [
  {
    slug: "standing-seam-metal-roof",
    title: "Standing-seam metal roof",
    serviceLabel: "Metal roofing",
    serviceSlug: "metal-roofing",
    city: "TODO: job city not labeled",
    areaSlug: "",
    cover: "faber-roof-standing-seam-metal-roof-aerial.avif",
    images: ["faber-roof-standing-seam-metal-roof-aerial.avif"],
    caption:
      "Aerial photo of a standing-seam metal roof. The file does not name the address.",
    summary:
      "This image is published for Faber Roof. TODO: the property address and scope are not labeled on the photo.",
    analysis: {
      equipment: "TODO: not stated.",
      workPerformed: "The photo shows a standing-seam metal roof with skylights.",
      outcome: "TODO: completion details are not stated on the photo.",
    },
    rows: [
      {
        pain: "TODO: the photo has no caption.",
        fix: "Shown as a Faber Roof project photo only.",
      },
    ],
  },
  {
    slug: "shingle-roof-project",
    title: "Shingle roof project",
    serviceLabel: "Shingle roofing",
    serviceSlug: "shingle-roofing",
    city: "TODO: job city not labeled",
    areaSlug: "",
    cover: "faber-roof-shingle-roof-ridge-vents-closeup.avif",
    images: ["faber-roof-shingle-roof-ridge-vents-closeup.avif"],
    caption:
      "Medium shot of a house with shingle bundles on the roof. The filename says ridge vents; the photo is not a close-up of ridge vents. Address not labeled.",
    summary:
      "This image is published for Faber Roof. TODO: the property address and scope are not labeled on the photo.",
    analysis: {
      equipment: "TODO: not stated. Shingle bundles are visible on the roof.",
      workPerformed: "TODO: the photo does not say whether the roof was finished.",
      outcome: "TODO: not stated.",
    },
    rows: [
      {
        pain: "TODO: the photo has no caption.",
        fix: "Shown as a Faber Roof project photo only.",
      },
    ],
  },
];

export function jobsForArea(areaSlug: string): Job[] {
  return JOBS.filter((job) => job.areaSlug === areaSlug);
}

export function getJob(slug: string): Job | undefined {
  return JOBS.find((job) => job.slug === slug);
}
