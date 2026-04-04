import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const PageRoot = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
});

export const PlaceholderIcon = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: 16,
  backgroundColor: "rgba(87, 222, 160, 0.08)",
  border: `1px solid rgba(87, 222, 160, 0.2)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
  margin: "0 auto 24px",
  "& .material-symbols-outlined": {
    fontSize: 32,
    color: palette.primary.main,
  },
});

export const PlaceholderTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 22,
  color: palette.neutral.onSurface,
  textAlign: "center",
  marginBottom: 8,
});

export const PlaceholderSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  textAlign: "center",
  lineHeight: 1.6,
});
