import { CartService } from './../../services/cart.service';
import { User } from './../../data/user.model';
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { Cart } from '../../data/cart';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit{

  nbProduct = 0;
  user : User = {
    username : "",
    role : 0,
    password : ""
  };
  constructor(private router: Router,private cartService : CartService) {}

  ngOnInit() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.user = Object.assign(this.user, JSON.parse(userJson));
    }
    if(!this.user.id){
      this.router.navigate(['login']);
      return;
    }
    this.cartService.getCartByBuyerId(this.user.id).subscribe({
      next: (cartItems : Cart[]) => {
        this.nbProduct = cartItems?.length ? cartItems?.length : 0;
      },
      error: (err) => {
        console.error('Error : ' + err);
        this.router.navigate(['login']);
      }
    });
  }

  navigateTo(path: string): void {
    if(this.nbProduct < 1 && path == "/cart")
      return;
    this.router.navigate([path]);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
