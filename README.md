# Getting Started with Identity Vault in @ionic/react

This application walks through the basic setup and use of <a href="https://ionic.io/products/identity-vault" target="_blank">Ionic's Identity Vault</a> in an `@ionic/react` application. Rather than connecting to a back end service and storing user session data this application will just store information that you type in and tell it to store. Almost all of the work done here will be concentrated on a couple of files:

- `src/hooks/useVault.ts`: A composition API function that abstracts the logic associated with using Identity Vault. The functions and state exported here model what might be done in a real application.
- `src/pages/Home.tsx`: The main view will have several form controls that allow the user to manipulate the vault. An application would not typically do this. Rather, it would call the methods from `useVault()` within various workflows. In this "getting started" demo application, however, this allows us to easily play around with the various APIs to see how they behave.

## Generate the Application

The first thing we need to do is generate our application.

```bash
ionic start getting-started-iv-react blank --type=react
```

Now that the application has been generated let's add the native platforms.

Open the `capacitor.config.ts` file and change the `appId` to something unique like `io.ionic.gettingstartedivreact`:

```Typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartedivreact',
  appName: 'getting-started-iv-react',
  webDir: 'build',
  bundledWebRuntime: false
};

export default config;
```

Next, build the application then install and create the platforms:

```bash
npm run build
ionic cap add android
ionic cap add ios
```

Finally, in order to ensure that the web application bundle is copied over each build, add `cap copy` to the `build` script in the `package.json` file:

```JSON
"scripts": {
  "build": "react-scripts build && cap copy",
  ...
},
```

## Install Identity Vault

In order to install Identity Vault you will need to use `ionic enterprise register` in order to register your product key. This will create a `.npmrc` file containing the product key. If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key. You can then install Identity Vault.

```bash
npm install @ionic-enterprise/identity-vault
```

## Create the Vault

In this step, we will create the vault and test it by storing and retrieving a value from it. We will call this value `session` since storing session data in a vault is the most common use case of Identity Vault. However, it is certainly not the _only_ use case.

First, create a file named `src/hooks/useVault.ts`. Within this file we will create a hook that defines the vault and functions that abstract all of the logic we need in order to interact with the vault.

```TypeScript
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

  const vault = useMemo(() => {
    const vault = new Vault(config);
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

  return { session: sessionValue, setSession, restoreSession };
};
```

Let's look at this file section by section. The first thing we do is define a configuration for our vault. The `key` gives the vault a name. The other properties provide a default behavior for our vault - and as we shall see later - can be changed as we use the vault.

```TypeScript
const config = {
  key: "io.ionic.getstartedivreact",
  type: "SecureStorage" as any,
  deviceSecurityType: "SystemPasscode" as any,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
```

Next, we define a key for storing data. All data within the vault is stored as a key-value pair, and you can store multiple key-value pairs within a single vault.

```TypeScript
const key = "sessionData";
```

Finally, we create a hook that instantiates and memoizes our vault instance, uses state to reflect the current `session` data, and defines a couple of functions used to set and restore our session.

```TypeScript
export const useVault = () => {
  const [sessionValue, setSessionValue] = useState<string>("");

  const vault = useMemo(() => {
    const vault = new Vault(config);
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

  return { session: sessionValue, setSession, restoreSession };
};
```

**Note:** Rather than create functions such as `setSession()` and `restoreSession()`, we _could_ just return the `vault` from the hook and use its API directly in the rest of the application. However, that would expose the rest of the application to potential API changes as well as potentially result in duplicated code. In my opinion, it is a much better option to return functions that define how I would like the rest of the application to interact with the vault. This makes the code more maintainable and easier to debug.

Now that we have the vault in place, let's switch over to `src/pages/Home.tsx` and code some simple interactions with the vault. Here is a snapshot of what we will change:

1. Replace the `<ExploreContainer />` with a list of form controls
2. Import and make use of the `useVault()` hook
3. Add a local state value called `data`

When we are done, the file will look like this:

```TSX
import { useState } from "react";
import {
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
} from "@ionic/react";
import "./Home.css";
import { useVault } from "../hooks/useVault";

const Home: React.FC = () => {
  const { session, setSession, restoreSession } = useVault();
  const [data, setData] = useState<string>("");

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
            <IonLabel>Session Data: {session}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
```

**Note:** As we continue with this tutorial, we will just provide the new markup or code that is required. It is up to you to make sure that the correct imports and component definitions are added.

## Locking and Unlocking the Vault

