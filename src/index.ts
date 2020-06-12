import {NativeModules} from 'react-native';

const Exponea: ExponeaType = NativeModules.Exponea;

interface ExponeaType {
  sampleMethod(
    stringArgument: string,
    numberArgument: number,
    callback: (value: string) => void,
  ): void;
}

export default Exponea;
