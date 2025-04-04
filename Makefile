deploy:
	docker build -t barnabas-app .
	docker run -d --env-file .env.development.local -p 4173:4173 barnabas-app