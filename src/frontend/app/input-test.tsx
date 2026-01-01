import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

// KEEP THIS FILE FOR DEBUG PURPOSES

export default function InputTestPage() {
  const router = useRouter();
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [val3, setVal3] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 30 }}>
        
        <Pressable onPress={() => router.back()} style={{ padding: 10, backgroundColor: '#ddd', alignSelf: 'flex-start', borderRadius: 8 }}>
          <Text>Back</Text>
        </Pressable>

        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Input Debugging</Text>

        {/* 1. Raw Input */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>1. Raw Input (No Styles)</Text>
          <TextInput 
            value={val1} 
            onChangeText={setVal1} 
            placeholder="Type here..." 
            style={{ borderWidth: 1, borderColor: '#ccc' }} 
          />
        </View>

        {/* 2. Standard Height + Padding */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>2. Height 50 + Padding 10</Text>
          <TextInput 
            value={val2} 
            onChangeText={setVal2} 
            placeholder="Type here..." 
            style={{ 
              borderWidth: 1, 
              borderColor: '#ccc',
              height: 50,
              padding: 10,
              backgroundColor: 'white'
            }} 
          />
        </View>

        {/* 3. Height 50 + TextAlignVertical Center */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>3. Height 50 + Vertical Center</Text>
          <TextInput 
            value={val3} 
            onChangeText={setVal3} 
            placeholder="Type here..." 
            style={{ 
              borderWidth: 1, 
              borderColor: '#ccc',
              height: 50,
              paddingHorizontal: 10,
              textAlignVertical: 'center', // Android mostly
              backgroundColor: 'white'
            }} 
          />
        </View>

        {/* 4. Flex Row Container (Our Fix) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>4. Flex Container Fix</Text>
          <View style={{ 
            height: 50, 
            borderWidth: 1, 
            borderColor: '#3b82f6', 
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            backgroundColor: 'white'
          }}>
            <TextInput 
              placeholder="Type here..." 
              style={{ 
                flex: 1,
                paddingVertical: 0, 
                // Explicitly resetting line height or height might be needed here if inherited
              }} 
            />
          </View>
        </View>

         {/* 5. Flex Container + Zero Styles */}
         <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>5. Flex Container + ABSOLUTELY NO STYLE Inputs</Text>
          <View style={{ 
            height: 50, 
            borderWidth: 1, 
            borderColor: 'red', 
            borderRadius: 8,
            justifyContent: 'center', // Flex alignment
            paddingHorizontal: 10,
            backgroundColor: 'white'
          }}>
             {/* Text input should just be a text size box */}
            <TextInput 
              placeholder="Type here..." 
              style={{
                fontSize: 16
                // No height, no flex, no padding
              }}
            />
          </View>
        </View>

        {/* 6. EXACT REPLICA of Login Input (Uncontrolled) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>6. EXACT REPLICA (Uncontrolled)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base h-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* 7. CONTROLLED Replica (With State) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>7. CONTROLLED Replica (With State)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              value={val1}
              onChangeText={setVal1}
              placeholder="Type to test state updates..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base h-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* 8. SEMI-CONTROLLED (Best of Both) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>8. SEMI-CONTROLLED (No Value Prop)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              defaultValue=""
              onChangeText={setVal1}
              placeholder="Type here..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base h-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
          <Text style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>State Capturing: {val1}</Text>
        </View>

        {/* 9. INTRINSIC HEIGHT (No h-full) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>9. INTRINSIC HEIGHT (The intended fix)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              value={val2}
              onChangeText={setVal2}
              placeholder="Intrinsic height..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base" 
              // NO h-full. 
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* 10. SECURE ENTRY (Mimics Password) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>10. SECURE ENTRY (Like Password)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              value={val3}
              onChangeText={setVal3}
              secureTextEntry={true}
              placeholder="Secure text..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base"
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* 11. NO AUTOCORRECT/CAPITALIZE */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>11. PLAIN TEXT (No AutoCorrect/Cap)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              value={val1} 
              onChangeText={setVal1}
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              placeholder="No AI helpers..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base"
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* 12. RENDER-ISOLATED (Ref Only) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>12. RENDER-ISOLATED (No Re-renders)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              defaultValue=""
              onChangeText={(text) => { console.log(text); /* No state update */ }}
              placeholder="Ref only, check console..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base h-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
          <Text style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>This input does NOT update React state (typing won&apos;t update UI elsewhere).</Text>
        </View>

        {/* 13. PURE LISTEN (onChangeText ONLY) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>13. PURE LISTEN (onChangeText ONLY)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              onChangeText={(text) => console.log(text)}
              placeholder="Check console for text..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base h-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* 14. NATIVE CHANGE (onChange ONLY) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>14. NATIVE CHANGE (onChange ONLY)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              onChange={(e) => console.log(e.nativeEvent.text)}
              placeholder="Native event only..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base-content text-base h-full"
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* 15. NO FONT (Controlled, No nativewind class) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>15. NO FONT (Controlled, Default Font)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              value={val1}
              onChangeText={setVal1}
              placeholder="Default System Font..."
              placeholderTextColor="#94a3b8"
              // Removed className="text-base"
              style={{ flex: 1, paddingVertical: 0, height: '100%', fontSize: 16 }}
            />
          </View>
        </View>

        {/* 16. CONTROLLED + MANUAL FONT (The Holy Grail?) */}
        <View>
          <Text style={{ marginBottom: 8, fontWeight: '600' }}>16. CONTROLLED + MANUAL FONT (No text-base)</Text>
          <View className="bg-base-200 border border-base-300 rounded-xl px-4 h-14 flex-row items-center focus-within:border-primary">
            <TextInput
              value={val1}
              onChangeText={setVal1} // CONTROLLED
              placeholder="Custom Font, No text-base..."
              placeholderTextColor="#94a3b8"
              // No className="text-base" or "font-sans". Manual style:
              style={{ 
                flex: 1, 
                paddingVertical: 0, 
                height: '100%', 
                fontSize: 16, 
                fontFamily: 'PlusJakartaSans_400Regular' 
              }}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
