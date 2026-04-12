import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const HistoryRoot = styled(Box)({
  marginTop: 16,
});

export const HistoryHeader = styled(Box)({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 12,
  gap: 12,
  flexWrap: "wrap",
});

export const HistoryTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 18,
  color: palette.neutral.onSurface,
});

export const HistoryHint = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.onSurfaceVariant,
});

export const HistoryTable = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

export const HistoryHeaderRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1.4fr 1.2fr 0.8fr 0.8fr 1.2fr",
  gap: 8,
  padding: "12px 14px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: palette.neutral.onSurfaceVariant,
  borderBottom: `1px solid ${palette.neutral.outlineVariant}`,
});

export const HistoryRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1.4fr 1.2fr 0.8fr 0.8fr 1.2fr",
  gap: 8,
  padding: "12px 14px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurface,
  borderBottom: `1px solid rgba(61, 74, 65, 0.18)`,
});

export const EmptyState = styled(Box)({
  padding: 24,
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
});
