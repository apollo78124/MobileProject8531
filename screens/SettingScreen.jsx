/* eslint-disable prettier/prettier */
import React, {useContext} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {UserContext} from '../UserContext';

const SettingScreen = ({navigation}) => {
  const {user, signOut} = useContext(UserContext);

  const handleLogout = () => {
    signOut();
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      {user && (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              You are currently logged in as{' '}
              <Text style={styles.highlighted}>{user.userName}</Text>.
            </Text>
            <Text style={styles.text}>Full Name: {user.fullName}</Text>
            <Text style={styles.text}>User Role: {user.role}</Text>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
  },
  btnContainer: {
    alignItems: 'center', // Center items horizontally
  },
  text: {
    color: '#666',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  highlighted: {
    color: '#415399',
  },
  logoutBtn: {
    width: '80%',
    backgroundColor: '#fb5b5a',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  logoutText: {
    color: 'white',
  },
});

export default SettingScreen;
