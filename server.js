const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const PORT = process.env.PORT || 3005
server.listen(PORT, () => {
  console.log(`Server ready. Port: ${PORT}`)
})

app.use(express.static(__dirname))

let users = 0

io.on('connection', (S) => {

  // ----------------------------------------------------------------
  console.log('список комнат - ')
  console.log(S.rooms)
  console.log('--------------------------------------------------------')
  // ----------------------------------------------------------------

  let user = false

  S.on('new message', (message) => {
    S.broadcast.emit('new message', {
      username: S.username,
      message
    })
  })

  S.on('add user', (username) => {

    if (user) return

    S.join(username)

    // ----------------------------------------------------------------
    console.log('список комнат - ')
    console.log(S.rooms)
    console.log('--------------------------------------------------------')
    // ----------------------------------------------------------------

    S.username = username
    ++users
    user = true
    S.emit('login', {
      users
    })

    S.broadcast.to('some room').emit('user joined', {
      username: S.username,
      users
    })

  })

  S.on('typing', () => {
    S.broadcast.emit('typing', {
      username: S.username
    })
  })

  S.on('stop typing', () => {
    S.broadcast.emit('stop typing', {
      username: S.username
    })
  })

  S.on('disconnect', () => {
    if (user) {

      --users

      S.broadcast.emit('user left', {
        username: S.username,
        users
      })
    }
  })
})