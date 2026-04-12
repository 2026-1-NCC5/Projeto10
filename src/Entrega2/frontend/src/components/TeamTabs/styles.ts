import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const TabsRoot = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  padding: 6,
  borderRadius: 14,
  backgroundColor: "rgba(13, 46, 55, 0.55)",
  border: `1px solid ${palette.neutral.outlineVariant}`,
  backdropFilter: "blur(8px)",
  marginBottom: 24,
});

export const TabButton = styled(ButtonBase)<{ active?: boolean }>(({ active }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 2,
  padding: "10px 18px",
  minWidth: 140,
  borderRadius: 10,
  backgroundColor: active ? palette.primary.container : "transparent",
  color: active ? palette.primary.onContainer : palette.neutral.onSurface,
  transition: "background-color 160ms ease, transform 160ms ease",
  "&:hover": {
    backgroundColor: active
      ? palette.primary.container
      : palette.neutral.surfaceContainerHigh,
  },
}));

export const TabLabel = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  textTransform: "none",
});

export const TabHint = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  opacity: 0.78,
});
