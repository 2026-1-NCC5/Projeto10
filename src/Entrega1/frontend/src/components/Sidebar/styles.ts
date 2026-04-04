import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const SIDEBAR_WIDTH = 240;

export const SidebarRoot = styled(Box)({
  width: SIDEBAR_WIDTH,
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 10,
  background: "rgba(1, 35, 44, 0.97)",
  backdropFilter: "blur(20px)",
  borderRight: `1px solid ${palette.neutral.outlineVariant}`,
  display: "flex",
  flexDirection: "column",
  padding: "24px 12px",
});

export const BrandSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "4px 8px",
  marginBottom: 40,
});

export const BrandIconBox = styled(Box)({
  width: 44,
  height: 44,
  borderRadius: 10,
  flexShrink: 0,
  background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.container} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .material-symbols-outlined": {
    fontSize: 24,
    color: palette.primary.onContainer,
  },
});

export const BrandTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 16,
  color: palette.neutral.onSurface,
  lineHeight: 1.2,
});

export const BrandSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.onSurfaceVariant,
  lineHeight: 1.3,
});

export const NavSection = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const NavItem = styled(ButtonBase)<{ active?: boolean }>(
  ({ active }) => ({
    width: "100%",
    padding: "14px 14px",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    gap: 14,
    justifyContent: "flex-start",
    backgroundColor: active ? "rgba(87, 222, 160, 0.12)" : "transparent",
    color: active ? palette.primary.main : palette.neutral.onSurfaceVariant,
    transition: "background-color 0.2s ease, color 0.2s ease",
    "&:hover": {
      backgroundColor: active
        ? "rgba(87, 222, 160, 0.16)"
        : palette.neutral.surfaceContainerHigh,
      color: active ? palette.primary.main : palette.neutral.onSurface,
    },
    "& .material-symbols-outlined": {
      fontSize: 24,
      fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
    },
  })
);

export const NavItemText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1,
});

export const NavSectionDivider = styled(Box)({
  height: 1,
  backgroundColor: palette.neutral.outlineVariant,
  margin: "8px 0",
  opacity: 0.5,
});

export const BottomSection = styled(Box)({
  borderTop: `1px solid ${palette.neutral.outlineVariant}`,
  paddingTop: 12,
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

export const ProfileEditContainer = styled(Box)({
  padding: "12px",
  borderRadius: 8,
  backgroundColor: palette.neutral.surfaceContainerHigh,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginBottom: 4,
});

export const ProfileEditLabel = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.neutral.onSurfaceVariant,
});

export const ProfileEditInput = styled("input")({
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: `1px solid ${palette.neutral.outlineVariant}`,
  backgroundColor: palette.neutral.surfaceContainer,
  color: palette.neutral.onSurface,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  "&:focus": {
    borderColor: palette.primary.main,
    boxShadow: `0 0 0 2px rgba(87, 222, 160, 0.15)`,
  },
});

export const ProfileEditActions = styled(Box)({
  display: "flex",
  gap: 6,
  justifyContent: "flex-end",
});

export const SmallButton = styled(ButtonBase)<{ variant?: "primary" | "ghost" }>(
  ({ variant = "ghost" }) => ({
    padding: "5px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    backgroundColor:
      variant === "primary" ? palette.primary.container : "transparent",
    color:
      variant === "primary"
        ? palette.primary.onContainer
        : palette.neutral.onSurfaceVariant,
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor:
        variant === "primary"
          ? palette.primary.main
          : palette.neutral.surfaceContainerHighest,
    },
  })
);

export const SettingsPanel = styled(Box)({
  padding: "8px 12px",
  borderRadius: 8,
  backgroundColor: palette.neutral.surfaceContainerHigh,
  marginBottom: 4,
});
