# Command Reference for kc

TODO: Add your command reference here

help
new -f -b --front --back <nom_projet>
addRoute <nom_router>
installDependecies : IF installed overwrite ?
initDB
buildForProd : follow gitbook instructions
implements sequelize commands :
 - npx sequelize-cli seed:generate
 - npx sequelize-cli migration:generate
removeRouter (maybe)
update (maybe not)
generateFrontDoc : 
"build:doc": "npx compodoc -p src/tsconfig.compodoc.json -n Template-Frontend",
    
serveFrontDoc :
"serve:doc": "npx compodoc -p src/tsconfig.compodoc.json -n Template-Frontend -s"

kc test
kc start