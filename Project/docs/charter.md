# Notes App Charter

## Project Overview

**Platform**: React Native Android Application  
**Target**: Android mobile devices (API level 21+)  
**Architecture**: Mobile frontend with REST API backend

## Project Scope

### MVP Features

#### Authentication & User Management

- **User Registration**: Email-based account creation with basic validation
- **Login System**: Secure email/password authentication with session management
- **User Profile Management**: Edit name, email, and password functionality

#### Notes Management System

- **Note Creation**: Create new notes with plain text content and manual save
- **Note Reading**: View all user notes in a simple list format
- **Note Editing**: Edit existing notes with basic text input
- **Note Deletion**: Delete notes with confirmation dialog
- **Note Search**: Search functionality across note titles and content

#### Database Schema Implementation

- **users table**: uuid (string), email (string), name (string), data (JSON object for future extensibility)
- **notes table**: id (string, unique), user_id (string, linked to users.uuid), content (text), date_modified (timestamp), basic_stats (JSON object for word_count and character_count)

### Future Features

#### Enhanced Authentication

- Email verification process for account activation
- Password reset via email with secure token generation
- Account deletion option with data confirmation

#### Advanced Notes Features

- Rich text editor with formatting (bold, italic, bullet points)
- Auto-save functionality every 30 seconds during editing
- Character and word count display in real-time
- Version history tracking (last 5 versions)
- Undo/redo functionality during editing sessions
- Bulk deletion capability with multi-select
- Note organization with folders/tags

#### Advanced Technical Features

- **Real-time Collaborative Editing**: Multiple users can edit shared notes simultaneously
- **OCR Integration**: Optical Character Recognition system for digitizing handwritten or printed notes via camera/scanner
- **AI-Powered Note Enhancement**: AI integration for note explanation, summarization, and content suggestions
- **Performance Optimization**: Advanced caching, pagination, and search optimization
- **Security Enhancements**: Advanced encryption, audit logging, and compliance features

## Team Roles

### MVP
- **Kenny**: backend
- **Ricky**: frontend
- **Jamie**: frontend
- **Aadesh**: backend 
- **Eugene**: backend

### Advanced Scaling
- **Kenny**: Project Manager - Oversees project timeline, coordinates team activities, manages stakeholder communication
- **Ricky**: Backend Lead - Develops server-side logic, database design, API endpoints, authentication systems
- **Jamie**: Frontend Lead - Creates user interface, implements client-side functionality, ensures responsive design
- **Aadesh**: QA & Testing - Develops test cases, performs manual and automated testing, ensures quality standards
- **Eugene**: Documentation & Support - Maintains project documentation, user guides, and provides technical support

## Success Criteria

- **Feature Completeness**: All MVP features are fully implemented and functional
- **Authentication Reliability**: User login system works consistently with proper security measures
- **CRUD Functionality**: Notes creation, reading, updating, and deletion operate without errors
- **User Profile Management**: User information editing functions correctly as specified
- **Database Compliance**: Database schema matches exact requirements and supports future feature extensibility
- **Stability Testing**: Application remains stable and responsive under normal usage conditions
- **User Acceptance**: Minimum 5 test users can successfully use all core features without critical issues
- **Documentation Standards**: All features are properly documented with clear user instructions
