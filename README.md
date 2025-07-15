# Barnabas Project

## Quick Start

### Prerequisites
- Git
- Docker & Docker Compose

### Setup & Run

1. **Clone the repositories:**
```bash
git clone <your-frontend-repo-url> barnabas
git clone <your-api-repo-url> barnabas-backend
```

2. **Configure environment:**
```bash
cd barnabas
cp .env.example .env
# Edit .env with your settings
```

3. **Start the application:**
```bash
make up
make migrate
```

4. **Access the app:**
- Frontend: http://localhost:4173 [or FRONTEND_PORT from .env]
- API: http://localhost:3000 [or API_PORT from .env]

### Available Commands
```bash
make up          # Start production environment
make down        # Stop production environment
make migrate     # Setup database
make logs        # View logs
make help        # Show all commands
```

## For Developers & Contributors

### Development Setup
If you're contributing code, use the development environment:

1. **Configure development environment:**
```bash
cp .env.example .env.dev
# Edit .env.dev with your settings
```

2. **Start development environment:**
```bash
make up-dev      # Start development environment (with hot reload)
make migrate-dev # Setup database with sample data
```

3. **Access development app:**
- Frontend: http://localhost:5173
- API: http://localhost:3000

4. **Add Sample Data**
   Ensure you're using **Bash version 4 or higher**. Then, run the following command in your terminal:

```bash
./sample-data-generator.sh
```

> 💡 **Note for non-macOS users:**
> The first line of the script (`#!/opt/homebrew/bin/bash`) specifies the path to the Bash interpreter, which on macOS may point to `/opt/homebrew/bin/bash`. On other operating systems, this path might be different. If the script doesn't run, you can either:

* Modify the first line to point to the correct Bash path on your system, or
* Remove the line entirely and run the script explicitly with Bash like this:

  ```bash
  bash sample-data-generator.sh
  ```

### Development Features
- **Hot reload** for frontend changes
- **Separate dev database** (port 3307) 
- **Sample data** included for testing
- **Live API** with auto-restart

### Development Commands
```bash
make up-dev      # Start development environment
make down-dev    # Stop development environment
make migrate-dev # Setup database with sample data
make logs-dev    # View development logs
make status-dev  # Show development container status
```

### Making Changes
1. **Frontend:** Edit files in `src/` - changes appear instantly
2. **Database:** Run `make migrate-dev` after schema changes
3. **API:** Clone the backend repo and edit there

### Troubleshooting
```bash
make clean           # Clean Docker system
make down && make up # Restart everything (production)
make down-dev && make up-dev # Restart everything (development)
```

---

**Note:** Use `make up` for regular usage, `make up-dev` only for development.
