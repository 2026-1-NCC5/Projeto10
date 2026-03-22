import {
  IndicatorContainer,
  PulseWrapper,
  PulseRing,
  PulseDot,
  IndicatorText,
} from "./styles";


interface StatusIndicatorProps {
  label: string;
}

function StatusIndicator({ label }: StatusIndicatorProps) {
  return (
    <IndicatorContainer>
      <PulseWrapper>
        <PulseRing />
        <PulseDot />
      </PulseWrapper>
      <IndicatorText>{label}</IndicatorText>
    </IndicatorContainer>
  );
}

export default StatusIndicator;
