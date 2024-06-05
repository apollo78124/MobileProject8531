import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {db} from '../mockData/config'; // Ensure this points to your Firebase configuration file
import {collection, query, where, getDocs} from 'firebase/firestore';
import {UserContext} from '../UserContext';
import {useFocusEffect} from '@react-navigation/native';
import AddIcon from '../assets/add-white.png'; // Make sure this path is correct
import {Picker} from '@react-native-picker/picker';

const RemindersList = ({navigation}) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(UserContext);
  const [filter, setFilter] = useState('all');

  const fetchReminders = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'reminders'),
        where('user', '==', user.id),
      );
      const querySnapshot = await getDocs(q);
      const fetchedReminders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReminders(fetchedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReminders();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      fetchReminders();

      return () => {
        // You can perform any cleanup tasks here if necessary
      };
    }, [user]),
  );

  const renderItem = ({item}) => {
    const reminderDate = new Date(item.date_at.seconds * 1000);
    const now = new Date();

    if (reminderDate.getTime() < now.getTime()) {
      return null; // If the reminder is in the past, don't render it
    }

    if (filter !== 'all' && item.type !== filter) {
      return null; // If the filter is set and does not match the item's type, do not render the item
    }
    return (
      <>
        <TouchableOpacity
          style={styles.reminderItem}
          onPress={() =>
            navigation.navigate('ReminderDetails', {reminder: item})
          }>
          <Text style={styles.reminderMessage}>{item.message}</Text>
          <Text style={styles.reminderDate}>
            {new Date(item.date_at.toDate()).toLocaleString()}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Picker
            selectedValue={filter}
            onValueChange={(itemValue, itemIndex) => setFilter(itemValue)}
            style={styles.picker}>
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Task" value="task" />
            <Picker.Item label="Personal" value="personal" />
          </Picker>
          <FlatList
            data={reminders}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddReminderScreen', {user})}>
            <Image source={AddIcon} style={styles.addIcon} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  reminderItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  reminderMessage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1e90ff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addIcon: {
    width: 24,
    height: 24,
  },
});

export default RemindersList;
