import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";

import type { ComparisonEvidence } from "../../types";
import { palette } from "../../theme/palette";


const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    background:
      "linear-gradient(135deg, rgba(0, 31, 39, 0.97) 0%, rgba(1, 35, 44, 0.99) 100%)",
    borderRadius: 12,
    border: `1px solid rgba(61, 74, 65, 0.25)`,
    minWidth: 600,
    maxWidth: 880,
  },
});

const Header = styled(Box)({
  padding: "20px 24px 12px",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 17,
  color: palette.neutral.onSurface,
  borderBottom: `1px solid rgba(61, 74, 65, 0.2)`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const HeaderHint = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 400,
  color: palette.neutral.onSurfaceVariant,
});

const Grid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  padding: 20,
});

const Card = styled(Box)({
  borderRadius: 10,
  overflow: "hidden",
  border: `1px solid ${palette.neutral.outlineVariant}`,
  backgroundColor: palette.neutral.surfaceContainerLow,
  display: "flex",
  flexDirection: "column",
});

const Img = styled("img")({
  width: "100%",
  height: 170,
  objectFit: "cover",
  display: "block",
});

const Placeholder = styled(Box)({
  width: "100%",
  height: 170,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.onSurfaceVariant,
  backgroundColor: palette.neutral.surfaceContainerHighest,
});

const CardBody = styled(Box)({
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

const ItemName = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: palette.neutral.onSurface,
  textTransform: "capitalize",
});

const Caption = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: palette.neutral.onSurfaceVariant,
});

const OpenLink = styled(ButtonBase)({
  alignSelf: "flex-start",
  marginTop: 6,
  padding: "4px 10px",
  borderRadius: 6,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: palette.primary.main,
  border: `1px solid ${palette.primary.main}`,
  "&:hover": {
    backgroundColor: "rgba(87, 222, 160, 0.1)",
  },
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


function EvidenceCard({ e }: { e: ComparisonEvidence }) {
  const [broken, setBroken] = useState(false);
  return (
    <Card>
      {e.imageUrl && !broken ? (
        <Img src={e.imageUrl} alt={e.detectionId} onError={() => setBroken(true)} />
      ) : (
        <Placeholder>
          {e.imageUrl ? "Imagem indisponível" : "Sem evidência S3"}
        </Placeholder>
      )}
      <CardBody>
        {e.itemName && <ItemName>{e.itemName}</ItemName>}
        <Caption>{new Date(e.detectedAt).toLocaleString()}</Caption>
        <Caption>Confiança: {(e.confidence * 100).toFixed(0)}%</Caption>
        {e.imageUrl && (
          <OpenLink
            onClick={() => window.open(e.imageUrl ?? "", "_blank", "noopener")}
          >
            Abrir original
          </OpenLink>
        )}
      </CardBody>
    </Card>
  );
}


function EvidenceModal({ open, onClose, category, evidence }: Props) {
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={false}>
      <Header>
        <span>Evidências IA — {category}</span>
        <HeaderHint>{evidence.length} item(s)</HeaderHint>
      </Header>
      <DialogContent sx={{ padding: 0 }}>
        {evidence.length === 0 ? (
          <Empty>Nenhuma evidência disponível.</Empty>
        ) : (
          <Grid>
            {evidence.map((e) => (
              <EvidenceCard key={e.detectionId} e={e} />
            ))}
          </Grid>
        )}
      </DialogContent>
    </StyledDialog>
  );
}


export default EvidenceModal;
