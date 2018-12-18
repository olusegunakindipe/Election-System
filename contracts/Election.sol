pragma solidity ^0.4.2;

contract Election {
    

     function Election () public {     
        addCandidate("candidate 1");
        addCandidate("candidate 2");
        //auctionEnd = now + (durationMins + 1 minutes);

    }

    Candidate[] public candidates;
    mapping(address => bool) public voters;

    uint public candidatesCount;
    uint public auctionEnd;
    //uint durationMins= 60;    
   
    
    struct Candidate {
            uint id;
            string name;
            uint voteCount;
    }
    
    struct Voter {
        bool authorized;
        bool voted;
        uint vote;
    }

    
    function addCandidate (string _name) private {
        candidatesCount++;
        candidates.push(Candidate(candidatesCount, _name, 0));
    }
    

    function vote (uint _candidateId) public {
        require(!voters[msg.sender]); //require that the voter has not voted
        //require (!voters[msg.sender]).authorized; //require that the voter has not been authorized

        require(_candidateId > 0 && _candidateId <= candidatesCount);

        voters[msg.sender] = true;

        candidates[_candidateId].voteCount++;




    }
}