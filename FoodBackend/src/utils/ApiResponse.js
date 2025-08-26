class ApiResponse {
    constructor(statusCode, data, message = "Success", notify = false, errors = null, deprecated = false) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = typeof message === 'string' ? message : '';
        this.data = data !== undefined ? data : null;
        this.notify = Boolean(notify);
        // Always include errors key for consistency; null if none
        this.errors = errors || null;
        // Indicate legacy/deprecated endpoints
        this.deprecated = Boolean(deprecated);
    }
}

export { ApiResponse }