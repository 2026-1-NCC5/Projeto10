import { GlowContainer, GlowOrb } from "./styles";


function BackgroundGlow() {
  return (
    <GlowContainer>
      <GlowOrb placement="top-left" />
      <GlowOrb placement="bottom-right" />
    </GlowContainer>
  );
}

export default BackgroundGlow;
