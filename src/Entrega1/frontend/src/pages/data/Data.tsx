import GlassPanel from "../../components/GlassPanel/GlassPanel";
import { PageRoot, PlaceholderIcon, PlaceholderTitle, PlaceholderSubtitle } from "./styles";


function DataPage() {
  return (
    <PageRoot>
      <GlassPanel sx={{ maxWidth: 400, width: "100%", textAlign: "center", padding: 4 }}>
        <PlaceholderIcon>
          <span className="material-symbols-outlined">bar_chart</span>
        </PlaceholderIcon>
        <PlaceholderTitle>Dados e Painel</PlaceholderTitle>
        <PlaceholderSubtitle>
          Esta tela está em desenvolvimento. Disponível para coordenadores e administradores.
        </PlaceholderSubtitle>
      </GlassPanel>
    </PageRoot>
  );
}

export default DataPage;
