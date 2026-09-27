import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
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
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 font-sans">
          <div className="bg-white max-w-lg w-full rounded-[30px] p-10 shadow-2xl text-center border border-gray-100">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-ink mb-4">Oops! We hit a snag.</h1>
            <p className="text-gray-500 mb-8">
              {this.state.error?.message || "An unexpected error occurred in our system. Don't worry, your trips are safe."}
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-4 bg-ink text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-md"
              >
                <RefreshCw className="w-5 h-5" /> Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                className="w-full py-4 bg-gray-100 text-ink font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Home className="w-5 h-5" /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
