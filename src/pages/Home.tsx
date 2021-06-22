import { useEffect, useState } from "react";
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Device } from "@ionic-enterprise/identity-vault";
import "./Home.css";
import { useVault } from "../hooks/useVault";

const Home: React.FC = () => {
  const {
    session,
    setSession,
    restoreSession,
    lockVault,
    unlockVault,
    vaultIsLocked,
    lockType,
    setLockType,
    clearVault,
    vaultExists,
  } = useVault();
  const [data, setData] = useState<string>("");
  const [privacyScreen, setPrivacyScreen] = useState<boolean>(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const isPrivacyScreenEnabled =
        await Device.isHideScreenOnBackgroundEnabled();
      setPrivacyScreen(isPrivacyScreenEnabled);
      const isBiometricsEnabled = await Device.isBiometricsEnabled();
      setCanUseBiometrics(isBiometricsEnabled);
    })();
  }, []);

  const handlePrivacyScreenChanged = (evt: {
    detail: { checked: boolean };
  }) => {
    Device.setHideScreenOnBackground(evt.detail.checked);
    setPrivacyScreen(evt.detail.checked);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>
          <IonItem>
            <IonLabel position="floating">Enter the "session" data</IonLabel>
            <IonInput
              value={data}
              onIonChange={(e) => setData(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={() => setSession(data)}>
                Set Session Data
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={() => restoreSession()}>
                Restore Session Data
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <div>Session Data: {session}</div>
              <div>Vault is Locked: {vaultIsLocked.toString()}</div>
              <div>Vault Exists: {vaultExists.toString()}</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={() => lockVault()}>
                Lock Vault
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={() => unlockVault()}>
                Unlock Vault
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={() => clearVault()}>
                Clear Vault
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Use Privacy Screen</IonLabel>
            <IonCheckbox
              checked={privacyScreen}
              onIonChange={(e) => handlePrivacyScreenChanged(e)}
            />
          </IonItem>
          <IonRadioGroup
            value={lockType}
            onIonChange={(e) => setLockType(e.detail.value!)}
          >
            <IonListHeader>
              <IonLabel>Vault Locking Mechanism</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonLabel>Do Not Lock</IonLabel>
              <IonRadio value="NoLocking" />
            </IonItem>
            <IonItem>
              <IonLabel>Use Biometrics</IonLabel>
              <IonRadio disabled={!canUseBiometrics} value="Biometrics" />
            </IonItem>
            <IonItem>
              <IonLabel>Use System Passcode</IonLabel>
              <IonRadio value="SystemPasscode" />
            </IonItem>
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
