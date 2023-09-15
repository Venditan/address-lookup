/**
 * Venditan Address Lookup Plugin
 *
 * @author Michael Simcoe <michael@venditan.com>
 * @copyright Venditan &copy; 2019
 *
 * @param {jQuery} $
 */
(function($) {
    /**
     * Venditan Address Lookup function
     *
     * @param options
     * @returns {*}
     */
    var methods = {
        init : function(options) {
            var plugin = this,
                settings = $.extend({
                    autocomplete: {},
                    callback: function() {},
                    excludeTerms: [],
                    fields: [ 'place_id', 'name', 'address_component', 'types', 'geometry', 'vicinity' ],
                    logLookup: true,
                    logURL: '/log_address_lookup',
                    postLog: function() {},
                    logData: {},
                    logPostVariable: 'postcode',
                    restrictions: {},
                    types: []
                }, options);

            // Initialises the autocomplete api
            settings.autocomplete = new google.maps.places.Autocomplete(plugin[0], { types: settings.types });

            // Sets the fields for the API to return with the Places Detail request
            settings.autocomplete.setFields(settings.fields);

            // Sets the restrictions for the API results, for example, limit to a country
            settings.autocomplete.setComponentRestrictions(settings.restrictions);

            // Sets the listener for when a place is selected from the results by the user
            settings.autocomplete.addListener('place_changed', function () { methods.process(plugin); });

            plugin.data('settings', settings);

            // On focus this will attempt to get the users location, it means the results are local to the user
            plugin.on('focus', function() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var geolocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            },
                            circle = new google.maps.Circle({center: geolocation, radius: position.coords.accuracy});

                        plugin.data('settings').autocomplete.setBounds(circle.getBounds());
                    });
                }
            });
        },
        process : function(plugin) {
            var settings = plugin.data('settings'),
                obj_place = settings.autocomplete.getPlace();

            if ("undefined" !== typeof obj_place) {
                // We check the postcode to see if we have a partial or a full one
                if ("undefined" !== typeof obj_place.address_components) {
                    var obj_post_code = obj_place.address_components[obj_place.address_components.length - 1];
                    if (obj_place.types.includes("postal_code")) {
                        obj_post_code = obj_place.address_components[0];
                        obj_place.address_components.push(obj_place.address_components.shift());
                    }
                }

                // Obtains the vicinity data which is more accurate for establishments
                var arr_vicinity = [];
                if ("undefined" !== typeof obj_place.types) {
                    if (obj_place.types.includes("establishment")) {
                        arr_vicinity = obj_place.vicinity.split(", ");
                        var arr_data = [];
                        if (obj_place.address_components.length > 3) {
                            // The address is quite featured so we replace the necessary fields
                            for (var i = 0; i < 4; i++) {
                                obj_place.address_components[i] = {
                                    long_name: arr_vicinity[i],
                                    short_name: arr_vicinity[i]
                                };
                            }
                        } else {
                            // Very little information in the results so we add more to it instead
                            for (var i = 0; i < 4; i++) {
                                arr_data.push({
                                    long_name: arr_vicinity[i],
                                    short_name: arr_vicinity[i]
                                });
                            }
                            arr_data.reverse();
                            for (var x in arr_data) {
                                obj_place.address_components.unshift(arr_data[x]);
                            }
                        }
                    }
                }

                // If we have a partial postcode then we need to use the lat/long to obtain the full postcode
                if ("undefined" !== typeof obj_post_code && obj_post_code.long_name.length < 6) {
                    $.ajax({
                        url: '//api.postcodes.io/postcodes',
                        method: 'get',
                        dataType: 'json',
                        data:{
                            'lon': obj_place.geometry.location.lng(),
                            'lat': obj_place.geometry.location.lat(),
                            'limit': 1
                        }
                    }).done(function(data) {
                        if (data.status === 200) {
                            if (data.result) {
                                // Updates the partial postcode in the results to the full postcode
                                obj_place.address_components[obj_place.address_components.length - 1] = {
                                    long_name: data.result[0].postcode,
                                    short_name: data.result[0].postcode
                                };
                            }
                            if (typeof settings.callback === 'function') {
                                methods.do_callback(plugin, obj_place);
                            }
                        }
                    });
                } else {
                    if (typeof settings.callback === 'function') {
                        methods.do_callback(plugin, obj_place);
                    }
                }
            }
        },
        do_callback : function(plugin, place) {
            // Ensures the place is set and the address is cleansed of excluded terms, then calls the callback function
            plugin.data('settings').place = place;
            methods.cleanse(plugin);
            if (plugin.data('settings').logLookup) {
                methods.do_log(plugin, place);
            }
            return plugin.data('settings').callback.call(this);
        },
        do_log : function(plugin, place) {
            var obj_data = plugin.data('settings').logData || {};
            if ("undefined" !== typeof place.address_components) {
                obj_data[plugin.data('settings').logPostVariable] = place.address_components[place.address_components.length - 1].short_name;

                // Initiate log request to VC to report successful lookup
                $.ajax({
                    type: 'POST',
                    url: plugin.data('settings').logURL,
                    data: obj_data,
                    async: true
                }).done(plugin.data('settings').postLog);
            }
        },
        cleanse : function(plugin) {
            var settings = plugin.data('settings'),
                obj_address = settings.place.address_components,
                arr_exclude_terms = settings.excludeTerms;

            for (var x in obj_address) {
                if (arr_exclude_terms.includes(obj_address[x].long_name) || arr_exclude_terms.includes(obj_address[x].short_name) || "" === obj_address[x].long_name) {
                    obj_address.splice(x, 1);
                    methods.cleanse(plugin);
                }
            }

            return obj_address;
        },
        get : function(key) {
            return this.data('settings')[key];
        },
        set : function(key, value) {
            var settings = this.data('settings');
            settings[key] = value;
        }
    };

    $.fn.addressLookup = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.addressLookup');
        }
    };
}(jQuery));
