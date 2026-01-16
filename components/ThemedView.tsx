import { View, ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? (darkColor || '#151718') : (lightColor || '#fff');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
