import type { Team, TeamMember } from "../types";
import type { TeamDraftDiff } from "./api";


export type TeamDraft = {
  name: string;
  description: string;
  members: TeamMember[];
};


export function fromTeam(team: Team): TeamDraft {
  return {
    name: team.name,
    description: team.description ?? "",
    members: [...team.members],
  };
}


export function addMember(draft: TeamDraft, member: TeamMember): TeamDraft {
  if (draft.members.some((m) => m.id === member.id)) return draft;
  return { ...draft, members: [...draft.members, member] };
}


export function removeMember(draft: TeamDraft, userId: string): TeamDraft {
  return { ...draft, members: draft.members.filter((m) => m.id !== userId) };
}


export function setName(draft: TeamDraft, name: string): TeamDraft {
  return { ...draft, name };
}


export function setDescription(draft: TeamDraft, description: string): TeamDraft {
  return { ...draft, description };
}


export type DraftValidation = {
  valid: boolean;
  issues: string[];
};


export function validateDraft(draft: TeamDraft): DraftValidation {
  const issues: string[] = [];
  if (!draft.name.trim()) issues.push("Informe um nome para a equipe");
  const coordinators = draft.members.filter((m) => m.role === "coordinator").length;
  if (coordinators < 1) issues.push("A equipe precisa de pelo menos um coordenador");
  if (draft.members.length < 2) issues.push("A equipe precisa de pelo menos dois membros");
  return { valid: issues.length === 0, issues };
}


export function diffTeamDraft(initial: TeamDraft, next: TeamDraft): TeamDraftDiff {
  const initialIds = new Set(initial.members.map((m) => m.id));
  const nextIds = new Set(next.members.map((m) => m.id));
  const toAdd = next.members.filter((m) => !initialIds.has(m.id)).map((m) => m.id);
  const toRemove = initial.members.filter((m) => !nextIds.has(m.id)).map((m) => m.id);
  const metaChanged =
    initial.name.trim() !== next.name.trim() ||
    (initial.description ?? "").trim() !== (next.description ?? "").trim();
  return {
    metaChanged,
    name: metaChanged ? next.name.trim() : undefined,
    description: metaChanged ? next.description.trim() : undefined,
    toAdd,
    toRemove,
  };
}


export function hasChanges(diff: TeamDraftDiff): boolean {
  return diff.metaChanged || diff.toAdd.length > 0 || diff.toRemove.length > 0;
}
