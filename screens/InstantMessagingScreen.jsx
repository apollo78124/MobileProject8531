import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, Button, FlatList, Text, View } from 'react-native';
import { TextDecoder } from 'text-encoding';

const InstantMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Create WebSocket connection.
    const socket = new WebSocket('ws://192.168.1.109:8090');
    // Connection opened
    socket.onopen = () => {
      console.log('Connected to the server');
      setWs(socket);
    };

    // Listen for messages
    socket.onmessage = (event) => {
      let newMessage;
      if (event.data instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        newMessage = decoder.decode(event.data);
      } else {
        newMessage = event.data;
      }
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    // Connection closed
    socket.onclose = () => {
      console.log('Disconnected from the server');
    };

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
      console.log(message);
    if (ws && message.trim()) {
      ws.send(message);
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default InstantMessaging;
