import type { Team } from "../../types";
import StyledButton from "../StyledButton/StyledButton";
import { CardRoot, CardIconBox, CardBody, CardName, CardDescription, CardMeta, JoinedBadge } from "./styles";


interface TeamCardProps {
  team: Team;
  onRequestJoin: (teamId: string) => void;
  joinRequested?: boolean;
  isMember?: boolean;
  canJoin?: boolean;
}

function TeamCard({ team, onRequestJoin, joinRequested, isMember, canJoin = true }: TeamCardProps) {
  const memberCount = team.members.length;
  const memberLabel = memberCount === 0
    ? "Sem membros"
    : `${memberCount} membro${memberCount !== 1 ? "s" : ""}`;

  return (
    <CardRoot>
      <CardIconBox>
        <span className="material-symbols-outlined">groups</span>
      </CardIconBox>
      <CardBody>
        <CardName>{team.name}</CardName>
        {team.description && <CardDescription>{team.description}</CardDescription>}
        <CardMeta>{memberLabel}</CardMeta>
      </CardBody>
      {isMember ? (
        <JoinedBadge>Sua equipe</JoinedBadge>
      ) : !canJoin ? null : joinRequested ? (
        <StyledButton
          variant="secondary"
          disabled
          sx={{ width: "auto", padding: "10px 20px", flexShrink: 0 }}
        >
          Solicitação enviada
        </StyledButton>
      ) : (
        <StyledButton
          variant="secondary"
          icon="group_add"
          onClick={() => onRequestJoin(team.id)}
          sx={{ width: "auto", padding: "10px 20px", flexShrink: 0 }}
        >
          Solicitar entrada
        </StyledButton>
      )}
    </CardRoot>
  );
}

export default TeamCard;
