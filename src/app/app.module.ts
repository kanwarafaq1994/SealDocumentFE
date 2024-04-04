import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from "@auth0/angular-jwt";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ImagePreviewModalComponent } from './components/image-preview-modal/image-preview-modal.component';

export function tokenGetter() {
  let localStorageData = localStorage.getItem('documentmanagement');
  if (localStorageData) {
    var detail: any = JSON.parse(localStorageData);
    return detail.token;
  } else {
    return "empty"
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    ImagePreviewModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['*', 'localhost:4200', 'http://localhost:4200/', 'localhost:44325', 'https://localhost:44325/'],
        authScheme: 'Bearer ',
      },
    }),
    SimpleNotificationsModule.forRoot()
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
