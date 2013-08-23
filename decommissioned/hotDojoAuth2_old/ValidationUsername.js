define([
  'dojo/_base/declare',
  'dijit/form/ValidationTextBox',

  'hotplate/hotDojoWidgets/_AjaxValidatorMixin',
  'hotplate/hotDojoStores/stores',
  ], function(
    declare

  , ValidationTextBox
  , _AjaxValidatorMixin
  , stores
  ){
    var Validators = sharedFunctions.hotCoreCommonValidators;
    return declare('hotplate.hotDojoAuth.ValidationUsername',  [ ValidationTextBox, _AjaxValidatorMixin ], {

      ajaxOkWhen: 'present',
      ajaxInvalidMessage: 'Ajax check failed',

      validator: function(value){

        // Run the normal field validators -- if they fail,
        // return false
        var validation =  Validators.login(value);
        if( ! validation ){
          this.invalidMessage = Validators.login(false);
          return false;
        }

        return this.ajaxValidate(value, {
           ajaxInvalidMessage: this.ajaxInvalidMessage,
           ajaxStore: stores('usersAnon'),
           ajaxFilterField: 'login',
           ajaxOkWhen: this.ajaxOkWhen,
        });

      },

      invalidMessage: Validators.login(false),
      missingMessage: Validators.notEmptyString(false),

    });
  }
);