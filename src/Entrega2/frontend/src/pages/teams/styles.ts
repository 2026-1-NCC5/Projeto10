import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const TeamsRoot = styled(Box)({
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

export const TeamsList = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const EmptyIcon = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: 16,
  backgroundColor: "rgba(87, 222, 160, 0.08)",
  border: `1px solid rgba(87, 222, 160, 0.2)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
  "& .material-symbols-outlined": {
    fontSize: 32,
    color: palette.primary.main,
  },
});

export const EmptyText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  textAlign: "center",
  lineHeight: 1.6,
});

export const InvitationsSection = styled(Box)({
  marginBottom: 32,
});

export const SectionTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 17,
  color: palette.neutral.onSurface,
  marginBottom: 12,
});

export const InvitationCard = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "16px 20px",
  background: "linear-gradient(135deg, rgba(0, 31, 39, 0.8) 0%, rgba(1, 35, 44, 0.9) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: 12,
  border: `1px solid rgba(87, 222, 160, 0.15)`,
  marginBottom: 8,
});

export const InvitationInfo = styled(Box)({
  flex: 1,
});

export const InvitationTeamName = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  color: palette.neutral.onSurface,
  marginBottom: 2,
});

export const InvitationMeta = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.onSurfaceVariant,
});

export const InvitationActions = styled(Box)({
  display: "flex",
  gap: 8,
});

export const AcceptButton = styled(ButtonBase)({
  padding: "8px 16px",
  borderRadius: 8,
  backgroundColor: "rgba(87, 222, 160, 0.12)",
  border: `1px solid rgba(87, 222, 160, 0.25)`,
  color: palette.primary.main,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  transition: "background-color 0.2s ease",
  "&:hover": { backgroundColor: "rgba(87, 222, 160, 0.22)" },
});

export const RejectButton = styled(ButtonBase)({
  padding: "8px 16px",
  borderRadius: 8,
  backgroundColor: palette.neutral.surfaceContainerHigh,
  color: palette.neutral.onSurfaceVariant,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  transition: "background-color 0.2s ease",
  "&:hover": { backgroundColor: palette.neutral.surfaceContainerHighest },
});

export const CoordinatorPanel = styled(Box)({
  marginBottom: 28,
});

export const CoordinatorPanelHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
});

export const MyTeamLabel = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: palette.primary.main,
  marginBottom: 4,
});

export const CoordTeamName = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 20,
  color: palette.neutral.onSurface,
});

export const MembersPanel = styled(Box)({
  backgroundColor: palette.neutral.surfaceContainerLow,
  borderRadius: 8,
  padding: "16px 20px",
  marginTop: 8,
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const MemberRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 0",
});

export const MemberName = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: palette.neutral.onSurface,
  flex: 1,
});

export const MemberRole = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
});

export const ActionButton = styled(ButtonBase)({
  padding: "6px 14px",
  borderRadius: 6,
  backgroundColor: palette.neutral.surfaceContainerHigh,
  color: palette.neutral.onSurface,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  transition: "background-color 0.2s ease",
  "&:hover": { backgroundColor: palette.neutral.surfaceContainerHighest },
});

export const SectionDivider = styled(Box)({
  height: 1,
  backgroundColor: palette.neutral.outlineVariant,
  margin: "12px 0",
  opacity: 0.4,
});

export const JoinRequestsTitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: palette.neutral.onSurfaceVariant,
  marginBottom: 4,
});

export const EmptyMembersText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  padding: "8px 0",
});
