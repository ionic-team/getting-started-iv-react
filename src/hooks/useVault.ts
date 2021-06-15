import { useMemo, useState } from "react";
import { Vault } from "@ionic-enterprise/identity-vault";

const config = {
  key: "io.ionic.getstartedivreact",
  type: "SecureStorage" as any,
  deviceSecurityType: "SystemPasscode" as any,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};

const key = "sessionData";

export const useVault = () => {
  const [sessionValue, setSessionValue] = useState<string>("");
  const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);

  const vault = useMemo(() => {
    const vault = new Vault(config);

    vault.onLock(() => {
      setVaultIsLocked(true);
      setSessionValue("");
    });

    vault.onUnlock(() => setVaultIsLocked(false));

    return vault;
  }, []);

  const setSession = async (value: string): Promise<void> => {
    setSessionValue(value);
    await vault.setValue(key, value);
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

  return {
    session: sessionValue,
    vaultIsLocked,

    lockVault,
    unlockVault,

    setSession,
    restoreSession,
  };
};
