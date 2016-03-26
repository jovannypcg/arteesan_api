function NotValidParametersInRequestError(message) {
    this.name = 'NotValidParametersInRequestError';
    this.message = message || 'Not Valid ParametersIn Request';
}

function PageNotFoundError(message) {
    this.name = 'PageNotFoundError';
    this.message = message || 'Page Not Found Error';
}

function ObjectNotFoundError(message) {
    this.name = 'ObjectNotFoundError';
    this.message = message || 'Object not found';
}

function NoParamsFoundError(message) {
    this.name = 'NoParamsFoundError';
    this.message = message || 'No params were found in the request';
}

function UserAlreadyRegisteredError(message) {
    this.name = 'UserAlreadyRegisteredError';
    this.message = message || 'The entered user is already registered';
}

function UnauthorizedError(message) {
    this.name = 'UnauthorizedError';
    this.message = message || 'Could not authenticate';
}

NotValidParametersInRequestError.prototype = Error.prototype;
ObjectNotFoundError.prototype = Error.prototype;
NoParamsFoundError.prototype = Error.prototype;
PageNotFoundError.prototype = Error.prototype;
UserAlreadyRegisteredError.prototype = Error.prototype;
UnauthorizedError.prototype = Error.prototype;

NotValidParametersInRequestError.prototype.constructor = NotValidParametersInRequestError;
ObjectNotFoundError.prototype.constructor = ObjectNotFoundError;
NoParamsFoundError.prototype.constructor = NoParamsFoundError;
PageNotFoundError.prototype.constructor = PageNotFoundError;
UserAlreadyRegisteredError.prototype.constructor = UserAlreadyRegisteredError;
UnauthorizedError.prototype.constructor = UnauthorizedError;

/**
 * Should be thrown when a request has no expected parameters.
 */
exports.NotValidParametersInRequestError = NotValidParametersInRequestError;

/**
 * Should be thrown when a search is not success.
 */
exports.ObjectNotFoundError = ObjectNotFoundError;

/**
 * Should be thrown when a request has no parameters.
 */
exports.NoParamsFoundError = NoParamsFoundError;

/**
 * Should be thrown when a requested page is not found.
 */
exports.PageNotFoundError = PageNotFoundError;

/**
 * Should be thrown when making a request to a not valid index.
 */
exports.UserAlreadyRegisteredError = UserAlreadyRegisteredError;

/**
 * Should be thrown when an authentication fails.
 */
exports.UnauthorizedError = UnauthorizedError;
