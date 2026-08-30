# nepalfloodtracker.com — one entry point for every routine task.
# Read README.md first; each target maps to a numbered step in a folder README.

PY := pipeline/.venv/bin/python
SHELL := /bin/bash

.PHONY: help setup db db-seed db-test pull process pipeline pipeline-test web-dev web-build web-test web-e2e deploy health report test all

help:            ## list targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[1m%-16s\033[0m %s\n", $$1, $$2}'

setup:           ## create the python venv and install pipeline deps; install web deps
	python3 -m venv pipeline/.venv && $(PY) -m pip install --quiet --upgrade pip && $(PY) -m pip install --quiet -r pipeline/requirements.txt
	cd web && npm install

db:              ## apply db/migrations then db/seed to the Supabase project (idempotent)
	$(PY) db/apply.py

db-seed:         ## regenerate and apply seeds only (sources.yaml → sources.sql, places.csv → places.sql)
	$(PY) db/seed/gen_sources.py && $(PY) gazetteer/to_sql.py && $(PY) db/apply.py --only seed

db-test:         ## live RLS + view tests against the project
	$(PY) -m pytest db/tests -q --timeout=60

pull:            ## pull_external_data once (all due sources)
	cd pipeline && ./.venv/bin/python pull_external_data.py

process:         ## process public sources once (family intake stays archive-only; steps ⓪–⑩)
	cd pipeline && ./.venv/bin/python process_data.py

pipeline:        ## pull then process (what cron runs)
	cd pipeline && ./run.sh

pipeline-test:   ## pipeline unit tests (offline, fixture-backed)
	$(PY) -m pytest pipeline/tests -q

web-dev:         ## next dev on :3000
	cd web && npm run dev

web-build:       ## production build (must pass with and without .env.local)
	cd web && npm run build

web-test:        ## vitest + i18n key parity
	cd web && npm test

web-e2e:         ## playwright smoke
	cd web && npm run e2e

deploy:          ## build + vercel --prod (site code only; data flows via the DB)
	cd web && vercel --prod --yes

schedule:        ## run the pipeline every 4 h in this terminal (Ctrl-C to stop); HOURS=0.5 for 30 min
	cd pipeline && .venv/bin/python scheduler.py --hours $(or $(HOURS),4)

health:          ## 60-second health check of the live system
	$(PY) scripts/health.py

report:          ## morning trends report → docs/reports/<date>-morning.md (run after the day's first pipeline tick)
	$(PY) scripts/morning_report.py

test: db-test pipeline-test web-test  ## everything except e2e

all: db pipeline web-build  ## apply schema, run the pipeline once, build the site
