
 
 App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  
  init: async () =>{
    // Load candidates.
    $.getJSON('../candidates.json', function(data) {
      let content = $('#content');
      let content2 = $('#content2');
     //var myModal= $('#myModal');

      for (i = 0; i < data.length; i ++) {
        content2.find('.panel-title').text(data[i].name);

        content2.find('.candidate-name').text(data[i].name);
        content2.find('img').attr('src', data[i].picture);
        
        content2.find('.candidate-age').text(data[i].age);
        content2.find('.candidate-post').text(data[i].post);
      
        content2.find('.btn-vote').attr('data-id', data[i].id);

        //myModal.find('.modal-title').text(data[i].name);
        //myModal.find('.cName').text(data[i].name) ;       

       content.append(content2.html());
      }
    });
    return await App.initWeb3();   
    
  },
  
  //initWeb3: function(){
    //window.addEventListener('load', async()=> {
   initWeb3: async ()=> {
     if(window.ethereum){

      App.web3Provider = window.ethereum;
      try{
        await window.ethereum.enable();
      }catch(error){
        console.error ("User denied account access")
      }
     }
     else if (window.web3){
       App.web3Provider = window.web3.currentProvider;
     }
     else{
       App.web3Provider = new Web3.providers.HttpProvider('http://127.0.1:7545');
     }
     web3 = new Web3(App.web3Provider);

 
//    if (typeof web3!= 'undefined'){

//      App.web3Provider = web3.currentProvider;
   
//      web3 = new Web3(web3.currentProvider);
//  } else{
//    App.web3Provider = new Web3.providers.HttpProvider('http://127.0.1:7545');
//    web3 =  new Web3(App.web3Provider);
//   }
//    return App.initContract();
 },

  initContract: ()=> {
    $.getJSON("Election.json", (data) => {
      let ElectionArtifact = data;

      App.contracts.Election = TruffleContract(ElectionArtifact);
      
      App.contracts.Election.setProvider(App.web3Provider);
      
      return App.render();
    });
    
    
    return App.bindEvents();
    //return App.render();  
  },

  bindEvents: () => {
    $(document).on('click', '.btn-vote', App.castVote);
  },

    castVote :  (e) => {
       
        e.preventDefault();
    
        let candidateId = parseInt($(event.target).data('id'));

        //disable button during process
        $(this).text('Processing..').attr('disabled', true);
    
        web3.eth.getAccounts((accounts,error) => {
          if(error){
            console.log(error); 
          }
          let account= accounts[0];
    
          App.contracts.Election.deployed().then((instance) =>{
            
            electionInstance= instance;
            
            return electionInstance.vote(candidateId, {from: account});
          })
          .then( result=> { 
            alert('Voting Successful!');        
            
            document.querySelector('#content').attr('disable', true)
            document.querySelector('#loader').attr('disable', false)
            //$("#content1").hide();
            //$("#loader").show();
            return App.render();

          }).catch((err)=>{
            //enable button again on error
            $(this).text('vote').removeAttr('disabled');
            console.log(err.message);
         });     
     });
    },

  render: (voters, accounts)=> {
    var electionInstance;

    var loader=$("#loader");
    var content = $("#content");    
    var content1 = $("#content1"); 

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
    App.contracts.Election.deployed().then((instance)=>{
      
      electionInstance = instance;

      return electionInstance.candidatesCount.call();      
             
    }).then((candidates)=>{     
      
      let candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      //for (let i < 1; i<=candidatesCount; i++){
        
         
        candidates.forEach((candidate)=> {
        electionInstance.candidates(i).then(function (candidate){
      
        this.id = candidate[0];
        this.name = candidate[1];
        this.voteCount = candidate[2];
        

        
          const candidatesResults = document.querySelector('#candidatesResults');
            
          const row = document.createElement('tr');

          row.innerHTML =`
          <td> ${candidate.id}</td>
          <td> ${candidate.name}</td>
          <td> ${candidate.voteCount}</td>
          `;
          
          // "<tr><th>" </th><td> + name + </td><td> + voteCount + </td></tr>`
          candidatesResults.append(row);
        
        
      });
          
    });
        
        // electionInstance.candidates(i).then(function(candidate){
          
        //   this.id = candidate[0];
        //   this. name = candidate[1];
        //   this.voteCount = candidate[2];

          
        //     const candidatesResults = document.querySelector('#candidatesResults');
             
        //     const row = document.createElement('tr');

        //     row.innerHTML =`
        //     <td> ${candidate.id}</td>
        //     <td> ${candidate.name}</td>
        //     <td> ${candidate.voteCount}</td>
        //     `;
            
        //    // "<tr><th>" </th><td> + name + </td><td> + voteCount + </td></tr>`
        //     candidatesResults.append(row);
          
          
        // });

      },
      function (err){
        console.log(err);
      
      return electionInstance.voters(App.account);
    }).then((Completed)=>{

      if(Completed){
      content.hide();
    }
      loader.hide();
      $('content1').show();
    }).catch(function(error){
      console.warn(error);
    });
  },
 };


$(function() {
  $(window).load(function() {
    App.init();
  });
});
