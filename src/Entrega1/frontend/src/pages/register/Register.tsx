import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BackgroundGlow from "../../components/BackgroundGlow/BackgroundGlow";
import BrandingHeader from "../../components/BrandingHeader/BrandingHeader";
import GlassPanel from "../../components/GlassPanel/GlassPanel";
import StyledInput from "../../components/StyledInput/StyledInput";
import StyledButton from "../../components/StyledButton/StyledButton";
import useForm from "../../hooks/useForm";
import { useAuth } from "../../contexts/AuthContext";
import { registerSchema } from "../../validation/schemas";
import {
  PageContainer,
  Content,
  FormHeader,
  FormTitle,
  FormSubtitle,
  FormFields,
  PasswordGrid,
  FooterContainer,
  FooterText,
  FooterLink,
  ErrorText,
} from "./styles";


type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (auth.isLoading) return;
    if (auth.isAuthenticated) {
      navigate(auth.user?.role ? "/home" : "/select-role", { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user?.role, navigate]);

  const { values, errors, handleChange, handleSubmit } = useForm<RegisterForm>(
    { name: "", email: "", password: "", confirmPassword: "" },
    (v) => {
      const result = registerSchema.safeParse(v);
      if (result.success) return {};
      const fieldErrors = result.error.flatten().fieldErrors;
      const mapped: Partial<Record<keyof RegisterForm, string>> = {};
      if (fieldErrors.name?.[0]) mapped.name = fieldErrors.name[0];
      if (fieldErrors.email?.[0]) mapped.email = fieldErrors.email[0];
      if (fieldErrors.password?.[0]) mapped.password = fieldErrors.password[0];
      if (fieldErrors.confirmPassword?.[0])
        mapped.confirmPassword = fieldErrors.confirmPassword[0];
      return mapped;
    }
  );

  const onSubmit = handleSubmit(async () => {
    setApiError("");
    try {
      await auth.register(values.name, values.email, values.password);
      navigate("/select-role");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro inesperado");
    }
  });

  return (
    <PageContainer>
      <BackgroundGlow />
      <Content>
        <BrandingHeader
          icon="restaurant"
          title="Lideranças Empáticas"
          subtitle="Sistema de Gestão e Contagem de Alimentos"
        />

        <GlassPanel sx={{ padding: { xs: "32px", md: "40px" } }}>
          <FormHeader>
            <FormTitle>Criar uma Conta</FormTitle>
            <FormSubtitle>
              Junte-se à nossa missão em liderança logística de alimentos.
            </FormSubtitle>
          </FormHeader>

          <form onSubmit={onSubmit}>
            <FormFields>
              <StyledInput
                label="Nome Completo"
                icon="person"
                type="text"
                name="name"
                placeholder="João Silva"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <StyledInput
                label="Endereço de Email"
                icon="mail"
                type="email"
                name="email"
                placeholder="email@organizacao.org"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <PasswordGrid>
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
                <StyledInput
                  label="Confirmar"
                  icon="shield"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              </PasswordGrid>

              {apiError && <ErrorText>{apiError}</ErrorText>}

              <StyledButton type="submit" icon="arrow_forward">
                Criar Conta
              </StyledButton>
            </FormFields>
          </form>

          <FooterContainer>
            <FooterText>
              Já possui uma conta?
              <FooterLink onClick={() => navigate("/login")}>Entrar</FooterLink>
            </FooterText>
          </FooterContainer>
        </GlassPanel>
      </Content>
    </PageContainer>
  );
}

export default RegisterPage;
