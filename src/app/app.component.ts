import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'documentManagementSystem';
  options = {
    timeOut: 5000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    clickIconToClose: true
  }
}
