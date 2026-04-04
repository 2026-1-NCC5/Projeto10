import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const BannerRoot = styled(Box)({
  background: "rgba(0, 171, 114, 0.06)",
  border: `1px solid ${palette.primary.container}`,
  borderRadius: 12,
  padding: "20px 24px",
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
});

export const BannerIconBox = styled(Box)({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: "rgba(0, 171, 114, 0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "& .material-symbols-outlined": {
    fontSize: 22,
    color: palette.primary.container,
  },
});

export const BannerTextGroup = styled(Box)({
  flex: 1,
});

export const BannerTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  color: palette.neutral.onSurface,
  marginBottom: 2,
});

export const BannerText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  lineHeight: 1.5,
});
