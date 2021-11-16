# Getting Started with Identity Vault in @ionic/react

In this tutorial we will walk through the basic setup and use of <a href="https://ionic.io/products/identity-vault" target="_blank">Ionic's Identity Vault</a> in an `@ionic/react` application.

:::note
The source code for the Ionic application created in this tutorial can be found [here](https://github.com/ionic-team/getting-started-iv-react)
:::

The most common use case of Identity Vault is to connect to a back end service and store user session data. For the purpose of this tutorial, the application we build will not connect to an actual service. Instead, the application will store information that the user enters.

The work done in this tutorial will be concentrated on a couple of files:

- `src/hooks/useVault.ts`: A custom React hook that abstracts the logic associated with using Identity Vault. Functions and state exported here model what might be done in a real application.

- `src/pages/Home.tsx`: The main view will have several form controls that allow the user to manipulate the vault. An application would not typically do this. Rather, it would call the methods from `useVault()` within various workflows. In this "getting started" demo application, however, this allows us to easily play around with the various Identity Vault APIs to see how they behave.

## Generate the Application

The first step to take is to generate our application:

```bash
ionic start getting-started-iv-react blank --type=react
```

Now that the application has been generated let's add the iOS and Android platforms.

Open the `capacitor.config.ts` file and change the `appId` to something unique like `io.ionic.gettingstartedivreact`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartedivreact',
  appName: 'getting-started-iv-react',
  webDir: 'build',
  bundledWebRuntime: false,
};

export default config;
```

Next, build the application and install and create the platforms:

```bash
npm run build
ionic cap add android
ionic cap add ios
```

Finally, in order to ensure that the web application bundle is copied over each build, add `cap copy` to the `build` script in the `package.json` file:

```json
"scripts": {
  "build": "react-scripts build && cap copy",
  ...
},
```

## Install Identity Vault

In order to install Identity Vault you will need to use `ionic enterprise register` to register your product key. This will create a `.npmrc` file containing the product key.

If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is for learning purposes only, you don't need to obtain another key.

You can now install Identity Vault:

```bash
npm install @ionic-enterprise/identity-vault
```

## Create the Vault

In this step, we will create the vault and test it by storing and retrieving a value from it. This value will be called `session`, since storing session data in a vault is the most common use case of Identity Vault. However, it is certainly not the _only_ use case.

First, create a file named `src/hooks/useVault.ts`. Within this file we will create a hook that defines the vault and functions that abstract all of the logic we need in order to interact with the vault:

```typescript
import { Capacitor } from '@capacitor/core';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { useMemo, useState } from 'react';

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

Let's look at this file section by section:

The first thing we do is define a configuration for our vault. The `key` gives the vault a name. The other properties provide a default behavior for our vault. As we shall see later, the configuration can be changed as we use the vault.

```typescript
const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
```

Next, we define a key for storing data. All data within the vault is stored as a key-value pair and you can store multiple key-value pairs within a single vault.

```typescript
const key = 'sessionData';
```

Then, we create a hook that creates and memoizes our vault.

```typescript
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

The hook additionally contains a state property that will be used to reflect the current `session` data to the outside world. It returns our `session` as well as functions that are used to store and restore our session.

> It's recommended to abstract vault functionality into functions that define how the rest of the application should interact with the vault instead of directly returning the `vault` instance. This creates more maintainable and debuggable code, while preventing the rest of the code from being exposed to potential API changes and reduces the chance of duplicating code.

Note that we are using the `BrowserVault` class when the application is running on the web. The `BrowserVault` allows us to continue to use our normal web-based development workflow.

```typescript
return Capacitor.getPlatform() === 'web'
  ? new BrowserVault(config)
  : new Vault(config);
