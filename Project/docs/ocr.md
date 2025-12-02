# ocr research: camera -> markdown + latex

## tldr
mistral ocr is the play for cost ($1/1k pages). mathpix is the goat for accuracy but costs 2x. google ml kit is trash for math.

## comparison

| provider | math score (1-5) | cost | type |
| :--- | :--- | :--- | :--- |
| **mistral ocr** | 4 | $0.001 / page | cloud api |
| **mathpix** | 5 | $0.002 / image | cloud api |
| **simpletex** | 4 | free (1k/mo) | cloud api |
| **google ml kit** | 1 | free | on-device |

## breakdown

### mistral ocr (recommended)
- **good:** native image-to-markdown, keeps structure, cheapest paid option.
- **bad:** newer, might miss super complex math compared to mathpix.

### mathpix
- **good:** industry standard, handles handwriting perfectly.
- **bad:** pricey if we scale.

### simpletex
- **good:** solid free tier.
- **bad:** pricing gets weird after free limit.

## implementation
**stack:** react native / expo
1. snap pic with `expo-camera`
2. post to api (mistral/mathpix)
3. render the markdown string with `react-native-markdown-display`
