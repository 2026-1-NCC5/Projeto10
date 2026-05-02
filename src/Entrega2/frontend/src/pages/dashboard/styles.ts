import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";

import { palette } from "../../theme/palette";


export const DashboardRoot = styled(Box)({
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
  marginBottom: 24,
});

export const ChartsGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
  marginBottom: 24,
});

export const ChartPanel = styled(Box)({
  padding: 16,
  minHeight: 320,
});

export const ChartTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 16,
  color: palette.neutral.onSurface,
  marginBottom: 12,
});

export const SectionHeader = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 22,
  color: palette.neutral.onSurface,
  marginBottom: 12,
  marginTop: 8,
});

export const ComparisonTable = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 1,
});

export const ComparisonHeaderRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr 1.2fr 1fr 120px",
  gap: 8,
  padding: "10px 12px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: palette.neutral.onSurfaceVariant,
  borderBottom: `1px solid ${palette.neutral.outlineVariant}`,
});

export const ComparisonRow = styled(Box)<{ mismatch?: boolean }>(
  ({ mismatch }) => ({
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr 1.2fr 1fr 120px",
    gap: 8,
    padding: "14px 12px",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: palette.neutral.onSurface,
    backgroundColor: mismatch ? "rgba(235, 112, 111, 0.08)" : "transparent",
    borderLeft: mismatch
      ? `3px solid ${palette.tertiary.main}`
      : "3px solid transparent",
    borderBottom: `1px solid rgba(61, 74, 65, 0.12)`,
  })
);

export const StatusPill = styled(Box)<{ ok: boolean }>(({ ok }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  color: ok ? palette.primary.main : palette.tertiary.main,
  backgroundColor: ok ? "rgba(87, 222, 160, 0.1)" : "rgba(235, 112, 111, 0.12)",
}));

export const EvidenceButton = styled(ButtonBase)({
  padding: "6px 12px",
  borderRadius: 6,
  backgroundColor: palette.neutral.surfaceContainerHigh,
  color: palette.neutral.onSurface,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 500,
  "&:hover": {
    backgroundColor: palette.neutral.surfaceContainerHighest,
  },
});

export const TeamContextLabel = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 12px",
  borderRadius: 8,
  backgroundColor: "rgba(87, 222, 160, 0.1)",
  color: palette.primary.main,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
  "& .material-symbols-outlined": { fontSize: 18 },
});

export const MetricsGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
  marginBottom: 24,
});
