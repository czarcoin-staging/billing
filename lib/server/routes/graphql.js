'use strict';

const middleware = require('storj-service-middleware');
const Router = require('./index');
// const errors = require('../errors');
const inherits = require('util').inherits;
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');
const authenticate = middleware.authenticate;
const schemaFactory = require('../graphql');

/**
 * GraphQLRouter
 * @param options {Object}:
 *  + config {Config}
 *  + storage {Storage}
 *  + network {storj.RenterInterface}
 *  + mailer {Mailer}
 * @return {GraphQLRouter}
 * @constructor
 */
function GraphQLRouter(options) {
  if (!(this instanceof GraphQLRouter)) {
    return new GraphQLRouter(options);
  }
  const storage = options.storage;

  Router.apply(this, arguments);

  this.schema = schemaFactory.bindSchema(storage.models);
  this.graphqlHTTPMiddleware = graphqlHTTP({
    schema: this.schema
  }, options);
  this._verify = authenticate(this.storage);
}

/**
 * Set up defaults and schema
 */
inherits(GraphQLRouter, Router);

GraphQLRouter.prototype.processRequest = function(req, res, next) {
  this.schema.middleware(req, res, (err) => {
    if (err) {
      throw err;
    }

    this.graphqlHTTPMiddleware(req, res, next);
  });
};


GraphQLRouter.DEFAULTS = {
  skip: 0,
  limit: 30
};

GraphQLRouter.prototype._definitions = function() {
  return [
    ['POST', '/graphql', this._verify, this.processRequest]
  ];
};

module.exports = GraphQLRouter;
