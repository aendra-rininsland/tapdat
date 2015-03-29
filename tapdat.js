if (Meteor.isClient) {
  Session.setDefault('isFaces', true);

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

  Template.usersData.helpers({
    totalCurrentUsers: function(){
      return Meteor.users.find({ 'status.online': true }).count();
    },
    // onlineUsers: function() {
    //   return Meteor.users.find({ 'status.online': true }, {
    //       fields: {
    //         'profile.lastElection': 1,
    //         'profile.thisElection': 1
    //       }
    //   });
    // }
  });

  Template.tabs.events({
    'click .participate': function(event) {
      Session.set('isFaces', true);
      return false;
    },
    'click .watch': function(event) {
      Session.set('isFaces', false);
      return false;
    }
  });

  Template.body.helpers({
    isFaces: function() {
      return Session.get('isFaces');
    }
  });

  Template.faceGrid.rendered = function () {
    var orientation = 'portrait';
    var heart = {
    	'labour': 0,
    	'tory': 0,
    	'libdem': 0,
    	'ukip': 0,
    	'green': 0,
    	'snp': 0,
    	'plaid': 0
    };
    var hate = {
    	'labour': 0,
    	'tory': 0,
    	'libdem': 0,
    	'ukip': 0,
    	'green': 0,
    	'snp': 0,
    	'plaid': 0
    };
    var score = {
    	'labour': 0,
    	'tory': 0,
    	'libdem': 0,
    	'ukip': 0,
    	'green': 0,
    	'snp': 0,
    	'plaid': 0
    };
    var faceScore = {
    	'labour': 0,
    	'tory': 0,
    	'libdem': 0,
    	'ukip': 0,
    	'green': 0,
    	'snp': 0,
    	'plaid': 0
    };

    adjust();

    $(window).on('resize', function() {
      adjust();
    });

    calcScore();
    setInterval(function() {faceDrop();}, 15000);

    $.each(score, function(i, object) {
      score[i] = heart[i]-hate[i];
    });

    //get face according to score
    $.each($('.face'), function(i, object) {
      var party = $(object).attr('class').replace('face ','');
      if(party != 'worm') {
        var index = faceScore[party];
        var image = 'url(assets/'+party+index+'.jpg)';
        $(object).css('background-image', image);
      } else {
        $(object).css('background-image', 'url(assets/worm.jpg)');
      }
    });


    $('.face-box').on('click', function() {
      if($(this).find('div').hasClass('worm')) {
        //go to graph
      } else {
        var party = $(this).find('div').attr('class').replace('face ','');
        heart[party]++;
        if(faceScore[party] > -2 && faceScore[party] < 2) {
          faceScore[party]++;
        }
        $(this).append('<div class="heart"></div>')
        setTimeout(function() {
          $('.heart').fadeOut(400, function() {
            $(this).remove();
          });
        }, 300);
        calcScore();
      }
    });

    function adjust() {
    	if(window.matchMedia("(orientation: landscape)").matches) {
    		$('.face-box').css({
    			'width': $(window).width()/4,
    			'height': $(window).height()/2
    		});
    	} else {
    		$('.face-box').css({
    			'width': $(window).width()/2,
    			'height': $(window).height()/4
    		});
    	}
    }

    function calcScore() {
    	var scoreArray = [];
    	var max;
    	var min;
    	$.each(score, function(i, object) {
    		score[i] = heart[i]-hate[i];
    	});
    	//get face according to score
    	$.each($('.face'), function(i, object) {
    		var party = $(object).attr('class').replace('face ','');
    		if(party != 'worm') {
    			var index = faceScore[party];
    			var image = 'url(assets/'+party+index+'.jpg)';
    			$(object).css('background-image', image);
    		} else {
    			$(object).css('background-image', 'url(assets/worm.jpg)');
    		};
    	});
    }

    function faceDrop() {
    	$.each($('.face'), function(i, object) {
    		var party = $(object).attr('class').replace('face ','');
    		if(faceScore[party] < 0 && faceScore[party] >= -2) {
    			faceScore[party]++;
    		};
    		if(faceScore[party] > 0 && faceScore[party] <= 2) {
    			faceScore[party]--;
    		};
    		calcScore();
    	});
    }

  };

  // Template.worm.rendered = function () {
  //  this.node = this.find('#the-worm');
  // //  var graph = new Rickshaw.Graph( {
  // //   element: document.querySelector("#the-worm"),
  // //   width: 300,
  // //   height: 200,
  // //   series: [{
  // //     color: 'steelblue',
  // //     data: [
  // //            { x: 0, y: 40 },
  // //            { x: 1, y: 49 },
  // //            { x: 2, y: 38 },
  // //            { x: 3, y: 30 },
  // //            { x: 4, y: 32 }
  // //        ]
  // //    }]
  // //  });
  //  //
  // //  graph.render();
  //
  // // var
  //  this.autorun(function (tracker) {
  //    graph.update();
  //  });
  // };

  Meteor.subscribe('onlineUsers');
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

  Meteor.publish('onlineUsers', function() {
    return Meteor.users.find({ 'status.online': true, 'profile.questionnaireComplete': true }, {
      fields: {
        'profile.lastElection': 1,
        'profile.thisElection': 1
      }
    });
  });
}
