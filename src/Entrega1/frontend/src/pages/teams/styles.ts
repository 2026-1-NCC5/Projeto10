import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const TeamsRoot = styled(Box)({
  position: "relative",
  zIndex: 1,
});

export const PageTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 28,
  color: palette.neutral.onSurface,
  marginBottom: 8,
});

export const PageSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  marginBottom: 32,
});

export const TeamsList = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const EmptyIcon = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: 16,
  backgroundColor: "rgba(87, 222, 160, 0.08)",
  border: `1px solid rgba(87, 222, 160, 0.2)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
  "& .material-symbols-outlined": {
    fontSize: 32,
    color: palette.primary.main,
  },
});

export const EmptyText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  textAlign: "center",
  lineHeight: 1.6,
});
