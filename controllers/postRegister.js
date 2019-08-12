const { localUser, registerValidation } = require('../models/LocalUser');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
	const { error } = registerValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	// check if the user is already in the DB
	const emailExist = await localUser.findOne({ email: req.body.email });
	if (emailExist) return res.status(400).send('Email Already Exists');

	// Hash the password
	// The complexity of the string that this has algorithm get generated
	const salt = await bcrypt.genSalt(10);
	const hashPassword = await bcrypt.hash(req.body.password, salt);

	// Create A New User
	const localuser = new localUser({
		name: req.body.name,
		email: req.body.email,
		password: hashPassword
	});

	try {
		// Stores on DB
		await localuser.save();
		console.log('Welcome! Congratulation on your registration!');
		res.redirect('/auth/login');
	} catch (err) {
		res.status(400).send(err);
	}
};
