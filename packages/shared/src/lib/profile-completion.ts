export interface ProfileExtras {
  phone?: string;
  country?: string;
  city?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  legalStatus?: string;
  rccmNumber?: string;
  taxNumber?: string;
  address?: string;
  experienceYears?: number;
  sectorsOfInterest?: string[];
  investmentCapacity?: string;
  bankName?: string;
  bankIban?: string;
}

export function calculateProfileScore(user?: any, extras?: ProfileExtras): number {
  if (!user) return 0;
  let score = 20; // base score for account creation
  if (user.name) score += 15;
  if (user.email) score += 15;
  if (user.title) score += 10;
  if (user.bio) score += 10;
  if (extras?.phone) score += 10;
  if (extras?.country || extras?.city) score += 10;
  if (extras?.rccmNumber || extras?.linkedin) score += 10;
  return Math.min(100, score);
}
