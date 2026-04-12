import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

import { ErrorRoot, ErrorTitle, ErrorMessage } from "./styles";


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}


interface State {
  hasError: boolean;
  message: string;
}


class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary capturou:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorRoot>
          <ErrorTitle>Algo deu errado ao renderizar esta seção.</ErrorTitle>
          <ErrorMessage>{this.state.message}</ErrorMessage>
        </ErrorRoot>
      );
    }
    return this.props.children;
  }
}


export default ErrorBoundary;
