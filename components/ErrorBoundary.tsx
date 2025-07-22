import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  getErrorMessage = () => {
    const errorMessage = this.state.error?.message || '';
    
    if (errorMessage.includes('Remote update request not successful') ||
        errorMessage.includes('Failed to download remote update')) {
      return 'App update failed, but the app is working normally. This is just a temporary network issue with Expo servers.';
    }
    
    if (errorMessage.includes('Network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('fetch')) {
      return 'Network connection issue. The app can work offline, but some features may be limited.';
    }
    
    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      return 'Data format error. Please try again or contact support.';
    }
    
    return 'An unexpected error occurred. The app should still work normally.';
  };

  getErrorIcon = () => {
    const errorMessage = this.state.error?.message || '';
    
    if (errorMessage.includes('Remote update request not successful') ||
        errorMessage.includes('Failed to download remote update')) {
      return <WifiOff size={64} color="#F39C12" />;
    }
    
    if (errorMessage.includes('Network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('fetch')) {
      return <Wifi size={64} color="#E74C3C" />;
    }
    
    return <AlertTriangle size={64} color="#E74C3C" />;
  };

  getErrorTitle = () => {
    const errorMessage = this.state.error?.message || '';
    
    if (errorMessage.includes('Remote update request not successful') ||
        errorMessage.includes('Failed to download remote update')) {
      return 'Update Check Failed';
    }
    
    if (errorMessage.includes('Network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('fetch')) {
      return 'Connection Issue';
    }
    
    return 'Something went wrong';
  };

  render() {
    if (this.state.hasError) {
      const isUpdateError = this.state.error?.message?.includes('Remote update request not successful') ||
                           this.state.error?.message?.includes('Failed to download remote update');
      
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            {this.getErrorIcon()}
            <Text style={styles.title}>{this.getErrorTitle()}</Text>
            <Text style={styles.message}>
              {this.getErrorMessage()}
            </Text>
            {!isUpdateError && this.state.error?.message && (
              <Text style={styles.errorDetails}>
                Error: {this.state.error.message}
              </Text>
            )}
            <Pressable style={styles.retryButton} onPress={this.handleRetry}>
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.retryButtonText}>
                {isUpdateError ? 'Continue Anyway' : 'Try Again'}
              </Text>
            </Pressable>
            {isUpdateError && (
              <Text style={styles.updateNote}>
                This error doesn't affect app functionality. It's just Expo trying to check for updates.
              </Text>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1810',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 12,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4A574',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateNote: {
    fontSize: 12,
    color: '#6B5B73',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});