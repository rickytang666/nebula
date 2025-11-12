# Notes App - Minimalistic Theme Guide

## 🎨 Color System

### Primary Colors
```
Black:    #000000  (bg-black)
White:    #FFFFFF  (text-white, bg-white)
```

### Gray Scale
```
Gray-900: #111827  (bg-gray-900)  - Cards, containers
Gray-800: #1F2937  (border-gray-800) - Borders
Gray-700: #374151  (border-gray-700) - Input borders
Gray-500: #6B7280  (text-gray-500)  - Tertiary text
Gray-400: #9CA3AF  (text-gray-400)  - Secondary text
Gray-300: #D1D5DB  (text-gray-300)  - Labels
```

## 📐 Layout Principles

### Spacing
- Use VStack/HStack with predefined space values
- `space="sm"` - 8px
- `space="md"` - 12px
- `space="lg"` - 16px
- `space="xl"` - 20px
- `space="2xl"` - 24px

### Borders
- Border radius: `rounded-xl` (12px) for cards and buttons
- Border width: `border` (1px) or `border-2` (2px)
- Border color: `border-gray-800` or `border-gray-700`

### Padding
- Cards: `p-6` (24px)
- Containers: `px-6` (horizontal 24px)

## 🔤 Typography

### Headings
```typescript
<Heading size="3xl" className="text-white">
  Main Title
</Heading>

<Heading size="2xl" className="text-white">
  Section Title
</Heading>
```

### Body Text
```typescript
<Text size="lg" className="text-gray-400">
  Subtitle
</Text>

<Text className="text-gray-300">
  Label
</Text>

<Text className="text-gray-400">
  Secondary text
</Text>

<Text size="sm" className="text-gray-500">
  Footer text
</Text>
```

## 🎯 Component Patterns

### Primary Button
```typescript
<Button
  size="xl"
  className="w-full bg-white rounded-xl"
  onPress={handleAction}
>
  <ButtonText className="text-black font-semibold text-lg">
    Button Text
  </ButtonText>
</Button>
```

### Outline Button
```typescript
<Button
  size="xl"
  variant="outline"
  className="w-full border-2 border-white rounded-xl"
  onPress={handleAction}
>
  <ButtonText className="text-white font-semibold text-lg">
    Button Text
  </ButtonText>
</Button>
```

### Input Field
```typescript
<Input
  variant="outline"
  size="xl"
  className="border-gray-700 bg-black rounded-xl"
>
  <InputField
    placeholder="Enter text"
    placeholderTextColor="#6B7280"
    value={value}
    onChangeText={setValue}
    className="text-white"
  />
</Input>
```

### Feature Card
```typescript
<HStack 
  space="md" 
  className="items-center bg-gray-900 rounded-xl p-4 border border-gray-800"
>
  <Text className="text-2xl">{icon}</Text>
  <Text className="text-gray-300 flex-1">{text}</Text>
</HStack>
```

### Form Container
```typescript
<VStack 
  space="lg" 
  className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
>
  {/* Form content */}
</VStack>
```

## 🎭 States

### Default
- Background: Black
- Text: White/Gray
- Borders: Gray-800

### Hover/Active
- Buttons: Slight opacity change
- Links: Underline

### Disabled
- Opacity: 0.6
- Cursor: not-allowed

### Focus
- Input borders: Lighter gray
- Outline: None (custom styling)

## 📱 Responsive Design

### Mobile First
- Max width: `max-w-md` (448px)
- Padding: `px-6` (24px)
- Full width buttons: `w-full`

### Spacing
- Vertical: `py-12` (48px)
- Between sections: `space="2xl"` (24px)
- Between elements: `space="lg"` (16px)

## ✨ Best Practices

### DO ✅
- Use pure black (#000000) for backgrounds
- Use white (#FFFFFF) for primary text
- Use gray scale for secondary elements
- Keep borders subtle (gray-800)
- Use consistent spacing
- Maintain high contrast

### DON'T ❌
- Don't use colors other than black/white/gray
- Don't use gradients
- Don't use shadows (except subtle ones)
- Don't use complex patterns
- Don't clutter the interface
- Don't use low contrast combinations

## 🎨 Icon Usage

### Emoji Icons
- Use simple, recognizable emojis
- Size: `text-6xl` for large icons
- Size: `text-2xl` for small icons
- Examples: 📝 (notes), ✓ (check), 📁 (folder), 🔒 (lock)

### Ionicons
- Use for UI elements (arrows, eyes, etc.)
- Color: White or Gray
- Size: 20-24px typically

## 🔄 Consistency Checklist

- [ ] All backgrounds are black
- [ ] All primary text is white
- [ ] All secondary text is gray-400
- [ ] All cards use gray-900 background
- [ ] All borders use gray-800
- [ ] All buttons are white with black text
- [ ] All inputs have dark theme
- [ ] All spacing is consistent
- [ ] All border radius is consistent
- [ ] No gradients or colors used

## 🎯 Theme Summary

**Philosophy:** Less is more. Focus on content, not decoration.

**Goal:** Create a distraction-free environment for note-taking.

**Result:** Clean, elegant, timeless design that works everywhere.
