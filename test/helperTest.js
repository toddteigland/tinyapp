const { assert } = require('chai');
const { findUserEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID)
  });
  it('should return undefined if user email is not in database', function() {
    const user = findUserEmail("nonExistent@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, undefined)
  });
});