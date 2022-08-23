import { Command } from '@src/types/command'
import { ProjectUse } from '@src/types/project'
import { ChildProcess, spawn, spawnSync } from 'node:child_process'

const command: Command = {
  name: 'start',
  scope: 'in',
  sigint: true,
  description: 'Run the backend and the frontend',
  run: async (toolbox) => {
    const { def_content, backend_path, frontend_path } =
      toolbox.project as ProjectUse

    const projects: { back: ChildProcess | null; front: ChildProcess | null } =
      {
        back: null,
        front: null,
      }
    if (def_content.projects.hasOwnProperty('backend_path')) {
      projects.back = spawn(`npm start`, {
        shell: true,
        stdio: 'inherit',
        cwd: backend_path,
        detached: true,
      })
    }
    if (def_content.projects.hasOwnProperty('frontend_path')) {
      projects.front = spawn(`npm start`, {
        shell: true,
        stdio: 'inherit',
        cwd: frontend_path,
        detached: true,
      })
    }
    process.on('SIGINT', async () => {
      for (let project in projects) {
        const proj = projects[project as keyof typeof projects]
        if (proj) {
          if (process.platform === 'win32') {
            spawnSync('taskkill', ['/pid', `${proj.pid}`, '/f', '/t'])
          } else {
            proj.kill()
          }
        }
      }
    })
  },
}

export default command
