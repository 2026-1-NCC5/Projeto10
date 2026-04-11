import {
  HeaderContainer,
  IconBox,
  Title,
  Subtitle,
} from "./styles";


interface BrandingHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
}

function BrandingHeader({ icon, title, subtitle }: BrandingHeaderProps) {
  return (
    <HeaderContainer>
      <IconBox>
        <span className="material-symbols-outlined">{icon}</span>
      </IconBox>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </HeaderContainer>
  );
}

export default BrandingHeader;
