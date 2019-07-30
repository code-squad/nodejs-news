const jwt = require('jsonwebtoken');
const express = require('express');
const passport = require('passport');

module.exports = function(req, res, next) {
	const token = req.cookies.auth_token;
	const session = req.isAuthenticated();

	if (!session && !token) {
		//user not authenticated, redirect to login page
		res.redirect('/auth/login');
	}
	// if (!token) return res.status(401).send('Access Denied');
	if (token) {
		try {
			const verified = jwt.verify(token, process.env.SECRET_KEY);
			if (verified) next();
		} catch (err) {
			res.status(400).send('Invalid Token');
		}
	} else if (req.user) {
		next();
	}
};
