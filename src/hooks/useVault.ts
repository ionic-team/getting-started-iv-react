import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { useEffect, useMemo, useState } from 'react';

const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact',
  type: VaultType.SecureStorage,
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
        deviceSecurityType: DeviceSecurityType.SystemPasscode,
      };
  }
};

export const useVault = () => {
  const [session, setSession] = useState<string | undefined>(undefined);
  const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);
  const [lockType, setLockType] = useState<LockType>(undefined);

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

    console.log(vault.config);

    return vault;
  }, []);

  useEffect(() => {
    if (lockType) {
      const { type, deviceSecurityType } = getConfigUpdates(lockType);
      vault.updateConfig({ ...vault.config, type, deviceSecurityType });
    }
  }, [lockType, vault]);

  const storeSession = async (value: string): Promise<void> => {
    setSession(value);
    await vault.setValue(key, value);
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

  return {
    session,
    vaultIsLocked,

    lockVault,
    unlockVault,

    storeSession,
    restoreSession,

    lockType,
    setLockType,
  };
};
