import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full py-6 text-center bg-transparent">
          <p className="text-sm text-red-600">A non-fatal UI error occurred in a footer component.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
