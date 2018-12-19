
 
 App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  
  init: async () =>{
    // Load candidates.
    $.getJSON('../candidates.json', function(data) {
      let content = $('#content');
      let content1 = $('#content1');
     for (i = 0; i < data.length; i ++) {
      content1.find('.panel-title').text(data[i].name);

      content1.find('.candidate-name').text(data[i].name);
      content1.find('img').attr('src', data[i].picture);
      
      content1.find('.candidate-age').text(data[i].age);
      content1.find('.candidate-post').text(data[i].post);
    
      content1.find('.btn-vote').attr('data-id', data[i].id);

      //myModal.find('.modal-title').text(data[i].name);
      //myModal.find('.cName').text(data[i].name) ;       
     content.append(content1.html());
     
      };
    });
    return await App.initWeb3();   
    
  },
  
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
       App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
       web3 = new Web3(App.web3Provider);
     }
    //  web3 = new Web3(App.web3Provider);
     return App.initContract();

 },

  initContract: ()=> {
    $.getJSON("Election.json", (election) => {
      
      App.contracts.Election = TruffleContract(election);
      
      App.contracts.Election.setProvider(App.web3Provider);
      
     return App.render();
     
    }
    );   
    
    return App.bindEvents();
    
    //return App.render();  
  },

  bindEvents: () => {
    $(document).on('click', '.btn-vote', App.castVote);
  },

  
  render: async () => {
    try{ 
      
      var loader= $("#loader");
      var content = $("#content");    
      //var content1 = $("#content1"); 

      loader.show();
      content.hide();    

      //load account data
      web3.eth.getCoinbase(function(err, account){
        if (err===null){
          App.account = account;
          
          document.querySelector("#accountAddress").textContent= `Your Account: ${account}`;
        }
      });     
      
      //load Contract data
      
      const instance = await App.contracts.Election.deployed();
      console.log(instance);

          

      const candidatesCount = await instance.candidatesCount.call();
      console.log(candidatesCount);
        
        
        let candidatesResults = $("#candidatesResults");
        candidatesResults.empty();
      // console.log(candidatesCount);

        for (let i = 1; i<=candidatesCount; i++){     
                    
          let candidate = await instance.candidates(i);
          console.log(candidate);                  
        
          let id = candidate[0];    
          
          let name = candidate[1];
        
          let voteCount = candidate[2];       
          
            const candidatesResults = document.querySelector('#candidatesResults');
              
            const row = document.createElement('tr');

            row.innerHTML =`
            <td> ${id} </td>
            <td> ${name}</td>
            <td> ${voteCount}</td>
            `;
            
            // "<tr><th>" </th><td> + name + </td><td> + voteCount + </td></tr>`
            candidatesResults.append(row); 
            console.log(row)    
          };
        
        hasVoted = await instance.voters(App.account) ;   
        

      if(hasVoted){
      content.hide();
    }
      loader.hide();
      $('#content1').show();
      throw new Error("oops");}
      catch(err){
        console.log(err)
      }

  }, 
  


  castVote : async(e) => {
    e.preventDefault();
    

    try{    
      let instance = await App.contracts.Election.deployed();
         console.log (instance);
      let voting = await instance.vote(candidateId, {from: account});
      console.log (voting);
        
      let candidateId = parseInt($(event.target).data('id'));

      //disable button during process
      $(this).text('Processing..').attr('disabled', true);
  
      web3.eth.getAccounts((accounts,error) => {
        if(error){
          console.log(error); 
        }
        let account= accounts[0];
        console.log (account);

        // let instance = await App.contracts.Election.deployed();
        // console.log (instance);  
        if (voting){
        alert('Voting Successful!');   }
        else{
          alert('Not Successful')
        }     
          
        document.querySelector('#content').attr('disable', true);
        document.querySelector('#loader').attr('disable', false);
          //$("#content1").hide();
          //$("#loader").show();
          //return App.render();

        })
      }       
        catch(err){
          //enable button again on error
          //$(this).text('vote').removeAttr('disabled');
          console.log(err.message);
       } 
  },
};

$(()=> {
  $(window).load(()=> {
    App.init();
  });
});



         
  //       //load Contract data
  //       const tempFunc = async  (instance) =>{
          
  //         electionInstance = instance;   
  //         candidatesCount=electionInstance.candidatesCount();      
  //         let candidatesResults = $("#candidatesResults");
  //         candidatesResults.empty();
  //        // console.log(candidatesCount);
    
  //         for ( i = 1; i<=candidatesCount; i++){        
             
  //           console.log(i);
  //           electionInstance.candidates(i).then( function (candidate){
  //             console.log(candidate);
          
  //           let id = candidate[0];
            
  //           let name = candidate[1];
  //           let voteCount = candidate[2];
            
  //             const candidatesResults = document.querySelector('#candidatesResults');
                
  //             const row = document.createElement('tr');
    
  //             row.innerHTML =`
  //             <td> ${id} </td>
  //             <td> ${name}</td>
  //             <td> ${voteCount}</td>
  //             `;
              
  //             // "<tr><th>" </th><td> + name + </td><td> + voteCount + </td></tr>`
  //             candidatesResults.append(row); 
  //             console.log(row)  
  //           })   
  //   hasVoted= electionInstance.voters(App.account);
  //   if(hasVoted){
  //     content.hide();
  //   }
  //     loader.hide();
  //     $('#content1').show();
   
  
  // }

        
  //       // electionInstance.candidates(i).then(function(candidate){
          
  //       //   this.id = candidate[0];
  //       //   this. name = candidate[1];
  //       //   this.voteCount = candidate[2];

          
  //       //     const candidatesResults = document.querySelector('#candidatesResults');
             
  //       //     const row = document.createElement('tr');

  //       //     row.innerHTML =`
  //       //     <td> ${candidate.id}</td>
  //       //     <td> ${candidate.name}</td>
  //       //     <td> ${candidate.voteCount}</td>
  //       //     `;
            
  //       //    // "<tr><th>" </th><td> + name + </td><td> + voteCount + </td></tr>`
  //       //     candidatesResults.append(row);
          
          
  //       // });

  //     // },
  //     // function (err){
  //     //   console.log(err);
      

  //   castVote :  (e) => {
       
  //       e.preventDefault();
    
  //       let candidateId = parseInt($(event.target).data('id'));

  //       //disable button during process
  //       $(this).text('Processing..').attr('disabled', true);
    
  //       web3.eth.getAccounts((accounts,error) => {
  //         if(error){
  //           console.log(error); 
  //         }
  //         let account= accounts[0];
    
  //         App.contracts.Election.deployed().then((instance) =>{
            
  //           electionInstance= instance;
            
  //           return electionInstance.vote(candidateId, {from: account});
  //         })
  //         .then( result=> { 
  //           alert('Voting Successful!');        
            
  //           document.querySelector('#content').attr('disable', true)
  //           document.querySelector('#loader').attr('disable', false)
  //           //$("#content1").hide();
  //           //$("#loader").show();
  //           //return App.render();

  //         }).catch( err=>{
  //           //enable button again on error
  //           $(this).text('vote').removeAttr('disabled');
  //           console.log(err.message);
  //        });     
     
  //   }); 
  // },



