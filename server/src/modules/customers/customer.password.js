import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCallback);
export async function hashPassword(password){
 const salt=randomBytes(16);
 const derived=await scrypt(password,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});
 return salt.toString('hex')+':'+derived.toString('hex');
}
export async function verifyPassword(password,stored){
 try{const [saltHex,hashHex]=String(stored).split(':');const expected=Buffer.from(hashHex,'hex');const actual=await scrypt(password,Buffer.from(saltHex,'hex'),expected.length,{N:16384,r:8,p:1,maxmem:64*1024*1024});return expected.length===actual.length&&timingSafeEqual(expected,actual);}catch{return false;}
}
export function createSessionToken(){return randomBytes(32).toString('base64url');}
export function hashSessionToken(token){return createHash('sha256').update(token).digest('hex');}
