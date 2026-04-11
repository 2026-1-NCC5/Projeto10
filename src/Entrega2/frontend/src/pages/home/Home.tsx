import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { BatchItem } from "../../types";
import NoTeamBanner from "../../components/NoTeamBanner/NoTeamBanner";
import CollectionBlock from "../../components/CollectionBlock/CollectionBlock";
import StyledButton from "../../components/StyledButton/StyledButton";
import {
  HomeRoot,
  HeaderSection,
  PageTitle,
  TeamNameSubtitle,
  CollectionRow,
  CollectionSectionTitle,
  ActionsRow,
  SubmitErrorText,
} from "./styles";


type BlockForm = { quantity: string; weight: string; itemName?: string };

const emptyArroz: BlockForm = { quantity: "", weight: "" };
const emptyFeijao: BlockForm = { quantity: "", weight: "" };
const emptyOutros: BlockForm = { quantity: "", weight: "", itemName: "" };

function HomePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const userTeamId: string | null = user?.team_id ?? null;
  const hasTeam = userTeamId !== null;

  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [arrozForm, setArrozForm] = useState<BlockForm>(emptyArroz);
  const [feijaoForm, setFeijaoForm] = useState<BlockForm>(emptyFeijao);
  const [outrosForm, setOutrosForm] = useState<BlockForm>(emptyOutros);

  useEffect(() => {
    if (!token || !userTeamId) return;
    api
      .getMyTeam(token)
      .then((t) => setTeamName(t?.name ?? null))
      .catch(() => setTeamName(null));
  }, [token, userTeamId]);

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

      {!hasTeam && <NoTeamBanner onGoToTeams={() => navigate("/teams")} />}

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
      </ActionsRow>
    </HomeRoot>
  );
}

export default HomePage;
