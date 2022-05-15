const express = require('express')
const app = express()
const port = 3000

const AVERAGE_REQUESTS_UNTIL_FAILURE = process.env.AVERAGE_REQUESTS_UNTIL_FAILURE

app.get('/', (req, res) => {
    const dice_roll = Math.floor(Math.random() * AVERAGE_REQUESTS_UNTIL_FAILURE)
    if (dice_roll === 0) {
        res.send(`Rolled a ${AVERAGE_REQUESTS_UNTIL_FAILURE}-sided die and got unlucky, goodbye!`)
        process.exit()
    }
  res.send(`Rolled ${dice_roll}, success!`)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
