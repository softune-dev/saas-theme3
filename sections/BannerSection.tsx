"use client";

import React from "react";

interface BannerSectionProps {
  announcementItems: string[];
  announcementDivider: string;
}

export function BannerSection(_props: BannerSectionProps) {
  // Fashion Classic already shows this ticker in the header AnnouncementBar.
  // Rendering it again as a landing section duplicates the same copy under
  // Events — keep the SectionRenderer mapping, skip the second visual.
  return null;
}
