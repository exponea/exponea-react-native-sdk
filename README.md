# React Native SDK

## Getting started

`$ npm install react-native-exponea-sdk --save`

### Mostly automatic installation

`$ react-native link react-native-exponea-sdk`

### iOS
Native module for iOS uses Swift. You must have *some* Swift code in your project in order for it to work. You can just open the XCode project and create a dummy swift file. When XCode asks, let it create bridging header file. After that you can build the application from command line.
> This seems weird, but it's the official way to do this. See end of [Exporting Swift](https://reactnative.dev/docs/native-modules-ios#exporting-swift) section in the official React Native documentation.

## Usage
```javascript
import Exponea from 'react-native-exponea-sdk';

// TODO: What to do with the module?
Exponea;
```
>>>>>>> feat/Create project using create-react-native-module
