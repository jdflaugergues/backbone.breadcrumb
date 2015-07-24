/**
 * @fileOverview Backbone (Backbone.BreadCrump)
 * This plugin extend the History & Router object of Backbone for allow to store the navigation breadcrump.
 * This also allow to handle the back functionnality usefull on mobile application for don't go back on
 * child route.
 * Distributed under MIT license
 *
 * @version 1.0
 * @author Jonathan de Flaugergue
 */

(function() {

    // Breadcrump of the Backbone History
    Backbone.History.breadcrumb = [];

    // Arborescence of the fragment of the route
    Backbone.History.fragmentsArborescence  = {};

    // Backup the original Backbone.Router
    var OrigRouter = Backbone.Router;


    // Override the Backbone.Router constructor
    Backbone.Router = function( attributes, options ) {
        this.initBreadCrumb();

        OrigRouter.apply( this, arguments );
    };

    // Re-apply static properties to the new Backbone.Router constructor
    for( var staticProp in OrigRouter ) {
        if( OrigRouter.hasOwnProperty( staticProp ) ) {
            Backbone.Router[ staticProp ] = OrigRouter[ staticProp ];
        }
    }

    // Fix prototype
    Backbone.Router.prototype = OrigRouter.prototype;

    // Now apply new prototype methods to Backbone.Router
    _.extend( Backbone.Router.prototype, {

        // home page
        homeRoute : 'home',

        // put a listener on the route for supply the breadcrump of the Backbone.History
        initBreadCrumb : function() {
            this.on('route', function (name, args) {

                var breadcrumb = Backbone.History.breadcrumb,
                    currentFragment = Backbone.history.fragment;

                // add the fragment if access to this fragment not from back action
                if ((breadcrumb.length == 0)||(currentFragment != breadcrumb[breadcrumb.length-1].fragment)){

                    var fragmentName = (currentFragment.indexOf('?') != -1) ? currentFragment.match(/.+?(?=\?)/)[0] : currentFragment;
                    breadcrumb.push({fragment :currentFragment, name : fragmentName});
                }
            });
        },

        // Specific treatment on the home page.
        // Override it with your own initialization logic.
        behaviorHomePage : function(){},


        // Redirection on the right route applying the businness rule of the fragment arborescence.
        back: function () {

            // Specific treatment on the home page or if there is no longer fragment
            if( (Backbone.history.fragment == 'undefined') || ( Backbone.history.fragment != 'undefined' && ( Backbone.history.fragment == '' || Backbone.history.fragment == this.home) )) {
                this.behaviorHomePage();
            } else {

                var currentFragment = Backbone.History.breadcrumb[Backbone.History.breadcrumb.length-1]; // The fragment to redirect
                Backbone.History.breadcrumb.pop(); // Remove from breadcrumb the current fragment

                // if exist a rule for this fragment
                if (Backbone.History.fragmentsArborescence[currentFragment.name]){

                    // remove from breadCrumb the child of current fragment
                    Backbone.History.breadcrumb = _.filter(Backbone.History.breadcrumb, function(fragment){
                        return (Backbone.History.fragmentsArborescence[currentFragment.name].indexOf(fragment.name) == -1);
                    });

                    if (Backbone.history.fragment == Backbone.History.breadcrumb[Backbone.History.breadcrumb.length-1].fragment){

                        Backbone.History.breadcrumb = _.reject(Backbone.History.breadcrumb,function(fragment){
                                return fragment.fragment == Backbone.history.fragment
                        });
                    }
                }
                Backbone.history.navigate(Backbone.History.breadcrumb[Backbone.History.breadcrumb.length-1].fragment,true);
            }
        }
    } );

}).call(this);
