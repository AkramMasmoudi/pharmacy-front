import { User } from './../../data/user.model';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit{
  username: string = '';
  password: string = '';
  role: number = 1;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('user');
  }

  login() {

    let user : User = {
      username : this.username,
      password : this.password,
      role : this.role
    }

    this.authService.login(user).subscribe({
      next: (response) => {
        console.log("response",response);
        localStorage.setItem('user', JSON.stringify(response));
        this.router.navigate(['/products']);
      },
      error: (error) => {
        console.error('Error:', error);
        localStorage.removeItem('user');
      },
      complete: () => {
        console.log('Complete');
      },
    });
  }
  register(){
    this.router.navigate(['register']);
  }

}
