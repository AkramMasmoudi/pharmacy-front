import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../data/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = 'http://localhost:8080/api/users';

  constructor(private readonly http: HttpClient) {}

  login(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, user);
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }
  getUser(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/user`, user);
  }
  logout() {
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${user.id}`, user);
  }
}
