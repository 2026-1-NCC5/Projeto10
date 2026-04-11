import { useEffect, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import type { Team } from "../../types";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import {
  TeamsRoot,
  PageTitle,
  PageSubtitle,
  EmptyIcon,
  EmptyText,
  MyTeamLabel,
  CoordTeamName,
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


function TeamsPage() {
  const { token } = useAuth();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .getMyTeam(token)
      .then(setMyTeam)
      .catch(() => setMyTeam(null))
      .finally(() => setLoaded(true));
  }, [token]);

  return (
    <TeamsRoot>
      <PageTitle>Minha equipe</PageTitle>
      <PageSubtitle>Veja a equipe à qual você foi alocado.</PageSubtitle>

      {!loaded ? null : myTeam ? (
        <GlassPanel>
          <MyTeamLabel>Equipe</MyTeamLabel>
          <CoordTeamName>{myTeam.name}</CoordTeamName>
          {myTeam.description && (
            <PageSubtitle sx={{ marginTop: 1 }}>{myTeam.description}</PageSubtitle>
          )}
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
                    {member.role === "coordinator" ? "star" : "person"}
                  </span>
                  <MemberName>{member.name}</MemberName>
                  <MemberRole>{roleLabels[member.role ?? ""] ?? member.role}</MemberRole>
                </MemberRow>
              ))
            )}
          </MembersPanel>
        </GlassPanel>
      ) : (
        <GlassPanel sx={{ maxWidth: 440, textAlign: "center", padding: 4 }}>
          <EmptyIcon>
            <span className="material-symbols-outlined">groups</span>
          </EmptyIcon>
          <EmptyText>
            Você ainda não foi alocado a uma equipe. Entre em contato com um administrador.
          </EmptyText>
        </GlassPanel>
      )}
    </TeamsRoot>
  );
}

export default TeamsPage;
