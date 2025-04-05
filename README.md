# Barnabas Project

## Local Development Setup Guide

This guide explains how to set up the Barnabas project (Frontend and API) for local development using Docker and Docker Compose.

### Prerequisites

Before you begin, ensure you have the following installed:

* Git
* Docker & Docker Compose

### Getting Started

**1. Clone the Repositories**

Clone both repositories into a common parent directory. This structure is assumed by the default docker-compose configuration.

```bash
# Create a parent directory if needed, e.g., 'projects'
# mkdir projects && cd projects

# Clone the frontend repository (contains docker-compose.yml)
git clone <your-frontend-repo-url> barnabas

# Clone the API repository alongside the frontend
git clone <your-api-repo-url> church-manager-api
```

**2. Configure Docker Compose (Important!)**

The provided `docker-compose.yml` file may contain **hardcoded absolute paths** specific to the original author's machine. You **MUST** update these for the setup to work on your computer.

* Open the `docker-compose.yml` file located in the `barnabas` directory.
* **Locate the `api` service:**
    * Change the `build.context` from `/Users/mac/.../church-manager-api` to a relative path, likely: `../church-manager-api`
* **Locate the `db` service:**
    * Change the `volumes` path from `/Users/mac/.../church-manager-api/.data/mysql` to use a relative path within the project (e.g., `./.data/mysql`) or preferably a Docker named volume (recommended).

    *Example using relative path for volume:*
    ```yaml
    # Inside db service definition in docker-compose.yml
    volumes:
      - ./.data/mysql:/var/lib/mysql # Stores DB data inside barnabas/.data/mysql
    ```
    *(Using a named volume is often preferred and requires defining it at the bottom of the compose file)*

**3. Create Environment File**

Docker Compose uses a `.env` file in the same directory (`barnabas`) to configure environment variables, primarily for the database.

* Ensure you are in the `barnabas` project directory:
    ```bash
    cd barnabas
    ```
* Create a `.env` file (`barnabas/.env`) with the following content:

    ```dotenv
    # barnabas/.env - Variables used by docker-compose.yml
    MYSQL_DATABASE=church_manager
    MYSQL_USER=root
    MYSQL_PASSWORD=password # Change if desired, ensure consistency
    ```
    *(Note: Other variables like API PORT or VITE settings are configured directly within the `docker-compose.yml`)*

**4. Start Docker Services**

From the `barnabas` directory (containing `docker-compose.yml` and `.env`):

```bash
# Build images (if needed) and start all services in detached mode
docker compose up -d --build

# Verify services are running (you should see 'db', 'api', 'frontend')
docker compose ps
```

**5. Database Setup**

Once the containers are running, set up the database using the `api` service:

```bash
# Run database migrations
docker compose exec api npx knex migrate:latest

# Seed the database with initial data
docker compose exec api npx knex seed:run
```

### Accessing the Applications

* **Frontend:** [http://localhost:4173](http://localhost:4173)
* **API:** [http://localhost:3000](http://localhost:3000)

### Useful Docker Commands

*(Run these from the `barnabas` directory)*

```bash
# View logs for all services in real-time
docker compose logs -f

# View logs for a specific service (e.g., api)
docker compose logs -f api

# Stop and remove containers, networks
docker compose down

# Stop and remove containers, networks, AND volumes (use with caution!)
docker compose down -v
```
