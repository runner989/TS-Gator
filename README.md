# TS-Gator

A TypeScript-based RSS feed aggregator and reader CLI tool that allows you to manage feeds, follow them, and browse posts right from your terminal.

## Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** database
- **npm** package manager

## Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Build the TypeScript project:
```bash
npm run build
```

## Configuration

TS-Gator requires a configuration file to connect to your PostgreSQL database.

### Setting up the config file

The application will automatically create a config file at `~/.gatorconfig.json` when you first run it. However, you need to set your database URL:

1. Create or edit the config file:
```bash
# The config file will be created at your home directory
~/.gatorconfig.json
```

2. Set your database connection string:
```json
{
  "db_url": "postgres://username:password@localhost:5432/your_database_name",
  "current_user_name": ""
}
```

Replace the database URL with your actual PostgreSQL connection details.

### Database Setup

Run the database migrations to set up the required tables:
```bash
npm run db:migrate
```

## Usage

Run commands using:
```bash
npm run start <command> [arguments]
```

### Available Commands

#### User Management
```bash
# Register a new user
npm run start register <username>

# Login as a user
npm run start login <username>

# Reset/logout current user
npm run start reset

# List all users
npm run start users
```

#### Feed Management
```bash
# Add a new RSS feed
npm run start addfeed "Feed Name" "https://example.com/rss"

# List all available feeds
npm run start feeds

# Follow a feed (must be logged in)
npm run start follow "https://example.com/rss"

# List feeds you're following
npm run start following

# Unfollow a feed
npm run start unfollow "https://example.com/rss"
```

#### Browse Posts
```bash
# Browse latest 2 posts from feeds you follow (default)
npm run start browse

# Browse latest 10 posts
npm run start browse 10
```

#### Feed Aggregation
```bash
# Start the feed aggregator (fetches and saves posts)
# Runs continuously until stopped with Ctrl+C
npm run start agg <time_interval>

# Examples:
npm run start agg 30s  # Fetch every 30 seconds
npm run start agg 5m   # Fetch every 5 minutes
npm run start agg 1h   # Fetch every 1 hour
```

## Example Workflow

1. **Register and login:**
```bash
npm run start register alice
npm run start login alice
```

2. **Add and follow some feeds:**
```bash
npm run start addfeed "Hacker News" "https://hnrss.org/newest"
npm run start follow "https://hnrss.org/newest"
```

3. **Start the aggregator to collect posts:**
```bash
npm run start agg 1m
```
*Let this run for a few minutes to collect posts, then stop with Ctrl+C*

4. **Browse the collected posts:**
```bash
npm run start browse 5
```

## Features

- **User Management**: Register, login, and manage multiple users
- **RSS Feed Management**: Add, follow, and unfollow RSS feeds
- **Automatic Post Collection**: Continuously fetch and store posts from followed feeds
- **Post Browsing**: View recent posts from your followed feeds in a clean terminal format
- **Duplicate Prevention**: Automatically handles duplicate posts
- **Flexible Scheduling**: Configure how often feeds are fetched
- **Date Parsing**: Handles various RSS date formats
- **Database Storage**: All data is stored in PostgreSQL for persistence

## Development

### Scripts
- `npm run build` - Compile TypeScript
- `npm run start` - Run the CLI tool
- `npm run db:generate` - Generate new database migrations
- `npm run db:migrate` - Apply database migrations

### Database Schema
The application uses the following main tables:
- `users` - User accounts
- `feeds` - RSS feed definitions
- `feed_follows` - User-feed relationships
- `posts` - Individual RSS posts

## Troubleshooting

**Database Connection Issues:**
- Ensure PostgreSQL is running
- Verify your database URL in the config file
- Make sure the database exists
- Check that migrations have been applied

**Feed Fetching Issues:**
- Some RSS feeds may have different formats
- Network connectivity issues may cause timeouts
- Invalid RSS feed URLs will cause errors

**Permission Issues:**
- Make sure you're logged in for commands that require authentication
- Verify the config file is readable/writable

## Technologies Used

- TypeScript
- Drizzle ORM
- PostgreSQL
- fast-xml-parser (RSS/Atom parsing)
- tsx (TypeScript execution)