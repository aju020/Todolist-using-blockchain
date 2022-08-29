pragma solidity ^0.5.0;

contract TodoList{
    uint public taskCount=0;

    struct Task{
        uint id;
        string content;
        bool completed; //for checkbox
    }

    mapping (uint => Task) public tasks;//acts as db
    
    event TaskCreated(
        uint id,
        string content,
        bool completed
    );

    event TaskCompleted(
        uint id,
        bool completed
    );
    constructor() public{
        createTask("check out dappuniversity.com");//default to do task
    }

    function createTask(string memory _content) public{
        taskCount++; //adding tasks to db
        tasks[taskCount]=Task(taskCount, _content,false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id]; //_ means local var not state
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }
     
}