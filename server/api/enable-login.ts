import process from "node:process"

export default defineEventHandler(async (event) => {
  if (event.context.disabledLogin) {
    return { enable: false }
  }
  return {
    enable: true,
    url: `https://github.com/login/oauth/authorize?client_id=${process.env.G_CLIENT_ID}`,
  }
})
