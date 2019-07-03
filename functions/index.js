const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require("../.config");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dopaminebomb.firebaseio.com"
});

const express = require("express")
const app = express();

app.get('/yeets', (req, res) => {
    admin
    .firestore()
    .collection('yeets')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let yeets = [];
        data.forEach(doc => {
            yeets.push({
              yeetId: doc.id,
              body: doc.data().body,
              userName: doc.data().userName,
              createdAt: doc.data().createdAt  
            });
        });
        return res.json(yeets)
    })
    .catch(err => console.error(err))
})

app.post('/yeet', (req, res) => {
   const newYeet = {
       body: req.body.body,
       userName: req.body.userName,
       createdAt: new Date().toISOString()
   }

   admin.firestore()
   .collection('yeets')
   .add(newYeet)
   .then(doc => {
       res.json({message: `document ${doc.id} created successfully`})
   })
   .catch(err => {
       res.status(500).json({error: 'something went wrong'})
       console.error(err)
   })
})

exports.api = functions.https.onRequest(app);
