import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({ 
      projectId: "secret-diem-vi-project", 
      appId: "1:778645151132:web:bdaf0a1a5367dc41f13c59", 
      storageBucket: "secret-diem-vi-project.firebasestorage.app", 
      apiKey: "AIzaSyCIWwKMTY-U-_7GO--X3zENtXCdYyZi8FI", 
      authDomain: "secret-diem-vi-project.firebaseapp.com", 
      messagingSenderId: "778645151132", 
      measurementId: "G-CFGQ1QVFYG"
    })), 
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()), 
    provideStorage(() => getStorage())
  ]
};
