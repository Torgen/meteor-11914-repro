import lists from '/imports/lists.js';

Meteor.methods({
  wait() {},
  createList(list) {
    return lists.insert({list});
  },
  reorderList(listId, item, reorder) {
    console.log('before server', lists.findOne(listId));
    try {
      let query, targetPosition;
      if ('pos' in reorder) {
        query = item;
        targetPosition = {$add: [reorder.pos, {$indexOfArray: ["$list", item]}]};
      } else if ('before' in reorder) {
        query = {$all: [item, reorder.before]};
        targetPosition = {$indexOfArray: ["$$mlist", reorder.before]};
      } else if ('after' in reorder) {
        query = {$all: [item, reorder.after]};
        targetPosition = {$add: [1, {$indexOfArray: ["$$mlist", reorder.after]}]}
      } else return false;
      res = Promise.await(lists.rawCollection().updateOne({_id: listId, list: query}, [{
        $set: {
          list: {
            $let: {
              vars: {mlist: {$filter: {input: "$list", cond: {$ne: ["$$this", item]}}}},
              in: {
                $let: {
                  vars: {targetPosition},
                  in: {
                    $concatArrays: [
                      {$cond: [{$eq: ["$$targetPosition", 0]}, [], {$slice: ["$$mlist", 0, "$$targetPosition"]}]},
                      [item],
                      {$cond: [{$eq: ["$$targetPosition", {$size: "$$mlist"}]}, [], {$slice: ["$$mlist", "$$targetPosition", {$subtract: [{$size: "$$mlist"}, "$$targetPosition"]}]}]}
                    ]
                  }
                }
              }
            }
          }
        }
      }]));
      return res.modifiedCount === 1;
    } catch (e) {
      console.log(e);
      return false;
    } finally {
      console.log('after server', lists.findOne(listId));
    }
  }
});
