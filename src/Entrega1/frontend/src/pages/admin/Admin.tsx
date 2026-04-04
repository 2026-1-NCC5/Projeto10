import { useState, useEffect } from "react";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { Team } from "../../types";
import { createTeamSchema } from "../../validation/schemas";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import StyledButton from "../../components/StyledButton/StyledButton";
import StyledInput from "../../components/StyledInput/StyledInput";
import {
  AdminRoot,
  PageTitle,
  PageSubtitle,
  SectionTitle,
  CreateTeamRow,
  TeamsSection,
  TeamRow,
  TeamIconBox,
  TeamInfo,
  TeamRowName,
  TeamRowMeta,
  ExpandButton,
  MembersPanel,
  MemberRow,
  MemberName,
  MemberRole,
  EmptyMembersText,
  InputWrapper,
  SectionDivider,
  JoinRequestsTitle,
} from "./styles";


function AdminPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [nameError, setNameError] = useState("");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getTeams(token).then(setTeams).catch(() => setTeams([]));
  }, [token]);

  function handleCreateTeam() {
    const result = createTeamSchema.safeParse({
      name: nameValue,
      description: descValue || undefined,
    });

    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      setNameError(err.name?.[0] ?? "");
      return;
    }

    setNameError("");

    const duplicate = teams.some(
      (t) => t.name.toLowerCase() === result.data.name.toLowerCase()
    );
    if (duplicate) {
      setNameError("Já existe uma equipe com esse nome.");
      return;
    }

    if (!token) return;

    api
      .createTeam(token, result.data)
      .then((newTeam) => {
        setTeams((prev) => [...prev, newTeam]);
        setNameValue("");
        setDescValue("");
      })
      .catch(() => {
        const optimistic: Team = {
          id: crypto.randomUUID(),
          name: result.data.name,
          description: result.data.description,
          members: [],
        };
        setTeams((prev) => [...prev, optimistic]);
        setNameValue("");
        setDescValue("");
      });
  }

  function handleToggleExpand(teamId: string) {
    setExpandedTeam((prev) => (prev === teamId ? null : teamId));
  }

  return (
    <AdminRoot>
      <PageTitle>Administração</PageTitle>
      <PageSubtitle>Gerencie equipes e membros da organização.</PageSubtitle>

      <GlassPanel sx={{ marginBottom: 3 }}>
        <SectionTitle>Criar nova equipe</SectionTitle>
        <CreateTeamRow>
          <InputWrapper>
            <StyledInput
              label="Nome da equipe"
              icon="groups"
              type="text"
              placeholder="Ex: Equipe Delta"
              value={nameValue}
              onChange={(e) => {
                setNameValue(e.target.value);
                if (nameError) setNameError("");
              }}
              error={nameError || undefined}
            />
            <StyledInput
              label="Descrição (opcional)"
              icon="description"
              type="text"
              placeholder="Descreva o foco desta equipe"
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
            />
          </InputWrapper>
          <StyledButton
            variant="primary"
            icon="add"
            onClick={handleCreateTeam}
            disabled={!nameValue.trim()}
            sx={{ width: "auto", padding: "16px 24px", alignSelf: "flex-end" }}
          >
            Criar
          </StyledButton>
        </CreateTeamRow>
      </GlassPanel>

      <GlassPanel>
        <SectionTitle>Equipes ({teams.length})</SectionTitle>
        <TeamsSection>
          {teams.map((team) => (
            <div key={team.id}>
              <TeamRow>
                <TeamIconBox>
                  <span className="material-symbols-outlined">groups</span>
                </TeamIconBox>
                <TeamInfo>
                  <TeamRowName>{team.name}</TeamRowName>
                  <TeamRowMeta>
                    {team.members.length === 0
                      ? "Sem membros"
                      : `${team.members.length} membro${team.members.length !== 1 ? "s" : ""}`}
                  </TeamRowMeta>
                </TeamInfo>
                <ExpandButton onClick={() => handleToggleExpand(team.id)}>
                  {expandedTeam === team.id ? "Fechar" : "Ver membros"}
                </ExpandButton>
              </TeamRow>

              {expandedTeam === team.id && (
                <MembersPanel>
                  {team.members.length === 0 ? (
                    <EmptyMembersText>Nenhum membro nesta equipe.</EmptyMembersText>
                  ) : (
                    team.members.map((member) => (
                      <MemberRow key={member.id}>
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16, color: "#86948A" }}
                        >
                          person
                        </span>
                        <MemberName>{member.name}</MemberName>
                        <MemberRole>{member.role}</MemberRole>
                      </MemberRow>
                    ))
                  )}
                  <SectionDivider />
                  <JoinRequestsTitle>Solicitações de entrada</JoinRequestsTitle>
                  <EmptyMembersText>Nenhuma solicitação pendente.</EmptyMembersText>
                </MembersPanel>
              )}
            </div>
          ))}
          {teams.length === 0 && (
            <EmptyMembersText>Nenhuma equipe criada ainda.</EmptyMembersText>
          )}
        </TeamsSection>
      </GlassPanel>
    </AdminRoot>
  );
}

export default AdminPage;
