var express = require('express');
var router = express.Router();
var morgan = require('morgan');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var User = require('./models/User.js');
var jwt = require('jsonwebtoken');
var secretKey = 'verySecretKey';
var apiPrefix = '/api/v1';
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://kittyfundAdmin:$$qwe123QWE##@localhost:27017/kittyfund', {
	useMongoClient: true,
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error:'));
db.once('open', function() {
	console.log('mongo connected');
});
var pgLimit = 25;
var pgPage = 1;
var app = express();
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(morgan('tiny'));
var getToken = function(req) {
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		return req.headers.authorization.split(' ')[1];
	} else if (req.query && req.query.token) {
		return req.query.token;
	}
	return null;
};
var verifyToken = function(token) {
	if (!token) {
		return null;
	}
	try {
		var decoded = jwt.verify(token, secretKey);
		return decoded;
	} catch (err) {
		console.log(err);
		return null;
	}
};
router.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if (req.url === '/' || req.url === '/login' || req.url === '/register' || req.url === '/reset') return next();
	var payload = verifyToken(getToken(req));
	if (payload) {
		return next();
	} else {
		res.json({
			message: "Authorization error"
		});
	}
});
router.post('*', function(req, res, next) {
	if (typeof req.body.page !== 'undefined' && !isNaN(Number(req.body.page))) {
		if (Number(req.body.page) > 0) {
			pgPage = Number(req.body.page);
		} else {
			pgPage = 1;
		}
	}
	res.locals.pagination = {
		page: pgPage,
		limit: pgLimit,
		skip: (pgPage - 1) * pgLimit,
	};
	next();
});
router.get('/', function(req, res) {
	res.json({
		errorCode: 0,
		errorText: 'Success',
		data: {
			type: 'api',
			version: '1.0'
		},
	});
});
router.post("/login", function(req, res) {
	if (req.body.email && req.body.password) {
		User.findOne({
			email: req.body.email
		}, function(err, user) {
			if (err) {
				res.json({
					message: err
				});
			}
			if (user) {
				bcrypt.compare(req.body.password, user.password, function(error, response) {
					if (response) {
						var u = user.toObject();
						delete u.password;
						delete u.salt;
						var payload = {
							email: user.email
						};
						var token = jwt.sign(payload, secretKey);
						res.json({
							message: 'ok',
							authorization: 'Bearer ' + token,
							token: token,
							user: u
						});
					} else {
						res.status(401).json({
							message: 'passwords did not match'
						});
					}
				});
			} else {
				res.status(401).json({
					message: 'no such user found'
				});
			}
		});
	} else {
		res.status(401).json({
			message: 'Email or password or both are missing'
		});
	}
});
router.get("/debug",
	function(req, res) {
		console.log(req.get('Authorization'));
		res.json({
			"Authorization": req.get('Authorization')
		});
	});
var users = require('./routes/users');
var lists = require('./routes/lists');
var funds = require('./routes/funds');
app.use(apiPrefix, router);
app.use(apiPrefix + '/users', users);
app.use(apiPrefix + '/lists', lists);
app.use(apiPrefix + '/funds', funds);
app.listen(9134, function() {
	console.log('kittyfund-api started on port 9134');
});