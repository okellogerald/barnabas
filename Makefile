up:
	docker compose --env-file .env up --build -d
	@echo "application built and started in detached mode"
	@echo "To stop the application, run 'make down'"
	@echo "To view logs, run 'make logs'"

migrate:
	docker compose exec api npx knex migrate:latest
	docker compose exec api npx knex seed:run
	@echo "Database migrated and seeded"
	@echo "To view logs, run 'make logs'"

down:
	docker compose down -v
	@echo "Stopped the application and removed volumes"
	@echo "To start the application, run 'make up'"

logs:
	docker compose logs -f
	@echo "To stop the logs, press Ctrl+C"
	@echo "To start the application, run 'make up'"