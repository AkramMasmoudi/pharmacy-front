import { Product } from './../../data/product.model';
import { Router } from '@angular/router';
import { ProductService } from './../../services/product.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { User } from '../../data/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seller-home',
  templateUrl: './seller-home.component.html',
  styleUrl: './seller-home.component.css'
})
export class SellerHomeComponent implements OnInit{
  @ViewChild('newProductimageBase64') newProductimageBase64!: ElementRef;

  products: Product[] = [];

  filteredProducts: Product[] = [];

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
  newProduct: Product = {
    name: '',
    description: '',
    quantity: 0,
    price: 0,
  };
  activeButton = 'list';
  imagePreview: string | ArrayBuffer | null = null;
  newProductImage!: File;
  filterIsActivated = false;
  constructor(
    private readonly productService: ProductService,
    private readonly router: Router
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
      this.newProduct = {
        name: '',
        description: '',
        quantity: 0,
        price: 0,
        sellerId: this.currentUser.id,
      };
    } else {
      this.router.navigate(['login']);
      return;
    }
    this.loadProductsByUserId();
  }

  showProducts(): void {
    this.activeButton = 'list';
  }

  showAddProduct(): void {
    this.activeButton = 'add';
  }
  validateQte() {
    return (
      this.newProduct.quantity !== null &&
      this.newProduct.quantity >= 0 &&
      Number.isInteger(this.newProduct.quantity)
    );
  }
  addProduct(): void {
    if (this.currentUser.id && this.currentUser.id != 0) {
      const formData = new FormData();
      formData.append('name', this.newProduct.name);
      formData.append('description', this.newProduct.description);
      formData.append('quantity', this.newProduct.quantity.toString());
      formData.append('price', this.newProduct.price.toString());
      formData.append('sellerId', this.currentUser.id.toString());
      if (this.newProductImage && this.imagePreview) {
        formData.append('image', this.newProductImage);
      }
      let that = this;
      this.productService.addProduct(formData).subscribe({
        next(value) {
          that.loadProductsByUserId();
        },
        error(err) {
          console.error('Error : ' + err);
        },
      });
      this.newProduct = {
        name: '',
        description: '',
        quantity: 0,
        price: 0,
        sellerId: this.currentUser.id,
      };
      this.newProductimageBase64.nativeElement.value = '';

      this.imagePreview = null;
    } else {
      this.router.navigate(['login']);
    }
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.newProductImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  editProduct(product: any): void {
    Swal.fire({
      title: `Modifier ${product.name}`,
      html: `
        <div>
          <label for="quantity" class="form-label">Quantité :</label>
          <input type="number" id="quantity" class="swal2-input" value="${product.quantity}" min="0">
        </div>
        <div>
          <label for="price" class="form-label">Prix :</label>
          <input type="number" id="price" class="swal2-input" value="${product.price}" step="0.01" min="0">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const quantity = (
          document.getElementById('quantity') as HTMLInputElement
        ).value;
        const price = (document.getElementById('price') as HTMLInputElement)
          .value;

        if (!quantity || !price) {
          Swal.showValidationMessage('Les champs ne peuvent pas être vides.');
          return false;
        }

        return {
          quantity: parseInt(quantity, 10),
          price: parseFloat(price),
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = result.value;

        const updatedProduct = { ...product, ...updatedData };
        this.productService.updateProduct(updatedProduct).subscribe(() => {
          Swal.fire(
            'Succès',
            'Le produit a été mis à jour avec succès.',
            'success'
          );
          this.loadProductsByUserId();
        });
      }
    });
  }

  confirmDelete(productId: number | null | undefined): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteProduct(productId);
      }
    });
  }

  deleteProduct(productId: number | null | undefined): void {
    if(productId != null && productId != undefined){
      let that = this;
      this.productService.deleteProduct(productId).subscribe({
        next(data) {
          Swal.fire(
            'Supprimé !',
            'Le produit a été supprimé avec succès.',
            'success'
          );
          that.loadProductsByUserId();
        },
        error(err) {
          Swal.fire(
            'Erreur',
            "Une erreur s'est produite lors de la suppression.",
            'error'
          );
        },
      });
    }else{
      this.router.navigate(['login']);
    }

  }

  loadProductsByUserId() {
    let that = this;
    that.productService.getProductsByUserId(that.currentUser.id).subscribe({
      next(data: Product[]) {
        that.products = data;
        that.filteredProducts = that.products.map(product => ({ ...product }));
      },
      error(err) {
        console.error('Error : ' + err);
        that.router.navigate(['login']);
      },
    });
  }
  desactivateFilters(): void {
    this.filterIsActivated = false;
    this.filteredProducts = this.products.map(product => ({ ...product }));
  }
  applyFiltersBtn(): void {
    this.filterIsActivated = true;
    this.applyFilters();
  }
  applyFilters(){
    if(this.filterIsActivated ){
      this.filteredProducts = this.products.filter(product => {
        const matchesName = this.nameFilter ? product.name.toLowerCase().includes(this.nameFilter.toLowerCase()) : true;
        const matchesDescription = this.descriptionFilter ? product.description.toLowerCase().includes(this.descriptionFilter.toLowerCase()) : true;
        const matchesImage = this.imageFilter === 'true' ? !!product.imageBase64 : this.imageFilter === 'false' ? !product.imageBase64 : true;
        const matchesQuantityMin = this.quantityFilterMin !== null ? product.quantity >= this.quantityFilterMin : true;
        const matchesPriceMin = this.priceFilterMin !== null ? product.price >= this.priceFilterMin : true;
        const matchesQuantityMax = this.quantityFilterMax !== null ? product.quantity <= this.quantityFilterMax : true;
        const matchesPriceMax = this.priceFilterMax !== null ? product.price <= this.priceFilterMax : true;

        return matchesName && matchesDescription && matchesImage && matchesQuantityMin && matchesPriceMin && matchesQuantityMax && matchesPriceMax;
      });
    }

  }
}

