import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in boundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white px-4">
          <h1 className="text-2xl font-semibold mb-2">
            Something went wrong 🚨
          </h1>

          <p className="text-gray-400 mb-4 text-center max-w-md">
            An unexpected error occurred. Please try refreshing the page.
          </p>

          <button
            onClick={this.handleReload}
            className="px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            Reload App
          </button>

          {/* Optional: show error in dev mode */}
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 text-xs text-red-400 max-w-lg overflow-auto">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
