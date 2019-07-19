export interface MockedRequest {
    method: string |"GET"|"POST"|"PUT"|"DELETE"|"WS"
    url?: string
    response?: any
    status?: number
    delay?: number
    contentType?: string
    message?: string
    headers?: object | null
}
