const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const async = require('async')

const countQuery = (cb) => {
  User.count({}, (err, count) => {
    if (err) {
      cb(err, null)
    } else {
      cb(null, count)
    }
  })
}

router.post('/all', (req, res) => {
  const retrieveQuery = (cb) => {
    User.find({})
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
  User.findById(req.params.id, (err, post) => {
    if (err) return next(err)
    const p = post.toObject()
    delete p.password
    delete p.salt
    res.json(p)
  })
})

router.post('/create', (req, res, next) => {
  User.create(req.body, (err, post) => {
    if (err) return next(err)
    const p = post.toObject()
    delete p.password
    delete p.salt
    res.json(p)
  })
})

router.put('/:id', (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  }, (err, post) => {
    if (err) return next(err)
    const p = post.toObject()
    delete p.password
    delete p.salt
    res.json(p)
  })
})

router.delete('/:id', (req, res, next) => {
  User.findByIdAndRemove(req.params.id, (err, post) => {
    if (err) return next(err)
    const p = post.toObject()
    delete p.password
    delete p.salt
    res.json(p)
  })
})

module.exports = router
