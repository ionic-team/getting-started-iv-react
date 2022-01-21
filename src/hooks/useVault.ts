import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultError,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { useIonModal } from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import CustomPasscode from '../components/CustomPasscode';

const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
const key = 'sessionData';

type LockType =
  | 'NoLocking'
  | 'Biometrics'
  | 'SystemPasscode'
  | 'CustomPasscode'
  | undefined;

type CustomPasscodeCallback = (opts: { data: any; role?: string }) => void;
let passcodeRequestCallback: CustomPasscodeCallback = () => {};

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
    case 'CustomPasscode':
      return {
        type: VaultType.CustomPasscode,
        deviceSecurityType: DeviceSecurityType.None,
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

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSetPasscodeMode, setIsSetPasscodeMode] = useState<boolean>(false);
  const [present, dismiss] = useIonModal(CustomPasscode, {
    /** Determines if the user needs to set their passcode, or verify it. */
    isSetPasscodeMode,
    /** Call our custom callback when the modal is dismissed. */
    onDismiss: (opts: { data: any; role?: string }) =>
      passcodeRequestCallback(opts),
  });

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

    vault.onPasscodeRequested(async isSetPasscodeMode => {
      return new Promise(resolve => {
        /** Define our passcode request callback functionality. */

        passcodeRequestCallback = (opts: { data: any; role?: string }) => {
          /** If the user cancelled the prompt we will pass in an empty string */
          /** Otherwise, send over the passcode provided by the user */
          if (opts.role === 'cancel') vault.setCustomPasscode('');
          else vault.setCustomPasscode(opts.data);
          setIsSetPasscodeMode(false);
          setShowModal(false);
          resolve();
        };

        /** Update state variables so we can show the modal in it's correct mode */
        setIsSetPasscodeMode(isSetPasscodeMode);
        setShowModal(true);
      });
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

  useEffect(() => {
    /** showModal let us know if we should show or hide the modal. */
    showModal ? present() : dismiss();
  }, [showModal, present, dismiss]);

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
