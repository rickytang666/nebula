import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function NoteCardSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create pulsing animation for skeleton
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View
      className="bg-gray-900 rounded-3xl p-4 border border-gray-800"
      style={{ minHeight: 160 }}
    >
      {/* Title skeleton */}
      <Animated.View
        className="bg-gray-800 rounded h-6 mb-2"
        style={{ width: '80%', opacity }}
      />
      <Animated.View
        className="bg-gray-800 rounded h-6 mb-3"
        style={{ width: '60%', opacity }}
      />

      {/* Content skeleton */}
      <Animated.View
        className="bg-gray-800 rounded h-4 mb-2"
        style={{ width: '100%', opacity }}
      />
      <Animated.View
        className="bg-gray-800 rounded h-4 mb-2"
        style={{ width: '90%', opacity }}
      />
      <Animated.View
        className="bg-gray-800 rounded h-4 mb-3"
        style={{ width: '70%', opacity }}
      />

      {/* Date skeleton */}
      <Animated.View
        className="bg-gray-800 rounded h-3 mb-2"
        style={{ width: '40%', opacity }}
      />

      {/* Tags skeleton */}
      <View className="flex-row">
        <Animated.View
          className="bg-gray-800 rounded-full h-7 mr-2"
          style={{ width: 60, opacity }}
        />
        <Animated.View
          className="bg-gray-800 rounded-full h-7"
          style={{ width: 80, opacity }}
        />
      </View>
    </View>
  );
}
