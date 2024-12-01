import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        // Affiche une alerte ou redirige en cas d'erreur
        console.error('HTTP Error:', error);
        if(error['status'] == 302){
          alert('Une erreur est survenue lors de la requête. Veuillez vérifier : un compte avec ces informations existe déjà.');
        }else{
          alert('Une erreur est survenue lors de la requête : '+error['message']);
        }
        return throwError(() => new Error(error)) // Relancer l'erreur pour d'autres gestionnaires
      })
    );
  }
}
