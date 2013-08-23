define([
  "dojo/_base/declare",
  "dojo/on",
  "dojo/when",
  "dojo/_base/lang",
  "dojo/_base/json",
  "dojo/aspect",
  "dojo/query",

  "dijit/layout/StackContainer",
  "dijit/layout/ContentPane",
  "dijit/form/Form",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/Button",
  "dijit/form/ValidationTextBox",
  "dijit/registry",
  "dijit/Tooltip",
  "dijit/Dialog",

  "hotplate/hotDojoSubmit/defaultSubmit",
  "hotplate/hotDojoStores/stores",
  "hotplate/hotDojoLogger/logger",
  "dojo/text!hotplate/hotDojoAuth/templates/RegisterForm.html",

  "hotplate/hotDojoAuth/ValidationUsername",
  "hotplate/hotDojoAuth/ValidationPassword",
  "hotplate/hotDojoAuth/ValidationEmail",
  "hotplate/hotDojoAuth/ValidationWorkspace",
  "hotplate/hotDojoAuth/LoginForm",

  "hotplate/hotDojoWidgets/AlertBar",
  "hotplate/hotDojoWidgets/StackFading",
  "hotplate/hotDojoWidgets/TabFading",
  "hotplate/hotDojoWidgets/BusyButton",

  "hotplate/hotDojoWidgetHooks/_TemplatedHooksMixin",

   ], function(
     declare
     , on
     , when
     , lang
     , json
     , aspect
     , query

     , StackContainer
     , ContentPane
     , Form
     , _WidgetBase
     , _TemplatedMixin
     , _WidgetsInTemplateMixin
     , Button
     , ValidationTextBox
     , registry
     , Tooltip
     , Dialog

     , ds
     , stores
     , Logger
     , templateString

     , ValidationUsername
     , ValidationPassword
     , ValidationWorkspace
     , ValidationEmail
     , LoginForm

     , AlertBar
     , StackFading
     , TabFading
     , BusyButton
     , _TemplatedHooksMixin

 ){
    // Create the "login" pane, based on a normal ContentPane
    return declare('hotplate/hotDojoAuth/RegisterForm', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _TemplatedHooksMixin ], {


      widgetsInTemplate: true,

      templateString: templateString,
      
      _loginAndSwap: function(){
        this.loginDialog.show();
        this.loginForm.tabContainer.resize(); 
      },

      _logoutAndSwap: function(){
       var that = this;

        // Runs the logout and select the right tab (the one with the new registration form)
        when( stores('logoutUser').noCache.get('')).then(
          ds.UIMsg( that.buttonAsUser, null ),
          ds.UIErrorMsg( that.formAsUser, that.buttonAsUser, null, true )
        ).then(
          function(res){
            that.container.selectChild( that.registerAsAnon );
          }
        );
      },

      postCreate: function(){
        var that = this;

        this.inherited( arguments );

        // Select the right container for the job, depending of whether the
        // user is already logged in or not
        // FIXME: Check if you can use this.login, since the IF already happens there
        this.container.selectChild( 
          ( vars.hotDojoAuth.loggedIn )
            ? this.registerAsUser 
            : this.registerAsAnon 
        );
            
        // Setting password2 so that it must match password1. I cannot do this within the
        // template as I cannot think of a way to write it in the definition
        // this.password1.mustMatch = this.password0; // FIXME: Uncomment

        this.loginForm.onLogin = function( res, formValues ){
          that.loginDialog.hide();
          that.container.selectChild( that.registerAsUser );

          // After logging in, delete the password value and
          // set the focus to it. So, if the user re-logins, she will have
          // the username ready
          that.loginForm.password.setValue('');
          that.loginForm.password.focus()

          // The loginName in the register form 
          that.loginName.innerHTML = formValues['login'];
        }

        // Initially, the login name will be the same as the one when the page was loaded. This
        // will change if the login dialog is used
        this.loginName.innerHTML = vars.hotDojoAuth.login;

        // Submit form
        // -- As ANONYMOUS
        //
        this.formAsAnon.onSubmit = ds.defaultSubmit(this.formAsAnon, this.buttonAsAnon, function(){

          // Store the data 
          // var data = that.formAsAnon.getValues();
          var data = that.formAsAnon.get('value');
          console.log(data);

          // Try saving it...
          stores('workspacesAnon').noCache.put(data).then(
            ds.UIMsg( that.buttonAsAnon, that.alertBarAsAnon , "Workspace created!" ),
            ds.UIErrorMsg( that.formAsAnon, that.buttonAsAnon, that.alertBarAsAnon, true )
          ).then(
            // This is the only spot where things _actually_ went OK... So the callback will get called
            function(res){

              // Log the event, go to the workspace straight away!
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              window.location = vars.hotplate.afterLoginPage + res.workspaceId;

            }
          ); // stores('workspacesAnon').put(data).then
          
        }); // this.formAsAnon.onSubmit



        // Submit form
        // -- As LOGGED IN USER
        //
        this.formAsUser.onSubmit = ds.defaultSubmit(this.formAsUser, this.buttonAsUser, function(){
          var data = that.formAsUser.getValues();

          stores('workspacesUser').noCache.put(data).then(
            ds.UIMsg( that.buttonAsUser, that.alertBarAsUser , "Workspace created!"),
            ds.UIMsg( that.formAsUser, that.buttonAsUser, that.alertBarAsUser, true )
          ).then(
            function(res){

              // Log the event, go to the workspace straight away!
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              window.location = vars.hotplate.afterLoginPage + res.workspaceId;

            },
             function(err){
               if( err.status == 401 ){
                 Logger("User is no longer logged in, redirecting to normal register form");
                 that.container.selectChild( that.registerAsAnon );
               }
             }
          );

 
        });


      }, // postCreate


   });

});
