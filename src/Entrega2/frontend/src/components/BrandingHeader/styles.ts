import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const HeaderContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  marginBottom: 40,
});

export const IconBox = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: palette.neutral.surfaceContainerHighest,
  marginBottom: 24,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  "& .material-symbols-outlined": {
    fontSize: 36,
    color: palette.primary.main,
  },
});

export const Title = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 30,
  letterSpacing: "-0.02em",
  color: palette.neutral.onSurface,
  marginBottom: 8,
});

export const Subtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: 14,
  letterSpacing: "0.05em",
  color: palette.neutral.onSurfaceVariant,
  textTransform: "uppercase",
});