Now that we are storing data in the vault, it would be helpful to lock and unlock that data. The vault will automatically lock after `lockAfterBackgrounded` milliseconds of the application being in the background. We can also lock the vault manually if we so desire.

Add the following code to the `useVault()` hook:

```TypeScript
const lockVault = () => {
  vault.lock();
};

const unlockVault = () => {
  vault.unlock();
}
```

Remember to return the references to the functions:

```TypeScript
return {
  session: sessionValue,

  lockVault,
  unlockVault,

  setSession,
  restoreSession,
};
```

We can then add a couple of buttons to our `Home.tsx` component file:

```JSX
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
```

We can now lock and unlock the vault, though in our current case we cannot really tell. Our application should react in some way when the vault is locked. For example, we may want to clear specific data from memory. We may also wish to redirect to a page that will only allow the user to proceed if they unlock the vault. In our case, we will just clear the `session` and have a flag that we can use to visually indicate if the vault is locked or not. We can do that by using the vault's `onLock` event.

Add the following code to `src/hooks/useVault.ts`, inside the `useMemo()` function:

```TypeScript
vault.onLock(() => {
  setVaultIsLocked(true);
  setSessionValue("");
});

vault.onUnlock(() => setVaultIsLocked(false));
```

Declare and return a state variable `vaultIsLocked` outside of the `useMemo()` function:

```TypeScript
const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);

...snip...

return {
  session: sessionValue,
  vaultIsLocked,

  lockVault,
  unlockVault,

  setSession,
  restoreSession,
};
```

Then update `Home.tsx` to display the `vaultIsLocked` value along with the session.

```JSX
<IonItem>
  <IonLabel>
    <div>Session Data: {session}</div>
    <div>Vault is Locked: {vaultIsLocked.toString()}</div>
  </IonLabel>
</IonItem>
```

Build and run the application now. When the user clicks the "Lock Vault" button, the "Session Data" will be cleared out and the "Vault is Locked" will show as true. Clicking "Unlock Vault" will cause "Vault is Locked" to show as false again. Notice that you can lock the vault then unlock it and get the session data back by clicking "Restore Session Data".

In that last case, you didn't have to do anything to unlock the vault. That is because we are not using a type of vault that actually locks. As a matter of fact, with the `SecureStorage` type of vault, the vault will not automatically lock while the application is in the background.

In a few sections we will explore different vault types further. But first we will begin exploring the `Device` API.

## The `Device` API

Identity Vault allows you to have multiple vaults within your application. However, there are some capabilities that Identity Vault allows you to control that are applicable to the device that the application is running on rather than being applicable to any given vault. For these items, we will use Identity Vault's `Device` API.

One such item is the "privacy screen". When an application is put into the background, the default behavior is for the OS to take a screenshot of the current page and display that as the user scrolls through the open applications. However, if your application displays sensitive information you may not want that information displayed at such a time. So, another option is to display the splash screen (on iOS) or a plain rectangle (on Android) instead of the screenshot. This is often referred to as a "privacy screen".

We will use the `Device.isHideScreenOnBackgroundEnabled()` method to determine if our application will currently display the privacy screen or not. We will then use the `Device.setHideScreenOnBackground()` method to control whether it is displayed or not. Finally, we will hook that all up to a checkbox in the UI to allow the user to manipulate the value at run time.

All of the following code applies to the `src/pages/Home.tsx` file.

First, import the `Device` API:

```typescript
import { Device } from "@ionic-enterprise/identity-vault";
```

Then add the following code to the `Home` component:

```Typescript
const [privacyScreen, setPrivacyScreen] = useState<boolean>(false);

useEffect(() => {
  const isPrivacyScreenEnabled = async () => {
    const isPrivacyScreenEnabled =
      await Device.isHideScreenOnBackgroundEnabled();
    setPrivacyScreen(isPrivacyScreenEnabled);
  };
  isPrivacyScreenEnabled();
}, []);

const handlePrivacyScreenChanged = (evt: { detail: { checked: boolean } }) => {
  Device.setHideScreenOnBackground(evt.detail.checked);
  setPrivacyScreen(evt.detail.checked);
};
```

Finally, we can add the checkbox to our component's template:

```JSX
<IonItem>
  <IonLabel>Use Privacy Screen</IonLabel>
  <IonCheckbox
    value={privacyScreen.toString()}
    onIonChange={(e) => handlePrivacyScreenChanged(e)}
  />
</IonItem>
```

Build the app and play around with changing the checkbox and putting the app in the background. In most applications, you would leave this value set by default. If you were going to change it, you would most likely do so on startup and leave it that way.
