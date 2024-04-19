#https://github.com/tursodatabase/libsql/blob/main/docs/BUILD-RUN.md#build-and-install-with-homebrew

start-db:
	make clean-db && turso dev --db-file ./db/sql.sqlite
#docker run -p 8080:8080 -d ghcr.io/libsql/sqld:latest

clean-db:
	rm -rf ./db/*

db-push:
	bunx drizzle-kit push:sqlite

studio:
	bunx drizzle-kit studio

