import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BackgroundGlow from "../../components/BackgroundGlow/BackgroundGlow";
import StyledButton from "../../components/StyledButton/StyledButton";
import RoleCard from "../../components/RoleCard/RoleCard";
import { useAuth } from "../../contexts/AuthContext";
import {
  PageContainer,
  Content,
  BrandingRow,
  BrandingIcon,
  BrandingText,
  HeaderSection,
  PageTitle,
  GreenText,
  PageSubtitle,
  RoleGrid,
  FooterSection,
  ContinueButtonWrapper,
  FooterButton,
  ErrorText,
} from "./styles";


const roles = [
  {
    id: "operator",
    icon: "videocam",
    title: "Operador",
    description:
      "Execute sessões de contagem, interaja com a câmera e monitore a detecção em tempo real.",
  },
  {
    id: "coordinator",
    icon: "analytics",
    title: "Coordenador",
    description:
      "Visualize relatórios, analise o desempenho da equipe e monitore operações.",
  },
  {
    id: "admin",
    icon: "admin_panel_settings",
    title: "Administrador",
    description: "Gerencie usuários, equipes e configurações do sistema.",
  },
];

function SelectRolePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");

  const handleContinue = async () => {
    if (!selectedRole) return;
    setApiError("");
    try {
      await auth.selectRole(selectedRole);
      navigate("/home");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro inesperado");
    }
  };

  return (
    <PageContainer>
      <BackgroundGlow />
      <Content>
        <BrandingRow>
          <BrandingIcon>
            <span className="material-symbols-outlined">visibility</span>
          </BrandingIcon>
          <BrandingText>Lideranças Empáticas</BrandingText>
        </BrandingRow>

        <HeaderSection>
          <PageTitle>
            Defina seu <GreenText>Papel de Observador</GreenText>
          </PageTitle>
          <PageSubtitle>
            Personalize seu espaço de trabalho selecionando a função que melhor
            se encaixa nos seus objetivos operacionais.
          </PageSubtitle>
        </HeaderSection>

        <RoleGrid>
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              icon={role.icon}
              title={role.title}
              description={role.description}
              selected={selectedRole === role.id}
              onClick={() => setSelectedRole(role.id)}
            />
          ))}
        </RoleGrid>

        <FooterSection>
          {apiError && <ErrorText>{apiError}</ErrorText>}

          <ContinueButtonWrapper>
            <StyledButton
              icon="arrow_forward"
              onClick={handleContinue}
              disabled={!selectedRole}
            >
              Finalizar cadastro
            </StyledButton>
          </ContinueButtonWrapper>

          <FooterButton onClick={() => auth.logout()}>Sair</FooterButton>
        </FooterSection>
      </Content>
    </PageContainer>
  );
}

export default SelectRolePage;
