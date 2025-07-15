# Complaint Categorization System

This document describes the AI-powered complaint categorization system that automatically categorizes incoming customer emails based on predefined complaint types.

## Overview

The complaint categorization system uses Google Gemini AI to automatically analyze incoming emails and assign them to predefined complaint categories. This helps companies:

- Automatically route tickets to the right teams
- Prioritize complaints based on category
- Generate better analytics and insights
- Improve response times

## Features

### 1. Complaint Category Management
- Create, edit, and delete complaint categories
- Set confidence thresholds for each category
- Add keywords to improve categorization accuracy
- Enable/disable categories as needed

### 2. AI Model Training
- Train the AI model using 700+ email templates from the `data/` folder
- Model learns from categorized examples (Product, Technical, Shipping, Customer_Service, Billing)
- Automatic retraining when categories are updated

### 3. Email Categorization
- Automatic categorization of incoming emails
- Confidence scoring (0-100%)
- Fallback to "default" category when confidence is low
- Detailed reasoning for categorization decisions

### 4. Testing Interface
- Test categorization with sample emails
- Try custom email content
- View confidence levels and reasoning

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install @google/generative-ai
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Training Data

The system uses email templates from the `data/` folder:
- `data/Product/` - Product-related complaints
- `data/Technical/` - Technical support issues
- `data/Shipping/` - Shipping and delivery problems
- `data/Customer_Service/` - General customer service
- `data/Billing/` - Billing and payment issues

## Usage

### 1. Access the Feature

Navigate to **Email Setup** → **Complaint Categories** tab in your admin dashboard.

### 2. Create Categories

1. Click "Add Category"
2. Enter category name (e.g., "Product Quality", "Technical Support")
3. Add description and keywords
4. Set confidence threshold (default: 75%)
5. Save the category

### 3. Train the AI Model

1. Create at least one complaint category
2. Click "Train AI Model"
3. Wait for training to complete
4. Check model status

### 4. Test Categorization

1. Go to **Email Setup** → **Test Categorization** tab
2. Try sample emails or paste custom content
3. View categorization results and confidence levels

### 5. Monitor Results

- Incoming emails are automatically categorized
- Check ticket details to see assigned category
- Review confidence levels to identify areas for improvement

## API Endpoints

### Complaint Categories

- `GET /api/complaint-categories` - Get all categories
- `POST /api/complaint-categories` - Create new category
- `PUT /api/complaint-categories/:id` - Update category
- `DELETE /api/complaint-categories/:id` - Delete category

### AI Model

- `POST /api/complaint-categories/train` - Train the model
- `GET /api/complaint-categories/model/status` - Get model status

### Email Categorization

- `POST /api/complaint-categories/categorize` - Categorize single email
- `POST /api/complaint-categories/categorize/batch` - Batch categorize emails

## Data Models

### ComplaintCategory

```javascript
{
  _id: ObjectId,
  companyId: ObjectId,
  name: String,
  description: String,
  keywords: [String],
  isActive: Boolean,
  trainingDataCount: Number,
  confidenceThreshold: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Updated Ticket Model

The Ticket model now includes complaint categorization fields:

```javascript
{
  // ... existing fields ...
  complaintCategory: ObjectId, // Reference to ComplaintCategory
  complaintCategoryName: String,
  complaintCategoryConfidence: Number
}
```

## How It Works

### 1. Training Process

1. System loads email templates from `data/` folders
2. Maps templates to company's complaint categories
3. Creates training prompt with examples
4. Stores categories in memory for quick access

### 2. Categorization Process

1. Incoming email is processed
2. Email content is sent to Google Gemini AI
3. AI analyzes content against trained categories
4. Returns category, confidence, and reasoning
5. Ticket is created with categorization data

### 3. Confidence Scoring

- **80-100%**: High confidence - likely accurate
- **60-79%**: Medium confidence - review recommended  
- **0-59%**: Low confidence - manual review needed

## Best Practices

### 1. Category Creation

- Use clear, descriptive names
- Add relevant keywords for better matching
- Set appropriate confidence thresholds
- Start with broad categories, then add specific ones

### 2. Training

- Train model after creating/updating categories
- Monitor categorization accuracy
- Adjust keywords and thresholds as needed
- Retrain periodically with new examples

### 3. Monitoring

- Review low-confidence categorizations
- Update categories based on patterns
- Track categorization accuracy over time
- Use feedback to improve the system

## Troubleshooting

### Common Issues

1. **Model not trained**
   - Ensure at least one category exists
   - Check that categories are active
   - Verify training data is accessible

2. **Low categorization accuracy**
   - Add more keywords to categories
   - Review and update training data
   - Adjust confidence thresholds
   - Retrain the model

3. **API errors**
   - Verify Google Gemini API key is valid
   - Check API quota and limits
   - Ensure network connectivity

### Error Handling

The system includes comprehensive error handling:
- Graceful fallback to "default" category
- Detailed error logging
- User-friendly error messages
- Automatic retry mechanisms

## Future Enhancements

Potential improvements for the system:

1. **Machine Learning Integration**
   - Train custom models on company-specific data
   - Implement feedback loops for continuous improvement
   - Add sentiment analysis

2. **Advanced Features**
   - Multi-language support
   - Priority prediction based on category
   - Automatic routing to appropriate teams
   - Integration with CRM systems

3. **Analytics**
   - Categorization accuracy metrics
   - Category distribution reports
   - Response time analysis by category
   - Trend analysis and predictions

## Support

For technical support or questions about the complaint categorization system, please refer to the main project documentation or contact the development team. 