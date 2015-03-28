if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.body.helpers({
    questionnaireComplete: function(){
      return typeof Meteor.user().profile.questionnaireComplete !== 'undefined' ? Meteor.user().profile.questionnaireComplete : false;
    }
  });

  Template.questionnaire.helpers({
    parties: function() {
      return [
        {name: 'Conservative', abbr: 'Con', color: '#022397'},
        {name: 'Labour', abbr: 'Con', color: '#ED1B24'},
        {name: 'Liberal Democrats', abbr: 'Con', color: '#FDBB30'},
        {name: 'Ukip', abbr: 'Con', color: '#722889'},
        {name: 'Green', abbr: 'Con', color: '#6AB023'},
        {name: 'SNP', abbr: 'Con', color: '#6AB023'}
      ];
    }
  });

  Template.questionnaire.events({
    'submit .new-user-questionnaire': function (event) {
      Meteor.call('submitQuestionnaire', {
        lastElection: event.target.lastElection.value,
        thisElection: event.target.thisElection.value,
        postcode: event.target.postcode.value
      });

      return false;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.methods({
    submitQuestionnaire: function(values) {
      // Make sure the user is logged in before inserting a task
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Meteor.users.update(this.userId, { $set:
        {
          'profile.lastElection': values.lastElection,
          'profile.thisElection': values.thisElection,
          'profile.postcode': values.postcode,
          'profile.questionnaireComplete': true
        }
      });
    }
  });
}
