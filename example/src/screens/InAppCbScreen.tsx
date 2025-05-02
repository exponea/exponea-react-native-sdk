/* eslint-disable react-native/no-inline-styles */
import React, { useCallback } from 'react';
import {FlatList, Image, Platform, StyleSheet, Text, View} from 'react-native';
import InAppContentBlocksPlaceholder from 'react-native-exponea-sdk/lib/InAppContentBlocksPlaceholder';
import icon1 from '../img/ic_dialog_map.png';
import icon2 from '../img/ic_media_route.png';
import icon3 from '../img/ic_menu_search.png';
import icon4 from '../img/ic_star.png';
import ContentBlockCarouselView from 'react-native-exponea-sdk/lib/ContentBlockCarouselView';

interface ProductsViewModel {
  icon: string;
  title: string;
  description: string;
  showAd: boolean;
}

export default function InAppCbScreen(): React.ReactElement {
    const [carouselStatus, setCarouselStatus] = React.useState({index: -1, count: 0, name: ''});
  const [] = React.useState(false);
  const platformSpecificPlaceholderId =
    Platform.OS === 'ios' ? 'ph_x_example_iOS' : 'ph_x_example_Android';
  function generateProducts(): ProductsViewModel[] {
    const result: ProductsViewModel[] = [];
    const contentBlockFrequency = 5;
    for (let i = 1; i < 1000; i++) {
      if (
        i % contentBlockFrequency === 0 &&
        !result[result.length - 1].showAd
      ) {
        // show content block
        result.push({
          icon: Image.resolveAssetSource(icon1).uri,
          title: 'CB',
          description: '',
          showAd: true,
        } as ProductsViewModel);
        i--;
        continue;
      }
      // show product item
      const prodIcons = [icon1, icon2, icon3, icon4];
      const prodIcon = prodIcons[Math.floor(Math.random() * prodIcons.length)];
      const prodDescriptions = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
        'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium',
        'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
      ];
      const prodDescription =
        prodDescriptions[Math.floor(Math.random() * prodDescriptions.length)];
      result.push({
        icon: Image.resolveAssetSource(prodIcon).uri,
        title: 'Product ' + i,
        description: prodDescription,
        showAd: false,
      } as ProductsViewModel);
    }
    return result;
  }
  const productsArray = generateProducts();
  const renderItem = useCallback(({item} : {item:ProductsViewModel}) => {
    if (item.showAd) {
      return (
        <InAppContentBlocksPlaceholder
          style={{
            width: '100%',
          }}
          placeholderId={'example_list'}
        />
      );
    } else {
      return (
        <View
          style={{
            flexDirection: 'row',
            borderTopWidth: 0.5,
            borderTopColor: '#222',
            paddingTop: 8,
            paddingBottom: 8,
          }}>
          <Image
            style={{
              tintColor: '#000',
              width: 28,
              height: 28,
              marginRight: 8,
            }}
            source={{uri: item.icon}}
          />
          <View>
            <Text>{item.title}</Text>
            <Text
              style={{
                paddingRight: 24,
                textAlign: 'justify',
              }}>
              {item.description}
            </Text>
          </View>
        </View>
      );
    }
  }, []);
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
      <Text>Placeholder: example_top</Text>
      <InAppContentBlocksPlaceholder
        style={{
          width: '100%',
        }}
        placeholderId={'example_top'}
      />
      <Text>Placeholder: {platformSpecificPlaceholderId}</Text>
      <InAppContentBlocksPlaceholder
        style={{
          width: '100%',
        }}
        placeholderId={platformSpecificPlaceholderId}
      />
      <Text>Products (Placeholder: example_list)</Text>
      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={200}
        initialNumToRender={1}
        windowSize={3}
        data={productsArray}
        renderItem={renderItem}
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
