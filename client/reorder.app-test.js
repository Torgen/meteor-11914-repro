import lists from '/imports/lists.js';
import { assert } from 'chai';
import denodeify from 'denodeify';

const promiseCall = denodeify(Meteor.call);

function waitForSubscriptions() {
  return new Promise(function(resolve) {
    const poll = Meteor.setInterval(function() {
      if (DDP._allSubscriptionsReady()) {
        Meteor.clearInterval(poll);
        resolve();
      }
    }, 200);
  });
}

function waitForMethods() {
  return new Promise(function (resolve) {
    Meteor.apply('wait', [], {wait: true}, resolve);
  });
}

describe('reorderList', function() {
  this.timeout(10000);
  it('moves before', async function() {
    await waitForSubscriptions();
    const id = await promiseCall('createList', ['e', 'f', 'g', 'h', 'i', 'j']);
    assert.deepEqual(lists.findOne(id).list, ['e', 'f', 'g', 'h', 'i', 'j']);
    assert.isTrue(await promiseCall('reorderList', id, 'i', {before: 'h'}));
    // Because the server uses rawCollection, the simulated update gets rolled
    // back initially, then delivered again once the oplog arrives.
    await waitForMethods();
    assert.deepEqual(lists.findOne(id).list, ['e', 'f', 'g', 'i', 'h', 'j']);
  });
});
