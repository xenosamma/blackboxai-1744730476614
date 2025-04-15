# Precious Waste Refinery CMS

A modern, full-featured Content Management System built for Precious Waste Refinery's website. This CMS provides an intuitive admin interface for managing website content, media, and settings.

## Features

### Content Management
- Dynamic content editing for all website sections
- WYSIWYG editor for rich text content
- Media library for image management
- Content versioning and history
- Drag-and-drop content reordering
- SEO metadata management

### User Management
- Role-based access control (Admin/Editor)
- Secure authentication with JWT
- User permissions system
- Password reset functionality
- User activity logging

### Media Management
- Image upload and optimization
- Media library with search and filtering
- Bulk media operations
- Automatic image resizing
- Secure file storage

### Site Customization
- Theme customization (colors, typography)
- Layout settings
- Feature toggles
- Contact information management
- Social media integration

### Security Features
- JWT authentication
- Password hashing
- XSS protection
- CSRF protection
- Rate limiting
- Input validation
- Secure headers

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Authentication**: JWT
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/pwr-cms.git
cd pwr-cms
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp backend/.env.example backend/.env
```

4. Update the environment variables in `.env` with your configuration:
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pwr-cms
JWT_SECRET=your_jwt_secret
```

5. Initialize the CMS:
```bash
npm run init
```

6. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Directory Structure

```
.
├── admin/              # Admin panel frontend
├── backend/           # Backend application
│   ├── config/       # Configuration files
│   ├── middleware/   # Express middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── scripts/      # Utility scripts
│   └── utils/        # Helper functions
├── uploads/          # Media uploads
└── logs/            # Application logs
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

### Media Endpoints
- `POST /api/media/upload` - Upload media
- `GET /api/media` - Get all media
- `GET /api/media/:id` - Get media by ID
- `DELETE /api/media/:id` - Delete media
- `GET /api/media/search/:term` - Search media

### Settings Endpoints
- `GET /api/settings` - Get all settings
- `GET /api/settings/:category` - Get category settings
- `PUT /api/settings/:category` - Update settings
- `PUT /api/settings/reset/:category` - Reset to defaults

## Development

### Running Tests
```bash
npm test
```

### Linting
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

## Security Considerations

- Use strong passwords
- Keep dependencies updated
- Enable HTTPS in production
- Regularly backup data
- Monitor server logs
- Follow security best practices

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
- Check the [documentation](docs/)
- Create an issue in the repository
- Contact support@preciouswasterefinery.com

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)
- All other open-source contributors

## Roadmap

- [ ] Add multi-language support
- [ ] Implement advanced caching
- [ ] Add analytics dashboard
- [ ] Enable plugin system
- [ ] Add automated backups
- [ ] Implement A/B testing
- [ ] Add SEO optimization tools

## Authors

- Precious Waste Refinery Team

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## Need Help?

If you need help setting up or using the CMS, please:
1. Check the documentation
2. Look through existing issues
3. Create a new issue if needed
4. Contact our support team
