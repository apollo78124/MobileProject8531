/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {collection, addDoc} from 'firebase/firestore';
import {db} from '../mockData/config.jsx';

const SignUpScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignUp = async () => {
    try {
      const newUserRef = await addDoc(collection(db, 'users'), {
        fullName: fullName,
        userName: username,
        password: password,
        role: 'Nurse', // You can set a default role for new users
      });

      // If the document is added successfully, navigate to the SignIn screen
      if (newUserRef.id) {
        Alert.alert('Sign Up Successful', `Welcome, ${fullName}!`);
        navigation.navigate('SignIn');
      }
    } catch (error) {
      console.error('Error signing up: ', error);
      Alert.alert(
        'Sign Up Failed',
        'There was an error creating your account.',
      );
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Register!</Text>

      <View style={styles.inputView}>
        <TextInput
          placeholder="Full Name"
          style={styles.inputText}
          onChangeText={text => setFullName(text)}
          value={fullName}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          placeholder="Username"
          style={styles.inputText}
          onChangeText={text => setUsername(text)}
          value={username}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.inputText}
          onChangeText={text => setPassword(text)}
          value={password}
        />
      </View>

      <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#fb5b5a',
    marginBottom: 30,
    marginTop: 60,
  },
  logo: {
    width: '70%',
    maxWidth: 300,
    height: 100,
    marginBottom: 40,
  },
  inputView: {
    width: '80%',
    backgroundColor: '#c7dae4',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
  },
  inputText: {
    height: 50,
  },

  signUpBtn: {
    width: '80%',
    backgroundColor: '#fb5b5a',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  signUpText: {
    color: 'white',
  },
});

export default SignUpScreen;
