import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '',  loadChildren: () => import('./landing/landing.module').then((p) => p.LandingModule)},
  { path: 'play',  loadChildren: () => import('./play/play.module').then((p) => p.PlayModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
