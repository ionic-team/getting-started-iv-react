# Getting Started with Identity Vault in @ionic/react

This application walks through the basic setup and use of <a href="https://ionic.io/products/identity-vault" target="_blank">Ionic's Identity Vault</a> in an `@ionic/react` application. Rather than connecting to a back end service and storing user session data this application will just store information that you type in and tell it to store. Almost all of the work done here will be concentrated on a couple of files:

- `src/hooks/useVault.ts`: a custom React hook that abstracts the logic associated with using Identity Vault. Functions and state exported here model what might be done in a real application.

- `src/pages/Home.tsx`: the main view component will have several form controls that allow the user to manipulate the vault. An application would not typically do this. Rather, it would call the methods from `useVault()` within various workflows. In this "getting started" demo application, however, this allows us to easily play around with the various APIs to see how they behave.

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
npm install @ionic-enterprise/identity-vault@next
```

## Create the Vault

In this step, we will create the vault and test it by storing and retrieving a value from it. We will call this value `session` since storing session data in a vault is the most common use case of Identity Vault. However, it is certainly not the _only_ use case.

First, create a file named `src/hooks/useVault.ts`. Within this file we will create a hook that defines the vault and functions that abstract all of the logic we need in order to interact with the vault.

```TypeScript
import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { useMemo, useState } from 'react';

const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact',
  type: VaultType.SecureStorage,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
const key = 'sessionData';

export const useVault = () => {
  const [session, setSession] = useState<string | undefined>(undefined);

  const vault = useMemo(() => {
    return Capacitor.getPlatform() === 'web'
      ? new BrowserVault(config)
      : new Vault(config);
  }, []);

  const storeSession = async (value: string): Promise<void> => {
    setSession(value);
    await vault.setValue(key, value);
  };

  const restoreSession = async (): Promise<void> => {
    const value = await vault.getValue(key);
    setSession(value);
  };

  return { session, storeSession, restoreSession };
};

```

Let's look at this file section by section. The first thing we do is define a configuration for our vault. The `key` gives the vault a name. The other properties provide a default behavior for our vault. As we shall see later, the configuration can be changed as we use the vault.

```TypeScript
const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.SystemPasscode,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
```

Next we define a key for storing data. All data within the vault is stored as a key-value pair and you can store multiple key-value pairs within a single vault.

```TypeScript
const key = 'sessionData';
```

We then create a hook that creates and memoizes our vault. Note that we are using the `BrowserVault` class when the application is running on the web. The `BrowserVault` allows us to continue to use our normal web-based development workflow.

```TypeScript
const vault = useMemo(() => {
  return Capacitor.getPlatform() === 'web'
    ? new BrowserVault(config)
    : new Vault(config);
}, []);
```

The hook additionally contains a state property that will be used to reflect the current `session` data to the outside world. It returns our `session` as well as functions that are used to store and restore our session.

```TypeScript
export const useVault = () => {
  const [session, setSession] = useState<string | undefined>(undefined);

  const storeSession = async (value: string): Promise<void> => {
    setSession(value);
    await vault.setValue(key, value);
  };

  const restoreSession = async (): Promise<void> => {
    const value = await vault.getValue(key);
    setSession(value);
  };

  return { session, storeSession, restoreSession };
};
```

:::note::: It is recommend to abstract vault functionality into functions that defines how the rest of the application should interact with the vault instead of directly returning the `vault` instance. This results in more maintainable and debuggable code, while preventing the rest of the code from being exposed to potential API changes and duplicated code.

Now that we have the vault in place, let's switch over to `src/pages/Home.tsx` and implement some simple interactions with the vault. Here is a snapshot of what we will change:

1. Replace `<ExploreContainer />` with a list of form controls
2. Import and make use of the `useVault()` hook
3. Add a local state value called `data`

When we are done, the file will look like this:

```TSX
import React, { useState } from 'react';
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
} from '@ionic/react';
import './Home.css';
import { useVault } from '../hooks/useVault';

