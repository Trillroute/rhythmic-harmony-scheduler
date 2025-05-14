
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error(`React ErrorBoundary caught an error in ${this.props.componentName || 'component'}:`, error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    // Force a refresh of the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden p-6">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              Component Error
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {this.props.componentName ? 
                `The ${this.props.componentName} component encountered an error.` : 
                'A component encountered an error.'}
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="flex justify-center">
              <Button onClick={this.handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
