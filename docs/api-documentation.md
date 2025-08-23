# API Reference

This document contains the REST API endpoints for the system.  
All responses are JSON.

---

## **Users API**

Base URL: `/users`

### **Create User**
- **POST** `/users`
- **Body**: `CreateUserDto`
- **Response**: Created user

### **Get All Users**
- **GET** `/users`
- **Response**: List of all users

### **Get One User**
- **GET** `/users/:id`
- **Params**:
  - `id` *(string)* — User ID
- **Response**: Single user

### **Update User**
- **PATCH** `/users/:id`
- **Params**:
  - `id` *(string)* — User ID  
- **Body**: `UpdateUserDto`
- **Response**: Updated user

### **Delete User**
- **DELETE** `/users/:id`
- **Params**:
  - `id` *(string)* — User ID
- **Response**: Deletion result

---

## **FPM Interactions API**

Base URL: `/fpm-interactions`

### **Create Interaction**
- **POST** `/fpm-interactions`
- **Body**: `CreateFpmInteractionDto`
- **Response**: Created interaction

### **Get All Interactions**
- **GET** `/fpm-interactions`
- **Response**: List of interactions

### **Get One Interaction**
- **GET** `/fpm-interactions/:id`
- **Params**:
  - `id` *(string)* — Interaction ID
- **Response**: Single interaction

### **Update Interaction**
- **PATCH** `/fpm-interactions/:id`
- **Params**:
  - `id` *(string)* — Interaction ID  
- **Body**: `UpdateFpmInteractionDto`
- **Response**: Updated interaction

### **Delete Interaction**
- **DELETE** `/fpm-interactions/:id`
- **Params**:
  - `id` *(string)* — Interaction ID
- **Response**: Deletion result

---

## **Clinic Locations API**

Base URL: `/clinics`

### **Create Clinic Location**
- **POST** `/clinics`
- **Body**: `CreateClinicLocationDto`
- **Response**: Created clinic

### **Get All Clinics**
- **GET** `/clinics`
- **Response**: List of clinics

### **Get One Clinic**
- **GET** `/clinics/:id`
- **Params**:
  - `id` *(string)* — Clinic ID
- **Response**: Single clinic

### **Update Clinic Location**
- **PATCH** `/clinics/:id`
- **Params**:
  - `id` *(string)* — Clinic ID  
- **Body**: `UpdateClinicLocationDto`
- **Response**: Updated clinic

### **Delete Clinic Location**
- **DELETE** `/clinics/:id`
- **Params**:
  - `id` *(string)* — Clinic ID
- **Response**: Deletion result

---

## **Referrals API**

Base URL: `/referrals`

### **Create Referral**
- **POST** `/referrals`
- **Body**: `CreateReferralDto`
- **Response**: Created referral

### **Get All Referrals**
- **GET** `/referrals`
- **Response**: List of referrals

### **Get One Referral**
- **GET** `/referrals/:id`
- **Params**:
  - `id` *(string)* — Referral ID
- **Response**: Single referral

### **Update Referral**
- **PATCH** `/referrals/:id`
- **Params**:
  - `id` *(string)* — Referral ID  
- **Body**: `UpdateReferralDto`
- **Response**: Updated referral

### **Delete Referral**
- **DELETE** `/referrals/:id`
- **Params**:
  - `id` *(string)* — Referral ID
- **Response**: Deletion result

---

## **Analytics API**

Base URL: `/analytics`

### **Upsert Analytics**
- **POST** `/analytics`
- **Body**: `CreateConversationAnalyticsDto`
- **Response**: Created or updated analytics record

### **Get Analytics by Session**
- **GET** `/analytics/:sessionId`
- **Params**:
  - `sessionId` *(string)* — Session ID
- **Response**: Analytics data for the session

### **Get Stats**
- **GET** `/analytics/stats`
- **Response**: Aggregated analytics statistics

### **Get Flows**
- **GET** `/analytics/flows`
- **Response**: Conversation flow data

---

## **Chat Sessions API**

Base URL: `/chat-sessions`

### **Create Chat Session**
- **POST** `/chat-sessions`
- **Body**: `CreateChatSessionDto`
- **Response**: Created chat session

### **Get All Chat Sessions**
- **GET** `/chat-sessions`
- **Response**: List of chat sessions

### **Get One Chat Session**
- **GET** `/chat-sessions/:id`
- **Params**:
  - `id` *(string)* — Chat session ID
- **Response**: Single chat session

### **Update Chat Session**
- **PATCH** `/chat-sessions/:id`
- **Params**:
  - `id` *(string)* — Chat session ID  
- **Body**: `UpdateChatSessionDto`
- **Response**: Updated chat session

### **Delete Chat Session**
- **DELETE** `/chat-sessions/:id`
- **Params**:
  - `id` *(string)* — Chat session ID
- **Response**: Deletion result

---

## **Conversations API**

Base URL: `/conversations`

### **Create Conversation Message**
- **POST** `/conversations`
- **Body**: `CreateConversationDto`
- **Response**: Created conversation message

### **Get All Conversations**
- **GET** `/conversations`
- **Response**: List of conversations

### **Get One Conversation**
- **GET** `/conversations/:id`
- **Params**:
  - `id` *(string)* — Conversation ID
- **Response**: Single conversation

### **Update Conversation**
- **PATCH** `/conversations/:id`
- **Params**:
  - `id` *(string)* — Conversation ID  
- **Body**: `UpdateConversationDto`
- **Response**: Updated conversation

### **Delete Conversation**
- **DELETE** `/conversations/:id`
- **Params**:
  - `id` *(string)* — Conversation ID
- **Response**: Deletion result

---

## **Responses API**

Base URL: `/responses`

### **Create Response**
- **POST** `/responses`
- **Body**: `CreateResponseDto`
- **Response**: Created response

### **Get Responses**
- **GET** `/responses`
- **Query**: `QueryResponseDto` *(optional filters)*
- **Response**: List of responses

### **Update Response**
- **PUT** `/responses/:id`
- **Params**:
  - `id` *(string)* — Response ID  
- **Body**: `UpdateResponseDto`
- **Response**: Updated response

### **Delete Response**
- **DELETE** `/responses/:id`
- **Params**:
  - `id` *(string)* — Response ID
- **Response**: Deletion result
