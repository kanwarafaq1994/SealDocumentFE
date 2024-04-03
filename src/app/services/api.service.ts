import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  baseUrl = environment.baseUrl;
  constructor(public http: HttpClient) { }

  login(data: any) {
    return this.http.post(this.baseUrl + '/Account/login', data);
  }

  register(data: any) {
    return this.http.post(this.baseUrl + '/Account/Register', data);
  }

  getUserDocuments(data: any) {
    return this.http.get(this.baseUrl + '/User/' + data);
  }
  
  getPublicUserDocuments() {
    return this.http.get(this.baseUrl + '/Document/GetPublishDocumentAsync');
  }

  shareDocument(data: any) {
    return this.http.get(this.baseUrl + '/Document/Publish/' + data);
  }
}