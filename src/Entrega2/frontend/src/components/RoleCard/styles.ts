import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const CardButton = styled(ButtonBase)<{ selected?: boolean }>(
  ({ selected }) => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    padding: 32,
    borderRadius: 12,
    backgroundColor: selected
      ? palette.neutral.surfaceContainerHigh
      : palette.neutral.surfaceContainerLow,
    border: `2px solid ${selected ? palette.primary.main : "transparent"}`,
    boxShadow: selected ? `0 0 0 2px ${palette.primary.main}` : "none",
    transition: "all 0.3s ease",
    cursor: "pointer",
    width: "100%",
    "&:hover": {
      backgroundColor: palette.neutral.surfaceContainerHigh,
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: `0 0 0 2px rgba(87, 222, 160, 0.5)`,
    },
  })
);

export const IconWrapper = styled(Box)<{ selected?: boolean }>(
  ({ selected }) => ({
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: selected
      ? "rgba(87, 222, 160, 0.2)"
      : palette.neutral.surfaceContainerHighest,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    transition: "transform 0.3s ease",
    "& .material-symbols-outlined": {
      fontSize: 30,
      color: palette.primary.main,
    },
    ".MuiButtonBase-root:hover &": {
      transform: "scale(1.1)",
    },
  })
);

export const CardTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 20,
  color: palette.neutral.onSurface,
  marginBottom: 8,
});

export const CardDescription = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: palette.neutral.onSurfaceVariant,
});

export const CheckIcon = styled(Box)({
  position: "absolute",
  top: 16,
  right: 16,
  "& .material-symbols-outlined": {
    fontSize: 24,
    color: palette.primary.main,
    fontVariationSettings: "'FILL' 1",
  },
});
