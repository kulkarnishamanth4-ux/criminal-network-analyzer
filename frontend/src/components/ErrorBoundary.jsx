import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#0f172a] border border-red-500/40 rounded-xl text-center text-gray-200 max-w-lg mx-auto my-8 shadow-2xl">
          <FiAlertTriangle className="text-red-400 text-3xl mx-auto mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-white mb-1">Interface Render Notice</h3>
          <p className="text-xs text-gray-400 mb-4">
            A temporary component error occurred: {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-2 transition-all"
          >
            <FiRefreshCw className="text-xs" />
            Reload Component
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
