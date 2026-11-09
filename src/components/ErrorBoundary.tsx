import { Component, type ErrorInfo, type ReactNode } from 'react';
import { GlobalErrorPage } from '@/pages/GlobalErrorPage';

interface Etat {
  erreur: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, Etat> {
  state: Etat = { erreur: false };

  static getDerivedStateFromError(): Etat {
    return { erreur: true };
  }

  componentDidCatch(erreur: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Erreur non gérée :', erreur, info.componentStack);
    }
  }

  render() {
    if (this.state.erreur) {
      return <GlobalErrorPage onRetry={() => this.setState({ erreur: false })} />;
    }
    return this.props.children;
  }
}
