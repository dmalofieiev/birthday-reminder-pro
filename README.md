# 🎉 Birthday Reminder Pro

Telegram bot for birthday reminders with AI-generated congratulations in multiple languages (English, Russian, Spanish).

## Features

- 📅 Store and manage birthday contacts
- 🔔 Automatic daily reminders
- 🤖 AI-generated personalized congratulations
- 🌐 Multi-language support (EN/RU/ES)
- 📊 Category management (Family, Friends, Colleagues, Other)
- 📁 CSV import/export functionality
- ⚙️ Customizable notification settings
- 🗑️ Safe profile deletion with data export

## Tech Stack

- **Backend**: Node.js + TypeScript
- **Bot Framework**: Telegraf
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Google Gemini API
- **Scheduler**: node-cron
- **Localization**: Custom i18n system

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Telegram Bot Token (from @BotFather)
- Google Gemini API Key

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/birthday-reminder-pro.git
cd birthday-reminder-pro
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Set up database

```bash
npm run db:migrate
npm run db:generate
```

5. Start development server

```bash
npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/birthday_reminder"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
GEMINI_API_KEY="your_gemini_api_key_here"
NODE_ENV="development"
PORT=3000
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma client

## Project Structure

```
src/
├── bot/              # Telegram bot logic
│   ├── handlers/     # Command and action handlers
│   ├── keyboards/    # Inline keyboards
│   └── middleware/   # Bot middleware
├── database/         # Database models and connection
├── services/         # Business logic (AI, notifications, CSV)
├── locales/          # Translation files
└── utils/           # Helper functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or issues, please create an issue in the GitHub repository.
