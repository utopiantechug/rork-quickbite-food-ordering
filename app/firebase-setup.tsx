import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react-native';

export default function FirebaseSetupScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const copyToClipboard = (text: string) => {
    // For web, use navigator.clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      <View style={styles.stepContent}>
        {children}
      </View>
    </View>
  );

  const CodeBlock = ({ children }: { children: string }) => (
    <View style={styles.codeBlock}>
      <Text style={styles.codeText}>{children}</Text>
      <TouchableOpacity
        style={styles.copyButton}
        onPress={() => copyToClipboard(children)}
      >
        <Copy size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Firebase Setup Guide',
          headerStyle: { backgroundColor: '#FF6B35' },
          headerTintColor: '#fff',
        }} 
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Firebase Setup Guide</Text>
        <Text style={styles.headerSubtitle}>
          Follow these steps to connect your app to Firebase for cloud backup and sync
        </Text>
      </View>

      <Step number={1} title="Create Firebase Project">
        <Text style={styles.stepText}>
          1. Go to the Firebase Console and create a new project
        </Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleOpenLink('https://console.firebase.google.com/')}
        >
          <ExternalLink size={16} color="#FF6B35" />
          <Text style={styles.linkText}>Open Firebase Console</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>
          2. Choose a project name (e.g., "my-bakery-app")
          {'\n'}3. Enable Google Analytics (optional)
          {'\n'}4. Click "Create project"
        </Text>
      </Step>

      <Step number={2} title="Add Web App">
        <Text style={styles.stepText}>
          1. In your Firebase project, click "Add app" and select the web icon (&lt;/&gt;)
          {'\n'}2. Register your app with a nickname (e.g., "Bakery Web App")
          {'\n'}3. Don't check "Set up Firebase Hosting" for now
          {'\n'}4. Click "Register app"
        </Text>
      </Step>

      <Step number={3} title="Get Configuration">
        <Text style={styles.stepText}>
          Copy the Firebase configuration object that appears after registering your app.
          It should look like this:
        </Text>
        <CodeBlock>{`const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};`}</CodeBlock>
      </Step>

      <Step number={4} title="Update App Configuration">
        <Text style={styles.stepText}>
          1. Open the file <Text style={styles.filename}>lib/firebase.ts</Text> in your app
          {'\n'}2. Replace the placeholder values with your actual Firebase config
          {'\n'}3. Save the file
        </Text>
      </Step>

      <Step number={5} title="Set up Firestore Database">
        <Text style={styles.stepText}>
          1. In Firebase Console, go to "Firestore Database"
          {'\n'}2. Click "Create database"
          {'\n'}3. Choose "Start in test mode" (you can secure it later)
          {'\n'}4. Select a location for your database
          {'\n'}5. Click "Done"
        </Text>
      </Step>

      <Step number={6} title="Configure Security Rules">
        <Text style={styles.stepText}>
          For development, you can use these basic rules. Update them for production:
        </Text>
        <CodeBlock>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</CodeBlock>
        <Text style={styles.stepText}>
          1. Go to "Firestore Database" → "Rules"
          {'\n'}2. Replace the default rules with the above
          {'\n'}3. Click "Publish"
        </Text>
      </Step>

      <View style={styles.successBox}>
        <CheckCircle size={24} color="#28a745" />
        <View style={styles.successContent}>
          <Text style={styles.successTitle}>You're All Set!</Text>
          <Text style={styles.successText}>
            Your app is now connected to Firebase. You can:
            {'\n'}• Create cloud backups
            {'\n'}• Sync data across devices
            {'\n'}• Access your data from anywhere
          </Text>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Security Notice</Text>
        <Text style={styles.warningText}>
          The rules above allow anyone to read/write your data. For production apps:
          {'\n'}• Set up Firebase Authentication
          {'\n'}• Create proper security rules
          {'\n'}• Limit access to authenticated users only
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  step: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  linkText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  codeBlock: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    position: 'relative',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  copyButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  filename: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: '#d4edda',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  successContent: {
    flex: 1,
    marginLeft: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});