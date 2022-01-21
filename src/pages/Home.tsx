/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import {
  isPlatform,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCheckbox,
  IonRadioGroup,
  IonListHeader,
  IonRadio,
} from '@ionic/react';
import { Device } from '@ionic-enterprise/identity-vault';
import './Home.css';
import { useVault } from '../hooks/useVault';

const isMobile = isPlatform('hybrid');

const Home: React.FC = () => {
  const {
    session,
    storeSession,
    restoreSession,
    lockVault,
    unlockVault,
    vaultIsLocked,
    lockType,
    setLockType,
    vaultExists,
    clearVault,
    type,
    security,
  } = useVault();
  const [privacyScreen, setPrivacyScreen] = useState<boolean>(false);
  const [canUseSystemPin, setCanUseSystemPin] = useState<boolean>(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      Device.isHideScreenOnBackgroundEnabled().then(setPrivacyScreen);
      Device.isSystemPasscodeSet().then(setCanUseSystemPin);
      Device.isBiometricsEnabled().then(setCanUseBiometrics);
    }
    storeSession('Hello world');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <IonLabel>
              <div>Vault Type: {type}</div>
              <div>Device Security Type: {security}</div>
              <div>Session Data: {session}</div>
              <div>Vault is Locked: {vaultIsLocked.toString()}</div>
              <div>Vault Exists: {vaultExists.toString()}</div>
            </IonLabel>
          </IonItem>

          {/* <IonItem>
            <IonLabel position="floating">Enter the "session" data</IonLabel>
            <IonInput
              value={data}
              onIonChange={e => setData(e.detail.value!)}
            />
          </IonItem> */}

          <IonItem>
            <div style={{ flex: 'auto' }}>
              <IonButton
                expand="block"
                onClick={() => storeSession('Hello world')}
              >
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
            <IonLabel>Use Privacy Screen</IonLabel>
            <IonCheckbox
              disabled={!isMobile}
              checked={privacyScreen}
              onIonChange={e => setPrivacyScreen(e.detail.checked!)}
            />
          </IonItem>

          <IonRadioGroup
            value={lockType}
            onIonChange={e => setLockType(e.detail.value!)}
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
              <IonRadio disabled={!canUseSystemPin} value="SystemPasscode" />
            </IonItem>
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
