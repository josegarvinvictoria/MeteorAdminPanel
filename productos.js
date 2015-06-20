Productos = new Meteor.Collection("productos");
//Productos = new Mongo.Collection("productos");
Productos.initEasySearch('name');

AdminConfig = {
  name: 'Tha Fucking Restaurant',
  roles: ['admin'],
  adminEmails: [' josegarvinvictoria@gmail.com'],
  collections:
  {
    Productos: {}
  }
}

Schemas = {};



Schemas.Productos = new SimpleSchema({
  name: {
    type: String,
    max: 60
  },
  content: {
    type: String,
    autoform: {
      rows: 5
    }
  },
  createdAt: {
    type: Date,
    label: 'Date',
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      if (this.isSet) {
        return Meteor.userId();
      }
    }

  }
});

Productos.attachSchema(Schemas.Productos)


if (Meteor.isClient) {

  Meteor.subscribe("productos");

  Template.body.events({
    "submit .new-product": function (event) {
      // This function is called when the new task form is submitted
      var text = event.target.text.value;

      Meteor.call("addProducto", text);

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });

  Template.body.helpers({
    productos: function() {
      return Productos.find({});
    }
  });
/*
  Template.producto.events({
    "click .delete": function () {
      Meteor.call("deleteProducto", this._id);
    }
  });*/

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.startup(function() {
  var user;
  if (Meteor.isServer) {
    user = Meteor.users.findOne();
    Meteor.users.upsert({
      _id: user._id
    }, {
      $set: {
        roles: ['admin']
      }
    });
    return console.log("make 1st user admin", user.roles);
  }
});

if (Meteor.isServer) {
  Meteor.startup(function() {
    Meteor.publish("productos", function () {
      return Productos.find();
    });
    console.log('SERVER');
    Roles.addUsersToRoles(Meteor.userId, 'admin', Roles.GLOBAL_GROUP);
  });

}


Meteor.methods({
  addProducto: function (name) {
    /* Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var user = "";

    if(Meteor.user().username === undefined){
      console.log('Usuari no encontrado');
      user = Meteor.user().profile.name;
    }else{
      user = Meteor.user().username;
    }*/

    Productos.insert({
      name: name,
      createdAt: new Date()/*,
      owner: Meteor.userId(),
      username: user*/
    });
  },
  deleteProducto: function (productoId) {
    Productos.remove(productoId);
  }
});
