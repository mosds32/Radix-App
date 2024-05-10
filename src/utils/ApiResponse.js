class ApiResponse {
    constructor(
        statusCode,
        message = "Success",
        userData = null
    ){
        this.statusCode = statusCode;
        this.message = message;
        if (userData !== null) {
            for (const [key, value] of Object.entries(userData)) {
                this[key] = value;
            }
        }
        this.success = statusCode < 400;
    }
}


export { ApiResponse };
