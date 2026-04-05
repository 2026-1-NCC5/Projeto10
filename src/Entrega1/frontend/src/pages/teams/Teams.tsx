import { useState, useEffect } from "react";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { Team, JoinRequest, TeamInvitation, UserSummary } from "../../types";
import TeamCard from "../../components/TeamCard/TeamCard";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import InviteMemberModal from "../../components/InviteMemberModal/InviteMemberModal";
import {
  TeamsRoot,
  PageTitle,
  PageSubtitle,
  TeamsList,
  EmptyIcon,
  EmptyText,
  InvitationsSection,
  SectionTitle,
  InvitationCard,
  InvitationInfo,
  InvitationTeamName,
  InvitationMeta,
  InvitationActions,
  AcceptButton,
  RejectButton,
  CoordinatorPanel,
  MyTeamLabel,
  CoordTeamName,
  CoordinatorPanelHeader,
  MembersPanel,
  MemberRow,
  MemberName,
  MemberRole,
  ActionButton,
  SectionDivider,
  JoinRequestsTitle,
  EmptyMembersText,
} from "./styles";


const roleLabels: Record<string, string> = {
  operator: "Operador",
  coordinator: "Coordenador",
  admin: "Administrador",
  member: "Membro",
  leader: "Líder",
};

function TeamsPage() {
  const { token, user } = useAuth();
  const isCoordinator = user?.role === "coordinator";

  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [requestedTeamIds, setRequestedTeamIds] = useState<Set<string>>(new Set());

  const userTeamId: string | null = user?.team_id ?? null;
  const myTeam = teams.find((t) => t.id === userTeamId) ?? null;

  useEffect(() => {
    if (!token) return;
    api.getTeams(token).then(setTeams).catch(() => {});
    api.getMyInvitations(token).then(setInvitations).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || !isCoordinator || !userTeamId) return;
    api.getTeamJoinRequests(token, userTeamId).then(setJoinRequests).catch(() => {});
  }, [token, isCoordinator, userTeamId]);

  function handleRequestJoin(teamId: string) {
    if (!token) return;
    api.requestJoinTeam(token, teamId)
      .then(() => setRequestedTeamIds((prev) => new Set(prev).add(teamId)))
      .catch(() => {});
  }

  function handleAcceptInvitation(invitationId: string) {
    if (!token) return;
    api.acceptInvitation(token, invitationId)
      .then(() => {
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
        return api.getTeams(token);
      })
      .then(setTeams)
      .catch(() => {});
  }

  function handleRejectInvitation(invitationId: string) {
    if (!token) return;
    api.rejectInvitation(token, invitationId)
      .then(() => setInvitations((prev) => prev.filter((i) => i.id !== invitationId)))
      .catch(() => {});
  }

  function handleOpenInvite() {
    if (!token) return;
    setInviteModalOpen(true);
    api.getUsers(token, true).then(setAvailableUsers).catch(() => {});
  }

  function handleSendInvitation(userId: string) {
    if (!token || !userTeamId) return;
    api.sendInvitation(token, userTeamId, userId)
      .then(() => setInviteModalOpen(false))
      .catch(() => {});
  }

  function handleApproveRequest(requestId: string) {
    if (!token || !userTeamId) return;
    api.approveJoinRequest(token, userTeamId, requestId, "approved")
      .then((updated) => {
        setJoinRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        return api.getTeams(token);
      })
      .then(setTeams)
      .catch(() => {});
  }

  function handleRejectRequest(requestId: string) {
    if (!token || !userTeamId) return;
    api.approveJoinRequest(token, userTeamId, requestId, "rejected")
      .then((updated) =>
        setJoinRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      )
      .catch(() => {});
  }

  const visibleTeams = isCoordinator ? teams.filter((t) => t.id !== userTeamId) : teams;
  const pendingRequests = joinRequests.filter((r) => r.status === "pending");

  return (
    <TeamsRoot>
      <PageTitle>Equipes</PageTitle>
      <PageSubtitle>
        {isCoordinator ? "Gerencie sua equipe e explore a organização." : "Encontre uma equipe e solicite entrada."}
      </PageSubtitle>

      {invitations.length > 0 && (
        <InvitationsSection>
          <SectionTitle>Convites pendentes</SectionTitle>
          {invitations.map((inv) => (
            <InvitationCard key={inv.id}>
              <InvitationInfo>
                <InvitationTeamName>{inv.teamName}</InvitationTeamName>
                <InvitationMeta>Convidado por {inv.invitedByName}</InvitationMeta>
              </InvitationInfo>
              <InvitationActions>
                <AcceptButton onClick={() => handleAcceptInvitation(inv.id)}>
                  Aceitar
                </AcceptButton>
                <RejectButton onClick={() => handleRejectInvitation(inv.id)}>
                  Recusar
                </RejectButton>
              </InvitationActions>
            </InvitationCard>
          ))}
        </InvitationsSection>
      )}

      {isCoordinator && myTeam && (
        <CoordinatorPanel>
          <GlassPanel>
            <CoordinatorPanelHeader>
              <div>
                <MyTeamLabel>Minha equipe</MyTeamLabel>
                <CoordTeamName>{myTeam.name}</CoordTeamName>
              </div>
              <ActionButton onClick={handleOpenInvite}>
                + Convidar membro
              </ActionButton>
            </CoordinatorPanelHeader>

            <MembersPanel>
              {myTeam.members.length === 0 ? (
                <EmptyMembersText>Nenhum membro nesta equipe.</EmptyMembersText>
              ) : (
                myTeam.members.map((member) => (
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
                  </MemberRow>
                ))
              )}

              <SectionDivider />
              <JoinRequestsTitle>Solicitações de entrada</JoinRequestsTitle>
              {pendingRequests.length === 0 ? (
                <EmptyMembersText>Nenhuma solicitação pendente.</EmptyMembersText>
              ) : (
                pendingRequests.map((req) => (
                  <MemberRow key={req.id}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16, color: "#86948A" }}
                    >
                      person_add
                    </span>
                    <MemberName>{req.userName}</MemberName>
                    <ActionButton onClick={() => handleApproveRequest(req.id)}>
                      Aprovar
                    </ActionButton>
                    <ActionButton onClick={() => handleRejectRequest(req.id)}>
                      Rejeitar
                    </ActionButton>
                  </MemberRow>
                ))
              )}
            </MembersPanel>
          </GlassPanel>
        </CoordinatorPanel>
      )}

      {visibleTeams.length === 0 && !isCoordinator ? (
        <GlassPanel sx={{ maxWidth: 400, textAlign: "center", padding: 4 }}>
          <EmptyIcon>
            <span className="material-symbols-outlined">groups</span>
          </EmptyIcon>
          <EmptyText>Nenhuma equipe disponível no momento.</EmptyText>
        </GlassPanel>
      ) : visibleTeams.length > 0 ? (
        <>
          {isCoordinator && <SectionTitle>Outras equipes</SectionTitle>}
          <TeamsList>
            {visibleTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onRequestJoin={handleRequestJoin}
                joinRequested={requestedTeamIds.has(team.id)}
                isMember={team.id === userTeamId}
                canJoin={userTeamId === null}
              />
            ))}
          </TeamsList>
        </>
      ) : null}

      {isCoordinator && (
        <InviteMemberModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          availableUsers={availableUsers}
          onInvite={handleSendInvitation}
        />
      )}
    </TeamsRoot>
  );
}

export default TeamsPage;
