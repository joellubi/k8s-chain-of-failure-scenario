const express = require('express')
const crypto = require('crypto');

const app = express()
const serverID = crypto.randomUUID()
const port = 3000

const AVERAGE_REQUESTS_UNTIL_FAILURE = process.env.AVERAGE_REQUESTS_UNTIL_FAILURE
const TRIAL_NUMBER = process.env.TRIAL_NUMBER
const BECOMES_UNRESPONSIVE = process.env.BECOMES_UNRESPONSIVE.toLowerCase() === "true"
const SIMULATE_RESOURCES = process.env.SIMULATE_RESOURCES.toLowerCase() === "true"


const simulatedResourcesAvailable = 1000000
let cumulativeResourceUsage = 0
let isUnresponsive = false

const getResponseObject = (isError) => {
    return {
        "timestamp": new Date().toISOString(),
        "serverID": serverID,
        "trialNumber": TRIAL_NUMBER,
        "error": isError,
    }
}

const getNSidedDiceRoll = (numDiscreteCases) => Math.ceil(Math.random() * numDiscreteCases)

const getRandomFailureCondition = (averageRequestsUntilFailure) => {
    return getNSidedDiceRoll(averageRequestsUntilFailure) === 1
}

const getCumulativeFailureCondition = (averageRequestsUntilFailure) => {
    const averageResourceUsagePerRequest = simulatedResourcesAvailable / averageRequestsUntilFailure
    const numDiscreteCases = 2 * averageResourceUsagePerRequest - 1

    cumulativeResourceUsage += getNSidedDiceRoll(numDiscreteCases)
    console.log(`serverID: ${serverID}, cumulativeResourceUsage: ${cumulativeResourceUsage}`)
    
    return cumulativeResourceUsage > simulatedResourcesAvailable
}

const getFailureCondition = SIMULATE_RESOURCES ? getCumulativeFailureCondition : getRandomFailureCondition

app.get('/', (req, res) => {
    if (isUnresponsive) {
        return
    }
    
    const isError = getFailureCondition(AVERAGE_REQUESTS_UNTIL_FAILURE)
    const responseObject = getResponseObject(isError)
    res.send(responseObject)
    
    if (isError && BECOMES_UNRESPONSIVE) {
        isUnresponsive = true
        return
    }

    if (isError) {
        process.exit(1)
    }
})

app.get('/discover', (req, res) => {
    const isError = false
    const responseObject = getResponseObject(isError)
    res.send(responseObject)
})

app.get('/healthz', (req, res) => {
    if (isUnresponsive) {
        res.sendStatus(500)
    } else {
        res.sendStatus(200)
    }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
