import { Route } from '@src/types/commands/addRoute'

/**
 * Update or create routes
 * @param routes Routes contained in the routes.js file
 * @param router_name Router to be updated or created
 * @param responses Responses to create the config for the new router
 * @returns The routes.js content updated
 */
function updateRoutes(
  routes: Route[],
  router_name: string,
  responses: any
): Route[] {
  let update
  responses.router = router_name
  const new_routes = routes.map((route) => {
    if (route.router == router_name) {
      update = true
      route = responses
    }
    return route
  })
  if (!update) {
    new_routes.push(responses)
  }
  return new_routes
}
export default updateRoutes
