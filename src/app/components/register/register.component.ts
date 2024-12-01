import { User } from './../../data/user.model';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  nom: string = '';
  prenom: string = '';
  telephone: string = '';
  adresse: string = '';
  role: number = 1; // Valeur par défaut
  password: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {

    const newUser : User = {
      username: this.nom,
      userSecondName: this.prenom,
      tel: this.telephone,
      adress: this.adresse,
      password: this.password,
      role: this.role,
    };
    this.authService.getUser(newUser).subscribe({
      next: () => {
        this.authService.register(newUser).subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (error2) => {
            console.error('Error:', error2);
          },
          complete: () => {
            console.log('Complete');
          },
        });
      },
      error: (error : any) => {
        console.error('Error:', error);
      },
      complete: () => {
        console.log('Complete');
      },
    })

  }
  login(){
    this.router.navigate(['login']);
  }

  disableRegister(){
    return this.password != this.confirmPassword
    || !this.nom || !this.adresse
    || !this.password || !this.confirmPassword
    || this.password.length < 5 ;
  }
}
