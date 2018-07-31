export function secureStringComparer(sampleStr: string, equalStr: string): boolean {
    let mismatch = 0;

    for (let index = 0; index < equalStr.length; index++) {
        // tslint:disable-next-line:no-bitwise
        mismatch |= (sampleStr.charCodeAt(index) ^ equalStr.charCodeAt(index));
    }

    return mismatch === 0;
}
