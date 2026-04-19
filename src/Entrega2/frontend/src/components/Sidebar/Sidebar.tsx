import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import {
  SidebarRoot,
  BrandSection,
  BrandIconBox,
  BrandTitle,
  BrandSubtitle,
  NavSection,
  NavItem,
  NavItemText,
  NavSectionDivider,
  BottomSection,
  ProfileEditContainer,
  ProfileEditLabel,
  ProfileEditInput,
  ProfileEditActions,
  SmallButton,
  SettingsPanel,
} from "./styles";


type NavItem = { label: string; icon: string; path: string };

function getNavItems(role: string | null): NavItem[] {
  const items: NavItem[] = [
    { label: "Coleta", icon: "inventory_2", path: "/home" },
  ];
  if (role === "coordinator" || role === "admin") {
    items.push({ label: "Dashboard", icon: "bar_chart", path: "/dashboard" });
  }
  items.push({ label: "Panorama", icon: "public", path: "/overview" });
  items.push({ label: "Ranking", icon: "emoji_events", path: "/ranking" });
  items.push({ label: "Equipes", icon: "groups", path: "/teams" });
  if (role === "admin") {
    items.push({ label: "Admin", icon: "admin_panel_settings", path: "/admin" });
  }
  return items;
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? "");

  function handleNavItem(path: string) {
    navigate(path);
  }

  function handleProfileToggle() {
    setProfileOpen((prev) => !prev);
    setSettingsOpen(false);
  }

  function handleSettingsToggle() {
    setSettingsOpen((prev) => !prev);
    setProfileOpen(false);
  }

  function handleSaveName() {
    setProfileOpen(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <SidebarRoot>
      <BrandSection>
        <BrandIconBox>
          <span className="material-symbols-outlined">volunteer_activism</span>
        </BrandIconBox>
        <div>
          <BrandTitle>Empathic Leaders</BrandTitle>
          <BrandSubtitle>Coleta de Alimentos</BrandSubtitle>
        </div>
      </BrandSection>

      <NavSection>
        {getNavItems(user?.role ?? null).map((item) => (
          <NavItem
            key={item.path}
            active={location.pathname === item.path}
            onClick={() => handleNavItem(item.path)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <NavItemText>{item.label}</NavItemText>
          </NavItem>
        ))}
      </NavSection>

      <NavSectionDivider />

      <BottomSection>
        {profileOpen && (
          <ProfileEditContainer>
            <ProfileEditLabel>Editar perfil</ProfileEditLabel>
            <ProfileEditInput
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="Seu nome"
            />
            <ProfileEditActions>
              <SmallButton variant="ghost" onClick={() => setProfileOpen(false)}>
                Cancelar
              </SmallButton>
              <SmallButton variant="primary" onClick={handleSaveName}>
                Salvar
              </SmallButton>
            </ProfileEditActions>
          </ProfileEditContainer>
        )}

        {settingsOpen && (
          <SettingsPanel>
            <SmallButton
              variant="ghost"
              onClick={handleLogout}
              sx={{ width: "100%", justifyContent: "flex-start", gap: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                logout
              </span>
              Sair
            </SmallButton>
          </SettingsPanel>
        )}

        <NavItem
          active={profileOpen}
          onClick={handleProfileToggle}
        >
          <span className="material-symbols-outlined">person</span>
          <NavItemText>{nameValue || user?.name || "Perfil"}</NavItemText>
        </NavItem>

        <NavItem
          active={settingsOpen}
          onClick={handleSettingsToggle}
        >
          <span className="material-symbols-outlined">settings</span>
          <NavItemText>Configuracoes</NavItemText>
        </NavItem>
      </BottomSection>
    </SidebarRoot>
  );
}

export default Sidebar;
