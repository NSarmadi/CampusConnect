import React from 'react';
import {View, Text, ImageBackground, Image, TouchableOpacity, Alert} from 'react-native';
import {DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {useEffect, useContext} from 'react';
import AppContext from './AppContext';
import {useNavigation} from '@react-navigation/native';
import {LinearGradient} from 'react-native-svg';
import iosstyles from './styles/ios/DrawerContentStyles';
import androidstyles from './styles/android/DrawerContentStyles';

var styles;

if (Platform.OS === 'ios') {
  styles = iosstyles;
} else if (Platform.OS === 'android') {
  styles = androidstyles;
}

import {StreamChat} from 'stream-chat';
import {chatApiKey} from '../chatConfig';
import {Icon} from '@rneui/themed';
//drawer for campus connect
export function DrawerContent(props) {
  const userData = useContext(AppContext);

  const navigation = useNavigation();
  const DeleteAlert = () => {
    Alert.alert('Delete Photo', 'Do you want to delete your photo?', [
      {text: 'Yes', onPress: () => deletePhoto()},
      {text: 'No'},
    ]);
  };
  //deletes users current photo for streamchat and campus connect
  const deletePhoto = async () => {
    await storage()
      .ref('/Profile Pictures/' + auth().currentUser.uid)
      .delete();
    firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .update({
        pfp: '',
      })
      .then(async () => {
        try {
          const chatClient = StreamChat.getInstance(chatApiKey);
          const update = {
            id: chatClient.user.id,
            set: {
              name: userData.name,
              image: '',
            },
          };
          await chatClient.partialUpdateUser(update);
        } catch (e) {
          console.log(e);
        }
        navigation.reset({
          index: 0,
          routes: [{name: 'LoadingScreen'}],
        });
      });
  };
  //allows user to sign out of campus connect
  const SignOut = async () => {
    try {
      auth().signOut();
      StreamChat.getInstance(chatApiKey).disconnectUser();
    } catch (e) {
      console.log(e);
    }
  };
  //style for the drawer
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScrollView}>
        <ImageBackground blurRadius={4} source={require('./assets/logo.png')} style={styles.imageBackgroundView}>
          <View style={styles.drawerUserView}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.pressableImageView}
              onPress={() => {
                userData.setProfileView(auth().currentUser.uid);
                navigation.navigate('ProfileView');
              }}
              onLongPress={userData.pfp ? () => DeleteAlert() : null}>
              <Image
                source={userData.pfp ? {uri: userData.pfp} : require('./assets/blank2.jpeg')}
                style={styles.pfpStyle}
              />
            </TouchableOpacity>
            <View style={styles.userWelcomeBox}>
              <Text style={styles.welcomeText}>Welcome!</Text>
              <Text style={styles.userNameText}>
                {userData.name.split(' ').length > 0 ? userData.name.split(' ')[0] : 'Error: 404'}
              </Text>
            </View>
          </View>
          <View style={styles.userInfoBox}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CalendarPage');
              }}>
              <Image source={require('./assets/cal.png')} style={{width: 80, height: 80, marginLeft: 150}} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <View style={styles.drawerItemsList}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.touchableSignout}>
          <TouchableOpacity onPress={() => SignOut()} style={styles.touchableSignout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.touchableEditProfile}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('Edit Profile');
            }}
            style={styles.touchableEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
