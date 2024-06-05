import React from 'react';
import {create, act} from 'react-test-renderer';
import AddReminderScreen from '../AddReminderScreen'; // Adjust the import path as necessary
import {addReminder} from '../mockData/mockData'; // Adjust the import path as necessary
import PushNotification from 'react-native-push-notification';

jest.mock('react-native-modal-datetime-picker', () => 'DateTimePickerModal');
jest.mock('react-native-push-notification', () => ({
  localNotificationSchedule: jest.fn(),
}));

describe('AddReminderScreen Component', () => {
  // Define a mock navigation object
  const mockNavigation = {
    goBack: jest.fn(),
  };

  it('renders correctly', () => {
    let tree;
    act(() => {
      tree = create(<AddReminderScreen navigation={mockNavigation} />);
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should handle adding a reminder', () => {
    let root;
    act(() => {
      root = create(<AddReminderScreen navigation={mockNavigation} />);
    });

    // Simulate user input
    const titleInput = root.root.findByProps({
      placeholder: 'Reminder Title',
    }).props;
    act(() => titleInput.onChangeText('Test Title'));

    const detailsInput = root.root.findByProps({
      placeholder: 'Reminder Details',
    }).props;
    act(() => detailsInput.onChangeText('Test Details'));

    // Simulate pressing the Add Reminder button
    const button = root.root.findByType('Button').props;
    act(() => button.onPress());

    // Expect the addReminder and localNotificationSchedule to have been called
    expect(addReminder).toHaveBeenCalledWith({
      title: 'Test Title',
      details: 'Test Details',
      time: expect.any(Date),
    });
    expect(PushNotification.localNotificationSchedule).toHaveBeenCalledWith(
      expect.any(Object),
    );

    // Expect navigation.goBack to be called
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  // More tests can be added to cover different functionalities like DateTimePickerModal interaction, etc.
});
