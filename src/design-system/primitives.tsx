import { memo, useCallback, useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text as RNText,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useQuranTheme, type QuranTheme } from "./theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableSurfaceProps extends Omit<PressableProps, "children" | "style"> {
  children: ReactNode;
  pressedOpacity?: number;
  pressedScale?: number;
  pressedTranslateY?: number;
  style?: StyleProp<ViewStyle>;
}

const PressableSurface = memo(function PressableSurface({
  children,
  disabled,
  onPressIn,
  onPressOut,
  pressedOpacity = 0.97,
  pressedScale = 0.992,
  pressedTranslateY = 1,
  style,
  ...props
}: PressableSurfaceProps) {
  const pressAnimation = useRef(new Animated.Value(0)).current;

  const animatePress = useCallback(
    (toValue: 0 | 1) => {
      Animated.spring(pressAnimation, {
        toValue,
        bounciness: 0,
        speed: 28,
        useNativeDriver: true,
      }).start();
    },
    [pressAnimation],
  );

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled) {
        animatePress(1);
      }
      onPressIn?.(event);
    },
    [animatePress, disabled, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      animatePress(0);
      onPressOut?.(event);
    },
    [animatePress, onPressOut],
  );

  const animatedStyle = {
    opacity: pressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, pressedOpacity],
    }),
    transform: [
      {
        translateY: pressAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, pressedTranslateY],
        }),
      },
      {
        scale: pressAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, pressedScale],
        }),
      },
    ],
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
});

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: (event: GestureResponderEvent) => void;
}

const getButtonVariantStyle = (theme: QuranTheme, variant: ButtonVariant): ViewStyle => {
  const variants: Record<ButtonVariant, ViewStyle> = {
    default: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    destructive: {
      backgroundColor: theme.colors.destructive,
      borderColor: theme.colors.destructive,
    },
  };

  return variants[variant];
};

const getButtonTextColor = (theme: QuranTheme, variant: ButtonVariant) => {
  const colors: Record<ButtonVariant, string> = {
    default: theme.colors.primaryForeground,
    secondary: theme.colors.foreground,
    outline: theme.colors.foreground,
    ghost: theme.colors.foreground,
    destructive: theme.colors.destructiveForeground,
  };

  return colors[variant];
};

const getButtonSizeStyle = (theme: QuranTheme, size: ButtonSize): ViewStyle => ({
  minHeight: theme.sizes.controlHeight[size],
  paddingHorizontal: theme.sizes.paddingX[size],
});

