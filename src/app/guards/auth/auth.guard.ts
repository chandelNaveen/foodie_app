import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Strings } from 'src/app/enum/strings.enum';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(
    private alertCtrl: AlertController,
    private authService: AuthService,
     private router: Router
  ) {}

  async canLoad(
    route: Route,
    segments: UrlSegment[]): Promise<boolean> {
      const roleType = route.data.type;
      try {
        const type = await this.authService.checkUserAuth();
        if(type) {
          if(type == roleType) return true;
          else {
            let url = Strings.TABS;
            if(type == 'admin') url = Strings.ADMIN;//'/admin'
            this.navigate(url);
          }
        } else {
          this.checkForAlert(roleType);
        }
      } catch(e) {
        console.log(e);
        this.checkForAlert(roleType);
      }
  }

  navigate(url) {
    this.router.navigateByUrl(url, {replaceUrl: true});
    return false;
  }

  async checkForAlert(roleType) {
    const id = await this.authService.getId();
    if(id) {
      // check network
      console.log('alert: ', id);
      this.showAlert(roleType);
    } else {
      this.authService.logout();
      this.navigate(Strings.LOGIN);
    }
  }

  showAlert(role) {
    this.alertCtrl.create({
      header: 'Authentication Failed',
      message: 'Please check your Internet Connectivity and try again',
      buttons: [
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout();
            this.navigate(Strings.LOGIN);
          }
        },
        {
          text: 'Retry',
          handler: () => {
            let url = Strings.TABS;
            if(role == 'admin') url = Strings.ADMIN; //check it again
            this.navigate(url);
          }
        }
      ]
    })
    .then(alertEl => alertEl.present());
  }
    
}
