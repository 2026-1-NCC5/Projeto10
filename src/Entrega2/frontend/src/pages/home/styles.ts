import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const HomeRoot = styled(Box)({
  position: "relative",
  zIndex: 1,
});

export const HeaderSection = styled(Box)({
  marginBottom: 32,
});

export const PageTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 28,
  color: palette.neutral.onSurface,
  lineHeight: 1.2,
});

export const TeamNameSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  marginTop: 6,
});

export const CollectionSectionTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 17,
  color: palette.neutral.onSurface,
  marginBottom: 16,
});

export const CollectionRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  gap: 16,
  marginBottom: 32,
  flexWrap: "wrap",
});

export const ActionsRow = styled(Box)({
  display: "flex",
  gap: 16,
  marginBottom: 32,
});

export const SubmitErrorText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.error.main,
  marginBottom: 8,
});
