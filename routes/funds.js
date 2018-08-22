const express = require('express')
const router = express.Router()
const Fund = require('../models/Fund.js')
const async = require('async')

const countQuery = cb => {
  Fund.count({}, (err, count) => {
    if (err) {
      cb(err, null)
    } else {
      cb(null, count)
    }
  })
}

router.post('/all', (req, res, next) => {
  const retrieveQuery = (cb) => {
    Fund.find({})
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
    if (err) {
      console.log('err', err)
    }
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
  Fund.findById(req.params.id, (err, post) => {
    if (err) return next(err)
    res.json(post)
  })
})

router.post('/create', (req, res, next) => {
  Fund.create(req.body, (err, post) => {
    if (err) { return next(err) }
    res.json(post)
  })
})

router.put('/:id', (req, res, next) => {
  Fund.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  }, (err, post) => {
    if (err) return next(err)
    res.json(post)
  })
})

router.delete('/:id', (req, res, next) => {
  Fund.findByIdAndRemove(req.params.id, (err, post) => {
    if (err) return next(err)
    res.json(post)
  })
})

module.exports = router
