const { localUser, loginValidation } = require('../models/LocalUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function(req, res) {
	const { error } = loginValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const user = await localUser.findOne({ email: req.body.email });
	if (!user) return res.status(400).send('Email or Passowrd is wrong');
	// Check if password is correct
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send('Invalid Password');

	const payload = {
		_id: user._id,
		isAdmin: user.isAdmin,
		email: user.email,
		name: user.name
	};
	const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '24h' });
	res.cookie('auth_token', token, { maxAge: 900000, httpOnly: true });
	res.status(200).redirect('/');
};
