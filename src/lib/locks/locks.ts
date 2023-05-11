import { ELock } from '@/pages/lock/create';
import { Nuki } from './nuki';
import { api } from '../api';

export class LockHelper {
  public lock: Nuki | undefined;
  constructor(
    private readonly lockType: ELock,
    private readonly apiKey: string
  ) {
    switch (this.lockType) {
      case ELock.nuki: {
        this.lock = new Nuki(this.apiKey);
        break;
      }
    }
  }
}
