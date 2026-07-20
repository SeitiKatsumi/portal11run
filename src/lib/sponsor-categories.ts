export const sponsorCategories = ["Realização", "Apoio", "Patrocinadores Master", "Patrocinadores"] as const;

export type SponsorCategory = (typeof sponsorCategories)[number];
