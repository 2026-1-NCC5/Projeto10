import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { CollectionEntry, BatchItem, CollectionSummary } from "../../types";
import SummaryCard from "../../components/SummaryCard/SummaryCard";
import NoTeamBanner from "../../components/NoTeamBanner/NoTeamBanner";
import CollectionBlock from "../../components/CollectionBlock/CollectionBlock";
import CollectionTable from "../../components/CollectionTable/CollectionTable";
import HistoryToggle from "../../components/HistoryToggle/HistoryToggle";
import StyledButton from "../../components/StyledButton/StyledButton";
import {
  HomeRoot,
  HeaderSection,
  PageTitle,
  TeamNameSubtitle,
  SummaryRow,
  CollectionRow,
  CollectionSectionTitle,
  ActionsRow,
  HistorySection,
  SubmitErrorText,
} from "./styles";


type BlockForm = { quantity: string; weight: string; itemName?: string };

const emptyArroz: BlockForm = { quantity: "", weight: "" };
const emptyFeijao: BlockForm = { quantity: "", weight: "" };
const emptyOutros: BlockForm = { quantity: "", weight: "", itemName: "" };

function HomePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const historyRef = useRef<HTMLDivElement>(null);

  const userTeamId: string | null = user?.team_id ?? null;
  const hasTeam = userTeamId !== null;
  const isOperator = user?.role === "operator";

  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [personalHistory, setPersonalHistory] = useState<CollectionEntry[]>([]);
  const [teamHistory, setTeamHistory] = useState<CollectionEntry[]>([]);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [summary, setSummary] = useState<CollectionSummary | null>(null);
  const [historyTab, setHistoryTab] = useState<"personal" | "team">("personal");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [arrozForm, setArrozForm] = useState<BlockForm>(emptyArroz);
  const [feijaoForm, setFeijaoForm] = useState<BlockForm>(emptyFeijao);
  const [outrosForm, setOutrosForm] = useState<BlockForm>(emptyOutros);

  useEffect(() => {
    if (!token || !userTeamId) return;
    if (!isOperator) {
      api.getTeamHistory(token, userTeamId).then(setTeamHistory).catch(() => setTeamHistory([]));
      api.getTeamSummary(token, userTeamId).then(setSummary).catch(() => setSummary(null));
    }
    api.getTeams(token).then((teams) => {
      const found = teams.find((t) => t.id === userTeamId);
      setTeamName(found?.name ?? null);
    }).catch(() => {});
  }, [token, userTeamId, isOperator]);

  useEffect(() => {
    if (!token) return;
    api.getUserHistory(token).then(setPersonalHistory).catch(() => setPersonalHistory([]));
  }, [token]);

  function handleArrozChange(field: keyof BlockForm, value: string) {
    setArrozForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFeijaoChange(field: keyof BlockForm, value: string) {
    setFeijaoForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOutrosChange(field: keyof BlockForm, value: string) {
    setOutrosForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddArroz() {
    setBatchItems((prev) => [
      ...prev,
      { itemType: "Arroz", quantity: Number(arrozForm.quantity), weight: Number(arrozForm.weight) },
    ]);
    setArrozForm(emptyArroz);
  }

  function handleAddFeijao() {
    setBatchItems((prev) => [
      ...prev,
      { itemType: "Feijao", quantity: Number(feijaoForm.quantity), weight: Number(feijaoForm.weight) },
    ]);
    setFeijaoForm(emptyFeijao);
  }

  function handleAddOutros() {
    setBatchItems((prev) => [
      ...prev,
      {
        itemType: "Outros",
        itemName: outrosForm.itemName,
        quantity: Number(outrosForm.quantity),
        weight: Number(outrosForm.weight),
      },
    ]);
    setOutrosForm(emptyOutros);
  }

  async function handleFinishBatch() {
    if (!token || batchItems.length === 0) return;
    setSubmitError(null);
    try {
      await api.submitBatch(token, batchItems);
      setBatchItems([]);
      api.getUserHistory(token).then(setPersonalHistory).catch(() => {});
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao enviar lote");
    }
  }

  const arrozDisabled = !arrozForm.quantity || !arrozForm.weight;
  const feijaoDisabled = !feijaoForm.quantity || !feijaoForm.weight;
  const outrosDisabled = !outrosForm.quantity || !outrosForm.weight || !outrosForm.itemName;

  return (
    <HomeRoot>
      <HeaderSection>
        <PageTitle>Coleta de Itens</PageTitle>
        {hasTeam && teamName && <TeamNameSubtitle>{teamName}</TeamNameSubtitle>}
      </HeaderSection>

      {!hasTeam && (
        <NoTeamBanner onGoToTeams={() => navigate("/teams")} />
      )}

      {!isOperator && (
        <SummaryRow>
          <SummaryCard
            icon="inventory_2"
            label="Total coletado"
            value={summary?.totalCollected ?? "—"}
          />
          <SummaryCard
            icon="calendar_month"
            label="Coletado este mês"
            value={summary?.collectedThisMonth ?? "—"}
          />
          <SummaryCard
            icon="scale"
            label="Peso total (kg)"
            value={summary ? `${summary.totalWeight} kg` : "—"}
          />
        </SummaryRow>
      )}

      <CollectionSectionTitle>Registrar Coleta</CollectionSectionTitle>
      <CollectionRow>
        <CollectionBlock
          title="Arroz"
          icon="rice_bowl"
          fields={arrozForm}
          onChange={handleArrozChange}
          onAdd={handleAddArroz}
          disabled={arrozDisabled}
        />
        <CollectionBlock
          title="Feijão"
          icon="grain"
          fields={feijaoForm}
          onChange={handleFeijaoChange}
          onAdd={handleAddFeijao}
          disabled={feijaoDisabled}
        />
        <CollectionBlock
          title="Outros"
          icon="category"
          fields={outrosForm}
          onChange={handleOutrosChange}
          onAdd={handleAddOutros}
          disabled={outrosDisabled}
          showNameField
        />
      </CollectionRow>

      {submitError && <SubmitErrorText>{submitError}</SubmitErrorText>}

      <ActionsRow>
        <StyledButton
          variant="primary"
          icon="check_circle"
          onClick={handleFinishBatch}
          disabled={batchItems.length === 0}
        >
          Finalizar Lote
        </StyledButton>
        <StyledButton
          variant="secondary"
          icon="history"
          onClick={() => historyRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          Histórico
        </StyledButton>
      </ActionsRow>

      <HistorySection ref={historyRef}>
        {!isOperator && <HistoryToggle active={historyTab} onChange={setHistoryTab} />}
        {(isOperator || historyTab === "personal") && (
          <CollectionTable
            title="Meu Histórico"
            entries={personalHistory}
            emptyMessage="Nenhuma coleta registrada ainda."
          />
        )}
        {!isOperator && historyTab === "team" && (
          <CollectionTable
            title="Histórico da Equipe"
            entries={teamHistory}
            emptyMessage="A equipe ainda não registrou coletas."
          />
        )}
      </HistorySection>
    </HomeRoot>
  );
}

export default HomePage;
