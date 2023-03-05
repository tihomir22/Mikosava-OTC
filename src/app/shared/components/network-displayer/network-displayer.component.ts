import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IconNamesEnum } from 'ngx-bootstrap-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { filter } from 'rxjs';
import { State } from 'src/app/reducers';
import { list } from 'src/app/utils/chains';
import { environment } from 'src/environments/environment';
import { ProviderService } from '../../services/provider.service';
import { NetworkModalComponent } from '../network-modal/network-modal.component';

@Component({
  selector: 'app-network-displayer',
  templateUrl: './network-displayer.component.html',
  styleUrls: ['./network-displayer.component.scss'],
})
export class NetworkDisplayerComponent {
  public networksAvalaible = list.filter((network) => {
    if (environment.mainnet && network.testnet) {
      return false;
    }
    return true;
  });
  public activeNetwork = null as any;
  public iconNames = IconNamesEnum;
  private dialogShowing = false;

  constructor(
    private store: Store<State>,
    private modalService: BsModalService,
    private providerService: ProviderService
  ) {
    this.providerService.getAccountStream().subscribe((account) => {
      console.log(account)
      this.activeNetwork = this.networksAvalaible.find(
        (network) => network.chainId == account.chainIdConnect
      );
      if (!this.activeNetwork && !this.dialogShowing) {
        this.dialogShowing = true;
        let dialogRef = this.modalService.show(NetworkModalComponent, {
          class: 'modal-dialog-centered network-modal',
          keyboard: false,
          backdrop: 'static',
        });
        console.log("Show")
        dialogRef.onHidden.subscribe((data) => {
          this.dialogShowing = false;
        });
      } else if(this.dialogShowing){
        this.modalService.hide();
      }
    });
  }

  public async selectNetwork(network: { chainId: number }) {
    await ProviderService.changeNetwork(network.chainId);
    if (!this.activeNetwork) {
      window.location.reload();
    }
  }
}
