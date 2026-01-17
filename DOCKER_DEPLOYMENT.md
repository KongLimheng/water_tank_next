# Docker Deployment Guide

This guide explains how to deploy the Water Tank application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

### 1. Environment Setup

Create a `.env` file from the example:

```bash
cp .env.docker .env
```

**Important**: Edit the `.env` file and change the default password:

```env
POSTGRES_PASSWORD=your_secure_password_here
```

### 2. Build and Start Services

Build the Docker images and start all services:

```bash
docker-compose up --build
```

To run in detached mode (background):

```bash
docker-compose up -d --build
```

### 3. Access the Application

Once the containers are running, access the application at:

- **Application**: http://localhost:3000
- **Database**: localhost:5432 (if you need direct access)

## Management Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Application only
docker-compose logs -f app

# Database only
docker-compose logs -f db
```

### Stop Services

```bash
# Stop containers (preserves data)
docker-compose stop

# Stop and remove containers (preserves data volumes)
docker-compose down

# Stop and remove everything including volumes (WARNING: deletes all data)
docker-compose down -v
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Rebuild Application

If you make code changes:

```bash
docker-compose up -d --build app
```

## Database Management

### Run Migrations

Migrations run automatically when the container starts. To run manually:

```bash
docker-compose exec app npx prisma migrate deploy
```

### Access Database Console

```bash
docker-compose exec db psql -U postgres -d water_tank
```

### Backup Database

```bash
docker-compose exec db pg_dump -U postgres water_tank > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U postgres water_tank < backup.sql
```

### Seed Database

If you have a seed script:

```bash
docker-compose exec app npm run db:seed
```

## Production Deployment

### Security Recommendations

1. **Change Default Credentials**: Update `POSTGRES_PASSWORD` in `.env`
2. **Use Secrets Management**: Consider using Docker secrets or external secret managers
3. **Enable SSL**: Configure SSL for database connections
4. **Firewall Rules**: Restrict port access to only necessary services
5. **Regular Backups**: Set up automated database backups

### Environment Variables

For production, update your `.env` file with:

```env
# Database (use strong passwords)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=water_tank

# Database URL (update password)
DATABASE_URL=postgresql://postgres:<strong-password>@db:5432/water_tank?schema=public
```

### Persistent Data

Database data is stored in a Docker volume named `postgres_data`. This ensures data persists across container restarts.

To inspect volumes:

```bash
docker volume ls
docker volume inspect water_tank_postgres_data
```

## Troubleshooting

### Container Won't Start

1. Check logs:
   ```bash
   docker-compose logs app
   docker-compose logs db
   ```

2. Verify environment variables:
   ```bash
   docker-compose config
   ```

### Database Connection Issues

1. Ensure database is healthy:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

3. Test connection:
   ```bash
   docker-compose exec app npx prisma db pull
   ```

### Port Already in Use

If port 3000 or 5432 is already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change host port (left side)
```

### Build Errors

1. Clean build cache:
   ```bash
   docker-compose build --no-cache
   ```

2. Remove old images:
   ```bash
   docker system prune -a
   ```

### Out of Memory

Increase Docker memory limits in Docker Desktop settings or modify `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
```

## Development vs Production

### Development Mode

For development, you might want to use volume mounts for hot reloading:

```yaml
services:
  app:
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    command: npm run dev
```

### Production Mode

The current setup is optimized for production with:
- Multi-stage builds for smaller images
- Production dependencies only
- Automatic migrations
- Health checks
- Restart policies

## Monitoring

### Container Health

```bash
docker-compose ps
```

### Resource Usage

```bash
docker stats
```

### Inspect Container

```bash
# Application container
docker-compose exec app sh

# Database container
docker-compose exec db sh
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Support

For issues specific to the Water Tank application, please refer to the main README.md or contact the development team.
