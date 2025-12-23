import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { UploadComponent } from './pages/upload/upload.component';
import { CatalogsComponent } from './pages/catalogs/catalogs.component';
import { FlyersComponent } from './pages/flyers/flyers.component';
import { LabelsComponent } from './pages/labels/labels.component';
import { PackagingComponent } from './pages/packaging/packaging.component';
import { PostcardsComponent } from './pages/postcards/postcards.component';
import { SleevesComponent } from './pages/sleeves/sleeves.component';
import { StickersComponent } from './pages/stickers/stickers.component';
import { BookletsComponent } from './pages/booklets/booklets.component';
import { FilesRedirectComponent } from './files-redirect/files-redirect.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'booklets', component: BookletsComponent},
      { path: 'catalogs', component: CatalogsComponent},
      { path: 'flyers', component: FlyersComponent},
      { path: 'labels', component: LabelsComponent},
      { path: 'packaging', component: PackagingComponent},
      { path: 'postcards', component: PostcardsComponent},
      { path: 'sleeves', component: SleevesComponent},
      { path: 'stickers', component: StickersComponent},
      { path: 'upload', component: UploadComponent },
      { path: 'files/:fileKey', component: FilesRedirectComponent}
    ],
  },
  { path: '**', redirectTo: '' },
];