export const Button = memo(function Button({
  children,
  disabled,
  loading = false,
  variant = "default",
  size = "md",
  style,
  textStyle,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const theme = useQuranTheme();
  const labelColor = getButtonTextColor(theme, variant);

  return (
    <PressableSurface
      accessibilityRole="button"
      disabled={isDisabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      pressedOpacity={0.96}
      pressedScale={0.985}
      style={[
        styles.button,
        getButtonVariantStyle(theme, variant),
        getButtonSizeStyle(theme, size),
        { borderRadius: theme.radii.md },
        isDisabled ? styles.disabled : null,
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={labelColor} /> : null}
      <RNText style={[styles.buttonLabel, { color: labelColor }, textStyle]}>{children}</RNText>
    </PressableSurface>
  );
});

export interface CardProps extends ViewProps {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "surface" | "outline" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: PressableProps["onPress"];
  onPressIn?: PressableProps["onPressIn"];
  onPressOut?: PressableProps["onPressOut"];
  onLongPress?: PressableProps["onLongPress"];
}

const getCardVariantStyle = (theme: QuranTheme, variant: NonNullable<CardProps["variant"]>) => {
  const variants = {
    default: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    surface: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
  } as const;

  return variants[variant];
};

const getCardPadding = (theme: QuranTheme, padding: NonNullable<CardProps["padding"]>) => {
  const values = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.lg,
    lg: theme.spacing["2xl"],
  } as const;

  return values[padding];
};

export const Card = memo(function Card({
  children,
  padding = "md",
  disabled,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
  style,
  variant = "default",
  ...props
}: CardProps) {
  const theme = useQuranTheme();
  const isInteractive = Boolean(onPress || onLongPress || onPressIn || onPressOut);
  const baseStyle = [
    styles.card,
    getCardVariantStyle(theme, variant),
    {
      borderRadius: theme.radii.md,
      padding: getCardPadding(theme, padding),
    },
    style,
  ];

  if (isInteractive) {
    return (
      <PressableSurface
        accessibilityRole="button"
        disabled={disabled}
        onLongPress={onLongPress}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={baseStyle}
        {...props}
      >
        {children}
      </PressableSurface>
    );
  }

  return (
    <View style={baseStyle} {...props}>
      {children}
    </View>
  );
});

type TextVariant = "body" | "title" | "subtitle" | "muted" | "mono" | "caption" | "label";

export interface TextProps extends RNTextProps {
  children: ReactNode;
  variant?: TextVariant;
}

export const Text = memo(function Text({ children, style, variant = "body", ...props }: TextProps) {
  const theme = useQuranTheme();

  return (
    <RNText
      style={[
        styles.text,
        {
          color: theme.colors.foreground,
          fontSize: theme.typography.sizes.body,
        },
        variant === "title"
          ? {
              fontSize: theme.typography.sizes.title,
              fontWeight: String(theme.typography.weights.bold) as "700",
            }
          : null,
        variant === "subtitle"
          ? {
              color: theme.colors.mutedForeground,
              fontSize: theme.typography.sizes.subtitle,
            }
          : null,
        variant === "muted" ? { color: theme.colors.mutedForeground } : null,
        variant === "mono"
          ? {
              color: theme.colors.mutedForeground,
              fontFamily: theme.typography.mono,
              fontSize: theme.typography.sizes.caption,
            }
          : null,
        variant === "caption"
          ? {
              color: theme.colors.mutedForeground,
              fontSize: theme.typography.sizes.caption,
            }
          : null,
        variant === "label"
          ? {
              fontSize: theme.typography.sizes.label,
              fontWeight: String(theme.typography.weights.semibold) as "600",
            }
          : null,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
});

export interface ScreenProps extends ViewProps {
  children: ReactNode;
}

export const Screen = memo(function Screen({ children, style, ...props }: ScreenProps) {
  const theme = useQuranTheme();

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }, style]}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
});

export interface StackProps extends ViewProps {
  children: ReactNode;
  gap?: number;
}

export const Stack = memo(function Stack({ children, gap = 12, style, ...props }: StackProps) {
  return (
    <View style={[{ gap }, style]} {...props}>
      {children}
    </View>
  );
});

export interface ListItemProps extends Omit<PressableProps, "children" | "style"> {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

const getListItemStyle = (theme: QuranTheme, selected: boolean): ViewStyle => ({
  backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.card,
  borderColor: selected ? theme.colors.tint : theme.colors.border,
  borderRadius: theme.radii.md,
  minHeight: theme.sizes.rowHeight,
  padding: theme.spacing.md,
});

export const ListItem = memo(function ListItem({
  children,
  disabled,
  selected = false,
  style,
  ...props
}: ListItemProps) {
  const theme = useQuranTheme();

  return (
    <PressableSurface
      accessibilityRole={props.onPress ? "button" : undefined}
      disabled={disabled}
      pressedOpacity={0.96}
      pressedScale={0.992}
      style={[
        styles.listItem,
        getListItemStyle(theme, selected),
        disabled ? styles.disabled : null,
        style,
      ]}
      {...props}
    >
      {children}
    </PressableSurface>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  },
  card: {
    borderWidth: 1,
  },
  text: {
    letterSpacing: 0,
  },
  screen: {
    flex: 1,
  },
  listItem: {
    borderWidth: 1,
  },
});
