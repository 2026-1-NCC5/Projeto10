import type { UserSummary } from "../../types";
import {
  ModalDialog,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalContent,
  RoleGroupTitle,
  UserRow,
  UserInfo,
  UserName,
  UserEmail,
  InviteButton,
  EmptyText,
} from "./styles";


interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  availableUsers: UserSummary[];
  onInvite: (userId: string) => void;
}

const roleGroups: Array<{ key: string; label: string }> = [
  { key: "admin", label: "Administradores" },
  { key: "coordinator", label: "Coordenadores" },
  { key: "operator", label: "Operadores" },
];

function InviteMemberModal({ open, onClose, availableUsers, onInvite }: InviteMemberModalProps) {
  const hasUsers = availableUsers.length > 0;

  return (
    <ModalDialog open={open} onClose={onClose} maxWidth={false}>
      <ModalHeader>
        <ModalTitle>Convidar membro</ModalTitle>
        <CloseButton onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </CloseButton>
      </ModalHeader>

      <ModalContent>
        {!hasUsers ? (
          <EmptyText>Nenhum usuário disponível para convidar.</EmptyText>
        ) : (
          roleGroups.map(({ key, label }) => {
            const users = availableUsers.filter((u) => u.role === key);
            if (users.length === 0) return null;

            return (
              <div key={key}>
                <RoleGroupTitle>{label}</RoleGroupTitle>
                {users.map((u) => (
                  <UserRow key={u.id}>
                    <UserInfo>
                      <UserName>{u.name}</UserName>
                      <UserEmail>{u.email}</UserEmail>
                    </UserInfo>
                    <InviteButton onClick={() => onInvite(u.id)}>
                      Convidar
                    </InviteButton>
                  </UserRow>
                ))}
              </div>
            );
          })
        )}
      </ModalContent>
    </ModalDialog>
  );
}

export default InviteMemberModal;
