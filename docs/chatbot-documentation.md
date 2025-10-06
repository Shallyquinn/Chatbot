# Honey Chatbot Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Components](#components)
5. [User Flows](#user-flows)
6. [Technical Implementation](#technical-implementation)
7. [API Integration](#api-integration)
8. [Configuration](#configuration)

## Overview

The Honey Chatbot is a comprehensive healthcare communication system designed to provide family planning and reproductive health information in Nigeria. It supports multiple languages (English and Yoruba) and offers interactive features including audio, video, and location-based clinic referrals.

### Key Features

- Multi-language support (English, Yoruba)
- Family planning information
- Emergency contraception guidance
- Clinic referral system
- Interactive media (audio, video, images)
- Location-based services
- User session management

## Architecture

### Frontend (React/TypeScript)

- Built with React and TypeScript
- Uses Vite as the build tool
- State management through React Context
- Styled with Tailwind CSS
- Component-based architecture

### Backend (NestJS)

- RESTful API built with NestJS
- PostgreSQL database with Prisma ORM
- JWT-based authentication
- Session management
- Analytics tracking

## Components

### Core Components

1. **ActionProvider**

   - Manages chatbot responses and actions
   - Handles user interactions
   - Integrates with external services
   - Manages conversation flow

2. **MessageParser**

   - Processes user input
   - Identifies user intent
   - Routes to appropriate handlers
   - Manages conversation context

3. **Config**
   - Configures chatbot behavior
   - Defines widget configurations
   - Sets up initial messages
   - Manages state initialization

### UI Components

1. **Media Widgets**

   - AudioWidget: Handles audio playback
   - ImageWidget: Displays images
   - VideoLinkWidget: Manages video content
   - LGASearchWidget: Location search
   - StateSearchWidget: State selection

2. **Interactive Components**
   - OptionButtons: User choice selection
   - ChatMessage: Message display
   - ThemeDropdown: Theme customization
   - BotAvatar: Bot representation

## User Flows

### 1. Initial Interaction

- Welcome message
- Language selection
- User identification
- Topic selection

### 2. Family Planning Information

- Method selection
  - Short-term methods
  - Long-term methods
  - Permanent methods
- Detailed information
- Media content
- Clinic referral options

### 3. Emergency Contraception

- Time-sensitive guidance
- Product information
- Usage instructions
- Safety information
- Clinic referral

### 4. Clinic Referral System

- Location selection
- Service verification
- Appointment guidance
- Contact information

## Technical Implementation

### State Management

```typescript
interface ChatbotState {
  messages: ChatMessage[];
  language: string;
  userSessionId: string;
  userData: ChatbotUserData;
}
```

### Data Models

1. User Session Data
2. Conversation Data
3. Clinic Location Data
4. FPM Interaction Data

### API Integration Points

1. User Management
2. Session Tracking
3. Clinic Location Services
4. Analytics

## API Integration

### Endpoints

1. **User Management**

   - POST /user - Create/update user
   - GET /user/:sessionId - Get user by session

2. **Chat Sessions**

   - POST /chat-sessions - Create session
   - GET /chat-sessions/:id - Get session details

3. **Clinic Locations**

   - GET /clinics - List clinics
   - GET /clinics/:id - Get clinic details

4. **Analytics**
   - POST /analytics/interaction - Log interaction
   - GET /analytics/reports - Get reports

### Data Flow

1. User input → MessageParser
2. MessageParser → ActionProvider
3. ActionProvider → API Service
4. API Service → Backend
5. Backend → Database

## Configuration

### Environment Setup

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-key

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret
```

### Feature Configuration

1. Message templates
2. Widget configurations
3. Flow definitions
4. Media content paths

## Security

### User Data Protection

- Session management
- Data encryption
- Secure API calls
- Input validation

### API Security

- JWT authentication
- Rate limiting
- CORS configuration
- Request validation

## Error Handling

### Frontend

- Input validation
- API error handling
- Fallback content
- Offline support

### Backend

- Request validation
- Error responses
- Logging
- Monitoring

## Performance Considerations

### Frontend Optimization

- Lazy loading
- Code splitting
- Asset optimization
- Caching strategies

### Backend Optimization

- Database indexing
- Query optimization
- Caching
- Load balancing

## Implementation Examples

### Message Parser Implementation

```typescript
// Example of message parsing logic
class MessageParser {
  private parseMessage(message: string): Intent {
    // Emergency contraception keywords
    if (message.match(/emergency|morning after|unprotected/i)) {
      return {
        type: "EMERGENCY",
        confidence: 0.9,
        entities: this.extractTimeInfo(message),
      };
    }

    // Family planning method keywords
    if (message.match(/contraception|family planning|birth control/i)) {
      return {
        type: "PREVENTION",
        confidence: 0.85,
        entities: this.extractPreferences(message),
      };
    }

    return { type: "UNKNOWN", confidence: 0 };
  }
}
```

### Action Provider Implementation

```typescript
// Example of handling emergency contraception flow
class ActionProvider {
  async handleEmergencyFlow(timeframe: string): Promise<void> {
    const messages = [];

    if (timeframe === 'within24hrs') {
      messages.push({
        type: 'bot',
        content: 'You're within the most effective window for emergency contraception.',
        options: ['Learn about pills', 'Find clinic']
      });
    } else if (timeframe === 'within72hrs') {
      messages.push({
        type: 'bot',
        content: 'Emergency contraception can still be effective. Here are your options:',
        options: ['View products', 'Find clinic']
      });
    }

    await this.updateConversationState(messages);
  }
}
```

### API Integration Example

```typescript
// Example of clinic search implementation
class ClinicService {
  async findNearbyClinic(state: string, lga: string): Promise<Clinic[]> {
    const clinics = await this.prisma.clinicLocation.findMany({
      where: {
        state: state,
        lga: lga,
        is_active: true,
      },
      select: {
        clinic_name: true,
        address: true,
        phone_number: true,
        services_offered: true,
      },
    });

    return clinics.map(this.formatClinicInfo);
  }
}
```

## Testing

### Frontend Tests

- Component tests
- Integration tests
- Flow tests
- UI tests

### Backend Tests

- Unit tests
- E2E tests
- API tests
- Load tests
