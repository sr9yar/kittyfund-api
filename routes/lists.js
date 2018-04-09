var express = require('express');
var router = express.Router();
var List = require('../models/List.js');
var async = require('async');

var countQuery = function(cb) {
	List.count({}, function(err, count) {

		if (err) {
			cb(err, null)
		} else {
			cb(null, count);
		}
	});
};

router.post('/all', function(req, res, next) {

	var retrieveQuery = function(cb) {
		List.find({})
			.sort({
				createdAt: -1
			})
			.skip(res.locals.pagination.skip)

		.limit(res.locals.pagination.limit)
			.exec(function(err, doc) {
				if (err) {
					cb(err, null)
				} else {
					cb(null, doc);
				}
			});
	};

	async.parallel([countQuery, retrieveQuery], function(err, results) {
		res.json({
			code: 200,
			data: results[1],
			pagination: {
				last: Math.ceil(results[0] / res.locals.pagination.limit),
				page: res.locals.pagination.page,
				limit: res.locals.pagination.limit,
				total: results[0],
			}

		});
	});

});

router.get('/:id', function(req, res, next) {
	List.findById(req.params.id, function(err, post) {
		if (err) return next(err);
		res.json(post);
	});
});

router.post('/create', function(req, res, next) {
	res.json({
		'error': 'gg'
	});
});

router.put('/:id', function(req, res, next) {
	List.findByIdAndUpdate(req.params.id, req.body, {
		new: true
	}, function(err, post) {
		if (err) return next(err);
		res.json(post);
	});
});

router.delete('/:id', function(req, res, next) {
	List.findByIdAndRemove(req.params.id, function(err, post) {
		if (err) return next(err);
		res.json(post);
	});
});

module.exports = router;