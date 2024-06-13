/* eslint-disable prettier/prettier */
import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import Logo from '../assets/logo.png';
import {users, getEmployees} from '../mockData/mockData';
import {UserContext} from '../UserContext';

const SignInScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {signIn} = useContext(UserContext);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // useEffect to reset the state when the component mounts
  useEffect(() => {
    // Reset the state when the component mounts
    setUsername('');
    setPassword('');
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); // Change this line if you're on iOS
    setPermissionStatus(result);
  };

  const requestPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); // Change this line if you're on iOS
    setPermissionStatus(result);
  };

  const onPressLogin = async () => {
    let foundUser = await signIn({username, password});

    if (foundUser) {
      // Successfully logged in, pass user data to HomeScreen
      console.log(
        'Logged-in user: ' + foundUser.userName + ' / ' + foundUser.password,
      );
      checkPermission();

      if (permissionStatus === RESULTS.DENIED) {
        requestPermission();
      } else if (permissionStatus === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Location permission is blocked. Please enable it from settings.'
        );
      } else {
          navigation.navigate('Home', {user: foundUser});
      }
      // add to save that users for firebase use!
    } else {
      // Display an error message for unsuccessful login
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };

  const onPressSignUp = () => {
    // Navigate to the SignUpScreen
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Welcome</Text>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />

      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Username"
          placeholderTextColor="#003f5c"
          onChangeText={text => setUsername(text)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#003f5c"
          onChangeText={text => setPassword(text)}
        />
      </View>
      <TouchableOpacity onPress={onPressLogin} style={styles.loginBtn}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressSignUp}>
        <Text style={styles.inputText}>Signup</Text>
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
    marginBottom: 10,
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
    backgroundColor: '#a0ceed',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
  },
  inputText: {
    height: 50,
  },

  loginBtn: {
    width: '80%',
    backgroundColor: '#fb5b5a',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
  },
});

export default SignInScreen;
