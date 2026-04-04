import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const CardRoot = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "20px 24px",
  background: `linear-gradient(135deg, rgba(0, 31, 39, 0.8) 0%, rgba(1, 35, 44, 0.9) 100%)`,
  backdropFilter: "blur(20px)",
  borderRadius: 12,
  border: `1px solid rgba(61, 74, 65, 0.15)`,
});

export const CardIconBox = styled(Box)({
  width: 44,
  height: 44,
  borderRadius: 10,
  backgroundColor: "rgba(87, 222, 160, 0.08)",
  border: `1px solid rgba(87, 222, 160, 0.12)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "& .material-symbols-outlined": {
    fontSize: 22,
    color: palette.primary.main,
  },
});

export const CardBody = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const CardName = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  color: palette.neutral.onSurface,
  marginBottom: 2,
});

export const CardDescription = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  marginBottom: 4,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const CardMeta = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.outline,
});

export const JoinedBadge = styled(Box)({
  padding: "6px 14px",
  borderRadius: 20,
  backgroundColor: "rgba(87, 222, 160, 0.1)",
  color: palette.primary.main,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  flexShrink: 0,
});
