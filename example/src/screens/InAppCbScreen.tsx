import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
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
import InAppContentBlocksRuntimeControllerLab from '@/screens/InAppContentBlocksRuntimeControllerLab';

interface ProductsViewModel {
  icon: string;
  title: string;
  description: string;
  showAd: boolean;
}

type InAppContentBlocksTab = 'classic' | 'runtime_lab';

const IN_APP_CONTENT_BLOCK_TABS: {
  testID: string;
  title: string;
  value: InAppContentBlocksTab;
}[] = [
  {
    testID: AutomationIds.CB_TAB_CLASSIC,
    title: 'Basic',
    value: 'classic',
  },
  {
    testID: AutomationIds.CB_TAB_RUNTIME_LAB,
    title: 'Runtime Control',
    value: 'runtime_lab',
  },
];

const CONTAINER_ROW = { TOP: 0, PLATFORM: 1, LIST: 2 } as const;
const CONTAINER_ROWS = [
  CONTAINER_ROW.TOP,
  CONTAINER_ROW.PLATFORM,
  CONTAINER_ROW.LIST,
] as const;
type ContainerRow = (typeof CONTAINER_ROWS)[number];
const TOP_PLACEHOLDER_ID = 'example_top';
const LIST_PLACEHOLDER_ID = 'example_list';
const PRODUCT_COUNT = 999;
const CONTENT_BLOCK_FREQUENCY = 5;
const LIST_RENDERING_OPTIONS = {
  maxToRenderPerBatch: 5,
  updateCellsBatchingPeriod: 200,
  windowSize: 3,
};
const SWITCH_TRACK_COLOR = { false: '#ffd500', true: '#ffd500' };

export default function InAppCbScreen(): React.ReactElement {
  const platformSpecificPlaceholderId =
    Platform.OS === 'ios' ? 'ph_x_example_iOS' : 'ph_x_example_Android';

  const productsArray = useMemo((): ProductsViewModel[] => {
    const result: ProductsViewModel[] = [];
    const prodIcons = [icon1, icon2, icon3, icon4];
    const prodDescriptions = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium',
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
    ];
    for (let i = 1; i <= PRODUCT_COUNT; i++) {
      if (
        i % CONTENT_BLOCK_FREQUENCY === 0 &&
        !result[result.length - 1]?.showAd
      ) {
        // show content block
        result.push({
          icon: Image.resolveAssetSource(icon1).uri,
          title: 'CB',
          description: '',
          showAd: true,
        });
        i--;
        continue;
      }
      // show product item
      const prodIcon = prodIcons[Math.floor(Math.random() * prodIcons.length)]!;
      const prodDescription =
        prodDescriptions[Math.floor(Math.random() * prodDescriptions.length)]!;
      result.push({
        icon: Image.resolveAssetSource(prodIcon).uri,
        title: 'Product ' + i,
        description: prodDescription,
        showAd: false,
      });
    }
    return result;
  }, []);

  const renderItem = useCallback(({ item }: { item: ProductsViewModel }) => {
    if (item.showAd) {
      return (
        <InAppContentBlocksPlaceholder
          style={styles.placeholder}
          placeholderId={LIST_PLACEHOLDER_ID}
        />
      );
    } else {
      return (
        <View style={styles.productRow}>
          <Image style={styles.productIcon} source={{ uri: item.icon }} />
          <View>
            <Text>{item.title}</Text>
            <Text style={styles.productDescription}>{item.description}</Text>
          </View>
        </View>
      );
    }
  }, []);

  const renderContainer = useCallback(
    ({ item }: { item: ContainerRow }) => {
      if (item !== CONTAINER_ROW.LIST) {
        const isTop = item === CONTAINER_ROW.TOP;
        const placeholderId = isTop
          ? TOP_PLACEHOLDER_ID
          : platformSpecificPlaceholderId;
        return (
          <ExponeaContainer
            childrenContainerStyle={styles.subContainer}
            hint={`Placeholder: ${placeholderId}`}
            testID={
              isTop
                ? AutomationIds.CB_PLACEHOLDER_EXAMPLE_TOP
                : AutomationIds.CB_PLACEHOLDER_EXAMPLE_PLATFORM
            }
          >
            <InAppContentBlocksPlaceholder
              style={styles.placeholder}
              placeholderId={placeholderId}
            />
          </ExponeaContainer>
        );
      }
      return (
        <ExponeaContainer
          childrenContainerStyle={styles.subContainer}
          hint={`Inline placeholder: ${LIST_PLACEHOLDER_ID} (every ${CONTENT_BLOCK_FREQUENCY}th row)`}
          testID={AutomationIds.CB_PLACEHOLDER_EXAMPLE_LIST}
        >
          <FlatList
            {...LIST_RENDERING_OPTIONS}
            removeClippedSubviews={true}
            initialNumToRender={1}
            data={productsArray}
            renderItem={renderItem}
          />
        </ExponeaContainer>
      );
    },
    [platformSpecificPlaceholderId, productsArray, renderItem]
  );

  const [showCarousel, setShowCarousel] = useState(false);
  // Switch between the basic examples and runtime controller lab.
  const [activeTab, setActiveTab] = useState<InAppContentBlocksTab>('classic');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'classic':
        return (
          <>
            <ExponeaContainer childrenContainerStyle={styles.top}>
              <Text>Show Carousels</Text>
              <Switch
                testID={AutomationIds.TOGGLE_CAROUSELS}
                trackColor={SWITCH_TRACK_COLOR}
                thumbColor="#f4f3f4"
                ios_backgroundColor="#3e3e3e"
                onValueChange={setShowCarousel}
                value={showCarousel}
              />
            </ExponeaContainer>
            {!showCarousel ? (
              <FlatList
                data={CONTAINER_ROWS}
                renderItem={renderContainer}
                {...LIST_RENDERING_OPTIONS}
                initialNumToRender={CONTAINER_ROWS.length}
              />
            ) : (
              <CarouselScreen />
            )}
          </>
        );
      case 'runtime_lab':
        return (
          <ScrollView>
            <InAppContentBlocksRuntimeControllerLab
              platformPlaceholderId={platformSpecificPlaceholderId}
            />
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {IN_APP_CONTENT_BLOCK_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Pressable
              key={tab.value}
              testID={tab.testID}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text style={styles.tabText}>{tab.title}</Text>
            </Pressable>
          );
        })}
      </View>
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
  },
  productRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#222',
    paddingTop: 8,
    paddingBottom: 8,
  },
  productIcon: {
    tintColor: '#000',
    width: 28,
    height: 28,
    marginRight: 8,
  },
  productDescription: {
    textAlign: 'justify',
    marginRight: 50,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 10,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    marginHorizontal: 5,
    backgroundColor: '#ffffff',
    borderColor: '#999999',
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  activeTab: {
    backgroundColor: '#ffd500',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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
