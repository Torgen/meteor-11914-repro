import lists from '/imports/lists.js';

Meteor.methods({
  reorderList(listId, item, reorder) {
    const parent = lists.findOne({_id: listId, list: item});
    console.log('before sim', parent);
    const ix = parent?.list?.indexOf(item);
    if (ix === undefined) { return false; }
    let npos = ix;
    let mlist = parent.list.filter((p) => p !== item);
    if ('pos' in reorder) {
      npos += reorder.pos
      if (npos < 0) { return false; }
      if (npos > mlist.length) { return false; }
    } else if ('before' in reorder) {
      npos = mlist.indexOf(reorder.before)
      if (npos < 0) { return false; }
    } else if ('after' in reorder) {
      npos = 1 + mlist.indexOf(reorder.after);
      if (npos < 1) { return false; }
    } else return false;
    mlist.splice(npos, 0, item)
    lists.update({_id: listId}, {$set: {list: mlist}});
    console.log('after sim', lists.findOne({_id: listId}));
    return true;
  }
});
