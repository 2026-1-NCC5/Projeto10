import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const TableContainer = styled(Box)({
  background: `linear-gradient(135deg, rgba(0, 31, 39, 0.8) 0%, rgba(1, 35, 44, 0.9) 100%)`,
  backdropFilter: "blur(20px)",
  borderRadius: 12,
  border: `1px solid rgba(61, 74, 65, 0.15)`,
  overflow: "hidden",
});

export const TableTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 16,
  color: palette.neutral.onSurface,
  padding: "20px 24px 0",
  marginBottom: 16,
});

export const TableHeader = styled(Box)({
  display: "flex",
  padding: "10px 24px",
  backgroundColor: palette.neutral.surfaceContainerHigh,
  borderBottom: `1px solid ${palette.neutral.outlineVariant}`,
  gap: 16,
});

export const TableHeaderCell = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.neutral.onSurfaceVariant,
  flex: 1,
});

export const TableRow = styled(Box)({
  display: "flex",
  padding: "14px 24px",
  borderBottom: `1px solid rgba(61, 74, 65, 0.1)`,
  gap: 16,
  alignItems: "center",
  transition: "background-color 0.15s ease",
  "&:last-child": {
    borderBottom: "none",
  },
  "&:hover": {
    backgroundColor: palette.neutral.surfaceContainerLow,
  },
});

export const TableCell = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurface,
  flex: 1,
});

export const ItemBadge = styled(Box)<{ itemtype?: string }>(({ itemtype }) => {
  const colorMap: Record<string, { bg: string; color: string }> = {
    Arroz: { bg: "rgba(87, 222, 160, 0.1)", color: "#57DEA0" },
    Feijao: { bg: "rgba(255, 179, 176, 0.1)", color: "#FFB3B0" },
    Outros: { bg: "rgba(198, 198, 199, 0.1)", color: "#C6C6C7" },
  };
  const style = colorMap[itemtype ?? ""] ?? colorMap["Outros"];
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 20,
    backgroundColor: style.bg,
    color: style.color,
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 600,
  };
});

export const EmptyState = styled(Box)({
  padding: "40px 24px",
  textAlign: "center",
  color: palette.neutral.onSurfaceVariant,
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
});
