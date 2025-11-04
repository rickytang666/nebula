# Notes App Charter

## Project Overview
**Platform**: React Native Android Application  
**Target**: Android mobile devices (API level 21+)  
**Architecture**: Mobile frontend with REST API backend (FastAPI)

The Notes App is a mobile application designed to provide users with a simple, secure, and efficient way to create, manage, and organize personal notes on Android devices. It will include advanced features that distinguishes itself from a typical notes app.

## Project Objectives
- Deliver a functional note-taking application for Android users
- Implement secure user authentication and data management
- Provide intuitive CRUD operations for note management
- Establish a scalable foundation for future feature enhancements
- Create a reliable and user-friendly mobile experience

## Scope

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

### Sprint 3-4 Advanced Features
#### Enhanced Notes Features (Weeks 3-4)
- Rich text editor with formatting (bold, italic, bullet points)
- Auto-save functionality every 30 seconds during editing
- Character and word count display in real-time
- Bulk deletion capability with multi-select
- Search functionality across note titles and content
- Performance optimization and caching
- **OCR Integration**: Optical Character Recognition system for digitizing handwritten or printed notes via camera/scanner
- **AI-Powered Note Enhancement**: AI integration for note explanation, summarization, and content suggestions

### Future Considerations If Time Permits
#### Enhanced Authentication
- Email verification process for account activation
- Password reset via email with secure token generation
- Account deletion option with data confirmation

#### Advanced Note Taking Features
- Undo/redo functionality during editing sessions
- Version history
- Note organization with folders/tags
- **Real-time Collaborative Editing**: Multiple users can edit shared notes simultaneously
- **Security Enhancements**: Advanced encryption, audit logging, and compliance features

## Technical Requirements
### Frontend (React Native)
- React Native framework for Android development
- API level 21+ compatibility
- Responsive UI components for various screen sizes
- Local storage for offline functionality
- HTTP client for API communication

### Backend (REST API)
- RESTful API architecture
- Database integration with user and notes tables
- Authentication middleware and session management
- Input validation and error handling
- CORS configuration for mobile app access

### Database
- Relational database with users and notes tables
- Foreign key relationships and data integrity
- Indexing for search performance
- Backup and recovery procedures
- MySQL ≥ 8.0.13 if using DEFAULT(UUID()); otherwise UUIDs generated in app
- Secrets via .env (not committed)

## Development Process
### Methodology
- Agile development with 4 weekly sprints
- Feature-based development approach
- Code review process for all commits
- Continuous integration and testing
- Weekly sprint reviews and planning sessions

### Workflow
1. Sprint planning and task breakdown
2. Database schema design and implementation
3. Backend API development and testing
4. Frontend component development
5. Integration testing and bug fixes
6. Feature enhancement and optimization
7. User acceptance testing and deployment

## Stakeholder

### Primary Stakeholders
#### Development Team
- **Kenny**: Backend, Schema Design, Create Endpoints
- **Ricky**: Frontend, React Native API Functions
- **Jamie**: Frontend, React Native App Design
- **Aadesh**: Backend, Create Endpoints
- **Eugene**: Backend, User Login System Implementation

#### Future Scaling Roles
- **Kenny**: Project Manager - Timeline oversight and team coordination
- **Ricky**: Backend Lead - Server-side logic and database design
- **Jamie**: Frontend Lead - UI/UX and client-side functionality
- **Aadesh**: QA & Testing - Test development and quality assurance
- **Eugene**: Documentation & Support - Technical documentation and user support

### Secondary Stakeholders
#### Academic Oversight
- **SE101 Teaching Team**: Course instructors and teaching assistants responsible for project evaluation, guidance, and academic assessment

#### End Users
- **Target Customers**: Android mobile device users seeking a reliable note-taking application
- **Beta Testers**: Initial user group for testing and feedback during development phases
- **Future User Base**: Potential users for scaled versions with advanced features

## Timeline

### Sprint 1: Foundation & Authentication (Week 1)
- Database schema design and setup
- User registration and login system implementation
- Project structure and development environment setup
- Basic authentication API endpoints

### Sprint 2: Core Notes CRUD (Week 2)
- Notes creation, reading, editing, and deletion functionality
- Basic frontend UI components for notes management
- Frontend-backend integration for MVP features
- Basic testing and bug fixes

### Sprint 3: Enhanced Features (Week 3)
- Search functionality across note titles and content
- Rich text editor with basic formatting
- Auto-save functionality implementation
- Character and word count display
- Enhanced UI/UX improvements
- OCR-based note digitization functionality

### Sprint 4: Advanced Features & Polish (Week 4)
- Bulk operations (multi-select delete)
- Performance optimization and caching
- Comprehensive testing and quality assurance
- Documentation completion and deployment preparation
- AI integration for note explanation, summarization, and content suggestions

## Risk Management
### Technical Risks
- **Database Performance**: Implement indexing and query optimization
- **API Security**: Use proper authentication tokens and input validation
- **Mobile Compatibility**: Test across different Android versions and devices
- **Data Loss**: Implement regular backups and error handling

### Project Risks
- **Timeline Delays**: Buffer time allocated for unexpected issues
- **Team Coordination**: Regular standups and clear communication channels
- **Scope Creep**: Strict adherence to MVP features with future feature documentation
- **Quality Issues**: Comprehensive testing strategy and code review process

### Mitigation Strategies
- Regular progress reviews and risk assessments
- Backup plans for critical components
- Clear documentation and knowledge sharing
- Continuous testing throughout development cycle
