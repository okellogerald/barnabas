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

# Clone the frontend repository (this one, contains docker-compose.yml)
git clone <your-frontend-repo-url> barnabas

# Clone the API repository alongside the frontend
git clone <your-api-repo-url> church-manager-api
```

**2. Configure Docker Compose (Important!)**

The provided `docker-compose.yml` file uses a specific setup that might require adjustments for your machine:

* Open the `docker-compose.yml` file located in the `barnabas` directory.
* **Locate the `api` service:**
    * The `build.context` is set to an absolute path (`/Users/mac/Downloads/Programs/other/church-manager-api`). You **MUST** change this to the correct relative path to your cloned `church-manager-api` directory. If you followed step 1, this should be: `../church-manager-api`.

**3. Create Environment File**

Docker Compose uses a `.env` file in the same directory (`barnabas`) to configure environment variables for the services.

* Ensure you are in the `barnabas` project directory:
    ```bash
    cd barnabas
    ```
* Create a `.env` file (`barnabas/.env`) following `.env.example`

**4. Start Docker Services**

From the `barnabas` directory (containing `docker-compose.yml` and `.env`):

```bash
make up
```

**5. Database Setup**

From the `barnabas` directory (containing `docker-compose.yml` and `.env`):

```bash
make migrate
```

### Accessing the Applications

* **Frontend:** [http://localhost:4173](http://localhost:4173)
* **API:** [http://localhost:3000](http://localhost:3000) (or the port you set for `API_PORT` in `.env`)