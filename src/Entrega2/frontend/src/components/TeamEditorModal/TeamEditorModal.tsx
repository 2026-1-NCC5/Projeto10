import { useEffect, useMemo, useState } from "react";

import type { Team, TeamMember, UserSummary } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
import {
  addMember,
  diffTeamDraft,
  fromTeam,
  hasChanges,
  removeMember,
  setDescription,
  setName,
  validateDraft,
} from "../../services/teamDraft";
import type { TeamDraft } from "../../services/teamDraft";
import StyledButton from "../StyledButton/StyledButton";
import StyledInput from "../StyledInput/StyledInput";
import {
  ModalDialog,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalContent,
  ModalFooter,
  SectionLabel,
  UserList,
  UserRow,
  UserInfo,
  UserName,
  UserEmail,
  UserRoleBadge,
  ValidationBanner,
  EmptyText,
} from "./styles";


interface Props {
  open: boolean;
  mode: "create" | "edit";
  team?: Team | null;
  onClose: () => void;
  onSaved: () => void;
}


const roleLabel: Record<string, string> = {
  admin: "Admin",
  coordinator: "Coord.",
  operator: "Operador",
};


function userToMember(user: UserSummary): TeamMember {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "operator",
  };
}


function emptyDraft(): TeamDraft {
  return { name: "", description: "", members: [] };
}


function TeamEditorModal({ open, mode, team, onClose, onSaved }: Props) {
  const { token } = useAuth();
  const [draft, setDraft] = useState<TeamDraft>(emptyDraft);
  const [initialDraft, setInitialDraft] = useState<TeamDraft>(emptyDraft);
  const [unassigned, setUnassigned] = useState<UserSummary[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !token) return;
    setError("");
    setSaving(false);
    if (mode === "create") {
      const fresh = emptyDraft();
      setDraft(fresh);
      setInitialDraft(fresh);
    } else if (team) {
      const fresh = fromTeam(team);
      setDraft(fresh);
      setInitialDraft(fresh);
    }
    api
      .getUsers(token, { unassigned: true })
      .then(setUnassigned)
      .catch(() => setUnassigned([]));
  }, [open, mode, team, token]);

  const validation = useMemo(() => validateDraft(draft), [draft]);
  const diff = useMemo(() => diffTeamDraft(initialDraft, draft), [initialDraft, draft]);
  const dirty = hasChanges(diff);

  const availableUsers = useMemo(() => {
    const draftIds = new Set(draft.members.map((m) => m.id));
    return unassigned.filter((u) => !draftIds.has(u.id));
  }, [unassigned, draft.members]);

  function handleAdd(user: UserSummary) {
    setDraft((prev) => addMember(prev, userToMember(user)));
  }

  function handleRemove(userId: string) {
    setDraft((prev) => removeMember(prev, userId));
  }

  async function handleSave() {
    if (!token || !validation.valid) return;
    setSaving(true);
    setError("");
    try {
      if (mode === "create") {
        const coordinatorIds = draft.members
          .filter((m) => m.role === "coordinator")
          .map((m) => m.id);
        const memberIds = draft.members
          .filter((m) => m.role !== "coordinator")
          .map((m) => m.id);
        await api.createTeam(token, {
          name: draft.name.trim(),
          description: draft.description.trim() || undefined,
          coordinatorIds,
          memberIds,
        });
      } else if (team) {
        await api.saveTeamDraft(token, team.id, diff);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    onClose();
  }

  return (
    <ModalDialog open={open} onClose={handleClose} maxWidth={false}>
      <ModalHeader>
        <ModalTitle>
          {mode === "create" ? "Criar equipe" : `Editar ${team?.name ?? ""}`}
        </ModalTitle>
        <CloseButton onClick={handleClose}>
          <span className="material-symbols-outlined">close</span>
        </CloseButton>
      </ModalHeader>

      <ModalContent>
        <StyledInput
          label="Nome da equipe"
          icon="groups"
          type="text"
          value={draft.name}
          onChange={(e) => setDraft((prev) => setName(prev, e.target.value))}
        />
        <StyledInput
          label="Descrição (opcional)"
          icon="description"
          type="text"
          value={draft.description}
          onChange={(e) => setDraft((prev) => setDescription(prev, e.target.value))}
        />

        <SectionLabel>Membros da equipe ({draft.members.length})</SectionLabel>
        <UserList>
          {draft.members.length === 0 ? (
            <EmptyText>Nenhum membro adicionado ainda.</EmptyText>
          ) : (
            draft.members.map((m) => (
              <UserRow key={m.id} onClick={() => handleRemove(m.id)}>
                <UserInfo>
                  <UserName>{m.name}</UserName>
                  <UserEmail>{m.email}</UserEmail>
                </UserInfo>
                <UserRoleBadge>{roleLabel[m.role] ?? m.role}</UserRoleBadge>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  remove_circle
                </span>
              </UserRow>
            ))
          )}
        </UserList>

        <SectionLabel>Adicionar usuários disponíveis</SectionLabel>
        <UserList>
          {availableUsers.length === 0 ? (
            <EmptyText>Nenhum usuário disponível.</EmptyText>
          ) : (
            availableUsers.map((u) => (
              <UserRow key={u.id} onClick={() => handleAdd(u)}>
                <UserInfo>
                  <UserName>{u.name}</UserName>
                  <UserEmail>{u.email}</UserEmail>
                </UserInfo>
                <UserRoleBadge>{roleLabel[u.role ?? ""] ?? u.role}</UserRoleBadge>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  add_circle
                </span>
              </UserRow>
            ))
          )}
        </UserList>

        <ValidationBanner valid={validation.valid}>
          {validation.valid
            ? dirty
              ? "Pronto para salvar."
              : "Sem alterações pendentes."
            : validation.issues.join(" · ")}
        </ValidationBanner>

        {error && <ValidationBanner valid={false}>{error}</ValidationBanner>}
      </ModalContent>

      <ModalFooter>
        <StyledButton variant="secondary" onClick={handleClose} disabled={saving}>
          Cancelar
        </StyledButton>
        <StyledButton
          variant="primary"
          disabled={!validation.valid || (mode === "edit" && !dirty) || saving}
          onClick={handleSave}
        >
          {saving ? "Salvando..." : mode === "create" ? "Criar equipe" : "Salvar alterações"}
        </StyledButton>
      </ModalFooter>
    </ModalDialog>
  );
}


export default TeamEditorModal;
