import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '40px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}>
              ⚠️
            </div>
            <h2 style={{
              color: '#1e293b',
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 8px',
            }}>
              Đã xảy ra lỗi không mong muốn
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              lineHeight: 1.6,
              margin: '0 0 24px',
            }}>
              Ứng dụng gặp sự cố. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '12px',
                color: '#991b1b',
                fontFamily: 'monospace',
                overflowX: 'auto',
                maxHeight: '120px',
                overflowY: 'auto',
              }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
              >
                Tải lại trang
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#fff',
                  color: '#334155',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
