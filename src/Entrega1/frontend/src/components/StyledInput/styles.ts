import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const InputWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const InputLabel = styled(Typography)({
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: palette.neutral.onSurfaceVariant,
  marginLeft: 4,
  fontFamily: "'Inter', sans-serif",
});

export const InputContainer = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const IconContainer = styled(Box)({
  position: "absolute",
  left: 16,
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
  color: palette.neutral.onSurfaceVariant,
  "& .material-symbols-outlined": {
    fontSize: 20,
  },
});

export const Input = styled("input")({
  width: "100%",
  paddingLeft: 44,
  paddingRight: 16,
  paddingTop: 14,
  paddingBottom: 14,
  backgroundColor: palette.neutral.surfaceContainerLowest,
  border: "none",
  borderRadius: 8,
  color: palette.neutral.onSurface,
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  outline: "none",
  transition: "box-shadow 0.2s ease",
  "&::placeholder": {
    color: `${palette.neutral.outline}`,
  },
  "&:focus": {
    boxShadow: `0 0 0 2px rgba(87, 222, 160, 0.5)`,
  },
});

export const ToggleButton = styled("button")({
  position: "absolute",
  right: 16,
  display: "flex",
  alignItems: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: palette.neutral.onSurfaceVariant,
  padding: 0,
  transition: "color 0.2s ease",
  "&:hover": {
    color: palette.neutral.onSurface,
  },
  "& .material-symbols-outlined": {
    fontSize: 20,
  },
});
