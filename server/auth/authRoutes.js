const router = require('express').Router();
const User = require('../users/User');
const jwt = require('jsonwebtoken');

const secret = 'This is a secret'

function generateToken(user) {
const payload = { name: user.username, race: user.race };
return jwt.sign(payload, secret);
};

router.post('/register', function(req, res) {
  User.create(req.body)
    .then(({ username, race }) => {
      // we destructure the username and race to avoid returning the hashed password
      const token = generateToken({username, race});
      // then we assemble a new object and return it
      res.status(201).json({ username, race, token });
    })
    .catch(err => res.status(500).json(err));
});

router.post('/login', (req, res)=> {
  const { username, password, race } = req.body;

  User.findOne({ username })
  .then(user => {
    if (user) {
      user
      .validatePassword(password)
      .then(passwordsMatch => {
        if (passwordsMatch) {
          const {username, race } = user;
          const token = generateToken({ username, race });
          res.status(200).json({ message: `welcome ${username}!`, token });
        } else {
          res.status(401).send('invalid credentials');
        }
      })
      .catch(err => {
        res.send('error comparing passwords');
      });
    } else {
      res.status(401).send('invalid credentials');
    }
  })
    .catch(err => {
      res.send(err);
  });
});

module.exports = router;

