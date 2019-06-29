const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseConfig = require('../.config')

admin.initializeApp(firebaseConfig);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((req, res) => {
 response.send("Hello World!");
});

exports.getYeets = functions.https.onRequest((req, res) => {
    admin.firestore().collection('yeets').get()
    .then(data => {
        let yeets = [];
        data.forEach(doc => {
                yeets.push(doc.data());
        });
        return response.json(yeets)
    })
    .catch(err => console.error(err))
})

exports.createYeet = functions.https.onRequest((req, res) => {
   const newYeet = {
       body: req.body.body,
       userName: req.body.userName,
       createdAt: admin.firestore.Timestamp.fromDate(new Date())
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