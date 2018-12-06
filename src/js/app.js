App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load candidates.
    $.getJSON('../candidates.json', function(data) {
      var content1 = $('#content1');
      var candidateTemplate = $('#candidateTemplate');

      for (i = 0; i < data.length; i ++) {
        candidateTemplate.find('.panel-title').text(data[i].name);
        candidateTemplate.find('img').attr('src', data[i].picture);
        
        candidateTemplate.find('.candidate-age').text(data[i].age);
        candidateTemplate.find('.candidate-post').text(data[i].post);
      
        candidateTemplate.find('.btn-vote').attr('data-id', data[i].id);

        content1.append(candidateTemplate.html());
      }
    });

    
  },

  window:addEventListener('load', async()=> {
    /*if (typeof web3!= 'undefined'){

      App.web3Provider = web3.currentProvider;
    
      web3 = new Web3(web3.currentProvider);
  } else{
    App.web3Provider = new Web3.providers.HttpProvider('http"//localhost:7545');
    web3 =  new Web3(App.web3Provider);}
    return App.initContract*/

    if (window.ethereum){
      window.web3 = new Web3(ethereum);
      try{
        //Request account access
        await window.ethereum.enable();
        //Accounts now exposed
        web3.eth.sendTransaction({/*...*/});
         }
        catch (error){
          //User denied account access...
          console.error("User denied account access")
        }
    }
    //Legacy dapp browsers...
    else if (window.web3){
      window.web3 = new Web3(web3.currentProvider);
      //Accounts always exposed
      web3.eth.sendTransaction({/*...*/});
    }
    //Non-dapp browsers...
    else{
      console.log('Non-Ethereum browser detected. You should consider trying Metamask')
    }

  }),
  /*
    //if no injected web3 instance is detected, fall back to Ganache
    else{
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new web3(App.web3Provider);
    return App.initContract();
  },*/

  initContract: function() {
    $.getJSON("Election.json", function(election){
      App.contracts.Election = TruffleContract(election);
      
      App.contracts.Adoption.setProvider(App.web3Provider);
    
    
    //App.listenForEvents();
    return App.render();
    
  });
  return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-vote', App.castVote);
  },

  render: function(voters, account) {
    var voterInstance;

    var loader=$("#loader");
    var content = $("#content1");
    var table =  $(".table")

    loader.show();
    content.hide();
    

    //load account data
    web3.eth.getCoinbase(function(err, account){
      if (err===null){
        App.account = account;
        $("#accountAddress").html("Your Account: " +account);
      }
    });

    //load Contract data
    App.contracts.Election.deployed().then(function(instance){
      electionInstance = instance;

      return electionInstance.candidatesCount.call();
    }).then(function(candidatesCount){

      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      for (i< 0; i<=candidatesCount; i++){
        electionInstance.candidatesCount(i).then(function(candidate){
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          if ((voteCount % 5)==0){
            var candidateTemplate ="<tr><th>" + id +"</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            candidatesResults.append(candidateTemplate);
          }
        });

      }
      return electionInstance.voters(App.account);
    }).then(function(Completed){

      if(Completed){
      table.show();
    }
      loader.hide();
      content.show();
    }).catch(function(error){
      console.warn(error);
    });
  },
  


  castVote: function(event) {
    event.preventDefault();

    var candidateId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function(error,accounts){
      if(error){
        console.log(error);
      }
      var account= accounts[0];

      App.contracts.Election.deployed().then(function(instance){
        electionInstance= instance;
        
        return electionInstance.vote(candidateId, {from: account});
      }).then(function(result){
        return App.render();
      }).catch(function(err){
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
