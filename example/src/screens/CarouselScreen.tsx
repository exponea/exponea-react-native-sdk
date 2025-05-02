/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import ContentBlockCarouselView from 'react-native-exponea-sdk/lib/ContentBlockCarouselView';

export default function CarouselScreen(): React.ReactElement {
  const [carouselStatus, setCarouselStatus] = React.useState({index: -1, count: 0, name: ''});
  const platformSpecificPlaceholderId =
    Platform.OS === 'ios' ? 'example_carousel_ios' : 'example_carousel_and';
  const platformSpecificPlaceholderTitle =
    Platform.OS === 'ios' ? 'iOS Carousel: example_carousel_ios' : 'Android Carousel: example_carousel_and';
  const navigation = useNavigation();
    React.useEffect(() => {
      navigation.setOptions({
        title: 'Carousel',
        headerShown: true,
        headerBackTitle: 'Back'
      });
    }, [navigation]);
  return (
    <View style={styles.container}>
      <Text>Default Carousel: example_carousel</Text>
      <ContentBlockCarouselView
        style={{
          width: '100%',
        }}
        placeholderId={'example_carousel'}
        onMessageShown={(_placeholderId, cb, index, count) => {
          setCarouselStatus({
            name: cb.name,
            index: index,
            count: count
          })
        }}
        onMessagesChanged={(count, cbs) => {
          if (cbs.length == 0) {
            setCarouselStatus({
              name: '',
              index: -1,
              count: count
            })
          }
        }}
        onNoMessageFound={(placeholderId) => {
          console.log(`Carousel ${placeholderId} is empty`);
        }}
        onError={(placeholderId, cb, errorMessage) => {
          console.log(`Carousel ${placeholderId} error: ${errorMessage}`);
        }}
        onCloseClicked={(placeholderId, cb) => {
          console.log(`MESSAGE CLOSE CLICKED`)
          console.log(`Message ${typeof cb} has been closed in carousel ${placeholderId}`);
        }}
        onActionClicked={(placeholderId, cb, action) => {
          console.log(`Action ${action.name} has been clicked in carousel ${placeholderId}`);
        }}
        overrideDefaultBehavior={false}
        trackActions={true}
      />
      <Text>Showing {carouselStatus.name} as {carouselStatus.index + 1} of {carouselStatus.count}</Text>

      <Text>Customized Carousel: example_carousel</Text>
      <ContentBlockCarouselView
        style={{
          width: '100%',
        }}
        placeholderId={'example_carousel'}
        scrollDelay={10}
        maxMessagesCount={5}
        filterContentBlocks={(source) => {
          return source.filter((item) => item.name?.toLowerCase().indexOf('discarded') >= 0)
        }}
        sortContentBlocks={(source) => {
          return source.reverse()
        }}
      />

      <Text>{platformSpecificPlaceholderTitle}</Text>
      <ContentBlockCarouselView
        style={{
          width: '100%',
        }}
        placeholderId={platformSpecificPlaceholderId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingTop: 12,
    backgroundColor: '#eee',
  },
});
