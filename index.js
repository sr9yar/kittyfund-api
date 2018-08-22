const express = require('express')
const router = express.Router()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('./models/User.js')
const jwt = require('jsonwebtoken')
const secretKey = 'superSecret'
const apiPrefix = '/api/v1'
mongoose.Promise = require('bluebird')
mongoose.connect('mongodb://kittyfund', {
  useMongoClient: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'mongo connection error:'))
db.once('open', () => {
  console.log('mongo connected')
})

const pgLimit = 25
let pgPage = 1
const app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())
app.use(morgan('tiny'))
const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1]
  } else if (req.query && req.query.token) {
    return req.query.token
  }
  return null
}

const verifyToken = token => {
  if (!token) {
    return null
  }
  try {
    const decoded = jwt.verify(token, secretKey)
    return decoded
  } catch (err) {
    console.log(err)
    return null
  }
}

router.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.url === '/' || req.url === '/login' || req.url === '/register' || req.url === '/reset') return next()
  const payload = verifyToken(getToken(req))
  if (payload) {
    return next()
  } else {
    res.json({
      message: 'Authorization error'
    })
  }
})

router.post('*', (req, res, next) => {
  if (typeof req.body.page !== 'undefined' && !isNaN(Number(req.body.page))) {
    if (Number(req.body.page) > 0) {
      pgPage = Number(req.body.page)
    } else {
      pgPage = 1
    }
  }
  res.locals.pagination = {
    page: pgPage,
    limit: pgLimit,
    skip: (pgPage - 1) * pgLimit
  }
  next()
})

router.get('/', (req, res) => {
  res.json({
    errorCode: 0,
    errorText: 'Success',
    data: {
      type: 'api',
      version: '1.0'
    }
  })
})

router.post('/login', (req, res) => {
  if (req.body.email && req.body.password) {
    User.findOne({
      email: req.body.email
    }, (err, user) => {
      if (err) {
        res.json({
          message: err
        })
      }
      if (user) {
        bcrypt.compare(req.body.password, user.password, (error, response) => {
          if (error) {
            console.log('bcrypt err: ', error)
          }
          if (response) {
            const u = user.toObject()
            delete u.password
            delete u.salt
            const payload = {
              email: user.email
            }
            const token = jwt.sign(payload, secretKey)
            res.json({
              message: 'ok',
              authorization: 'Bearer ' + token,
              token: token,
              user: u
            })
          } else {
            res.status(401).json({
              message: 'passwords did not match'
            })
          }
        })
      } else {
        res.status(401).json({
          message: 'no such user found'
        })
      }
    })
  } else {
    res.status(401).json({
      message: 'Email or password or both are missing'
    })
  }
})

router.get('/debug',
  (req, res) => {
    console.log(req.get('Authorization'))
    res.json({
      'Authorization': req.get('Authorization')
    })
  })

const users = require('./routes/users')
const lists = require('./routes/lists')
const funds = require('./routes/funds')

app.use(apiPrefix, router)
app.use(apiPrefix + '/users', users)
app.use(apiPrefix + '/lists', lists)
app.use(apiPrefix + '/funds', funds)
app.listen(9134, () => {
  console.log('kittyfund-api started on port 9134')
})
