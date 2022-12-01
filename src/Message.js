import * as React from 'react';
import {useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {v4 as uuidv4} from 'uuid';
import {CometChat} from '@cometchat-pro/react-native-chat';
import auth from '@react-native-firebase/auth';

import androidstyles from './styles/android/ChatStyles';
import iosstyles from './styles/ios/ChatStyles';

var styles;

if (Platform.OS === 'ios') {
  styles = iosstyles; // do dark mode in here as well
} else if (Platform.OS === 'android') {
  styles = androidstyles;
}

export function Message() {
  const [messages, setMessages] = React.useState([]);
  const messageLimit = 50;

  //need to fix this
  const {selectedConversation} = require('./Chat.js');

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      listenForMessages();
    }
    return () => {
      if (selectedConversation) {
        const conversationId =
          selectedConversation && selectedConversation.guid
            ? selectedConversation.guid
            : selectedConversation.uid
            ? selectedConversation.uid
            : null;
        if (conversationId) {
          CometChat.removeMessageListener();
        }
        setMessages(() => []);
        CometChat.removeUserListener(auth().currentUser.uid);
      }
    };
  }, [selectedConversation]);
  //checks if message is valid
  const isValidMessage = message => {
    return (
      message &&
      message.id &&
      message.sentAt &&
      message.sender &&
      message.sender.uid &&
      message.sender.name &&
      message.sender.avatar &&
      message.category &&
      message.category === 'message'
    );
  };

  const transformSingleMessage = message => {
    if (isValidMessage(message)) {
      let transformedMessage = {
        _id: message.id ? message.id : uuidv4(),
        createdAt: new Date(message.sentAt * 1000),
        user: {
          uid: message.sender.uid,
          avatar: message.sender.avatar
            ? message.sender.avatar
            : auth().currentUser.photoURL,
        },
      };
      if (message.text) {
        transformedMessage.text = message.text;
      }
      return transformedMessage;
    }
    return message;
  };

  const transformMessages = messages => {
    if (messages && messages.length !== 0) {
      const transformedMessages = [];
      for (const message of messages) {
        if (isValidMessage(message)) {
          transformedMessages.push(transformSingleMessage(message));
        }
      }
      return transformedMessages.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    return [];
  };

  const listenForMessages = () => {
    const conversationId =
      selectedConversation && selectedConversation.guid
        ? selectedConversation.guid
        : selectedConversation.uid
        ? selectedConversation.uid
        : null;
    if (conversationId) {
      CometChat.addMessageListener(
        conversationId,
        new CometChat.MessageListener({
          onTextMessageReceived: message => {
            setMessages(previousMessages =>
              GiftedChat.append(previousMessages, [
                transformSingleMessage(message),
              ]),
            );
          },
        }),
      );
    }
  };

  const loadMessages = () => {
    const messageRequestBuilder =
      new CometChat.MessagesRequestBuilder().setLimit(messageLimit);
    if (selectedConversation.contactType === 1) {
      messageRequestBuilder.setGUID(selectedConversation.guid);
    } else if (selectedConversation.contactType === 0) {
      messageRequestBuilder.setUID(selectedConversation.uid);
    }
    const messagesRequest = messageRequestBuilder
      .setCategories(['message'])
      .build();
    messagesRequest
      .fetchPrevious()
      .then(messages => {
        setMessages(() => transformMessages(messages));
      })
      .catch(error => {});
  };

  const getReceiverId = () => {
    if (selectedConversation && selectedConversation.guid) {
      return selectedConversation.guid;
    }
    if (selectedConversation && selectedConversation.uid) {
      return selectedConversation.uid;
    }
    return null;
  };

  const getReceiverType = () => {
    if (selectedConversation && selectedConversation.guid) {
      return CometChat.RECEIVER_TYPE.GROUP;
    }
    return CometChat.RECEIVER_TYPE.USER;
  };
  //stores message in cometchat server
  const sendMessageCometChat = messages => {
    if (messages && messages.length !== 0) {
      const receiverID = getReceiverId();
      const receiverType = getReceiverType();
      if (receiverID && receiverType) {
        const messageText = messages[0].text;
        const textMessage = new CometChat.TextMessage(
          receiverID,
          messageText,
          receiverType,
        );
        CometChat.sendMessage(textMessage).then(
          message => {
            setMessages(previousMessages =>
              GiftedChat.append(previousMessages, messages),
            );
          },
          error => {
            console.log('Error, please try again later...');
          },
        );
      }
    }
  };

  const onSend = useCallback((messages = []) => {
    sendMessageCometChat(messages);
  }, []);

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <GiftedChat
        scrollToBottom
        messages={messages}
        showAvatarForEveryMessage={true}
        onSend={messages => onSend(messages)}
        user={{
          _id: auth().currentUser.uid,
          avatar: auth().currentUser.pfp,
          pfp: auth().currentUser.photoURL,
        }}
      />
    </View>
  );
}