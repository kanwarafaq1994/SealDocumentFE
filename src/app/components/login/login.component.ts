import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router, public apiService: ApiService, public notificationsService: NotificationsService) { }


  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  alphanumericValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const errors: ValidationErrors = {};

    if (!value) {
      // If the control is empty, you might want to skip validation or add a 'required' error
      return null;
    }

    // Checking the length
    if (value.length <= 5) {
      errors['incorrectLength'] = true;
    }

    // Checking for uppercase letter
    if (!/[A-Z]/.test(value)) {
      errors['missingUppercase'] = true;
    }

    // Checking for lowercase letter
    if (!/[a-z]/.test(value)) {
      errors['missingLowercase'] = true;
    }

    // Checking for a digit
    if (!/[0-9]/.test(value)) {
      errors['missingDigit'] = true;
    }

    // Checking for a symbol
    if (!/[^A-Za-z0-9]/.test(value)) {
      errors['missingSymbol'] = true;
    }

    // If any errors were added, return the errors object. Otherwise, return null.
    return Object.keys(errors).length > 0 ? errors : null;
  }
  onSubmit() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) { // Check if form is valid
      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this.apiService.login(loginData).subscribe({
        next: (res: any) => {
          this.notificationsService.success('Success!', res.message);
          localStorage.setItem('documentmanagement', JSON.stringify({ userId: res.userId, token: res.token }));
          this.router.navigate(['/home']);

        },
        error: (error: any) => {
          this.notificationsService.error('Error!', error.error.message);
        }
      });
    } else {
      console.log("Please enter valid Email and Password");
    }
  }

}
