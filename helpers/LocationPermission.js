import {PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {getFirestore, doc, setDoc} from 'firebase/firestore';
import {db} from '../mockData/config'; // Ensure this is your actual Firebase configuration file

export const requestLocationPermission = async user => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access Required',
        message: 'This app needs to access your location',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Location permission granted');
      await getLocation(user);
    } else {
      console.log('Location permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

function getLocation(user) {
  if (!user.id) {
    console.error('User id is not valid');
    return;
  }

  Geolocation.getCurrentPosition(
    async position => {
      console.log(position);
      await saveOrUpdateUserLocation(
        user,
        position.coords.latitude,
        position.coords.longitude,
      );
    },
    error => {
      console.error('Error getting location: ', error);
      Alert.alert('Error', 'Could not fetch location');
    },
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
  );
}

async function saveOrUpdateUserLocation(user, latitude, longitude) {
  const userLocationRef = doc(db, 'userLocation', user.id.toString());
  try {
    await setDoc(
      userLocationRef,
      {location: [latitude, longitude], name: user.fullName},
      {merge: true},
    );
    console.log('Location updated for user:', user.fullName);
  } catch (e) {
    console.error('Error updating location:', e);
  }
}
