# Discourse Integration Setup Guide

## Overview
The BGIN AI system now supports publishing locally generated insights directly to Discourse forums. This allows users to share their AI-powered research findings with the broader community.

## Features
- **Publish AI Insights**: Share AI-generated content to Discourse forums
- **Category Support**: Post to specific forum categories
- **Tagging**: Add relevant tags to posts
- **Metadata**: Automatic attribution and context information
- **Reply Support**: Reply to existing Discourse topics

## Configuration

### 1. Create a .env file
Create a `.env` file in the `bgin-ai-mvp` directory with the following variables:

```env
# Discourse Integration
DISCOURSE_URL=https://your-forum.com
DISCOURSE_API_KEY=your_api_key_here
DISCOURSE_USERNAME=your_bot_username
```

### 2. Get Discourse API Key
1. Log into your Discourse forum as an admin
2. Go to Admin → API → Create Master Key
3. Copy the generated API key
4. Add it to your `.env` file

### 3. Create Bot User (Optional)
1. Create a dedicated user account for the AI bot
2. Give it appropriate permissions for posting
3. Use this username in the `DISCOURSE_USERNAME` variable

## Usage

### Publishing Insights
1. **Start a Chat**: Begin a conversation with any AI agent
2. **Generate Content**: Get AI responses on your topic
3. **Publish**: Click "Publish Last AI Response" or use the Discourse Publishing interface
4. **Configure**: Set title, content, category, and tags
5. **Submit**: Post directly to the Discourse forum

### Features Available
- **Auto-Populate**: Last AI response automatically fills the content
- **Category Selection**: Choose from available forum categories
- **Tag Management**: Add relevant tags for better organization
- **Metadata**: Automatic attribution with session and project information
- **Status Monitoring**: Real-time Discourse connection status

## API Endpoints

### Get Discourse Status
```
GET /api/discourse/status
```
Returns configuration status and connection info.

### Get Categories
```
GET /api/discourse/categories
```
Returns available forum categories.

### Publish Post
```
POST /api/discourse/publish
{
  "title": "Post Title",
  "content": "Post Content",
  "categoryId": 123,
  "tags": ["ai", "blockchain"],
  "sessionId": "regulatory",
  "projectId": "bgin-conference-2025",
  "agentType": "discourse"
}
```

### Reply to Topic
```
POST /api/discourse/reply
{
  "topicId": 456,
  "content": "Reply Content",
  "sessionId": "regulatory",
  "projectId": "bgin-conference-2025",
  "agentType": "discourse"
}
```

## Example Workflow

1. **Conference Session**: Join a BGIN conference session
2. **AI Discussion**: Chat with Archive, Codex, or Discourse agents
3. **Generate Insights**: Get detailed AI analysis on blockchain governance topics
4. **Publish Findings**: Share insights with the community via Discourse
5. **Community Engagement**: Receive feedback and continue discussions

## Benefits

### For Researchers
- **Seamless Publishing**: No need to manually copy/paste content
- **Context Preservation**: Session and project metadata included
- **Professional Attribution**: Clear indication of AI-generated content
- **Community Integration**: Direct bridge to public discussions

### For Community
- **Transparent AI Use**: Clear labeling of AI-generated content
- **Rich Context**: Understanding of where insights originated
- **Quality Content**: Curated AI insights from conference sessions
- **Engagement**: Easy to respond and build on AI findings

## Troubleshooting

### Common Issues
1. **API Key Not Working**: Verify the key has posting permissions
2. **Categories Not Loading**: Check forum permissions for the bot user
3. **Publishing Fails**: Ensure the bot user can post in the selected category
4. **Connection Issues**: Verify the Discourse URL is correct

### Debug Steps
1. Check `/api/discourse/status` endpoint
2. Verify `.env` file configuration
3. Test API key manually with Discourse API
4. Check server logs for detailed error messages

## Security Notes

- **API Key Security**: Keep your Discourse API key secure
- **Bot Permissions**: Use minimal required permissions for the bot user
- **Content Review**: Consider reviewing AI-generated content before publishing
- **Community Guidelines**: Ensure published content follows forum rules

## Future Enhancements

- **Draft Management**: Save drafts before publishing
- **Scheduled Publishing**: Publish at specific times
- **Content Templates**: Pre-defined templates for different session types
- **Analytics**: Track engagement with published content
- **Moderation**: Built-in content review workflows