const Home: React.FC = () => {
  const { session, storeSession, restoreSession } = useVault();
  const [data, setData] = useState<string>('');

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
              <div>Session Data: {session}</div>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
```

**Note:** As we continue with this tutorial, we will just provide the new markup or code that is required. It is up to you to make sure that the correct imports and component definitions are added.

Build this and run it on your device(s). You should be able to enter some data and store it in the vault by clicking "Set Session Data." If you then shutdown the app and start it again, you should be able to restore it using "Restore Session Data."

## Locking and Unlocking the Vault

Now that we are storing data in the vault, it would be helpful to lock and unlock that data. The vault will automatically lock after `lockAfterBackgrounded` milliseconds of the application being in the background. We can also lock the vault manually if we so desire.

Add the following functions to the `useVault()` hook:

```TypeScript
const lockVault = async (): Promise<void> => {
  await vault.lock();
};

const unlockVault = async (): Promise<void> => {
  await vault.unlock();
};
```

Remember to return the references to the functions:

```TypeScript
return {
  session,

  lockVault,
  unlockVault,

  storeSession,
  restoreSession,
};
```

We can then add a couple of buttons to our `Home.tsx` component file:

```JSX
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
```

We can now lock and unlock the vault, though in our current case we cannot really tell. Our application should react in some way when the vault is locked. For example, we may want to clear specific data from memory. We may also wish to redirect to a page that will only allow the user to proceed if they unlock the vault. In our case, we will just clear the `session` and have a flag that we can use to visually indicate if the vault is locked or not. We can do that by using the vault's `onLock` event.

First we need to add a state property to `useVault()` to track whether the vault is locked or not. Add the following code to `src/hooks/useVault.ts` under the declaration for `session`:

```TypeScript
const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);
```

Next we need to handle events from the vault itself. Modify the `useMemo()` block of code:

```TypeScript
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

  return vault;
}, []);
```

Update the return value from `useVault()` to include the `vaultIsLocked` value:

```TypeScript
return {
  session,
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

We only want to interact with the Device API if we are actually running on a device, so we will also use Ionic's platform detection features to avoid using the Device API when running on the web. Our app is not targeting the web; we just want to ensure we can still use a web based development flow.

All of the following code applies to the `src/pages/Home.tsx` file.

First, import the `Device` API and add `isPlatform` to the import from `@ionic/react`:

```TypeScript
import {
  ...
  isPlatform
} from '@ionic/react';
import { Device } from '@ionic-enterprise/identity-vault';
```

Next, add a constant `isMobile` above the `Home` component code:

```TypeScript
const isMobile = isPlatform('hybrid');
```

Then, add the following code to the `Home` component:

```typescript
const [privacyScreen, setPrivacyScreen] = useState<boolean>(false);

useEffect(() => {
  if (isMobile) {
    Device.isHideScreenOnBackgroundEnabled().then(setPrivacyScreen);
  }
}, []);

useEffect(() => {
  if (isMobile) Device.setHideScreenOnBackground(privacyScreen);
}, [privacyScreen]);
```

Finally, we can add the checkbox to our template:

```JSX
 <IonItem>
  <IonLabel>Use Privacy Screen</IonLabel>
  <IonCheckbox
    disabled={!isMobile}
    checked={privacyScreen}
    onIonChange={e => setPrivacyScreen(e.detail.checked!)}
  />
</IonItem>
```

Build the app and play around with changing the checkbox and putting the app in the background. In most applications, you would leave this value set by default. If you were going to change it, you would most likely do so on startup and leave it that way.

## Using Different Vault Types

The mechanism used to unlock the vault is determined by a combination of the `type` and the `deviceSecurityType` configuration settings. The `type` can be any of the following:

- `SecureStorage`: Securely store the data in the keychain, but do not lock it.
- `DeviceSecurity`: When the vault is locked, it needs to be unlocked by a mechanism provided by the device.
- `CustomPasscode`: When the vault is locked, it needs to be unlocked via a custom method provided by the application. This is typically done in the form of a custom PIN dialog.
- `InMemory`: The data is never persisted. As a result, if the application is locked or restarted the data is gone.

In addition to these types, if `DeviceSecurity` is used, it is further refined by the `deviceSecurityType` which can be any of the following values:

- `Biometrics`: Use the biometric authentication type specified by the device.
- `SystemPasscode`: Use the system passcode entry screen.
- `Both`: Use `Biometrics` with the `SystemPasscode` as a backup when `Biometrics` fails.

We specified `SecureStorage` when we set up the vault:

```typescript
const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact',
  type: 'SecureStorage',
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
```

However, we can use the vault's `updateConfig()` method to change this at run time.

In our application, we don't want to use every possible combination. Rather than exposing the raw `type` and `deviceSecurityType` values to the rest of the application, let's define the types of authentication we _do_ want to support:

- `NoLocking`: We want to store the session data securely, but never lock it.
- `Biometrics`: We want to use the device's biometric mechanism to unlock the vault when it is locked.
- `SystemPasscode`: We want to use the device's passcode screen (typically a PIN or pattern) to unlock the vault when it is locked.

Now we have the types defined within the domain of our application. The only code within our application that will have to worry about what this means within the context of the Identity Vault configuration is our `useVault()` hook.

First, add a function to `src/hooks/useVault.ts` that will return Identity Vault configuration changes that correspond to each of our domain lock types. This function will reside outside of the `useVault()` definition:

```TypeScript
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
```

Next, add a stateful property to `useVault()` to manage the vault's lock type:

```TypeScript

```

---

First, add a custom type to `src/hooks/useVault.ts` outside of the hook definition:

```Typescript
const [lockType, setLockType] = useState<LockType>(undefined);
```

Next, add a stateful property to `useVault()` to contain the vault's lock type:

```TypeScript
const [lockType, setLockType] = useState<LockType>(undefined);
```

Return both the property and it's setter as part of the object returned by `useVault()`.

Then, we will need to watch for changes and update the

---

Next, we will need a `useEffect()` that listens to changes made to `lockType` and updates the configuration accordingly.

```typescript
useEffect(() => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  if (lockType) {
    switch (lockType) {
      case 'Biometrics':
        type = 'DeviceSecurity';
        deviceSecurityType = 'Biometrics';
        break;
      case 'SystemPasscode':
        type = 'DeviceSecurity';
        deviceSecurityType = 'SystemPasscode';
        break;
      default:
        type = 'SecureStorage';
        deviceSecurityType = 'SystemPasscode';
        break;
    }

    config = { ...config, type, deviceSecurityType };
    vault.updateConfig(config);
  }
}, [lockType, vault]);
```

**Note:** When this code is added, you will need to change the `config` declaration from a `const` to a `let`.

Also, be sure to import `VaultType` and `DeviceSecurityType` from `@ionic-enterprise/identity-vault`.

We can now add a group of radio buttons to our `Home` component that will control the vault type. Remember to import any new components we are using.

```JSX
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
```

Notice for the "Use Biometrics" radio button, we are disabling it based on a `canUseBiometrics` value. We will need to code for that. First add a state property called `canUseBiometrics`, then update the `useEffect`.

```Typescript
const [canUseBiometrics, setCanUseBiometrics] = useState<boolean>(false);
```

```Typescript
useEffect(() => {
  (async () => {
    const isPrivacyScreenEnabled =
      await Device.isHideScreenOnBackgroundEnabled();
    setPrivacyScreen(isPrivacyScreenEnabled);
    const isBiometricsEnabled = await Device.isBiometricsEnabled();
    setCanUseBiometrics(isBiometricsEnabled);
  })();
}, []);
```

One final bit of housekeeping before building and running the application: if you are using an iOS device you need to open the `Info.plist` file and add the `NSFaceIDUsageDescription` key with a value like "Use Face ID to unlock the vault when it is locked."

Now when you run the app, you can choose a different locking mechanism and it should be used whenever you need to unlock the vault.

## Clear the Vault

One last method we will explore before we finish is the `clear()` method. The `clear()` API method will remove all items from the vault and then remove the vault itself.

To show this in action, let's add a `vaultExists` state property to our `src/hooks/useVault.ts` file. Return it from the `useVault()` hook so we can use it in our components.

```typescript
const [vaultExists, setVaultExists] = useState<boolean>(false);
```

Then add a `clearVault()` function within the `useVault()` hook. This function will call `vault.clear()`, reset the `lockType` to `NoLocking`, and clear our session data cache.

```typescript
const clearVault = async () => {
  await vault.clear();
  setLockType('NoLocking');
  setSession('');
};
```

Remember to add it to the return from `useVault()` as well.

In order to see when a vault does and does not exist, let's add the following statement to a couple of places:

```typescript
setVaultExists(await vault.doesVaultExist());
```

Add a call in `clearVault()` as well as `setSession()`. Let's also add a call within the `useMemo()` function where we instantiate the vault itself; but since that function is not `async` we need to use "promise then" syntax there:

```typescript
const vault = useMemo(() => {
  const vault = new Vault(config);
  vault.doesVaultExist().then(res => setVaultExists(res));

  vault.onLock(() => {
    setVaultIsLocked(true);
    setSessionValue('');
  });

  vault.onUnlock(() => setVaultIsLocked(false));

  return vault;
}, []);
```

With that in place, open the `Home.tsx` file and do the following:

- Add a button to clear the vault by calling `clearVault()` on click
- Display the current value of `vaultExists` in a `div` just like we are currently showing `session` and `vaultIsLocked`

## Conclusion

This walk-through has implemented using Identity Vault in a very manual manner, allowing for a lot of user interaction with the vault. In an actual application, a lot of this functionality would instead be a part of several programmatic workflows within the application.

At this point, you should have a good idea of how Identity Vault works. There is still more functionality that can be implemented. Be sure to check out our How To documentation to determine how to facilitate specific areas of functionality within your application.
