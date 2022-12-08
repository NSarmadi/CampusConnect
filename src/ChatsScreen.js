import { ChatProvider } from "./ChatContext";
import {useContext, useRef, useState, useEffect} from 'react'
import { SafeAreaView ,View, Text, Pressable} from "react-native";
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

import {
    ChannelList,
    ChannelsContext,
    ChannelAvatar,
    ChannelPreviewMessenger,
    ChannelPreview
  } from 'stream-chat-react-native';


import { StreamChat } from 'stream-chat';
import { chatApiKey } from '../chatConfig';
import auth from '@react-native-firebase/auth';
import {FloatingAction} from 'react-native-floating-action';

import { useChatContext } from './ChatContext';

import { GestureHandlerRootView } from "react-native-gesture-handler";
import {useNavigation} from '@react-navigation/native';

import androidstyles from './styles/android/ChatStyles';
import iosstyles from './styles/ios/ChatStyles';

var styles;

if (Platform.OS === 'ios') {
  styles = iosstyles; // do dark mode in here as well
} else if (Platform.OS === 'android') {
  styles = androidstyles;
}

export function ChatsScreen(props) {


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

    const { setChannel } = useChatContext();
    const navigation = useNavigation();
    const list = useRef(FlatList)
    const {reloadList,refreshList} = useContext(ChannelsContext);
    const [selectedType, setSelectedType] = useState(0);
    const chatClient = StreamChat.getInstance(chatApiKey);
    const [filter, setFilter] = useState('') //We will swap between groups and DMs here
      //Right here, create a query that will only return the private DMs a User is in

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
      if (selectedType === 0) {
        setFilter(DMFilter);
      } else {
        setFilter(GroupFilter)
      }
    }, [selectedType]); //I guess this tells react to update when these variables change?


    //sets selectedtype
    const updateSelectedType = selectedType => () => {
      setSelectedType(() => selectedType);
    };

    //You can customize the persons display name and extra data like major if wanted
    const CustomPreviewTitle = ({ channel }) => (
      <Text>
        {channel.data.name}
      </Text>
    );



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
                  Users
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
                  Groups
                </Text>
              </TouchableOpacity>
            </View>
              <ChannelList
                  filters={filter} 
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