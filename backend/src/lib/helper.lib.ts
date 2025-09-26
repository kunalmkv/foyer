import {randomBytes} from 'crypto';

function generateNonce(): string {
    return randomBytes(16).toString('hex');
}

export default {
    generateNonce: generateNonce
}