import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword,verifyPassword,createSessionToken,hashSessionToken } from '../src/modules/customers/customer.password.js';

test('customer passwords are stored as salted hashes and verified',async()=>{
 const password='RideYou-Secure-2026!';
 const stored=await hashPassword(password);
 assert.notEqual(stored,password);
 assert.equal(await verifyPassword(password,stored),true);
 assert.equal(await verifyPassword('wrong-password',stored),false);
});
test('customer session tokens are random and only their hashes are stored',()=>{
 const first=createSessionToken(),second=createSessionToken();
 assert.notEqual(first,second);
 assert.notEqual(first,hashSessionToken(first));
 assert.equal(hashSessionToken(first),hashSessionToken(first));
});
