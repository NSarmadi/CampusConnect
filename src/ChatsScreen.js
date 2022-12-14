import { ChatProvider } from "./ChatContext";
import {useContext, useRef, useState, useEffect} from 'react'
import { SafeAreaView ,View, Text, Pressable, Alert, Image,Animated,StyleSheet, ActivityIndicator} from "react-native";
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

import {
    ChannelList,
    ChannelsContext,
    ChannelAvatarWithContext,
    ChannelPreviewMessenger,
    ChannelPreview,
    AnimatedGalleryImage,
  } from 'stream-chat-react-native';


import { StreamChat } from 'stream-chat';
import { chatApiKey } from '../chatConfig';
import auth from '@react-native-firebase/auth';
import {FloatingAction} from 'react-native-floating-action';
import AppContext from './AppContext';
import storage from '@react-native-firebase/storage';

import { useChatContext } from './ChatContext';

import { GestureHandlerRootView } from "react-native-gesture-handler";
import {useNavigation} from '@react-navigation/native';

import androidstyles from './styles/android/ChatStyles';
import iosstyles from './styles/ios/ChatStyles';
import { channel } from "diagnostics_channel";
import FastImage from "react-native-fast-image";


var styles;

if (Platform.OS === 'ios') {
  styles = iosstyles; // do dark mode in here as well
} else if (Platform.OS === 'android') {
  styles = androidstyles;
}

export function ChatsScreen(props) {
  const userData = useContext(AppContext);


  const actions = [
    {
        text: "Create Group",
        name: "bt_create_group",
        icon: source={uri: 'https://cdn-icons-png.flaticon.com/512/60/60732.png'},
        position: 2,
        color: '#73000a',
    },
    {
        text: "Search User or Group",
        name: "bt_search",
        icon: source={uri:'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/search-512.png'},
        position: 1,
        color: '#73000a',
    }
];


///This page shouls have all the functionality for adding a creating a DM. And searching for users.

    const { setChannel} = useChatContext();
    const navigation = useNavigation();
    const list = useRef(FlatList)
    const [selectedType, setSelectedType] = useState(0);
    const chatClient = StreamChat.getInstance(chatApiKey);
    const [filter, setFilter] = useState('') //We will swap between groups and DMs here
    const [key,setKey] = useState(1)
    const [loading, setLoading] = useState(true)
      //Right here, create a query that will only return the private DMs a User is in

    const ReloadList = () => {
      setKey((key) => key+1)
      console.log('hello')
    }
    

    const DMFilter = {
      $and: [
        {type:'messaging'},
        {members: {
          '$in': [auth().currentUser.uid]
        }},
        ]
      };
    const GroupFilter = {
      $and: [
        {type:'team'},
        {members: {
          '$in': [auth().currentUser.uid]
        }},
        ]
      };
    const sort = {
      last_message_at: -1,
    };
    const options = {
      presence: true,
      state: true,
      watch: true,
    };


    

    useEffect(() => {
      chatClient.on('message.new',ReloadList)
      setLoading(false)
    },[])

    //sets selectedtype
    const updateSelectedType = selectedType => () => {
      setSelectedType(() => selectedType);
    };


    //Need to make the little preview chat slidable so we can delete and stuff, but very hard
    const SlidablePreview = ( {channel} ) => (
        <ChannelPreviewMessenger channel={channel}></ChannelPreviewMessenger>
    )

    //You can customize the persons display name and extra data like major if wanted
    const CustomPreviewTitle = ( {channel} ) => (
      <Text>
        {channel.data.name}
      </Text>
    );

    const CustomAvatar = ({channel}) => {
        const is2PersonChat = (channel.data.member_count == 2 && channel.type === 'messaging')
        var member;
        const [image,setImage] = useState('')
        useEffect(() =>{
          getPhotos = async () =>{
            if (is2PersonChat) {
              member = await channel.queryMembers({id: {$ne:chatClient.user.id}},'','')
              if(!member.members[0].user.image) {
                setImage(await storage().ref('Profile Pictures/'+member.members[0].user_id).getDownloadURL().catch(() =>{}))
              }
              else{
                setImage(member.members[0].user.image)
              }
            }
            else {
              setImage(channel.data.image)
            }
            
          }
          if (!image){
            getPhotos();
          }
        },[]);



       return (
        <View style={{}}>
          <TouchableOpacity
            disallowInterruption={false}
            onPress={async () => {
              if(is2PersonChat) {
                const member = await channel.queryMembers({id: {$ne:chatClient.user.id}},'','')
                userData.setProfileView(member.members[0].user_id)
                navigation.navigate('ProfileView')
              }
              else if (channel.type === 'team') {
                Alert.alert('Create a group page and navigate to that here')
              }
            }}
          >
            <FastImage style={{width:60,height:60,borderRadius:60}} source={image ?{uri:image}:require('./assets/blank2.jpeg')}></FastImage>
          </TouchableOpacity>
        </View>
        )
      }

    const CustomListItem = props => {
      const { unread } = props;
      const backgroundColor = unread ? '#e6f7ff' : '#fff';
      return (
        <View style={{backgroundColor: backgroundColor}}>
          <ChannelPreviewMessenger {...props} />
        </View>
      )
    }

    
    if (loading) {
      return(
      <View style={{flex:1}}>
        <ActivityIndicator>

        </ActivityIndicator>
      </View>
      )
    }
    
    return(
          <View style={{ flex: 1}}>
            <View style={styles.searchActionContainer}>
              <TouchableOpacity
                style={[
                  styles.searchActionButton,
                  styles.searchLeftActionButton,
                  selectedType === 0 && styles.searchActionButtonActive,
                ]}
                onPress={updateSelectedType(0)}>
                <Text
                  style={[
                    styles.searchActionLabel,
                    selectedType === 0 && styles.searchActionLabelActive,
                  ]}>
                  Private
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.searchActionButton,
                  styles.searchRightActionButton,
                  selectedType === 1 && styles.searchActionButtonActive,
                ]}
                onPress={updateSelectedType(1)}>
                <Text
                  style={[
                    styles.searchActionLabel,
                    selectedType === 1 && styles.searchActionLabelActive,
                  ]}>
                  Public
                </Text>
              </TouchableOpacity>
            </View>
              <ChannelList
              key={key}
                PreviewAvatar={CustomAvatar}
                  filters={selectedType == 0 ? DMFilter : GroupFilter} 
                  options={options}
                  sort={sort}
                  onSelect={(channel) => {
                      setChannel(channel);
                      navigation.navigate('DMScreen');
                      
                  }}
                  />
              <FloatingAction
                color="#73000a"
                actions={actions}
                onPressMain={() => {}}
                onPressItem={name => {
                  
                  if(name === 'bt_create_group'){
                    navigation.navigate('CreateGroup')
                  }
                  else if (name === 'bt_search'){
                    navigation.navigate('ChatSearch')
                  }
                }}
                ref={ref => {
                  this.floatingAction = ref;
                }}
              />
          </View>


    )
}
