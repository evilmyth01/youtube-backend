class apiError extends Error {
    constructor(statusCode,message,error=[],stack){
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success=false;
        this.data=null;
        this.error=error;

        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }

    }
}

export default apiError;