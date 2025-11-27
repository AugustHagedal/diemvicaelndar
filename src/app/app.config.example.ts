import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';

// IMPORTANT: Copy this file to app.config.ts and add your Firebase credentials
// Get your Firebase config from: https://console.firebase.google.com/
// Project Settings > Your apps > Config

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({ 
      projectId: "YOUR_PROJECT_ID", 
      appId: "YOUR_APP_ID", 
      storageBucket: "YOUR_STORAGE_BUCKET", 
      apiKey: "YOUR_API_KEY", 
      authDomain: "YOUR_AUTH_DOMAIN", 
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID", 
      measurementId: "YOUR_MEASUREMENT_ID"
    })), 
    provideAuth(() => getAuth()), 
    provideDatabase(() => getDatabase()), 
    provideStorage(() => getStorage())
  ]
};
