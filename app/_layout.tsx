import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { trpc, trpcClient } from "@/lib/trpc";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on network errors or timeout errors
        if (error?.message?.includes('Network') || 
            error?.message?.includes('timeout') ||
            error?.message?.includes('Remote update request not successful') ||
            error?.message?.includes('Failed to download remote update')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      networkMode: 'offlineFirst', // Allow queries to run even when offline
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on network errors
        if (error?.message?.includes('Network') || 
            error?.message?.includes('timeout') ||
            error?.message?.includes('Remote update request not successful') ||
            error?.message?.includes('Failed to download remote update')) {
          return false;
        }
        return failureCount < 1;
      },
      networkMode: 'offlineFirst',
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin-login" options={{ headerShown: true }} />
      <Stack.Screen name="setup-admin" options={{ headerShown: true }} />
      <Stack.Screen name="admin" options={{ headerShown: true }} />
      <Stack.Screen name="products" options={{ headerShown: true }} />
      <Stack.Screen name="product-form" options={{ headerShown: true }} />
      <Stack.Screen name="order-form" options={{ headerShown: true }} />
      <Stack.Screen name="customers" options={{ headerShown: true }} />
      <Stack.Screen name="customer-details" options={{ headerShown: true }} />
      <Stack.Screen name="user-management" options={{ headerShown: true }} />
      <Stack.Screen name="user-form" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Add a small delay to let any network issues settle
        await new Promise(resolve => setTimeout(resolve, 1000));
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('App initialization warning:', error);
        // Hide splash screen anyway to prevent app from being stuck
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.warn('Failed to hide splash screen:', splashError);
        }
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}