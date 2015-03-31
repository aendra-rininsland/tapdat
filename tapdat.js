'use strict';

var Votes = new Mongo.Collection('votes');

var parties = [
  {name: 'David Cameron', party: 'Conservative', abbr: 'Con', color: '#022397', photo: 'tory_square.jpg'},
  {name: 'Ed Miliband', party: 'Labour', abbr: 'Lab', color: '#ED1B24', photo: 'labour_square.jpg'},
  {name: 'Nick Clegg', party: 'Liberal Democrats', abbr: 'LD', color: '#FDBB30', photo: 'libdem_square.jpg'},
  {name: 'Nigel Farage', party: 'Ukip', abbr: 'Ukip', color: '#722889', photo: 'ukip_square.jpg'},
  {name: 'Natalie Bennett', party: 'Green', abbr: 'Grn', color: '#6AB023', photo: 'green_square.jpg'},
  {name: 'Nicola Sturgeon', party: 'SNP', abbr: 'SNP', color: '#6AB023', photo: 'snp_square.jpg'},
  {name: 'Leanne Wood', party: 'Plaid Cymru', abbr: 'PC', color: '#6AB023', photo: 'plaid_square.jpg'}
];

if (Meteor.isClient) {
  Session.setDefault('isFaces', true);
  Meteor.subscribe('onlineUsers');
  Meteor.subscribe('recentVotes', function(){
    var ts = new Date();
    var a = Votes.find({'timestamp': {$gt: ts - 500, $lt: ts + 500} });
  });

  Template.body.helpers({
    questionnaireComplete: function(){
      return typeof Meteor.user().profile.questionnaireComplete !== 'undefined' ? Meteor.user().profile.questionnaireComplete : false;
    }
  });

  Template.questionnaire.helpers({
    parties: function() {
      return parties;
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

  Template.usersData.helpers({
    totalCurrentUsers: function(){
      return Meteor.users.find({ 'status.online': true }).count();
    },
    onlineUsers: function() {
      return onlineUsers;
    }
  });

  Template.tabs.events({
    'click .participate': function(event) {
      Session.set('isFaces', true);
      $('.participate').addClass('active');
      $('.watch').removeClass('active');

      return false;
    },
    'click .watch': function(event) {
      Session.set('isFaces', false);
      $('.participate').removeClass('active');
      $('.watch').addClass('active');

      return false;
    }
  });

  Template.body.helpers({
    isFaces: function() {
      return Session.get('isFaces');
    }
  });


  Template.faceGrid.gestures({
    'swipe .card': function(e, tem) {
      e.preventDefault();
      if (this.abbr) {
        console.log('-1 ' + this.abbr);
        Meteor.call('addVote', {
          party: this.abbr,
          direction: -1
        });
      }
    }
  });

  Template.faceGrid.events({
    'click .card': function(e, tem) {
      e.preventDefault();
      if (this.abbr) {
        console.log('+1 ' + this.abbr);
        Meteor.call('addVote', {
          party: this.abbr,
          direction: +1
        });
      }
    }
  });

  Template.faceGrid.helpers({
    candidates: function() {
      return parties;
    }
  });

  Template.worm.rendered = function () {

    // var entries = Votes.find({timestamp: {$lt: Date.now()}});
    //
    // var cols = [];
    //
    // parties.forEach(function(v){
    //   var col = [
    //     v
    //   ];
    //   col.push(Votes.find({timestamp: {$lt: Date.now()}, party: v}).count());
    //   cols.push([v]);
    //   console.dir(col);
    //   Session.set(v, col);
    // });
    //
    // console.dir(cols);
  };

  Template.worm.helpers({
    allTheVotes: function() {
      return Votes.find({}).count();
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //
  });

  Meteor.methods({
    submitQuestionnaire: function(values) {
      // Make sure the user is logged in before inserting a task
      if (! Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }

      Meteor.users.update(this.userId, { $set:
        {
          'profile.lastElection': values.lastElection,
          'profile.thisElection': values.thisElection,
          'profile.postcode': values.postcode,
          'profile.questionnaireComplete': true
        }
      });
    },

    addVote: function(args) {
      Votes.insert({
        party: args.party,
        value: args.direction,
        timestamp: Date.now()
      });
    }
  });

  Meteor.publish('onlineUsers', function() {
    return Meteor.users.find({'status.online': true});
  });

  Meteor.publish('recentVotes', function(ts) {
    return Votes.find({'timestamp': {$gt: ts - 500, $lt: ts + 500} });
  });

  Meteor.publish('allTheVotes', function() {
    return Votes.find();
  });
}
