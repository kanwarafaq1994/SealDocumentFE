import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private jwtHelper: JwtHelperService) { }
  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    let localStorageData: any = localStorage.getItem('documentmanagement');
    if (JSON.parse(localStorageData) != null) {
      if (this.jwtHelper.isTokenExpired(JSON.parse(localStorageData).token)) {
        this.router.navigate(['login']);
        return false;
      } else {
        return true;
      }
    } else if (JSON.parse(localStorageData) == null) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}