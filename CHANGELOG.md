# Changelog

## v2.10.1 - Check Updates - `07/03/2022`

* Cli now display if a newer version of the cli exists
* Loader now runs in a different process to not block it while executing synchronous operations

## v2.10.0 - Prompts Files Generated - `07/01/2022`

* Added Feedback for created files
* Changed Prompt Colors
* Refactor file structure and toolbox

## v2.9.0 - Refactor - `06/08/2022`

* Refactor addRoute addon functions
* Cli now prompts all questions before generating files

## v2.8.2 - Fixes and Refactor - `06/07/2022`

* Refactor frontend services httpheaders
* Fixed buildForProd command file generation (module.exports to export default)
* Fixed swagm command packages imports

## v2.8.1 - Fixes - `06/06/2022`

* Remove .git folder while creating new project

## v2.8.0 - Tests - `06/05/2022`

* Added test generation in the frontend for the addRoute Command
* Fixed "express routeur" to "express Router"

## v2.7.4 - Fixes - `06/03/2022`

* Fixed the addRoute template import syntax

## v2.7.3 - Fixes - `06/03/2022`

* Fixed esm imports

## v2.7.2 - Fixes - `06/03/2022`

* Convert .mjs files to .js

## v2.7.1 - Fixes - `06/03/2022`

* Fixed Migrations and Models Generation for ESM

## v2.7.0 - Update kli-cli to go with ESM template - `05/31/2022`

* Update kli-cli to go with ESM template
* Update dependencies

## v2.6.1 - Fixes - `05/26/2022`

* Fix String Interpolation

## v2.6.0 - Added String Interpolation - `05/26/2022`

* Added String Interpolation in Frontend Services

## v2.5.0 - Version sync + update swagger templates - `03/15/2022`

* Sync the kli-cli version number with ngx-template
* Update swagger templates
