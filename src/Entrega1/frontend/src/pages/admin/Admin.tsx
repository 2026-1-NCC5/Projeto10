import { useState, useEffect } from "react";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { Team, JoinRequest, UserSummary } from "../../types";
import { createTeamSchema } from "../../validation/schemas";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import StyledButton from "../../components/StyledButton/StyledButton";
import StyledInput from "../../components/StyledInput/StyledInput";
import InviteMemberModal from "../../components/InviteMemberModal/InviteMemberModal";
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
  FieldError,
} from "./styles";


function AdminPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [maxMembersValue, setMaxMembersValue] = useState("30");
  const [nameError, setNameError] = useState("");
  const [createError, setCreateError] = useState("");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<Record<string, JoinRequest[]>>({});
  const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getTeams(token).then(setTeams).catch(() => setTeams([]));
  }, [token]);

  function handleCreateTeam() {
    const maxMembersNum = parseInt(maxMembersValue, 10);
    const result = createTeamSchema.safeParse({
      name: nameValue,
      description: descValue || undefined,
      maxMembers: isNaN(maxMembersNum) ? 30 : maxMembersNum,
    });

    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      setNameError(err.name?.[0] ?? "");
      setCreateError(err.maxMembers?.[0] ?? "");
      return;
    }

    setNameError("");
    setCreateError("");

    const duplicate = teams.some(
      (t) => t.name.toLowerCase() === result.data.name.toLowerCase()
    );
    if (duplicate) {
      setNameError("Já existe uma equipe com esse nome.");
      return;
    }

    if (!token) return;

    api
      .createTeam(token, {
        name: result.data.name,
        description: result.data.description,
        maxMembers: result.data.maxMembers,
      })
      .then((newTeam) => {
        setTeams((prev) => [...prev, newTeam]);
        setNameValue("");
        setDescValue("");
        setMaxMembersValue("30");
        return api.getTeams(token);
      })
      .then(setTeams)
      .catch((err: Error) => {
        setCreateError(err.message ?? "Erro ao criar equipe");
      });
  }

  function handleToggleExpand(teamId: string) {
    setExpandedTeam((prev) => {
      if (prev === teamId) return null;
      if (!token) return teamId;
      api.getTeamJoinRequests(token, teamId)
        .then((reqs) => setJoinRequests((p) => ({ ...p, [teamId]: reqs })))
        .catch(() => {});
      return teamId;
    });
  }

  function handleOpenInvite(teamId: string) {
    if (!token) return;
    setInviteTeamId(teamId);
    api.getUsers(token, true).then(setAvailableUsers).catch(() => setAvailableUsers([]));
  }

  function handleInviteUser(userId: string) {
    if (!token || !inviteTeamId) return;
    api.addTeamMember(token, inviteTeamId, userId)
      .then(() => {
        setInviteTeamId(null);
        return api.getTeams(token);
      })
      .then(setTeams)
      .catch(() => {});
  }

  function handleRemoveMember(teamId: string, userId: string) {
    if (!token) return;
    api.removeTeamMember(token, teamId, userId)
      .then(() => api.getTeams(token))
      .then(setTeams)
      .catch(() => {});
  }

  function handleApproveRequest(teamId: string, requestId: string) {
    if (!token) return;
    api.approveJoinRequest(token, teamId, requestId, "approved")
      .then((updated) => {
        setJoinRequests((prev) => ({
          ...prev,
          [teamId]: (prev[teamId] ?? []).map((r) => (r.id === updated.id ? updated : r)),
        }));
        return api.getTeams(token);
      })
      .then(setTeams)
      .catch(() => {});
  }

  function handleRejectRequest(teamId: string, requestId: string) {
    if (!token) return;
    api.approveJoinRequest(token, teamId, requestId, "rejected")
      .then((updated) => {
        setJoinRequests((prev) => ({
          ...prev,
          [teamId]: (prev[teamId] ?? []).map((r) => (r.id === updated.id ? updated : r)),
        }));
      })
      .catch(() => {});
  }

  const roleLabels: Record<string, string> = {
    operator: "Operador",
    coordinator: "Coordenador",
    admin: "Administrador",
    member: "Membro",
    leader: "Líder",
  };

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
            <StyledInput
              label="Máximo de membros"
              icon="group"
              type="number"
              placeholder="30"
              min="1"
              value={maxMembersValue}
              onChange={(e) => setMaxMembersValue(e.target.value)}
            />
            {createError && <FieldError>{createError}</FieldError>}
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

      <InviteMemberModal
        open={inviteTeamId !== null}
        onClose={() => setInviteTeamId(null)}
        availableUsers={availableUsers}
        onInvite={handleInviteUser}
      />

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
                      : `${team.members.length} / ${team.maxMembers} membro${team.members.length !== 1 ? "s" : ""}`}
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
                          {member.teamRole === "leader" ? "star" : "person"}
                        </span>
                        <MemberName>{member.name}</MemberName>
                        <MemberRole>
                          {roleLabels[member.teamRole === "leader" ? "leader" : (member.role ?? "")] ?? member.role}
                        </MemberRole>
                        {member.teamRole !== "leader" && (
                          <ExpandButton onClick={() => handleRemoveMember(team.id, member.id)}>
                            Remover
                          </ExpandButton>
                        )}
                      </MemberRow>
                    ))
                  )}
                  <ExpandButton
                    onClick={() => handleOpenInvite(team.id)}
                    disabled={!team.members.some((m) => m.teamRole === "leader")}
                    title={!team.members.some((m) => m.teamRole === "leader") ? "Esta equipe precisa de um líder" : undefined}
                    sx={{ alignSelf: "flex-start", marginTop: 1 }}
                  >
                    + Adicionar membro
                  </ExpandButton>
                  <SectionDivider />
                  <JoinRequestsTitle>Solicitações de entrada</JoinRequestsTitle>
                  {(joinRequests[team.id] ?? []).filter((r) => r.status === "pending").length === 0 ? (
                    <EmptyMembersText>Nenhuma solicitação pendente.</EmptyMembersText>
                  ) : (
                    (joinRequests[team.id] ?? [])
                      .filter((r) => r.status === "pending")
                      .map((req) => (
                        <MemberRow key={req.id}>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16, color: "#86948A" }}
                          >
                            person_add
                          </span>
                          <MemberName>{req.userName}</MemberName>
                          <ExpandButton onClick={() => handleApproveRequest(team.id, req.id)}>
                            Aprovar
                          </ExpandButton>
                          <ExpandButton onClick={() => handleRejectRequest(team.id, req.id)}>
                            Rejeitar
                          </ExpandButton>
                        </MemberRow>
                      ))
                  )}
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
