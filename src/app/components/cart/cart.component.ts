import { Router } from '@angular/router';
import { User } from '../../data/user.model';
import { CartService } from './../../services/cart.service';
import { Component } from '@angular/core';
import { Cart } from '../../data/cart';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cart: Cart[] = [];
  user : User = {
    username : "",
    role : 1,
    password : ""
  };
  constructor(private readonly router: Router,private readonly cartService: CartService) {}

  ngOnInit() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.user = Object.assign(this.user, JSON.parse(userJson));
    }
    this.getCartByBuyerId();

  }
  getCartByBuyerId(){
    if(!this.user.id){
      this.router.navigate(['login']);
      return;
    }
    this.cartService.getCartByBuyerId(this.user.id).subscribe({
      next: (data) => {
        this.cart = data;
        if(this.cart.length < 1)
          this.navigateTo('products');
      },
      error: (error) => {
        console.error('Error:', error);
      },
      complete: () => {
        console.log('Complete');
      },
    });
  }
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  removeProductFromCart(buyerId : number,productId : number){
    this.cartService.removeProductFromCart(buyerId, productId).subscribe({
      next: (message) => {
        Swal.fire({
          title: 'Succès',
          text: 'Le produit a été supprimé du panier avec succès.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.getCartByBuyerId();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
      }
    });
  }

  clearCart(){
    if(!this.user.id){
      this.router.navigate(['login']);
      return;
    }
    this.cartService.clearCart(this.user.id).subscribe({
      next: (message) => {
        Swal.fire({
          title: 'Succès',
          text: 'Panier vidé avec succès !',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.navigateTo('products');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
      }
    });
  }
  getTotalProduit(c : Cart){
    return c.product?.price ? c.product?.price  * c.quantity : 0;
  }

  calculateTotalPrice(){
    return this.cart.reduce((total, item) => total + this.getTotalProduit(item), 0);
  }

  validerlepanier(){
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Vous allez valider votre panier. Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.validateCart(this.cart).subscribe({
          next: () => {
            this.cart = [];
            Swal.fire({
              title: 'Succès',
              text: 'Votre panier a été validé avec succès !',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              this.router.navigate(['/products']);
            });
          },
          error: (err : any) => {
            Swal.fire({
              title: 'Erreur',
              text: `Une erreur s'est produite lors de la validation : ${err.message}`,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }
}
