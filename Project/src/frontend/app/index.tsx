import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Intro() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Button title="Login" onPress={() => router.push("/login")} />
      <Button title="Sign Up" onPress={() => router.push("/signup")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
});