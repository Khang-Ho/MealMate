import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView 
} from 'react-native';
import { Colors } from '../utils/colors';

export const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Aa</Text>
          <Text style={styles.heading}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back! Please enter your details.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Theme Buttons Showcase */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.invertedButton}>
              <Text style={styles.invertedButtonText}>Inverted Button</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Secondary Option</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlinedButton}>
              <Text style={styles.outlinedButtonText}>Outlined</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Mocking the UI-UX Promax Theme Components from the Image */}
        <View style={styles.fabContainer}>
            <TouchableOpacity style={[styles.fab, { backgroundColor: Colors.tertiary }]}>
              <Text style={{color: Colors.textSecondary}}>✏️</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.fab, { backgroundColor: Colors.primaryLight }]}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>✨ Label</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.roundFab, { backgroundColor: Colors.primaryLight }]}>
              <Text style={{color: '#fff'}}>✏️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.roundFab, { backgroundColor: Colors.secondary }]}>
              <Text style={{color: '#fff'}}>🏠</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.roundFab, { backgroundColor: '#BDBDBD' }]}>
              <Text style={{color: '#fff'}}>🔖</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.roundFab, { backgroundColor: Colors.danger }]}>
              <Text style={{color: '#fff'}}>🗑️</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: '300', // Matches the large 'Aa' from theme
    color: '#4A4A4A',
    marginBottom: 8,
    letterSpacing: -2,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 0, // Using Tertiary background instead of outline for 'Search' style 
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: Colors.tertiary, // Setting the F5F5F5 tertiary background for inputs
  },
  actionButtons: {
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  invertedButton: {
    backgroundColor: Colors.inverted,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  invertedButtonText: {
    color: Colors.onInverted,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.onSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.outline,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlinedButtonText: {
    color: '#A0A0A0', // Lighter dashed/outlined text matching design
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    flexWrap: 'wrap',
    gap: 12,
  },
  fab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8, // Square-ish FABs with slight radius
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  roundFab: {
    width: 48,
    height: 48,
    borderRadius: 24, // Perfect circle FABs
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});
