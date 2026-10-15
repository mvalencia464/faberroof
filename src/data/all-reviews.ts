import type { ImageMetadata } from 'astro';
import googleReviewsJson from './google-reviews.json';
import { SITE } from '../config/site';

export type MockReview = {
  date: string;
  text: string;
  author: string;
  rating: number;
  source?: string;
  location?: string;
  avatarUrl?: string;
  /** Customer-uploaded or project photos. */
  images?: string[];
  reviewUrl?: string;
};

type RawReview = {
  author?: string;
  text?: string;
  rating?: number;
  date?: string;
  location?: string;
  avatarUrl?: string;
  images?: string[];
  source?: string;
  reviewUrl?: string;
};

const avatarModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/avatars/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

const reviewImageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/review-images/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

function assetSrc(
  modules: Record<string, { default: ImageMetadata }>,
  filename: string,
): string {
  if (!filename) return '';
  if (/^https?:\/\//i.test(filename) || filename.startsWith('/')) {
    return filename;
  }
  const match = Object.entries(modules).find(([path]) =>
    path.endsWith(`/${filename}`),
  );
  return match?.[1].default.src ?? '';
}

function normalizeReview(raw: RawReview): MockReview | null {
  const text = (raw.text ?? '').trim();
  if (!text) return null;

  const images = (raw.images ?? [])
    .map((file) => assetSrc(reviewImageModules, file))
    .filter(Boolean);

  return {
    author: (raw.author ?? '').trim() || 'Google User',
    text,
    rating: typeof raw.rating === 'number' ? raw.rating : 5,
    date: (raw.date ?? '').trim() || 'Recent',
    location: raw.location?.trim() || undefined,
    avatarUrl: assetSrc(avatarModules, raw.avatarUrl ?? '') || undefined,
    images: images.length > 0 ? images : undefined,
    source: raw.source ?? 'Google',
    reviewUrl: raw.reviewUrl ?? SITE.googleReviews.profileUrl,
  };
}

const rawList: RawReview[] = Array.isArray(googleReviewsJson.rawReviews)
  ? googleReviewsJson.rawReviews
  : [];

export const allGoogleReviews: MockReview[] = rawList
  .map(normalizeReview)
  .filter((r): r is MockReview => r !== null);

export const mockReviews: MockReview[] = allGoogleReviews;

export const syncedReviewMeta = {
  rating:
    typeof googleReviewsJson.rating === 'number'
      ? googleReviewsJson.rating
      : SITE.googleReviews.rating,
  count:
    typeof googleReviewsJson.reviewsCount === 'number'
      ? googleReviewsJson.reviewsCount
      : SITE.googleReviews.count,
  businessName:
    googleReviewsJson.businessName ?? SITE.googleReviews.businessName,
};
