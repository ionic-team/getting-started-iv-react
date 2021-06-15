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
  IonPage,
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
  } = useVault();
  const [data, setData] = useState<string>("");
  const [privacyScreen, setPrivacyScreen] = useState<boolean>(false);

  useEffect(() => {
    const isPrivacyScreenEnabled = async () => {
      const isPrivacyScreenEnabled =
        await Device.isHideScreenOnBackgroundEnabled();
      setPrivacyScreen(isPrivacyScreenEnabled);
    };
    isPrivacyScreenEnabled();
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
            <IonLabel>Use Privacy Screen</IonLabel>
            <IonCheckbox
              value={privacyScreen.toString()}
              onIonChange={(e) => handlePrivacyScreenChanged(e)}
            />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
