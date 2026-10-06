/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { InAppContentBlocksPlaceholder } from 'react-native-exponea-sdk';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaContainer from '@/components/ExponeaContainer';
import icon1 from '@/img/ic_dialog_map.png';
import icon2 from '@/img/ic_media_route.png';
import icon3 from '@/img/ic_menu_search.png';
import icon4 from '@/img/ic_star.png';
import CarouselScreen from '@/screens/CarouselScreen';

interface ProductsViewModel {
  icon: string;
  title: string;
  description: string;
  showAd: boolean;
}

const CONTAINER_ROWS = [0, 1, 2] as const;

export default function InAppCbScreen(): React.ReactElement {
  const platformSpecificPlaceholderId =
    Platform.OS === 'ios' ? 'ph_x_example_iOS' : 'ph_x_example_Android';

  const productsArray = useMemo((): ProductsViewModel[] => {
    const result: ProductsViewModel[] = [];
    const contentBlockFrequency = 5;
    const prodIcons = [icon1, icon2, icon3, icon4];
    const prodDescriptions = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium',
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    ];
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
      const prodIcon = prodIcons[Math.floor(Math.random() * prodIcons.length)];
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
  }, []);

  const renderItem = useCallback(({ item }: { item: ProductsViewModel }) => {
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
          }}
        >
          <Image
            style={{
              tintColor: '#000',
              width: 28,
              height: 28,
              marginRight: 8,
            }}
            source={{ uri: item.icon }}
          />
          <View>
            <Text>{item.title}</Text>
            <Text
              style={{
                textAlign: 'justify',
                marginRight: 50,
              }}
            >
              {item.description}
            </Text>
          </View>
        </View>
      );
    }
  }, []);

  const renderContainer = useCallback(
    ({ item }: { item: number }) => {
      switch (item) {
        case 0:
          return (
            <ExponeaContainer
              childrenContainerStyle={styles.subContainer}
              hint={'Placeholder: example_top'}
              testID={AutomationIds.CB_PLACEHOLDER_EXAMPLE_TOP}
            >
              <InAppContentBlocksPlaceholder
                style={{
                  width: '100%',
                }}
                placeholderId={'example_top'}
              />
            </ExponeaContainer>
          );
        case 1:
          return (
            <ExponeaContainer
              childrenContainerStyle={styles.subContainer}
              hint={`Placeholder: ${platformSpecificPlaceholderId}`}
              testID={AutomationIds.CB_PLACEHOLDER_EXAMPLE_PLATFORM}
            >
              <InAppContentBlocksPlaceholder
                style={{
                  width: '100%',
                }}
                placeholderId={platformSpecificPlaceholderId}
              />
            </ExponeaContainer>
          );
        default:
          return (
            <ExponeaContainer
              childrenContainerStyle={styles.subContainer}
              hint={'Inline placeholder: example_list (every 5th row)'}
              testID={AutomationIds.CB_PLACEHOLDER_EXAMPLE_LIST}
            >
              <FlatList
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={200}
                initialNumToRender={1}
                windowSize={3}
                data={productsArray}
                renderItem={renderItem}
              />
            </ExponeaContainer>
          );
      }
    },
    [platformSpecificPlaceholderId, productsArray, renderItem]
  );

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <View style={styles.container}>
      <ExponeaContainer childrenContainerStyle={styles.top}>
        <Text>Show Carousels</Text>
        <Switch
          testID={AutomationIds.TOGGLE_CAROUSELS}
          trackColor={{ false: '#ffd500', true: '#ffd500' }}
          thumbColor="#f4f3f4"
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </ExponeaContainer>

      {!isEnabled ? (
        <FlatList
          data={CONTAINER_ROWS}
          renderItem={renderContainer}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={200}
          initialNumToRender={3}
          windowSize={3}
        />
      ) : (
        <CarouselScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#eee',
  },
  subContainer: {
    paddingRight: 10,
  },
});
