import { colors, fontFamily, fontSize } from '@/constants/theme';
import { Text, TextProps } from 'react-native';

type Variant = keyof typeof fontSize;

export function AppText({
    variant = 'body',
    weight = 'regular',
    color = colors.text,
    style,
    ...rest
}: TextProps & { 
    variant?: keyof typeof fontSize;
    weight?: keyof typeof fontFamily;
    color?: string;
 }) {
    return (
        <Text
            style={[ 
                { 
                    fontSize: fontSize[variant], 
                    fontFamily: fontFamily[weight], 
                    color, 
                    lineHeight: fontSize[variant] * 1.4 }, 
                    style ]}
            {...rest}
        />
    );
}