```

> The `BrowserVault` class allows developers to use their normal web-based development workflow. It does **not** provide locking or security functionality.

Now that we have the vault in place, let's switch over to `src/pages/Home.tsx` and implement some simple interactions with the vault. Here is a snapshot of what we will change:

1. Replace `<ExploreContainer />` with a list of form controls
2. Import and make use of the `useVault()` hook
3. Add a local state value called `data`

Update the `Home` component to match the following code:

```tsx
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
            <IonLabel position="floating">Enter the "session" data</IonLabel>
            <IonInput
              value={data}
              onIonChange={e => setData(e.detail.value!)}
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

> Throughout the rest of this tutorial only new markup or required code will be provided. It is up to you to make sure that the correct imports and component definitions are added.

Build the application and run it on an iOS and/or Android device. You should be able to enter some data and store it in the vault by clicking "Set Session Data." If you then shutdown the app and start it again, you should be able to restore it using "Restore Session Data."

## Locking and Unlocking the Vault

Now that we are storing data in the vault, it would be helpful to lock and unlock that data. The vault will automatically lock after `lockAfterBackgrounded` milliseconds of the application being in the background. We can also lock the vault manually if we so desire.

Add the following functions to the `useVault()` hook:

```typescript
const lockVault = async (): Promise<void> => {
  await vault.lock();
};

const unlockVault = async (): Promise<void> => {
  await vault.unlock();
};
```

Remember to return the references to the functions:

```typescript
return {
  session,

  lockVault,
  unlockVault,

  storeSession,
  restoreSession,
};
```

We can then add a couple of buttons to our `Home.tsx` component file:

```jsx
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
```

We can now lock and unlock the vault, though in our current state we cannot really tell. Our application should react in some way when the vault is locked. For example, we may want to clear specific data from memory. We may also wish to redirect to a page that will only allow the user to proceed if they unlock the vault.

In our case, we will just clear the `session` and have a flag that we can use to visually indicate if the vault is locked or not. We can do that by using the vault's `onLock` event.

First, we need to add a state variable to track whether the vault is locked or not. Add the following code to `src/hooks/useVault.ts` under the declaration for `session`:

```typescript
const [vaultIsLocked, setVaultIsLocked] = useState<boolean>(false);
```

Next, the vault's `onLock` and `onUnlock` events need to be handled. Modify the `useMemo()` block of code:

```typescript
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

```typescript
return {
  session,
  vaultIsLocked,

  lockVault,
  unlockVault,

  setSession,
  restoreSession,
};
```

Finally, update `Home.tsx` to display the `vaultIsLocked` value along with the session:

```jsx
<IonItem>
  <div style={{ flex: 'auto' }}>
    <div>Session Data: {session}</div>
    <div>Vault is Locked: {vaultIsLocked.toString()}</div>
  </div>
</IonItem>
```

Build and run the application. When the user presses the "Lock Vault" button, the "Session Data" will be cleared out. Pressing "Unlock Vault" will cause "Vault is Locked" to show as false again. Pressing "Restore Session Data" will both unlock a vault and get the session data back.

In its current state, the vault is set to the `SecureStorage` vault type. We will be unable to observe any changes to the "Vault is Locked" value until we update the vault's configuration to a different vault type.

> Vaults set to the `SecureStorage` vault type _do not_ lock. Data stored within this type of vault are still encrypted at rest and can be restored between sessions.

In a few sections we will explore different vault types further, allowing us to test the ability to lock and unlock a vault. First, we will begin exploring the `Device` API.

## Device Level Capabilities

Identity Vault allows you to have multiple vaults within your application. However, there are some capabilities that Identity Vault allows you to control that are applicable to the device that the application is running on rather than being applicable to any given vault. For these items, we will use Identity Vault's `Device` API.

One such item is the "privacy screen." When an application is put into the background, the default behavior is for the OS to take a screenshot of the current page and display that as the user scrolls through the open applications. However, if your application displays sensitive information you may not want that information displayed at such a time. So, another option is to display the splash screen (on iOS) or a plain rectangle (on Android) instead of the screenshot. This is often referred to as a "privacy screen."

We will use the `Device.isHideScreenOnBackgroundEnabled()` method to determine if our application will currently display the privacy screen or not. Then we will use the `Device.setHideScreenOnBackground()` method to control whether it is displayed or not. Finally, we will hook that all up to a checkbox in the UI to allow the user to manipulate the value at run time.

We only want to interact with the Device API if we are actually running on a device, so we will also use Ionic's platform detection features to avoid using the Device API when running on the web. Our app is not targeting the web; we just want to ensure we can still use a web based development flow.

All of the following code applies to the `src/pages/Home.tsx` file.

First, import the `Device` API and add `isPlatform` to the import from `@ionic/react`:

```typescript
import {
  ...
  isPlatform
} from '@ionic/react';
import { Device } from '@ionic-enterprise/identity-vault';
```

Next, a constant named `isMobile` is to be added _above_ the the `Home` component code:

```typescript
const isMobile = isPlatform('hybrid');
```

Then, we will add logic to handle the privacy screen within the `Home` component:

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

```jsx
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

