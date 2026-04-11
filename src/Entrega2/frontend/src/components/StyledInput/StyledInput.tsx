import type { InputHTMLAttributes } from "react";
import { useState } from "react";

import {
  InputWrapper,
  InputLabel,
  InputContainer,
  IconContainer,
  Input,
  ToggleButton,
} from "./styles";


interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: string;
  error?: string;
}

function StyledInput({ label, icon, type, error, ...props }: StyledInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <InputWrapper>
      <InputLabel>{label}</InputLabel>
      <InputContainer>
        <IconContainer>
          <span className="material-symbols-outlined">{icon}</span>
        </IconContainer>
        <Input
          type={inputType}
          style={isPassword ? { paddingRight: 48 } : undefined}
          {...props}
        />
        {isPassword && (
          <ToggleButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </ToggleButton>
        )}
      </InputContainer>
      {error && (
        <InputLabel sx={{ color: "#FFB4AB", textTransform: "none", letterSpacing: "normal", fontSize: 12 }}>
          {error}
        </InputLabel>
      )}
    </InputWrapper>
  );
}

export default StyledInput;
