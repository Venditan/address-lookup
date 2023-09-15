[![npm version](https://badge.fury.io/js/%40venditan%2Faddress-lookup.svg)](https://badge.fury.io/js/%40venditan%2Faddress-lookup)

# Venditan Address Lookup

Google Places API solution for handling address/postcode lookup

## Features ##

This package has the following features:

* Lookup addresses using Google Places API
* Complete partial postcodes using the postcodes.io API
* Logging lookup with VC for billing

## How does it work? ##

Venditan Address Lookup jQuery plugin was written so it will do a lot of the heavy lifting for you.

```javascript
$('#autocomplete').addressLookup();
```

Note: it is important to ensure the element it is called against is an input element or Google Places API will throw an error in your console.

The snippet above is enough to get the address lookup working, but you will want to view ``jquery.address-lookup.js`` as it provides optional settings that we do override:

```javascript
$('#autocomplete').addressLookup({
    callback: function() {},
    excludeTerms: [],
    fields: [],
    logLookup: true,
    logURL: '/log_address_lookup',
    postLog: function() {},
    logData: {},
    logPostVariable: 'postcode',
    restrictions: {},
    types: []
});
```

The full list of hooks are:

* `callback` - allows you to call a function to populate the place detail returned
* `postLog` - if you wish to do something once we have logged the lookup with VC

The following settings are also available:

* `excludeTerms` - array of address line contents to cleanse from the address
* `fields` - sets the fields for the API to return with the Places Detail request [API Reference](https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.setFields) and [Fields](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult)
* `logLookup` - set whether to log the lookup with VC or not
* `logURL` - set the URL to post to so that VC can log the lookup request
* `logPostVariable` - set the parameter name to use in the post request when logging the usage
* `logData` - set additional parameters, that you would like to pass to `logURL`
* `restrictions` - sets the restrictions for the API results, for example, limit to a country [API Reference](https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.setComponentRestrictions) and [Restrictions](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#ComponentRestrictions)
* `types` - sets the type of data to return, by default it will return residential and businesses [API Reference](https://developers.google.com/maps/documentation/javascript/reference/places-widget#Autocomplete.setTypes) and [Types](https://developers.google.com/places/supported_types#table3)

### How to get and use the Place Detail object ###

Within your callback function you will want to access the Place Detail object so you can populate your form with the address information.

To do this you need to simply do the following:

```javascript
var obj_place = $('#autocomplete').addressLookup('get', 'place');
```

This will allow you to access the fields you requested in the following manner:

* ```obj_place.address_components``` - the address line object
    * This is the full address, broken down into an array of lines
* ```obj_place.types``` - the type(s) of the address returned based on the request performed, such as `establishment`, `street_address`, `postal_code`, etc.
    * You can use this to determine the type of address returned - such as choosing to show the Business name if it is an `establishment` or adding a house number/name field if it was a `postal_code` request. 
* ```obj_place.name``` - the name of the address returned
    * Recommended that this is only used if the type of address returned is an `establishment`.
