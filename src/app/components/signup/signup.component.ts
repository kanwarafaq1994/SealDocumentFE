import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  constructor(private router: Router, public apiService: ApiService, public notificationsService: NotificationsService) { }

  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, this.alphanumericValidator]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordsMatchValidator });

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

  // Validator for checking if password and confirm password match
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      // If not matching, return an error object on the form group
      return { passwordsNotMatching: true };
    }
    return null; // No error
  }

  onSubmit() {
    if (this.signupForm.valid) {
      console.log(this.signupForm.value);
      let info = {
        "firstName": this.signupForm.value.firstName,
        "lastName": this.signupForm.value.lastName,
        "password": this.signupForm.value.password,
        "confirmPassword": this.signupForm.value.confirmPassword,
        "isActive": true,
        "email": this.signupForm.value.email,
        "confirmemail": this.signupForm.value.email
      }
      this.apiService.register(info).subscribe({
        next: (res: any) => {
          this.notificationsService.success('Success!', res.message);
          localStorage.setItem('documentmanagement', JSON.stringify({ userId: res.userId, token: res.token }));
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.notificationsService.error('Error!', error.message);
        }
      });

    }
  }
}