# Precious Waste Refinery CMS

A content management system for the Precious Waste Refinery website, allowing easy content editing and site customization.

## Features

- **Content Management**
  - Edit all website sections
  - Manage images and media
  - Reorder content sections
  - Version control for content changes

- **User Management**
  - Role-based access control (Admin/Editor)
  - User authentication and authorization
  - Permission-based features

- **Site Customization**
  - Theme customization (colors, fonts)
  - Layout settings
  - Contact information
  - SEO settings

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- Set MongoDB connection string
- Configure JWT secret
- Update SMTP settings (for password reset)
- Set admin credentials

5. Initialize the database:
```bash
npm run db:init
```

6. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/password` - Change password

### Content Endpoints

- `GET /api/content` - Get all content
- `GET /api/content/:section` - Get section content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `PUT /api/content/reorder` - Reorder content items

### Settings Endpoints

- `GET /api/settings` - Get all settings
- `GET /api/settings/:category` - Get category settings
- `PUT /api/settings/:category` - Update category settings
- `PUT /api/settings/reset/:category` - Reset category to defaults

## Content Structure

### Available Sections
- Hero
- Impact
- Services
- Pricing
- Process
- Join
- Contact
- Footer

### Content Types
- Text
- Image
- List
- Form
- Stats

## Customization Options

### Theme Settings
- Primary Color
- Secondary Color
- Accent Color
- Background Color
- Text Color
- Fonts (Primary/Secondary)

### Layout Settings
- Container Width
- Section Spacing
- Element Spacing
- Border Radius

### Feature Toggles
- Blog
- Newsletter
- Live Chat
- Analytics

## Security

- JWT-based authentication
- Password hashing
- Role-based access control
- Input validation
- XSS protection
- CSRF protection
- Rate limiting

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Management
```bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore
```

## Deployment

1. Set environment variables for production
2. Build the application:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@preciouswasterefinery.com or create an issue in the repository.
