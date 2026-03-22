import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BackgroundGlow from "../../components/BackgroundGlow/BackgroundGlow";
import BrandingHeader from "../../components/BrandingHeader/BrandingHeader";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import StyledInput from "../../components/StyledInput/StyledInput";
import StyledButton from "../../components/StyledButton/StyledButton";
import useForm from "../../hooks/useForm";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema } from "../../validation/schemas";
import {
  PageContainer,
  Content,
  FormContainer,
  FooterContainer,
  FooterText,
  FooterLink,
  ErrorText,
} from "./styles";


type LoginForm = {
  email: string;
  password: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (auth.isLoading) return;
    if (auth.isAuthenticated) {
      navigate(auth.user?.role ? "/home" : "/select-role", { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user?.role, navigate]);

  const { values, errors, handleChange, handleSubmit } =
    useForm<LoginForm>({ email: "", password: "" }, (v) => {
      const result = loginSchema.safeParse(v);
      if (result.success) return {};
      const fieldErrors = result.error.flatten().fieldErrors;
      const mapped: Partial<Record<keyof LoginForm, string>> = {};
      if (fieldErrors.email?.[0]) mapped.email = fieldErrors.email[0];
      if (fieldErrors.password?.[0]) mapped.password = fieldErrors.password[0];
      return mapped;
    });

  const onSubmit = handleSubmit(async () => {
    setApiError("");
    try {
      const user = await auth.login(values.email, values.password);
      if (user.role) {
        navigate("/home");
      } else {
        navigate("/select-role");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro inesperado");
    }
  });

  return (
    <PageContainer>
      <BackgroundGlow />
      <Content>
        <BrandingHeader
          icon="monitoring"
          title="Lideranças Empáticas"
          subtitle="Sistema de Gestão e Contagem de Alimentos"
        />

        <GlassPanel>
          <form onSubmit={onSubmit}>
            <FormContainer>
              <StyledInput
                label="Endereço de Email"
                icon="alternate_email"
                type="email"
                name="email"
                placeholder="email@organizacao.org"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <StyledInput
                label="Senha"
                icon="lock"
                type="password"
                name="password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              {apiError && <ErrorText>{apiError}</ErrorText>}

              <StyledButton type="submit" icon="arrow_forward">
                Iniciar Sessão
              </StyledButton>
            </FormContainer>
          </form>
        </GlassPanel>

        <FooterContainer>
          <FooterText>
            Novo por aqui?
            <FooterLink onClick={() => navigate("/register")}>
              Cadastre-se
            </FooterLink>
          </FooterText>
        </FooterContainer>
      </Content>
    </PageContainer>
  );
}

export default LoginPage;
