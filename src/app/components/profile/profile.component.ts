import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { User } from '../../data/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  currentUser : User = {
    username : "",
    role : 0,
    password : ""
  };
  modifiables = false;
  constructor(private readonly router: Router,
              private readonly authService: AuthService
  ) {}

  ngOnInit() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser = Object.assign(this.currentUser, JSON.parse(userJson));
    }
    this.modifiables = false;
  }
  modifierProfile(){
    this.modifiables = true;
  }

 updateProfile() {
    this.authService.updateUser(this.currentUser).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Mettre à jour dans localStorage
        this.modifiables = false;
        Swal.fire(
          'Succès',
          'Profil mis à jour avec succès !',
          'success'
        );
      },
      error: (err :any) => {
        console.error('Erreur lors de la mise à jour du profil :', err);
        Swal.fire(
          'Erreur',
          'Une erreur s\'est produite lors de la mise à jour.',
          'error'
        );
      }
    });
  }


  disableSave(){
    return !this.currentUser.adress || !this.currentUser.username || !this.modifiables;
  }

  gotoProducts(){
    this.router.navigate(['products']);
  }
}
