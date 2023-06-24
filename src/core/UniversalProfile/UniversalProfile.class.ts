import {
  initialPermissions,
  type Permission,
  type Permissions,
  UniversalProfileReader,
} from './UniversalProfileReader.class';
import { generatePermissionKey } from './utils/generate-permission-key';
import { type TransactionData } from './models/transaction-data';
import { numberToBytes } from '../utils/number-to-bytes';

export enum ERC725XOperationType {
  call,
  create,
  create2,
  staticCall,
  delegateCall,
}

const ADDRESS0 = 0x0000000000000000000000000000000000000000;

export class UniversalProfile extends UniversalProfileReader {
  public async setData(keys: string[], values: string[]) {
    const setData = this._contract.methods.setData(keys, values);
    await setData.send({ from: this._address });
  }

  public async execute(
    type: ERC725XOperationType,
    value: string,
    bytecode: string,
    to?: string
  ): Promise<TransactionData> {
    const addressTo = to || ADDRESS0;
    return (await this._contract.methods
      .execute(type, addressTo, value, bytecode)
      .send({ from: this._address })) as TransactionData;
  }

  public getBytecodeExecution(
    type: ERC725XOperationType,
    value: string,
    bytecode: string,
    to?: string
  ): string {
    const addressTo = to || ADDRESS0;
    return this._contract.methods.execute(type, addressTo, value, bytecode).encodeABI();
  }

  public async setPermissionsTo(
    address: string,
    permissions: Partial<Permissions> | 'full'
  ): Promise<void> {
    const permissionsObject = initialPermissions;
    if (permissions !== 'full') {
      for (const permission in permissions) {
        const value = permissions[permission as Permission];
        permissionsObject[permission as Permission] = value || false;
      }
    }
    const permissionsValue =
      permissions === 'full'
        ? '0x000000000000000000000000000000000000000000000000000000000000ffff'
        : this._erc725.encodePermissions(permissionsObject);

    if (!(await this.fetchAddressPermissions()).includes(address)) {
      const permissionsArrayKey = this._web3.utils.keccak256('AddressPermissions[]');
      const permissionsLength: number = this._web3.utils.hexToNumber(
        (await this.getDataUnverified([permissionsArrayKey]))[0]
      ) as number;

      await this.setData(
        [
          generatePermissionKey(address),
          this._web3.utils.keccak256('AddressPermissions[]'),
          this._web3.utils.keccak256('AddressPermissions[]').slice(0, 34) +
            numberToBytes(permissionsLength, 32),
        ],
        [permissionsValue, '0x' + numberToBytes(permissionsLength + 1, 64), address]
      );
    } else {
      await this.setData([generatePermissionKey(address)], [permissionsValue]);
    }
  }

  private async fetchKeyManagerAddress(): Promise<string> {
    return await this._contract.methods.owner().call();
  }
}
