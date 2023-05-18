import { Device } from '@ionic-enterprise/identity-vault';
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
  isPlatform,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useVault } from '../hooks/useVault';
import './Home.css';

const isMobile = isPlatform('hybrid');

const Home: React.FC = () => {
  const {
    session,
    vaultIsLocked,
    storeSession,
    restoreSession,
    lockVault,
    unlockVault,
    lockType,
    setLockType,
    clearVault,
    vaultExists,
  } = useVault();
  const [data, setData] = useState<string>('');
  const [privacyScreen, setPrivacyScreen] = useState<boolean>(false);
  const [canUseSystemPin, setCanUseSystemPin] = useState<boolean>(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      Device.isHideScreenOnBackgroundEnabled().then(setPrivacyScreen);
      Device.isSystemPasscodeSet().then(setCanUseSystemPin);
      Device.isBiometricsEnabled().then(setCanUseBiometrics);
    }
  }, []);

  useEffect(() => {
    if (isMobile) Device.setHideScreenOnBackground(privacyScreen);
  }, [privacyScreen]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Identity Vault</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Identity Vault</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>
          <IonItem>
            <IonInput
              label="Enter the &ldquo;session&rdquo; data"
              labelPlacement="floating"
              value={data}
              onIonChange={(e) => setData(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <div style={{ flex: 'auto' }}>
              <IonButton expand="block" onClick={() => storeSession(data)}>
                Set Session Data
              </IonButton>
            </div>
          </IonItem>

          <IonItem>
            <div style={{ flex: 'auto' }}>
              <IonButton expand="block" onClick={restoreSession}>
                Restore Session Data
              </IonButton>
            </div>
          </IonItem>

          <IonItem>
            <div style={{ flex: 'auto' }}>
              <IonButton expand="block" onClick={lockVault}>
                Lock Vault
              </IonButton>
            </div>
          </IonItem>

          <IonItem>
            <div style={{ flex: 'auto' }}>
              <IonButton expand="block" onClick={unlockVault}>
                Unlock Vault
              </IonButton>
            </div>
          </IonItem>

          <IonItem>
            <div style={{ flex: 'auto' }}>
              <IonButton expand="block" onClick={clearVault}>
                Clear Vault
              </IonButton>
            </div>
          </IonItem>

          <IonItem>
            <IonCheckbox
              disabled={!isMobile}
              checked={privacyScreen}
              onIonChange={(e) => setPrivacyScreen(e.detail.checked!)}
            >
              Use Privacy Screen
            </IonCheckbox>
          </IonItem>

          <IonItem>
            <IonLabel>
              <div>Session Data: {session}</div>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <div>Session Data: {session}</div>
              <div>Vault Exists: {vaultExists.toString()}</div>
              <div>Vault is Locked: {vaultIsLocked.toString()}</div>
            </IonLabel>
          </IonItem>

          <IonRadioGroup value={lockType} onIonChange={(e) => setLockType(e.detail.value!)}>
            <IonListHeader>
              <IonLabel>Vault Locking Mechanism</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonRadio value="NoLocking">Do Not Lock</IonRadio>
            </IonItem>
            <IonItem>
              <IonRadio disabled={!canUseBiometrics} value="Biometrics">
                Use Biometrics
              </IonRadio>
            </IonItem>
            <IonItem>
              <IonRadio disabled={!canUseSystemPin} value="SystemPasscode">
                Use System Passcode
              </IonRadio>
            </IonItem>
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
