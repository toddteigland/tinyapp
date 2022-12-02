module.exports = {
 findUserEmail: (email, users) => {
    for (let user in users) {
      if (email === users[user].email) {
        return users[user];
      }
    }
    return undefined;
  },
};
