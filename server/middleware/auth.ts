import process from "node:process"
import { jwtVerify } from "jose"

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const basePath = useRuntimeConfig().app.baseURL || "/"
  const path = url.pathname.startsWith(basePath) && basePath !== "/"
    ? url.pathname.slice(basePath.length - 1) || "/"
    : url.pathname
  if (!path.startsWith("/api")) return
  if (["JWT_SECRET", "G_CLIENT_ID", "G_CLIENT_SECRET"].find(k => !process.env[k])) {
    event.context.disabledLogin = true
    if (["/api/s", "/api/proxy", "/api/latest", "/api/mcp"].every(p => !path.startsWith(p)))
      throw createError({ statusCode: 506, message: "Server not configured, disable login" })
  } else {
    if (["/api/s", "/api/me"].find(p => path.startsWith(p))) {
      const token = getHeader(event, "Authorization")?.replace(/Bearer\s*/, "")?.trim()
      if (token) {
        try {
          const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) as { payload?: { id: string, type: string } }
          if (payload?.id) {
            event.context.user = {
              id: payload.id,
              type: payload.type,
            }
          }
        } catch {
          if (path.startsWith("/api/me"))
            throw createError({ statusCode: 401, message: "JWT verification failed" })
          else logger.warn("JWT verification failed")
        }
      } else if (path.startsWith("/api/me")) {
        throw createError({ statusCode: 401, message: "JWT verification failed" })
      }
    }
  }
})
