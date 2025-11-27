import { Routes } from '@angular/router';
import { Login } from '../login/login';
import { Calendar } from './calendar/calendar';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'calendar', component: Calendar, canActivate: [authGuard] }
];