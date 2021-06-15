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
