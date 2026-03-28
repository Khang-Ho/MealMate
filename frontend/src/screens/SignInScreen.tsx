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
import { useSignIn, useSSO, isClerkAPIResponseError } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    if (!signIn || !setActive) return;
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await signIn.create({
        strategy: 'password',
        identifier: email.trim(),
        password,
      });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        return;
      }
      setMessage('Đăng nhập chưa hoàn tất. Thử lại hoặc dùng Google.');
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setMessage(err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? 'Đăng nhập thất bại');
      } else {
        setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, setActive, signIn]);

  const onGoogleSignIn = useCallback(async () => {
    setMessage(null);
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/'),
      });
      if (createdSessionId && ssoSetActive) {
        await ssoSetActive({ session: createdSessionId });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setMessage(err.errors?.[0]?.longMessage ?? 'Google sign-in thất bại');
      } else {
        setMessage('Google sign-in thất bại. Thử lại.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

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
          contentContainerStyle={{ paddingTop: 48, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4"
              style={{ shadowColor: '#0d631b', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
              <MaterialIcons name="restaurant" size={32} color="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-on-surface">Chào mừng trở lại</Text>
            <Text className="text-sm text-on-surface-variant mt-1 text-center">
              Đăng nhập để đồng bộ pantry, routes và danh sách mua sắm
            </Text>
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            onPress={onGoogleSignIn}
            disabled={googleLoading}
            className="flex-row items-center justify-center gap-3 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low mb-6 active:opacity-80"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <GoogleIcon />
                <Text className="text-base font-semibold text-on-surface">Tiếp tục với Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 h-px bg-outline-variant" />
            <Text className="text-xs text-on-surface-variant">hoặc</Text>
            <View className="flex-1 h-px bg-outline-variant" />
          </View>

          {/* Email/Password form */}
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
                textContentType="emailAddress"
              />
            </View>
            <View>
              <Text className="text-sm font-semibold text-on-surface mb-2">Mật khẩu</Text>
              <TextInput
                className="rounded-xl px-4 py-3.5 text-base text-on-surface bg-surface-container-high border border-outline-variant/60"
                placeholder="••••••••"
                placeholderTextColor="#707a6c"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
              />
            </View>
          </View>

          {message ? (
            <Text className="text-sm text-error mt-4 text-center">{message}</Text>
          ) : null}

          <TouchableOpacity
            onPress={onSubmit}
            disabled={submitting || !email.trim() || !password}
            className="mt-6 rounded-xl bg-primary py-4 items-center active:opacity-90"
            style={{
              shadowColor: '#0d631b',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
              opacity: (submitting || !email.trim() || !password) ? 0.45 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-on-primary">Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-8 gap-1">
            <Text className="text-on-surface-variant">Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} hitSlop={8}>
              <Text className="text-secondary font-semibold"> Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      <Text style={{ fontSize: 18, lineHeight: 20 }}>G</Text>
    </View>
  );
}
