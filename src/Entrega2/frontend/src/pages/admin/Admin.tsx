import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { Team } from "../../types";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import StyledButton from "../../components/StyledButton/StyledButton";
import TeamEditorModal from "../../components/TeamEditorModal/TeamEditorModal";
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
} from "./styles";


const roleLabels: Record<string, string> = {
  operator: "Operador",
  coordinator: "Coordenador",
  admin: "Administrador",
};


function AdminPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const refresh = useCallback(() => {
    if (!token) return;
    api.getTeams(token).then(setTeams).catch(() => setTeams([]));
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function openCreate() {
    setEditingTeam(null);
    setModalMode("create");
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingTeam(null);
  }

  async function handleDelete(team: Team) {
    if (!token) return;
    if (!window.confirm(`Remover a equipe "${team.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.deleteTeam(token, team.id);
      refresh();
    } catch (e) {
      window.alert((e as Error).message);
    }
  }

  const activeTeam =
    editingTeam && teams.find((t) => t.id === editingTeam.id)
      ? (teams.find((t) => t.id === editingTeam.id) as Team)
      : editingTeam;

  return (
    <AdminRoot>
      <PageTitle>Administração</PageTitle>
      <PageSubtitle>Crie equipes, atribua membros e mantenha a estrutura da organização.</PageSubtitle>

      <GlassPanel sx={{ marginBottom: 3 }}>
        <CreateTeamRow>
          <div>
            <SectionTitle>Equipes</SectionTitle>
            <TeamRowMeta>Total: {teams.length}</TeamRowMeta>
          </div>
          <StyledButton variant="primary" icon="add" onClick={openCreate}>
            Criar equipe
          </StyledButton>
        </CreateTeamRow>
      </GlassPanel>

      <GlassPanel>
        <TeamsSection>
          {teams.length === 0 && <EmptyMembersText>Nenhuma equipe criada ainda.</EmptyMembersText>}
          {teams.map((team) => {
            const expanded = expandedTeam === team.id;
            return (
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
                      {team.description ? ` · ${team.description}` : ""}
                    </TeamRowMeta>
                  </TeamInfo>
                  <ExpandButton onClick={() => setExpandedTeam(expanded ? null : team.id)}>
                    {expanded ? "Fechar" : "Ver membros"}
                  </ExpandButton>
                  <ExpandButton onClick={() => openEdit(team)}>Editar</ExpandButton>
                  <ExpandButton onClick={() => handleDelete(team)}>Excluir</ExpandButton>
                </TeamRow>

                {expanded && (
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
                            {member.role === "coordinator" ? "star" : "person"}
                          </span>
                          <MemberName>{member.name}</MemberName>
                          <MemberRole>{roleLabels[member.role ?? ""] ?? member.role}</MemberRole>
                        </MemberRow>
                      ))
                    )}
                  </MembersPanel>
                )}
              </div>
            );
          })}
        </TeamsSection>
      </GlassPanel>

      <TeamEditorModal
        open={modalMode !== null}
        mode={modalMode ?? "create"}
        team={activeTeam}
        onClose={closeModal}
        onSaved={refresh}
      />
    </AdminRoot>
  );
}

export default AdminPage;
