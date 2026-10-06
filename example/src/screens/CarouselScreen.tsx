import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ContentBlockCarouselView,
  type InAppContentBlock,
} from 'react-native-exponea-sdk';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaContainer from '@/components/ExponeaContainer';

export default function CarouselScreen(): React.ReactElement {
  const [carouselStatus, setCarouselStatus] = React.useState({
    index: -1,
    count: 0,
    name: '',
  });
  const platformSpecificPlaceholderId =
    Platform.OS === 'ios' ? 'example_carousel_ios' : 'example_carousel_and';
  const platformSpecificPlaceholderTitle =
    Platform.OS === 'ios'
      ? 'iOS Carousel: example_carousel_ios'
      : 'Android Carousel: example_carousel_and';

  const handleMessageShown = React.useCallback(
    (
      _placeholderId: string,
      cb: { name?: string },
      index: number,
      count: number
    ) => {
      setCarouselStatus({
        name: cb.name ?? '',
        index,
        count,
      });
    },
    []
  );

  const handleMessagesChanged = React.useCallback(
    (count: number, cbs: unknown[]) => {
      if (cbs.length === 0) {
        setCarouselStatus({
          name: '',
          index: -1,
          count,
        });
      }
    },
    []
  );

  const handleNoMessageFound = React.useCallback((placeholderId: string) => {
    console.log(`Carousel ${placeholderId} is empty`);
  }, []);

  const handleCarouselError = React.useCallback(
    (placeholderId: string, _cb: unknown, errorMessage: string) => {
      console.log(`Carousel ${placeholderId} error: ${errorMessage}`);
    },
    []
  );

  const handleCloseClicked = React.useCallback(
    (placeholderId: string, cb: unknown) => {
      console.log('MESSAGE CLOSE CLICKED');
      console.log(
        `Message ${typeof cb} has been closed in carousel ${placeholderId}`
      );
    },
    []
  );

  const handleActionClicked = React.useCallback(
    (placeholderId: string, _cb: unknown, action: { name?: string }) => {
      console.log(
        `Action ${action.name} has been clicked in carousel ${placeholderId}`
      );
    },
    []
  );

  const filterContentBlocks = React.useCallback(
    (source: InAppContentBlock[]): InAppContentBlock[] =>
      source.filter(
        (item) => item.name?.toLowerCase().includes('discarded') ?? false
      ),
    []
  );

  const sortContentBlocks = React.useCallback(
    (source: InAppContentBlock[]): InAppContentBlock[] => [...source].reverse(),
    []
  );

  return (
    <ScrollView style={styles.container}>
      <ExponeaContainer hint={'Default Carousel: example_carousel'}>
        <View testID={AutomationIds.CB_CAROUSEL_DEFAULT}>
          <ContentBlockCarouselView
            style={styles.carousel}
            placeholderId={'example_carousel'}
            onMessageShown={handleMessageShown}
            onMessagesChanged={handleMessagesChanged}
            onNoMessageFound={handleNoMessageFound}
            onError={handleCarouselError}
            onCloseClicked={handleCloseClicked}
            onActionClicked={handleActionClicked}
            overrideDefaultBehavior={false}
            trackActions={true}
          />
        </View>
        <Text testID={AutomationIds.CAROUSEL_STATUS}>
          Showing {carouselStatus.name} as {carouselStatus.index + 1} of{' '}
          {carouselStatus.count}
        </Text>
      </ExponeaContainer>

      <ExponeaContainer hint={'Customized Carousel: example_carousel'}>
        <View testID={AutomationIds.CB_CAROUSEL_FILTERED}>
          <ContentBlockCarouselView
            style={styles.carousel}
            placeholderId={'example_carousel'}
            scrollDelay={10}
            maxMessagesCount={5}
            filterContentBlocks={filterContentBlocks}
            sortContentBlocks={sortContentBlocks}
          />
        </View>
      </ExponeaContainer>
      <ExponeaContainer hint={platformSpecificPlaceholderTitle}>
        <View testID={AutomationIds.CB_CAROUSEL_PLATFORM}>
          <ContentBlockCarouselView
            style={styles.carousel}
            placeholderId={platformSpecificPlaceholderId}
          />
        </View>
      </ExponeaContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 10,
    backgroundColor: '#eee',
  },
  carousel: {
    width: '100%',
  },
});
