import { useEffect, useMemo, useState } from "react";

import type { Team, UserSummary } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import * as api from "../../services/api";
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


function TeamEditorModal({ open, mode, team, onClose, onSaved }: Props) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unassigned, setUnassigned] = useState<UserSummary[]>([]);
  const [selectedCoordinators, setSelectedCoordinators] = useState<Set<string>>(new Set());
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [editValid, setEditValid] = useState<{ valid: boolean; issues: string[] } | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    setError("");
    if (mode === "create") {
      setName("");
      setDescription("");
      setSelectedCoordinators(new Set());
      setSelectedMembers(new Set());
      api.getUsers(token, { unassigned: true }).then(setUnassigned).catch(() => setUnassigned([]));
    } else if (team) {
      setName(team.name);
      setDescription(team.description ?? "");
      api.getUsers(token, { unassigned: true }).then(setUnassigned).catch(() => setUnassigned([]));
      api.validateTeam(token, team.id).then(setEditValid).catch(() => setEditValid(null));
    }
  }, [open, mode, team, token]);

  const createValidation = useMemo(() => {
    const issues: string[] = [];
    if (selectedCoordinators.size < 1) issues.push("Selecione pelo menos um coordenador");
    const total = new Set([...selectedCoordinators, ...selectedMembers]).size;
    if (total < 2) issues.push("A equipe precisa de pelo menos 2 membros");
    if (!name.trim()) issues.push("Informe um nome");
    return { valid: issues.length === 0, issues };
  }, [selectedCoordinators, selectedMembers, name]);

  const coordinators = unassigned.filter((u) => u.role === "coordinator");
  const others = unassigned.filter((u) => u.role !== "coordinator");

  function toggleCoord(id: string) {
    setSelectedCoordinators((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleMember(id: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function refreshEditValidation() {
    if (!token || !team) return;
    try {
      const v = await api.validateTeam(token, team.id);
      setEditValid(v);
    } catch {
      /* ignore */
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!token || !team) return;
    try {
      await api.removeTeamMember(token, team.id, userId);
      onSaved();
      await refreshEditValidation();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleAddMember(userId: string) {
    if (!token || !team) return;
    try {
      await api.addTeamMember(token, team.id, userId);
      const fresh = await api.getUsers(token, { unassigned: true });
      setUnassigned(fresh);
      onSaved();
      await refreshEditValidation();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleCreate() {
    if (!token) return;
    if (!createValidation.valid) return;
    try {
      await api.createTeam(token, {
        name: name.trim(),
        description: description.trim() || undefined,
        coordinatorIds: Array.from(selectedCoordinators),
        memberIds: Array.from(selectedMembers),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleSaveMeta() {
    if (!token || !team) return;
    try {
      await api.updateTeam(token, team.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <ModalDialog open={open} onClose={onClose} maxWidth={false}>
      <ModalHeader>
        <ModalTitle>{mode === "create" ? "Criar equipe" : `Editar ${team?.name ?? ""}`}</ModalTitle>
        <CloseButton onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </CloseButton>
      </ModalHeader>

      <ModalContent>
        <StyledInput
          label="Nome da equipe"
          icon="groups"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <StyledInput
          label="Descrição (opcional)"
          icon="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {mode === "create" ? (
          <>
            <SectionLabel>Coordenadores (obrigatório, ≥1)</SectionLabel>
            <UserList>
              {coordinators.length === 0 ? (
                <EmptyText>Nenhum coordenador disponível.</EmptyText>
              ) : (
                coordinators.map((u) => (
                  <UserRow
                    key={u.id}
                    selected={selectedCoordinators.has(u.id)}
                    onClick={() => toggleCoord(u.id)}
                  >
                    <UserInfo>
                      <UserName>{u.name}</UserName>
                      <UserEmail>{u.email}</UserEmail>
                    </UserInfo>
                    <UserRoleBadge>{roleLabel[u.role ?? ""] ?? u.role}</UserRoleBadge>
                  </UserRow>
                ))
              )}
            </UserList>

            <SectionLabel>Outros membros</SectionLabel>
            <UserList>
              {others.length === 0 ? (
                <EmptyText>Nenhum usuário adicional disponível.</EmptyText>
              ) : (
                others.map((u) => (
                  <UserRow
                    key={u.id}
                    selected={selectedMembers.has(u.id)}
                    onClick={() => toggleMember(u.id)}
                  >
                    <UserInfo>
                      <UserName>{u.name}</UserName>
                      <UserEmail>{u.email}</UserEmail>
                    </UserInfo>
                    <UserRoleBadge>{roleLabel[u.role ?? ""] ?? u.role}</UserRoleBadge>
                  </UserRow>
                ))
              )}
            </UserList>

            <ValidationBanner valid={createValidation.valid}>
              {createValidation.valid
                ? "Equipe válida — pronta para criar."
                : createValidation.issues.join(" · ")}
            </ValidationBanner>
          </>
        ) : (
          <>
            <SectionLabel>Membros atuais</SectionLabel>
            <UserList>
              {team && team.members.length === 0 ? (
                <EmptyText>Nenhum membro.</EmptyText>
              ) : (
                team?.members.map((m) => (
                  <UserRow key={m.id} onClick={() => handleRemoveMember(m.id)}>
                    <UserInfo>
                      <UserName>{m.name}</UserName>
                      <UserEmail>{m.email}</UserEmail>
                    </UserInfo>
                    <UserRoleBadge>{roleLabel[m.role ?? ""] ?? m.role}</UserRoleBadge>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      remove_circle
                    </span>
                  </UserRow>
                ))
              )}
            </UserList>

            <SectionLabel>Adicionar usuário não alocado</SectionLabel>
            <UserList>
              {unassigned.length === 0 ? (
                <EmptyText>Nenhum usuário disponível.</EmptyText>
              ) : (
                unassigned.map((u) => (
                  <UserRow key={u.id} onClick={() => handleAddMember(u.id)}>
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

            {editValid && (
              <ValidationBanner valid={editValid.valid}>
                {editValid.valid
                  ? "Equipe válida."
                  : editValid.issues.join(" · ")}
              </ValidationBanner>
            )}
          </>
        )}

        {error && <ValidationBanner valid={false}>{error}</ValidationBanner>}
      </ModalContent>

      <ModalFooter>
        <StyledButton variant="secondary" onClick={onClose}>
          {mode === "edit" ? "Fechar" : "Cancelar"}
        </StyledButton>
        {mode === "create" ? (
          <StyledButton
            variant="primary"
            disabled={!createValidation.valid}
            onClick={handleCreate}
          >
            Criar equipe
          </StyledButton>
        ) : (
          <StyledButton
            variant="primary"
            disabled={!editValid?.valid}
            onClick={handleSaveMeta}
          >
            Salvar nome/descrição
          </StyledButton>
        )}
      </ModalFooter>
    </ModalDialog>
  );
}

export default TeamEditorModal;
