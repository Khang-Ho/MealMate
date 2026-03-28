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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackParamList } from '../navigation/types';

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
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#0d631b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} className="self-start mb-6 py-2">
            <Text className="text-secondary font-semibold">← Back</Text>
          </TouchableOpacity>

          {step === 'form' ? (
            <>
              <Text className="text-2xl font-bold text-on-surface mb-2">Create account</Text>
              <Text className="text-base text-on-surface-variant mb-8">
                Save recipes, pantry, and optimized store routes to your profile.
              </Text>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-semibold text-on-surface mb-2">Email</Text>
                  <TextInput
                    className="rounded-xl px-4 py-3.5 text-base text-on-surface bg-surface-container-high border border-outline-variant/60"
                    placeholder="you@example.com"
                    placeholderTextColor="#707a6c"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-on-surface mb-2">Password</Text>
                  <TextInput
                    className="rounded-xl px-4 py-3.5 text-base text-on-surface bg-surface-container-high border border-outline-variant/60"
                    placeholder="••••••••"
                    placeholderTextColor="#707a6c"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textContentType="newPassword"
                  />
                </View>
              </View>

              <View nativeID="clerk-captcha" className="h-1" />

              {message ? <Text className="text-sm text-error mt-4">{message}</Text> : null}

              <TouchableOpacity
                onPress={startSignUp}
                disabled={submitting || !email.trim() || !password}
                className="mt-8 rounded-xl bg-primary py-4 items-center active:opacity-90 disabled:opacity-40"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-base font-bold text-on-primary">Sign up</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-on-surface mb-2">Check your email</Text>
              <Text className="text-base text-on-surface-variant mb-8">
                Enter the verification code we sent to {email.trim()}.
              </Text>
              <TextInput
                className="rounded-xl px-4 py-3.5 text-base text-on-surface bg-surface-container-high border border-outline-variant/60 mb-4"
                placeholder="6-digit code"
                placeholderTextColor="#707a6c"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
              />
              {message ? <Text className="text-sm text-error mb-4">{message}</Text> : null}
              <TouchableOpacity
                onPress={verifyCode}
                disabled={submitting || code.trim().length < 4}
                className="rounded-xl bg-primary py-4 items-center active:opacity-90 disabled:opacity-40"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-base font-bold text-on-primary">Verify & continue</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })}
                className="mt-4 py-2"
              >
                <Text className="text-center text-secondary font-semibold">Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
