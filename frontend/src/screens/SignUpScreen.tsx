import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

type Step = 'form' | 'verify';

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'code' | null>(null);

  const startSignUp = useCallback(async () => {
    if (!signUp || !setActive) return;
    setMessage(null);
    setSubmitting(true);
    try {
      const su = await signUp.create({
        emailAddress: email.trim(),
        password,
      });
      const needsEmail =
        su.status === 'missing_requirements' &&
        su.unverifiedFields?.includes('email_address');
      if (needsEmail) {
        await su.prepareEmailAddressVerification({ strategy: 'email_code' });
        setStep('verify');
        return;
      }
      if (su.status === 'complete' && su.createdSessionId) {
        await setActive({ session: su.createdSessionId });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setMessage(err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? 'Sign up failed');
      } else {
        setMessage('Something went wrong. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, setActive, signUp]);

  const verifyCode = useCallback(async () => {
    if (!signUp || !setActive) return;
    setMessage(null);
    setSubmitting(true);
    try {
      const su = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (su.status === 'complete' && su.createdSessionId) {
        await setActive({ session: su.createdSessionId });
        return;
      }
      setMessage('Could not verify. Check the code and try again.');
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setMessage(err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? 'Verification failed');
      } else {
        setMessage('Verification failed.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [code, setActive, signUp]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d631b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium Header Background */}
      <LinearGradient
        colors={['#0d631b', '#2e7d32', '#4ade80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name={step === 'form' ? "person-add" : "mark-email-read"} size={36} color="#0d631b" />
            </View>
            <Text style={styles.headerTitle}>
              {step === 'form' ? 'Create account' : 'Check your email'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {step === 'form'
                ? 'Save recipes, pantry, and optimized store routes to your profile.'
                : `Enter the verification code we sent to ${email.trim()}.`}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content Floating Over Header */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {step === 'form' ? (
              <>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email address</Text>
                  <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="email" size={20} color={focusedField === 'email' ? '#0d631b' : '#9ca3af'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="lock" size={20} color={focusedField === 'password' ? '#0d631b' : '#9ca3af'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#9ca3af"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry
                      textContentType="newPassword"
                    />
                  </View>
                </View>

                <View nativeID="clerk-captcha" style={{ height: 1 }} />

                {message ? <Text style={styles.errorText}>{message}</Text> : null}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={startSignUp}
                  disabled={submitting || !email.trim() || !password}
                  activeOpacity={0.85}
                  style={[
                    styles.submitButtonWrapper,
                    (submitting || !email.trim() || !password) && styles.submitButtonDisabled
                  ]}
                >
                  <LinearGradient
                    colors={['#0d631b', '#2e7d32']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGrad}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Sign Up</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignIn')} hitSlop={12}>
                    <Text style={styles.footerLink}> Sign in</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Verification Code Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <View style={[styles.inputWrapper, focusedField === 'code' && styles.inputWrapperFocused]}>
                    <MaterialIcons name="vpn-key" size={20} color={focusedField === 'code' ? '#0d631b' : '#9ca3af'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { fontSize: 22, letterSpacing: 8, textAlign: 'center' }]}
                      placeholder="000000"
                      placeholderTextColor="#cbd5e1"
                      value={code}
                      onChangeText={setCode}
                      onFocus={() => setFocusedField('code')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                  </View>
                </View>

                {message ? <Text style={styles.errorText}>{message}</Text> : null}

                <TouchableOpacity
                  onPress={verifyCode}
                  disabled={submitting || code.trim().length < 4}
                  activeOpacity={0.85}
                  style={[
                    styles.submitButtonWrapper,
                    (submitting || code.trim().length < 4) && styles.submitButtonDisabled
                  ]}
                >
                  <LinearGradient
                    colors={['#0d631b', '#2e7d32']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGrad}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Verify & Continue</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>Resend code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f7fbf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7fbf0',
  },
  headerGradient: {
    width: '100%',
    height: 380,
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerSafeArea: {
    flex: 1,
  },
  headerContent: {
    paddingHorizontal: 32,
    marginTop: 30, // Added margin top since back button is removed
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    lineHeight: 22,
  },
  keyboardView: {
    flex: 1,
    marginTop: 220,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 36,
    elevation: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#4ade80',
    backgroundColor: '#ffffff',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
    height: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButtonWrapper: {
    overflow: 'hidden',
    borderRadius: 18,
    marginTop: 8,
    shadowColor: '#0d631b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonGrad: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    color: '#0d631b',
    fontSize: 14,
    fontWeight: '800',
  },
  resendButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#0d631b',
    fontSize: 15,
    fontWeight: '700',
  },
});
