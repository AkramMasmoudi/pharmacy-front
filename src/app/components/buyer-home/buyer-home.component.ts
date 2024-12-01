import { CartService } from './../../services/cart.service';
import { Product } from './../../data/product.model';
import { Router } from '@angular/router';
import { ProductService } from './../../services/product.service';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { User } from '../../data/user.model';
import Swal from 'sweetalert2';
import { Cart } from '../../data/cart';

@Component({
  selector: 'app-buyer-home',
  templateUrl: './buyer-home.component.html',
  styleUrl: './buyer-home.component.css',
})
export class BuyerHomeComponent implements OnInit {

  @Output()
  cartSize: EventEmitter<number> = new EventEmitter();


  products: Product[] = [];
  filteredProducts: Product[] = []; // Liste des produits filtrés

  nameFilter: string = '';
  descriptionFilter: string = '';
  imageFilter: string = ''; // "true" ou "false"
  quantityFilterMin: number | null = null;
  quantityFilterMax: number | null = null;
  priceFilterMin: number | null = null;
  priceFilterMax: number | null = null;

  currentUser: User = {
    username: '',
    role: 0,
    password: '',
  };
  filterIsActivated = false;
  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit');
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser = Object.assign(this.currentUser, JSON.parse(userJson));
      if (!this.currentUser.id && this.currentUser.id != 0) {
        this.router.navigate(['login']);
        return;
      }
    } else {
      this.router.navigate(['login']);
      return;
    }
    this.loadAllProducts();
  }

  getAllProducts() {}

  loadAllProducts() {
    let that = this;
    that.productService.getProducts().subscribe({
      next(data: Product[]) {
        that.products = data;
        that.filteredProducts = that.products.map((product) => ({
          ...product,
        }));
        if(!that.currentUser.id){
          that.router.navigate(['login']);
          return;
        }
        that.cartService.getCartByBuyerId(that.currentUser.id).subscribe({
          next: (cartItems : Cart[]) => {
            that.cartSize.emit(cartItems?.length ? cartItems?.length : 0) ;
          },
          error: (err) => {
            console.error('Error : ' + err);
            that.router.navigate(['login']);
          }
        });
      },
      error(err) {
        console.error('Error : ' + err);
        that.router.navigate(['login']);
      },
    });
  }
  desactivateFilters(): void {
    this.filterIsActivated = false;
    this.filteredProducts = this.products.map((product) => ({ ...product }));
  }
  applyFiltersBtn(): void {
    this.filterIsActivated = true;
    this.applyFilters();
  }
  applyFilters() {
    if (this.filterIsActivated) {
      this.filteredProducts = this.products.filter((product) => {
        const matchesName = this.nameFilter
          ? product.name.toLowerCase().includes(this.nameFilter.toLowerCase())
          : true;
        const matchesDescription = this.descriptionFilter
          ? product.description
              .toLowerCase()
              .includes(this.descriptionFilter.toLowerCase())
          : true;
        const matchesImage =
          this.imageFilter === 'true'
            ? !!product.imageBase64
            : this.imageFilter === 'false'
            ? !product.imageBase64
            : true;
        const matchesQuantityMin =
          this.quantityFilterMin !== null
            ? product.quantity >= this.quantityFilterMin
            : true;
        const matchesPriceMin =
          this.priceFilterMin !== null
            ? product.price >= this.priceFilterMin
            : true;
        const matchesQuantityMax =
          this.quantityFilterMax !== null
            ? product.quantity <= this.quantityFilterMax
            : true;
        const matchesPriceMax =
          this.priceFilterMax !== null
            ? product.price <= this.priceFilterMax
            : true;

        return (
          matchesName &&
          matchesDescription &&
          matchesImage &&
          matchesQuantityMin &&
          matchesPriceMin &&
          matchesQuantityMax &&
          matchesPriceMax
        );
      });
    }
  }

  addToCart(product: Product) {
    if (!this.currentUser.id || !product.id) {
      this.router.navigate(['login']);
      return;
    }
    Swal.fire({
      title: 'Choisissez une quantité',
      input: 'number',
      inputAttributes: {
        min: '1',
        max: product.quantity+'',
        step: '1',
      },
      inputValue: 1,
      showCancelButton: true,
      confirmButtonText: 'Ajouter au panier',
      cancelButtonText: 'Annuler',
      preConfirm: (quantity) => {
        if (quantity <= 0) {
          Swal.showValidationMessage('La quantité doit être supérieure à 0');
        }
        return quantity;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const quantity = parseInt(result.value, 10);

        if(!this.currentUser.id || !product.id || !quantity){
          return;
        }
        const cart = {
          buyerId: this.currentUser.id,
          productId: product.id,
          quantity: quantity,
        };

        this.cartService.addProductToCart(cart).subscribe({
          next: () => {
            Swal.fire({
              title: 'Succès',
              text: `"${product.name}" a été ajouté au panier avec une quantité de ${quantity}.`,
              icon: 'success',
              confirmButtonText: 'OK',
            });
            this.loadAllProducts();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erreur',
              text: `Impossible d'ajouter "${product.name}" au panier. ${err.message}`,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }

  addToFavorites(product: Product) {}
}
