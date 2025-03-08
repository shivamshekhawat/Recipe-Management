export async function logRequest(request) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url

  console.log(`[${timestamp}] ${method} ${url}`)

  // You could extend this to log to a database or file
  return { timestamp, method, url }
}

