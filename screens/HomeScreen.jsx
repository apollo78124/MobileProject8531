/* eslint-disable prettier/prettier */
import React, {useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import TaskListDB from './TaskListDB';
import TaskDetailsScreen from './TaskDetailsScreen'; // Make sure this component exists
import AddTaskScreen from './AddTaskScreen';
import SettingScreen from './SettingScreen';
import RemindersList from './RemindersList';
import ReminderDetailsScreen from './ReminderDetailsScreen'; // Make sure this component exists
import AddReminderScreen from './AddReminderScreen';
import TaskIcon from '../assets/task_black.png';
import SettingIcon from '../assets/setting_black.png';
import ReminderIcon from '../assets/reminder_black.png';
import TaskSelectIcon from '../assets/task_blue.png';
import SettingSelectIcon from '../assets/setting_blue.png';
import ReminderSelectIcon from '../assets/reminder_blue.png';
import {Image, StyleSheet, View} from 'react-native';
import {UserContext} from '../UserContext';
import {db} from '../mockData/config';
import {collection, query, where, getDocs, Timestamp} from 'firebase/firestore';
import PushNotification from 'react-native-push-notification';
import moment from 'moment-timezone';
import {useFocusEffect} from '@react-navigation/native';
import Modal from 'react-native-modal';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TaskStackDB = ({route, navigation}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TaskList DB"
        component={TaskListDB}
        options={{title: 'Task List DB', headerLeft: null}}
      />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <Stack.Screen
        name="AddTaskScreen" // Make sure this name matches the name used in navigation.navigate()
        component={AddTaskScreen}
        options={{title: 'Add New Task'}}
      />
    </Stack.Navigator>
  );
};

// Dummy placeholder components for PersonalReminder and Settings
function PersonalReminder() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RemindersList"
        component={RemindersList}
        options={{title: 'Reminders', headerLeft: null}}
      />
      <Stack.Screen
        name="ReminderDetails"
        component={ReminderDetailsScreen}
        options={{title: 'Reminder Details'}}
      />
      <Stack.Screen
        name="AddReminderScreen" // Make sure this name matches the name used in navigation.navigate()
        component={AddReminderScreen}
        options={{title: 'Add New Reminder'}}
      />
    </Stack.Navigator>
  ); // Implement your component
}

const Settings = ({route, navigation}) => {
  const {params} = route || {};
  const {user} = params || {};

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingScreen"
        component={SettingScreen}
        options={{title: 'Settings', headerLeft: null, headerShown: false}}
        initialParams={{user: user}}
      />
    </Stack.Navigator>
  ); // Implement your component
};

const HomeScreen = ({navigation}) => {
  const {user} = useContext(UserContext);
  const [reminders, setReminders] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [gifUri, setGifUri] = useState('');

  // Call this function when the notification is opened
  const onNotificationOpened = notificationData => {
    if (notificationData.hasGif) {
      // Assume notificationData.gifUrl contains the URL of the gif
      setGifUri(notificationData.gifUrl);
      setIsModalVisible(true);
    }
  };

  PushNotification.createChannel(
    {
      channelId: 'my-channel', // (required)
      channelName: 'My channel', // (required)
    },
    created => console.log(`CreateChannel returned '${created}'`),
  );

  const createNotification = reminder => {
    const reminderDate = new Date(reminder.date_at.seconds * 1000);

    PushNotification.localNotificationSchedule({
      channelId: 'my-channel',
      title: 'Reminder',
      message: reminder.message, // (required)
      date: reminder.date_at.toDate(),
      bigPictureUrl: reminder.gif || null,
      // allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
    });

    setTimeout(() => {
      setGifUri(reminder.gif);
      setIsModalVisible(true);

      // Hide the modal after 7 seconds
      setTimeout(() => {
        setIsModalVisible(false);
      }, 7000);
    }, reminderDate.getTime() - Date.now());
  };

  const fetchReminders = async () => {
    if (!user) return;

    try {
      const now = new Date();

      const q = query(
        collection(db, 'reminders'),
        where('user', '==', user.id),
        where('date_at', '>', Timestamp.fromDate(now)), // Only get reminders with a date in the future
      );
      const querySnapshot = await getDocs(q);
      const fetchedReminders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('fetchedReminders: ', fetchedReminders);
      setReminders(fetchedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  useEffect(() => {
    // Cancel all previous notifications
    PushNotification.cancelAllLocalNotifications();

    // Schedule a new notification for each reminder
    reminders.forEach(createNotification);
  }, [reminders]);

  return (
    <>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Image source={{uri: gifUri}} style={styles.gifStyle} />
          {/* No need for a close button as it will disappear after 7 seconds */}
        </View>
      </Modal>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === 'TasksDB') {
              iconName = focused ? TaskSelectIcon : TaskIcon;
            } else if (route.name === 'Personal Reminder') {
              iconName = focused ? ReminderSelectIcon : ReminderIcon;
            } else if (route.name === 'Settings') {
              iconName = focused ? SettingSelectIcon : SettingIcon;
            }

            // You can return any component that you like here!
            return <Image source={iconName} style={{width: 18, height: 18}} />;
          },
        })}>
        <Tab.Screen
          name="TasksDB"
          options={{headerShown: false}}
          component={TaskStackDB}
        />
        <Tab.Screen
          name="Personal Reminder"
          options={{headerShown: false}}
          component={PersonalReminder}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          initialParams={{user: user}}
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  reminderCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  reminderText: {
    fontSize: 18,
    marginBottom: 10,
  },
  noReminderText: {
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  gifStyle: {
    width: 200,
    height: 200,
  },
});
export default HomeScreen;
