import { useState, useEffect } from "react";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { Team } from "../../types";
import TeamCard from "../../components/TeamCard/TeamCard";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import { TeamsRoot, PageTitle, PageSubtitle, TeamsList, EmptyIcon, EmptyText } from "./styles";


function TeamsPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [requestedTeamIds, setRequestedTeamIds] = useState<Set<string>>(new Set());

  const userTeamId: string | null = null;

  useEffect(() => {
    if (!token) return;
    api.getTeams(token).then(setTeams).catch(() => setTeams([]));
  }, [token]);

  function handleRequestJoin(teamId: string) {
    if (!token) return;
    api.requestJoinTeam(token, teamId)
      .then(() => {
        setRequestedTeamIds((prev) => new Set(prev).add(teamId));
      })
      .catch(() => {});
  }

  return (
    <TeamsRoot>
      <PageTitle>Equipes</PageTitle>
      <PageSubtitle>Encontre uma equipe e solicite entrada.</PageSubtitle>
      {teams.length === 0 ? (
        <GlassPanel sx={{ maxWidth: 400, textAlign: "center", padding: 4 }}>
          <EmptyIcon>
            <span className="material-symbols-outlined">groups</span>
          </EmptyIcon>
          <EmptyText>Nenhuma equipe disponível no momento.</EmptyText>
        </GlassPanel>
      ) : (
        <TeamsList>
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onRequestJoin={handleRequestJoin}
              joinRequested={requestedTeamIds.has(team.id)}
              isMember={team.id === userTeamId}
            />
          ))}
        </TeamsList>
      )}
    </TeamsRoot>
  );
}

export default TeamsPage;
