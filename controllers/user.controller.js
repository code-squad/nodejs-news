const UserController = {};

UserController.test = async (req, res) => {
    res.json({ state : 'user login'});
} 

module.exports = UserController;