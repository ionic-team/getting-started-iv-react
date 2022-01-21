import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultError,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { useEffect, useMemo, useState } from 'react';

const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact7890',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
const key = 'sessionData';

type LockType = 'NoLocking' | 'Biometrics' | 'SystemPasscode' | undefined;

const getConfigUpdates = (lockType: LockType) => {
  switch (lockType) {
    case 'Biometrics':
      return {
        type: VaultType.DeviceSecurity,
        deviceSecurityType: DeviceSecurityType.Biometrics,
      };
    case 'SystemPasscode':
      return {
        type: VaultType.DeviceSecurity,
        deviceSecurityType: DeviceSecurityType.SystemPasscode,
      };
    default:
      return {
        type: VaultType.SecureStorage,
        deviceSecurityType: DeviceSecurityType.None,
      };
  }
};

export const useVault = () => {
  const [session, setSession] = useState<string | undefined>(undefined);
  const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);
  const [lockType, setLockType] = useState<LockType>(undefined);
  const [vaultExists, setVaultExists] = useState<boolean>(false);

  const [type, setType] = useState<string>('');
  const [security, setSecurity] = useState<string>('');

  const vault = useMemo(() => {
    const vault =
      Capacitor.getPlatform() === 'web'
        ? new BrowserVault(config)
        : new Vault(config);

    vault.onLock(() => {
      setVaultIsLocked(true);
      setSession(undefined);
    });

    vault.onUnlock(() => setVaultIsLocked(false));

    vault.isLocked().then(setVaultIsLocked);
    vault.doesVaultExist().then(setVaultExists);

    setType(vault.config.type.toString());
    setSecurity(vault.config.deviceSecurityType?.toString() || '');

    vault.onError(async (err: VaultError) => {
      if (err.code === 8) {
        console.error('I AM A CUSTOM ERROR');

        await vault.updateConfig({
          ...vault.config,
          type: VaultType.SecureStorage,
          deviceSecurityType: DeviceSecurityType.None,
        });
        setType(vault.config.type.toString());
        setSecurity(vault.config.deviceSecurityType?.toString() || '');
      }
    });

    return vault;
  }, []);

  useEffect(() => {
    const run = async () => {
      const { type, deviceSecurityType } = getConfigUpdates(lockType);
      await vault.updateConfig({ ...vault.config, type, deviceSecurityType });
      console.log('Vault Config Updated', {
        type: vault.config.type,
        security: vault.config?.deviceSecurityType || '',
      });
      setType(vault.config.type.toString());
      setSecurity(vault.config.deviceSecurityType?.toString() || '');
    };

    if (lockType) {
      run();
    }
  }, [lockType, vault]);

  const storeSession = async (value: string): Promise<void> => {
    setSession(value);
    await vault.setValue(key, value);
    const exists = await vault.doesVaultExist();
    setVaultExists(exists);
  };

  const restoreSession = async (): Promise<void> => {
    const value = await vault.getValue(key);
    setSession(value);
  };

  const lockVault = async (): Promise<void> => {
    await vault.lock();
  };

  const unlockVault = async (): Promise<void> => {
    await vault.unlock();
  };

  const clearVault = async (): Promise<void> => {
    await vault.clear();
    setLockType('NoLocking');
    setSession(undefined);
    const exists = await vault.doesVaultExist();
    setVaultExists(exists);
  };

  return {
    session,
    vaultIsLocked,

    lockVault,
    unlockVault,

    storeSession,
    restoreSession,

    lockType,
    setLockType,

    vaultExists,
    clearVault,

    type,
    security,
  };
};
