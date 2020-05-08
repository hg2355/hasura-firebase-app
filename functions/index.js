

const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
var serviceAccount = require('./firebase-key.json');

// Import the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');
const projectId = 'data-viz-starter-pack-209323'
const keyFilename = 'firebase-key.json'
const scopes = ['https://www.googleapis.com/auth/drive.readonly']

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://family-2355.firebaseio.com",
});


const updateClaims = (uid) => admin.auth().setCustomUserClaims(uid, {
    'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-user-id': uid,
    },
})

exports.processSignUp = functions.auth.user().onCreate((user) => updateClaims(user.uid))

exports.refreshToken = functions.https.onRequest((req, res) => {
    console.log('TOKEN REFRESH', req.query.uid)
    cors(req, res, () => {
        updateClaims(req.query.uid).then(() => {
            res.status(200).send('success')
        }).catch((error) => {
            console.error('REFRESH ERROR', error)
            res.status(400).send(error)
        })
    })
})
