import { random } from 'lodash';

// tslint:disable-next-line:no-var-requires
const abi: Array<any> = require('./abi.json');
const methodsCount = abi.length;

export function getRandomAbi() {
    return [ abi[random(0, methodsCount - 1)] ];
}
