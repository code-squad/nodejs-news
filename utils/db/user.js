const bcrypt = require('bcrypt');

const user = {

  makeUserObj: (id, username, photo_link) => {
    return {"id" : id, "username" : username, "photolink" : photo_link};
  },

  async getCryptoPassword(password) {
    return await bcrypt.hash(password, 10);
  },

  async isValidPassword(inputPassword, dbPassword) {
    const compare = await bcrypt.compare(inputPassword, dbPassword);
    return compare;
  }
}

module.exports = user;