PACKAGE_ID := $(shell grep -o "id: '[^']*'" startos/manifest.ts | sed "s/id: '\([^']*\)'/\1/")
INGREDIENTS := $(shell start-cli s9pk list-ingredients)

.PHONY: all clean install check-deps check-init

all: ${PACKAGE_ID}.s9pk
	@echo " Done!"
	@echo " Filesize:$(shell du -h $(PACKAGE_ID).s9pk) is ready"

check-deps:
	@if ! command -v start-cli > /dev/null; then \
		echo "Error: start-cli not found. Please install it first."; \
		exit 1; \
	fi

check-init:
	@if [ ! -f ~/.startos/developer.key.pem ]; then \
		start-cli init; \
	fi

${PACKAGE_ID}.s9pk: $(INGREDIENTS) | check-deps check-init
	start-cli s9pk pack

javascript/index.js: $(shell git ls-files startos) tsconfig.json node_modules package.json
	npm run build
	$(eval INGREDIENTS := $(shell start-cli s9pk list-ingredients))

assets:
	mkdir -p assets

node_modules: package-lock.json
	npm ci

package-lock.json: package.json
	npm i

clean:
	rm -rf ${PACKAGE_ID}.s9pk
	rm -rf javascript
	rm -rf node_modules

install: | check-deps check-init
	@if [ ! -f ~/.startos/config.yaml ]; then echo "You must define \"host: http://server-name.local\" in ~/.startos/config.yaml config file first."; exit 1; fi
	@echo "\nInstalling to $$(grep -v '^#' ~/.startos/config.yaml | cut -d'/' -f3) ...\n"
	@[ -f $(PACKAGE_ID).s9pk ] || ( $(MAKE) && echo "\nInstalling to $$(grep -v '^#' ~/.startos/config.yaml | cut -d'/' -f3) ...\n" )
	@start-cli package install -s $(PACKAGE_ID).s9pk
