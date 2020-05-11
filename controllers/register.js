const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.returning('email')
      .insert({
        hash: hash,
        email: email
      })
      .into('login')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch((err) => {
        console.log(err);
        trx.rollback;
        res.status(400).json('Rollback was called.')  
    })
    .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
  handleRegister: handleRegister
};

