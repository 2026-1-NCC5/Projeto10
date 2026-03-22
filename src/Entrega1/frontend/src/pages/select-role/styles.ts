import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const PageContainer = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
  padding: 24,
});

export const Content = styled(Box)({
  position: "relative",
  zIndex: 10,
  width: "100%",
  maxWidth: 960,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const BrandingRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 32,
});

export const BrandingIcon = styled(Box)({
  width: 40,
  height: 40,
  background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.container} 100%)`,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .material-symbols-outlined": {
    color: palette.primary.onPrimary,
    fontVariationSettings: "'FILL' 1",
    fontSize: 22,
  },
});

export const BrandingText = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 24,
  letterSpacing: "-0.03em",
  color: palette.primary.main,
});

export const HeaderSection = styled(Box)({
  textAlign: "center",
  marginBottom: 64,
});

export const PageTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 48,
  letterSpacing: "-0.02em",
  color: palette.neutral.onSurface,
  lineHeight: 1.2,
  "@media (max-width: 600px)": {
    fontSize: 32,
  },
});

export const GreenText = styled("span")({
  color: palette.primary.main,
});

export const PageSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 18,
  color: palette.neutral.onSurfaceVariant,
  maxWidth: 560,
  margin: "16px auto 0",
  lineHeight: 1.6,
});

export const RoleGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 24,
  width: "100%",
  marginBottom: 64,
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1fr 1fr 1fr",
  },
}));

export const FooterSection = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 24,
});

export const ContinueButtonWrapper = styled(Box)({
  width: "100%",
  maxWidth: 320,
});

export const FooterButton = styled("button")({
  background: "none",
  border: "none",
  color: palette.neutral.onSurfaceVariant,
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontFamily: "'Inter', sans-serif",
  transition: "color 0.2s ease",
  padding: 0,
  "&:hover": {
    color: palette.primary.main,
  },
});

export const ErrorText = styled(Typography)({
  fontSize: 13,
  color: palette.error.main,
  fontFamily: "'Inter', sans-serif",
  textAlign: "center",
});
