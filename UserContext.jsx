// UserContext.js
import React, {createContext, useState} from 'react';
import {
  doc,
  addDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {db} from './mockData/config.jsx';

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [user, setUser] = useState(null);

  const signIn = async newUser => {
    const {username: userName, password} = newUser;
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('userName', '==', userName.toLowerCase()),
      where('password', '==', password),
    );

    let userDoc = null;

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          // Assuming you want to grab the first match
          userDoc = {id: doc.id, ...doc.data()};
        });
        console.log('USER DOC: ', userDoc);
        setUser(userDoc);

        

        return userDoc;
      } else {
        console.log('No matching user.');
      }
    } catch (error) {
      console.error('Error signing in: ', error);
    }

    return null;
  };

  const signOut = () => {
    setUser(null);
  };

  const setUserLocation = (name) => {
     
  };

  return (
    <UserContext.Provider value={{user, signIn, signOut}}>
      {children}
    </UserContext.Provider>
  );
};
