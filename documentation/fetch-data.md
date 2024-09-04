---
title: Fetch data
excerpt: Fetch data from Bloomreach Engagement using the React Native SDK
slug: react-native-sdk-fetch-data
categorySlug: integrations
parentDocSlug: react-native-sdk
---

The SDK provides methods to retrieve data from the Engagement platform.

## Fetch recommendations

Use the `fetchRecommendations` method to get personalized recommendations for the current customer from an Engagement [recommendation model](https://documentation.bloomreach.com/engagement/docs/recommendations).

The method returns a list of `Recommendation` objects containing the recommendation engine data and recommended item IDs.

### Arguments

| Name    | Type                                            | Description |
| ------- | ----------------------------------------------- | ----------- |
| options | [RecommendationOptions](#recommendationoptions) | Recommendation options (see below for details )

### RecommendationOptions

| Name                       | Type                    | Description |
| -------------------------- | ----------------------- | ----------- |
| id (required)              | string                  | ID of your recommendation model. |
| fillWithRandom             | boolean                 | If true, fills the recommendations with random items until size is reached. This is utilized when models cannot recommend enough items. |
| size                       | number?                 | Specifies the upper limit for the number of recommendations to return. Defaults to 10. |
| items                      | Record<String, String>? | If present, the recommendations are related not only to a customer, but to products with IDs specified in this array. Item IDs from the catalog used to train the recommendation model must be used. Input product IDs in a dictionary as `product_id: weight`, where the value weight determines the preference strength for the given product (bigger number = higher preference).<br/><br/>Example:<br/>`{"product_id_1": "1", "product_id_2": "2",}` |
| noTrack                    | boolean?                | Default value: false |
| catalogAttributesWhitelist | Array<string>?          | Returns only the specified attributes from catalog items. If empty or not set, returns all attributes.<br/><br/>Example:<br/>`["item_id", "title", "link", "image_link"]` |

### Example

```typescript
Exponea.fetchRecommendations(
  {
    id: "recommendation_id",
    fillWithRandom: true
  }
).then(list => {
  list.forEach(recommendation => {
    console.log(recommendation.itemId)
  })
}).catch(error => console.log(error.message))
```

### Result object

#### Recommendation

| Name                    | Type       | Description |
| ----------------------- | ---------- | ----------- |
| engineName              | string     | Name of the recommendation engine used. |
| itemId                  | string     | ID of the recommended item. |
| recommendationId        | string     | ID of the recommendation engine (model) used. |
| recommendationVariantId | string     | ID of the recommendation engine variant used. |
| data                    | JsonObject | The recommendation engine data and recommended item IDs returned from the server. |

## Fetch consent categories

Use the `fetchConsents` method to get a list of your consent categories and their definitions.

Use when you want to get a list of your existing consent categories and their properties, such as sources and translations. This is useful when rendering a consent form.

The method returns a list of `Consent` objects.

### Example

```typescript
Exponea.fetchConsents()
  .then(list => {
    list.forEach(consent => console.log(consent))
  })
  .catch(error => console.log(error.message))
```

### Result object

#### Consent

| Name               | Type                                   | Description |
| -------------------| -------------------------------------- | ----------- |
| id                 | string                                 | Name of the consent category. |
| legitimateInterest | boolean                                | If the user has legitimate interest. |
| sources            | [ConsentSources](#consentsources)      | The sources of this consent. |
| translations       | Record<string, Record<string, string>> | Contains the translations for the consent.<br/><br/>Keys of this dictionary are the short ISO language codes (eg. "en", "cz", "sk"...) and the values are dictionaries containing the translation key as the dictionary key and translation value as the dictionary value. |

#### ConsentSources

| Name                | Type    | Description |
| --------------------| ------- | ----------- |
| createdFromCRM      | boolean | Manually created from the web application. |
| imported            | boolean | Imported from the importing wizard. |
| fromConsentPage     | boolean | Tracked from the consent page. |
| privateAPI          | boolean | API which uses basic authentication. |
| publicAPI           | boolean | API which only uses public token for authentication. |
| trackedFromScenario | boolean | Tracked from the scenario from event node. |
