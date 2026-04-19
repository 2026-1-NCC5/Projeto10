import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ButtonBase from "@mui/material/ButtonBase"

import { palette } from "../../theme/palette"


export const RankingRoot = styled(Box)({
  position: "relative",
  zIndex: 1,
  padding: "8px 4px 48px",
})

export const PageTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 28,
  color: palette.neutral.onSurface,
  lineHeight: 1.2,
})

export const PageSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  marginTop: 6,
  marginBottom: 32,
})

export const ContentGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 32,
  "@media (min-width: 960px)": {
    gridTemplateColumns: "1.2fr 1fr",
  },
})

export const PodiumWrapper = styled(Box)({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: 16,
  padding: "24px 8px",
  minHeight: 320,
})

export const PodiumCard = styled(Box)<{ place: 1 | 2 | 3 }>(({ place }) => {
  const heights: Record<1 | 2 | 3, number> = { 1: 260, 2: 210, 3: 180 }
  const accent: Record<1 | 2 | 3, string> = {
    1: "#FFD66B",
    2: "#C7D2DA",
    3: "#E3A877",
  }
  return {
    flex: 1,
    maxWidth: 200,
    minWidth: 120,
    height: heights[place],
    padding: 20,
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg, rgba(0, 31, 39, 0.85) 0%, rgba(13, 46, 55, 0.75) 100%)",
    backdropFilter: "blur(20px)",
    border: `2px solid ${accent[place]}`,
    boxShadow: `0 8px 28px -12px ${accent[place]}55`,
  }
})

export const PodiumBadge = styled(Box)<{ place: 1 | 2 | 3 }>(({ place }) => {
  const accent: Record<1 | 2 | 3, string> = {
    1: "#FFD66B",
    2: "#C7D2DA",
    3: "#E3A877",
  }
  return {
    fontFamily: "'Manrope', sans-serif",
    fontWeight: 800,
    fontSize: 28,
    color: accent[place],
    marginBottom: 4,
  }
})

export const PodiumTeamName = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  color: palette.neutral.onSurface,
  textAlign: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  width: "100%",
})

export const PodiumWeight = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 22,
  color: palette.primary.main,
})

export const PodiumHint = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: palette.neutral.onSurfaceVariant,
})

export const ListSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
})

export const ListHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 4,
})

export const ListTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 17,
  color: palette.neutral.onSurface,
})

export const ListRow = styled(Box)({
  display: "grid",
  gridTemplateColumns: "48px 1fr auto",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  borderRadius: 10,
  background: "linear-gradient(135deg, rgba(0, 31, 39, 0.55) 0%, rgba(13, 46, 55, 0.45) 100%)",
  border: `1px solid ${palette.neutral.outlineVariant}33`,
  transition: "border-color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    borderColor: `${palette.primary.main}66`,
    transform: "translateX(2px)",
  },
})

export const RankBadge = styled(Box)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 16,
  color: palette.primary.main,
  textAlign: "center",
})

export const TeamCell = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  overflow: "hidden",
})

export const TeamName = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  color: palette.neutral.onSurface,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

export const TeamSubtle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: palette.neutral.onSurfaceVariant,
})

export const WeightCell = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  color: palette.neutral.onSurface,
  whiteSpace: "nowrap",
})

export const Pagination = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  marginTop: 20,
})

export const PageButton = styled(ButtonBase)({
  width: 40,
  height: 40,
  borderRadius: 20,
  border: `1px solid ${palette.neutral.outlineVariant}55`,
  color: palette.neutral.onSurface,
  transition: "all 0.2s ease",
  "&:hover:not(:disabled)": {
    background: `${palette.primary.main}22`,
    borderColor: palette.primary.main,
  },
  "&:disabled": {
    opacity: 0.35,
    cursor: "not-allowed",
  },
})

export const PageIndicator = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  minWidth: 100,
  textAlign: "center",
})

export const EmptyState = styled(Box)({
  padding: "40px 16px",
  textAlign: "center",
  color: palette.neutral.onSurfaceVariant,
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
})
