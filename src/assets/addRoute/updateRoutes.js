// Update or create routes

function updateRoutes(routes,router_name,responses){
    let update;
    responses.router = router_name
    const new_routes = routes.map(route => {
        if(route.router == router_name ){
            update = true;
            route = responses
        }
        return route;
    })
    if(!update){
        new_routes.push(responses)
    } 
    return {new_routes,update}
}
module.exports = updateRoutes