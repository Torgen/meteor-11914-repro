import lists from '/imports/lists.js';

Meteor.publish(null, function() {
  return lists.find();
});
