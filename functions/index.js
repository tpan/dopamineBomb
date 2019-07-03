const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require("../.certificate");
var firebaseConfig = require("../.config")
const app = require("express")();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dopaminebomb.firebaseio.com"
});

const firebase= require('firebase')
firebase.initializeApp(firebaseConfig)
const db = admin.firestore();

app.get('/yeets', (req, res) => {
    db
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

   db
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

// Signup Route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        name: req.body.name,
    }
    // TODO validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists) {
                return res.status(400).json({ name: 'this name is already taken'})
            } else {
                return firebase
                .auth()
                .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid;
         return data.user.getIdToken()
        })
        .then(idToken => {
            token = idToken;
        const userCredentials= {
            name: newUser.name,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId
        }
        return db.doc(`/users/${newUser.name}`).set(userCredentials)
        })
        .then((data) =>{
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({ email: 'Email is already in use'})
            } else {
                return res.status(500).json({ error: err.code });
            }
        })
})


exports.api = functions.https.onRequest(app);