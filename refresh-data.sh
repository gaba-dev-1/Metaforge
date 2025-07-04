"curl -X POST http://localhost:3000/api/cron/refresh-data -H \"Authorization: Bearer \$(grep CRON_SECRET .env.local | cut -d '=' -f2)\""
