import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const AdminRoot = styled(Box)({
  position: "relative",
  zIndex: 1,
});

export const PageTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 28,
  color: palette.neutral.onSurface,
  marginBottom: 8,
});

export const PageSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  marginBottom: 32,
});

export const SectionTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 17,
  color: palette.neutral.onSurface,
  marginBottom: 16,
});

export const CreateTeamRow = styled(Box)({
  display: "flex",
  gap: 12,
  alignItems: "flex-end",
});

export const TeamsSection = styled(Box)({
  marginTop: 32,
});

export const TeamRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "16px 0",
  borderBottom: `1px solid rgba(61, 74, 65, 0.12)`,
  gap: 16,
  "&:last-child": {
    borderBottom: "none",
  },
});

export const TeamIconBox = styled(Box)({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: "rgba(87, 222, 160, 0.08)",
  border: `1px solid rgba(87, 222, 160, 0.12)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "& .material-symbols-outlined": {
    fontSize: 20,
    color: palette.primary.main,
  },
});

export const TeamInfo = styled(Box)({
  flex: 1,
});

export const TeamRowName = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  color: palette.neutral.onSurface,
  marginBottom: 2,
});

export const TeamRowMeta = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
});

export const ExpandButton = styled(ButtonBase)({
  padding: "6px 14px",
  borderRadius: 6,
  backgroundColor: palette.neutral.surfaceContainerHigh,
  color: palette.neutral.onSurface,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: palette.neutral.surfaceContainerHighest,
  },
});

export const MembersPanel = styled(Box)({
  backgroundColor: palette.neutral.surfaceContainerLow,
  borderRadius: 8,
  padding: "12px 16px",
  marginTop: 8,
  marginBottom: 8,
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const MemberRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

export const MemberName = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurface,
  flex: 1,
});

export const MemberRole = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.onSurfaceVariant,
});

export const EmptyMembersText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  textAlign: "center",
  padding: "8px 0",
});

export const InputWrapper = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const FieldError = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.error.main,
  marginTop: -4,
});

export const SectionDivider = styled(Box)({
  height: 1,
  backgroundColor: palette.neutral.outlineVariant,
  margin: "8px 0",
  opacity: 0.4,
});

export const JoinRequestsTitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.neutral.onSurfaceVariant,
  marginBottom: 4,
});
