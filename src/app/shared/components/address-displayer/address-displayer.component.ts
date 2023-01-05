import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { State } from 'src/app/reducers';
import { copyClipboard, truncateAddress } from 'src/app/utils/utils';

@Component({
  selector: 'app-address-displayer',
  templateUrl: './address-displayer.component.html',
  styleUrls: ['./address-displayer.component.scss'],
})
export class AddressDisplayerComponent {
  public truncate = truncateAddress;
  @Input() address: string = '';
  @Input() isButton: boolean = true;
  constructor(private store: Store<State>, private toastr: ToastrService) {
    if (this.address == '') {
      this.store
        .select((action: State) => action.account)
        .pipe(filter((entry) => Object.values(entry).length > 0))
        .subscribe((data) => {
          this.address = data.address;
        });
    }
  }

  public copyAddressToClipboard() {
    copyClipboard(this.address);
    this.toastr.info('Copied to the clipboard!');
  }
}
