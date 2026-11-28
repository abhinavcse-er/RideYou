import test from 'node:test';
import assert from 'node:assert/strict';
import { FOUR_WHEELER_CLASSES, isFourWheelerClass, canQuoteBooking, canAssignBooking, canTransitionTrip } from '../src/modules/admin/admin.policy.js';

test('only explicit four-wheeler classes are accepted',()=>{
  for(const value of FOUR_WHEELER_CLASSES) assert.equal(isFourWheelerClass(value),true);
  for(const value of ['bike','scooter','motorcycle','auto','',null,undefined]) assert.equal(isFourWheelerClass(value),false);
});
test('fare quotes can only be sent for new requests',()=>{
  assert.equal(canQuoteBooking('requested'),true);
  for(const value of ['quoted','accepted','assigned','started','completed','cancelled']) assert.equal(canQuoteBooking(value),false);
});
test('assignment requires customer fare acceptance',()=>{
  assert.equal(canAssignBooking('accepted'),true);
  assert.equal(canAssignBooking('quoted'),false);
  assert.equal(canAssignBooking('requested'),false);
});
test('trip status transitions are constrained',()=>{
  assert.equal(canTransitionTrip('assigned','started'),true);
  assert.equal(canTransitionTrip('started','completed'),true);
  assert.equal(canTransitionTrip('assigned','completed'),false);
  assert.equal(canTransitionTrip('completed','started'),false);
  assert.equal(canTransitionTrip('requested','assigned'),false);
});
