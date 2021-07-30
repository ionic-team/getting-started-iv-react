/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import {
  isPlatform,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCheckbox,
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
    vaultExists,
    clearVault,
  } = useVault();
  const [data, setData] = useState<string>('');
  const [privacyScreen, setPrivacyScreen] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      Device.isHideScreenOnBackgroundEnabled().then(setPrivacyScreen);
    }
  }, []);

  useEffect(() => {
    if (isMobile) Device.setHideScreenOnBackground(privacyScreen);
  }, [privacyScreen]);

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
            <IonLabel>
              <div>Session Data: {session}</div>
              <div>Vault is Locked: {vaultIsLocked.toString()}</div>
              <div>Vault Exists: {vaultExists.toString()}</div>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Enter the "session" data</IonLabel>
            <IonInput
              value={data}
              onIonChange={e => setData(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={() => storeSession(data)}>
                Set Session Data
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={restoreSession}>
                Restore Session Data
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={lockVault}>
                Lock Vault
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={unlockVault}>
                Unlock Vault
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>
              <IonButton expand="block" onClick={clearVault}>
                Clear Vault
              </IonButton>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>Use Privacy Screen</IonLabel>
            <IonCheckbox
              disabled={!isMobile}
              checked={privacyScreen}
              onIonChange={e => setPrivacyScreen(e.detail.checked!)}
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
