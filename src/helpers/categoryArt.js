import { appUrl } from '../core/base';

// The catalogue carries no image; each category keeps the plate photo the
// approved design gives it. The URLs stay under the mount the build runs on.
export const CATEGORY_ART = {
  cpu: appUrl('assets/img/cpu-2.webp'),
  motherboard: appUrl('assets/img/mb-1.webp'),
  ram: appUrl('assets/img/ram-1.webp'),
  storage: appUrl('assets/img/ssd-1.webp'),
  gpu: appUrl('assets/img/hero.webp'),
  psu: appUrl('assets/img/psu-3.webp'),
  case: appUrl('assets/img/case-1.webp'),
};
