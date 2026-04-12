import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const CardRoot = styled(Box)({
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  position: "relative",
});

export const IconWrap = styled(Box)({
  width: 36,
  height: 36,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(87, 222, 160, 0.12)",
  color: palette.primary.main,
  marginBottom: 6,
  "& .material-symbols-outlined": {
    fontSize: 22,
  },
});

export const CardLabel = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: palette.neutral.onSurfaceVariant,
});

export const CardValue = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 34,
  color: palette.neutral.onSurface,
  lineHeight: 1.2,
});

export const CardHint = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.onSurfaceVariant,
});
