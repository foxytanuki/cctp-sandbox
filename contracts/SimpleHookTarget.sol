// Sample hook target contract
contract SimpleHookTarget {
    event HookCalled(address caller, uint256 amount);
    
    // Function that will be called by the hook
    function processTransfer(uint256 amount) external {
        // Do something with the transferred tokens
        emit HookCalled(msg.sender, amount);
    }
}
