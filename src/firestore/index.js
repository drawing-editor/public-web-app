// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { firebaseConfig } from "./config.js";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default firebase;

export const addShape = (userId, sheetId, shapeData) => {
  return db.collection(userId)
    .doc(`${sheetId}`)
    .collection("shapes")
    .add(shapeData);
};

export const updateShape = (userId, sheetId, shapeId, shapeData) => {
  return db.collection(userId)
    .doc(sheetId)
    .collection("shapes")
    .doc(shapeId)
    .update(shapeData);
};

export const deleteShape = (userId, sheetId, shapeId) => {
  return db.collection(userId)
    .doc(sheetId)
    .collection("shapes")
    .doc(shapeId)
    .delete();
};

export const addSheet = (userId, sheetData) => {
  return db.collection(userId)
    .add(sheetData);
};

export const loadAllSheets = (userId) => {
  return db.collection(userId)
    .get();
};

export const loadSheet = (userId, sheetId) => {
  return db.collection(userId)
    .doc(sheetId)
    .collection("shapes")
    .get();
};

export const updateSheet = (userId, sheetId, sheetData) => {
  return db.collection(userId)
    .doc(sheetId)
    .update(sheetData);
}

export const deleteSheet = (userId, sheetId) => {
  /* may cause out-of-memory errors:
   * https://firebase.google.com/docs/firestore/manage-data/delete-data#collections
   */
  db.collection(userId)
    .doc(sheetId)
    .collection("shapes")
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        db.collection(userId)
          .doc(sheetId)
          .collection("shapes")
          .doc(doc.id)
          .delete(); // ignore deletion failure
      });
    });
  return db.collection(userId)
    .doc(sheetId)
    .delete();
};

export const onAuthStateChange = (observer) => {
  return firebase.auth().onAuthStateChanged(observer);
}

export const signIn = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
};

export const signOut = () => {
  firebase.auth().signOut();
};
