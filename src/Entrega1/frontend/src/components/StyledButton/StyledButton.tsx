import type { ButtonBaseProps } from "@mui/material/ButtonBase";

import { PrimaryButton, SecondaryButton } from "./styles";


interface StyledButtonProps extends ButtonBaseProps {
  variant?: "primary" | "secondary";
  icon?: string;
}

function StyledButton({
  variant = "primary",
  icon,
  children,
  ...props
}: StyledButtonProps) {
  const Component = variant === "primary" ? PrimaryButton : SecondaryButton;

  return (
    <Component {...props}>
      <span>{children}</span>
      {icon && <span className="material-symbols-outlined">{icon}</span>}
    </Component>
  );
}

export default StyledButton;