The mechanism used to unlock a vault is determined by a combination of the `type` and the `deviceSecurityType` configuration settings.

The `type` setting can be set to any value from the `VaultType` enumeration:

- `SecureStorage`: Securely store the data in the keychain, but do not lock it.
- `DeviceSecurity`: When the vault is locked, it needs to be unlocked by a mechanism provided by the device.
- `CustomPasscode`: When the vault is locked, it needs to be unlocked via a custom method provided by the application. This is typically done in the form of a custom PIN dialog.
- `InMemory`: The data is never persisted. As a result, if the application is locked or restarted the data is gone.

If `VaultType.DeviceSecurity` is used, the optional `deviceSecurityType` setting can further refine the vault by assigning a value from the `DeviceSecurity` enumeration:

- `Biometrics`: Use the biometric authentication type specified by the device.
- `SystemPasscode`: Use the system passcode entry screen.
- `Both`: Use `Biometrics` with the `SystemPasscode` as a backup when `Biometrics` fails.

We specified `SecureStorage` when we set up the vault:

```typescript
const config: IdentityVaultConfig = {
  key: 'io.ionic.getstartedivreact',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
```

However, we can use the vault's `updateConfig()` method to change this at run time.

In our application, we don't want to use every possible combination. Rather than exposing the raw `type` and `deviceSecurityType` values to the rest of the application, let's define the types of authorization we _do_ want to support:

- `NoLocking`: We want to store the session data securely, but never lock it.
- `Biometrics`: We want to use the device's biometric mechanism to unlock the vault when it is locked.
- `SystemPasscode`: We want to use the device's passcode screen (typically a PIN or pattern) to unlock the vault when it is locked.

Now we have the types defined within the domain of our application. The only code within our application that will have to worry about what this means within the context of the Identity Vault configuration is our `useVault()` hook.

First, create a custom type specific to our application along with a helper function in `src/hooks/useVault.ts`. This code will reside outside of the `useVault()` definition:

```typescript
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
        deviceSecurityType: DeviceSecurityType.None,
      };
  }
};
```

Next, add a state variable to `useVault()` to track the lock type of the vault:

```typescript
const [lockType, setLockType] = useState<LockType>(undefined);
```

Return both the property and it's setter as part of the object returned by `useVault()`.

We will want a way to watch for changes to `lockType` so that when it changes we can update the vault configuration accordingly. Let's do so by adding a `useEffect()` to the hook:

```typescript
useEffect(() => {
  if (lockType) {
    const { type, deviceSecurityType } = getConfigUpdates(lockType);
    vault.updateConfig({ ...vault.config, type, deviceSecurityType });
  }
}, [lockType, vault]);
```

Finally, add a group of radio buttons to `src/pages/Home.tsx` that control the type of vault being used. Remember to import any new components being used:

```jsx
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
```

The "Use Biometrics" and "Use System Passcode" radio buttons will be disabled on whether or not the feature has been enabled on the device. We will need to code for that by adding state properties and updating the `useEffect` in the component:

