
angular.module('validatorsApp').factory('ValidatorsLoader',['$http', function($http) {

  var VALIDATOR_REGISTRY_API = 'https://api.validators.ripple.com';

  function getValidations(callback) {
      $http({
        url: VALIDATOR_REGISTRY_API+"/validations",
        method: "GET"
      }).success(function(data, status, headers, config) {
        callback(null, data.validations)
      }).error(function(data, status, headers, config) {
        callback(new Error(data))
      })
  }

  function getValidators(callback) {
      $http({
        url: VALIDATOR_REGISTRY_API+"/validators",
        method: "GET"
      }).success(function(data, status, headers, config) {
        callback(null, data.validators)
      })
      .error(function(data, status, headers, config) {
        callback(new Error(data))
      })
  }

  function reduceValidators(validators, validations) {
    var reduced = []
    validations.forEach(function(validation) {
      var validator = _.find(validators, function(validator) {
        return validator.validation_public_key === validation.validation_public_key
      })
      if (validator) {
        validation.domain = validator.domain
      }
      reduced.push(validation)
    })
    return reduced
  }

  function sortByValidations(validations) {
    return _.sortBy(validations, function(validation) {
      return validation.validations_count * -1
    })
  }

  return (function() {
    return {
      scan: function(scope) {
        scope.loading = true

        getValidations(function(error, validations) {
          if (error) {
            scope.loading = false
            scope.status = "Error connecting to API at " + VALIDATOR_REGISTRY_API;
          } else {
            getValidators(function(error, validators) {
              scope.loading = false
              if (error) {
                scope.status = "Error connecting to API at " + VALIDATOR_REGISTRY_API;
              } else {
                scope.validators = sortByValidations(reduceValidators(validators, validations))
              } 
            })
          }
        })
      }
    }
  })()
}])
  