import React, {useContext, useState, useEffect
    } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import {UserContext} from '../UserContext';
import {db} from '../mockData/config'; // Make sure this points to your Firebase configuration file
import {
  doc,
  collection,
  getDocs,
  updateDoc,
  Timestamp,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {getDistance} from 'geolib';

const taskStatuses = [
  {statusID: 1, name: 'Pending', description: 'Task has not started'},
  {
    statusID: 2,
    name: 'In Progress',
    description: 'Task is currently in progress',
  },
  {statusID: 3, name: 'Completed', description: 'Task has been completed'},
];

const ContactOthersScreen = ({route, navigation}) => {
  const {user} = useContext(UserContext);
  const [locations, setLocations] = useState([]);

  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const fetchEligibleUsers = async () => {
      try {
        // Get the current user's location
        const currentUserLocationDoc = doc(db, 'userLocation', user.id);

        const currentUserLocationSnapshot = await getDoc(
          currentUserLocationDoc,
        );

        const currentUserLocationData = currentUserLocationSnapshot.data();

        // Fetch all user locations
        const userLocationsSnapshot = await getDocs(
          collection(db, 'userLocation'),
        );

        const allUserLocations = userLocationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter out users within 50km
        const usersWithin50km = allUserLocations.filter(otherUserLocation => {
          if (otherUserLocation.id === user.id) {
            // Skip the current user
            return false;
          }
          const distance = getDistance(
            {
              latitude: currentUserLocationData.location[0],
              longitude: currentUserLocationData.location[1],
            },
            {
              latitude: otherUserLocation.location[0],
              longitude: otherUserLocation.location[1],
            },
          );
          return distance <= 50000; // Distance in meters (50km)
        });

        setEligibleUsers(usersWithin50km);
      } catch (error) {
        console.error('Error fetching user locations:', error);
        Alert.alert('Error', 'Could not fetch user locations.');
      }
    };

    fetchEligibleUsers();
  }, [user]);

  const HandleCallUser = async () => {
    var userObject = doc(db, 'users', selectedUser);

    var userSnapshot = await getDoc(userObject);

    const userData = userSnapshot.data();


    if (userData != null && userData.phone != null) {
        Linking.openURL(`tel:${userData.phone}`);
    } else {
        Alert.alert('Error', 'Selected User does not have a phone number');
    }

  };

  const HandleTextUser = async () => {
    var userObject = doc(db, 'users', selectedUser);

    var userSnapshot = await getDoc(userObject);

    const userData = userSnapshot.data();

    if (userData != null && userData.phone != null) {
        Linking.openURL(`sms:${userData.phone}`);
    } else {
        Alert.alert('Error', 'Selected User does not have a phone number');
    }

  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contact Nearby (50km) Users</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>


          <Text>Select a user within 50km to contact:</Text>
          <Picker
            selectedValue={selectedUser}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedUser(itemValue)
            }>
            {eligibleUsers.map(user => (
              <Picker.Item key={user.id} label={user.name} value={user.id} />
            ))}
          </Picker>
          <Button title="Call" onPress={HandleCallUser} />
          <Button title="Text" onPress={HandleTextUser} />
          <Button title="Messaging" onPress={() => navigation.navigate('InstantMessagingScreen', {user})} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#4169E1',
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scrollContainer: {
    flex: 1, // You may not need this line, try with and without it
  },
  section: {
    fontSize: 15,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#415399',
  },
  details: {
    fontSize: 14,
    color: '#000',
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  reminderButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginTop: 20,
  },
  reminderText: {
    fontSize: 18,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default ContactOthersScreen;
