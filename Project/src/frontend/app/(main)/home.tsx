import { Box, VStack, Heading, Text, Button, ButtonText, Center } from "@/components/ui";
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';


export default function HomePage() {
  const router = useRouter();

  return (
    <Box className="flex-1 bg-black">
      <StatusBar style="light" />
      <Center className="flex-1 px-6">
        <VStack space="xl" className="items-center">
          <Text className="text-6xl mb-4">📝</Text>
          <Heading size="2xl" className="text-center text-white">
            Welcome to Notes
          </Heading>
          <Text className="text-center text-gray-400">
            You've successfully logged in
          </Text>
          <Button
            size="lg"
            className="mt-8 bg-white"
            onPress={() => {

              router.replace("/");
            }}
          >
            <ButtonText className="text-black">Back to Landing</ButtonText>
          </Button>
        </VStack>
      </Center>
    </Box>
  );
}
