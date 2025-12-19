# Notes App User Manual

## 1. Introduction
Welcome to the Notes App! This intelligent mobile application goes beyond simple text storage by integrating AI-powered features like Semantic Search and OCR (Optical Character Recognition) to help you capture and organize your thoughts effortlessly.

## 2. Getting Started

### 2.1. Installation
The application is available for Android devices (API Level 21+).
1. Download the latest `.apk` from our release page.
2. If prompted, enable "Install from Unknown Sources" in your Android settings.
3. Open the file to install the application.

### 2.2. Creating an Account
1. Open the app to see the Welcome Screen.
2. Tap **"Don't have an account? Sign Up"**.
3. Enter your **Full Name**, **Email**, and **Password**.
4. Re-enter your password in the **Confirm Password** field.
5. Tap **Create Account**.

### 2.3. Logging In
1. Enter your registered email and password.
2. Tap **Sign In**.
3. *Note: The app keeps you logged in automatically for convenience.*

---

## 3. Core Features

### 3.1. Managing Notes
**Viewing Notes:**
The Home screen displays a grid of your recent notes. You can sort them by date or title using the sort controls next to the search bar.

**Creating a Note:**
1. Tap the **+ (Plus)** button in the top header.
2. Select **"New Note"** from the pop-up menu.
3. Enter a **Title** and start typing your content.
4. Tap the **Checkmark** icon in the top right to save and exit edit mode.

**Editing a Note:**
1. Tap on any note card to open it.
2. Tap the **Pencil Icon** in the top right to enter edit mode.
3. Make your changes.
4. Tap the **Checkmark** icon to save.
   * *Pro Tip:* The app auto-saves your work every 30 seconds to prevent data loss.

**Deleting a Note:**
1. Open the note you wish to delete.
2. Tap the **Trash Can** icon in the top toolbar.
3. Confirm your choice in the dialog box.

---

## 4. Advanced AI Features

### 4.1. Semantic Search (Vector Search)
Unlike standard search that only matches exact words, Semantic Search understands the *meaning* of your query.
1. Tap the **Search Bar** at the top of the Home screen.
2. Tap the **Sparkles Icon** inside the search bar to toggle "Semantic Mode" (the icon will turn blue).
3. Type a concept (e.g., "healthy dinner ideas" will find notes containing "salad recipes" or "grocery lists").
4. Results are ranked by relevance to your idea.

### 4.2. OCR (Scan to Text)
Digitize physical documents instantly.
1. Tap the **+ (Plus)** button in the top header.
2. Select **"Scan Image"** from the pop-up menu.
3. Choose **Take Photo** or **Choose from Library**.
4. Select an image of text (document, whiteboard, etc.).
5. The app will extract the text and automatically create a new note with the content.

### 4.3. AI Assistant
Use the power of Gemini to refine your notes.
1. Open a note.
2. Tap the **Sparkles Icon (✨)** in the top toolbar.
3. The AI Assistant panel will open. Select a quick action:
   * **Summarize**: Generates a concise summary (3 bullet points).
   * **Ideas**: Generates actionable ideas based on the note.
   * **Polish**: Improves grammar and clarity.
4. You can also type your own custom prompt in the chat box.

---

## 5. Account Management

### 5.1. Updating Profile
1. Tap the **Profile** tab in the bottom navigation bar.
2. Type your new name in the **Full Name** field.
3. Tap the **Save Changes** button.

### 5.2. Signing Out
1. Go to the **Profile** tab.
2. Tap the **Sign Out** button at the bottom of the screen.

---

## 6. Troubleshooting

**Q: Search isn't finding my new note.**
A: Vector embeddings take a few moments to generate after saving. Wait 10-15 seconds and try searching again.

**Q: I can't delete a note from the list view.**
A: For safety, deletion is only available inside the note detail view. Tap the note to open it, then use the Trash icon.

**Q: App crashes on startup.**
A: Check your internet connection. The app requires a connection to Supabase to authenticate and load notes.