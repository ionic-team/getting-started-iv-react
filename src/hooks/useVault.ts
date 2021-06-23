import { useEffect, useMemo, useState } from "react";
import { DeviceSecurityType, IdentityVaultConfig,  Vault, VaultType } from "@ionic-enterprise/identity-vault";

let config: IdentityVaultConfig = {
  key: "io.ionic.getstartedivreact",
  type: "SecureStorage",
  deviceSecurityType: "SystemPasscode",
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};

const key = "sessionData";

export const useVault = () => {
  const [sessionValue, setSessionValue] = useState<string>("");
  const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);
  const [lockType, setLockType] =
    useState<"NoLocking" | "Biometrics" | "SystemPasscode" | undefined>(undefined);
  const [vaultExists, setVaultExists] = useState<boolean>(false);

  const vault = useMemo(() => {
    const vault = new Vault(config);
    vault.doesVaultExist().then((res) => setVaultExists(res));

    vault.onLock(() => {
      setVaultIsLocked(true);
      setSessionValue("");
    });

    vault.onUnlock(() => setVaultIsLocked(false));

    return vault;
  }, []);

  useEffect(() => {
    let type: VaultType;
    let deviceSecurityType: DeviceSecurityType;

    if (lockType) {
      switch (lockType) {
        case "Biometrics":
          type = "DeviceSecurity";
          deviceSecurityType = "Biometrics";
          break;
        case "SystemPasscode":
          type = "DeviceSecurity";
          deviceSecurityType = "SystemPasscode";
          break;
        default:
          type = "SecureStorage";
          deviceSecurityType = "SystemPasscode";
          break;
      }

      config = { ...config, type, deviceSecurityType };
      vault.updateConfig(config);
    }
  }, [lockType, vault]);

  const setSession = async (value: string): Promise<void> => {
    setSessionValue(value);
    await vault.setValue(key, value);
    setVaultExists(await vault.doesVaultExist());
  };

  const restoreSession = async () => {
    const value = await vault.getValue(key);
    setSessionValue(value);
  };

  const lockVault = () => {
    vault.lock();
  };

  const unlockVault = () => {
    vault.unlock();
  };

  const clearVault = async () => {
    await vault.clear();
    setLockType("NoLocking");
    setSession("");
    setVaultExists(await vault.doesVaultExist());
  };

  return {
    session: sessionValue,
    vaultIsLocked,
    vaultExists,

    lockType,
    setLockType,

    lockVault,
    unlockVault,
    clearVault,

    setSession,
    restoreSession,
  };
};
