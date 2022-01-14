import firebase from 'firebase/app';
import analytics from 'firebase/analytics';
import firestore from 'firebase/firestore';
import secret from './firebase.secret';

  var firebaseConfig = secret;

  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  //const Analytics = firebaseApp.analytics();
  const Database = firebaseApp.firestore();

  export default { Analytics, Database };