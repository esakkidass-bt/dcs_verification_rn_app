import React, {useEffect} from 'react'
import WebView from "react-native-webview";

import {ProfileHeader} from '../../components'


interface Props {
  route: any,
  navigation: any
}

export default function Index({route, navigation}: Props) {
  // const route = useRoute();
  useEffect(()=>{
    navigation.setOptions({title: route?.params?.title||'Web'})
  },[])
  return <>
    <ProfileHeader enableBackButton disableNavigation/>
    <WebView flex={'1'} source={{uri:route?.params?.link}}/></>
}
