import StyledButton from "../StyledButton/StyledButton";
import {
  BannerRoot,
  BannerIconBox,
  BannerTextGroup,
  BannerTitle,
  BannerText,
} from "./styles";


interface NoTeamBannerProps {
  onGoToTeams: () => void;
}

function NoTeamBanner({ onGoToTeams }: NoTeamBannerProps) {
  return (
    <BannerRoot>
      <BannerIconBox>
        <span className="material-symbols-outlined">group_off</span>
      </BannerIconBox>
      <BannerTextGroup>
        <BannerTitle>Voce nao esta em nenhuma equipe</BannerTitle>
        <BannerText>
          Para registrar coletas, voce precisa fazer parte de uma equipe.
        </BannerText>
      </BannerTextGroup>
      <StyledButton
        variant="secondary"
        icon="arrow_forward"
        onClick={onGoToTeams}
        sx={{ width: "auto", padding: "10px 20px", flexShrink: 0 }}
      >
        Ver Equipes
      </StyledButton>
    </BannerRoot>
  );
}

export default NoTeamBanner;
