import type { Team } from "../../types";
import { TabsRoot, TabButton, TabLabel, TabHint } from "./styles";


interface Props {
  teams: Team[];
  selectedId: string;
  onSelect: (teamId: string) => void;
}


function TeamTabs({ teams, selectedId, onSelect }: Props) {
  if (teams.length === 0) return null;
  return (
    <TabsRoot>
      {teams.map((team) => {
        const active = team.id === selectedId;
        return (
          <TabButton
            key={team.id}
            active={active}
            onClick={() => onSelect(team.id)}
          >
            <TabLabel>{team.name}</TabLabel>
            <TabHint>
              {team.members.length} {team.members.length === 1 ? "membro" : "membros"}
            </TabHint>
          </TabButton>
        );
      })}
    </TabsRoot>
  );
}


export default TeamTabs;
