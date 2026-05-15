import { ethers } from 'ethers';
import { mnemonicToSeedSync, entropyToMnemonic } from 'bip39';
import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { blake2b } from '@noble/hashes/blake2b';
import { hmac } from '@noble/hashes/hmac';
import type { AssetSymbol } from '@crystal/shared';
import { env } from '../config/env';

// ── Deterministic mnemonic: derived from userId + server secret (never stored) ──

function deriveUserMnemonic(userId: string): string {
  const entropy = sha256(new TextEncoder().encode(`crystal:${userId}:${env.WALLET_SECRET}`));
  return entropyToMnemonic(Buffer.from(entropy.slice(0, 16)));
}

// ── SLIP-0010 ed25519 derivation (Solana, SUI, Cardano) ──

function slip10Master(seed: Uint8Array): { key: Uint8Array; chainCode: Uint8Array } {
  const I = hmac(sha512, Buffer.from('ed25519 seed'), seed);
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

function slip10Child(
  parent: { key: Uint8Array; chainCode: Uint8Array },
  index: number
): { key: Uint8Array; chainCode: Uint8Array } {
  const idx = (index | 0x80000000) >>> 0;
  const data = new Uint8Array(37);
  data[0] = 0x00;
  data.set(parent.key, 1);
  new DataView(data.buffer).setUint32(33, idx, false);
  const I = hmac(sha512, parent.chainCode, data);
  return { key: I.slice(0, 32), chainCode: I.slice(32) };
}

function slip10Derive(seed: Uint8Array, path: number[]): Uint8Array {
  let node = slip10Master(seed);
  for (const idx of path) node = slip10Child(node, idx);
  return node.key;
}

// ── Pure-JS base58 (Bitcoin alphabet) ──

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  let num = BigInt('0x' + Buffer.from(bytes).toString('hex'));
  let result = '';
  while (num > 0n) {
    result = BASE58_ALPHABET[Number(num % 58n)] + result;
    num /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = '1' + result;
  }
  return result;
}

function base58checkEncode(payload: Uint8Array): string {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  return base58Encode(new Uint8Array([...payload, ...checksum]));
}

// ── XRP custom base58 alphabet ──

const XRP_ALPHABET = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';

function xrpBase58Encode(bytes: Uint8Array): string {
  let num = BigInt('0x' + Buffer.from(bytes).toString('hex'));
  let result = '';
  while (num > 0n) {
    result = XRP_ALPHABET[Number(num % 58n)] + result;
    num /= 58n;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = XRP_ALPHABET[0] + result;
  }
  return result;
}

function xrpAddressFromPubKey(compressedPubKey: Uint8Array): string {
  const accountId = ripemd160(sha256(compressedPubKey));
  const payload = new Uint8Array([0x00, ...accountId]);
  const checksum = sha256(sha256(payload)).slice(0, 4);
  return xrpBase58Encode(new Uint8Array([...payload, ...checksum]));
}

// ── Pure-JS bech32 (for Bitcoin P2WPKH and Cardano) ──

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_GEN     = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function bech32Polymod(values: number[]): number {
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= BECH32_GEN[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function convertBits(data: Uint8Array, fromBits: number, toBits: number): number[] {
  let acc = 0, bits = 0;
  const result: number[] = [];
  const maxV = (1 << toBits) - 1;
  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >> bits) & maxV);
    }
  }
  if (bits > 0) result.push((acc << (toBits - bits)) & maxV);
  return result;
}

function bech32Encode(hrp: string, words: number[]): string {
  const values = [...bech32HrpExpand(hrp), ...words, 0, 0, 0, 0, 0, 0];
  const checksum = bech32Polymod(values) ^ 1;
  const out = [...words];
  for (let i = 0; i < 6; i++) out.push((checksum >> (5 * (5 - i))) & 31);
  return hrp + '1' + out.map((d) => BECH32_CHARSET[d]).join('');
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getDepositAddress(
  userId: string,
  symbol: AssetSymbol
): Promise<string> {
  const mnemonic = deriveUserMnemonic(userId);
  const seed = mnemonicToSeedSync(mnemonic);
  const seedBytes = new Uint8Array(seed);

  switch (symbol) {
    case 'ETH':
    case 'USDT':
    case 'BNB': {
      const hd = ethers.HDNodeWallet.fromSeed(seed).derivePath("m/44'/60'/0'/0/0");
      return hd.address;
    }

    case 'SOL': {
      // SLIP-0010 ed25519 at m/44'/501'/0'/0'
      const privKey = slip10Derive(seedBytes, [44, 501, 0, 0]);
      const pubKey = ed25519.getPublicKey(privKey);
      // SOL address = base58 of the 32-byte public key (no checksum)
      return base58Encode(pubKey);
    }

    case 'SUI': {
      // SLIP-0010 ed25519 at m/44'/784'/0'/0'/0'
      const privKey = slip10Derive(seedBytes, [44, 784, 0, 0, 0]);
      const pubKey = ed25519.getPublicKey(privKey);
      // SUI address = 0x + blake2b-256([0x00 (ed25519 flag), ...pubkey])
      const hash = blake2b(new Uint8Array([0x00, ...pubKey]), { dkLen: 32 });
      return '0x' + Buffer.from(hash).toString('hex');
    }

    case 'BTC': {
      // P2WPKH native SegWit (bc1q...)
      const hd = ethers.HDNodeWallet.fromSeed(seed).derivePath("m/44'/0'/0'/0/0");
      const pubKey = Buffer.from(hd.publicKey.slice(2), 'hex');
      const hash160 = ripemd160(sha256(pubKey));
      const words = [0, ...convertBits(hash160, 8, 5)];
      return bech32Encode('bc', words);
    }

    case 'XRP': {
      const hd = ethers.HDNodeWallet.fromSeed(seed).derivePath("m/44'/144'/0'/0/0");
      const pubKey = Buffer.from(hd.publicKey.slice(2), 'hex');
      return xrpAddressFromPubKey(pubKey);
    }

    case 'ADA': {
      // Enterprise address: SLIP-0010 ed25519, blake2b-224 payment key hash, bech32 'addr'
      const privKey = slip10Derive(seedBytes, [1852, 1815, 0, 0]);
      const pubKey = ed25519.getPublicKey(privKey);
      const keyHash = blake2b(pubKey, { dkLen: 28 }); // blake2b-224
      // Mainnet enterprise address header = 0x61
      const payload = new Uint8Array([0x61, ...keyHash]);
      const words = convertBits(payload, 8, 5);
      return bech32Encode('addr', words);
    }

    case 'DOGE': {
      // P2PKH: version byte 0x1E, BTC base58check
      const hd = ethers.HDNodeWallet.fromSeed(seed).derivePath("m/44'/3'/0'/0/0");
      const pubKey = Buffer.from(hd.publicKey.slice(2), 'hex');
      const hash160 = ripemd160(sha256(pubKey));
      return base58checkEncode(new Uint8Array([0x1e, ...hash160]));
    }

    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }
}

export const CHAIN_NETWORKS: Record<AssetSymbol, string> = {
  BTC:  'Bitcoin Network',
  ETH:  'ERC-20',
  USDT: 'ERC-20',
  BNB:  'BEP-20',
  SOL:  'Solana Network',
  XRP:  'XRP Ledger',
  ADA:  'Cardano Network',
  DOGE: 'Dogecoin Network',
  SUI:  'Sui Network',
};
