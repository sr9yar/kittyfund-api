const express = require('express')
const router = express.Router()
const List = require('../models/List.js')
const async = require('async')

const countQuery = (cb) => {
  List.count({}, (err, count) => {
    if (err) {
      cb(err, null)
    } else {
      cb(null, count)
    }
  })
}

router.post('/all', (req, res, next) => {
  const retrieveQuery = (cb) => {
    List.find({})
      .sort({
        createdAt: -1
      })
      .skip(res.locals.pagination.skip)
      .limit(res.locals.pagination.limit)
      .exec((err, doc) => {
        if (err) {
          cb(err, null)
        } else {
          cb(null, doc)
        }
      })
  }

  async.parallel([countQuery, retrieveQuery], (err, results) => {
    if (err) { console.log(err) }
    res.json({
      code: 200,
      data: results[1],
      pagination: {
        last: Math.ceil(results[0] / res.locals.pagination.limit),
        page: res.locals.pagination.page,
        limit: res.locals.pagination.limit,
        total: results[0]
      }
    })
  })
})

router.get('/:id', (req, res, next) => {
  List.findById(req.params.id, (err, post) => {
    if (err) return next(err)
    res.json(post)
  })
})

router.post('/create', (req, res, next) => {
  res.json({
    'error': 'gg'
  })
})

router.put('/:id', (req, res, next) => {
  List.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  }, (err, post) => {
    if (err) return next(err)
    res.json(post)
  })
})

router.delete('/:id', (req, res, next) => {
  List.findByIdAndRemove(req.params.id, (err, post) => {
    if (err) return next(err)
    res.json(post)
  })
})

module.exports = router
