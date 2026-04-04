import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const BlockRoot = styled(Box)({
  flex: 1,
  minWidth: 180,
  background: `linear-gradient(135deg, rgba(0, 31, 39, 0.8) 0%, rgba(1, 35, 44, 0.9) 100%)`,
  backdropFilter: "blur(20px)",
  borderRadius: 12,
  border: `1px solid rgba(61, 74, 65, 0.15)`,
  padding: 24,
  display: "flex",
  flexDirection: "column",
});

export const BlockHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
});

export const BlockIconBox = styled(Box)({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: "rgba(87, 222, 160, 0.1)",
  border: `1px solid rgba(87, 222, 160, 0.12)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .material-symbols-outlined": {
    fontSize: 20,
    color: palette.primary.main,
  },
});

export const BlockTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 16,
  color: palette.neutral.onSurface,
});

export const FieldsColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  flex: 1,
});

export const BlockFooter = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 16,
});

export const AddButton = styled(ButtonBase)<{ disabled?: boolean }>(
  ({ disabled }) => ({
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: disabled ? palette.neutral.surfaceContainerHigh : palette.primary.container,
    color: disabled ? palette.neutral.onSurfaceVariant : palette.primary.onContainer,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease, opacity 0.2s ease, transform 0.1s ease",
    pointerEvents: disabled ? "none" : "auto",
    "&:hover": {
      filter: disabled ? "none" : "brightness(1.1)",
    },
    "&:active": {
      transform: disabled ? "none" : "scale(0.93)",
    },
    "& .material-symbols-outlined": {
      fontSize: 20,
    },
  })
);
