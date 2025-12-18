import { Tabs } from "expo-router";
import { File, UserRound } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1F2937',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen 
        name="notes" 
        options={{ 
          title: "Notes",
          tabBarIcon: ({ color, size }) => (
            <File size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserRound size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
