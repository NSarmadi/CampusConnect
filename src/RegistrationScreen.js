import * as React from 'react';
import {useState, useContext} from 'react';
import {View, Image, Bac, Text, TouchableOpacity, Linking, ImageBackground} from 'react-native';
import auth, {firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DropDownPicker from 'react-native-dropdown-picker';
import ImagePicker from 'react-native-image-crop-picker';
import LinearGradient from 'react-native-linear-gradient';
import {majors, classes} from './consts/majors';

import {SafeAreaView, TextInput, KeyboardAvoidingView, Alert, ScrollView, ActivityIndicator} from 'react-native';

import Parse from 'parse/react-native';
import AppContext from './AppContext';

import iosstyles from './styles/ios/RegistrationScreenStyles';
import androidstyles from './styles/android/RegistrationScreenStyles';

var styles;

if (Platform.OS === 'ios') {
  styles = iosstyles;
} else if (Platform.OS === 'android') {
  styles = androidstyles;
}
import {COMETCHAT_CONSTANTS} from '../env';
export function RegistrationScreen({navigation}) {
  const userData = useContext(AppContext);

  const [bio, setBio] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [gradDate, setGradDate] = React.useState('');
  var url = '';
  const [registraionSuccess, setRegistraionSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Set loading to true on component mount

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [image, setImage] = React.useState('');

  const [major, setMajor] = useState(userData.major);

  const onMajorOpen = React.useCallback(() => {
    setOpen2(false);
  }, []);

  const onYearOpen = React.useCallback(() => {
    setOpen(false);
  }, []);

  const FirebaseError = error => {
    Alert.alert('Error', error, [{text: 'OK'}]);
  };
  const EmailAlert = error => {
    Alert.alert(
      'Email Not Verified',
      'You have not verified your email. Click the link sent to your USC email first.',
      [{text: 'OK'}],
    );
  };
  const RegisterError = () => {
    Alert.alert(
      'Error',
      'Make sure all required fields are filled out, the bio is 150 characters or less, and your name is less than 25 characters',
      [{text: 'OK'}],
    );
  };
  //allows user to pick photo from their devices library
  const choosePhotoFromLibrary = async () => {
    await ImagePicker.openPicker({
      width: 300,
      height: 300,
      mediaType: 'photo',
      cropping: true,
    })
      .then(image => {
        setImage(image.path);
      })
      .catch(error => {});
  };
  //uploads pic from choosephotofromlibrary
  const uploadPic = async () => {
    const reference = storage().ref('/Profile Pictures/' + auth().currentUser.uid);
    if (image) {
      await reference.putFile(image).catch(error => {
        FirebaseError(error.code);
      });
      url = await reference.getDownloadURL();
    }
  };
  //get users data
  const writeUserData = async () => {
    setLoading(true);
    const bioLengthValid = bio.length <= 150;
    const firstNameUp = firstName.replace(/\s/g, '');
    const lastNameUp = lastName.replace(/\s/g, '');
    const nameValid = firstNameUp.length + lastNameUp.length < 30;

    var emailVerified = false;
    await Parse.User.logIn(auth().currentUser.email,'password').then(() =>{ //This seems crazy, but it's fine, cuz the password doesn't work unless they click the email.
      emailVerified = true;
    }).catch((error) => {console.log(error)})
    if (emailVerified) {
      Parse.User.logOut();
      if (nameValid && firstName.trim() && lastName.trim() && major && gradDate && bio && bioLengthValid && image) {
        await uploadPic();
        //users data is stored in firebase
        firestore()
          .collection('Users')
          .doc(auth().currentUser.uid)
          .update({
            name: firstNameUp.trim() + ' ' + lastNameUp.trim(),
            major: major,
            firstLogin: false,
            gradYear: gradDate,
            bio: bio,
            pfp: url,
            searchName: firstNameUp.trim().toUpperCase() + ' ' + lastNameUp.trim().toUpperCase(),
            joined: firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            setRegistraionSuccess(true);
          });
      } else if (nameValid && firstName.trim() && lastName.trim() && major && gradDate && bioLengthValid && image) {
        await uploadPic();

        firestore()
          .collection('Users')
          .doc(auth().currentUser.uid)
          .update({
            name: firstNameUp.trim() + ' ' + lastNameUp.trim(),
            major: major,
            firstLogin: false,
            gradYear: gradDate,
            pfp: url,
            searchName: firstNameUp.trim().toUpperCase() + ' ' + lastNameUp.trim().toUpperCase(),
            joined: firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            setRegistraionSuccess(true);
          });
      } else if (nameValid && firstName.trim() && lastName.trim() && major && gradDate && bio && bioLengthValid) {
        firestore()
          .collection('Users')
          .doc(auth().currentUser.uid)
          .update({
            name: firstNameUp.trim() + ' ' + lastNameUp.trim(),
            major: major,
            firstLogin: false,
            gradYear: gradDate,
            bio: bio,
            searchName: firstNameUp.trim().toUpperCase() + ' ' + lastNameUp.trim().toUpperCase(),
            joined: firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            setRegistraionSuccess(true);
          });
      } else if (nameValid && firstName.trim() && lastName.trim() && major && gradDate && bioLengthValid) {
        firestore()
          .collection('Users')
          .doc(auth().currentUser.uid)
          .update({
            name: firstNameUp.trim() + ' ' + lastNameUp.trim(),
            major: major,
            firstLogin: false,
            gradYear: gradDate,
            searchName: firstNameUp.trim().toUpperCase() + ' ' + lastNameUp.trim().toUpperCase(),
            joined: firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            setRegistraionSuccess(true);
          });
      } else {
        RegisterError();
      }
    } else {
      EmailAlert();
    }
    setLoading(false);
  };
  //resets data to ''
  const reset = () => {
    url = '';
    setFirstName('');
    setLastName('');
    setGradDate('');
    setMajor('');
    setBio('');
    setImage('');
    setRegistraionSuccess(false);
    navigation.reset({
      index: 0,
      routes: [{name: 'LoadingScreen'}],
    });
  };
  //if registration is successfull then we show the user a screen that confirms this
  if (registraionSuccess) {
    return (
      <LinearGradient colors={['white', 'white', '#73000a']} style={styles.gradient}>
        <Image
          source={require('./assets/checkmark.png')}
          style={{
            height: 250,
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
        />
        <Text style={styles.textStyle}>Registration Successful</Text>
        <TouchableOpacity testID="finishbtn" style={styles.buttonStyle2} onPress={() => reset()}>
          <Text style={styles.buttonTextStyle}>Finish</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <View style={[styles.activityContainer, styles.horizontal]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  //styles for the registrationscreen
  return (
    <LinearGradient colors={['#73000a', '#73000a', 'white']} style={styles.gradient} testID="regview">
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.container}>
          <TouchableOpacity onPress={choosePhotoFromLibrary} style={styles.blankImageBackgroundStyle}>
            <ImageBackground
              source={require('./assets/blank2.jpeg')}
              imageStyle={styles.blankImageStyle}
              style={styles.blankImageBackgroundStyle}>
              <Text style={styles.imageTextStyle}>{image ? 'Pic Loaded ✅' : 'Add photo here'}</Text>
            </ImageBackground>
          </TouchableOpacity>
          <Text style={styles.textStyle}>Now we just need some info</Text>
          <KeyboardAvoidingView enabled>
            <View style={styles.SectionStyle}>
              <TextInput
                testID="firstname"
                style={styles.inputStyle}
                onChangeText={FirstName => setFirstName(FirstName)}
                defaultValue={userData.name.split(' ').length > 0 ? userData.name.split(' ')[0] : null}
                placeholder="Enter first name (Required)"
                placeholderTextColor="gray"
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.SectionStyle}>
              <TextInput
                testID="lastname"
                style={styles.inputStyle}
                onChangeText={LastName => setLastName(LastName)}
                defaultValue={userData.name.split(' ').length > 1 ? userData.name.split(' ')[1] : null}
                placeholder="Enter last name (Required)"
                placeholderTextColor="gray"
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.SectionStyle}>
              <DropDownPicker
                testID="class"
                style={styles.inputStyle}
                placeholder="Select Class (Required)"
                open={open2}
                onOpen={onYearOpen}
                value={gradDate}
                items={classes}
                dropDownDirection="TOP"
                setOpen={setOpen2}
                setValue={setGradDate}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={styles.SectionStyle}>
              <DropDownPicker
                testID="major"
                style={styles.inputStyle}
                placeholder="Select Major (Required)"
                open={open}
                onOpen={onMajorOpen}
                value={major}
                items={majors}
                dropDownDirection="TOP"
                setOpen={setOpen}
                setValue={setMajor}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={styles.bioSectionStyle}>
              <TextInput
                style={styles.bioStyle}
                onChangeText={bio => setBio(bio)}
                placeholder="Enter a short Bio (optional) (150 characters max)"
                defaultValue={userData.bio}
                placeholderTextColor="gray"
                blurOnSubmit={false}
              />
            </View>
            <TouchableOpacity testID="registerbtn" style={styles.buttonStyle} onPress={writeUserData}>
              <Text style={styles.buttonTextStyle}>REGISTER</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>

          {/*<Text style={styles.emailText}>NOTE: Your spam filter may be blocking our emails. Please login to your USC email and click the link below to release the email from the Campus Connect Team</Text>*/}
          <Text style={styles.linkText} onPress={() => Linking.openURL('https://security.microsoft.com/quarantine')}>
            Microsoft Quarantine
          </Text>
          <TouchableOpacity onPress={() => NeedHelpError()} style={styles.helpBtn}>
            <Text style={styles.loginText}>Need help?</Text>
          </TouchableOpacity>
          <View style={styles.bottomContainer}>
            <Text style={styles.copyWrightText}>Copywright Ⓒ2023 DemBoyz</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
//tells user to contact us if help is needed
const NeedHelpError = () => {
  Alert.alert('Need Help?', 'Please contact support at \n\ndemboyz.sc@gmail.com for help.', [{text: 'OK'}]);
};
