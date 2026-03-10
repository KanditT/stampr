import { StampStyle } from "../types";

export const generateStampLore = (
  locationName: string,
  style: StampStyle,
): string => {
  return `เสียงสะท้อนจากห้อง ${locationName} ในรูปแบบ ${style} ที่ยังคงก้องกังวานในใจ`;
};
