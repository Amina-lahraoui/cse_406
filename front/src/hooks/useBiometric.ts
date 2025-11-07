import { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

/**
 * Hook pour gérer l'authentification biométrique (Face ID / Touch ID) sur React Native
 * Nécessite: expo-secure-store, expo-crypto, react-native-biometrics
 * 
 * Installation:
 * npx expo install react-native-biometrics expo-secure-store expo-crypto
 */

interface BiometricConfig {
  deviceId: string;
  isAvailable: boolean;
  biometryType: 'Face' | 'Fingerprint' | 'Iris' | null;
}

interface UseBiometricReturn {
  config: BiometricConfig | null;
  loading: boolean;
  error: string | null;
  checkBiometricAvailability: () => Promise<void>;
  generateBiometricSignature: () => Promise<string | null>;
  storeBiometricId: (biometricId: string) => Promise<void>;
  retrieveBiometricId: () => Promise<string | null>;
  clearBiometricId: () => Promise<void>;
}

export const useBiometric = (): UseBiometricReturn => {
  const [config, setConfig] = useState<BiometricConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBiometricAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Import dynamique pour éviter les problèmes en environnement non-mobile
      const { default: RNBiometrics } = await import('react-native-biometrics');
      const biometrics = new RNBiometrics();

      // Vérifier la disponibilité
      const available = await biometrics.isSensorAvailable();
      
      if (!available.available) {
        setError('Biometric not available on this device');
        setConfig({
          deviceId: '',
          isAvailable: false,
          biometryType: null,
        });
        return;
      }

      // Générer un ID unique du device
      const deviceId = await generateDeviceId();

      setConfig({
        deviceId,
        isAvailable: true,
        biometryType: available.biometryType as 'Face' | 'Fingerprint' | 'Iris' | null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setConfig({
        deviceId: '',
        isAvailable: false,
        biometryType: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const generateDeviceId = async (): Promise<string> => {
    // Créer un ID unique basé sur le hash du device
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    const combined = `${timestamp}-${random}`;
    
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    
    return hash;
  };

  const generateBiometricSignature = useCallback(async (): Promise<string | null> => {
    try {
      if (!config?.isAvailable) {
        setError('Biometric not available');
        return null;
      }

      const { default: RNBiometrics } = await import('react-native-biometrics');
      const biometrics = new RNBiometrics();

      // Demander l'authentification biométrique
      const result = await biometrics.simplePrompt({
        promptMessage: 'Authenticate to continue',
        fallbackPromptMessage: 'Use your PIN to continue',
      });

      if (!result.success) {
        setError('Biometric authentication failed');
        return null;
      }

      // Générer une signature basée sur les données du device
      const signatureData = `${config.deviceId}-${Date.now()}`;
      const signature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        signatureData
      );

      setError(null);
      return signature;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate signature';
      setError(message);
      return null;
    }
  }, [config]);

  const storeBiometricId = useCallback(async (biometricId: string) => {
    try {
      await SecureStore.setItemAsync('biometric_id', biometricId);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to store biometric ID';
      setError(message);
      throw err;
    }
  }, []);

  const retrieveBiometricId = useCallback(async (): Promise<string | null> => {
    try {
      const biometricId = await SecureStore.getItemAsync('biometric_id');
      setError(null);
      return biometricId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve biometric ID';
      setError(message);
      return null;
    }
  }, []);

  const clearBiometricId = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('biometric_id');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear biometric ID';
      setError(message);
      throw err;
    }
  }, []);

  return {
    config,
    loading,
    error,
    checkBiometricAvailability,
    generateBiometricSignature,
    storeBiometricId,
    retrieveBiometricId,
    clearBiometricId,
  };
};