```typescript
const [canUseSystemPin, setCanUseSystemPin] = useState<boolean>(false);
const [canUseBiometrics, setCanUseBiometrics] = useState<boolean>(false);

useEffect(() => {
  if (isMobile) {
    Device.isSystemPasscodeSet().then(setCanUseSystemPin);
    Device.isBiometricsEnabled().then(setCanUseBiometrics);
    ...
  }
}, []);
```

Notice that we are using the `Device` API again to determine if biometrics is both: (a) supported by the current device, and (b) enabled by the device user. Users should not be able to choose that option unless biometrics are properly set up on the device.

One final bit of housekeeping before building and running the application: if you are using an iOS device you need to open the `Info.plist` file and add the `NSFaceIDUsageDescription` key with a value like "Use Face ID to unlock the vault when it is locked."

Now when you run the app, you can choose a different locking mechanism and it should be used whenever you need to unlock the vault.

If you change the vault type to use either Biometrics or Session Passcode, you should see that the vault is still using that mode when you restart the application. If a vault already exists for a given key (such as `'io.ionic.getstartedivreact'`), the vault remembers which mode it is operating in and will ignore the mode passed into the constructor.

## Current Lock Status

Now that the vault type can be set to modes that lock, the "Lock Vault" and "Unlock Vault" buttons are now testable. However, try the following set of instructions:

1. Set some session data.
2. Press either the "Use Biometrics" or "Use System Passcode" radio buttons.
3. Close the application.
4. Restart the application.
5. Observe that "Vault is Locked" is shown as `false`.
6. Press the "Restore Session Data" button.
7. Observe the application request a security prompt.

Our flag is wrong because it's value is set to `false` on startup, and the `onLock` event does not trigger on startup. The `Vault` API provides a way to programmatically obtain the current lock status of the vault.

Add the following line of code to `src/hooks/useVault.ts` immediately after the `onUnlock` event handler:

```typescript
vault.isLocked().then(setVaultIsLocked);
```

Now when the application is restarted, the vault should be shown as locked.

## Clearing the Vault

In this final step, we will remove all items from the vault and then remove the vault itself. This can be achieved through the `Vault` API by calling the `clear()` method.

To show this in action, add a `vaultExists` state property to the `useVault()` hook in `src/hooks/useVault.ts`:

```typescript
const [vaultExists, setVaultExists] = useState<boolean>(false);
```

Next, add a function named `clearVault()` within `useVault()`. This function will call `vault.clear()`, set the `lockType` to `NoLocking`, and clear our `session` state property:

```typescript
const clearVault = async (): Promise<void> => {
  await vault.clear();
  setLockType('NoLocking');
  setSession(undefined);
};
```

Don't forget to return `vaultExists` and `clearVault`.

In order to see when a vault does or does not exist, let's add the following code to `clearVault()` and `storeSession()`:

```typescript
const exists = await vault.doesVaultExist();
setVaultExists(exists);
```

We should also add a call within the `useMemo()` code block to initialize the value along with the vault. Since that function is not `async` we need to use the "promise-then" syntax: `vault.doesVaultExist().then(setVaultExists)`:

```typescript
const vault = useMemo(() => {
  ...
  vault.doesVaultExist().then(setVaultExists);

  return vault;
}, []);
```

Once that all is in place, make the following adjustments to `src/pages/Home.tsx`:

- Add a button to clear the vault by calling `clearVault()` on click.
- Display the current value of `vaultExists` in a `div` the same way `session` and `vaultIsLocked` are being shown.

## Conclusion

This "getting started" tutorial has implemented using Identity Vault in a very manual manner, allowing for a lot of user interaction with the vault. In an actual application, a lot of this functionality would instead be a part of several programmatic workflows within the application.

At this point, you should have a good idea of how Identity Vault works. There is still more functionality that can be implemented. Be sure to check out our documentation to determine how to facilitate specific areas of functionality within your application.
