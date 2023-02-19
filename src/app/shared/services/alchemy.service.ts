import { Injectable } from '@angular/core';
import { Alchemy, NftContractNftsResponse, NftTokenType } from 'alchemy-sdk';
import { BehaviorSubject, filter, firstValueFrom, from, of } from 'rxjs';
import { getNetwork } from 'src/app/utils/chains';
import secrets from 'src/environments/secrets.json';
import { AlchemyERC721 } from '../models/Alchemy-ERC721';
import { ProviderService } from './provider.service';

@Injectable({
  providedIn: 'root',
})
export class AlchemyService {
  private settings = {
    apiKey: secrets.ALCHEMY_API,
    network: '' as any,
  };
  private alchemyInstance!: Alchemy;
  private hasInitEvent = new BehaviorSubject<boolean>(false);
  constructor(private provider: ProviderService) {
    this.init();
  }

  private async init() {
    const [provider, , account, foundActiveNetwork] =
      await this.provider.getTools();
    this.settings.network = foundActiveNetwork.interal_name_id;
    this.alchemyInstance = new Alchemy(this.settings);
    const latestBlock = await this.alchemyInstance.core.getBlockNumber();
    this.hasInitEvent.next(true);
    this.hasInitEvent.complete();
    console.log('The latest block number is', latestBlock);
  }

  private checkIfInit() {
    if (this.hasInitEvent.value == true) return of(true);
    else return from(this.hasInitEvent).pipe(filter((entry) => entry == true));
  }

  public async getAllNftsOwnedByCurrentUser(): Promise<AlchemyERC721> {
    const [provider, , account, foundActiveNetwork] =
      await this.provider.getTools();
    await firstValueFrom(this.checkIfInit());
    const nfts = await this.alchemyInstance.nft.getNftsForOwner(
      account.address
    );
    return nfts as any;
  }

  public async getAllNftsOwnedBySpecificUser(
    address: string
  ): Promise<AlchemyERC721> {
    await firstValueFrom(this.checkIfInit());
    const nfts = await this.alchemyInstance.nft.getNftsForOwner(address);
    return nfts as any;
  }

  public async getAllNftsByCollectionADdress(
    collectionAddress: string
  ): Promise<NftContractNftsResponse> {
    await firstValueFrom(this.checkIfInit());
    const nfts = await this.alchemyInstance.nft.getNftsForContract(
      collectionAddress
    );
    return nfts;
  }

  public async getTokenMetadata(collectionAddress: string, tokenId: string) {
    await firstValueFrom(this.checkIfInit());
    const response = await this.alchemyInstance.nft.getNftMetadata(
      collectionAddress,
      tokenId,
      NftTokenType.ERC721
    );
    return response;
  }

  public switchNetwork(newNetworkChainId: number) {
    const foundActiveNetwork = getNetwork(newNetworkChainId);
    this.settings.network = foundActiveNetwork?.interal_name_id;
    this.alchemyInstance = new Alchemy(this.settings);
  }
}
