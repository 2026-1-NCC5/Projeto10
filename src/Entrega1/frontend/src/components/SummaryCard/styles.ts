import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const CardRoot = styled(Box)({
  background: `linear-gradient(135deg, rgba(0, 31, 39, 0.8) 0%, rgba(1, 35, 44, 0.9) 100%)`,
  backdropFilter: "blur(20px)",
  borderRadius: 12,
  border: `1px solid rgba(61, 74, 65, 0.15)`,
  padding: 20,
  flex: 1,
  minWidth: 160,
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const CardIconBox = styled(Box)({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: "rgba(87, 222, 160, 0.1)",
  border: `1px solid rgba(87, 222, 160, 0.15)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .material-symbols-outlined": {
    fontSize: 20,
    color: palette.primary.main,
  },
});

export const CardValue = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 28,
  color: palette.primary.main,
  lineHeight: 1,
});

export const CardLabel = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  lineHeight: 1.4,
});
