import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { ComparisonEvidence } from "../../types";
import { palette } from "../../theme/palette";


const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    background:
      "linear-gradient(135deg, rgba(0, 31, 39, 0.97) 0%, rgba(1, 35, 44, 0.99) 100%)",
    borderRadius: 12,
    border: `1px solid rgba(61, 74, 65, 0.25)`,
    minWidth: 560,
    maxWidth: 780,
  },
});

const Header = styled(Box)({
  padding: "20px 24px 12px",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 17,
  color: palette.neutral.onSurface,
  borderBottom: `1px solid rgba(61, 74, 65, 0.2)`,
});

const Grid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 12,
  padding: 20,
});

const Card = styled(Box)({
  borderRadius: 8,
  overflow: "hidden",
  border: `1px solid ${palette.neutral.outlineVariant}`,
  backgroundColor: palette.neutral.surfaceContainerLow,
});

const Img = styled("img")({
  width: "100%",
  height: 160,
  objectFit: "cover",
  display: "block",
});

const Caption = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: palette.neutral.onSurfaceVariant,
  padding: "8px 10px",
});

const Empty = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  padding: 24,
  textAlign: "center",
});


interface Props {
  open: boolean;
  onClose: () => void;
  category: string | null;
  evidence: ComparisonEvidence[];
}


function EvidenceModal({ open, onClose, category, evidence }: Props) {
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={false}>
      <Header>Evidência IA — {category}</Header>
      <DialogContent sx={{ padding: 0 }}>
        {evidence.length === 0 ? (
          <Empty>Nenhuma evidência disponível.</Empty>
        ) : (
          <Grid>
            {evidence.map((e) => (
              <Card key={e.detectionId}>
                {e.imageUrl ? (
                  <Img src={e.imageUrl} alt={e.detectionId} />
                ) : (
                  <Empty>Imagem indisponível (S3 desativado)</Empty>
                )}
                <Caption>
                  {new Date(e.detectedAt).toLocaleString()} · conf {(e.confidence * 100).toFixed(0)}%
                </Caption>
              </Card>
            ))}
          </Grid>
        )}
      </DialogContent>
    </StyledDialog>
  );
}

export default EvidenceModal;
