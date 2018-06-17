pragma solidity ^0.4.23; 

import "./LacteaToken.sol";

contract Lactea21 is LacteaToken {
    LacteaToken public token;
    bytes32[] public postIds;
    mapping(bytes32 => Post) internal posts;
    Vote[] internal recentVotes;

    event Posting(bytes32 indexed id, address indexed author, string title, string body, uint256 timestamp);
    event Voting(address indexed voter, bytes32 indexed postId, uint votes);

    struct Post {
        bytes32 id;
        address author;
        string title;
        string body;
        uint256 votes;
        uint256 timestamp;
        bool exists;
    }

    struct Vote {
        address voter;
        bytes32 postId;
    }

    constructor () public {
        token = new LacteaToken();
    }

    function getPost(bytes32 postId) public view returns (bytes32 id, address author, string message, uint votes) {
        Post storage post = posts[postId];
        return (post.id, post.author, post.body, post.votes);
    }

    function create(string title, string body, uint256 timestamp) public {
        bytes32 id = keccak256(abi.encodePacked(block.number, msg.sender, body));
        Post storage post = posts[id];
        post.id = id;
        post.author = msg.sender;
        post.title = title;
        post.body = body;
        post.timestamp = timestamp;
        post.exists = true;
        posts[id] = post;

        proofOfPost();

        emit Posting(post.id, post.author, post.title, post.body, post.timestamp);
    }

    function proofOfPost() private {
        uint totalTokens = 0;
        for (uint i = 0; i < recentVotes.length; i++) {
            //반복문 i는 최근추천 길이까지 반복
            Vote memory vote = recentVotes[i];
            Post memory post = posts[vote.postId];
            // 포스트아이디를 가져와서 포스트에 저장
            uint tokens = 10 ** uint(token.decimals());
            //분배할 토큰의 수량을 결정 (정수로)
            totalTokens = totalTokens.add(tokens);
            // 총 토큰에 락테아토큰의 갯수를 더한다.
            token.mint(post.author, tokens);
            // 작성자에게 락테아토큰 갯수만큼 발행한다.
            delete recentVotes[i];
            // 최근보팅배열을 지운다.
        }
        recentVotes.length = 0;
        //최근보팅갯수의 길이를 0으로 초기화한다.
        token.mint(msg.sender, totalTokens.div(2));
        //작성자에게 전체 토큰의 1/2만큼 발행해준다.
    }

    function vote(bytes32 postId) public {
        //보팅함수는 포스트아이디를 받아온다.
        Post storage post = posts[postId];
        // 포스트가 존재하는지 여부를 검사한다.
        require(post.exists);
        // 보팅갯수에 1을 더한다.
        post.votes.add(1);
        // 최근보트를 Vote구조체에 넣는다.
        recentVotes.push(Vote(msg.sender, post.id));
        // 보팅이벤트를 불러온다.
        emit Voting(msg.sender, post.id, post.votes);
    }
}